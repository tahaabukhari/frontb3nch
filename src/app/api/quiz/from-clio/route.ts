import { NextResponse } from 'next/server';
import { SchemaType, type Schema } from '@google/generative-ai';
import { z } from 'zod';
import { getGeminiModel } from '@/lib/ai';
import type { Question } from '@/lib/questions';

export const runtime = 'nodejs';

const requestSchema = z.object({
    content: z.string().min(1, 'CLIO file content is required'),
    chapterId: z.string().min(1),
    chapterName: z.string().min(1),
    subjectName: z.string().min(1),
    gradeName: z.string().min(1),
    questionCount: z.number().min(5).max(50).optional().default(15),
});

const quizSchema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
        questions: {
            type: SchemaType.ARRAY,
            minItems: 5,
            description: 'Quiz questions generated from the provided content',
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    question: { type: SchemaType.STRING, description: 'The question text' },
                    answer: { type: SchemaType.STRING, description: 'The correct answer' },
                    distractors: {
                        type: SchemaType.ARRAY,
                        items: { type: SchemaType.STRING },
                        description: '3 incorrect but plausible answer options',
                    },
                    difficulty: {
                        type: SchemaType.STRING,
                        enum: ['medium', 'hard'],
                        format: 'enum',
                    },
                    explanation: { type: SchemaType.STRING, description: 'Brief explanation of why the answer is correct' },
                },
                required: ['question', 'answer', 'distractors', 'difficulty'],
            },
        },
        chapterSummary: { type: SchemaType.STRING, description: 'Brief summary of the chapter content' },
        keyTopics: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: 'Main topics covered in this chapter',
        },
    },
    required: ['questions', 'chapterSummary', 'keyTopics'],
};

const buildQuestion = (
    item: { question: string; answer: string; distractors: string[]; difficulty: string; explanation?: string },
    idx: number,
    chapterId: string
): Question | null => {
    if (!item?.question || !item?.answer) return null;

    const uniqueOptions = Array.from(new Set([item.answer, ...(item.distractors ?? [])])).filter(Boolean);
    if (uniqueOptions.length < 2) return null;

    // Shuffle options
    const shuffled = uniqueOptions
        .map((option) => ({ option, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ option }) => option);

    return {
        id: `${chapterId}-q${idx}`,
        category: 'custom',
        difficulty: item.difficulty === 'hard' ? 'hard' : 'medium',
        q: item.question,
        correct: item.answer,
        options: shuffled,
    };
};

export async function POST(request: Request) {
    try {
        const json = await request.json();
        const parsed = requestSchema.safeParse(json);

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid payload', issues: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { content, chapterId, chapterName, subjectName, gradeName, questionCount } = parsed.data;

        // Validate content length
        if (content.length > 100000) {
            return NextResponse.json({ error: 'Content exceeds 100KB limit' }, { status: 413 });
        }

        if (content.length < 100) {
            return NextResponse.json({ error: 'Content is too short to generate meaningful questions' }, { status: 400 });
        }

        // Build prompt for Gemini
        const instructions = [
            'You are ParhaiPlay, an educational quiz builder for Pakistani students.',
            `Generate ${questionCount} multiple-choice questions from the following chapter content.`,
            `Subject: ${subjectName}`,
            `Grade: ${gradeName}`,
            `Chapter: ${chapterName}`,
            '',
            'Guidelines:',
            '- Questions should test understanding, not just memorization',
            '- Include a mix of conceptual and numerical questions (if applicable)',
            '- Each question should have exactly 4 options (1 correct, 3 distractors)',
            '- Distractors should be plausible but clearly incorrect',
            '- Questions should be under 200 characters',
            '- Use medium difficulty for standard questions, hard for advanced concepts',
            '- Keep questions aligned with Punjab Board education standards',
        ].join('\n');

        let model;
        try {
            model = getGeminiModel('gemini-2.5-flash', {
                generationConfig: {
                    responseMimeType: 'application/json',
                    responseSchema: quizSchema,
                    temperature: 0.4,
                },
            });
        } catch (modelError) {
            const msg = modelError instanceof Error ? modelError.message : 'Failed to initialize AI model';
            console.error('Gemini model init error', modelError);
            return NextResponse.json({ error: 'Failed to initialize AI model', detail: msg }, { status: 500 });
        }

        let result;
        try {
            const promptText = `${instructions}\n\n---\n\nChapter Content:\n${content}`;
            result = await model.generateContent(promptText);
        } catch (genError) {
            const msg = genError instanceof Error ? genError.message : 'Failed to generate content';
            console.error('Gemini generateContent error', genError);
            return NextResponse.json({ error: 'Failed to generate quiz', detail: msg }, { status: 502 });
        }

        const rawText = result.response.text();
        if (!rawText) {
            return NextResponse.json({ error: 'AI returned an empty response' }, { status: 502 });
        }

        let aiPayload;
        try {
            aiPayload = JSON.parse(rawText);
        } catch (parseError) {
            console.error('JSON parse error', parseError, 'Raw response:', rawText);
            return NextResponse.json({ error: 'Failed to parse AI response', detail: 'Invalid JSON' }, { status: 502 });
        }

        const questionSet = (Array.isArray(aiPayload?.questions) ? aiPayload.questions : [])
            .map((item: any, idx: number) => buildQuestion(item, idx, chapterId))
            .filter(Boolean) as Question[];

        if (!questionSet.length) {
            return NextResponse.json({ error: 'AI could not produce any valid questions' }, { status: 502 });
        }

        return NextResponse.json({
            success: true,
            questions: questionSet,
            chapterSummary: aiPayload.chapterSummary || '',
            keyTopics: aiPayload.keyTopics || [],
            generatedAt: Date.now(),
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to process CLIO file';
        console.error('from-clio error', error);
        return NextResponse.json({ error: 'Failed to process CLIO file', detail: message }, { status: 500 });
    }
}

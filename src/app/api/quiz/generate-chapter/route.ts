import { NextResponse } from 'next/server';
import { SchemaType, type Schema } from '@google/generative-ai';
import { z } from 'zod';
import { getGeminiModel } from '@/lib/ai';
import type { Question } from '@/lib/questions';
import { chapterSLOs } from '@/lib/curriculum/data/punjab-board';
import { getChapterById, getSubjectById, getGradeById } from '@/lib/curriculum';

export const runtime = 'nodejs';

const requestSchema = z.object({
    chapterId: z.string().min(1),
    questionCount: z.number().min(5).max(20).optional().default(10),
});

const quizSchema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
        questions: {
            type: SchemaType.ARRAY,
            minItems: 5,
            description: 'Quiz questions generated from the chapter learning outcomes',
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    question: { type: SchemaType.STRING, description: 'The question text, under 200 characters' },
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
                },
                required: ['question', 'answer', 'distractors', 'difficulty'],
            },
        },
    },
    required: ['questions'],
};

const buildQuestion = (
    item: { question: string; answer: string; distractors: string[]; difficulty: string },
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
        id: `${chapterId}-gen-${idx}-${Date.now()}`,
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

        const { chapterId, questionCount } = parsed.data;

        // Get chapter details
        const chapter = getChapterById(chapterId);
        if (!chapter) {
            return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
        }

        // Get SLOs for this chapter
        const slos = chapterSLOs[chapterId];
        if (!slos || slos.length === 0) {
            return NextResponse.json({ error: 'No learning outcomes found for this chapter' }, { status: 404 });
        }

        // Get subject and grade info
        const subject = getSubjectById(chapter.subjectId);
        const grade = subject ? getGradeById(subject.gradeId) : null;

        const subjectName = subject?.name || 'Physics';
        const gradeName = grade?.name || '9th Grade';

        // Build prompt for Gemini
        const slosList = slos.map((slo, idx) => `${idx + 1}. ${slo}`).join('\n');

        const instructions = [
            'You are ParhaiPlay, an educational quiz builder for Pakistani students studying under Punjab Board.',
            `Generate exactly ${questionCount} multiple-choice questions based on the following Student Learning Outcomes (SLOs).`,
            '',
            `Subject: ${subjectName}`,
            `Grade: ${gradeName}`,
            `Chapter: ${chapter.name}`,
            '',
            'Learning Outcomes to test:',
            slosList,
            '',
            'Guidelines:',
            '- Create questions that directly test these learning outcomes',
            '- Include a mix of conceptual, application, and numerical questions where applicable',
            '- Each question must have exactly 4 options (1 correct answer + 3 distractors)',
            '- Distractors should be plausible but clearly incorrect',
            '- Questions should be clear and under 200 characters',
            '- Use Urdu context where appropriate (Pakistani cities, currency PKR, etc.)',
            '- Balance between medium and hard difficulty',
        ].join('\n');

        let model;
        try {
            model = getGeminiModel('gemini-2.5-flash-preview', {
                generationConfig: {
                    responseMimeType: 'application/json',
                    responseSchema: quizSchema,
                    temperature: 0.6,
                },
            });
        } catch (modelError) {
            const msg = modelError instanceof Error ? modelError.message : 'Failed to initialize AI model';
            console.error('Gemini model init error', modelError);
            return NextResponse.json({ error: 'Failed to initialize AI model', detail: msg }, { status: 500 });
        }

        let result;
        try {
            result = await model.generateContent(instructions);
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
            chapter: {
                id: chapter.id,
                name: chapter.name,
            },
            generatedAt: Date.now(),
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to generate chapter quiz';
        console.error('generate-chapter error', error);
        return NextResponse.json({ error: 'Failed to generate quiz', detail: message }, { status: 500 });
    }
}

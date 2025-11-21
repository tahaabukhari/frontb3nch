import { NextResponse } from 'next/server';
import { SchemaType, type Schema } from '@google/generative-ai';
import { z } from 'zod';
import { getGeminiModel } from '@/lib/ai';
import { chunkForPrompt, dataUrlToBuffer, sanitizePdfText } from '@/lib/pdf';
import type { Question } from '@/lib/questions';
import { parsePdfWithLlama } from '@/lib/llamaparse';

export const runtime = 'nodejs';

type PdfParseFn = (dataBuffer: Buffer) => Promise<{ text: string }>;

type PdfParseModule = {
  default?: PdfParseFn;
  PDFParse?: new (options: { data: Buffer }) => { getText: () => Promise<{ text: string }> };
};

let cachedPdfParseFn: PdfParseFn | null = null;
const loadPdfParse = async (): Promise<PdfParseFn> => {
  if (cachedPdfParseFn) return cachedPdfParseFn;
  const mod = (await import('pdf-parse')) as PdfParseModule | PdfParseFn;
  if (typeof mod === 'function') {
    cachedPdfParseFn = mod as PdfParseFn;
    return cachedPdfParseFn;
  }
  if (typeof (mod as PdfParseModule)?.default === 'function') {
    cachedPdfParseFn = (mod as PdfParseModule).default as PdfParseFn;
    return cachedPdfParseFn;
  }
  if (typeof (mod as PdfParseModule)?.PDFParse === 'function') {
    cachedPdfParseFn = async (dataBuffer: Buffer) => {
      const ParserCtor = (mod as PdfParseModule).PDFParse!;
      const parser = new ParserCtor({ data: dataBuffer });
      const payload = await parser.getText();
      return typeof payload === 'string' ? { text: payload } : payload;
    };
    return cachedPdfParseFn;
  }
  throw new Error('pdf-parse module did not expose a parser entry point');
};

const requestSchema = z.object({
  dataUrl: z.string().min(1),
  name: z.string().min(1),
  size: z.number().optional(),
});

const analysisSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    summary: { type: SchemaType.STRING, description: 'One paragraph summary of the PDF content' },
    highlights: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: '3-5 punchy bullet points with key facts',
    },
    sections: {
      type: SchemaType.ARRAY,
      description: 'Up to 4 sections describing the PDF structure',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          insight: { type: SchemaType.STRING },
          difficulty: { type: SchemaType.STRING, enum: ['easy', 'medium', 'hard'], format: 'enum' },
        },
        required: ['title', 'insight', 'difficulty'],
      },
    },
    recommendations: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: 'Actionable study prompts derived from the PDF',
    },
    teaching_notes: {
      type: SchemaType.STRING,
      description: 'Free-form notes that can be used later for AI reviews',
    },
    quiz: {
      type: SchemaType.OBJECT,
      properties: {
        questions: {
          type: SchemaType.ARRAY,
          minItems: 8,
          description: 'Quiz items derived from the PDF',
          items: {
            type: SchemaType.OBJECT,
            properties: {
              question: { type: SchemaType.STRING },
              answer: { type: SchemaType.STRING },
              distractors: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
              difficulty: { type: SchemaType.STRING, enum: ['medium', 'hard'], format: 'enum' },
            },
            required: ['question', 'answer', 'distractors', 'difficulty'],
          },
        },
      },
      required: ['questions'],
    },
  },
  required: ['summary', 'highlights', 'sections', 'recommendations', 'teaching_notes', 'quiz'],
};

const buildQuestion = (item: { question: string; answer: string; distractors: string[]; difficulty: string }, idx: number): Question | null => {
  if (!item?.question || !item?.answer) return null;
  const uniqueOptions = Array.from(new Set([item.answer, ...(item.distractors ?? [])])).filter(Boolean);
  if (uniqueOptions.length < 2) return null;
  const shuffled = uniqueOptions
    .map((option) => ({ option, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ option }) => option);
  return {
    id: `upload-${idx}`,
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
      return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.flatten() }, { status: 400 });
    }
    const { dataUrl, name } = parsed.data;
    const buffer = dataUrlToBuffer(dataUrl);
    if (buffer.length > 15 * 1024 * 1024) {
      return NextResponse.json({ error: 'File exceeds 15MB limit' }, { status: 413 });
    }
    let cleaned = '';
    try {
      const llamaText = await parsePdfWithLlama(buffer, name);
      cleaned = sanitizePdfText(llamaText);
    } catch (llamaError) {
      console.warn('llamaparse primary parse failed, falling back to pdf-parse', llamaError);
      const pdfParse = await loadPdfParse();
      const pdfData = await pdfParse(buffer);
      cleaned = sanitizePdfText(pdfData.text);
    }
    if (!cleaned) {
      return NextResponse.json({ error: 'Unable to read text from PDF' }, { status: 422 });
    }

    const sections = chunkForPrompt(cleaned).slice(0, 6);
    const instructions = [
      'You are ParhaiPlay, a study quiz builder.',
      'Analyze the supplied PDF content and craft a JSON response that matches the provided schema.',
      'Questions should stay faithful to the facts, be concise (<260 chars), and include novel distractors.',
      'Focus on medium/hard difficulty for college-level learners.',
    ].join(' ');
    const promptPayload = {
      role: 'ParhaiPlay quiz builder',
      directives: instructions,
      source: {
        name,
        chunkCount: sections.length,
        sections: sections.map((chunk, idx) => ({
          id: idx + 1,
          text: chunk,
        })),
      },
    };

    const model = getGeminiModel('gemini-1.5-flash', {
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
        temperature: 0.5,
      },
    });

    const result = await model.generateContent(JSON.stringify(promptPayload));

    const rawText = result.response.text();
    if (!rawText) {
      return NextResponse.json({ error: 'Gemini returned an empty response' }, { status: 502 });
    }
    const aiPayload = JSON.parse(rawText);
    const questionSet = (Array.isArray(aiPayload?.quiz?.questions) ? aiPayload.quiz.questions : [])
      .map(buildQuestion)
      .filter(Boolean) as Question[];

    if (!questionSet.length) {
      return NextResponse.json({ error: 'AI could not produce any questions' }, { status: 502 });
    }

    return NextResponse.json({
      analysis: {
        summary: aiPayload.summary,
        highlights: aiPayload.highlights ?? [],
        sections: aiPayload.sections ?? [],
        recommendations: aiPayload.recommendations ?? [],
        context: aiPayload.teaching_notes ?? sections.join('\n'),
        sourceName: name,
        questionSet,
        generatedAt: Date.now(),
      },
    });
  } catch (error) {
    console.error('from-pdf error', error);
    return NextResponse.json({ error: 'Failed to analyze PDF' }, { status: 500 });
  }
}


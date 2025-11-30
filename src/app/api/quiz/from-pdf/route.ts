import { NextResponse } from 'next/server';
import { SchemaType, type Schema } from '@google/generative-ai';
import { z } from 'zod';
import { getGeminiKey } from '@/lib/ai';
import { dataUrlToBuffer } from '@/lib/pdf';
import type { Question } from '@/lib/questions';

export const runtime = 'nodejs';

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

// Helper to send SSE message
function sendSSE(controller: ReadableStreamDefaultController, data: { stage: string; progress: number; message: string }) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  controller.enqueue(new TextEncoder().encode(message));
}

export async function POST(request: Request) {
  // Check if client wants SSE
  const acceptHeader = request.headers.get('accept') || '';
  const wantsSSE = acceptHeader.includes('text/event-stream');

  if (wantsSSE) {
    // Return SSE stream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log('[API SSE] Starting PDF processing stream');
          const json = await request.json();
          const parsed = requestSchema.safeParse(json);

          if (!parsed.success) {
            sendSSE(controller, { stage: 'error', progress: 0, message: 'Invalid request payload' });
            controller.close();
            return;
          }

          const { dataUrl, name } = parsed.data;

          sendSSE(controller, { stage: 'uploading', progress: 10, message: `Preparing ${name}...` });

          const buffer = dataUrlToBuffer(dataUrl);
          console.log('[API SSE] PDF loaded:', name, 'Size:', (buffer.length / 1024 / 1024).toFixed(2), 'MB');

          if (buffer.length > 15 * 1024 * 1024) {
            sendSSE(controller, { stage: 'error', progress: 0, message: 'File exceeds 15MB limit' });
            controller.close();
            return;
          }

          sendSSE(controller, { stage: 'parsing', progress: 25, message: 'Uploading to Gemini Files API...' });

          // Upload to Gemini Files API
          let fileUri = '';
          try {
            const { GoogleAIFileManager } = await import('@google/generative-ai/server');
            const fileManager = new GoogleAIFileManager(getGeminiKey());
            const { writeFile, unlink } = await import('fs/promises');
            const { join } = await import('path');
            const { tmpdir } = await import('os');

            const tempPath = join(tmpdir(), `upload-${Date.now()}-${name}`);
            await writeFile(tempPath, buffer);

            sendSSE(controller, { stage: 'parsing', progress: 35, message: 'Parsing PDF content...' });

            const uploadResult = await fileManager.uploadFile(tempPath, {
              mimeType: 'application/pdf',
              displayName: name,
            });

            fileUri = uploadResult.file.uri;
            console.log('[API SSE] Upload successful. URI:', fileUri);
            await unlink(tempPath);

          } catch (uploadError) {
            console.error('[API SSE] Upload failed:', uploadError);
            sendSSE(controller, {
              stage: 'error',
              progress: 0,
              message: uploadError instanceof Error ? uploadError.message : 'Failed to upload PDF'
            });
            controller.close();
            return;
          }

          sendSSE(controller, { stage: 'analyzing', progress: 50, message: 'Analyzing content with AI...' });

          // Initialize Gemini
          let model;
          try {
            const { GoogleGenerativeAI } = await import('@google/generative-ai');
            const genAI = new GoogleGenerativeAI(getGeminiKey());
            model = genAI.getGenerativeModel({
              model: 'gemini-2.5-flash',
              generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: analysisSchema,
                temperature: 0.5,
              },
            });
          } catch (modelError) {
            sendSSE(controller, {
              stage: 'error',
              progress: 0,
              message: modelError instanceof Error ? modelError.message : 'Failed to initialize AI model'
            });
            controller.close();
            return;
          }

          sendSSE(controller, { stage: 'generating', progress: 70, message: 'Generating quiz questions...' });

          const instructions = [
            'You are parhaiGoat, a study quiz builder.',
            'Analyze the supplied PDF content and craft a JSON response that matches the provided schema.',
            'Questions should stay faithful to the facts, be concise (<260 chars), and include novel distractors.',
            'Focus on medium/hard difficulty for college-level learners.',
            'Extract key concepts from the PDF and create 8-12 challenging questions.',
          ].join(' ');

          let result;
          try {
            result = await model.generateContent([
              {
                fileData: {
                  mimeType: 'application/pdf',
                  fileUri: fileUri,
                },
              },
              { text: instructions },
            ]);
          } catch (genError) {
            sendSSE(controller, {
              stage: 'error',
              progress: 0,
              message: genError instanceof Error ? genError.message : 'Failed to generate quiz'
            });
            controller.close();
            return;
          }

          sendSSE(controller, { stage: 'generating', progress: 90, message: 'Finalizing questions...' });

          const rawText = result.response.text();
          if (!rawText) {
            sendSSE(controller, { stage: 'error', progress: 0, message: 'AI returned empty response' });
            controller.close();
            return;
          }

          let aiPayload;
          try {
            aiPayload = JSON.parse(rawText);
          } catch (parseError) {
            sendSSE(controller, { stage: 'error', progress: 0, message: 'Failed to parse AI response' });
            controller.close();
            return;
          }

          const questionSet = (Array.isArray(aiPayload?.quiz?.questions) ? aiPayload.quiz.questions : [])
            .map(buildQuestion)
            .filter(Boolean) as Question[];

          if (!questionSet.length) {
            sendSSE(controller, { stage: 'error', progress: 0, message: 'No questions generated' });
            controller.close();
            return;
          }

          const sections = aiPayload.sections?.map((s: any) => s.insight || s.title).filter(Boolean) || [];

          sendSSE(controller, {
            stage: 'complete',
            progress: 100,
            message: `Created ${questionSet.length} questions!`
          });

          // Send final result
          const finalData = {
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
          };

          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ stage: 'result', data: finalData })}\n\n`));
          controller.close();

        } catch (error) {
          console.error('[API SSE] Error:', error);
          sendSSE(controller, {
            stage: 'error',
            progress: 0,
            message: error instanceof Error ? error.message : 'Unknown error'
          });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }

  // Fallback to original non-streaming endpoint
  try {
    console.log('[API] Received PDF quiz generation request');
    const json = await request.json();
    const parsed = requestSchema.safeParse(json);
    if (!parsed.success) {
      console.error('[API] Invalid payload:', parsed.error);
      return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.flatten() }, { status: 400 });
    }
    const { dataUrl, name } = parsed.data;
    const buffer = dataUrlToBuffer(dataUrl);
    console.log('[API] PDF loaded:', name, 'Size:', (buffer.length / 1024 / 1024).toFixed(2), 'MB');

    if (buffer.length > 15 * 1024 * 1024) {
      return NextResponse.json({ error: 'File exceeds 15MB limit' }, { status: 413 });
    }

    let fileUri = '';

    try {
      console.log('[Gemini Files] Uploading PDF to Gemini Files API...');
      const { GoogleAIFileManager } = await import('@google/generative-ai/server');

      const fileManager = new GoogleAIFileManager(getGeminiKey());

      const { writeFile, unlink } = await import('fs/promises');
      const { join } = await import('path');
      const { tmpdir } = await import('os');

      const tempPath = join(tmpdir(), `upload-${Date.now()}-${name}`);
      await writeFile(tempPath, buffer);

      console.log('[Gemini Files] Uploading file:', tempPath);
      const uploadResult = await fileManager.uploadFile(tempPath, {
        mimeType: 'application/pdf',
        displayName: name,
      });

      fileUri = uploadResult.file.uri;
      console.log('[Gemini Files] Upload successful. URI:', fileUri);

      await unlink(tempPath);

    } catch (uploadError) {
      console.error('[Gemini Files] Upload failed:', uploadError);
      const errorMsg = uploadError instanceof Error ? uploadError.message : 'Failed to upload PDF';
      return NextResponse.json(
        {
          error: 'Failed to process PDF file',
          detail: errorMsg,
        },
        { status: 500 }
      );
    }

    console.log('[Gemini] Preparing prompt for PDF analysis...');
    const instructions = [
      'You are parhaiGoat, a study quiz builder.',
      'Analyze the supplied PDF content and craft a JSON response that matches the provided schema.',
      'Questions should stay faithful to the facts, be concise (<260 chars), and include novel distractors.',
      'Focus on medium/hard difficulty for college-level learners.',
      'Extract key concepts from the PDF and create 8-12 challenging questions.',
    ].join(' ');

    console.log('[Gemini] Initializing model gemini-2.5-flash...');
    let model;
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(getGeminiKey());
      model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: analysisSchema,
          temperature: 0.5,
        },
      });
      console.log('[Gemini] Model initialized successfully');
    } catch (modelError) {
      const msg = modelError instanceof Error ? modelError.message : 'Failed to initialize Gemini model';
      console.error('[Gemini] Model init error:', modelError);
      return NextResponse.json({ error: 'Failed to initialize AI model', detail: msg }, { status: 500 });
    }

    console.log('[Gemini] Sending generation request with PDF file...');
    let result;
    try {
      result = await model.generateContent([
        {
          fileData: {
            mimeType: 'application/pdf',
            fileUri: fileUri,
          },
        },
        { text: instructions },
      ]);
      console.log('[Gemini] Content generated successfully');
    } catch (genError) {
      const msg = genError instanceof Error ? genError.message : 'Failed to generate content';
      console.error('[Gemini] Generation error:', genError);
      return NextResponse.json({ error: 'Failed to generate quiz', detail: msg }, { status: 502 });
    }

    const rawText = result.response.text();
    if (!rawText) {
      console.error('[Gemini] Empty response');
      return NextResponse.json({ error: 'Gemini returned an empty response' }, { status: 502 });
    }

    console.log('[Gemini] Parsing AI response...');
    let aiPayload;
    try {
      aiPayload = JSON.parse(rawText);
      console.log('[Gemini] Response parsed successfully');
    } catch (parseError) {
      console.error('[Gemini] JSON parse error:', parseError, 'Raw response:', rawText.substring(0, 500));
      return NextResponse.json({ error: 'Failed to parse AI response', detail: 'Invalid JSON from Gemini' }, { status: 502 });
    }

    const questionSet = (Array.isArray(aiPayload?.quiz?.questions) ? aiPayload.quiz.questions : [])
      .map(buildQuestion)
      .filter(Boolean) as Question[];

    if (!questionSet.length) {
      console.error('[Gemini] No questions generated');
      return NextResponse.json({ error: 'AI could not produce any questions' }, { status: 502 });
    }

    const sections = aiPayload.sections?.map((s: any) => s.insight || s.title).filter(Boolean) || [];

    console.log('[API] Success! Generated', questionSet.length, 'questions');
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
    const message = error instanceof Error ? error.message : 'Failed to analyze PDF';
    console.error('[API] Top-level error:', error);
    return NextResponse.json({ error: 'Failed to analyze PDF', detail: message }, { status: 500 });
  }
}

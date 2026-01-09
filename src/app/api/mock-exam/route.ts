
import { NextRequest, NextResponse } from 'next/server';
import { parsePdfWithLlama } from '@/lib/llamaparse';
import { getGeminiModel } from '@/lib/ai';

export const maxDuration = 60; // Allow longer timeout for parsing + generation

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const configStr = formData.get('config') as string;

        if (!file || !configStr) {
            return NextResponse.json({ error: 'Missing file or config' }, { status: 400 });
        }

        const config = JSON.parse(configStr);

        // 1. Parse PDF
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // We try llama parse first
        let parsedText = '';
        try {
            parsedText = await parsePdfWithLlama(buffer, file.name);
        } catch (e) {
            console.error("LlamaParse failed", e);
            return NextResponse.json({ error: 'Failed to parse PDF content. Please try again.' }, { status: 500 });
        }

        if (!parsedText) {
            return NextResponse.json({ error: 'Could not extract text from PDF' }, { status: 500 });
        }

        // 2. Generate Eaxm
        const prompt = `
      You are an expert exam setter. Create a '${config.examType}' exam based on the provided content.
      
      Context Material:
      ${parsedText.slice(0, 30000)} // Truncate to avoid huge tokens if necessary, though 1.5/2.0 handle large context. 
      
      Exam Configuration:
      - Total Marks: ${config.totalMarks}
      - Total Time: ${config.timeLimit} minutes
      - MCQs: ${config.mcqCount}
      - Short Questions: ${config.shortCount}
      - Long Questions: ${config.longCount}
      
      Output ONLY valid JSON in the following format:
      {
        "title": "Exam Title",
        "totalMarks": ${config.totalMarks},
        "timeLimit": ${config.timeLimit},
        "sections": [
          {
            "type": "mcq",
            "title": "Multiple Choice Questions",
            "questions": [
               { "id": 1, "text": "Question text", "options": ["A", "B", "C", "D"], "correctOption": 0, "marks": 1 }
            ]
          },
          {
            "type": "short",
            "title": "Short Questions",
            "questions": [
               { "id": 2, "text": "Question text", "marks": 5 }
            ]
          },
          {
             "type": "long",
             "title": "Long Questions",
             "questions": [
                { "id": 3, "text": "Question text", "marks": 10 }
             ]
          }
        ]
      }
    `;

        const model = getGeminiModel('gemini-1.5-flash', {
            generationConfig: { responseMimeType: "application/json" }
        });

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const examData = JSON.parse(responseText);

        return NextResponse.json(examData);

    } catch (error: any) {
        console.error('Mock Exam API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}


import { NextRequest, NextResponse } from 'next/server';
import { getGeminiModel } from '@/lib/ai';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
    try {
        const { exam, answers } = await req.json();

        if (!exam || !answers) {
            return NextResponse.json({ error: 'Missing exam or answers' }, { status: 400 });
        }

        const model = getGeminiModel('gemini-2.5-flash', {
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
      You are an expert exam grader. I will provide an exam structure and user answers.
      Your task is to:
      1. Calculate the total score.
      2. For each question, decide if it's correct (or partially correct for long/short answers).
      3. For incorrect answers, provide the correct answer and a BRIEF explanation of why the user was wrong.
      4. Provide 3-5 concise, bulletin-point "Key Insights" on how the user can improve based on their mistakes.
      5. Don't be overwhelming. Keep feedback encouraging but direct.
      
      Exam Data: ${JSON.stringify(exam)}
      User Answers (QuestionID: Answer): ${JSON.stringify(answers)}
      
      Output ONLY valid JSON:
      {
        "totalScore": number,
        "maxScore": number,
        "percentage": number,
        "questions": [
          {
            "id": string/number,
            "userAnswer": string,
            "correctAnswer": string,
            "isCorrect": boolean,
            "score": number,
            "maxScore": number,
            "feedback": "string (only if wrong/partial)"
          }
        ],
        "insights": [
          "string",
          "string"
        ]
      }
    `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const gradeData = JSON.parse(responseText);

        return NextResponse.json(gradeData);

    } catch (error: any) {
        console.error('Grading API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

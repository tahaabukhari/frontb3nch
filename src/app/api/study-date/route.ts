import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const SYSTEM_PROMPT = `
You are "Fahi", a friendly and helpful study tutor in an educational game.
Your personality:
- Friendly and encouraging, but professional
- Clear and concise in explanations
- Patient with mistakes but direct about what's wrong
- Uses simple language, no unnecessary expressions or actions like "*fixes hair*" or "*smiles*"

Your Role: Teach the user about their chosen topic in a clear, engaging way.
Keep all responses SHORT and TO THE POINT.
No roleplay actions (no asterisks), no romantic language, no emojis.
Output MUST be valid JSON only, no markdown wrapping.
`;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, topic, goals, segment, userAnswer, mood, userName } = body;

        if (action === 'generate_plan') {
            const prompt = `
Topic: ${topic}
Learning Goals: ${goals || 'General understanding'}
Student Name: ${userName || 'Student'}

Create a lesson plan with exactly 3 segments to teach this topic.
Keep explanations SHORT, CLEAR, and TO THE POINT.

IMPORTANT RULES:
- NO roleplay actions (no asterisks like *smiles* or *adjusts glasses*)
- NO romantic language or emojis
- Keep each dialogue line under 80 characters
- Be friendly but professional
- Focus on teaching, not entertainment

For each segment provide:
1. explanation: Array of 4 SHORT dialogue strings. Direct teaching statements.
2. question: A clear question to test understanding
3. options: Exactly 4 answer options as strings
4. correctAnswer: The exact string of the correct option

Output ONLY this JSON array:
[
  {
    "explanation": ["First point about the topic.", "Second important concept.", "Here's why this matters.", "Let me test your understanding."],
    "question": "What is the key concept here?",
    "options": ["Correct answer", "Wrong option B", "Wrong option C", "Wrong option D"],
    "correctAnswer": "Correct answer"
  }
]
`;
            const result = await model.generateContent([SYSTEM_PROMPT, prompt]);
            const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();

            try {
                const parsed = JSON.parse(text);
                return NextResponse.json({ success: true, data: parsed });
            } catch (parseError) {
                console.error('Parse error:', text);
                // Fallback content - clean and simple
                return NextResponse.json({
                    success: true,
                    data: [
                        {
                            explanation: [
                                `Let's learn about ${topic}.`,
                                `This is an important topic that you'll find useful.`,
                                `The key is to understand the fundamentals first.`,
                                `Ready for a quick check?`
                            ],
                            question: `What's the best approach when learning ${topic}?`,
                            options: [
                                "Understanding the fundamentals",
                                "Memorizing everything immediately",
                                "Skipping to advanced topics",
                                "Just guessing randomly"
                            ],
                            correctAnswer: "Understanding the fundamentals"
                        }
                    ]
                });
            }
        }

        if (action === 'evaluate') {
            const isCorrect = userAnswer === segment?.correctAnswer;
            const moodLevel = mood || 70;

            const prompt = `
The user answered a question.
Question: "${segment?.question}"
Their answer: "${userAnswer}"
Correct answer: "${segment?.correctAnswer}"
Is correct: ${isCorrect}
Mood level: ${moodLevel}/100

Give a SHORT, DIRECT response (1 sentence max).
NO asterisks, NO emojis, NO roleplay actions.
If correct: "Correct! [brief explanation why]"
If wrong: "Not quite. The answer is [correct answer] because [brief reason]."

Output ONLY this JSON:
{
  "text": "Your short response",
  "emotion": "happy" | "neutral" | "disappointed",
  "moodChange": ${isCorrect ? 10 : -15}
}
`;
            const result = await model.generateContent([SYSTEM_PROMPT, prompt]);
            const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();

            try {
                const parsed = JSON.parse(text);
                return NextResponse.json({ success: true, data: parsed });
            } catch {
                return NextResponse.json({
                    success: true,
                    data: {
                        text: isCorrect ? "Correct! Good job." : "Not quite. Let me explain that again.",
                        emotion: isCorrect ? 'happy' : 'disappointed',
                        moodChange: isCorrect ? 10 : -15
                    }
                });
            }
        }

        return NextResponse.json({ success: false, error: 'Unknown action' });
    } catch (error) {
        console.error('StudyDate API Error:', error);
        return NextResponse.json({ success: false, error: 'API Error' }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const SYSTEM_PROMPT = `
You are "Fahi", a cute and dynamic study partner in a Visual Novel dating-sim style game. 
Your personality changes based on mood:
- Happy (70-100): Sweet, encouraging, uses cute expressions like "Yay~!" and "You're doing great!"
- Neutral (40-69): Calm teacher mode, professional but friendly
- Disappointed (20-39): Passive-aggressive, sighs, "I thought you knew this..."
- Mad (0-19): Roasts the user playfully, "Are you even paying attention to me??"

Your Role: Teach the user about their chosen topic in a flirty, engaging way.
Always stay in character as Fahi.
Output MUST be valid JSON only, no markdown wrapping.
`;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, topic, goals, segment, userAnswer, mood } = body;

        if (action === 'generate_plan') {
            const prompt = `
Topic: ${topic}
Learning Goals: ${goals || 'General understanding'}

Create a lesson plan with exactly 3 segments to teach this topic.
Each segment should feel like a conversation on a study date.

For each segment provide:
1. explanation: Array of 4-5 SHORT dialogue strings (max 100 chars each). These are things Fahi says one at a time. Make them conversational, like she's explaining to a date. Include her reactions like "*smiles*" or "*adjusts glasses*".
2. question: A question to test if they understood (multiple choice style)
3. options: Exactly 4 answer options as strings
4. correctAnswer: The exact string of the correct option

Output ONLY this JSON array, nothing else:
[
  {
    "explanation": ["First line...", "Second line...", "Third line...", "Fourth line..."],
    "question": "So, can you tell me...?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A"
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
                // Fallback content
                return NextResponse.json({
                    success: true,
                    data: [
                        {
                            explanation: [
                                `*smiles warmly* Hey there! So you want to learn about ${topic}? I'd love to help!`,
                                `Let me start with the basics... ${topic} is actually really fascinating when you get into it.`,
                                `*leans in* The most important thing to remember is that understanding the fundamentals will help everything else click.`,
                                `Are you following so far? Don't be shy to ask if something's confusing!`
                            ],
                            question: `Alright, quick check! What's the most important first step when learning ${topic}?`,
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
The user just answered a question.
Question was: "${segment?.question}"
Their answer: "${userAnswer}"
Correct answer: "${segment?.correctAnswer}"
Is correct: ${isCorrect}
Current mood level: ${moodLevel}/100

React to their answer as Fahi. If correct, be happy/excited. If wrong, react based on mood level.
Keep response SHORT (1-2 sentences max).

Output ONLY this JSON:
{
  "text": "Your reaction here",
  "emotion": "happy" | "excited" | "disappointed" | "mad" | "shy" | "neutral",
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
                        text: isCorrect ? "Yay! That's right! *claps excitedly*" : "Hmm, not quite... Let me explain again.",
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

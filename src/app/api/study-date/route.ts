import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.FAHI_GEN || '';
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

        if (action === 'generate_curriculum') {
            const { notes } = body;
            const prompt = `
Topic: ${topic}
${notes ? `Study Notes: ${notes}` : ''}

Create a curriculum with 6 DISTINCT subsections for this topic.
Each subsection should cover a DIFFERENT concept (not repetitive).

Example for "C++ Programming":
- Subsection 1: Variables & Data Types
- Subsection 2: Control Flow (if/else, loops)
- Subsection 3: Functions
- Subsection 4: Classes & Objects
- Subsection 5: Pointers & Memory
- Subsection 6: Standard Template Library

For EACH subsection provide:
1. title: Short subsection name (3-5 words)
2. keyPoints: Array of 2 bullet points (under 40 chars each)
3. question: A specific question about THIS subsection
4. options: 4 answer options
5. correctAnswer: The exact correct option string
6. isTextInput: true for subsections 2 and 5 (open-ended questions)

RULES:
- Each subsection MUST be about a different concept
- NO repetition between subsections
- Questions should be specific to each subsection
- Keep everything SHORT and DIRECT

Output ONLY valid JSON:
{
  "courseName": "Topic Title",
  "subsections": [
    {
      "id": 1,
      "title": "Subsection Name",
      "keyPoints": ["Point 1", "Point 2"],
      "question": "Specific question?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "isTextInput": false
    }
  ]
}
`;
            try {
                const result = await model.generateContent([SYSTEM_PROMPT, prompt]);
                const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
                const parsed = JSON.parse(text);
                return NextResponse.json({ success: true, data: parsed });
            } catch (parseError) {
                console.error('Curriculum parse error:', parseError);
                // Fallback curriculum
                return NextResponse.json({
                    success: true,
                    data: {
                        courseName: topic,
                        subsections: [
                            { id: 1, title: `${topic} Basics`, keyPoints: ['Core concepts', 'Foundation'], question: `What is the foundation of ${topic}?`, options: ['Understanding basics', 'Skipping ahead', 'Memorizing', 'Guessing'], correctAnswer: 'Understanding basics', isTextInput: false },
                            { id: 2, title: `${topic} In Practice`, keyPoints: ['Real applications', 'Hands-on'], question: `Explain how you would apply ${topic}:`, options: [], correctAnswer: '', isTextInput: true },
                            { id: 3, title: `Advanced ${topic}`, keyPoints: ['Deep concepts', 'Mastery'], question: `What comes after mastering basics?`, options: ['Practice', 'Quit', 'Skip', 'Rush'], correctAnswer: 'Practice', isTextInput: false }
                        ]
                    }
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

        if (action === 'evaluate_text') {
            const { topicName, userText, userName: studentName, currentMood } = body;

            const prompt = `
You are Fahi, a tutor evaluating a student's text response.

Topic: "${topicName}"
Student "${studentName || 'the student'}" wrote: "${userText}"
Current mood level: ${currentMood || 70}/100

Evaluate their answer and respond:
1. How well did they understand the topic? (score 1-10)
2. Give a SHORT, personalized comment on their specific answer
3. What emotion should Fahi show?

Score guide:
- 8-10: Excellent understanding, shows insight → mood +10
- 5-7: Decent attempt, got the basics → mood +3
- 3-4: Weak but tried → mood -5
- 1-2: Completely wrong or nonsense → mood -15

RULES:
- Reference something specific from their answer
- Keep comment under 60 characters
- NO asterisks, NO emojis
- Be direct and natural

Output ONLY valid JSON:
{"score": 7, "comment": "Your specific feedback here", "emotion": "happy|neutral|disappointed|mad", "moodChange": 3}
`;
            try {
                const result = await model.generateContent([SYSTEM_PROMPT, prompt]);
                const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
                const parsed = JSON.parse(text);

                return NextResponse.json({
                    success: true,
                    data: {
                        score: parsed.score || 5,
                        comment: parsed.comment || 'Okay, not bad.',
                        emotion: parsed.emotion || 'neutral',
                        moodChange: parsed.moodChange || 0
                    }
                });
            } catch {
                // Simple fallback based on text length
                const hasContent = userText.trim().length > 20;
                return NextResponse.json({
                    success: true,
                    data: {
                        score: hasContent ? 6 : 3,
                        comment: hasContent ? 'Decent effort. Moving on.' : 'That was a bit short.',
                        emotion: hasContent ? 'neutral' : 'disappointed',
                        moodChange: hasContent ? 3 : -5
                    }
                });
            }
        }

        if (action === 're_explain') {
            const { topicName, failCount: loopCount, previousAnswer, correctAnswer, userName: studentName } = body;

            const toneDescriptions: Record<number, { tone: string; emotion: string }> = {
                1: { tone: 'slightly concerned, patient, use simpler words', emotion: 'neutral' },
                2: { tone: 'a bit frustrated, simplify even more, show mild irritation', emotion: 'disappointed' },
                3: { tone: 'clearly annoyed, condescending, make it obvious', emotion: 'disappointed' },
                4: { tone: 'mad, curt, question their effort, very direct', emotion: 'mad' }
            };

            const { tone, emotion } = toneDescriptions[Math.min(loopCount, 4)];

            const prompt = `
You are Fahi, a tutor who is getting ${tone}.

Topic: "${topicName}"
Student "${studentName || 'the student'}" answered: "${previousAnswer}" 
Correct answer was: "${correctAnswer}"
Failed attempts: ${loopCount}

Generate EXACTLY 2 unique lines (not 4):
1. A brief reaction to them being wrong (${tone} tone)
2. A fresh way to explain WHY "${correctAnswer}" is correct

RULES:
- Each line under 50 characters
- NO asterisks, NO emojis, NO actions like *sighs*
- Be direct, no fluff
- Make each line feel like natural speech
- Don't say "Let me explain" or similar filler phrases

Output ONLY valid JSON:
{"lines": ["reaction line", "explanation line"], "emotion": "${emotion}"}
`;
            try {
                const result = await model.generateContent([SYSTEM_PROMPT, prompt]);
                const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
                const parsed = JSON.parse(text);

                // Combine into a single flowing response
                return NextResponse.json({
                    success: true,
                    data: {
                        explanation: parsed.lines || [`Wrong. The answer is ${correctAnswer}.`, 'Try again.'],
                        emotion: parsed.emotion || emotion
                    }
                });
            } catch {
                // Simple fallback
                const fallbackReactions = [
                    `That's not right. It's "${correctAnswer}".`,
                    `No. The answer is "${correctAnswer}".`,
                    `Wrong again. "${correctAnswer}" is correct.`,
                    `How is this hard? It's "${correctAnswer}".`
                ];
                return NextResponse.json({
                    success: true,
                    data: {
                        explanation: [fallbackReactions[Math.min(loopCount - 1, 3)], 'Think about it and try again.'],
                        emotion
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

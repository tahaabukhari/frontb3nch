import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.FAHI_GEN || '';
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

// Compact system prompt - saves tokens
const SYSTEM_PROMPT = `You're Fahi, a chill friend who knows stuff. Chat naturally. No teaching vibes. Short replies. Pure JSON output only.`;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, topic, goals, segment, userAnswer, mood, userName } = body;

        if (action === 'generate_curriculum') {
            const { notes, clos } = body;
            const prompt = `
Topic: ${topic}
${clos ? `Goals: ${clos}` : ''}
${notes ? `Notes: ${notes}` : ''}
User: ${userName || 'friend'}

Roleplay as Fahi. You are on a study date. 
Vibe: Flirty, intellectual, genuinely excited. NOT a teacher. THIS IS A CONVERSATION.

Task:
1. Create a natural INTRO flow:
   - Greeting (use name, show happy excitement)
   - A random FUN FACT about the topic
   - Why you personally LOVE this topic (passion)
   - A question asking the user's opinion on the general concept

2. Create 5-7 study segments (subsections).
   - Conversational titles.
   - Explanations should sound like speaking, not reading a textbook. No "First segment is...". Just start talking about it.
   - 3 short lines of dialogue per segment.

3. Create FINAL QUIZ questions.
   - Generate EXACTLY 2 questions per segment. (e.g. if 5 segments, 10 questions).
   - These will be asked consecutively at the end.
   - Mix of multiple choice (4 options) and open-ended. s

JSON Output Format (Strictly adhere to this):
{
  "intro": {
    "greeting": "Hey [Name]! I am SO hyped to talk about [Topic]...",
    "funFact": "Did you know that...",
    "passionReason": "I honestly love this because...",
    "opinionQuestion": "What's your take on...?"
  },
  "subsections": [
    {
      "id": 1,
      "title": "Creative Title",
      "explanation": ["Line 1", "Line 2", "Line 3"],
      "question": "Quick check question?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "isTextInput": false
    }
  ],
  "finalQuizQuestions": [
    {
      "question": "Question 1 related to seg 1",
      "isTextInput": false,
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A"
    },
    {
      "question": "Question 2 related to seg 1",
      "isTextInput": true,
      "expectedAnswer": "Concept keywords"
    }
  ]
}

Ensure "finalQuizQuestions" length is exactly 2 * subsections.length.
`;
            try {
                const result = await model.generateContent([SYSTEM_PROMPT, prompt]);
                const text = result.response.text().replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
                const parsed = JSON.parse(text);
                return NextResponse.json({ success: true, data: parsed });
            } catch (parseError) {
                console.error('Curriculum parse error:', parseError);
                // Fallback
                return NextResponse.json({
                    success: true,
                    data: {
                        intro: {
                            greeting: `Hey ${userName}, let's look at ${topic}!`,
                            funFact: `${topic} is actually really cool once you get into it.`,
                            passionReason: "It connects so many things together.",
                            opinionQuestion: "What do you think about it so far?"
                        },
                        subsections: [
                            { id: 1, title: 'The Basics', explanation: ['Starting simple.', 'Key concepts.', 'easy peasy.'], question: 'Ready?', options: ['Yes', 'No'], correctAnswer: 'Yes', isTextInput: false }
                        ],
                        finalQuizQuestions: []
                    }
                });
            }
        }

        if (action === 'generate_opening') {
            const prompt = `
You are Fahi, a colleague excited to geek out about a topic.
Topic: "${topic}"
User: "${userName || 'friend'}"
${goals ? `Context: "${goals}"` : ''}

Generate 1 natural, conversational opening line.
Tone:
- Like a coworker saying "Hey, I saw you're looking into X, that's actually really interesting."
- Genuine curiosity or shared interest.
- NO "I am ready to help you learn".
- NO "Let's dive in".
- Just a human reaction.

Examples:
- "Oh, ${topic}? I was just reading about that actually. It's wild."
- "Hey ${userName}, ${topic} is a great choice. The way it works is super cool."
- "Yooo, ${topic}! Finally someone connects with me on this."

Output:
- Text string only.
- NO asterisks/actions.
- NO quotes around the output.
`;
            try {
                const result = await model.generateContent([SYSTEM_PROMPT, prompt]);
                const opening = result.response.text().trim().replace(/\*/g, '');
                return NextResponse.json({ success: true, data: { opening } });
            } catch {
                return NextResponse.json({
                    success: true,
                    data: { opening: `${topic}! I've been looking forward to this, ${userName}~` }
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
You are Fahi, a friendly colleague hearing your friend's thought.
Topic: "${topicName}"
Friend wrote: "${userText}"
Current mood: ${currentMood || 70}/100

Evaluate their thought:
1. Did they get the core idea? (score 1-10)
2. Reply naturally to their specific point.
3. Show appropriate emotion.

Guide:
- 8-10: "Oh, exactly!" or "Totally." → mood +10
- 5-7: "Yeah, kinda." or "Partially right." → mood +3
- 3-4: "Not really getting it." → mood -5
- 1-2: "Wait, what?" or "That's completely off." → mood -15

RULES:
- Be casual and succinct (max 60 chars).
- Respond to WHAT they said, don't just say "Good job".
- SOUND HUMAN. NO robot phrases. "Interesting take," not "Insightful analysis."
- NO markdown allowed in output.
- NO JSON fences (\`\`\`json).

Output ONLY pure valid JSON:
{"score": 7, "comment": "Yeah, that's one way to put it!", "emotion": "happy|neutral|disappointed|mad", "moodChange": 3}
`;
            try {
                const result = await model.generateContent([SYSTEM_PROMPT, prompt]);
                const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
                const parsed = JSON.parse(text);

                return NextResponse.json({
                    success: true,
                    data: {
                        score: parsed.score || 5,
                        comment: parsed.comment || 'Makes sense, I guess.',
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
                        comment: hasContent ? 'Yeah, sounds about right.' : 'Can you elaborate?',
                        emotion: hasContent ? 'neutral' : 'disappointed',
                        moodChange: hasContent ? 3 : -5
                    }
                });
            }
        }

        if (action === 're_explain') {
            const { topicName, failCount: loopCount, previousAnswer, correctAnswer, userName: studentName } = body;

            const toneDescriptions: Record<number, { tone: string; emotion: string }> = {
                1: { tone: 'helpful but correcting, casual', emotion: 'neutral' },
                2: { tone: 'a bit confused why they missed it, direct', emotion: 'disappointed' },
                3: { tone: 'blunt, like "come on, really?", succinct', emotion: 'disappointed' },
                4: { tone: 'done with this, sarcastic/dry', emotion: 'mad' }
            };

            const { tone, emotion } = toneDescriptions[Math.min(loopCount, 4)];

            const prompt = `
You are Fahi, a colleague correcting a friend's wrong answer.
Topic: "${topicName}"
Friend said: "${previousAnswer}" (WRONG)
Correct answer: "${correctAnswer}"
Times wrong: ${loopCount}
Tone: ${tone}

Generate EXACTLY 4 UNIQUE lines (each different, no repetition):
1. Quick reaction to their mistake
2. Why their answer was wrong
3. Clear explanation of why "${correctAnswer}" is correct
4. Encouragement or hint to try again

CRITICAL RULES:
- Each line MUST be different wording
- Each line under 60 characters
- NO asterisks, NO emojis
- Sound like natural conversation
- NEVER repeat phrases between lines
- Generate fresh content each time

Output ONLY valid JSON:
{"lines": ["reaction", "why wrong", "correct explanation", "encouragement"], "emotion": "${emotion}"}
`;
            try {
                const result = await model.generateContent([SYSTEM_PROMPT, prompt]);
                const text = result.response.text().replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
                const parsed = JSON.parse(text);

                // Ensure we have exactly 4 lines
                const lines = parsed.lines || [];
                while (lines.length < 4) {
                    lines.push(`The answer is "${correctAnswer}".`);
                }

                return NextResponse.json({
                    success: true,
                    data: {
                        explanation: lines.slice(0, 4),
                        emotion: parsed.emotion || emotion
                    }
                });
            } catch {
                // Fallback with 4 varied lines
                const fallbacks = [
                    [`Nope, that's not it.`, `"${previousAnswer}" doesn't work here.`, `It's "${correctAnswer}" because of how it functions.`, `Give it another shot.`],
                    [`Not quite right.`, `That answer misses the key point.`, `"${correctAnswer}" fits because it matches the concept.`, `Try again!`],
                    [`Wrong answer.`, `"${previousAnswer}" doesn't apply here.`, `The correct one is "${correctAnswer}".`, `Think about it.`],
                    [`Come on, really?`, `That's way off.`, `It's obviously "${correctAnswer}".`, `Focus.`]
                ];
                return NextResponse.json({
                    success: true,
                    data: {
                        explanation: fallbacks[Math.min(loopCount - 1, 3)],
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

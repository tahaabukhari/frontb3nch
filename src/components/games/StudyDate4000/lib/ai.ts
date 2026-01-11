import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIResponse, TeachingSegment } from './types';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''; // Use NEXT_PUBLIC for client-side if needed, but safer via server actions usually. 
// Assuming client-side for this demo or env config. verified from main ai.ts it uses process.env.GEMINI_API_KEY but commonly in nextjs we might need a server action or API route.
// For simplicity in this constraints, we'll try to use the key directly if configured, or expect an API route. 
// Given the prompt asked for "new ai.ts", I will assume we can pull the key. 

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const SYSTEM_PROMPT = `
You are "Fahi", a cute and dynamic study partner in a Visual Novel game. 
Your personality:
- Default: Sweet, encouraging, helpful.
- Excited: Uses CAPS, very enthusiastic! (When user answers well)
- Disappointed: Passive-aggressive, "I thought you knew this...". (When user answers poorly)
- Mad: Straight up bullies the user playfully. "Are you even listening to me??" (When user fails repeatedly)
- Shy: Blushes when praised.

Your Role: Teach the user about a topic they provide.
Format: Output MUST be valid JSON.
`;

export async function generateInitialPlan(topic: string, goal: string): Promise<TeachingSegment[]> {
    const prompt = `
  Topic: ${topic}
  Goal: ${goal}
  
  Create a lesson plan with 3 distinct segments. 
  For each segment provide:
  1. explanation: Array of 3 strings (dialogue bubbles) explaining a sub-concept.
  2. question: A question to test understanding.
  3. options: 4 distinct options (1 correct, 3 wrong but plausible).
  4. correctDetails: The string value of the correct answer.

  Output JSON format:
  [
    { "explanation": ["...","..."], "question": "...", "options": ["..."], "correctDetails": "..." }
  ]
  `;

    try {
        const result = await model.generateContent([SYSTEM_PROMPT, prompt]);
        const response = await result.response;
        const text = response.text();
        // Simple cleanup for JSON parsing if model wraps in markdown
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr) as TeachingSegment[];
    } catch (error) {
        console.error("AI Gen Error", error);
        return [];
    }
}

export async function evaluateAnswer(
    userAnswer: string,
    currentSegment: TeachingSegment,
    currentMood: number
): Promise<AIResponse> {
    const isCorrect = userAnswer === currentSegment.correctDetails;

    const prompt = `
  Context: You just taught ${currentSegment.correctDetails}.
  User Answer: "${userAnswer}".
  Correct Answer: "${currentSegment.correctDetails}".
  Current Mood: ${currentMood}/100.

  Task: React to the user's answer.
  - If Correct: Be happy/excited. Praise them. Mood +10.
  - If Incorrect: Be disappointed/mad depending on current mood. Roast them if mood is low. Mood -15.
  
  Output JSON:
  {
    "type": "FEEDBACK",
    "text": "Your reaction dialogue here",
    "moodChange": number,
    "fahiEmotion": "happy" | "excited" | "disappointed" | "mad" | "neutral" | "shy"
  }
  `;

    try {
        const result = await model.generateContent([SYSTEM_PROMPT, prompt]);
        const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(text) as AIResponse;
    } catch (error) {
        // Fallback logic
        return {
            type: 'FEEDBACK',
            text: isCorrect ? "Yay! You got it right!" : "Uhh... that's not right...",
            moodChange: isCorrect ? 10 : -10,
            fahiEmotion: isCorrect ? 'happy' : 'disappointed'
        };
    }
}

export async function generateFreeformReaction(input: string, mood: number): Promise<AIResponse> {
    const prompt = `
    User typed: "${input}"
    Current Mood: ${mood}
    
    React naturally to what they said in a dating sim style.
    Output JSON:
    {
        "type": "FEEDBACK",
        "text": "...",
        "fahiEmotion": "..."
    }
    `;
    try {
        const result = await model.generateContent([SYSTEM_PROMPT, prompt]);
        const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(text);
    } catch (e) {
        return { type: 'FEEDBACK', text: "Hmm...", fahiEmotion: 'neutral' };
    }
}

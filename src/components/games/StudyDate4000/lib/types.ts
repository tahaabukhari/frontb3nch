export type FahiMood = 'neutral' | 'happy' | 'mad' | 'disappointed' | 'shy' | 'excited' | 'happy-explaining' | 'happy-explaining2' | 'happy-confused' | 'angry-disappointed' | 'happy-neutral';

export interface GameState {
    mood: number; // 0-100
    courseProgress: number; // 0-100
    phase: 'SETUP' | 'INTRO' | 'TEACHING' | 'QUIZ' | 'FEEDBACK' | 'ENDING';
    subPhase?: 'WAITING_FOR_USER' | 'PROCESSING';
    endingType?: 'BAD' | 'NEUTRAL' | 'GOOD';
    topic: string;
    history: ChatMessage[];
}

export interface ChatMessage {
    speaker: 'fahi' | 'user';
    text: string;
    mood?: FahiMood;
}

export interface TeachingSegment {
    explanation: string[]; // 3-4 dialogue chunks
    question: string;
    options: string[]; // 4 options
    correctDetails: string; // Internal logic
}

export interface AIResponse {
    type: 'TEACH' | 'FEEDBACK' | 'END';
    text?: string; // For immediate dialogue
    moodChange?: number;
    progressChange?: number;
    segment?: TeachingSegment; // If starting new lesson
    fahiEmotion?: FahiMood;
}

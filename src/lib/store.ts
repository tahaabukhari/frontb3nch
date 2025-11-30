'use client';

import { create } from 'zustand';
import type { Question, GameMode } from './questions';

export interface PdfQuizSection {
  title: string;
  insight: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface PdfQuizAnalysis {
  summary: string;
  highlights: string[];
  sections: PdfQuizSection[];
  recommendations: string[];
  context: string;
  questionSet: Question[];
  sourceName: string;
  generatedAt: number;
}

export interface UploadSource {
  name: string;
  size: number;
  dataUrl: string;
  lastModified: number;
}

export interface QuizAttempt {
  attemptNumber: number;
  score: number;
  totalQuestions: number;
  percentage: number;
  responseTimes: number[];
  wrongQs: { q: string; correct: string; user?: string }[];
  completedAt: number;
}

export interface Store {
  quizId: string;
  deckId: string;
  mode: GameMode | null;
  questions: Question[];
  index: number;
  score: number;
  wrongQs: { q: string; correct: string; user?: string }[];
  responseTimes: number[];
  startTime: number;
  upload?: UploadSource;
  analysis?: PdfQuizAnalysis;
  attemptHistory: Record<string, QuizAttempt[]>; // key is quizId
  currentAttempt: number;
  actions: {
    setQuiz: (config: { id: string; mode: GameMode; questions: Question[] }) => void;
    answer: (choice: string, correct: string) => void;
    nextQuestion: () => void;
    setUploadSource: (payload: UploadSource) => void;
    setAnalysis: (payload?: PdfQuizAnalysis) => void;
    saveAttempt: () => void;
    retakeQuiz: () => void;
  };
}

export const useStore = create<Store>((set, get) => ({
  quizId: '',
  deckId: '',
  mode: null,
  questions: [],
  index: 0,
  score: 0,
  wrongQs: [],
  responseTimes: [],
  startTime: Date.now(),
  upload: undefined,
  analysis: undefined,
  attemptHistory: {},
  currentAttempt: 1,
  actions: {
    setQuiz: ({ id, mode, questions }) => {
      const { attemptHistory } = get();
      const previousAttempts = attemptHistory[id] || [];
      set(() => ({
        quizId: id,
        deckId: id,
        mode,
        questions,
        index: 0,
        score: 0,
        wrongQs: [],
        responseTimes: [],
        startTime: Date.now(),
        currentAttempt: previousAttempts.length + 1,
      }));
    },
    answer: (choice, correct) => {
      const { questions, index, startTime } = get();
      const elapsedSeconds = startTime ? (Date.now() - startTime) / 1000 : 0;
      set((state) => ({
        score: choice === correct ? state.score + 1 : state.score,
        wrongQs:
          choice === correct
            ? state.wrongQs
            : [...state.wrongQs, { q: questions[index]?.q ?? 'Unknown question', correct, user: choice }],
        responseTimes: [...state.responseTimes, elapsedSeconds],
      }));
    },
    nextQuestion: () =>
      set((state) => ({
        index: state.index + 1,
        startTime: Date.now(),
      })),
    setUploadSource: (payload) =>
      set(() => ({
        upload: payload,
        analysis: undefined,
      })),
    setAnalysis: (payload) =>
      set(() => ({
        analysis: payload,
      })),
    saveAttempt: () => {
      const { quizId, score, questions, responseTimes, wrongQs, attemptHistory, currentAttempt } = get();
      const percentage = Math.round((score / Math.max(questions.length, 1)) * 100);

      const attempt: QuizAttempt = {
        attemptNumber: currentAttempt,
        score,
        totalQuestions: questions.length,
        percentage,
        responseTimes: [...responseTimes],
        wrongQs: [...wrongQs],
        completedAt: Date.now(),
      };

      const quizAttempts = attemptHistory[quizId] || [];
      set(() => ({
        attemptHistory: {
          ...attemptHistory,
          [quizId]: [...quizAttempts, attempt],
        },
      }));
    },
    retakeQuiz: () => {
      const { quizId, mode, questions } = get();
      // Trigger retake by resetting quiz state but keeping attempt history
      set(() => ({
        index: 0,
        score: 0,
        wrongQs: [],
        responseTimes: [],
        startTime: Date.now(),
      }));
    },
  },
}));

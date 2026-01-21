/**
 * Curriculum Types for Hierarchical Quiz Organization
 * Structure: Board → Grade → Subject → Chapter
 */

import type { Question } from '../questions';

// ============================================================================
// Core Curriculum Types
// ============================================================================

export interface Board {
    id: string;
    name: string;
    shortName: string;
    description: string;
    issueDate: string; // Latest curriculum issue date
    region: string;
    isActive: boolean;
}

export interface Grade {
    id: string;
    name: string; // e.g., "9th Grade"
    shortName: string; // e.g., "9th"
    boardId: string;
    order: number; // For sorting: 9, 10, 11, 12
    subjectIds: string[];
}

export interface Subject {
    id: string;
    name: string; // e.g., "Physics"
    gradeId: string;
    icon: string; // Emoji or icon identifier
    accentColor: string; // Tailwind color class
    chapterIds: string[];
    hasPOPQuiz: boolean;
}

export interface Chapter {
    id: string;
    name: string;
    subjectId: string;
    order: number; // Chapter number for sorting
    clioFile?: string; // Path to CLIO file for AI generation
    questions: Question[]; // Pre-generated or AI-generated questions
    isLocked: boolean; // For future content gating
}

// ============================================================================
// POP Quiz Configuration
// ============================================================================

export interface POPQuizConfig {
    questionCount: number;
    durationSeconds: number;
    shuffleQuestions: boolean;
}

export const DEFAULT_POP_QUIZ_CONFIG: POPQuizConfig = {
    questionCount: 100,
    durationSeconds: 600, // 10 minutes
    shuffleQuestions: true,
};

export type POPQuizScope = 'grade' | 'subject';

export interface POPQuizParams {
    scope: POPQuizScope;
    boardId: string;
    gradeId: string;
    subjectId?: string; // Only required for subject-level POP Quiz
}

// ============================================================================
// Curriculum Navigation Context
// ============================================================================

export interface CurriculumContext {
    boardId: string;
    gradeId?: string;
    subjectId?: string;
    chapterId?: string;
}

export interface BreadcrumbItem {
    label: string;
    href: string;
}

// ============================================================================
// Content Status Types
// ============================================================================

export type ContentStatus = 'available' | 'coming-soon' | 'locked';

export interface SubjectCard {
    subject: Subject;
    chapterCount: number;
    questionCount: number;
    status: ContentStatus;
}

export interface GradeCard {
    grade: Grade;
    subjectCount: number;
    status: ContentStatus;
}

// ============================================================================
// CLIO File Processing
// ============================================================================

export interface CLIOProcessingRequest {
    content: string;
    chapterId: string;
    chapterName: string;
    subjectName: string;
    gradeName: string;
}

export interface CLIOProcessingResponse {
    success: boolean;
    questions: Question[];
    error?: string;
}

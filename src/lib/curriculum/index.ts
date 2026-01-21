/**
 * Curriculum Content Management Utilities
 * Provides functions to query and manage the hierarchical curriculum data
 */

import type {
    Board,
    Grade,
    Subject,
    Chapter,
    GradeCard,
    SubjectCard,
    BreadcrumbItem,
    POPQuizParams,
    ContentStatus,
} from './types';
import { DEFAULT_POP_QUIZ_CONFIG } from './types';
import { punjabBoard, grades, subjects, allChapters } from './data/punjab-board';
import type { Question } from '../questions';

// ============================================================================
// Data Maps for Fast Lookups
// ============================================================================

const boardsMap = new Map<string, Board>([['punjab-board', punjabBoard]]);
const gradesMap = new Map<string, Grade>(grades.map((g) => [g.id, g]));
const subjectsMap = new Map<string, Subject>(subjects.map((s) => [s.id, s]));
const chaptersMap = new Map<string, Chapter>(allChapters.map((c) => [c.id, c]));

// ============================================================================
// Board Queries
// ============================================================================

export function getAllBoards(): Board[] {
    return [punjabBoard];
}

export function getBoardById(boardId: string): Board | undefined {
    return boardsMap.get(boardId);
}

// ============================================================================
// Grade Queries
// ============================================================================

export function getGradesByBoard(boardId: string): Grade[] {
    return grades.filter((g) => g.boardId === boardId).sort((a, b) => a.order - b.order);
}

export function getGradeById(gradeId: string): Grade | undefined {
    return gradesMap.get(gradeId);
}

export function getGradeCards(boardId: string): GradeCard[] {
    return getGradesByBoard(boardId).map((grade) => {
        const subjectCount = grade.subjectIds.length;
        let status: ContentStatus = 'available';
        if (subjectCount === 0) {
            status = 'coming-soon';
        }
        return { grade, subjectCount, status };
    });
}

// ============================================================================
// Subject Queries
// ============================================================================

export function getSubjectsByGrade(gradeId: string): Subject[] {
    return subjects.filter((s) => s.gradeId === gradeId);
}

export function getSubjectById(subjectId: string): Subject | undefined {
    return subjectsMap.get(subjectId);
}

export function getSubjectCards(gradeId: string): SubjectCard[] {
    return getSubjectsByGrade(gradeId).map((subject) => {
        const chapterCount = subject.chapterIds.length;
        const chapters = subject.chapterIds.map((id) => chaptersMap.get(id)).filter(Boolean) as Chapter[];
        const questionCount = chapters.reduce((sum, ch) => sum + ch.questions.length, 0);
        const status: ContentStatus = chapterCount > 0 ? 'available' : 'coming-soon';
        return { subject, chapterCount, questionCount, status };
    });
}

// ============================================================================
// Chapter Queries
// ============================================================================

export function getChaptersBySubject(subjectId: string): Chapter[] {
    return allChapters.filter((c) => c.subjectId === subjectId).sort((a, b) => a.order - b.order);
}

export function getChapterById(chapterId: string): Chapter | undefined {
    return chaptersMap.get(chapterId);
}

export function getAvailableChapters(subjectId: string): Chapter[] {
    return getChaptersBySubject(subjectId).filter((c) => !c.isLocked);
}

// ============================================================================
// POP Quiz Question Generation
// ============================================================================

function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Generate POP Quiz questions for a given scope
 * @param params - POP Quiz parameters (scope, boardId, gradeId, optional subjectId)
 * @returns Array of questions (up to 100 for POP Quiz)
 */
export function getPOPQuizQuestions(params: POPQuizParams): Question[] {
    const { scope, gradeId, subjectId } = params;
    let allQuestions: Question[] = [];

    if (scope === 'grade') {
        // Get all questions from all subjects in the grade
        const grade = gradesMap.get(gradeId);
        if (!grade) return [];

        for (const subjId of grade.subjectIds) {
            const subject = subjectsMap.get(subjId);
            if (!subject) continue;

            for (const chId of subject.chapterIds) {
                const chapter = chaptersMap.get(chId);
                if (chapter && !chapter.isLocked) {
                    allQuestions = allQuestions.concat(chapter.questions);
                }
            }
        }
    } else if (scope === 'subject' && subjectId) {
        // Get all questions from all chapters in the subject
        const subject = subjectsMap.get(subjectId);
        if (!subject) return [];

        for (const chId of subject.chapterIds) {
            const chapter = chaptersMap.get(chId);
            if (chapter && !chapter.isLocked) {
                allQuestions = allQuestions.concat(chapter.questions);
            }
        }
    }

    // Shuffle and limit to POP Quiz count
    const shuffled = shuffleArray(allQuestions);
    return shuffled.slice(0, DEFAULT_POP_QUIZ_CONFIG.questionCount);
}

/**
 * Get questions for a specific chapter
 */
export function getChapterQuestions(chapterId: string, count = 10): Question[] {
    const chapter = chaptersMap.get(chapterId);
    if (!chapter) return [];

    const shuffled = shuffleArray(chapter.questions);
    return shuffled.slice(0, count);
}

// ============================================================================
// Breadcrumb Generation
// ============================================================================

export function generateBreadcrumbs(
    boardId?: string,
    gradeId?: string,
    subjectId?: string,
    chapterId?: string
): BreadcrumbItem[] {
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Library', href: '/play/library' }];

    if (boardId) {
        const board = boardsMap.get(boardId);
        if (board) {
            breadcrumbs.push({ label: board.shortName, href: `/play/library/${boardId}` });
        }
    }

    if (gradeId) {
        const grade = gradesMap.get(gradeId);
        if (grade) {
            breadcrumbs.push({ label: grade.shortName, href: `/play/library/${boardId}/${gradeId}` });
        }
    }

    if (subjectId) {
        const subject = subjectsMap.get(subjectId);
        if (subject) {
            breadcrumbs.push({ label: subject.name, href: `/play/library/${boardId}/${gradeId}/${subjectId}` });
        }
    }

    if (chapterId) {
        const chapter = chaptersMap.get(chapterId);
        if (chapter) {
            breadcrumbs.push({ label: chapter.name, href: `/play/library/${boardId}/${gradeId}/${subjectId}/${chapterId}` });
        }
    }

    return breadcrumbs;
}

// ============================================================================
// Content Statistics
// ============================================================================

export function getGradeStats(gradeId: string): { subjectCount: number; chapterCount: number; questionCount: number } {
    const grade = gradesMap.get(gradeId);
    if (!grade) return { subjectCount: 0, chapterCount: 0, questionCount: 0 };

    let chapterCount = 0;
    let questionCount = 0;

    for (const subjId of grade.subjectIds) {
        const subject = subjectsMap.get(subjId);
        if (!subject) continue;
        chapterCount += subject.chapterIds.length;

        for (const chId of subject.chapterIds) {
            const chapter = chaptersMap.get(chId);
            if (chapter) {
                questionCount += chapter.questions.length;
            }
        }
    }

    return { subjectCount: grade.subjectIds.length, chapterCount, questionCount };
}

export function getSubjectStats(subjectId: string): { chapterCount: number; questionCount: number } {
    const subject = subjectsMap.get(subjectId);
    if (!subject) return { chapterCount: 0, questionCount: 0 };

    let questionCount = 0;
    for (const chId of subject.chapterIds) {
        const chapter = chaptersMap.get(chId);
        if (chapter) {
            questionCount += chapter.questions.length;
        }
    }

    return { chapterCount: subject.chapterIds.length, questionCount };
}

// ============================================================================
// POP Quiz Label Generation
// ============================================================================

export function getPOPQuizLabel(params: POPQuizParams): string {
    const { scope, gradeId, subjectId } = params;

    if (scope === 'grade') {
        const grade = gradesMap.get(gradeId);
        return grade ? `${grade.name} - All Subjects` : 'Grade POP Quiz';
    }

    if (scope === 'subject' && subjectId) {
        const subject = subjectsMap.get(subjectId);
        const grade = gradesMap.get(gradeId);
        if (subject && grade) {
            return `${grade.shortName} ${subject.name}`;
        }
    }

    return 'POP Quiz';
}

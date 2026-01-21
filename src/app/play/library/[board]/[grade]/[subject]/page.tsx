'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    getBoardById,
    getGradeById,
    getSubjectById,
    getChaptersBySubject,
    getSubjectStats,
    generateBreadcrumbs,
    getPOPQuizLabel,
} from '@/lib/curriculum';
import type { POPQuizParams } from '@/lib/curriculum/types';
import POPQuizCard from '@/components/POPQuizCard';

const SubjectPage = () => {
    const params = useParams<{ board: string; grade: string; subject: string }>();
    const boardId = params?.board || '';
    const gradeId = params?.grade || '';
    const subjectId = params?.subject || '';

    const board = getBoardById(boardId);
    const grade = getGradeById(gradeId);
    const subject = getSubjectById(subjectId);
    const chapters = getChaptersBySubject(subjectId);
    const breadcrumbs = generateBreadcrumbs(boardId, gradeId, subjectId);
    const subjectStats = getSubjectStats(subjectId);

    const popQuizParams: POPQuizParams = {
        scope: 'subject',
        boardId,
        gradeId,
        subjectId,
    };

    if (!board || !grade || !subject) {
        return (
            <section className="flex min-h-[60vh] items-center justify-center px-4 py-10 text-center text-gray-300">
                Subject not found
            </section>
        );
    }

    return (
        <motion.section
            className="min-h-screen px-4 py-14 sm:px-6 sm:py-16"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
        >
            <h1 className="sr-only">{subject.name} - {grade.name}</h1>
            <div className="mx-auto max-w-6xl space-y-8">
                {/* Breadcrumb */}
                <nav className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
                    {breadcrumbs.map((item, idx) => (
                        <span key={item.href} className="flex items-center gap-2">
                            {idx > 0 && <span className="text-gray-600">/</span>}
                            <Link
                                href={item.href}
                                className={idx === breadcrumbs.length - 1 ? 'text-accent' : 'hover:text-white transition-colors'}
                            >
                                {item.label}
                            </Link>
                        </span>
                    ))}
                </nav>

                {/* Header */}
                <header className="text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-accent/20 to-accent/10 text-4xl">
                        {subject.icon}
                    </div>
                    <p className="text-3xl font-bold text-white sm:text-4xl">{subject.name}</p>
                    <p className="mt-3 text-base text-gray-400 sm:text-lg">
                        {grade.name} • {board.shortName}
                    </p>
                </header>

                {/* Subject-Level POP Quiz */}
                {subject.hasPOPQuiz && (
                    <POPQuizCard
                        scope="subject"
                        boardId={boardId}
                        gradeId={gradeId}
                        subjectId={subjectId}
                        label={getPOPQuizLabel(popQuizParams)}
                        questionCount={subjectStats.questionCount}
                        isAvailable={subjectStats.questionCount > 0}
                    />
                )}

                {/* Chapters Section */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">
                        Chapters ({chapters.length})
                    </h2>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {chapters.map((chapter) => {
                            const isLocked = chapter.isLocked;
                            // Chapters are now available if not locked (AI generates questions)
                            const isAvailable = !isLocked;

                            return (
                                <Link
                                    key={chapter.id}
                                    href={isAvailable ? `/play/library/${boardId}/${gradeId}/${subjectId}/${chapter.id}` : '#'}
                                    className={`
                    group relative overflow-hidden rounded-2xl border-2 p-5 text-left transition-all duration-300
                    ${isAvailable
                                            ? 'border-dark-border bg-dark-card hover:-translate-y-1 hover:border-accent hover:shadow-lg'
                                            : 'cursor-not-allowed border-gray-700 bg-gray-800/50'
                                        }
                  `}
                                    onClick={(e) => !isAvailable && e.preventDefault()}
                                >
                                    {/* Chapter Number */}
                                    <div className={`
                    mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold
                    ${isAvailable
                                            ? 'bg-accent/10 text-accent'
                                            : 'bg-gray-700 text-gray-500'
                                        }
                  `}>
                                        {chapter.order}
                                    </div>

                                    <p className={`text-base font-semibold ${isAvailable ? 'text-white group-hover:text-accent' : 'text-gray-500'} transition-colors line-clamp-2`}>
                                        {chapter.name}
                                    </p>

                                    <div className="mt-3 flex items-center justify-between text-xs">
                                        {isLocked ? (
                                            <span className="text-gray-600">🔒 Locked</span>
                                        ) : (
                                            <span className="text-accent flex items-center gap-1">
                                                <span>✨</span> AI Generated Quiz
                                            </span>
                                        )}

                                        {isAvailable && (
                                            <span className="font-semibold text-accent group-hover:translate-x-1 transition-transform">
                                                Start →
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Empty State */}
                {chapters.length === 0 && (
                    <div className="rounded-3xl border-2 border-dashed border-gray-700 bg-gray-800/30 p-12 text-center">
                        <p className="text-lg text-gray-400">No chapters available yet</p>
                        <p className="mt-2 text-sm text-gray-500">Check back soon for updates</p>
                    </div>
                )}

                {/* Back Link */}
                <div className="pt-4 text-center">
                    <Link
                        href={`/play/library/${boardId}/${gradeId}`}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        ← Back to {grade.name}
                    </Link>
                </div>
            </div>
        </motion.section>
    );
};

export default SubjectPage;

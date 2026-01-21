'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    getBoardById,
    getGradeById,
    getSubjectCards,
    getGradeStats,
    generateBreadcrumbs,
    getPOPQuizLabel,
} from '@/lib/curriculum';
import type { POPQuizParams } from '@/lib/curriculum/types';
import POPQuizCard from '@/components/POPQuizCard';

const GradePage = () => {
    const params = useParams<{ board: string; grade: string }>();
    const boardId = params?.board || '';
    const gradeId = params?.grade || '';

    const board = getBoardById(boardId);
    const grade = getGradeById(gradeId);
    const subjectCards = getSubjectCards(gradeId);
    const breadcrumbs = generateBreadcrumbs(boardId, gradeId);
    const gradeStats = getGradeStats(gradeId);

    const popQuizParams: POPQuizParams = {
        scope: 'grade',
        boardId,
        gradeId,
    };

    if (!board || !grade) {
        return (
            <section className="flex min-h-[60vh] items-center justify-center px-4 py-10 text-center text-gray-300">
                Grade not found
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
            <h1 className="sr-only">{grade.name} - {board.shortName}</h1>
            <div className="mx-auto max-w-6xl space-y-8">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-gray-400">
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
                    <p className="text-3xl font-bold text-white sm:text-4xl">{grade.name}</p>
                    <p className="mt-3 text-base text-gray-400 sm:text-lg">
                        {board.shortName} • {subjectCards.length} subject{subjectCards.length !== 1 ? 's' : ''} available
                    </p>
                </header>

                {/* Grade-Level POP Quiz */}
                <POPQuizCard
                    scope="grade"
                    boardId={boardId}
                    gradeId={gradeId}
                    label={getPOPQuizLabel(popQuizParams)}
                    questionCount={gradeStats.questionCount}
                    isAvailable={gradeStats.questionCount > 0}
                />

                {/* Subjects Section */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">Subjects</h2>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {subjectCards.map(({ subject, chapterCount, questionCount, status }) => {
                            const isAvailable = status === 'available';

                            return (
                                <Link
                                    key={subject.id}
                                    href={isAvailable ? `/play/library/${boardId}/${gradeId}/${subject.id}` : '#'}
                                    className={`
                    group relative overflow-hidden rounded-3xl border-2 p-6 text-left shadow-sm transition-all duration-300
                    ${isAvailable
                                            ? 'border-dark-border bg-dark-card hover:-translate-y-1 hover:border-accent hover:shadow-xl'
                                            : 'cursor-not-allowed border-gray-700 bg-gray-800/50'
                                        }
                  `}
                                    onClick={(e) => !isAvailable && e.preventDefault()}
                                >
                                    {/* Subject Icon */}
                                    <div className={`
                    mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl
                    ${isAvailable
                                            ? `bg-gradient-to-br ${subject.accentColor} bg-opacity-20`
                                            : 'bg-gray-700'
                                        }
                  `}>
                                        {subject.icon}
                                    </div>

                                    <p className={`text-xl font-bold ${isAvailable ? 'text-white group-hover:text-accent' : 'text-gray-500'} transition-colors`}>
                                        {subject.name}
                                    </p>

                                    {isAvailable ? (
                                        <div className="mt-3 space-y-1 text-sm text-gray-400">
                                            <p>{chapterCount} chapter{chapterCount !== 1 ? 's' : ''}</p>
                                            {questionCount > 0 && (
                                                <p>{questionCount} question{questionCount !== 1 ? 's' : ''}</p>
                                            )}
                                            {subject.hasPOPQuiz && (
                                                <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-400">
                                                    ⚡ POP Quiz Available
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="mt-3 text-sm text-gray-600">Coming soon</p>
                                    )}

                                    {isAvailable && (
                                        <div className="mt-4 flex items-center justify-end">
                                            <span className="text-sm font-semibold text-accent group-hover:translate-x-1 transition-transform">
                                                View Chapters →
                                            </span>
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Empty State */}
                {subjectCards.length === 0 && (
                    <div className="rounded-3xl border-2 border-dashed border-gray-700 bg-gray-800/30 p-12 text-center">
                        <p className="text-lg text-gray-400">No subjects available yet</p>
                        <p className="mt-2 text-sm text-gray-500">Check back soon for updates</p>
                    </div>
                )}

                {/* Back Link */}
                <div className="pt-4 text-center">
                    <Link
                        href={`/play/library/${boardId}`}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        ← Back to {board.shortName}
                    </Link>
                </div>
            </div>
        </motion.section>
    );
};

export default GradePage;

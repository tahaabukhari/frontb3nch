'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getBoardById, getGradeCards, getGradeStats, generateBreadcrumbs } from '@/lib/curriculum';
import POPQuizCard from '@/components/POPQuizCard';

const BoardPage = () => {
    const params = useParams<{ board: string }>();
    const boardId = params?.board || '';
    const board = getBoardById(boardId);
    const gradeCards = getGradeCards(boardId);
    const breadcrumbs = generateBreadcrumbs(boardId);

    if (!board) {
        return (
            <section className="flex min-h-[60vh] items-center justify-center px-4 py-10 text-center text-gray-300">
                Board not found
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
            <h1 className="sr-only">{board.name} - Select Grade</h1>
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
                    <p className="text-3xl font-bold text-white sm:text-4xl">{board.shortName}</p>
                    <p className="mt-3 text-base text-gray-400 sm:text-lg">
                        Select a grade to explore subjects and quizzes
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm font-semibold text-accent">
                        <span>✓</span>
                        Latest curriculum ({board.issueDate})
                    </div>
                </header>

                {/* Grade Cards Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {gradeCards.map(({ grade, subjectCount, status }) => {
                        const stats = getGradeStats(grade.id);
                        const isAvailable = status === 'available';

                        return (
                            <Link
                                key={grade.id}
                                href={isAvailable ? `/play/library/${boardId}/${grade.id}` : '#'}
                                className={`
                  group relative overflow-hidden rounded-3xl border-2 p-6 text-left shadow-sm transition-all duration-300
                  ${isAvailable
                                        ? 'border-dark-border bg-dark-card hover:-translate-y-1 hover:border-accent hover:shadow-xl'
                                        : 'cursor-not-allowed border-gray-700 bg-gray-800/50'
                                    }
                `}
                                onClick={(e) => !isAvailable && e.preventDefault()}
                            >
                                {/* Gradient Hover Effect */}
                                {isAvailable && (
                                    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-accent/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                )}

                                {/* Grade Badge */}
                                <div className={`
                  mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-bold
                  ${isAvailable
                                        ? 'bg-gradient-to-br from-accent/20 to-accent/10 text-accent'
                                        : 'bg-gray-700 text-gray-500'
                                    }
                `}>
                                    {grade.shortName}
                                </div>

                                <p className={`text-xl font-bold ${isAvailable ? 'text-white group-hover:text-accent' : 'text-gray-500'} transition-colors`}>
                                    {grade.name}
                                </p>

                                {isAvailable ? (
                                    <div className="mt-3 space-y-1 text-sm text-gray-400">
                                        <p>{subjectCount} subject{subjectCount !== 1 ? 's' : ''}</p>
                                        <p>{stats.chapterCount} chapter{stats.chapterCount !== 1 ? 's' : ''}</p>
                                    </div>
                                ) : (
                                    <p className="mt-3 text-sm text-gray-600">Coming soon</p>
                                )}

                                {isAvailable && (
                                    <div className="mt-4 flex items-center justify-end">
                                        <span className="text-sm font-semibold text-accent group-hover:translate-x-1 transition-transform">
                                            Explore →
                                        </span>
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Back Link */}
                <div className="pt-4 text-center">
                    <Link
                        href="/play/library"
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        ← Back to Board Selection
                    </Link>
                </div>
            </div>
        </motion.section>
    );
};

export default BoardPage;

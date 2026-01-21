'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import {
    getChapterById,
    getSubjectById,
    getGradeById,
    getBoardById,
    generateBreadcrumbs,
} from '@/lib/curriculum';
import { chapterSLOs } from '@/lib/curriculum/data/punjab-board';
import { useStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import type { Question } from '@/lib/questions';

type GenerateStatus = 'idle' | 'generating' | 'ready' | 'error';

const ChapterQuizPage = () => {
    const router = useRouter();
    const params = useParams<{ board: string; grade: string; subject: string; chapter: string }>();
    const boardId = params?.board || '';
    const gradeId = params?.grade || '';
    const subjectId = params?.subject || '';
    const chapterId = params?.chapter || '';

    const { actions } = useStore(
        useShallow((state) => ({
            actions: state.actions,
        }))
    );

    const [status, setStatus] = useState<GenerateStatus>('idle');
    const [error, setError] = useState<string | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [mode, setMode] = useState<'normal' | 'timed'>('timed');

    const board = getBoardById(boardId);
    const grade = getGradeById(gradeId);
    const subject = getSubjectById(subjectId);
    const chapter = getChapterById(chapterId);
    const breadcrumbs = generateBreadcrumbs(boardId, gradeId, subjectId);
    const slos = chapterSLOs[chapterId] || [];

    // Generate quiz when page loads
    useEffect(() => {
        if (!chapter || status !== 'idle') return;

        const generateQuiz = async () => {
            setStatus('generating');
            setError(null);

            try {
                const response = await fetch('/api/quiz/generate-chapter', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chapterId,
                        questionCount: 10,
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to generate quiz');
                }

                setQuestions(data.questions);
                setStatus('ready');
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to generate quiz');
                setStatus('error');
            }
        };

        generateQuiz();
    }, [chapter, chapterId, status]);

    const handleStartQuiz = () => {
        if (questions.length === 0) return;

        const quizId = `chapter-${chapterId}-${Date.now()}`;
        actions.setQuiz({
            id: quizId,
            mode,
            questions,
        });

        router.push(`/play/quiz/${quizId}`);
    };

    const handleRetry = () => {
        setStatus('idle');
        setError(null);
        setQuestions([]);
    };

    if (!board || !grade || !subject || !chapter) {
        return (
            <section className="flex min-h-[60vh] items-center justify-center px-4 py-10 text-center text-gray-300">
                Chapter not found
            </section>
        );
    }

    return (
        <motion.section
            className="min-h-screen px-4 py-14 sm:px-6 sm:py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="mx-auto max-w-3xl">
                {/* Breadcrumb */}
                <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-400">
                    {breadcrumbs.map((item, idx) => (
                        <span key={item.href} className="flex items-center gap-2">
                            {idx > 0 && <span className="text-gray-600">/</span>}
                            <button
                                onClick={() => router.push(item.href)}
                                className="hover:text-white transition-colors"
                            >
                                {item.label}
                            </button>
                        </span>
                    ))}
                    <span className="text-gray-600">/</span>
                    <span className="text-accent">{chapter.name}</span>
                </nav>

                {/* Header */}
                <header className="text-center mb-8">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 text-3xl">
                        {subject.icon}
                    </div>
                    <h1 className="text-2xl font-bold text-white sm:text-3xl">{chapter.name}</h1>
                    <p className="mt-2 text-gray-400">
                        {grade.name} • {subject.name}
                    </p>
                </header>

                {/* Loading State */}
                {status === 'generating' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16"
                    >
                        <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-accent/30 border-t-accent" />
                        <p className="text-xl font-semibold text-white">Generating Quiz...</p>
                        <p className="mt-2 text-gray-400">AI is creating questions based on chapter learning outcomes</p>
                    </motion.div>
                )}

                {/* Error State */}
                {status === 'error' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-12"
                    >
                        <div className="mx-auto mb-6 text-6xl">😅</div>
                        <p className="text-xl font-semibold text-white">Failed to Generate Quiz</p>
                        <p className="mt-2 text-gray-400">{error}</p>
                        <button
                            onClick={handleRetry}
                            className="mt-6 rounded-2xl bg-accent px-6 py-3 font-semibold text-dark-bg transition hover:bg-accent/90"
                        >
                            Try Again
                        </button>
                    </motion.div>
                )}

                {/* Ready State */}
                {status === 'ready' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Quiz Info Card */}
                        <div className="rounded-3xl border-2 border-accent/30 bg-dark-card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-sm text-gray-400">Questions Generated</p>
                                    <p className="text-3xl font-bold text-white">{questions.length}</p>
                                </div>
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-2xl">
                                    ✨
                                </div>
                            </div>
                            <p className="text-sm text-gray-400">
                                AI-generated questions based on {slos.length} learning outcomes
                            </p>
                        </div>

                        {/* Mode Selection */}
                        <div className="rounded-2xl border border-dark-border bg-dark-card p-5">
                            <p className="text-sm font-semibold text-gray-400 mb-3">Quiz Mode</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setMode('timed')}
                                    className={`flex-1 rounded-xl border-2 p-4 text-left transition ${mode === 'timed'
                                            ? 'border-accent bg-accent/10'
                                            : 'border-dark-border hover:border-gray-600'
                                        }`}
                                >
                                    <p className="font-semibold text-white">⏱️ Timed</p>
                                    <p className="text-xs text-gray-400 mt-1">20 seconds per question</p>
                                </button>
                                <button
                                    onClick={() => setMode('normal')}
                                    className={`flex-1 rounded-xl border-2 p-4 text-left transition ${mode === 'normal'
                                            ? 'border-accent bg-accent/10'
                                            : 'border-dark-border hover:border-gray-600'
                                        }`}
                                >
                                    <p className="font-semibold text-white">📖 Practice</p>
                                    <p className="text-xs text-gray-400 mt-1">No time limit</p>
                                </button>
                            </div>
                        </div>

                        {/* SLOs Preview */}
                        <div className="rounded-2xl border border-dark-border bg-dark-card p-5">
                            <p className="text-sm font-semibold text-gray-400 mb-3">Topics Covered</p>
                            <ul className="space-y-2 text-sm text-gray-300 max-h-40 overflow-y-auto">
                                {slos.slice(0, 5).map((slo, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <span className="text-accent">•</span>
                                        <span className="line-clamp-2">{slo}</span>
                                    </li>
                                ))}
                                {slos.length > 5 && (
                                    <li className="text-gray-500">+{slos.length - 5} more outcomes</li>
                                )}
                            </ul>
                        </div>

                        {/* Start Button */}
                        <button
                            onClick={handleStartQuiz}
                            className="w-full rounded-3xl bg-gradient-to-r from-accent to-accent/80 py-4 text-lg font-bold text-dark-bg shadow-xl shadow-accent/20 transition hover:shadow-2xl hover:shadow-accent/30"
                        >
                            Start Quiz →
                        </button>

                        {/* Regenerate Option */}
                        <button
                            onClick={handleRetry}
                            className="w-full text-center text-sm text-gray-400 hover:text-white transition"
                        >
                            🔄 Generate new questions
                        </button>
                    </motion.div>
                )}

                {/* Back Link */}
                <div className="mt-8 text-center">
                    <button
                        onClick={() => router.push(`/play/library/${boardId}/${gradeId}/${subjectId}`)}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        ← Back to {subject.name}
                    </button>
                </div>
            </div>
        </motion.section>
    );
};

export default ChapterQuizPage;

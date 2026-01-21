'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import {
    getBoardById,
    getGradeById,
    getSubjectById,
    getPOPQuizQuestions,
    getPOPQuizLabel,
} from '@/lib/curriculum';
import type { POPQuizParams, POPQuizScope } from '@/lib/curriculum/types';
import { DEFAULT_POP_QUIZ_CONFIG } from '@/lib/curriculum/types';
import { useStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';

const POPQuizPage = () => {
    const router = useRouter();
    const params = useParams<{ scope: string[] }>();
    const scopeParts = params?.scope || [];

    const { actions } = useStore(
        useShallow((state) => ({
            actions: state.actions,
        }))
    );

    const [isStarting, setIsStarting] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);

    // Parse scope from URL
    // Format: /pop-quiz/[boardId]/[gradeId] or /pop-quiz/[boardId]/[gradeId]/[subjectId]
    const popQuizParams: POPQuizParams | null = useMemo(() => {
        if (scopeParts.length < 2) return null;

        const [boardId, gradeId, subjectId] = scopeParts;
        const scope: POPQuizScope = subjectId ? 'subject' : 'grade';

        return {
            scope,
            boardId,
            gradeId,
            subjectId,
        };
    }, [scopeParts]);

    const board = popQuizParams ? getBoardById(popQuizParams.boardId) : null;
    const grade = popQuizParams ? getGradeById(popQuizParams.gradeId) : null;
    const subject = popQuizParams?.subjectId ? getSubjectById(popQuizParams.subjectId) : null;

    const questions = useMemo(() => {
        if (!popQuizParams) return [];
        return getPOPQuizQuestions(popQuizParams);
    }, [popQuizParams]);

    const label = popQuizParams ? getPOPQuizLabel(popQuizParams) : 'POP Quiz';

    // Handle start with countdown
    const handleStart = () => {
        if (questions.length === 0) return;
        setIsStarting(true);
        setCountdown(3);
    };

    useEffect(() => {
        if (countdown === null || countdown < 0) return;

        if (countdown === 0) {
            // Generate quiz ID and start
            const quizId = `pop-quiz-${popQuizParams?.boardId}-${popQuizParams?.gradeId}${popQuizParams?.subjectId ? `-${popQuizParams.subjectId}` : ''}-${Date.now()}`;

            // Set quiz with pop-quiz mode (uses 10-minute timer)
            actions.setQuiz({
                id: quizId,
                mode: 'timed', // Will use the getDurationForMode which we updated
                questions: questions.slice(0, DEFAULT_POP_QUIZ_CONFIG.questionCount),
            });

            router.push(`/play/quiz/${quizId}`);
            return;
        }

        const timer = setTimeout(() => {
            setCountdown((c) => (c !== null ? c - 1 : null));
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown, actions, questions, router, popQuizParams]);

    if (!popQuizParams || !board || !grade) {
        return (
            <section className="flex min-h-[60vh] items-center justify-center px-4 py-10 text-center text-gray-300">
                Invalid POP Quiz parameters
            </section>
        );
    }

    if (questions.length === 0) {
        return (
            <motion.section
                className="min-h-screen px-4 py-14 sm:px-6 sm:py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="mx-auto max-w-2xl text-center">
                    <div className="mb-6 text-6xl">😅</div>
                    <h1 className="text-2xl font-bold text-white">No Questions Available</h1>
                    <p className="mt-4 text-gray-400">
                        The POP Quiz for {label} doesn't have any questions yet. Check back soon!
                    </p>
                    <button
                        onClick={() => router.back()}
                        className="mt-8 rounded-2xl bg-accent px-6 py-3 font-semibold text-dark-bg transition hover:bg-accent/90"
                    >
                        Go Back
                    </button>
                </div>
            </motion.section>
        );
    }

    return (
        <motion.section
            className="flex min-h-screen items-center justify-center px-4 py-14 sm:px-6 sm:py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="mx-auto max-w-2xl text-center">
                {/* Countdown Overlay */}
                {countdown !== null && countdown > 0 && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-dark-bg/95"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <motion.div
                            key={countdown}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 1.5, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-9xl font-black text-amber-400"
                        >
                            {countdown}
                        </motion.div>
                    </motion.div>
                )}

                {/* POP Quiz Info */}
                {!isStarting && (
                    <>
                        {/* Icon */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 0.2 }}
                            className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-5xl shadow-2xl shadow-amber-500/40"
                        >
                            ⚡
                        </motion.div>

                        {/* Title */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-4xl font-black text-white sm:text-5xl"
                        >
                            POP Quiz
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mt-4 text-xl text-amber-400 font-semibold"
                        >
                            {label}
                        </motion.p>

                        {/* Stats Cards */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="mt-8 flex justify-center gap-4"
                        >
                            <div className="rounded-2xl border-2 border-amber-500/30 bg-amber-500/10 px-6 py-4 text-center">
                                <p className="text-3xl font-bold text-white">{Math.min(questions.length, DEFAULT_POP_QUIZ_CONFIG.questionCount)}</p>
                                <p className="text-sm text-amber-400">Questions</p>
                            </div>
                            <div className="rounded-2xl border-2 border-orange-500/30 bg-orange-500/10 px-6 py-4 text-center">
                                <p className="text-3xl font-bold text-white">{DEFAULT_POP_QUIZ_CONFIG.durationSeconds / 60}</p>
                                <p className="text-sm text-orange-400">Minutes</p>
                            </div>
                        </motion.div>

                        {/* Instructions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="mt-8 rounded-2xl border border-gray-700 bg-dark-card p-6 text-left"
                        >
                            <h2 className="text-lg font-semibold text-white mb-3">Quick Rules</h2>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li className="flex items-center gap-2">
                                    <span className="text-amber-400">⏱️</span>
                                    Answer as many questions as you can in 10 minutes
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-amber-400">⚡</span>
                                    Each question is timed - be quick!
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-amber-400">🎯</span>
                                    No penalty for wrong answers - just keep going
                                </li>
                            </ul>
                        </motion.div>

                        {/* Start Button */}
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            onClick={handleStart}
                            className="mt-8 inline-flex items-center gap-3 rounded-3xl bg-gradient-to-r from-amber-500 to-orange-500 px-10 py-4 text-lg font-bold text-black shadow-xl shadow-amber-500/30 transition hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/40"
                        >
                            <span className="text-2xl">🔥</span>
                            Start POP Quiz
                        </motion.button>

                        {/* Back Link */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="mt-6"
                        >
                            <button
                                onClick={() => router.back()}
                                className="text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                ← Go back
                            </button>
                        </motion.div>
                    </>
                )}
            </div>
        </motion.section>
    );
};

export default POPQuizPage;

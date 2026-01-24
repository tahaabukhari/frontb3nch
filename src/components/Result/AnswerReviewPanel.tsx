'use client';

import { motion } from 'framer-motion';

interface WrongAnswer {
    q: string;
    user?: string;
    correct: string;
}

interface AnswerReviewPanelProps {
    wrongAnswers: WrongAnswer[];
    totalQuestions: number;
    correctCount: number;
}

export default function AnswerReviewPanel({
    wrongAnswers,
    totalQuestions,
    correctCount,
}: AnswerReviewPanelProps) {
    const flawless = wrongAnswers.length === 0;

    return (
        <motion.div
            className="rounded-3xl bg-dark-card/80 backdrop-blur-sm p-6 shadow-2xl border border-white/10 h-full overflow-hidden"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
        >
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-2xl">📋</span>
                Answer Review
            </h2>

            <p className="mt-2 text-sm text-gray-400">
                {correctCount} / {totalQuestions} correct
            </p>

            {flawless ? (
                <motion.div
                    className="mt-6 flex flex-col items-center justify-center py-8"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.2 }}
                >
                    <span className="text-6xl mb-4">🎉</span>
                    <p className="text-xl font-bold text-primary">Flawless Victory!</p>
                    <p className="text-sm text-gray-400 mt-1">No wrong answers recorded.</p>
                </motion.div>
            ) : (
                <div className="mt-4 space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                    {wrongAnswers.map((item, idx) => (
                        <motion.div
                            key={`wrong-${idx}`}
                            className="rounded-xl bg-black/30 border border-white/10 p-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1 + idx * 0.1 }}
                        >
                            <p className="font-medium text-gray-200 text-sm">{item.q}</p>
                            {item.user && (
                                <p className="text-xs text-red-400 mt-2">
                                    Your answer: <span className="font-semibold">{item.user}</span>
                                </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                                Correct: <span className="font-semibold text-primary">{item.correct}</span>
                            </p>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}

'use client';

import { motion } from 'framer-motion';

interface AIPanelProps {
    isLoading: boolean;
    error?: string;
    review: {
        headline: string;
        strengths: string[];
        focus: string[];
        actions: string[];
    } | null;
    summary?: string;
}

export default function AIInsightPanel({ isLoading, error, review, summary }: AIPanelProps) {
    return (
        <motion.div
            className="rounded-3xl bg-dark-card/80 backdrop-blur-sm p-6 shadow-2xl border border-white/10 h-full"
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
        >
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                AI Coach Insights
            </h2>

            {isLoading && (
                <div className="mt-4 flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-gray-400">Analyzing your performance...</span>
                </div>
            )}

            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

            {review && (
                <div className="mt-4 space-y-4 text-sm">
                    <p className="text-base font-semibold text-primary">{review.headline}</p>

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-green-400 mb-1">
                            💪 Strengths
                        </p>
                        <ul className="list-disc pl-4 text-gray-300 space-y-1">
                            {review.strengths.map((s, i) => (
                                <li key={`str-${i}`}>{s}</li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-1">
                            🎯 Focus Areas
                        </p>
                        <ul className="list-disc pl-4 text-gray-300 space-y-1">
                            {review.focus.map((f, i) => (
                                <li key={`foc-${i}`}>{f}</li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">
                            📝 Next Actions
                        </p>
                        <ul className="list-disc pl-4 text-gray-400 space-y-1">
                            {review.actions.map((a, i) => (
                                <li key={`act-${i}`}>{a}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {!review && !isLoading && !error && (
                <p className="mt-4 text-sm text-gray-500">No AI insights available yet.</p>
            )}

            {summary && (
                <details className="mt-6 rounded-xl bg-black/30 border border-white/5 p-3 text-sm text-gray-400">
                    <summary className="cursor-pointer text-xs font-semibold uppercase tracking-widest text-gray-500">
                        PDF Summary
                    </summary>
                    <p className="mt-2">{summary}</p>
                </details>
            )}
        </motion.div>
    );
}

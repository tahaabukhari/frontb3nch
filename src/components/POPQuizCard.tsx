'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface POPQuizCardProps {
    /** The scope of the POP Quiz - affects the label and link */
    scope: 'grade' | 'subject';
    /** Board ID for building the link */
    boardId: string;
    /** Grade ID for building the link */
    gradeId: string;
    /** Subject ID (required for subject-level POP Quiz) */
    subjectId?: string;
    /** Display label, e.g., "9th Grade Physics" */
    label: string;
    /** Number of available questions (shown if > 0) */
    questionCount?: number;
    /** Whether the POP Quiz is available */
    isAvailable?: boolean;
}

const POPQuizCard = ({
    scope,
    boardId,
    gradeId,
    subjectId,
    label,
    questionCount = 0,
    isAvailable = true,
}: POPQuizCardProps) => {
    // Build the POP Quiz link based on scope
    const href = scope === 'grade'
        ? `/play/pop-quiz/${boardId}/${gradeId}`
        : `/play/pop-quiz/${boardId}/${gradeId}/${subjectId}`;

    const isDisabled = !isAvailable || questionCount === 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <Link
                href={isDisabled ? '#' : href}
                className={`
          group relative block overflow-hidden rounded-3xl border-2 p-6 shadow-lg transition-all duration-300
          ${isDisabled
                        ? 'cursor-not-allowed border-gray-700 bg-gray-800/50'
                        : 'border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 hover:-translate-y-1 hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-500/20'
                    }
        `}
                onClick={(e) => isDisabled && e.preventDefault()}
            >
                {/* Animated Background Glow */}
                {!isDisabled && (
                    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-amber-600/20 via-orange-600/20 to-red-600/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
                )}

                {/* POP Badge */}
                <div className={`
          mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider
          ${isDisabled
                        ? 'bg-gray-700 text-gray-400'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/30'
                    }
        `}>
                    <span className="text-lg">⚡</span>
                    POP Quiz
                </div>

                {/* Main Content */}
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className={`text-2xl font-bold ${isDisabled ? 'text-gray-500' : 'text-white group-hover:text-amber-400'} transition-colors`}>
                            {label}
                        </p>
                        <p className={`mt-2 text-sm ${isDisabled ? 'text-gray-600' : 'text-gray-400'}`}>
                            {isDisabled
                                ? 'Content coming soon'
                                : '100 Questions • 10 Minutes • Rapid Fire Challenge'
                            }
                        </p>
                    </div>

                    {/* Icon */}
                    <div className={`
            flex h-14 w-14 items-center justify-center rounded-2xl text-2xl
            ${isDisabled
                            ? 'bg-gray-700 opacity-50'
                            : 'bg-gradient-to-br from-amber-500/30 to-orange-500/30 group-hover:scale-110 transition-transform'
                        }
          `}>
                        🔥
                    </div>
                </div>

                {/* Stats Bar */}
                {!isDisabled && questionCount > 0 && (
                    <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                            <span className="text-amber-400">📊</span>
                            {questionCount} questions available
                        </span>
                    </div>
                )}

                {/* CTA */}
                {!isDisabled && (
                    <div className="mt-4 flex items-center justify-end">
                        <span className="text-sm font-semibold text-amber-400 transition-transform group-hover:translate-x-1">
                            Start Challenge →
                        </span>
                    </div>
                )}
            </Link>
        </motion.div>
    );
};

export default POPQuizCard;

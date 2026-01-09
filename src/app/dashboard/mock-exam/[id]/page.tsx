
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import Link from 'next/link';

export default function MockExamPage() {
    const router = useRouter();
    const params = useParams();
    const { addExp } = useUser();

    // Core State
    const [exam, setExam] = useState<any>(null);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [status, setStatus] = useState<'LOADING' | 'ACTIVE' | 'SUBMITTING' | 'RESULTS'>('LOADING');

    // Results State
    const [gradeResult, setGradeResult] = useState<any>(null);

    // Initial Load
    useEffect(() => {
        if (!params?.id) return;

        const stored = localStorage.getItem(`mock-exam-${params.id}`);
        console.log("Checking storage for key:", `mock-exam-${params.id}`, "Found:", !!stored);

        if (!stored) {
            alert("Exam not found!");
            router.push('/dashboard');
            return;
        }

        const data = JSON.parse(stored);
        setExam(data);
        setTimeLeft(data.timeLimit * 60);
        setStatus('ACTIVE');
    }, [params?.id, router]);

    // Timer Logic
    useEffect(() => {
        if (status !== 'ACTIVE' || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [status, timeLeft]);

    const handleAnswerChange = (qId: string | number, value: any) => {
        setAnswers(prev => ({ ...prev, [qId]: value }));
    };

    const handleSubmit = async () => {
        setStatus('SUBMITTING');

        try {
            const res = await fetch('/api/mock-exam/grade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ exam, answers })
            });

            if (!res.ok) throw new Error('Grading failed');

            const result = await res.json();
            setGradeResult(result);

            // Add EXP reward
            addExp(50 + Math.floor(result.percentage / 2)); // Base 50 + up to 50 bonus

            setStatus('RESULTS');
        } catch (error) {
            console.error(error);
            alert("Failed to submit exam. Please try again.");
            setStatus('ACTIVE');
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (status === 'LOADING') {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
                <div className="animate-spin text-4xl mr-4">⚪</div>
                <span className="text-xl font-medium">Preparing Exam Environment...</span>
            </div>
        );
    }

    if (status === 'RESULTS' && gradeResult) {
        return <ResultsView gradeResult={gradeResult} router={router} />;
    }

    if (status === 'SUBMITTING') {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white space-y-4">
                <div className="animate-spin text-5xl text-indigo-500">⏳</div>
                <h2 className="text-2xl font-bold">Grading Your Exam...</h2>
                <p className="text-gray-400">Our AI is analyzing your answers and generating insights.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Sticky Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5 px-6 py-4">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="font-bold text-xl text-white">{exam.title || 'Mock Exam'}</h1>
                        <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                            <span>Total Marks: {exam.totalMarks}</span>
                            <span>•</span>
                            <span>{exam.sections.length} Sections</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className={`text-2xl font-mono font-bold px-4 py-2 rounded-lg bg-white/5 border border-white/10 ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-indigo-400'}`}>
                            {formatTime(timeLeft)}
                        </div>
                        <button
                            onClick={handleSubmit}
                            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all transform hover:scale-105"
                        >
                            Submit Exam
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto pt-32 pb-24 px-6 space-y-12">
                {exam.sections.map((section: any, idx: number) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={idx}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-4 pb-4 border-b border-white/5">
                            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                                {section.title}
                            </h2>
                            <span className="text-xs font-bold bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full uppercase tracking-wider border border-indigo-500/20">
                                {section.type}
                            </span>
                        </div>

                        <div className="space-y-6">
                            {section.questions.map((q: any) => (
                                <div key={q.id} className="group p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                        <h3 className="font-medium text-lg text-gray-200 leading-relaxed max-w-[90%]">
                                            <span className="text-indigo-500 font-bold mr-2">Q{q.id}.</span>
                                            {q.text}
                                        </h3>
                                        <span className="shrink-0 text-xs font-bold bg-black/40 text-gray-400 px-3 py-1.5 rounded-lg border border-white/5">
                                            {q.marks} Pts
                                        </span>
                                    </div>

                                    <div className="relative z-10">
                                        {section.type === 'mcq' && (
                                            <div className="grid grid-cols-1 gap-3">
                                                {q.options.map((opt: string, optIdx: number) => (
                                                    <button
                                                        key={optIdx}
                                                        onClick={() => handleAnswerChange(q.id, optIdx)}
                                                        className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 flex items-center group/opt ${answers[q.id] === optIdx
                                                                ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-900/40'
                                                                : 'bg-black/20 border-white/5 text-gray-400 hover:bg-white/5 hover:border-white/10'
                                                            }`}
                                                    >
                                                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center mr-4 transition-colors ${answers[q.id] === optIdx
                                                                ? 'border-white bg-white text-indigo-600'
                                                                : 'border-white/20 group-hover/opt:border-white/40'
                                                            }`}>
                                                            {answers[q.id] === optIdx && <div className="w-2 h-2 rounded-full bg-current" />}
                                                        </div>
                                                        <span className={`font-medium ${answers[q.id] === optIdx ? 'text-white' : 'text-gray-300'}`}>
                                                            {opt}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {(section.type === 'short' || section.type === 'long') && (
                                            <div className="relative">
                                                <textarea
                                                    value={answers[q.id] || ''}
                                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                                    placeholder="Type your answer here..."
                                                    className="w-full h-40 bg-black/30 border border-white/10 rounded-2xl p-5 text-base text-gray-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none placeholder:text-gray-600"
                                                />
                                                <div className="absolute bottom-4 right-4 text-xs text-gray-600 pointer-events-none">
                                                    {(answers[q.id] || '').length} chars
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* subtle decorative gradient */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </main>
        </div>
    );
}

// Sub-component for results
function ResultsView({ gradeResult, router }: { gradeResult: any, router: any }) {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white overflow-y-auto">
            <div className="max-w-5xl mx-auto px-6 py-16 space-y-12">

                {/* Header Section */}
                <div className="text-center space-y-4">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-block"
                    >
                        <div className="relative">
                            <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-2">
                                {Math.round(gradeResult.percentage)}%
                            </div>
                            {/* Glow */}
                            <div className="absolute inset-0 bg-indigo-500/30 blur-3xl -z-10 rounded-full" />
                        </div>
                    </motion.div>
                    <h1 className="text-3xl font-bold">Exam Completed</h1>
                    <p className="text-gray-400 text-lg">You scored <span className="text-white font-bold">{gradeResult.totalScore}</span> out of <span className="text-white font-bold">{gradeResult.maxScore}</span></p>

                    <div className="flex justify-center gap-4 pt-4">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full font-medium transition-colors border border-white/5"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>

                {/* Insights Section */}
                <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 rounded-3xl p-8 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-2xl">💡</span>
                        <h2 className="text-xl font-bold text-white">AI Grading Insights</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {gradeResult.insights.map((insight: string, idx: number) => (
                            <div key={idx} className="flex gap-3 p-4 bg-black/20 rounded-2xl border border-white/5">
                                <span className="text-indigo-400 font-bold">•</span>
                                <p className="text-sm text-gray-300 leading-relaxed">{insight}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Questions Review */}
                <div className="space-y-8">
                    <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4">Detailed Review</h2>

                    {gradeResult.questions.map((q: any) => (
                        <div key={q.id} className={`p-6 rounded-3xl border ${q.isCorrect ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-medium text-lg text-gray-200">
                                    <span className={`font-bold mr-2 ${q.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                                        {q.isCorrect ? '✓' : '✕'}
                                    </span>
                                    {q.text || `Question ${q.id}`}
                                    {/* Note: Grading API needs to return q text or we need to pass it. Currently API logic in step 66 doesn't return text in JSON structure explicitly unless we add it. 
                                        Actually, my prompt in step 66 doesn't explicitly ask for text but lists it in example. 
                                        Let's assume the model returns it or we can map it from local exam state if needed, 
                                        but API response is cleaner. */}
                                </h3>
                                <div className="text-sm font-bold opacity-70">
                                    {q.score} / {q.maxScore}
                                </div>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div className="flex flex-col gap-1">
                                    <span className="text-gray-500 text-xs uppercase tracking-wider font-bold">Your Answer</span>
                                    <div className={`p-3 rounded-xl border ${q.isCorrect ? 'bg-green-500/10 border-green-500/10 text-green-300' : 'bg-red-500/10 border-red-500/10 text-red-300'}`}>
                                        {q.userAnswer || '(No Answer)'}
                                    </div>
                                </div>

                                {!q.isCorrect && (
                                    <div className="flex flex-col gap-1 mt-4">
                                        <span className="text-gray-500 text-xs uppercase tracking-wider font-bold">Correct Answer & Explanation</span>
                                        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-300">
                                            <div className="font-bold text-indigo-300 mb-1">{q.correctAnswer}</div>
                                            {q.feedback && <p className="text-gray-400 mt-2 text-xs leading-relaxed">{q.feedback}</p>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}


'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';

export default function MockExamPage() {
    const router = useRouter();
    const params = useParams();
    const [exam, setExam] = useState<any>(null);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState<{ obtained: number, total: number } | null>(null);

    useEffect(() => {
        // Load exam from local storage
        if (!params?.id) return;

        const stored = localStorage.getItem(`mock-exam-${params.id}`);
        console.log("Checking storage for key:", `mock-exam-${params.id}`, "Found:", !!stored); // Debug logging

        if (!stored) {
            alert("Exam not found!");
            router.push('/dashboard');
            return;
        }
        const data = JSON.parse(stored);
        setExam(data);
        setTimeLeft(data.timeLimit * 60); // minutes to seconds
    }, [params?.id, router]);

    useEffect(() => {
        if (!exam || submitted || timeLeft <= 0) return;
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
    }, [exam, submitted]);

    const handleAnswerChange = (qId: string | number, value: any) => {
        setAnswers(prev => ({ ...prev, [qId]: value }));
    };

    const handleSubmit = () => {
        // Simple auto-grading for MCQs, manual for others (or simulated)
        let obtained = 0;
        let total = 0;

        exam.sections.forEach((section: any) => {
            section.questions.forEach((q: any) => {
                total += q.marks;
                if (section.type === 'mcq') {
                    if (answers[q.id] === q.correctOption) {
                        obtained += q.marks;
                    }
                } else {
                    // For short/long, we just give full marks for now as we can't auto-grade accurately without AI grading
                    // Simulating AI grading: giving 80% if answered
                    if (answers[q.id] && answers[q.id].length > 10) {
                        obtained += Math.floor(q.marks * 0.8);
                    }
                }
            });
        });

        setScore({ obtained, total });
        setSubmitted(true);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (!exam) return <div className="text-white p-10">Loading exam...</div>;

    if (submitted && score) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white p-8 flex items-center justify-center">
                <div className="max-w-xl w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-center space-y-6">
                    <h1 className="text-3xl font-bold">Exam Completed!</h1>
                    <div className="text-6xl font-bold text-indigo-400">
                        {Math.round((score.obtained / score.total) * 100)}%
                    </div>
                    <p className="text-gray-400">You scored {score.obtained} out of {score.total}</p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Top Bar */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur border-b border-white/10 p-4">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="font-bold text-lg">{exam.title || 'Mock Exam'}</h1>
                        <p className="text-xs text-gray-400">Total Marks: {exam.totalMarks}</p>
                    </div>
                    <div className={`text-2xl font-mono font-bold ${timeLeft < 300 ? 'text-red-500' : 'text-indigo-400'}`}>
                        {formatTime(timeLeft)}
                    </div>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-sm font-bold border border-red-500/20"
                    >
                        Finish Exam
                    </button>
                </div>
            </header>

            <main className="max-w-3xl mx-auto pt-24 pb-20 px-4 space-y-8">
                {exam.sections.map((section: any, idx: number) => (
                    <div key={idx} className="space-y-6">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-indigo-300">{section.title}</h2>
                            <span className="text-xs bg-white/10 px-2 py-1 rounded text-gray-400 uppercase">{section.type}</span>
                        </div>

                        {section.questions.map((q: any) => (
                            <div key={q.id} className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-medium text-lg">{q.text}</h3>
                                    <span className="text-xs font-bold bg-black/30 px-2 py-1 rounded text-gray-400">{q.marks} pts</span>
                                </div>

                                {section.type === 'mcq' && (
                                    <div className="space-y-2">
                                        {q.options.map((opt: string, optIdx: number) => (
                                            <button
                                                key={optIdx}
                                                onClick={() => handleAnswerChange(q.id, optIdx)}
                                                className={`w-full text-left p-3 rounded-xl border transition-all ${answers[q.id] === optIdx
                                                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                                                    : 'bg-black/20 border-white/5 text-gray-400 hover:bg-white/5'
                                                    }`}
                                            >
                                                <span className="font-bold mr-3 opacity-50">{String.fromCharCode(65 + optIdx)}.</span>
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {(section.type === 'short' || section.type === 'long') && (
                                    <textarea
                                        value={answers[q.id] || ''}
                                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                        placeholder="Type your answer here..."
                                        className="w-full h-32 bg-black/20 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </main>
        </div>
    );
}

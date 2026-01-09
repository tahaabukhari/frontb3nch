
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface CreateExamModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateExamModal: React.FC<CreateExamModalProps> = ({ isOpen, onClose }) => {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState({
        totalMarks: 50,
        timeLimit: 60, // minutes
        mcqCount: 10,
        shortCount: 5,
        longCount: 2,
        examType: 'Standard'
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleGenerate = async () => {
        if (!file) return;
        setLoading(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('config', JSON.stringify(config));

        try {
            const res = await fetch('/api/mock-exam', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error('Failed to generate exam');

            const examData = await res.json();

            // Save to localStorage to pass to the exam page
            // unique ID for this exam session
            const examId = Date.now().toString();
            localStorage.setItem(`mock-exam-${examId}`, JSON.stringify(examData));

            onClose();
            router.push(`/dashboard/mock-exam/${examId}`);
        } catch (error) {
            console.error(error);
            alert('Something went wrong generating the exam.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                >
                    <div className="p-6 border-b border-white/10 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white">Create Mock Exam</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* File Upload */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Upload Syllabus (PDF)</label>
                            <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-indigo-500/50 transition-colors bg-white/5">
                                <input type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" id="pdf-upload" />
                                <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                    <span className="text-2xl">📄</span>
                                    <span className="text-sm text-gray-400">{file ? file.name : "Click to upload PDF"}</span>
                                </label>
                            </div>
                        </div>

                        {/* Config Inputs */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Total Marks</label>
                                <input
                                    type="number"
                                    value={config.totalMarks}
                                    onChange={e => setConfig({ ...config, totalMarks: parseInt(e.target.value) })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Time (mins)</label>
                                <input
                                    type="number"
                                    value={config.timeLimit}
                                    onChange={e => setConfig({ ...config, timeLimit: parseInt(e.target.value) })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-sm font-medium text-gray-300 border-b border-white/5 pb-1">Question Distributon</p>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">MCQs</label>
                                    <input
                                        type="number"
                                        value={config.mcqCount}
                                        onChange={e => setConfig({ ...config, mcqCount: parseInt(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Short Qs</label>
                                    <input
                                        type="number"
                                        value={config.shortCount}
                                        onChange={e => setConfig({ ...config, shortCount: parseInt(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Long Qs</label>
                                    <input
                                        type="number"
                                        value={config.longCount}
                                        onChange={e => setConfig({ ...config, longCount: parseInt(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-white/10 bg-white/5 flex flex-col gap-3">
                        {loading && (
                            <div className="w-full bg-gray-700 h-1 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-indigo-500"
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 15, ease: "linear" }}
                                />
                            </div>
                        )}
                        <button
                            onClick={handleGenerate}
                            disabled={!file || loading}
                            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 ${!file || loading ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <span className="animate-spin text-xl">⚪</span>
                                    Parsing & Generating...
                                </>
                            ) : (
                                "Start Exam Now"
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

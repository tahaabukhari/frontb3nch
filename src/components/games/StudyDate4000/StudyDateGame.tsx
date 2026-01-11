'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Asset Imports
import bgImg from './public/background.jpg';
import tableImg from './public/table.png';
import fahiNeutral from './public/fahi-character/fahi-neutral.png';
import fahiHappy from './public/fahi-character/fahi-happy.png';
import fahiMad from './public/fahi-character/fahi-mad.png';
import fahiDisappointed from './public/fahi-character/fahi-disappointed.png';
import fahiShy from './public/fahi-character/fahi-shy.png';
import fahiExcited from './public/fahi-character/fahi-excited.png';
import fahiHappyExplaining from './public/fahi-character/fahi-happy-explaining.png';
import fahiHappyExplaining2 from './public/fahi-character/fahi-happy-explaining2.png';
import fahiHappyNeutral from './public/fahi-character/fahi-happy-neutral.png';

type FahiEmotion = 'neutral' | 'happy' | 'mad' | 'disappointed' | 'shy' | 'excited' | 'explaining' | 'explaining2' | 'happy-neutral';

interface Segment {
    explanation: string[];
    question: string;
    options: string[];
    correctAnswer: string;
}

type GamePhase = 'SETUP' | 'LOADING' | 'TEACHING' | 'QUIZ' | 'FEEDBACK' | 'ENDING';

// Sprite Map
const SPRITES: Record<FahiEmotion, any> = {
    'neutral': fahiNeutral,
    'happy': fahiHappy,
    'mad': fahiMad,
    'disappointed': fahiDisappointed,
    'shy': fahiShy,
    'excited': fahiExcited,
    'explaining': fahiHappyExplaining,
    'explaining2': fahiHappyExplaining2,
    'happy-neutral': fahiHappyNeutral
};

export default function StudyDateGame() {
    // Game State
    const [phase, setPhase] = useState<GamePhase>('SETUP');
    const [mood, setMood] = useState(70);
    const [progress, setProgress] = useState(0);
    const [segments, setSegments] = useState<Segment[]>([]);
    const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
    const [dialogueIndex, setDialogueIndex] = useState(0);
    const [currentText, setCurrentText] = useState('');
    const [emotion, setEmotion] = useState<FahiEmotion>('happy-neutral');
    const [endingType, setEndingType] = useState<'GOOD' | 'NEUTRAL' | 'BAD' | null>(null);

    // Input State
    const [topic, setTopic] = useState('');
    const [goals, setGoals] = useState('');

    // Animation State
    const [isAnimating, setIsAnimating] = useState(false);
    const [animFrame, setAnimFrame] = useState(0);

    // Typewriter State
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // Animation loop for explaining sprites
    useEffect(() => {
        if (!isAnimating) return;
        const interval = setInterval(() => {
            setAnimFrame(prev => (prev + 1) % 2);
        }, 300);
        return () => clearInterval(interval);
    }, [isAnimating]);

    // Typewriter effect
    useEffect(() => {
        if (!currentText) {
            setDisplayedText('');
            return;
        }

        setIsTyping(true);
        setDisplayedText('');
        let index = 0;

        const interval = setInterval(() => {
            if (index < currentText.length) {
                setDisplayedText(prev => prev + currentText[index]);
                index++;
            } else {
                setIsTyping(false);
                clearInterval(interval);
            }
        }, 30);

        return () => clearInterval(interval);
    }, [currentText]);

    // Get current sprite based on state
    const getCurrentSprite = () => {
        if (isAnimating) {
            return animFrame === 0 ? SPRITES['explaining'] : SPRITES['explaining2'];
        }
        return SPRITES[emotion] || SPRITES['happy-neutral'];
    };

    // Start the game
    const handleStart = async () => {
        if (!topic.trim()) return;

        setPhase('LOADING');
        setCurrentText('*thinking* Let me prepare something special for you...');
        setIsAnimating(true);

        try {
            const response = await fetch('/api/study-date', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'generate_plan', topic, goals })
            });

            const result = await response.json();

            if (result.success && result.data?.length > 0) {
                setSegments(result.data);
                setCurrentSegmentIndex(0);
                setDialogueIndex(0);
                setCurrentText(result.data[0].explanation[0]);
                setPhase('TEACHING');
                setIsAnimating(true);
            } else {
                // Fallback
                const fallbackSegments: Segment[] = [{
                    explanation: [
                        `*smiles* Okay! Let's learn about ${topic} together!`,
                        `The first thing you should know is that ${topic} is really interesting once you understand the basics.`,
                        `*adjusts notes* Let me explain the key concepts step by step...`,
                        `Are you ready? Let's do this!`
                    ],
                    question: `What's the best approach to learning ${topic}?`,
                    options: ['Step by step basics first', 'Skip to advanced topics', 'Just memorize everything', 'Give up immediately'],
                    correctAnswer: 'Step by step basics first'
                }];
                setSegments(fallbackSegments);
                setCurrentSegmentIndex(0);
                setDialogueIndex(0);
                setCurrentText(fallbackSegments[0].explanation[0]);
                setPhase('TEACHING');
                setIsAnimating(true);
            }
        } catch (error) {
            console.error('Failed to generate plan:', error);
            setCurrentText('*nervous* Oops, something went wrong... Let me try again!');
        }
    };

    // Advance dialogue
    const advanceDialogue = () => {
        if (isTyping) {
            // Skip typing animation
            setDisplayedText(currentText);
            setIsTyping(false);
            return;
        }

        const segment = segments[currentSegmentIndex];
        if (!segment) return;

        const nextIndex = dialogueIndex + 1;

        if (nextIndex < segment.explanation.length) {
            setDialogueIndex(nextIndex);
            setCurrentText(segment.explanation[nextIndex]);
        } else {
            // Done with explanation, show question
            setPhase('QUIZ');
            setCurrentText(segment.question);
            setIsAnimating(false);
            setEmotion('happy-neutral');
        }
    };

    // Handle answer selection
    const handleAnswer = async (answer: string) => {
        const segment = segments[currentSegmentIndex];
        if (!segment) return;

        setPhase('FEEDBACK');
        setIsAnimating(false);

        try {
            const response = await fetch('/api/study-date', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'evaluate',
                    segment,
                    userAnswer: answer,
                    mood
                })
            });

            const result = await response.json();

            if (result.success && result.data) {
                const { text, emotion: newEmotion, moodChange } = result.data;
                setCurrentText(text);
                setEmotion(newEmotion as FahiEmotion);

                const newMood = Math.min(100, Math.max(0, mood + moodChange));
                setMood(newMood);

                const isCorrect = answer === segment.correctAnswer;

                if (isCorrect) {
                    // Progress forward
                    const progressPerSegment = 100 / segments.length;
                    setProgress(prev => Math.min(100, prev + progressPerSegment));
                }

                // Wait then proceed
                setTimeout(() => {
                    // Check game over
                    if (newMood <= 0) {
                        setEndingType('BAD');
                        setPhase('ENDING');
                        return;
                    }

                    if (isCorrect) {
                        const nextSegment = currentSegmentIndex + 1;
                        if (nextSegment >= segments.length) {
                            // Game complete
                            setEndingType(newMood >= 95 ? 'GOOD' : 'NEUTRAL');
                            setPhase('ENDING');
                        } else {
                            // Next segment
                            setCurrentSegmentIndex(nextSegment);
                            setDialogueIndex(0);
                            setCurrentText(segments[nextSegment].explanation[0]);
                            setPhase('TEACHING');
                            setIsAnimating(true);
                            setEmotion('explaining');
                        }
                    } else {
                        // Repeat current segment
                        setDialogueIndex(0);
                        setCurrentText("*sighs* Let me explain that again...");
                        setTimeout(() => {
                            setCurrentText(segment.explanation[0]);
                            setPhase('TEACHING');
                            setIsAnimating(true);
                        }, 2000);
                    }
                }, 2500);
            }
        } catch (error) {
            console.error('Evaluation error:', error);
            setCurrentText('*confused* Something went wrong...');
        }
    };

    // Handle back/exit
    const handleExit = () => {
        window.history.back();
    };

    return (
        <div className="relative w-full h-screen overflow-hidden font-sans select-none">

            {/* LAYER 0: BACKGROUND */}
            <div className="absolute inset-0 z-0">
                <img src={bgImg.src} className="w-full h-full object-cover" alt="Background" />
            </div>

            {/* LAYER 1: CHARACTER (Centered) */}
            <div className="absolute inset-0 z-10 flex items-end justify-center pb-32 pointer-events-none">
                <motion.img
                    key={getCurrentSprite()?.src}
                    src={getCurrentSprite()?.src}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="h-[75vh] max-h-[800px] object-contain drop-shadow-2xl"
                    alt="Fahi"
                />
            </div>

            {/* LAYER 2: TABLE (Bottom, Foreground) */}
            <div className="absolute bottom-0 left-0 right-0 h-40 z-20 pointer-events-none">
                <img src={tableImg.src} className="w-full h-full object-cover object-top" alt="Table" />
            </div>

            {/* UI LAYER */}

            {/* Back Button */}
            {phase !== 'SETUP' && (
                <button
                    onClick={handleExit}
                    className="absolute top-4 left-4 z-50 bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-full text-white font-bold transition-all border border-white/30"
                >
                    ← Back
                </button>
            )}

            {/* LEFT SIDE: Progress Bars */}
            {phase !== 'SETUP' && phase !== 'LOADING' && (
                <div className="absolute left-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-6 w-20">
                    {/* Content Progress Bar */}
                    <div className="relative">
                        <span className="text-white text-xs font-bold mb-2 block text-center drop-shadow-md">Content</span>
                        <div className="h-48 bg-white/30 backdrop-blur-md rounded-full p-1 border border-white/40 shadow-lg">
                            <div className="h-full w-full rounded-full bg-white/20 relative overflow-hidden">
                                <motion.div
                                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-400 to-cyan-200 rounded-full"
                                    initial={{ height: '0%' }}
                                    animate={{ height: `${progress}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        </div>
                        <span className="text-white text-xs font-bold mt-1 block text-center">{Math.round(progress)}%</span>
                    </div>

                    {/* Mood Bar */}
                    <div className="relative">
                        <span className="text-white text-xs font-bold mb-2 block text-center drop-shadow-md">Mood</span>
                        <div className="h-48 bg-white/30 backdrop-blur-md rounded-full p-1 border border-white/40 shadow-lg">
                            <div className="h-full w-full rounded-full bg-white/20 relative overflow-hidden">
                                <motion.div
                                    className={`absolute bottom-0 left-0 right-0 rounded-full transition-colors duration-500 ${mood >= 70 ? 'bg-gradient-to-t from-pink-400 to-pink-200' :
                                            mood >= 40 ? 'bg-gradient-to-t from-yellow-400 to-yellow-200' :
                                                'bg-gradient-to-t from-red-500 to-red-300'
                                        }`}
                                    initial={{ height: '70%' }}
                                    animate={{ height: `${mood}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        </div>
                        <span className="text-white text-xs font-bold mt-1 block text-center">{mood}%</span>
                    </div>
                </div>
            )}

            {/* RIGHT SIDE: Dialogue Box */}
            {(phase === 'TEACHING' || phase === 'QUIZ' || phase === 'FEEDBACK' || phase === 'LOADING') && (
                <div className="absolute right-6 bottom-48 z-40 w-[420px] max-w-[calc(100vw-200px)]">
                    {/* Dialogue Bubble */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/95 backdrop-blur-md rounded-2xl rounded-br-none p-6 shadow-2xl border-4 border-pink-200 relative"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-pink-500 font-black text-lg">Fahi</span>
                            <span className="text-pink-300 text-sm">💕</span>
                        </div>
                        <p className="text-slate-700 text-lg leading-relaxed min-h-[80px]">
                            {displayedText}
                            {isTyping && <span className="animate-pulse">▌</span>}
                        </p>

                        {/* Click to continue indicator */}
                        {phase === 'TEACHING' && !isTyping && (
                            <button
                                onClick={advanceDialogue}
                                className="absolute -bottom-3 right-4 bg-pink-400 hover:bg-pink-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg transition-all animate-bounce"
                            >
                                Continue ▶
                            </button>
                        )}
                    </motion.div>

                    {/* Answer Options */}
                    <AnimatePresence>
                        {phase === 'QUIZ' && segments[currentSegmentIndex] && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="mt-4 space-y-2"
                            >
                                {segments[currentSegmentIndex].options.map((option, i) => (
                                    <motion.button
                                        key={i}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        onClick={() => handleAnswer(option)}
                                        className="w-full bg-white/90 hover:bg-pink-50 border-2 border-white hover:border-pink-300 p-4 rounded-xl text-left font-medium text-slate-700 shadow-md transition-all hover:scale-[1.02] active:scale-95"
                                    >
                                        {option}
                                    </motion.button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* SETUP SCREEN */}
            <AnimatePresence>
                {phase === 'SETUP' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-gradient-to-br from-pink-50 to-white border-4 border-pink-200 p-8 rounded-3xl max-w-lg w-full mx-4 shadow-2xl"
                        >
                            <h1 className="text-4xl font-black text-pink-500 mb-2 text-center tracking-tight">
                                Study Date 4000 💕
                            </h1>
                            <p className="mb-6 text-center text-gray-500">Learn anything with your study buddy Fahi!</p>

                            <label className="block text-sm font-bold text-slate-700 mb-1">What do you want to learn?</label>
                            <input
                                className="w-full p-3 rounded-xl border-2 border-pink-200 mb-4 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300 text-slate-700"
                                placeholder="e.g., Photosynthesis, JavaScript, World War II..."
                                value={topic}
                                onChange={e => setTopic(e.target.value)}
                            />

                            <label className="block text-sm font-bold text-slate-700 mb-1">Any specific goals? (Optional)</label>
                            <textarea
                                className="w-full p-3 rounded-xl border-2 border-pink-200 mb-6 h-24 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300 text-slate-700 resize-none"
                                placeholder="Paste notes, learning objectives, or leave blank..."
                                value={goals}
                                onChange={e => setGoals(e.target.value)}
                            />

                            <button
                                onClick={handleStart}
                                disabled={!topic.trim()}
                                className="w-full py-4 bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold text-xl rounded-xl transition-all shadow-lg active:scale-95 disabled:cursor-not-allowed"
                            >
                                Start Study Date 💖
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ENDING SCREEN */}
            <AnimatePresence>
                {phase === 'ENDING' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black/80"
                    >
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="text-center p-10"
                        >
                            <h1 className="text-6xl font-black text-white mb-6">
                                {endingType === 'GOOD' && '💖 Perfect Study Date! 💖'}
                                {endingType === 'NEUTRAL' && '📚 Study Complete!'}
                                {endingType === 'BAD' && '💔 Date Over...'}
                            </h1>
                            <p className="text-2xl text-white/80 mb-8">
                                {endingType === 'GOOD' && 'Fahi had an amazing time learning with you! She wants to see you again~'}
                                {endingType === 'NEUTRAL' && 'You learned a lot! Maybe bring her flowers next time?'}
                                {endingType === 'BAD' && 'Fahi got too frustrated and left... Better luck next time!'}
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-white text-pink-500 px-10 py-4 rounded-full font-bold text-xl hover:scale-110 transition-all shadow-xl"
                            >
                                Play Again?
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}

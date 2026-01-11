'use client';

import React, { useState, useEffect } from 'react';
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
    requiresTextInput?: boolean;
}

type GamePhase = 'INTRO' | 'ASK_NAME' | 'SETUP' | 'LOADING' | 'TEACHING' | 'QUIZ' | 'TEXT_INPUT' | 'FEEDBACK' | 'ENDING';

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

// Intro dialogue sequence
const INTRO_DIALOGUE = [
    { text: "Oh! Hello there~ 💕", emotion: 'happy' as FahiEmotion },
    { text: "Welcome to Study Date 4000! I'm Fahi, your personal study buddy!", emotion: 'excited' as FahiEmotion },
    { text: "*adjusts glasses* I'll help you learn anything you want in a fun way~", emotion: 'happy-neutral' as FahiEmotion },
    { text: "But first... what should I call you?", emotion: 'shy' as FahiEmotion }
];

export default function StudyDateGame() {
    // Core State
    const [phase, setPhase] = useState<GamePhase>('INTRO');
    const [mood, setMood] = useState(70);
    const [progress, setProgress] = useState(0);
    const [userName, setUserName] = useState('');

    // Dialogue State
    const [introIndex, setIntroIndex] = useState(0);
    const [segments, setSegments] = useState<Segment[]>([]);
    const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
    const [dialogueIndex, setDialogueIndex] = useState(0);
    const [currentText, setCurrentText] = useState(INTRO_DIALOGUE[0].text);
    const [emotion, setEmotion] = useState<FahiEmotion>(INTRO_DIALOGUE[0].emotion);
    const [endingType, setEndingType] = useState<'GOOD' | 'NEUTRAL' | 'BAD' | null>(null);

    // Input State
    const [topic, setTopic] = useState('');
    const [goals, setGoals] = useState('');
    const [textInput, setTextInput] = useState('');

    // Animation State - Alternates on dialogue advance, not continuously
    const [explainFrame, setExplainFrame] = useState(0); // 0 = explaining, 1 = explaining2

    // Typewriter State
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

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
        }, 25);

        return () => clearInterval(interval);
    }, [currentText]);

    // Get current sprite - alternates on dialogue change, not continuously
    const getCurrentSprite = () => {
        if (phase === 'TEACHING') {
            return explainFrame === 0 ? SPRITES['explaining'] : SPRITES['explaining2'];
        }
        return SPRITES[emotion] || SPRITES['happy-neutral'];
    };

    // Handle intro advancement
    const advanceIntro = () => {
        if (isTyping) {
            setDisplayedText(currentText);
            setIsTyping(false);
            return;
        }

        const nextIndex = introIndex + 1;
        if (nextIndex < INTRO_DIALOGUE.length) {
            setIntroIndex(nextIndex);
            setCurrentText(INTRO_DIALOGUE[nextIndex].text);
            setEmotion(INTRO_DIALOGUE[nextIndex].emotion);
        } else {
            setPhase('ASK_NAME');
        }
    };

    // Handle name submission
    const submitName = () => {
        if (!textInput.trim()) return;
        setUserName(textInput.trim());
        setTextInput('');
        setCurrentText(`Nice to meet you, ${textInput.trim()}! 💕 So... what would you like to learn today?`);
        setEmotion('happy');
        setTimeout(() => setPhase('SETUP'), 100);
    };

    // Start the game
    const handleStart = async () => {
        if (!topic.trim()) return;

        setPhase('LOADING');
        setCurrentText(`*excited* Ooh, ${topic}! Let me prepare something special for you, ${userName}...`);
        setEmotion('excited');

        try {
            const response = await fetch('/api/study-date', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'generate_plan', topic, goals, userName })
            });

            const result = await response.json();

            if (result.success && result.data?.length > 0) {
                setSegments(result.data);
                setCurrentSegmentIndex(0);
                setDialogueIndex(0);
                setExplainFrame(0);
                setCurrentText(result.data[0].explanation[0]);
                setPhase('TEACHING');
            } else {
                // Fallback content
                const fallback: Segment[] = [{
                    explanation: [
                        `Okay ${userName}, let's dive into ${topic}! *opens notebook*`,
                        `The first thing you should understand is that ${topic} has some really interesting fundamentals.`,
                        `*points at notes* Pay attention here, this is important~`,
                        `Let me break this down step by step so it's easy to follow!`
                    ],
                    question: `So ${userName}, what's the best approach when learning something new?`,
                    options: ['Start with fundamentals', 'Skip to advanced topics', 'Just memorize everything', 'Give up'],
                    correctAnswer: 'Start with fundamentals'
                }];
                setSegments(fallback);
                setCurrentSegmentIndex(0);
                setDialogueIndex(0);
                setExplainFrame(0);
                setCurrentText(fallback[0].explanation[0]);
                setPhase('TEACHING');
            }
        } catch (error) {
            console.error('Failed to generate:', error);
            setCurrentText(`*nervous* Oops, something went wrong... Let me try again, ${userName}!`);
            setEmotion('shy');
        }
    };

    // Advance teaching dialogue - alternates sprite on each advance
    const advanceDialogue = () => {
        if (isTyping) {
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
            // Alternate sprite on each dialogue advance
            setExplainFrame(prev => (prev + 1) % 2);
        } else {
            // Show question
            setCurrentText(segment.question);
            setEmotion('happy-neutral');

            if (segment.requiresTextInput) {
                setPhase('TEXT_INPUT');
            } else {
                setPhase('QUIZ');
            }
        }
    };

    // Handle choice answer
    const handleAnswer = async (answer: string) => {
        const segment = segments[currentSegmentIndex];
        if (!segment) return;

        setPhase('FEEDBACK');

        try {
            const response = await fetch('/api/study-date', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'evaluate', segment, userAnswer: answer, mood, userName })
            });

            const result = await response.json();

            if (result.success && result.data) {
                const { text, emotion: newEmotion, moodChange } = result.data;
                setCurrentText(text.replace('user', userName));
                setEmotion(newEmotion as FahiEmotion);

                const newMood = Math.min(100, Math.max(0, mood + moodChange));
                setMood(newMood);

                const isCorrect = answer === segment.correctAnswer;

                if (isCorrect) {
                    setProgress(prev => Math.min(100, prev + (100 / segments.length)));
                }

                setTimeout(() => {
                    if (newMood <= 0) {
                        setEndingType('BAD');
                        setPhase('ENDING');
                        return;
                    }

                    if (isCorrect) {
                        const nextSegment = currentSegmentIndex + 1;
                        if (nextSegment >= segments.length) {
                            setEndingType(newMood >= 95 ? 'GOOD' : 'NEUTRAL');
                            setPhase('ENDING');
                        } else {
                            setCurrentSegmentIndex(nextSegment);
                            setDialogueIndex(0);
                            setExplainFrame(0);
                            setCurrentText(segments[nextSegment].explanation[0]);
                            setPhase('TEACHING');
                        }
                    } else {
                        setDialogueIndex(0);
                        setExplainFrame(0);
                        setCurrentText(`Let me explain that again, ${userName}...`);
                        setTimeout(() => {
                            setCurrentText(segment.explanation[0]);
                            setPhase('TEACHING');
                        }, 2000);
                    }
                }, 2500);
            }
        } catch (error) {
            setCurrentText('*confused* Something went wrong...');
        }
    };

    // Handle text input submission
    const handleTextSubmit = async () => {
        if (!textInput.trim()) return;

        setPhase('FEEDBACK');
        setCurrentText(`*thinking* Hmm, "${textInput}"... Let me think about that, ${userName}~`);
        setEmotion('neutral');

        setTimeout(() => {
            setCurrentText(`That's an interesting perspective! I appreciate you sharing that with me. 💕`);
            setEmotion('happy');
            setMood(prev => Math.min(100, prev + 5));
            setProgress(prev => Math.min(100, prev + (100 / segments.length)));

            setTimeout(() => {
                const nextSegment = currentSegmentIndex + 1;
                if (nextSegment >= segments.length) {
                    setEndingType(mood >= 90 ? 'GOOD' : 'NEUTRAL');
                    setPhase('ENDING');
                } else {
                    setCurrentSegmentIndex(nextSegment);
                    setDialogueIndex(0);
                    setExplainFrame(0);
                    setCurrentText(segments[nextSegment].explanation[0]);
                    setPhase('TEACHING');
                }
            }, 2000);
        }, 1500);

        setTextInput('');
    };

    const handleExit = () => window.history.back();

    return (
        <div className="fixed inset-0 w-screen h-screen overflow-hidden font-sans select-none bg-black">

            {/* BACKGROUND */}
            <img
                src={bgImg.src}
                className="absolute inset-0 w-full h-full object-cover"
                alt="Background"
            />

            {/* TABLE - Bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-[25vh] z-10">
                <img src={tableImg.src} className="w-full h-full object-cover object-top" alt="Table" />
            </div>

            {/* MAIN CONTENT AREA - Fahi Left-Center, UI Right */}
            <div className="absolute inset-0 z-20 flex">

                {/* LEFT SECTION: Bars + Fahi */}
                <div className="flex-1 flex items-end justify-center relative" style={{ paddingBottom: '15vh' }}>

                    {/* Progress Bars - Positioned next to Fahi on her left */}
                    {phase !== 'INTRO' && phase !== 'ASK_NAME' && phase !== 'SETUP' && (
                        <div className="absolute left-[10%] bottom-[20vh] flex flex-col gap-4 z-30">
                            {/* Content Bar */}
                            <div className="text-center">
                                <span className="text-white text-xs font-bold drop-shadow-lg">Content</span>
                                <div className="h-40 w-8 bg-black/40 backdrop-blur-sm rounded-full p-1 border border-white/30 mt-1">
                                    <div className="h-full w-full rounded-full bg-white/10 relative overflow-hidden">
                                        <motion.div
                                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-500 to-cyan-300 rounded-full"
                                            animate={{ height: `${progress}%` }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    </div>
                                </div>
                                <span className="text-white text-xs font-bold mt-1 block">{Math.round(progress)}%</span>
                            </div>

                            {/* Mood Bar */}
                            <div className="text-center">
                                <span className="text-white text-xs font-bold drop-shadow-lg">Mood</span>
                                <div className="h-40 w-8 bg-black/40 backdrop-blur-sm rounded-full p-1 border border-white/30 mt-1">
                                    <div className="h-full w-full rounded-full bg-white/10 relative overflow-hidden">
                                        <motion.div
                                            className={`absolute bottom-0 left-0 right-0 rounded-full ${mood >= 70 ? 'bg-gradient-to-t from-pink-500 to-pink-300' :
                                                    mood >= 40 ? 'bg-gradient-to-t from-yellow-500 to-yellow-300' :
                                                        'bg-gradient-to-t from-red-600 to-red-400'
                                                }`}
                                            animate={{ height: `${mood}%` }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    </div>
                                </div>
                                <span className="text-white text-xs font-bold mt-1 block">{mood}%</span>
                            </div>
                        </div>
                    )}

                    {/* CHARACTER - Center of left section */}
                    <motion.img
                        key={getCurrentSprite()?.src}
                        src={getCurrentSprite()?.src}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="h-[65vh] object-contain drop-shadow-2xl pointer-events-none"
                        alt="Fahi"
                    />
                </div>

                {/* RIGHT SECTION: Dialogue Box */}
                <div className="w-[45%] flex flex-col justify-end items-start pb-[18vh] pr-8">

                    {/* DIALOGUE BOX */}
                    {(phase === 'INTRO' || phase === 'ASK_NAME' || phase === 'TEACHING' || phase === 'QUIZ' || phase === 'TEXT_INPUT' || phase === 'FEEDBACK' || phase === 'LOADING') && (
                        <div className="w-full max-w-md">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white/95 backdrop-blur-md rounded-2xl rounded-bl-none p-5 shadow-2xl border-4 border-pink-300 relative"
                            >
                                {/* Speaker Name */}
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-pink-500 font-black text-base">Fahi</span>
                                    <span className="text-pink-300 text-sm">💕</span>
                                </div>

                                {/* Dialogue Text */}
                                <p className="text-slate-700 text-base leading-relaxed min-h-[60px]">
                                    {displayedText}
                                    {isTyping && <span className="animate-pulse text-pink-400">▌</span>}
                                </p>

                                {/* Advance Button */}
                                {(phase === 'INTRO' || phase === 'TEACHING') && !isTyping && (
                                    <button
                                        onClick={phase === 'INTRO' ? advanceIntro : advanceDialogue}
                                        className="absolute top-4 right-4 bg-pink-100 hover:bg-pink-200 text-pink-500 px-3 py-1 rounded-full text-xs font-bold transition-all"
                                    >
                                        ▶
                                    </button>
                                )}
                            </motion.div>

                            {/* NAME INPUT */}
                            {phase === 'ASK_NAME' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-3 flex gap-2"
                                >
                                    <input
                                        type="text"
                                        value={textInput}
                                        onChange={e => setTextInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && submitName()}
                                        placeholder="Enter your name..."
                                        className="flex-1 bg-white/90 border-2 border-pink-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:border-pink-400"
                                        autoFocus
                                    />
                                    <button
                                        onClick={submitName}
                                        disabled={!textInput.trim()}
                                        className="bg-pink-400 hover:bg-pink-500 disabled:bg-gray-300 text-white px-5 py-3 rounded-xl font-bold transition-all"
                                    >
                                        ✓
                                    </button>
                                </motion.div>
                            )}

                            {/* QUIZ OPTIONS */}
                            <AnimatePresence>
                                {phase === 'QUIZ' && segments[currentSegmentIndex] && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="mt-3 space-y-2"
                                    >
                                        {segments[currentSegmentIndex].options.map((option, i) => (
                                            <motion.button
                                                key={i}
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                onClick={() => handleAnswer(option)}
                                                className="w-full bg-white hover:bg-pink-50 border-2 border-pink-200 hover:border-pink-400 p-3 rounded-xl text-left font-medium text-slate-700 text-sm transition-all active:scale-98"
                                            >
                                                {option}
                                            </motion.button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* TEXT INPUT FOR QUESTIONS */}
                            {phase === 'TEXT_INPUT' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-3 flex gap-2"
                                >
                                    <input
                                        type="text"
                                        value={textInput}
                                        onChange={e => setTextInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleTextSubmit()}
                                        placeholder="Type your answer..."
                                        className="flex-1 bg-white/90 border-2 border-pink-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:border-pink-400"
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleTextSubmit}
                                        disabled={!textInput.trim()}
                                        className="bg-pink-400 hover:bg-pink-500 disabled:bg-gray-300 text-white px-5 py-3 rounded-xl font-bold transition-all"
                                    >
                                        Send
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Back Button - Top Left */}
            <button
                onClick={handleExit}
                className="absolute top-4 left-4 z-50 bg-black/40 hover:bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-white font-bold text-sm transition-all border border-white/20"
            >
                ← Exit
            </button>

            {/* SETUP MODAL */}
            <AnimatePresence>
                {phase === 'SETUP' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white border-4 border-pink-300 p-6 rounded-2xl max-w-md w-[90%] shadow-2xl"
                        >
                            <label className="block text-sm font-bold text-slate-700 mb-1">What do you want to learn?</label>
                            <input
                                className="w-full p-3 rounded-xl border-2 border-pink-200 mb-4 focus:outline-none focus:border-pink-400 text-slate-700"
                                placeholder="e.g., Photosynthesis, JavaScript..."
                                value={topic}
                                onChange={e => setTopic(e.target.value)}
                                autoFocus
                            />

                            <label className="block text-sm font-bold text-slate-700 mb-1">Any notes or goals? (Optional)</label>
                            <textarea
                                className="w-full p-3 rounded-xl border-2 border-pink-200 mb-4 h-20 focus:outline-none focus:border-pink-400 text-slate-700 resize-none"
                                placeholder="Paste notes here..."
                                value={goals}
                                onChange={e => setGoals(e.target.value)}
                            />

                            <button
                                onClick={handleStart}
                                disabled={!topic.trim()}
                                className="w-full py-3 bg-pink-400 hover:bg-pink-500 disabled:bg-gray-300 text-white font-bold rounded-xl transition-all"
                            >
                                Let's Study! 💕
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
                            className="text-center p-8"
                        >
                            <h1 className="text-5xl font-black text-white mb-4">
                                {endingType === 'GOOD' && '💖 Perfect Study Date! 💖'}
                                {endingType === 'NEUTRAL' && '📚 Study Complete!'}
                                {endingType === 'BAD' && '💔 Date Over...'}
                            </h1>
                            <p className="text-xl text-white/80 mb-6 max-w-md mx-auto">
                                {endingType === 'GOOD' && `Amazing, ${userName}! Fahi had the best time learning with you~`}
                                {endingType === 'NEUTRAL' && `Good job, ${userName}! Maybe bring flowers next time?`}
                                {endingType === 'BAD' && `Fahi got too frustrated and left... Try again, ${userName}?`}
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-white text-pink-500 px-8 py-3 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-xl"
                            >
                                Play Again
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

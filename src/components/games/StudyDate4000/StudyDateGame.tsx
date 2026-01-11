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
    requiresTextInput: boolean;
    topicName: string;
}

type GamePhase = 'INTRO' | 'ASK_NAME' | 'SETUP' | 'LOADING' | 'TEACHING' | 'QUIZ' | 'TEXT_INPUT' | 'FEEDBACK' | 'ENDING' | 'PAUSED';

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

// Intro dialogue
const INTRO_DIALOGUE = [
    { text: "Oh! Hello there~ 💕", emotion: 'happy' as FahiEmotion },
    { text: "Welcome to Study Date 4000! I'm Fahi, your personal study buddy!", emotion: 'excited' as FahiEmotion },
    { text: "*adjusts glasses* I'll help you learn anything you want in a fun way~", emotion: 'happy-neutral' as FahiEmotion },
    { text: "But first... what should I call you?", emotion: 'shy' as FahiEmotion }
];

const TEXT_INPUT_LIMIT = 150;

export default function StudyDateGame() {
    // Core State
    const [phase, setPhase] = useState<GamePhase>('INTRO');
    const [previousPhase, setPreviousPhase] = useState<GamePhase>('INTRO');
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

    // Animation State
    const [explainFrame, setExplainFrame] = useState(0);

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
        }, 20);

        return () => clearInterval(interval);
    }, [currentText]);

    const getCurrentSprite = () => {
        if (phase === 'TEACHING') {
            return explainFrame === 0 ? SPRITES['explaining'] : SPRITES['explaining2'];
        }
        return SPRITES[emotion] || SPRITES['happy-neutral'];
    };

    // Generate 14 segments (5 text-input, 9 choice-based)
    const generateSegments = (baseTopic: string): Segment[] => {
        const subtopics = [
            `Introduction to ${baseTopic}`,
            `Core Concepts of ${baseTopic}`,
            `${baseTopic} Fundamentals`,
            `Understanding ${baseTopic} Basics`,
            `${baseTopic} Key Principles`,
            `Advanced ${baseTopic} Concepts`,
            `${baseTopic} Applications`,
            `${baseTopic} in Practice`,
            `Real-world ${baseTopic}`,
            `${baseTopic} Deep Dive`,
            `${baseTopic} Analysis`,
            `Critical ${baseTopic} Thinking`,
            `${baseTopic} Mastery`,
            `${baseTopic} Final Review`
        ];

        // Create array of 14 items: 5 text-input (indices 0-4), 9 choice (5-13)
        const inputIndices = [1, 4, 7, 10, 13]; // Spread out text inputs

        return subtopics.map((topicName, i) => ({
            explanation: [
                `*opens notebook* Alright, let's talk about ${topicName}!`,
                `This is really important, so pay close attention~`,
                `*points at notes* The key thing to remember here is...`,
                `Got it? Let me check if you understood!`
            ],
            question: inputIndices.includes(i)
                ? `In your own words, tell me what you understand about ${topicName}:`
                : `What's the most important aspect of ${topicName}?`,
            options: inputIndices.includes(i) ? [] : [
                'Understanding the fundamentals first',
                'Memorizing without understanding',
                'Skipping to advanced topics',
                'Just guessing randomly'
            ],
            correctAnswer: inputIndices.includes(i) ? '' : 'Understanding the fundamentals first',
            requiresTextInput: inputIndices.includes(i),
            topicName
        }));
    };

    // Pause/Resume
    const togglePause = () => {
        if (phase === 'PAUSED') {
            setPhase(previousPhase);
        } else if (phase !== 'INTRO' && phase !== 'ASK_NAME' && phase !== 'SETUP' && phase !== 'ENDING') {
            setPreviousPhase(phase);
            setPhase('PAUSED');
        }
    };

    // Intro advancement
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

    // Name submission
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

        // Generate local segments for reliability
        const gameSegments = generateSegments(topic);
        setSegments(gameSegments);

        // Optional: Try to enhance with AI
        try {
            const response = await fetch('/api/study-date', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'generate_plan', topic, goals, userName })
            });

            const result = await response.json();

            if (result.success && result.data?.length > 0) {
                // Merge AI content with our structure
                const enhanced = gameSegments.map((seg, i) => {
                    if (result.data[i % result.data.length]) {
                        const aiContent = result.data[i % result.data.length];
                        return {
                            ...seg,
                            explanation: aiContent.explanation || seg.explanation,
                            question: seg.requiresTextInput ? seg.question : (aiContent.question || seg.question),
                            options: seg.requiresTextInput ? [] : (aiContent.options || seg.options),
                            correctAnswer: seg.requiresTextInput ? '' : (aiContent.correctAnswer || seg.correctAnswer)
                        };
                    }
                    return seg;
                });
                setSegments(enhanced);
            }
        } catch (error) {
            console.log('Using fallback content');
        }

        setCurrentSegmentIndex(0);
        setDialogueIndex(0);
        setExplainFrame(0);
        setCurrentText(gameSegments[0].explanation[0]);
        setPhase('TEACHING');
    };

    // Advance dialogue
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
            setExplainFrame(prev => (prev + 1) % 2);
        } else {
            setCurrentText(segment.question);
            setEmotion('happy-neutral');
            setPhase(segment.requiresTextInput ? 'TEXT_INPUT' : 'QUIZ');
        }
    };

    // Handle choice answer
    const handleAnswer = async (answer: string) => {
        const segment = segments[currentSegmentIndex];
        if (!segment) return;

        setPhase('FEEDBACK');
        const isCorrect = answer === segment.correctAnswer;

        if (isCorrect) {
            setCurrentText(`*happy* Great job, ${userName}! That's exactly right! 💕`);
            setEmotion('happy');
            setMood(prev => Math.min(100, prev + 5));
            setProgress(prev => Math.min(100, prev + (100 / segments.length)));
        } else {
            setCurrentText(`*sighs* Not quite, ${userName}... Let me explain that again.`);
            setEmotion('disappointed');
            setMood(prev => Math.max(0, prev - 10));
        }

        setTimeout(() => {
            if (mood <= 10) {
                setEndingType('BAD');
                setPhase('ENDING');
                return;
            }

            if (isCorrect) {
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
            } else {
                setDialogueIndex(0);
                setExplainFrame(0);
                setCurrentText(segment.explanation[0]);
                setPhase('TEACHING');
            }
        }, 2000);
    };

    // Handle text input
    const handleTextSubmit = () => {
        if (!textInput.trim()) return;

        setPhase('FEEDBACK');
        setCurrentText(`*thinking* Hmm, interesting perspective, ${userName}!`);
        setEmotion('neutral');

        setTimeout(() => {
            setCurrentText(`I like how you explained that! 💕`);
            setEmotion('happy');
            setMood(prev => Math.min(100, prev + 3));
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
            }, 1500);
        }, 1500);

        setTextInput('');
    };

    const handleExit = () => window.history.back();

    // Get topic lists for pause menu
    const coveredTopics = segments.slice(0, currentSegmentIndex).map(s => s.topicName);
    const currentTopic = segments[currentSegmentIndex]?.topicName || '';
    const upcomingTopics = segments.slice(currentSegmentIndex + 1).map(s => s.topicName);

    return (
        <div className="fixed inset-0 w-screen h-screen overflow-hidden font-sans select-none bg-black">

            {/* BACKGROUND */}
            <img src={bgImg.src} className="absolute inset-0 w-full h-full object-cover" alt="Background" />

            {/* TABLE */}
            <div className="absolute bottom-0 left-0 right-0 h-[22vh] z-10">
                <img src={tableImg.src} className="w-full h-full object-cover object-top" alt="Table" />
            </div>

            {/* MAIN LAYOUT - Centered with compact spacing */}
            <div className="absolute inset-0 z-20 flex items-center justify-center">

                {/* Content Container - Centered */}
                <div className="flex items-end gap-4" style={{ marginBottom: '8vh' }}>

                    {/* LEFT: Progress Bars */}
                    {phase !== 'INTRO' && phase !== 'ASK_NAME' && phase !== 'SETUP' && phase !== 'PAUSED' && (
                        <div className="flex flex-col gap-3 mb-8">
                            <div className="text-center">
                                <span className="text-white text-[10px] font-bold drop-shadow-lg block mb-1">CC</span>
                                <div className="h-28 w-6 bg-black/50 backdrop-blur-sm rounded-full p-0.5 border border-white/30">
                                    <div className="h-full w-full rounded-full bg-white/10 relative overflow-hidden">
                                        <motion.div
                                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-500 to-cyan-300 rounded-full"
                                            animate={{ height: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                                <span className="text-white text-[10px] font-bold">{Math.round(progress)}%</span>
                            </div>
                            <div className="text-center">
                                <span className="text-white text-[10px] font-bold drop-shadow-lg block mb-1">💕</span>
                                <div className="h-28 w-6 bg-black/50 backdrop-blur-sm rounded-full p-0.5 border border-white/30">
                                    <div className="h-full w-full rounded-full bg-white/10 relative overflow-hidden">
                                        <motion.div
                                            className={`absolute bottom-0 left-0 right-0 rounded-full ${mood >= 70 ? 'bg-gradient-to-t from-pink-500 to-pink-300' :
                                                    mood >= 40 ? 'bg-gradient-to-t from-yellow-500 to-yellow-300' :
                                                        'bg-gradient-to-t from-red-600 to-red-400'
                                                }`}
                                            animate={{ height: `${mood}%` }}
                                        />
                                    </div>
                                </div>
                                <span className="text-white text-[10px] font-bold">{mood}%</span>
                            </div>
                        </div>
                    )}

                    {/* CENTER: FAHI - Scaled up by 0.5 */}
                    <motion.img
                        key={getCurrentSprite()?.src}
                        src={getCurrentSprite()?.src}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="h-[70vh] object-contain drop-shadow-2xl pointer-events-none"
                        style={{ transform: 'scale(1.15)' }}
                        alt="Fahi"
                    />

                    {/* RIGHT: Dialogue Box - Compact */}
                    {(phase === 'INTRO' || phase === 'ASK_NAME' || phase === 'TEACHING' || phase === 'QUIZ' || phase === 'TEXT_INPUT' || phase === 'FEEDBACK' || phase === 'LOADING') && (
                        <div className="w-80 mb-8">
                            <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white/95 backdrop-blur-md rounded-xl rounded-bl-none py-4 px-5 shadow-2xl border-3 border-pink-300 relative"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-pink-500 font-black text-sm">Fahi</span>
                                    <span className="text-pink-300 text-xs">💕</span>
                                </div>
                                <p className="text-slate-700 text-sm leading-relaxed min-h-[45px]">
                                    {displayedText}
                                    {isTyping && <span className="animate-pulse text-pink-400">▌</span>}
                                </p>

                                {(phase === 'INTRO' || phase === 'TEACHING') && !isTyping && (
                                    <button
                                        onClick={phase === 'INTRO' ? advanceIntro : advanceDialogue}
                                        className="absolute top-3 right-3 bg-pink-100 hover:bg-pink-200 text-pink-500 w-6 h-6 rounded-full text-xs font-bold transition-all flex items-center justify-center"
                                    >
                                        ▶
                                    </button>
                                )}
                            </motion.div>

                            {/* NAME INPUT */}
                            {phase === 'ASK_NAME' && (
                                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-2 flex gap-2">
                                    <input
                                        type="text"
                                        value={textInput}
                                        onChange={e => setTextInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && submitName()}
                                        placeholder="Your name..."
                                        className="flex-1 bg-white/90 border-2 border-pink-200 rounded-lg px-3 py-2 text-slate-700 text-sm font-medium focus:outline-none focus:border-pink-400"
                                        autoFocus
                                    />
                                    <button
                                        onClick={submitName}
                                        disabled={!textInput.trim()}
                                        className="bg-pink-400 hover:bg-pink-500 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all"
                                    >
                                        ✓
                                    </button>
                                </motion.div>
                            )}

                            {/* QUIZ OPTIONS */}
                            <AnimatePresence>
                                {phase === 'QUIZ' && segments[currentSegmentIndex] && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2 space-y-1.5">
                                        {segments[currentSegmentIndex].options.map((option, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleAnswer(option)}
                                                className="w-full bg-white hover:bg-pink-50 border border-pink-200 hover:border-pink-400 p-2 rounded-lg text-left font-medium text-slate-700 text-xs transition-all"
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* TEXT INPUT */}
                            {phase === 'TEXT_INPUT' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2">
                                    <div className="relative">
                                        <textarea
                                            value={textInput}
                                            onChange={e => setTextInput(e.target.value.slice(0, TEXT_INPUT_LIMIT))}
                                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleTextSubmit()}
                                            placeholder="Type your answer..."
                                            maxLength={TEXT_INPUT_LIMIT}
                                            className="w-full bg-white/90 border-2 border-pink-200 rounded-lg px-3 py-2 text-slate-700 text-sm font-medium focus:outline-none focus:border-pink-400 resize-none h-16"
                                            autoFocus
                                        />
                                        <span className="absolute bottom-1 right-2 text-[10px] text-gray-400">
                                            {textInput.length}/{TEXT_INPUT_LIMIT}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleTextSubmit}
                                        disabled={!textInput.trim()}
                                        className="w-full mt-1.5 bg-pink-400 hover:bg-pink-500 disabled:bg-gray-300 text-white py-2 rounded-lg font-bold text-sm transition-all"
                                    >
                                        Send
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* TOP RIGHT: Pause & Exit Buttons */}
            <div className="absolute top-4 right-4 z-50 flex flex-col gap-2">
                {phase !== 'INTRO' && phase !== 'ASK_NAME' && phase !== 'SETUP' && phase !== 'ENDING' && (
                    <button
                        onClick={togglePause}
                        className="bg-black/50 hover:bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg text-white font-bold text-sm transition-all border border-white/20"
                    >
                        {phase === 'PAUSED' ? '▶ Resume' : '⏸ Pause'}
                    </button>
                )}
                <button
                    onClick={handleExit}
                    className="bg-red-500/80 hover:bg-red-600 backdrop-blur-sm px-4 py-2 rounded-lg text-white font-bold text-sm transition-all border border-white/20"
                >
                    ✕ Exit
                </button>
            </div>

            {/* PAUSE MENU */}
            <AnimatePresence>
                {phase === 'PAUSED' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="bg-white/95 rounded-2xl p-6 max-w-lg w-[90%] shadow-2xl border-4 border-pink-300"
                        >
                            <h2 className="text-2xl font-black text-pink-500 mb-4 text-center">⏸ Game Paused</h2>

                            <div className="mb-4">
                                <h3 className="text-sm font-bold text-slate-700 mb-1">📍 Current Topic:</h3>
                                <p className="text-pink-500 font-medium text-sm bg-pink-50 rounded-lg p-2">{currentTopic}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-700 mb-1">✅ Covered ({coveredTopics.length})</h3>
                                    <div className="bg-green-50 rounded-lg p-2 h-32 overflow-y-auto">
                                        {coveredTopics.length === 0 ? (
                                            <p className="text-gray-400 text-xs">None yet</p>
                                        ) : (
                                            coveredTopics.map((t, i) => (
                                                <p key={i} className="text-green-600 text-xs mb-0.5">• {t}</p>
                                            ))
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-700 mb-1">📋 Upcoming ({upcomingTopics.length})</h3>
                                    <div className="bg-blue-50 rounded-lg p-2 h-32 overflow-y-auto">
                                        {upcomingTopics.map((t, i) => (
                                            <p key={i} className="text-blue-600 text-xs mb-0.5">• {t}</p>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={togglePause}
                                    className="flex-1 bg-pink-400 hover:bg-pink-500 text-white py-3 rounded-xl font-bold transition-all"
                                >
                                    ▶ Resume
                                </button>
                                <button
                                    onClick={handleExit}
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-slate-700 py-3 rounded-xl font-bold transition-all"
                                >
                                    Exit Game
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SETUP MODAL */}
            <AnimatePresence>
                {phase === 'SETUP' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white border-4 border-pink-300 p-5 rounded-2xl max-w-sm w-[90%] shadow-2xl">
                            <label className="block text-sm font-bold text-slate-700 mb-1">What do you want to learn?</label>
                            <input
                                className="w-full p-2.5 rounded-lg border-2 border-pink-200 mb-3 focus:outline-none focus:border-pink-400 text-slate-700 text-sm"
                                placeholder="e.g., Photosynthesis, JavaScript..."
                                value={topic}
                                onChange={e => setTopic(e.target.value)}
                                autoFocus
                            />
                            <label className="block text-sm font-bold text-slate-700 mb-1">Notes? (Optional)</label>
                            <textarea
                                className="w-full p-2.5 rounded-lg border-2 border-pink-200 mb-3 h-16 focus:outline-none focus:border-pink-400 text-slate-700 text-sm resize-none"
                                placeholder="Paste notes..."
                                value={goals}
                                onChange={e => setGoals(e.target.value)}
                            />
                            <button
                                onClick={handleStart}
                                disabled={!topic.trim()}
                                className="w-full py-2.5 bg-pink-400 hover:bg-pink-500 disabled:bg-gray-300 text-white font-bold rounded-lg transition-all text-sm"
                            >
                                Let's Study! 💕
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ENDING */}
            <AnimatePresence>
                {phase === 'ENDING' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 flex items-center justify-center bg-black/80">
                        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center p-6">
                            <h1 className="text-4xl font-black text-white mb-3">
                                {endingType === 'GOOD' && '💖 Perfect Study Date! 💖'}
                                {endingType === 'NEUTRAL' && '📚 Study Complete!'}
                                {endingType === 'BAD' && '💔 Date Over...'}
                            </h1>
                            <p className="text-lg text-white/80 mb-5 max-w-sm mx-auto">
                                {endingType === 'GOOD' && `Amazing, ${userName}! Fahi had the best time~`}
                                {endingType === 'NEUTRAL' && `Good job, ${userName}! Maybe next time?`}
                                {endingType === 'BAD' && `Fahi left... Try again, ${userName}?`}
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-white text-pink-500 px-6 py-2.5 rounded-full font-bold hover:scale-105 transition-all shadow-xl"
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

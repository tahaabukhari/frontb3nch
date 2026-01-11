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

const INTRO_DIALOGUE = [
    { text: "Hey there! Welcome to Study Date 4000.", emotion: 'happy' as FahiEmotion },
    { text: "I'm Fahi, your study buddy. I'll help you learn any topic you want!", emotion: 'excited' as FahiEmotion },
    { text: "We'll go through the material step by step, and I'll quiz you along the way.", emotion: 'happy-neutral' as FahiEmotion },
    { text: "First, what's your name?", emotion: 'neutral' as FahiEmotion }
];

const TEXT_INPUT_LIMIT = 150;

// Star particle component - appears above head like frustration
const StarBurst = ({ show }: { show: boolean }) => {
    if (!show) return null;
    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0] }}
            transition={{ duration: 1 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
            <div className="relative">
                {[...Array(5)].map((_, i) => (
                    <motion.span
                        key={i}
                        initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
                        animate={{
                            scale: [0, 1, 0.8],
                            opacity: [1, 1, 0],
                            x: Math.cos((i * 72 - 90) * Math.PI / 180) * 40,
                            y: Math.sin((i * 72 - 90) * Math.PI / 180) * 40
                        }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="absolute text-2xl"
                        style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                    >
                        ⭐
                    </motion.span>
                ))}
                <span className="text-4xl">✨</span>
            </div>
        </motion.div>
    );
};

// Frustration effect - appears above head
const FrustrationEffect = ({ show }: { show: boolean }) => {
    if (!show) return null;
    return (
        <motion.div
            initial={{ scale: 0, opacity: 0, y: 0 }}
            animate={{ scale: [0, 1.5, 1.2], opacity: [0, 1, 0], y: -30 }}
            transition={{ duration: 0.8 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 z-50 text-5xl pointer-events-none"
        >
            💢
        </motion.div>
    );
};

export default function StudyDateGame() {
    const [phase, setPhase] = useState<GamePhase>('INTRO');
    const [previousPhase, setPreviousPhase] = useState<GamePhase>('INTRO');
    const [mood, setMood] = useState(70);
    const [progress, setProgress] = useState(0);
    const [userName, setUserName] = useState('');

    const [introIndex, setIntroIndex] = useState(0);
    const [segments, setSegments] = useState<Segment[]>([]);
    const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
    const [dialogueIndex, setDialogueIndex] = useState(0);
    const [currentText, setCurrentText] = useState(INTRO_DIALOGUE[0].text);
    const [emotion, setEmotion] = useState<FahiEmotion>(INTRO_DIALOGUE[0].emotion);
    const [endingType, setEndingType] = useState<'GOOD' | 'NEUTRAL' | 'BAD' | null>(null);

    const [topic, setTopic] = useState('');
    const [goals, setGoals] = useState('');
    const [textInput, setTextInput] = useState('');
    const [explainFrame, setExplainFrame] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // Effect states
    const [showStars, setShowStars] = useState(false);
    const [showFrustration, setShowFrustration] = useState(false);

    // Responsive
    const [isMobile, setIsMobile] = useState(false);
    const [screenSize, setScreenSize] = useState<'sm' | 'md' | 'lg'>('md');

    useEffect(() => {
        const check = () => {
            const w = window.innerWidth;
            setIsMobile(w < 768);
            setScreenSize(w < 768 ? 'sm' : w < 1280 ? 'md' : 'lg');
        };
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // Responsive sizing helper
    const getSize = (sm: number, md: number, lg: number) => {
        return screenSize === 'sm' ? sm : screenSize === 'md' ? md : lg;
    };

    // Typewriter - Fixed index bug
    useEffect(() => {
        if (!currentText) { setDisplayedText(''); return; }
        setIsTyping(true);
        setDisplayedText('');
        let charIndex = 0;
        const textToType = currentText;

        const interval = setInterval(() => {
            if (charIndex < textToType.length) {
                setDisplayedText(textToType.substring(0, charIndex + 1));
                charIndex++;
            } else {
                setIsTyping(false);
                clearInterval(interval);
            }
        }, 20);
        return () => clearInterval(interval);
    }, [currentText]);

    const getCurrentSprite = () => {
        if (phase === 'TEACHING') return explainFrame === 0 ? SPRITES['explaining'] : SPRITES['explaining2'];
        return SPRITES[emotion] || SPRITES['happy-neutral'];
    };

    const generateSegments = (baseTopic: string): Segment[] => {
        const subtopics = [
            `Introduction to ${baseTopic}`, `Core Concepts of ${baseTopic}`, `${baseTopic} Fundamentals`,
            `Understanding ${baseTopic} Basics`, `${baseTopic} Key Principles`, `Advanced ${baseTopic} Concepts`,
            `${baseTopic} Applications`, `${baseTopic} in Practice`, `Real-world ${baseTopic}`,
            `${baseTopic} Deep Dive`, `${baseTopic} Analysis`, `Critical ${baseTopic} Thinking`,
            `${baseTopic} Mastery`, `${baseTopic} Final Review`
        ];
        const inputIndices = [1, 4, 7, 10, 13];
        return subtopics.map((topicName, i) => ({
            explanation: [
                `Let's learn about ${topicName}.`,
                `This is an important concept you'll want to understand well.`,
                `The key point here is to focus on the fundamentals first.`,
                `Alright, let me check if you got that!`
            ],
            question: inputIndices.includes(i)
                ? `In your own words, explain what you understand about ${topicName}:`
                : `What's the most important aspect of ${topicName}?`,
            options: inputIndices.includes(i) ? [] : [
                'Understanding the fundamentals first', 'Memorizing without understanding',
                'Skipping to advanced topics', 'Just guessing randomly'
            ],
            correctAnswer: inputIndices.includes(i) ? '' : 'Understanding the fundamentals first',
            requiresTextInput: inputIndices.includes(i),
            topicName
        }));
    };

    const togglePause = () => {
        if (phase === 'PAUSED') setPhase(previousPhase);
        else if (!['INTRO', 'ASK_NAME', 'SETUP', 'ENDING'].includes(phase)) {
            setPreviousPhase(phase);
            setPhase('PAUSED');
        }
    };

    const advanceIntro = () => {
        if (isTyping) { setDisplayedText(currentText); setIsTyping(false); return; }
        const next = introIndex + 1;
        if (next < INTRO_DIALOGUE.length) {
            setIntroIndex(next);
            setCurrentText(INTRO_DIALOGUE[next].text);
            setEmotion(INTRO_DIALOGUE[next].emotion);
        } else setPhase('ASK_NAME');
    };

    const submitName = () => {
        if (!textInput.trim()) return;
        setUserName(textInput.trim());
        setTextInput('');
        setCurrentText(`Great to meet you, ${textInput.trim()}! What topic would you like to learn today?`);
        setEmotion('happy');
        setTimeout(() => setPhase('SETUP'), 100);
    };

    const handleStart = async () => {
        if (!topic.trim()) return;
        setPhase('LOADING');
        setCurrentText(`${topic}! Great choice, ${userName}. Let me prepare the lesson...`);
        setEmotion('excited');
        const gameSegments = generateSegments(topic);
        setSegments(gameSegments);

        try {
            const response = await fetch('/api/study-date', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'generate_plan', topic, goals, userName })
            });
            const result = await response.json();
            if (result.success && result.data?.length > 0) {
                const enhanced = gameSegments.map((seg, i) => {
                    const ai = result.data[i % result.data.length];
                    return ai ? {
                        ...seg, explanation: ai.explanation || seg.explanation,
                        question: seg.requiresTextInput ? seg.question : (ai.question || seg.question),
                        options: seg.requiresTextInput ? [] : (ai.options || seg.options),
                        correctAnswer: seg.requiresTextInput ? '' : (ai.correctAnswer || seg.correctAnswer)
                    } : seg;
                });
                setSegments(enhanced);
            }
        } catch (e) { console.log('Using fallback'); }

        setCurrentSegmentIndex(0);
        setDialogueIndex(0);
        setExplainFrame(0);
        setCurrentText(gameSegments[0].explanation[0]);
        setPhase('TEACHING');
    };

    const advanceDialogue = () => {
        if (isTyping) { setDisplayedText(currentText); setIsTyping(false); return; }
        const segment = segments[currentSegmentIndex];
        if (!segment) return;
        const next = dialogueIndex + 1;
        if (next < segment.explanation.length) {
            setDialogueIndex(next);
            setCurrentText(segment.explanation[next]);
            setExplainFrame(prev => (prev + 1) % 2);
        } else {
            setCurrentText(segment.question);
            setEmotion('happy-neutral');
            setPhase(segment.requiresTextInput ? 'TEXT_INPUT' : 'QUIZ');
        }
    };

    const handleAnswer = (answer: string) => {
        const segment = segments[currentSegmentIndex];
        if (!segment) return;
        setPhase('FEEDBACK');
        const isCorrect = answer === segment.correctAnswer;

        if (isCorrect) {
            setCurrentText(`Correct, ${userName}! That's exactly right.`);
            setEmotion('happy');
            setMood(prev => Math.min(100, prev + 5));
            setProgress(prev => Math.min(100, prev + (100 / segments.length)));
            setShowStars(true);
            setTimeout(() => setShowStars(false), 1000);
        } else {
            setCurrentText(`Not quite, ${userName}. Let me go over that again.`);
            setEmotion('disappointed');
            setMood(prev => Math.max(0, prev - 10));
            setShowFrustration(true);
            setTimeout(() => setShowFrustration(false), 1000);
        }

        setTimeout(() => {
            if (mood <= 10) { setEndingType('BAD'); setPhase('ENDING'); return; }
            if (isCorrect) {
                const next = currentSegmentIndex + 1;
                if (next >= segments.length) {
                    setEndingType(mood >= 90 ? 'GOOD' : 'NEUTRAL');
                    setPhase('ENDING');
                } else {
                    setCurrentSegmentIndex(next);
                    setDialogueIndex(0);
                    setExplainFrame(0);
                    setCurrentText(segments[next].explanation[0]);
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

    const handleTextSubmit = () => {
        if (!textInput.trim()) return;
        setPhase('FEEDBACK');
        setCurrentText(`Good answer, ${userName}. Let me review that.`);
        setEmotion('neutral');
        setShowStars(true);
        setTimeout(() => setShowStars(false), 1000);

        setTimeout(() => {
            setCurrentText(`Nice explanation! Let's move on to the next topic.`);
            setEmotion('happy');
            setMood(prev => Math.min(100, prev + 3));
            setProgress(prev => Math.min(100, prev + (100 / segments.length)));

            setTimeout(() => {
                const next = currentSegmentIndex + 1;
                if (next >= segments.length) { setEndingType(mood >= 90 ? 'GOOD' : 'NEUTRAL'); setPhase('ENDING'); }
                else {
                    setCurrentSegmentIndex(next);
                    setDialogueIndex(0);
                    setExplainFrame(0);
                    setCurrentText(segments[next].explanation[0]);
                    setPhase('TEACHING');
                }
            }, 1500);
        }, 1500);
        setTextInput('');
    };

    const handleExit = () => window.history.back();
    const coveredTopics = segments.slice(0, currentSegmentIndex).map(s => s.topicName);
    const currentTopic = segments[currentSegmentIndex]?.topicName || '';
    const upcomingTopics = segments.slice(currentSegmentIndex + 1).map(s => s.topicName);

    const showUI = ['INTRO', 'ASK_NAME', 'TEACHING', 'QUIZ', 'TEXT_INPUT', 'FEEDBACK', 'LOADING'].includes(phase);
    const showBars = !['INTRO', 'ASK_NAME', 'SETUP', 'PAUSED', 'ENDING'].includes(phase);

    return (
        <div className="fixed inset-0 w-screen h-screen overflow-hidden font-sans select-none bg-black">
            {/* BACKGROUND */}
            <img src={bgImg.src} className="absolute inset-0 w-full h-full object-cover" alt="Background" />

            {/* TABLE */}
            <div className="absolute bottom-0 left-0 right-0 z-10" style={{ height: isMobile ? '18vh' : '20vh' }}>
                <img src={tableImg.src} className="w-full h-full object-cover object-top" alt="Table" />
            </div>

            {/* FAHI - Centered (mobile: lower with 20px gap to textbox) */}
            <div
                className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
                style={{ paddingBottom: isMobile ? '25vh' : '5vh', marginTop: isMobile ? '80px' : '0' }}
            >
                <div className="relative">
                    <motion.img
                        key={getCurrentSprite()?.src}
                        src={getCurrentSprite()?.src}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="object-contain drop-shadow-2xl"
                        style={{
                            height: isMobile ? '40vh' : '65vh',
                            transform: 'scale(1.25)'
                        }}
                        alt="Fahi"
                    />
                    {/* Effects on Fahi */}
                    <StarBurst show={showStars} />
                    <FrustrationEffect show={showFrustration} />
                </div>
            </div>

            {/* BARS - Left of center (Desktop) */}
            {showBars && !isMobile && (
                <div
                    className="absolute z-30 flex flex-col"
                    style={{
                        left: 'calc(50% - 280px)',
                        bottom: '30vh',
                        gap: `${getSize(12, 16, 20)}px`
                    }}
                >
                    <div className="text-center">
                        <span className="text-white font-bold drop-shadow-lg block mb-1" style={{ fontSize: `${getSize(11, 13, 16)}px` }}>CC</span>
                        <div
                            className="bg-black/50 backdrop-blur-sm rounded-full border border-white/30"
                            style={{ height: `${getSize(90, 110, 140)}px`, width: `${getSize(20, 24, 30)}px`, padding: '2px' }}
                        >
                            <div className="h-full w-full rounded-full bg-white/10 relative overflow-hidden">
                                <motion.div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-500 to-cyan-300 rounded-full" animate={{ height: `${progress}%` }} />
                            </div>
                        </div>
                        <span className="text-white font-bold" style={{ fontSize: `${getSize(10, 12, 14)}px` }}>{Math.round(progress)}%</span>
                    </div>
                    <div className="text-center">
                        <span className="text-white font-bold drop-shadow-lg block mb-1" style={{ fontSize: `${getSize(11, 13, 16)}px` }}>💕</span>
                        <div
                            className="bg-black/50 backdrop-blur-sm rounded-full border border-white/30"
                            style={{ height: `${getSize(90, 110, 140)}px`, width: `${getSize(20, 24, 30)}px`, padding: '2px' }}
                        >
                            <div className="h-full w-full rounded-full bg-white/10 relative overflow-hidden">
                                <motion.div
                                    className={`absolute bottom-0 left-0 right-0 rounded-full ${mood >= 70 ? 'bg-gradient-to-t from-pink-500 to-pink-300' : mood >= 40 ? 'bg-gradient-to-t from-yellow-500 to-yellow-300' : 'bg-gradient-to-t from-red-600 to-red-400'}`}
                                    animate={{ height: `${mood}%` }}
                                />
                            </div>
                        </div>
                        <span className="text-white font-bold" style={{ fontSize: `${getSize(10, 12, 14)}px` }}>{mood}%</span>
                    </div>
                </div>
            )}

            {/* Mobile Bars - Top of screen above Fahi */}
            {showBars && isMobile && (
                <div className="absolute top-16 left-4 right-4 z-30 flex justify-center gap-4">
                    <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-2">
                        <span className="text-white text-xs font-bold">CC</span>
                        <div className="w-20 h-3 bg-white/20 rounded-full overflow-hidden">
                            <motion.div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 rounded-full" animate={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-white text-xs font-bold">{Math.round(progress)}%</span>
                    </div>
                    <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-2">
                        <span className="text-sm">💕</span>
                        <div className="w-20 h-3 bg-white/20 rounded-full overflow-hidden">
                            <motion.div className={`h-full rounded-full ${mood >= 70 ? 'bg-gradient-to-r from-pink-500 to-pink-300' : mood >= 40 ? 'bg-gradient-to-r from-yellow-500 to-yellow-300' : 'bg-gradient-to-r from-red-600 to-red-400'}`} animate={{ width: `${mood}%` }} />
                        </div>
                        <span className="text-white text-xs font-bold">{mood}%</span>
                    </div>
                </div>
            )}

            {/* DIALOGUE BOX - Desktop: Left side, Mobile: Bottom under Fahi with 20px gap */}
            {showUI && (
                <div
                    className={`absolute z-30 ${isMobile ? 'left-3 right-3' : ''}`}
                    style={isMobile ? { bottom: '20px' } : {
                        left: 'calc(50% - 520px)',
                        bottom: '30vh',
                        width: `${getSize(300, 340, 400)}px`
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, x: isMobile ? 0 : 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/95 backdrop-blur-md rounded-xl rounded-bl-none shadow-2xl border-2 border-pink-300 relative"
                        style={{ padding: isMobile ? '14px 16px' : `${getSize(18, 20, 24)}px ${getSize(20, 24, 28)}px` }}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-pink-500 font-black" style={{ fontSize: `${getSize(14, 18, 22)}px` }}>Fahi</span>
                            <span className="text-pink-300" style={{ fontSize: `${getSize(12, 14, 16)}px` }}>💕</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed" style={{ fontSize: `${getSize(14, 17, 20)}px`, minHeight: `${getSize(45, 60, 75)}px` }}>
                            {displayedText}
                            {isTyping && <span className="animate-pulse text-pink-400">▌</span>}
                        </p>

                        {(phase === 'INTRO' || phase === 'TEACHING') && !isTyping && (
                            <button
                                onClick={phase === 'INTRO' ? advanceIntro : advanceDialogue}
                                className="absolute top-3 right-3 bg-pink-100 hover:bg-pink-200 text-pink-500 rounded-full font-bold transition-all flex items-center justify-center"
                                style={{ width: `${getSize(26, 32, 38)}px`, height: `${getSize(26, 32, 38)}px`, fontSize: `${getSize(12, 14, 16)}px` }}
                            >
                                ▶
                            </button>
                        )}
                    </motion.div>

                    {/* NAME INPUT */}
                    {phase === 'ASK_NAME' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 flex gap-2">
                            <input
                                type="text"
                                value={textInput}
                                onChange={e => setTextInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && submitName()}
                                placeholder="Your name..."
                                className="flex-1 bg-white border-2 border-pink-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:border-pink-400"
                                style={{ padding: `${getSize(10, 12, 14)}px ${getSize(12, 16, 18)}px`, fontSize: `${getSize(14, 16, 18)}px` }}
                                autoFocus
                            />
                            <button onClick={submitName} disabled={!textInput.trim()}
                                className="bg-pink-400 hover:bg-pink-500 disabled:bg-gray-300 text-white rounded-lg font-bold transition-all"
                                style={{ padding: `${getSize(10, 12, 14)}px ${getSize(14, 18, 22)}px`, fontSize: `${getSize(14, 16, 18)}px` }}>
                                ✓
                            </button>
                        </motion.div>
                    )}

                    {/* QUIZ OPTIONS - Only show in main dialogue box on mobile */}
                    <AnimatePresence>
                        {phase === 'QUIZ' && segments[currentSegmentIndex] && isMobile && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-3 space-y-2">
                                {segments[currentSegmentIndex].options.map((option, i) => (
                                    <button key={i} onClick={() => handleAnswer(option)}
                                        className="w-full bg-white hover:bg-pink-50 border-2 border-pink-200 hover:border-pink-400 rounded-lg text-left font-medium text-slate-700 transition-all active:scale-98"
                                        style={{ padding: `${getSize(10, 12, 14)}px ${getSize(12, 16, 18)}px`, fontSize: `${getSize(13, 15, 17)}px` }}>
                                        {option}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* TEXT INPUT */}
                    {phase === 'TEXT_INPUT' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
                            <div className="relative">
                                <textarea
                                    value={textInput}
                                    onChange={e => setTextInput(e.target.value.slice(0, TEXT_INPUT_LIMIT))}
                                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleTextSubmit()}
                                    placeholder="Type your answer..."
                                    maxLength={TEXT_INPUT_LIMIT}
                                    className="w-full bg-white border-2 border-pink-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:border-pink-400 resize-none"
                                    style={{ padding: `${getSize(10, 12, 14)}px ${getSize(12, 16, 18)}px`, fontSize: `${getSize(13, 15, 17)}px`, height: `${getSize(60, 70, 85)}px` }}
                                    autoFocus
                                />
                                <span className="absolute bottom-2 right-3 text-gray-400" style={{ fontSize: `${getSize(10, 11, 12)}px` }}>{textInput.length}/{TEXT_INPUT_LIMIT}</span>
                            </div>
                            <button onClick={handleTextSubmit} disabled={!textInput.trim()}
                                className="w-full mt-2 bg-pink-400 hover:bg-pink-500 disabled:bg-gray-300 text-white rounded-lg font-bold transition-all"
                                style={{ padding: `${getSize(10, 12, 14)}px`, fontSize: `${getSize(13, 15, 17)}px` }}>
                                Send
                            </button>
                        </motion.div>
                    )}
                </div>
            )}

            {/* DESKTOP QUIZ OPTIONS - Right side panel */}
            <AnimatePresence>
                {phase === 'QUIZ' && segments[currentSegmentIndex] && !isMobile && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="absolute z-30"
                        style={{
                            right: 'calc(50% - 520px)',
                            bottom: '30vh',
                            width: `${getSize(280, 320, 380)}px`
                        }}
                    >
                        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border-2 border-pink-300 p-4">
                            <h3 className="text-pink-500 font-bold mb-3" style={{ fontSize: `${getSize(14, 16, 18)}px` }}>Choose your answer:</h3>
                            <div className="space-y-2">
                                {segments[currentSegmentIndex].options.map((option, i) => (
                                    <button key={i} onClick={() => handleAnswer(option)}
                                        className="w-full bg-white hover:bg-pink-50 border-2 border-pink-200 hover:border-pink-400 rounded-lg text-left font-medium text-slate-700 transition-all"
                                        style={{ padding: `${getSize(10, 12, 14)}px ${getSize(12, 16, 18)}px`, fontSize: `${getSize(13, 15, 17)}px` }}>
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* PAUSE BUTTON ONLY (no exit button on main screen) */}
            {!['INTRO', 'ASK_NAME', 'SETUP', 'ENDING', 'PAUSED'].includes(phase) && (
                <button
                    onClick={togglePause}
                    className="absolute top-3 right-3 z-50 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-lg text-white font-bold transition-all border border-white/20"
                    style={{
                        padding: `${getSize(8, 10, 14)}px ${getSize(12, 16, 22)}px`,
                        fontSize: `${getSize(11, 13, 16)}px`
                    }}
                >
                    ⏸ Pause
                </button>
            )}

            {/* PAUSE MENU */}
            <AnimatePresence>
                {phase === 'PAUSED' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="bg-white/95 rounded-xl shadow-2xl border-2 border-pink-300"
                            style={{
                                padding: `${getSize(16, 24, 32)}px`,
                                width: isMobile ? '90%' : `${getSize(380, 450, 520)}px`,
                                maxWidth: '90%'
                            }}
                        >
                            <h2 className="font-black text-pink-500 mb-4 text-center" style={{ fontSize: `${getSize(18, 22, 26)}px` }}>⏸ Game Paused</h2>

                            <div className="mb-4">
                                <h3 className="font-bold text-slate-700 mb-1" style={{ fontSize: `${getSize(11, 13, 15)}px` }}>📍 Current:</h3>
                                <p className="text-pink-500 font-medium bg-pink-50 rounded-lg" style={{ padding: `${getSize(6, 8, 10)}px`, fontSize: `${getSize(11, 13, 15)}px` }}>{currentTopic}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div>
                                    <h3 className="font-bold text-slate-700 mb-1" style={{ fontSize: `${getSize(10, 12, 14)}px` }}>✅ Done ({coveredTopics.length})</h3>
                                    <div className="bg-green-50 rounded-lg overflow-y-auto" style={{ padding: `${getSize(6, 8, 10)}px`, height: `${getSize(80, 100, 120)}px` }}>
                                        {coveredTopics.length === 0 ? <p className="text-gray-400" style={{ fontSize: `${getSize(10, 11, 12)}px` }}>None</p> :
                                            coveredTopics.map((t, i) => <p key={i} className="text-green-600" style={{ fontSize: `${getSize(10, 11, 12)}px`, marginBottom: '2px' }}>• {t}</p>)}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-700 mb-1" style={{ fontSize: `${getSize(10, 12, 14)}px` }}>📋 Next ({upcomingTopics.length})</h3>
                                    <div className="bg-blue-50 rounded-lg overflow-y-auto" style={{ padding: `${getSize(6, 8, 10)}px`, height: `${getSize(80, 100, 120)}px` }}>
                                        {upcomingTopics.map((t, i) => <p key={i} className="text-blue-600" style={{ fontSize: `${getSize(10, 11, 12)}px`, marginBottom: '2px' }}>• {t}</p>)}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={togglePause} className="flex-1 bg-pink-400 hover:bg-pink-500 text-white rounded-lg font-bold transition-all" style={{ padding: `${getSize(10, 12, 14)}px`, fontSize: `${getSize(13, 15, 17)}px` }}>▶ Resume</button>
                                <button onClick={handleExit} className="flex-1 bg-gray-200 hover:bg-gray-300 text-slate-700 rounded-lg font-bold transition-all" style={{ padding: `${getSize(10, 12, 14)}px`, fontSize: `${getSize(13, 15, 17)}px` }}>Exit</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SETUP MODAL - Fixed visibility */}
            <AnimatePresence>
                {phase === 'SETUP' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="bg-white border-4 border-pink-300 rounded-2xl shadow-2xl"
                            style={{ padding: `${getSize(20, 24, 32)}px`, width: isMobile ? '90%' : `${getSize(340, 400, 480)}px`, maxWidth: '90%' }}
                        >
                            <h2 className="text-pink-500 font-black text-center mb-4" style={{ fontSize: `${getSize(20, 24, 28)}px` }}>📚 What to Study?</h2>

                            <label className="block font-bold text-slate-700 mb-2" style={{ fontSize: `${getSize(13, 15, 17)}px` }}>Topic</label>
                            <input
                                className="w-full bg-pink-50 border-2 border-pink-200 rounded-xl mb-4 focus:outline-none focus:border-pink-400 text-slate-800 placeholder-slate-400"
                                style={{ padding: `${getSize(12, 14, 16)}px`, fontSize: `${getSize(14, 16, 18)}px` }}
                                placeholder="e.g., Photosynthesis, JavaScript..."
                                value={topic}
                                onChange={e => setTopic(e.target.value)}
                                autoFocus
                            />

                            <label className="block font-bold text-slate-700 mb-2" style={{ fontSize: `${getSize(13, 15, 17)}px` }}>Notes (Optional)</label>
                            <textarea
                                className="w-full bg-pink-50 border-2 border-pink-200 rounded-xl mb-4 focus:outline-none focus:border-pink-400 text-slate-800 placeholder-slate-400 resize-none"
                                style={{ padding: `${getSize(12, 14, 16)}px`, fontSize: `${getSize(14, 16, 18)}px`, height: `${getSize(70, 90, 110)}px` }}
                                placeholder="Paste your notes or learning goals here..."
                                value={goals}
                                onChange={e => setGoals(e.target.value)}
                            />

                            <button
                                onClick={handleStart}
                                disabled={!topic.trim()}
                                className="w-full bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold rounded-xl transition-all shadow-lg"
                                style={{ padding: `${getSize(14, 16, 20)}px`, fontSize: `${getSize(15, 17, 20)}px` }}
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
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center">
                            <h1 className="font-black text-white mb-3" style={{ fontSize: `${getSize(28, 40, 52)}px` }}>
                                {endingType === 'GOOD' && '💖 Perfect! 💖'}
                                {endingType === 'NEUTRAL' && '📚 Complete!'}
                                {endingType === 'BAD' && '💔 Over...'}
                            </h1>
                            <p className="text-white/80 mb-5 max-w-sm mx-auto" style={{ fontSize: `${getSize(14, 18, 22)}px` }}>
                                {endingType === 'GOOD' && `Amazing, ${userName}! Fahi had the best time~`}
                                {endingType === 'NEUTRAL' && `Good job, ${userName}! Maybe next time?`}
                                {endingType === 'BAD' && `Fahi left... Try again, ${userName}?`}
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-white text-pink-500 rounded-full font-bold hover:scale-105 transition-all shadow-xl"
                                style={{ padding: `${getSize(12, 14, 18)}px ${getSize(24, 30, 40)}px`, fontSize: `${getSize(14, 18, 22)}px` }}
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

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
    { text: "Oh! Hello there~ 💕", emotion: 'happy' as FahiEmotion },
    { text: "Welcome to Study Date 4000! I'm Fahi, your personal study buddy!", emotion: 'excited' as FahiEmotion },
    { text: "*adjusts glasses* I'll help you learn anything you want in a fun way~", emotion: 'happy-neutral' as FahiEmotion },
    { text: "But first... what should I call you?", emotion: 'shy' as FahiEmotion }
];

const TEXT_INPUT_LIMIT = 150;

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

    // Responsive check
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // Typewriter
    useEffect(() => {
        if (!currentText) { setDisplayedText(''); return; }
        setIsTyping(true);
        setDisplayedText('');
        let i = 0;
        const interval = setInterval(() => {
            if (i < currentText.length) {
                setDisplayedText(prev => prev + currentText[i]);
                i++;
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
                `*opens notebook* Alright, let's talk about ${topicName}!`,
                `This is really important, so pay close attention~`,
                `*points at notes* The key thing to remember here is...`,
                `Got it? Let me check if you understood!`
            ],
            question: inputIndices.includes(i)
                ? `In your own words, tell me what you understand about ${topicName}:`
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
        setCurrentText(`Nice to meet you, ${textInput.trim()}! 💕 So... what would you like to learn today?`);
        setEmotion('happy');
        setTimeout(() => setPhase('SETUP'), 100);
    };

    const handleStart = async () => {
        if (!topic.trim()) return;
        setPhase('LOADING');
        setCurrentText(`*excited* Ooh, ${topic}! Let me prepare something special for you, ${userName}...`);
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
        setCurrentText(`*thinking* Hmm, interesting perspective, ${userName}!`);
        setEmotion('neutral');

        setTimeout(() => {
            setCurrentText(`I like how you explained that! 💕`);
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
            <div className="absolute bottom-0 left-0 right-0 h-[20vh] z-10">
                <img src={tableImg.src} className="w-full h-full object-cover object-top" alt="Table" />
            </div>

            {/* FAHI - Centered */}
            <div className="absolute inset-0 z-20 flex items-end justify-center pointer-events-none" style={{ paddingBottom: '12vh' }}>
                <motion.img
                    key={getCurrentSprite()?.src}
                    src={getCurrentSprite()?.src}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="object-contain drop-shadow-2xl"
                    style={{
                        height: isMobile ? '50vh' : '65vh',
                        transform: 'scale(1.25)'
                    }}
                    alt="Fahi"
                />
            </div>

            {/* BARS - Left of center (100px gap) - Desktop only beside Fahi, mobile hidden during gameplay */}
            {showBars && !isMobile && (
                <div
                    className="absolute z-30 flex flex-col gap-4"
                    style={{
                        left: 'calc(50% - 280px)',
                        bottom: '30vh'
                    }}
                >
                    <div className="text-center">
                        <span className="text-white font-bold drop-shadow-lg block mb-1" style={{ fontSize: '13px' }}>CC</span>
                        <div style={{ height: '110px', width: '24px', padding: '2px' }} className="bg-black/50 backdrop-blur-sm rounded-full border border-white/30">
                            <div className="h-full w-full rounded-full bg-white/10 relative overflow-hidden">
                                <motion.div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-500 to-cyan-300 rounded-full" animate={{ height: `${progress}%` }} />
                            </div>
                        </div>
                        <span className="text-white font-bold" style={{ fontSize: '12px' }}>{Math.round(progress)}%</span>
                    </div>
                    <div className="text-center">
                        <span className="text-white font-bold drop-shadow-lg block mb-1" style={{ fontSize: '13px' }}>💕</span>
                        <div style={{ height: '110px', width: '24px', padding: '2px' }} className="bg-black/50 backdrop-blur-sm rounded-full border border-white/30">
                            <div className="h-full w-full rounded-full bg-white/10 relative overflow-hidden">
                                <motion.div
                                    className={`absolute bottom-0 left-0 right-0 rounded-full ${mood >= 70 ? 'bg-gradient-to-t from-pink-500 to-pink-300' : mood >= 40 ? 'bg-gradient-to-t from-yellow-500 to-yellow-300' : 'bg-gradient-to-t from-red-600 to-red-400'}`}
                                    animate={{ height: `${mood}%` }}
                                />
                            </div>
                        </div>
                        <span className="text-white font-bold" style={{ fontSize: '12px' }}>{mood}%</span>
                    </div>
                </div>
            )}

            {/* Mobile Bars - Top of screen */}
            {showBars && isMobile && (
                <div className="absolute top-16 left-4 right-4 z-30 flex justify-center gap-4">
                    <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                        <span className="text-white text-[10px] font-bold">CC</span>
                        <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                            <motion.div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 rounded-full" animate={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-white text-[10px]">{Math.round(progress)}%</span>
                    </div>
                    <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                        <span className="text-[10px]">💕</span>
                        <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                            <motion.div className={`h-full rounded-full ${mood >= 70 ? 'bg-gradient-to-r from-pink-500 to-pink-300' : mood >= 40 ? 'bg-gradient-to-r from-yellow-500 to-yellow-300' : 'bg-gradient-to-r from-red-600 to-red-400'}`} animate={{ width: `${mood}%` }} />
                        </div>
                        <span className="text-white text-[10px]">{mood}%</span>
                    </div>
                </div>
            )}

            {/* DIALOGUE BOX - Desktop: Right of center (100px gap), Mobile: Bottom center */}
            {showUI && (
                <div
                    className={`absolute z-30 ${isMobile ? 'bottom-4 left-4 right-4' : ''}`}
                    style={!isMobile ? {
                        right: 'calc(50% - 520px)',
                        bottom: '35vh',
                        width: '340px'
                    } : {}}
                >
                    <motion.div
                        initial={{ opacity: 0, x: isMobile ? 0 : 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/95 backdrop-blur-md rounded-xl rounded-bl-none shadow-2xl border-2 border-pink-300 relative"
                        style={{ padding: isMobile ? '14px 16px' : '20px 24px' }}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-pink-500 font-black" style={{ fontSize: isMobile ? '14px' : '18px' }}>Fahi</span>
                            <span className="text-pink-300" style={{ fontSize: isMobile ? '12px' : '14px' }}>💕</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed" style={{ fontSize: isMobile ? '14px' : '17px', minHeight: isMobile ? '45px' : '60px' }}>
                            {displayedText}
                            {isTyping && <span className="animate-pulse text-pink-400">▌</span>}
                        </p>

                        {(phase === 'INTRO' || phase === 'TEACHING') && !isTyping && (
                            <button
                                onClick={phase === 'INTRO' ? advanceIntro : advanceDialogue}
                                className="absolute top-3 right-3 bg-pink-100 hover:bg-pink-200 text-pink-500 rounded-full font-bold transition-all flex items-center justify-center"
                                style={{ width: isMobile ? '26px' : '32px', height: isMobile ? '26px' : '32px', fontSize: isMobile ? '12px' : '14px' }}
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
                                className="flex-1 bg-white/90 border-2 border-pink-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:border-pink-400"
                                style={{ padding: isMobile ? '10px 14px' : '12px 16px', fontSize: isMobile ? '14px' : '16px' }}
                                autoFocus
                            />
                            <button onClick={submitName} disabled={!textInput.trim()}
                                className="bg-pink-400 hover:bg-pink-500 disabled:bg-gray-300 text-white rounded-lg font-bold transition-all"
                                style={{ padding: isMobile ? '10px 16px' : '12px 18px', fontSize: isMobile ? '14px' : '16px' }}>
                                ✓
                            </button>
                        </motion.div>
                    )}

                    {/* QUIZ OPTIONS */}
                    <AnimatePresence>
                        {phase === 'QUIZ' && segments[currentSegmentIndex] && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-3 space-y-2">
                                {segments[currentSegmentIndex].options.map((option, i) => (
                                    <button key={i} onClick={() => handleAnswer(option)}
                                        className="w-full bg-white hover:bg-pink-50 border-2 border-pink-200 hover:border-pink-400 rounded-lg text-left font-medium text-slate-700 transition-all"
                                        style={{ padding: isMobile ? '10px 14px' : '12px 16px', fontSize: isMobile ? '13px' : '15px' }}>
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
                                    className="w-full bg-white/90 border-2 border-pink-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:border-pink-400 resize-none"
                                    style={{ padding: isMobile ? '10px 14px' : '12px 16px', fontSize: isMobile ? '13px' : '15px', height: isMobile ? '60px' : '70px' }}
                                    autoFocus
                                />
                                <span className="absolute bottom-2 right-3 text-gray-400" style={{ fontSize: isMobile ? '10px' : '11px' }}>{textInput.length}/{TEXT_INPUT_LIMIT}</span>
                            </div>
                            <button onClick={handleTextSubmit} disabled={!textInput.trim()}
                                className="w-full mt-2 bg-pink-400 hover:bg-pink-500 disabled:bg-gray-300 text-white rounded-lg font-bold transition-all"
                                style={{ padding: isMobile ? '10px' : '12px', fontSize: isMobile ? '13px' : '15px' }}>
                                Send
                            </button>
                        </motion.div>
                    )}
                </div>
            )}

            {/* TOP RIGHT: Pause & Exit */}
            <div className="absolute top-3 right-3 z-50 flex flex-col gap-1">
                {!['INTRO', 'ASK_NAME', 'SETUP', 'ENDING'].includes(phase) && (
                    <button onClick={togglePause}
                        className="bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-lg text-white font-bold transition-all border border-white/20"
                        style={{ padding: isMobile ? '6px 10px' : '8px 14px', fontSize: isMobile ? '10px' : '12px' }}>
                        {phase === 'PAUSED' ? '▶ Resume' : '⏸ Pause'}
                    </button>
                )}
                <button onClick={handleExit}
                    className="bg-red-500/80 hover:bg-red-600 backdrop-blur-sm rounded-lg text-white font-bold transition-all border border-white/20"
                    style={{ padding: isMobile ? '6px 10px' : '8px 14px', fontSize: isMobile ? '10px' : '12px' }}>
                    ✕ Exit
                </button>
            </div>

            {/* PAUSE MENU */}
            <AnimatePresence>
                {phase === 'PAUSED' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white/95 rounded-xl shadow-2xl border-2 border-pink-300"
                            style={{ padding: isMobile ? '16px' : '20px', width: isMobile ? '90%' : '400px', maxWidth: '90%' }}>
                            <h2 className="font-black text-pink-500 mb-3 text-center" style={{ fontSize: isMobile ? '18px' : '20px' }}>⏸ Game Paused</h2>

                            <div className="mb-3">
                                <h3 className="font-bold text-slate-700 mb-1" style={{ fontSize: isMobile ? '11px' : '12px' }}>📍 Current:</h3>
                                <p className="text-pink-500 font-medium bg-pink-50 rounded-lg" style={{ padding: '6px 8px', fontSize: isMobile ? '11px' : '12px' }}>{currentTopic}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-3">
                                <div>
                                    <h3 className="font-bold text-slate-700 mb-1" style={{ fontSize: isMobile ? '10px' : '11px' }}>✅ Done ({coveredTopics.length})</h3>
                                    <div className="bg-green-50 rounded-lg overflow-y-auto" style={{ padding: '6px', height: isMobile ? '80px' : '100px' }}>
                                        {coveredTopics.length === 0 ? <p className="text-gray-400" style={{ fontSize: '10px' }}>None</p> :
                                            coveredTopics.map((t, i) => <p key={i} className="text-green-600" style={{ fontSize: '10px', marginBottom: '2px' }}>• {t}</p>)}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-700 mb-1" style={{ fontSize: isMobile ? '10px' : '11px' }}>📋 Next ({upcomingTopics.length})</h3>
                                    <div className="bg-blue-50 rounded-lg overflow-y-auto" style={{ padding: '6px', height: isMobile ? '80px' : '100px' }}>
                                        {upcomingTopics.map((t, i) => <p key={i} className="text-blue-600" style={{ fontSize: '10px', marginBottom: '2px' }}>• {t}</p>)}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button onClick={togglePause} className="flex-1 bg-pink-400 hover:bg-pink-500 text-white rounded-lg font-bold transition-all" style={{ padding: isMobile ? '8px' : '10px', fontSize: isMobile ? '12px' : '13px' }}>▶ Resume</button>
                                <button onClick={handleExit} className="flex-1 bg-gray-200 hover:bg-gray-300 text-slate-700 rounded-lg font-bold transition-all" style={{ padding: isMobile ? '8px' : '10px', fontSize: isMobile ? '12px' : '13px' }}>Exit</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SETUP MODAL */}
            <AnimatePresence>
                {phase === 'SETUP' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white border-2 border-pink-300 rounded-xl shadow-2xl"
                            style={{ padding: isMobile ? '16px' : '18px', width: isMobile ? '90%' : '320px', maxWidth: '90%' }}>
                            <label className="block font-bold text-slate-700 mb-1" style={{ fontSize: isMobile ? '12px' : '13px' }}>What to learn?</label>
                            <input className="w-full border border-pink-200 rounded-lg mb-2 focus:outline-none focus:border-pink-400 text-slate-700"
                                style={{ padding: isMobile ? '8px 10px' : '10px 12px', fontSize: isMobile ? '12px' : '13px' }}
                                placeholder="e.g., Photosynthesis..." value={topic} onChange={e => setTopic(e.target.value)} autoFocus />
                            <label className="block font-bold text-slate-700 mb-1" style={{ fontSize: isMobile ? '12px' : '13px' }}>Notes? (Optional)</label>
                            <textarea className="w-full border border-pink-200 rounded-lg mb-2 focus:outline-none focus:border-pink-400 text-slate-700 resize-none"
                                style={{ padding: isMobile ? '8px 10px' : '10px 12px', fontSize: isMobile ? '12px' : '13px', height: isMobile ? '50px' : '60px' }}
                                placeholder="Paste notes..." value={goals} onChange={e => setGoals(e.target.value)} />
                            <button onClick={handleStart} disabled={!topic.trim()}
                                className="w-full bg-pink-400 hover:bg-pink-500 disabled:bg-gray-300 text-white font-bold rounded-lg transition-all"
                                style={{ padding: isMobile ? '10px' : '12px', fontSize: isMobile ? '13px' : '14px' }}>
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
                            <h1 className="font-black text-white mb-2" style={{ fontSize: isMobile ? '28px' : '36px' }}>
                                {endingType === 'GOOD' && '💖 Perfect! 💖'}
                                {endingType === 'NEUTRAL' && '📚 Complete!'}
                                {endingType === 'BAD' && '💔 Over...'}
                            </h1>
                            <p className="text-white/80 mb-4 max-w-xs mx-auto" style={{ fontSize: isMobile ? '14px' : '16px' }}>
                                {endingType === 'GOOD' && `Amazing, ${userName}!`}
                                {endingType === 'NEUTRAL' && `Good job, ${userName}!`}
                                {endingType === 'BAD' && `Try again, ${userName}?`}
                            </p>
                            <button onClick={() => window.location.reload()}
                                className="bg-white text-pink-500 rounded-full font-bold hover:scale-105 transition-all shadow-xl"
                                style={{ padding: isMobile ? '10px 20px' : '12px 24px', fontSize: isMobile ? '14px' : '16px' }}>
                                Play Again
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

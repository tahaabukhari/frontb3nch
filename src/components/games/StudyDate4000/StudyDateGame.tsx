'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateInitialPlan, evaluateAnswer, generateFreeformReaction } from './lib/ai';
import { GameState, TeachingSegment, FahiMood } from './lib/types';

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
import fahiHappyConfused from './public/fahi-character/fahi-happy-confused.png';
import fahiAngryDisappointed from './public/fahi-character/fahi-angry-disappointed.png';
import fahiHappyNeutral from './public/fahi-character/fahi-happy-neutral.png';

// Sprite Map
const FAHI_SPRITES: Record<FahiMood, any> = {
    'neutral': fahiNeutral,
    'happy': fahiHappy,
    'mad': fahiMad,
    'disappointed': fahiDisappointed,
    'shy': fahiShy,
    'excited': fahiExcited,
    'happy-explaining': fahiHappyExplaining,
    'happy-explaining2': fahiHappyExplaining2,
    'happy-confused': fahiHappyConfused,
    'angry-disappointed': fahiAngryDisappointed,
    'happy-neutral': fahiHappyNeutral
};

export default function StudyDateGame() {
    const [gameState, setGameState] = useState<GameState>({
        mood: 70,
        courseProgress: 0,
        phase: 'SETUP',
        topic: '',
        history: []
    });

    const [inputTopic, setInputTopic] = useState('');
    const [inputGoals, setInputGoals] = useState('');
    const [lessonPlan, setLessonPlan] = useState<TeachingSegment[]>([]);
    const [currentSegmentIdx, setCurrentSegmentIdx] = useState(0);
    const [dialogueQueue, setDialogueQueue] = useState<string[]>([]);
    const [currentDialogue, setCurrentDialogue] = useState('');
    const [fahiState, setFahiState] = useState<FahiMood>('happy-neutral');
    const [userTextInput, setUserTextInput] = useState('');

    // Animation State
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [animationFrame, setAnimationFrame] = useState(0);

    // Auto-scroll text effect & Speaking Animation
    useEffect(() => {
        if (gameState.phase === 'TEACHING' && dialogueQueue.length > 0) {
            setIsSpeaking(true);
            setCurrentDialogue(dialogueQueue[0]);
        } else {
            setIsSpeaking(false);
        }
    }, [gameState.phase, dialogueQueue]);

    // Sprite Animation Loop
    useEffect(() => {
        if (!isSpeaking) return;

        const interval = setInterval(() => {
            setAnimationFrame(prev => (prev + 1) % 2);
        }, 200); // Toggle every 200ms

        return () => clearInterval(interval);
    }, [isSpeaking]);

    // Derived Sprite for Animation
    const currentSprite = isSpeaking
        ? (animationFrame === 0 ? 'happy-explaining' : 'happy-explaining2')
        : fahiState;

    const handleStart = async () => {
        setGameState(prev => ({ ...prev, phase: 'INTRO', subPhase: 'PROCESSING' }));
        try {
            const plan = await generateInitialPlan(inputTopic, inputGoals);
            setLessonPlan(plan);
            setGameState(prev => ({ ...prev, phase: 'TEACHING', subPhase: 'PROCESSING' }));
            setDialogueQueue(plan[0].explanation);
        } catch (e) {
            console.error(e);
        }
    };

    const advanceDialogue = () => {
        const remaining = dialogueQueue.slice(1);
        if (remaining.length > 0) {
            setDialogueQueue(remaining);
        } else {
            // Done explanation, move to quiz
            setGameState(prev => ({ ...prev, phase: 'QUIZ', subPhase: 'WAITING_FOR_USER' }));
            setFahiState(gameState.mood > 50 ? 'happy-neutral' : 'neutral');
            setIsSpeaking(false);
        }
    };

    const handleOptionSelect = async (option: string) => {
        setGameState(prev => ({ ...prev, subPhase: 'PROCESSING' }));
        const segment = lessonPlan[currentSegmentIdx];
        const result = await evaluateAnswer(option, segment, gameState.mood);

        setGameState(prev => ({
            ...prev,
            mood: Math.min(100, Math.max(0, prev.mood + (result.moodChange || 0))),
            courseProgress: result.moodChange && result.moodChange > 0 ? Math.min(100, prev.courseProgress + (100 / lessonPlan.length)) : prev.courseProgress,
            phase: 'FEEDBACK'
        }));

        setCurrentDialogue(result.text || "...");
        if (result.fahiEmotion) setFahiState(result.fahiEmotion);

        setTimeout(() => {
            checkProgression(result.moodChange && result.moodChange > 0);
        }, 3000);
    };

    const checkProgression = (wasCorrect: boolean | undefined) => {
        if (gameState.mood <= 0) {
            setGameState(prev => ({ ...prev, phase: 'ENDING', endingType: 'BAD' }));
            return;
        }

        if (wasCorrect) {
            const nextIdx = currentSegmentIdx + 1;
            if (nextIdx < lessonPlan.length) {
                setCurrentSegmentIdx(nextIdx);
                setDialogueQueue(lessonPlan[nextIdx].explanation);
                setGameState(prev => ({ ...prev, phase: 'TEACHING' }));
            } else {
                const ending = gameState.mood >= 95 ? 'GOOD' : 'NEUTRAL';
                setGameState(prev => ({ ...prev, phase: 'ENDING', endingType: ending }));
            }
        } else {
            setDialogueQueue(lessonPlan[currentSegmentIdx].explanation);
            setGameState(prev => ({ ...prev, phase: 'TEACHING' }));
        }
    };

    return (
        <div className="relative w-full h-screen bg-gray-900 overflow-hidden font-sans text-slate-800">

            {/* LAYER 1: BACKGROUND (Bottom) */}
            <div className="absolute inset-0 z-0">
                <img src={bgImg.src} className="w-full h-full object-cover opacity-100" alt="bg" />
            </div>

            {/* SETUP PHASE UI */}
            {gameState.phase === 'SETUP' && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#FFF0F5] border-4 border-[#B2F7EF] p-8 rounded-2xl max-w-lg w-full shadow-2xl">
                        <h1 className="text-3xl font-bold text-[#FF9AA2] mb-4 text-center">Study Date 4000 💖</h1>
                        <p className="mb-4 text-gray-600">Enter a topic and I'll create a date... I mean, study plan for us!</p>

                        <label className="block text-sm font-bold mb-1">Topic</label>
                        <input
                            className="w-full p-2 rounded border border-pink-200 mb-4 focus:outline-none focus:ring-2 focus:ring-pink-300"
                            placeholder="e.g., Photosynthesis"
                            value={inputTopic}
                            onChange={e => setInputTopic(e.target.value)}
                        />

                        <label className="block text-sm font-bold mb-1">Learning Goals / Notes</label>
                        <textarea
                            className="w-full p-2 rounded border border-pink-200 mb-6 h-32 focus:outline-none focus:ring-2 focus:ring-pink-300"
                            placeholder="Paste your notes here..."
                            value={inputGoals}
                            onChange={e => setInputGoals(e.target.value)}
                        />

                        <button
                            onClick={handleStart}
                            disabled={!inputTopic}
                            className="w-full py-3 bg-[#FFB7B2] hover:bg-[#FF9AA2] text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
                        >
                            Start Date 💖
                        </button>
                    </div>
                </div>
            )}

            {gameState.phase !== 'SETUP' && (
                <>
                    {/* BARS - LEFT (UI Layer) */}
                    <div className="absolute left-4 top-8 w-24 flex flex-col gap-4 z-40">
                        <div className="flex-1 bg-white/50 rounded-full p-2 flex flex-col-reverse relative shadow-inner backdrop-blur-md border border-white/60 h-64">
                            <div className="w-full bg-gradient-to-t from-blue-300 to-[#B2F7EF] rounded-full transition-all duration-1000" style={{ height: `${gameState.courseProgress}%` }} />
                            <span className="absolute -top-8 w-full text-center font-bold text-white drop-shadow-md">Content</span>
                        </div>
                        <div className="flex-1 bg-white/50 rounded-full p-2 flex flex-col-reverse relative shadow-inner backdrop-blur-md border border-white/60 h-64">
                            <div
                                className={`w-full rounded-full transition-all duration-1000 ${gameState.mood < 30 ? 'bg-red-400' : 'bg-gradient-to-t from-pink-300 to-[#FFC1CC]'}`}
                                style={{ height: `${gameState.mood}%` }}
                            />
                            <span className="absolute -top-8 w-full text-center font-bold text-white drop-shadow-md">Mood</span>
                        </div>
                    </div>

                    {/* LAYER 2: CHARACTER (Middle) */}
                    <div className="absolute right-[10%] bottom-[10%] h-[80%] w-[50%] z-10 flex items-end justify-center pointer-events-none">
                        <motion.img
                            key={String(currentSprite)} // Triggers re-render for animation if needed, or use src change
                            src={FAHI_SPRITES[currentSprite as FahiMood]?.src}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="max-h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                            alt="Fahi"
                        />
                    </div>

                    {/* LAYER 3: TABLE (Top Foreground, Bottom Aligned) */}
                    <div className="absolute bottom-0 left-0 right-0 h-48 z-20 pointer-events-none flex items-end">
                        <img src={tableImg.src} className="w-full h-full object-cover object-bottom" alt="Table" />
                    </div>

                    {/* LAYER 4: DIALOGUE & INTERACTION (UI Top) */}
                    <div className="absolute right-8 bottom-4 w-[500px] z-50 flex flex-col gap-4">

                        {/* CHAT BUBBLE */}
                        {(gameState.phase === 'TEACHING' || gameState.phase === 'FEEDBACK' || gameState.phase === 'QUIZ') && (
                            <div className="bg-white/95 backdrop-blur-md border-4 border-[#FFC1CC] p-6 rounded-tr-3xl rounded-tl-3xl rounded-bl-3xl shadow-2xl relative min-h-[140px] mb-4">
                                <h3 className="text-[#FF9AA2] font-black mb-2 text-xl tracking-wide uppercase">Fahi</h3>
                                <p className="text-xl font-medium text-slate-700 leading-relaxed">
                                    {currentDialogue || (gameState.phase === 'QUIZ' ? lessonPlan[currentSegmentIdx]?.question : "...")}
                                </p>

                                {gameState.phase === 'TEACHING' && (
                                    <button
                                        onClick={advanceDialogue}
                                        className="absolute bottom-4 right-4 bg-pink-100 text-pink-500 px-4 py-1 rounded-full font-bold animate-pulse hover:bg-pink-200"
                                    >
                                        Next ▶
                                    </button>
                                )}
                            </div>
                        )}

                        {/* OPTIONS (Only visible during QUIZ) */}
                        <AnimatePresence>
                            {gameState.phase === 'QUIZ' && lessonPlan[currentSegmentIdx] && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="grid grid-cols-1 gap-3"
                                >
                                    {lessonPlan[currentSegmentIdx].options.map((opt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleOptionSelect(opt)}
                                            className="bg-white/90 hover:bg-[#B2F7EF] border-2 border-white hover:border-[#52D1C6] p-4 rounded-xl text-left transition-all shadow-md transform hover:-translate-y-1 font-bold text-slate-700 active:scale-95"
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* USER INPUT (Only visible when interaction is allowed, e.g. after explanation or during quiz if designed) */}
                        {/* Spec: "under the chatbubble... userinput box... chat bubble should not show user input until she asks a question" 
                            Interpretation: Hide input box during Teacher Phase. Show in Quiz Phase.
                        */}
                        {gameState.phase === 'QUIZ' && (
                            <div className="bg-white/90 rounded-full p-2 flex gap-2 shadow-lg border-2 border-pink-100 mt-2">
                                <input
                                    className="flex-1 bg-transparent px-4 py-2 outline-none text-slate-700 placeholder-slate-400 font-medium"
                                    placeholder="Tell Fahi what you really think..."
                                    value={userTextInput}
                                    onChange={e => setUserTextInput(e.target.value)}
                                />
                                <button className="bg-[#FF9AA2] text-white rounded-full px-6 font-bold hover:bg-[#FF808A] transition-colors">
                                    Send
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* ENDING SCREENS */}
            {gameState.phase === 'ENDING' && (
                <div className="absolute inset-0 z-[60] bg-black/80 flex items-center justify-center text-white text-center p-10">
                    <div>
                        {/* Ending UI */}
                    </div>
                </div>
            )}

        </div>
    );
}

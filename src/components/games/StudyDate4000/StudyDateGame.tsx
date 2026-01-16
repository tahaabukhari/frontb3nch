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
    id: number;
    title: string;
    explanation: string[];
    question: string;
    options: string[];
    correctAnswer: string;
    isTextInput: boolean;
}

type GamePhase = 'TITLE' | 'INTRO' | 'ASK_NAME' | 'SETUP' | 'LOADING' | 'TEACHING' | 'QUIZ' | 'TEXT_INPUT' | 'FEEDBACK' | 'FINAL_QUIZ' | 'ENDING' | 'PAUSED';

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
// Minimal intro - the real intro is AI-generated after setup
const INTRO_DIALOGUE = [
    { text: "Hey! Welcome to Study Date!", emotion: 'happy' as FahiEmotion },
    { text: "I'm Fahi, and I'll be your study buddy today~", emotion: 'excited' as FahiEmotion },
    { text: "So... what are we learning today?", emotion: 'happy-neutral' as FahiEmotion }
];

// Random feedback responses for variety
const CORRECT_RESPONSES = [
    "Nice one!", "You got it!", "Exactly right!", "Perfect!",
    "That's it!", "Yep, you nailed it!", "Good job!", "Right on!"
];
const CORRECT_AFTER_STRUGGLE = [
    "There we go! Finally!", "Took a bit but you got there!",
    "See? You can do it!", "About time~ but good job!"
];
const WRONG_FIRST = [
    "Hmm, not quite...", "That's not it~", "Nope, let me explain again.",
    "Almost! But not exactly.", "Close, but no."
];
const WRONG_AGAIN = [
    "Still not it...", "Wrong again~", "Try listening more carefully?",
    "That's still wrong...", "Not that one either."
];
const WRONG_FRUSTRATED = [
    "Seriously?!", "How are you still missing this?", "Come on...",
    "This really shouldn't be this hard.", "Focus please!"
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
    const [phase, setPhase] = useState<GamePhase>('TITLE');
    const [previousPhase, setPreviousPhase] = useState<GamePhase>('TITLE');
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
    const [clos, setClos] = useState(''); // Course Learning Objectives
    const [finalQuizIndex, setFinalQuizIndex] = useState(0); // Track final quiz progress
    const [textInput, setTextInput] = useState('');
    const [explainFrame, setExplainFrame] = useState(0);
    const [failCount, setFailCount] = useState(0); // Track failures per segment
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [textKey, setTextKey] = useState(0); // Force re-render of typewriter

    // Track answers for ending summary
    const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);
    const [mistakes, setMistakes] = useState<{ topic: string; userAnswer: string; correct: string }[]>([]);
    const [waitingForClick, setWaitingForClick] = useState(false); // Require user click to proceed

    // Final quiz specific states
    const [finalQuizRetry, setFinalQuizRetry] = useState(0); // 0 = first attempt, 1 = retry after explanation
    const [finalQuizExplanation, setFinalQuizExplanation] = useState<string[]>([]); // Re-explanation lines
    const [finalQuizExplanationIndex, setFinalQuizExplanationIndex] = useState(0); // Current explanation line

    // Sanitize text to remove JSON artifacts
    const sanitizeText = (text: string): string => {
        return text
            .replace(/```json/gi, '')
            .replace(/```/g, '')
            .replace(/^\s*\{[\s\S]*\}\s*$/g, '') // Remove pure JSON objects
            .replace(/\*\*/g, '')
            .replace(/\*/g, '')
            .trim();
    };

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

    // Typewriter - Fixed index bug, uses textKey to force re-trigger
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
    }, [currentText, textKey]);

    const getCurrentSprite = () => {
        if (phase === 'TEACHING') return explainFrame === 0 ? SPRITES['explaining'] : SPRITES['explaining2'];
        return SPRITES[emotion] || SPRITES['happy-neutral'];
    };

    // Generate frustration-based explanations
    const getFrustrationExplanation = (topicName: string, loopCount: number): string[] => {
        switch (loopCount) {
            case 0: // Normal
                return [
                    `Let's learn about ${topicName}.`,
                    `This is an important concept you'll want to understand well.`,
                    `The key point here is to focus on the fundamentals first.`,
                    `Alright, let me check if you got that!`
                ];
            case 1: // Simpler, like explaining to someone slow
                return [
                    `Okay, let me explain ${topicName} in a simpler way.`,
                    `Think of it like this... just the basics, nothing complicated.`,
                    `The MOST important thing is just understanding the foundation. That's it.`,
                    `Let's try this again. You can do it.`
                ];
            case 2: // Confused and irritated
                return [
                    `${topicName}... again. Let me try a different approach.`,
                    `I'm not sure what's confusing here, but let me break it down even more.`,
                    `Look, the fundamentals are the base. Everything else builds on that. Simple.`,
                    `Okay... let's see if this time works.`
                ];
            case 3: // Degrading
                return [
                    `Alright ${userName}, ${topicName} one more time...`,
                    `I've explained this multiple times now. It's really not that hard.`,
                    `Just remember: fundamentals first. That's literally all you need to know.`,
                    `Please get it right this time.`
                ];
            default: // 4+ loops - Just mad
                return [
                    `${topicName}. Again.`,
                    `I don't know how else to explain this.`,
                    `Fundamentals. First. Always. How is this so difficult?`,
                    `Just... try again.`
                ];
        }
    };

    const getFrustrationFeedback = (loopCount: number, isCorrect: boolean): { text: string; emotion: FahiEmotion } => {
        const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

        if (isCorrect) {
            if (loopCount >= 3) {
                return { text: pick(CORRECT_AFTER_STRUGGLE), emotion: 'neutral' };
            } else if (loopCount >= 1) {
                return { text: pick(CORRECT_AFTER_STRUGGLE), emotion: 'happy' };
            }
            return { text: pick(CORRECT_RESPONSES), emotion: 'happy' };
        }

        switch (loopCount) {
            case 0:
                return { text: pick(WRONG_FIRST), emotion: 'disappointed' };
            case 1:
                return { text: pick(WRONG_AGAIN), emotion: 'disappointed' };
            case 2:
                return { text: pick(WRONG_AGAIN), emotion: 'neutral' };
            default:
                return { text: pick(WRONG_FRUSTRATED), emotion: 'mad' };
        }
    };

    // No longer using generateSegments - curriculum is generated by API

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
        } else setPhase('SETUP'); // Go to topic setup first
    };

    const submitSetup = async () => {
        if (!topic.trim()) return;
        setPhase('ASK_NAME');
        setCurrentText(`${topic}! That sounds interesting~ And what's your name?`);
        setEmotion('excited');
    };

    const submitName = async () => {
        if (!textInput.trim()) return;
        const name = textInput.trim();
        setUserName(name);
        setTextInput('');
        setPhase('LOADING');
        setCurrentText('Give me a sec to prep everything...');
        setEmotion('neutral');

        // Generate dynamic AI opening
        try {
            const introResponse = await fetch('/api/study-date', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'generate_opening', topic, goals, userName: name })
            });
            const introResult = await introResponse.json();

            if (introResult.success && introResult.data?.opening) {
                setCurrentText(introResult.data.opening);
                setTextKey(prev => prev + 1);
                setEmotion('happy');
            }
        } catch (e) {
            setCurrentText(`Alright ${name}, let's dive into ${topic} together!`);
        }

        // Start curriculum generation after showing opening
        setTimeout(() => handleStart(), 2500);
    };

    const handleStart = async () => {
        setCurrentText(`Okay, let me set up the lesson...`);
        setEmotion('excited');

        try {
            const response = await fetch('/api/study-date', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'generate_curriculum', topic, notes: goals, clos })
            });
            const result = await response.json();

            if (result.success && result.data?.subsections?.length > 0) {
                const curriculum = result.data.subsections.map((sub: any) => ({
                    id: sub.id,
                    title: sanitizeText(sub.title || ''),
                    explanation: (sub.explanation || [`So let's talk about this.`, 'This is pretty important.', 'Once you get this, the rest makes sense.']).map(sanitizeText),
                    question: sanitizeText(sub.question || ''),
                    options: sub.options || [],
                    correctAnswer: sub.correctAnswer || sub.expectedAnswer || '',
                    isTextInput: sub.isTextInput === true
                }));
                setSegments(curriculum);
                setCurrentSegmentIndex(0);
                setDialogueIndex(0);
                setCorrectAnswers([]);
                setMistakes([]);
                // Show first subsection title (user clicks to see explanations)
                const first = curriculum[0];
                setCurrentText(`Alright, let's start with ${first.title}!`);
                setPhase('TEACHING');
            } else {
                throw new Error('Invalid curriculum');
            }
        } catch (e) {
            console.error('Curriculum generation error:', e);
            // Fallback with mixed MCQ and text input
            const fallback: Segment[] = [
                { id: 1, title: `${topic} Basics`, explanation: [`So ${topic} - let's start simple.`, `The basics are pretty straightforward.`, `Once you get this, everything else builds on it.`], question: `What's the most important thing about ${topic}?`, options: ['Understanding the fundamentals', 'Memorizing everything', 'Skipping to advanced topics', 'Guessing randomly'], correctAnswer: 'Understanding the fundamentals', isTextInput: false },
                { id: 2, title: `${topic} Core Concepts`, explanation: [`Now for the core ideas.`, `This connects to what we just covered.`, `Think about why this matters.`], question: `Which approach helps most with learning?`, options: ['Practice regularly', 'Cram before tests', 'Avoid difficult parts', 'Only read notes'], correctAnswer: 'Practice regularly', isTextInput: false },
                { id: 3, title: `${topic} In Depth`, explanation: [`Let's go a bit deeper now.`, `This part is where it gets interesting.`, `Real examples help make it click.`], question: `How would you explain ${topic} to a friend?`, options: [], correctAnswer: '', isTextInput: true }
            ];
            setSegments(fallback);
            setCurrentSegmentIndex(0);
            setDialogueIndex(0);
            setCorrectAnswers([]);
            setMistakes([]);
            setCurrentText(`Let's start with ${fallback[0].title}!`);
            setPhase('TEACHING');
        }
    };

    const advanceDialogue = () => {
        if (isTyping) { setDisplayedText(currentText); setIsTyping(false); return; }

        // Check if we're in final quiz explanation mode
        if (finalQuizExplanation.length > 0) {
            advanceFinalQuizExplanation();
            return;
        }

        const segment = segments[currentSegmentIndex];
        if (!segment) return;

        // dialogueIndex 0 = showing title, 1+ = showing explanations
        // After all explanations, show question
        if (dialogueIndex < segment.explanation.length) {
            // Show next explanation (sanitized)
            setCurrentText(sanitizeText(segment.explanation[dialogueIndex]));
            setDialogueIndex(dialogueIndex + 1);
            setExplainFrame(prev => (prev + 1) % 2);
        } else {
            // Done with explanations, show question
            setCurrentText(sanitizeText(segment.question));
            setEmotion('happy-neutral');
            // MCQ for segments with options, TEXT_INPUT for open-ended
            setPhase(segment.isTextInput ? 'TEXT_INPUT' : 'QUIZ');
        }
    };

    const handleAnswer = (answer: string) => {
        const segment = segments[currentSegmentIndex];
        if (!segment) return;
        setPhase('FEEDBACK');
        const isCorrect = answer === segment.correctAnswer;

        const feedback = getFrustrationFeedback(failCount, isCorrect);
        setCurrentText(sanitizeText(feedback.text));
        setEmotion(feedback.emotion);

        if (isCorrect) {
            setMood(prev => Math.min(100, prev + 5));
            setProgress(prev => Math.min(100, prev + (100 / segments.length)));
            setShowStars(true);
            setTimeout(() => setShowStars(false), 1000);
            // Track correct answer
            setCorrectAnswers(prev => [...prev, segment.title]);
        } else {
            setMood(prev => Math.max(0, prev - 10));
            setShowFrustration(true);
            setTimeout(() => setShowFrustration(false), 1000);
            // Track mistake
            setMistakes(prev => [...prev, { topic: segment.title, userAnswer: answer, correct: segment.correctAnswer }]);
        }

        // Wait for user to click to proceed
        setWaitingForClick(true);
        setTimeout(async () => {
            setWaitingForClick(false);
            if (mood <= 10) { setEndingType('BAD'); setPhase('ENDING'); return; }
            if (isCorrect) {
                // Reset fail count and move to next segment
                setFailCount(0);
                const next = currentSegmentIndex + 1;
                if (next >= segments.length) {
                    // Go to final quiz
                    setFinalQuizIndex(0);
                    setCurrentText(`Nice! That covers all the main parts. Now let's do a quick review~`);
                    setEmotion('excited');
                    setPhase('FINAL_QUIZ');
                } else {
                    // Move to next segment
                    setCurrentSegmentIndex(next);
                    setDialogueIndex(0);
                    setExplainFrame(0);
                    setCurrentText(`Next up: ${segments[next].title}`);
                    setPhase('TEACHING');
                }
            } else {
                // Increment fail count and call API for AI-generated re-explanation
                const newFailCount = failCount + 1;
                setFailCount(newFailCount);

                // Call API for AI-generated re-explanation
                try {
                    const response = await fetch('/api/study-date', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 're_explain',
                            topicName: segment.title,
                            failCount: newFailCount,
                            previousAnswer: answer,
                            correctAnswer: segment.correctAnswer,
                            userName
                        })
                    });

                    const result = await response.json();

                    if (result.success && result.data?.explanation) {
                        const lines = result.data.explanation.map(sanitizeText);
                        // Store re-explanation - user clicks to continue
                        setSegments(prev => prev.map((s, i) =>
                            i === currentSegmentIndex ? { ...s, explanation: lines } : s
                        ));
                        setDialogueIndex(0);
                        setCurrentText(lines[0] || 'Let me explain that again.');
                        setTextKey(prev => prev + 1);
                        if (result.data.emotion) {
                            setEmotion(result.data.emotion as FahiEmotion);
                        }
                        setPhase('TEACHING'); // User clicks to advance
                    } else {
                        // Fallback - show correct answer then retry
                        setCurrentText(`The correct answer was: ${segment.correctAnswer}`);
                        setTextKey(prev => prev + 1);
                        setWaitingForClick(true);
                    }
                } catch (error) {
                    console.error('Re-explain API error:', error);
                    setCurrentText(`The answer was: ${segment.correctAnswer}. Let's try again.`);
                    setTextKey(prev => prev + 1);
                }
            }
        }, 2000);
    };

    const handleTextSubmit = async () => {
        if (!textInput.trim()) return;
        const segment = segments[currentSegmentIndex];
        if (!segment) return;

        setPhase('FEEDBACK');
        setCurrentText(`Hmm, let me think about that...`);
        setEmotion('neutral');

        try {
            const response = await fetch('/api/study-date', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'evaluate_text',
                    topicName: segment.title,
                    userText: textInput,
                    userName,
                    currentMood: mood
                })
            });

            const result = await response.json();

            if (result.success && result.data) {
                const { comment, emotion: newEmotion, moodChange, score } = result.data;

                // Show personalized feedback
                setCurrentText(comment);
                setEmotion(newEmotion as FahiEmotion);
                setMood(prev => Math.max(0, Math.min(100, prev + moodChange)));

                // Visual effect based on score
                if (score >= 7) {
                    setShowStars(true);
                    setTimeout(() => setShowStars(false), 1000);
                } else if (score <= 3) {
                    setShowFrustration(true);
                    setTimeout(() => setShowFrustration(false), 1000);
                }

                // Progress and move on
                setProgress(prev => Math.min(100, prev + (100 / segments.length)));

                // After feedback, move to next segment or final quiz
                setTimeout(() => {
                    const next = currentSegmentIndex + 1;
                    if (next >= segments.length) {
                        // All segments done - time for final quiz!
                        setFinalQuizIndex(0);
                        setCurrentText(`Nice work getting through all that! Now let's do a quick review to make sure everything stuck~`);
                        setEmotion('excited');
                        setPhase('FINAL_QUIZ');
                    } else {
                        setCurrentSegmentIndex(next);
                        setDialogueIndex(0);
                        setExplainFrame(0);
                        setFailCount(0);
                        setCurrentText(`Next up: ${segments[next].title}`);
                        setPhase('TEACHING'); // User clicks to see explanations
                    }
                }, 2000);
            } else {
                throw new Error('API failed');
            }
        } catch (error) {
            console.error('Evaluate text error:', error);
            // Fallback
            setCurrentText('Okay, got it. Let me think...');
            setEmotion('neutral');
            setProgress(prev => Math.min(100, prev + (100 / segments.length)));

            setTimeout(() => {
                const next = currentSegmentIndex + 1;
                if (next >= segments.length) {
                    setFinalQuizIndex(0);
                    setCurrentText(`Alright, that covers everything! Quick review time~`);
                    setPhase('FINAL_QUIZ');
                } else {
                    setCurrentSegmentIndex(next);
                    setDialogueIndex(0);
                    setExplainFrame(0);
                    setCurrentText(`Next topic: ${segments[next].title}`);
                    setPhase('TEACHING'); // User clicks to see explanations
                }
            }, 1500);
        }

        setTextInput('');
    };

    const handleExit = () => window.history.back();

    // Final quiz - after showing intro, advances through questions
    const advanceFinalQuiz = () => {
        if (isTyping) { setDisplayedText(currentText); setIsTyping(false); return; }
        // Show the current question for review
        const seg = segments[finalQuizIndex];
        if (seg) {
            setCurrentText(sanitizeText(`Quick check on ${seg.title}: ${seg.question}`));
            setEmotion('happy-neutral');
        }
    };

    // Advance through final quiz re-explanation (4 lines)
    const advanceFinalQuizExplanation = () => {
        if (isTyping) { setDisplayedText(currentText); setIsTyping(false); return; }

        const nextIndex = finalQuizExplanationIndex + 1;
        if (nextIndex < finalQuizExplanation.length) {
            setFinalQuizExplanationIndex(nextIndex);
            setCurrentText(sanitizeText(finalQuizExplanation[nextIndex]));
        } else {
            // Done with explanation, ask the question again
            const seg = segments[finalQuizIndex];
            setFinalQuizExplanation([]);
            setFinalQuizExplanationIndex(0);
            setCurrentText(sanitizeText(`Okay, try again: ${seg?.question || ''}`));
            setPhase('FINAL_QUIZ');
        }
    };

    const handleFinalQuizSubmit = async () => {
        if (!textInput.trim()) return;
        const seg = segments[finalQuizIndex];
        if (!seg) return;

        setPhase('FEEDBACK');
        setCurrentText(`Hmm, let me think...`);
        const userAnswer = textInput;
        setTextInput('');

        try {
            const response = await fetch('/api/study-date', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'evaluate_text',
                    topicName: seg.title,
                    userText: userAnswer,
                    userName,
                    currentMood: mood
                })
            });
            const result = await response.json();

            if (result.success && result.data) {
                const score = result.data.score || 5;
                const isCorrect = score >= 5;

                setCurrentText(sanitizeText(result.data.comment));
                setEmotion(result.data.emotion as FahiEmotion);

                if (isCorrect) {
                    // Correct! Track and move to next
                    setCorrectAnswers(prev => [...prev, seg.title]);
                    setShowStars(true);
                    setTimeout(() => setShowStars(false), 1000);

                    setTimeout(() => {
                        const next = finalQuizIndex + 1;
                        setFinalQuizRetry(0); // Reset retry for next question
                        if (next >= segments.length) {
                            setEndingType(mood >= 90 ? 'GOOD' : mood >= 50 ? 'NEUTRAL' : 'BAD');
                            setCurrentText(`Done! Great work, ${userName}!`);
                            setEmotion('excited');
                            setPhase('ENDING');
                        } else {
                            setFinalQuizIndex(next);
                            setCurrentText(sanitizeText(`Next: ${segments[next].title} - ${segments[next].question}`));
                            setPhase('FINAL_QUIZ');
                        }
                    }, 2000);
                } else {
                    // Wrong answer
                    setMistakes(prev => [...prev, { topic: seg.title, userAnswer, correct: seg.correctAnswer || 'concepts covered' }]);

                    if (finalQuizRetry === 0) {
                        // First attempt was wrong - get re-explanation and retry once
                        setFinalQuizRetry(1);

                        // Get 4-line re-explanation
                        try {
                            const reExplainResponse = await fetch('/api/study-date', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    action: 're_explain',
                                    topicName: seg.title,
                                    failCount: 1,
                                    previousAnswer: userAnswer,
                                    correctAnswer: seg.correctAnswer || seg.title,
                                    userName
                                })
                            });
                            const reExplainResult = await reExplainResponse.json();

                            if (reExplainResult.success && reExplainResult.data?.explanation?.length > 0) {
                                const lines = reExplainResult.data.explanation.map(sanitizeText);
                                setFinalQuizExplanation(lines);
                                setFinalQuizExplanationIndex(0);
                                setTimeout(() => {
                                    setCurrentText(lines[0]);
                                    setEmotion(reExplainResult.data.emotion || 'neutral');
                                    setPhase('TEACHING'); // Use TEACHING phase to show explanation lines
                                }, 1500);
                            } else {
                                // Fallback - just retry
                                setTimeout(() => {
                                    setCurrentText(`Not quite. Let's try that again: ${seg.question}`);
                                    setPhase('FINAL_QUIZ');
                                }, 2000);
                            }
                        } catch {
                            setTimeout(() => {
                                setCurrentText(`Let's try that one more time: ${seg.question}`);
                                setPhase('FINAL_QUIZ');
                            }, 2000);
                        }
                    } else {
                        // Already retried once - move on
                        setTimeout(() => {
                            const next = finalQuizIndex + 1;
                            setFinalQuizRetry(0);
                            if (next >= segments.length) {
                                setEndingType(mood >= 90 ? 'GOOD' : mood >= 50 ? 'NEUTRAL' : 'BAD');
                                setCurrentText(`That's everything! Let's see how you did.`);
                                setPhase('ENDING');
                            } else {
                                setFinalQuizIndex(next);
                                setCurrentText(sanitizeText(`Moving on: ${segments[next].title} - ${segments[next].question}`));
                                setPhase('FINAL_QUIZ');
                            }
                        }, 2000);
                    }
                }
            } else {
                throw new Error('API failed');
            }
        } catch {
            // Fallback - just move on
            setCurrentText(`Got it. Moving on.`);
            setTimeout(() => {
                const next = finalQuizIndex + 1;
                setFinalQuizRetry(0);
                if (next >= segments.length) {
                    setPhase('ENDING');
                } else {
                    setFinalQuizIndex(next);
                    setCurrentText(sanitizeText(`Next: ${segments[next].title} - ${segments[next].question}`));
                    setPhase('FINAL_QUIZ');
                }
            }, 1500);
        }
    };

    const coveredTopics = segments.slice(0, currentSegmentIndex).map(s => s.title);
    const currentTopic = segments[currentSegmentIndex]?.title || '';
    const upcomingTopics = segments.slice(currentSegmentIndex + 1).map(s => s.title);

    const showUI = ['INTRO', 'ASK_NAME', 'TEACHING', 'QUIZ', 'TEXT_INPUT', 'FEEDBACK', 'LOADING', 'FINAL_QUIZ'].includes(phase);
    const showBars = !['INTRO', 'ASK_NAME', 'SETUP', 'PAUSED', 'ENDING'].includes(phase);

    return (
        <div className="fixed inset-0 w-screen h-screen overflow-hidden font-sans select-none bg-black">
            {/* BACKGROUND */}
            <img src={bgImg.src} className="absolute inset-0 w-full h-full object-cover" alt="Background" />

            {/* TITLE SCREEN */}
            <AnimatePresence>
                {phase === 'TITLE' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex flex-col items-center justify-center"
                        style={{ background: 'linear-gradient(180deg, #1a0a1f 0%, #2d1b3d 30%, #4a2060 50%, #2d1b3d 70%, #1a0a1f 100%)' }}
                    >
                        {/* Floating particles effect */}
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute text-pink-300/40"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    fontSize: `${10 + Math.random() * 20}px`
                                }}
                                animate={{
                                    y: [0, -30, 0],
                                    opacity: [0.2, 0.6, 0.2],
                                    scale: [1, 1.2, 1]
                                }}
                                transition={{
                                    duration: 3 + Math.random() * 2,
                                    repeat: Infinity,
                                    delay: Math.random() * 2
                                }}
                            >
                                {['♥', '✧', '♡', '✦'][Math.floor(Math.random() * 4)]}
                            </motion.div>
                        ))}

                        {/* Title */}
                        <motion.div
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3, type: 'spring' }}
                            className="text-center mb-8"
                        >
                            <h1
                                className="font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400"
                                style={{ fontSize: isMobile ? '40px' : '64px', textShadow: '0 4px 30px rgba(219,112,147,0.5)' }}
                            >
                                StudyDate 4000
                            </h1>
                            <p className="text-pink-200/80 mt-2" style={{ fontSize: isMobile ? '14px' : '18px' }}>
                                Learn with Fahi
                            </p>
                        </motion.div>

                        {/* Play Button */}
                        <motion.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setPhase('INTRO')}
                            className="relative px-12 py-4 rounded-full font-bold text-white overflow-hidden"
                            style={{
                                background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 50%, #ec4899 100%)',
                                backgroundSize: '200% 200%',
                                animation: 'shimmer 3s ease infinite',
                                fontSize: isMobile ? '18px' : '22px',
                                boxShadow: '0 8px 32px rgba(236,72,153,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                            }}
                        >
                            <span className="relative z-10">♥ Start Playing ♥</span>
                        </motion.button>

                        {/* Credits */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="absolute bottom-6 text-pink-200/50 text-sm"
                        >
                            A FrontB3nch Game
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* TABLE */}
            <div className="absolute bottom-0 left-0 right-0 z-10" style={{ height: isMobile ? '18vh' : '20vh' }}>
                <img src={tableImg.src} className="w-full h-full object-cover object-top" alt="Table" />
            </div>

            {/* FAHI - Mobile: vertical center, Desktop: slightly above center */}
            <div
                className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
                style={{ paddingBottom: isMobile ? '0' : '5vh' }}
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

            {/* DIALOGUE BOX - Desktop: Right side, Mobile: 30px below Fahi */}
            {showUI && (
                <div
                    className={`absolute z-30 ${isMobile ? 'left-3 right-3' : ''}`}
                    style={isMobile ? { top: 'calc(50% + 60px)', transform: 'translateY(0)' } : {
                        right: 'calc(50% - 520px)',
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

                    {/* QUIZ OPTIONS - 2x2 grid on mobile, list on desktop */}
                    <AnimatePresence>
                        {phase === 'QUIZ' && segments[currentSegmentIndex] && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className={`mt-3 ${isMobile ? 'grid grid-cols-2 gap-2' : 'space-y-2'}`}
                            >
                                {segments[currentSegmentIndex].options.map((option, i) => (
                                    <button key={i} onClick={() => handleAnswer(option)}
                                        className={`bg-white hover:bg-pink-50 border-2 border-pink-200 hover:border-pink-400 rounded-lg font-medium text-slate-700 transition-all active:scale-98 ${isMobile ? 'text-center' : 'w-full text-left'}`}
                                        style={{ padding: isMobile ? '10px 8px' : `${getSize(10, 12, 14)}px ${getSize(12, 16, 18)}px`, fontSize: isMobile ? '12px' : `${getSize(13, 15, 17)}px` }}>
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

                    {/* FINAL QUIZ INPUT */}
                    {phase === 'FINAL_QUIZ' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
                            <div className="mb-2 text-center">
                                <span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full font-bold" style={{ fontSize: `${getSize(11, 12, 14)}px` }}>
                                    📋 Review {finalQuizIndex + 1}/{segments.length}
                                </span>
                            </div>
                            <div className="relative">
                                <textarea
                                    value={textInput}
                                    onChange={e => setTextInput(e.target.value.slice(0, TEXT_INPUT_LIMIT))}
                                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleFinalQuizSubmit()}
                                    placeholder="What do you remember...?"
                                    maxLength={TEXT_INPUT_LIMIT}
                                    className="w-full bg-white border-2 border-pink-300 rounded-lg text-slate-700 font-medium focus:outline-none focus:border-pink-500 resize-none"
                                    style={{ padding: `${getSize(10, 12, 14)}px`, fontSize: `${getSize(13, 15, 17)}px`, height: `${getSize(55, 65, 80)}px` }}
                                    autoFocus
                                />
                            </div>
                            <button onClick={handleFinalQuizSubmit} disabled={!textInput.trim()}
                                className="w-full mt-2 bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-lg font-bold transition-all"
                                style={{ padding: `${getSize(10, 12, 14)}px`, fontSize: `${getSize(13, 15, 17)}px` }}>
                                Submit Answer
                            </button>
                        </motion.div>
                    )}
                </div>
            )}



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

                            <label className="block font-bold text-slate-700 mb-2" style={{ fontSize: `${getSize(13, 15, 17)}px` }}>Topic / Subject</label>
                            <input
                                className="w-full bg-pink-50 border-2 border-pink-200 rounded-xl mb-3 focus:outline-none focus:border-pink-400 text-slate-800 placeholder-slate-400"
                                style={{ padding: `${getSize(10, 12, 14)}px`, fontSize: `${getSize(13, 15, 17)}px` }}
                                placeholder="e.g., Photosynthesis, JavaScript..."
                                value={topic}
                                onChange={e => setTopic(e.target.value)}
                                autoFocus
                            />

                            <label className="block font-bold text-slate-700 mb-2" style={{ fontSize: `${getSize(13, 15, 17)}px` }}>Learning Objectives (CLOs)</label>
                            <textarea
                                className="w-full bg-pink-50 border-2 border-pink-200 rounded-xl mb-3 focus:outline-none focus:border-pink-400 text-slate-800 placeholder-slate-400 resize-none"
                                style={{ padding: `${getSize(10, 12, 14)}px`, fontSize: `${getSize(13, 15, 17)}px`, height: `${getSize(50, 60, 70)}px` }}
                                placeholder="What should you learn by the end? e.g., Understand loops, arrays..."
                                value={clos}
                                onChange={e => setClos(e.target.value)}
                            />

                            <label className="block font-bold text-slate-700 mb-2" style={{ fontSize: `${getSize(13, 15, 17)}px` }}>Notes (Optional)</label>
                            <textarea
                                className="w-full bg-pink-50 border-2 border-pink-200 rounded-xl mb-4 focus:outline-none focus:border-pink-400 text-slate-800 placeholder-slate-400 resize-none"
                                style={{ padding: `${getSize(10, 12, 14)}px`, fontSize: `${getSize(13, 15, 17)}px`, height: `${getSize(50, 60, 70)}px` }}
                                placeholder="Paste study notes here..."
                                value={goals}
                                onChange={e => setGoals(e.target.value)}
                            />

                            <button
                                onClick={submitSetup}
                                disabled={!topic.trim()}
                                className="w-full bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold rounded-xl transition-all shadow-lg"
                                style={{ padding: `${getSize(12, 14, 18)}px`, fontSize: `${getSize(14, 16, 18)}px` }}
                            >
                                Let's Go! 💕
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ENDING */}
            <AnimatePresence>
                {phase === 'ENDING' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 p-4 overflow-y-auto">
                        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center max-w-lg w-full">
                            <h1 className="font-black text-white mb-3" style={{ fontSize: `${getSize(24, 36, 44)}px` }}>
                                {endingType === 'GOOD' && '💖 Amazing Work! 💖'}
                                {endingType === 'NEUTRAL' && '📚 Session Complete!'}
                                {endingType === 'BAD' && '💔 Study Session Over'}
                            </h1>
                            <p className="text-white/80 mb-4" style={{ fontSize: `${getSize(13, 16, 18)}px` }}>
                                {endingType === 'GOOD' && `Perfect session, ${userName}! You nailed it~`}
                                {endingType === 'NEUTRAL' && `Good effort, ${userName}! Keep practicing.`}
                                {endingType === 'BAD' && `${userName}, let's try again sometime.`}
                            </p>

                            {/* Summary Box */}
                            <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-4 text-left" style={{ fontSize: `${getSize(12, 14, 16)}px` }}>
                                <h3 className="text-green-400 font-bold mb-2">✅ Topics Covered ({correctAnswers.length})</h3>
                                {correctAnswers.length > 0 ? (
                                    <ul className="text-white/70 mb-4 space-y-1">
                                        {correctAnswers.map((topic, i) => (
                                            <li key={i}>• {topic}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-white/50 mb-4">No correct answers yet</p>
                                )}

                                <h3 className="text-red-400 font-bold mb-2">❌ Mistakes Made ({mistakes.length})</h3>
                                {mistakes.length > 0 ? (
                                    <ul className="text-white/70 space-y-2">
                                        {mistakes.map((m, i) => (
                                            <li key={i} className="bg-red-500/10 rounded p-2">
                                                <div className="font-medium">{m.topic}</div>
                                                <div className="text-red-300 text-xs">You said: {m.userAnswer}</div>
                                                <div className="text-green-300 text-xs">Correct: {m.correct}</div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-green-400/70">No mistakes! 🎉</p>
                                )}
                            </div>

                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="bg-white text-pink-500 rounded-full font-bold hover:scale-105 transition-all shadow-xl"
                                    style={{ padding: `${getSize(10, 12, 16)}px ${getSize(20, 26, 34)}px`, fontSize: `${getSize(13, 16, 18)}px` }}
                                >
                                    Study Again
                                </button>
                                <button
                                    onClick={handleExit}
                                    className="bg-pink-500 text-white rounded-full font-bold hover:scale-105 transition-all"
                                    style={{ padding: `${getSize(10, 12, 16)}px ${getSize(20, 26, 34)}px`, fontSize: `${getSize(13, 16, 18)}px` }}
                                >
                                    Exit
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

type Grade = 'SS' | 'S' | 'A' | 'B' | 'C' | 'D';

interface AnimatedCircleProps {
    percentage: number;
    duration?: number;
    size?: number;
    strokeWidth?: number;
    onFillComplete?: () => void;
}

function getGrade(percent: number): Grade {
    if (percent >= 100) return 'SS';
    if (percent >= 95) return 'S';
    if (percent > 90) return 'A';
    if (percent > 80) return 'B';
    if (percent > 50) return 'C';
    return 'D';
}

function getGradeColor(grade: Grade): string {
    switch (grade) {
        case 'SS': return '#FFD700';  // Gold
        case 'S': return '#C0C0C0';   // Silver
        case 'A': return '#7CB342';   // Green (primary)
        case 'B': return '#42A5F5';   // Blue
        case 'C': return '#FF9800';   // Orange
        case 'D': return '#EF5350';   // Red
    }
}

function getProgressColors(percent: number): { main: string; track: string } {
    const grade = getGrade(percent);
    const mainColor = getGradeColor(grade);
    return {
        main: mainColor,
        track: 'rgba(255,255,255,0.1)',
    };
}

export default function AnimatedCircle({
    percentage,
    duration = 2,
    size = 240,
    strokeWidth = 12,
    onFillComplete,
}: AnimatedCircleProps) {
    const [displayPercent, setDisplayPercent] = useState(0);
    const [showGrade, setShowGrade] = useState(false);
    const fillSoundRef = useRef<HTMLAudioElement | null>(null);
    const tingSoundRef = useRef<HTMLAudioElement | null>(null);
    const applauseSoundRef = useRef<HTMLAudioElement | null>(null);
    const popSoundRef = useRef<HTMLAudioElement | null>(null);

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const grade = getGrade(percentage);
    const colors = getProgressColors(percentage);

    useEffect(() => {
        // Initialize audio refs
        fillSoundRef.current = new Audio('/sounds/fill-bar.mp3');
        fillSoundRef.current.loop = true;
        fillSoundRef.current.volume = 0.5;

        tingSoundRef.current = new Audio('/sounds/rank-ting.mp3');
        tingSoundRef.current.volume = 0.7;

        applauseSoundRef.current = new Audio('/sounds/applause.mp3');
        applauseSoundRef.current.volume = 0.6;

        popSoundRef.current = new Audio('/sounds/celebration-pop.mp3');
        popSoundRef.current.volume = 0.7;

        return () => {
            fillSoundRef.current?.pause();
            tingSoundRef.current?.pause();
            applauseSoundRef.current?.pause();
            popSoundRef.current?.pause();
        };
    }, []);

    useEffect(() => {
        // Play fill sound
        fillSoundRef.current?.play().catch(() => { });

        const startTime = performance.now();
        const durationMs = duration * 1000;

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / durationMs, 1);
            // Easing: ease-out cubic
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const currentPercent = Math.round(easedProgress * percentage);

            setDisplayPercent(currentPercent);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Stop fill sound
                fillSoundRef.current?.pause();
                if (fillSoundRef.current) fillSoundRef.current.currentTime = 0;

                // Show grade with ting sound
                setShowGrade(true);
                tingSoundRef.current?.play().catch(() => { });

                // If S or SS, play celebration sounds
                const finalGrade = getGrade(percentage);
                if (finalGrade === 'S' || finalGrade === 'SS') {
                    setTimeout(() => {
                        applauseSoundRef.current?.play().catch(() => { });
                        popSoundRef.current?.play().catch(() => { });
                    }, 300);
                }

                onFillComplete?.();
            }
        };

        requestAnimationFrame(animate);
    }, [percentage, duration, onFillComplete]);

    const strokeDashoffset = circumference - (displayPercent / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center p-8" style={{ width: size + 64, height: size + 64 }}>
            {/* Background glow */}
            <div
                className="absolute inset-0 rounded-full blur-xl opacity-30"
                style={{ backgroundColor: colors.main }}
            />

            {/* SVG Circle */}
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={colors.track}
                    strokeWidth={strokeWidth}
                />
                {/* Progress */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={colors.main}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{
                        filter: `drop-shadow(0 0 8px ${colors.main})`,
                        transition: 'stroke 0.3s ease',
                    }}
                />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                {showGrade ? (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                        className="flex items-center justify-center"
                    >
                        <span
                            className="text-7xl font-black text-white"
                            style={{ textShadow: `0 0 30px ${colors.main}, 0 0 60px ${colors.main}` }}
                        >
                            {grade}
                        </span>
                    </motion.div>
                ) : (
                    <span className="text-5xl font-bold text-white tabular-nums">{displayPercent}%</span>
                )}
            </div>
        </div>
    );
}

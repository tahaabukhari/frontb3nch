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

// Grade thresholds with colors
const GRADE_SEGMENTS = [
    { threshold: 0, color: '#EF5350', label: 'D' },    // Red: 0-50%
    { threshold: 50, color: '#FF9800', label: 'C' },   // Orange: 50-70%
    { threshold: 70, color: '#FFEB3B', label: 'B' },   // Yellow: 70-90%
    { threshold: 90, color: '#7CB342', label: 'A' },   // Green: 90-95%
    { threshold: 95, color: '#42A5F5', label: 'S' },   // Blue: 95-99%
    { threshold: 99, color: '#E040FB', label: 'SS' },  // Neon Purple: 100%
];

function getGrade(percent: number): Grade {
    if (percent >= 100) return 'SS';
    if (percent >= 95) return 'S';
    if (percent >= 90) return 'A';
    if (percent >= 70) return 'B';
    if (percent >= 50) return 'C';
    return 'D';
}

function getGradeColor(grade: Grade): string {
    switch (grade) {
        case 'SS': return '#E040FB';  // Neon Purple
        case 'S': return '#42A5F5';   // Blue
        case 'A': return '#7CB342';   // Green
        case 'B': return '#FFEB3B';   // Yellow
        case 'C': return '#FF9800';   // Orange
        case 'D': return '#EF5350';   // Red
    }
}

export default function AnimatedCircle({
    percentage,
    duration = 2,
    size = 240,
    strokeWidth = 14,
    onFillComplete,
}: AnimatedCircleProps) {
    const [displayPercent, setDisplayPercent] = useState(0);
    const [showGrade, setShowGrade] = useState(false);
    const [gradientRotation, setGradientRotation] = useState(0);
    const fillSoundRef = useRef<HTMLAudioElement | null>(null);
    const tingSoundRef = useRef<HTMLAudioElement | null>(null);
    const applauseSoundRef = useRef<HTMLAudioElement | null>(null);
    const popSoundRef = useRef<HTMLAudioElement | null>(null);

    const radius = (size - strokeWidth) / 2;
    const innerStrokeWidth = strokeWidth / 2; // Donut width is half of main stroke
    const innerRadius = radius - strokeWidth / 2 - innerStrokeWidth / 2; // Hugs the main circle
    const circumference = 2 * Math.PI * radius;
    const innerCircumference = 2 * Math.PI * innerRadius;
    const grade = getGrade(percentage);
    const gradeColor = getGradeColor(grade);

    // Gradient rotation animation
    useEffect(() => {
        const interval = setInterval(() => {
            setGradientRotation((prev) => (prev + 2) % 360);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Initialize audio refs
        fillSoundRef.current = new Audio('/sounds/fill-bar.mp3');
        fillSoundRef.current.loop = true;
        fillSoundRef.current.volume = 0.5;

        tingSoundRef.current = new Audio('/sounds/metal-impact.mp3');
        tingSoundRef.current.volume = 0.8;

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
        if (fillSoundRef.current) {
            fillSoundRef.current.currentTime = 0;
            fillSoundRef.current.playbackRate = 0.5;
            fillSoundRef.current.play().catch(() => { });
        }

        const startTime = performance.now();
        const durationMs = duration * 1000;

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / durationMs, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const currentPercent = Math.round(easedProgress * percentage);

            if (fillSoundRef.current) {
                fillSoundRef.current.playbackRate = 0.5 + progress * 1.5;
            }

            setDisplayPercent(currentPercent);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                fillSoundRef.current?.pause();
                if (fillSoundRef.current) fillSoundRef.current.currentTime = 0;

                setShowGrade(true);
                if (tingSoundRef.current) tingSoundRef.current.currentTime = 0;
                tingSoundRef.current?.play().catch(() => { });

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

    // Create inner donut chart segments (arcs, not filled pie)
    const renderInnerDonutChart = () => {
        const segments = [];
        const cx = size / 2;
        const cy = size / 2;

        for (let i = 0; i < GRADE_SEGMENTS.length; i++) {
            const startPercent = GRADE_SEGMENTS[i].threshold;
            const endPercent = i < GRADE_SEGMENTS.length - 1 ? GRADE_SEGMENTS[i + 1].threshold : 100;
            const color = GRADE_SEGMENTS[i].color;

            // Calculate stroke dash for this segment
            const segmentPercent = endPercent - startPercent;
            const segmentLength = (segmentPercent / 100) * innerCircumference;
            const segmentOffset = innerCircumference - (startPercent / 100) * innerCircumference;

            segments.push(
                <circle
                    key={`segment-${i}`}
                    cx={cx}
                    cy={cy}
                    r={innerRadius}
                    fill="none"
                    stroke={color}
                    strokeWidth={innerStrokeWidth}
                    strokeDasharray={`${segmentLength} ${innerCircumference - segmentLength}`}
                    strokeDashoffset={segmentOffset}
                    opacity={0.35}
                    className="transition-opacity duration-300"
                />
            );
        }

        return segments;
    };

    return (
        <div
            className="relative flex items-center justify-center p-8"
            style={{ width: size + 64, height: size + 64 }}
        >
            {/* Background glow */}
            <div
                className="absolute inset-0 rounded-full blur-2xl opacity-40"
                style={{ backgroundColor: gradeColor }}
            />

            {/* SVG Container */}
            <svg width={size} height={size} className="transform -rotate-90">
                <defs>
                    {/* Animated gradient for the progress stroke - uses darker shade */}
                    <linearGradient
                        id="progressGradient"
                        gradientTransform={`rotate(${gradientRotation})`}
                    >
                        <stop offset="0%" stopColor={gradeColor} />
                        <stop offset="50%" stopColor={gradeColor} stopOpacity="0.4" />
                        <stop offset="100%" stopColor={gradeColor} />
                    </linearGradient>

                    {/* Glow filter */}
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Inner Donut Chart showing grade thresholds */}
                {renderInnerDonutChart()}

                {/* Track circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={strokeWidth}
                />

                {/* Progress circle with animated gradient */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    filter="url(#glow)"
                    style={{ transition: 'stroke 0.3s ease' }}
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
                            style={{ textShadow: `0 0 30px ${gradeColor}, 0 0 60px ${gradeColor}` }}
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

'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface FlappyBirdProps {
    onBack: () => void;
}

interface GameState {
    isPlaying: boolean;
    isGameOver: boolean;
    score: number;
    highScore: number;
}

export default function FlappyBird({ onBack }: FlappyBirdProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameState, setGameState] = useState<GameState>({
        isPlaying: false,
        isGameOver: false,
        score: 0,
        highScore: 0
    });

    // Physics constants
    const GRAVITY = 0.6;
    const JUMP_STRENGTH = -10;
    const PIPE_SPEED = 3;
    const PIPE_SPAWN_RATE = 1500; // ms
    const BIRD_SIZE = 30;
    const PIPE_WIDTH = 50;
    const PIPE_GAP = 150;

    // Game logic refs (mutable state for performance in animation loop)
    const birdY = useRef(300);
    const birdVelocity = useRef(0);
    const pipes = useRef<{ x: number; topHeight: number; passed: boolean }[]>([]);
    const lastTime = useRef(0);
    const spawnTimer = useRef(0);
    const animationFrameId = useRef<number>();

    // Load high score
    useEffect(() => {
        const saved = localStorage.getItem('flappy_highscore');
        if (saved) {
            setGameState(prev => ({ ...prev, highScore: parseInt(saved) }));
        }
    }, []);

    const startGame = () => {
        setGameState(prev => ({ ...prev, isPlaying: true, isGameOver: false, score: 0 }));
        birdY.current = 300;
        birdVelocity.current = 0;
        pipes.current = [];
        spawnTimer.current = 0;
        lastTime.current = performance.now();
        gameLoop(performance.now());
    };

    const jump = useCallback(() => {
        if (!gameState.isPlaying && !gameState.isGameOver) {
            startGame();
        } else if (gameState.isPlaying) {
            birdVelocity.current = JUMP_STRENGTH;
        }
    }, [gameState.isPlaying, gameState.isGameOver]);

    // Handle Input
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault(); // Prevent scrolling
                jump();
            }
        };
        const handleTouch = (e: TouchEvent) => {
            // prevent default only if it's interacting with the canvas area directly/game is active
            if (gameState.isPlaying) {
                e.preventDefault();
            }
            jump();
        }

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('touchstart', handleTouch, { passive: false });
        // Mouse click handled by container onClick

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('touchstart', handleTouch);
        };
    }, [jump, gameState.isPlaying]);

    const gameOver = () => {
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);

        setGameState(prev => {
            const newHighScore = Math.max(prev.score, prev.highScore);
            localStorage.setItem('flappy_highscore', newHighScore.toString());
            return {
                ...prev,
                isPlaying: false,
                isGameOver: true,
                highScore: newHighScore
            };
        });
    };

    const gameLoop = (time: number) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const deltaTime = time - lastTime.current;
        lastTime.current = time;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update Physics
        birdVelocity.current += GRAVITY;
        birdY.current += birdVelocity.current;

        // Spawn Pipes
        spawnTimer.current += deltaTime;
        if (spawnTimer.current > PIPE_SPAWN_RATE) {
            const minHeight = 50;
            const maxHeight = canvas.height - PIPE_GAP - minHeight;
            const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;

            pipes.current.push({
                x: canvas.width,
                topHeight,
                passed: false
            });
            spawnTimer.current = 0;
        }

        // Update Pipes
        pipes.current.forEach(pipe => {
            pipe.x -= PIPE_SPEED;

            // Score handling
            if (!pipe.passed && pipe.x + PIPE_WIDTH < canvas.width / 2 - BIRD_SIZE / 2) {
                pipe.passed = true;
                setGameState(prev => ({ ...prev, score: prev.score + 1 }));
            }
        });

        // Remove off-screen pipes
        pipes.current = pipes.current.filter(pipe => pipe.x + PIPE_WIDTH > -10);

        // Collision Detection
        // 1. Ground/Ceiling
        if (birdY.current + BIRD_SIZE / 2 >= canvas.height || birdY.current - BIRD_SIZE / 2 <= 0) {
            gameOver();
            return;
        }

        // 2. Pipes
        const birdLeft = canvas.width / 2 - BIRD_SIZE / 2 + 5; // +5 padding
        const birdRight = canvas.width / 2 + BIRD_SIZE / 2 - 5;
        const birdTop = birdY.current - BIRD_SIZE / 2 + 5;
        const birdBottom = birdY.current + BIRD_SIZE / 2 - 5;

        for (const pipe of pipes.current) {
            // Horizontal overlap
            if (birdRight > pipe.x && birdLeft < pipe.x + PIPE_WIDTH) {
                // Vertical check (hit top pipe OR hit bottom pipe)
                if (birdTop < pipe.topHeight || birdBottom > pipe.topHeight + PIPE_GAP) {
                    gameOver();
                    return;
                }
            }
        }

        // --- Drawing ---

        // Background (Simple gradient handled by CSS mostly, but lets add some stars or parallax if needed? doing simple for now)
        // Actually, let's keep it transparent so we can see the cool background from the 'Funzone' behind it, or draw a semi-transparent dark bg.
        // But for gameplay visibility, we need contrast.
        // Let's perform a fill to be safe, or user 'backdrop-blur'.
        // We will assume the container has the background.

        // Draw Pipes
        ctx.fillStyle = '#4ade80'; // green-400
        ctx.strokeStyle = '#22c55e'; // green-500
        ctx.lineWidth = 2;

        pipes.current.forEach(pipe => {
            // Top Pipe
            ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
            ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);

            // Bottom Pipe
            ctx.fillRect(pipe.x, pipe.topHeight + PIPE_GAP, PIPE_WIDTH, canvas.height - (pipe.topHeight + PIPE_GAP));
            ctx.strokeRect(pipe.x, pipe.topHeight + PIPE_GAP, PIPE_WIDTH, canvas.height - (pipe.topHeight + PIPE_GAP));
        });

        // Draw Bird
        ctx.save();
        ctx.translate(canvas.width / 2, birdY.current);

        // Rotation based on velocity
        const rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (birdVelocity.current * 0.1)));
        ctx.rotate(rotation);

        // Bird Body
        ctx.fillStyle = '#fbbf24'; // amber-400
        ctx.beginPath();
        ctx.arc(0, 0, BIRD_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();

        // Eye
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(8, -6, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(10, -6, 2, 0, Math.PI * 2);
        ctx.fill();

        // Beak
        ctx.fillStyle = '#f97316'; // orange-500
        ctx.beginPath();
        ctx.moveTo(8, 2);
        ctx.lineTo(16, 6);
        ctx.lineTo(8, 10);
        ctx.fill();

        ctx.restore();

        // Floor (Visual only)
        // ctx.fillStyle = '#334155';
        // ctx.fillRect(0, canvas.height - 10, canvas.width, 10);

        animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center font-sans tracking-wide">

            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors border border-white/10"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
                    Start Menu
                </button>
                <div className="text-2xl font-bold text-white drop-shadow-md font-mono">
                    Score: {gameState.score}
                </div>
            </div>

            {/* Game Canvas Container */}
            <div
                className="relative w-full max-w-lg aspect-[3/4] md:aspect-[9/16] bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-white/10 ring-1 ring-white/5 cursor-pointer select-none"
                onClick={jump}
            >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: 'radial-gradient(circle at 50% 50%, #3b82f6 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}></div>

                <canvas
                    ref={canvasRef}
                    width={400}
                    height={600}
                    className="w-full h-full block relative z-0"
                />

                {/* Start Screen Key Handling hint */}
                {!gameState.isPlaying && !gameState.isGameOver && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
                            className="bg-black/40 backdrop-blur-md px-6 py-4 rounded-xl border border-white/20 text-center"
                        >
                            <h2 className="text-3xl font-bold text-white mb-2">Get Ready!</h2>
                            <p className="text-gray-300 text-sm">Tap, Click or Space to Jump</p>
                        </motion.div>
                    </div>
                )}
            </div>

            {/* Results Modal */}
            <AnimatePresence>
                {gameState.isGameOver && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#1e2337] w-full max-w-sm rounded-2xl p-6 border border-white/10 shadow-2xl text-center"
                        >
                            <div className="text-5xl mb-2">💀</div>
                            <h2 className="text-3xl font-bold text-white mb-1">Game Over</h2>

                            <div className="my-6 space-y-3">
                                <div className="bg-black/30 p-4 rounded-xl border border-white/5 flex flex-col gap-1">
                                    <span className="text-gray-400 text-sm uppercase tracking-wider">Score</span>
                                    <span className="text-4xl font-mono text-blue-400 font-bold">{gameState.score}</span>
                                </div>
                                <div className="bg-black/30 p-4 rounded-xl border border-white/5 flex flex-col gap-1">
                                    <span className="text-gray-400 text-sm uppercase tracking-wider">Best</span>
                                    <span className="text-2xl font-mono text-yellow-500 font-bold">{gameState.highScore}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={startGame}
                                    className="py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-transform active:scale-95 shadow-lg shadow-blue-500/20"
                                >
                                    Replay ↻
                                </button>
                                <button
                                    onClick={onBack}
                                    className="py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors border border-white/10"
                                >
                                    Exit
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

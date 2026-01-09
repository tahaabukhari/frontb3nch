'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

const GAMES = [
    { id: 1, title: 'Math Blitz', description: 'Quick-fire math challenges.', color: 'bg-emerald-500/20 text-emerald-500' },
    { id: 2, title: 'Word Scramble', description: 'Unscramble letters to find the word.', color: 'bg-blue-500/20 text-blue-500' },
    { id: 3, title: 'Memory Match', description: 'Test your memory patterns.', color: 'bg-purple-500/20 text-purple-500' },
    { id: 4, title: 'Geo Guesser', description: 'Identify locations around the world.', color: 'bg-yellow-500/20 text-yellow-500' },
    { id: 5, title: 'Logic Puzzle', description: 'Brain teasers to test your IQ.', color: 'bg-pink-500/20 text-pink-500' },
    { id: 6, title: 'Speed Typer', description: 'How fast can you type?', color: 'bg-orange-500/20 text-orange-500' },
];

export default function FunzonePage() {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredGames = GAMES.filter((game) =>
        game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen pt-4 pb-20 px-4 sm:px-6">
            <div className="mx-auto max-w-6xl space-y-8">
                <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Funzone</h1>
                        <p className="text-gray-400 mt-2">Explore a collection of mini‑games and interactive quizzes.</p>
                    </div>
                    <div className="relative w-full md:w-72">
                        <input
                            type="text"
                            placeholder="Search games..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] px-4 py-3 pl-10 text-sm text-white placeholder-gray-500 transition-all focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
                        />
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </header>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                >
                    {filteredGames.length > 0 ? (
                        filteredGames.map((game) => (
                            <div
                                key={game.id}
                                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 transition-all hover:border-white/20 hover:bg-white/5"
                            >
                                <div>
                                    <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${game.color}`}>
                                        <div className="h-6 w-6 rounded-full bg-current opacity-50" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors">{game.title}</h3>
                                    <p className="mt-2 text-sm text-gray-400">{game.description}</p>
                                </div>
                                <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                                    <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Mini Game</span>
                                    <button className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/20">
                                        Play Now
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-white/5 flex items-center justify-center text-gray-500">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-lg font-medium text-white">No games found</p>
                            <p className="text-gray-400">Try searching for something else</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}

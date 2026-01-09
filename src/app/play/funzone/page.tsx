'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Mock Data ---
const TOP_GAMES = [
    {
        id: 1,
        title: 'Neon Racer',
        color: 'from-blue-600 to-purple-700',
        emoji: '🏎️',
        description: 'Experience high-octane racing in a futuristic neon city. Upgrade your vehicle and dominate the leaderboards.',
        tags: ['Racing', 'Multiplayer', 'Competitive']
    },
    {
        id: 2,
        title: 'Cosmic Blast',
        color: 'from-red-600 to-orange-700',
        emoji: '🚀',
        description: 'Defend your starbase from endless waves of alien invaders. How long can you survive the cosmic onslaught?',
        tags: ['Action', 'Survival', 'Space']
    },
    {
        id: 3,
        title: 'Cyber Puzzle',
        color: 'from-emerald-600 to-teal-700',
        emoji: '🧩',
        description: 'Hack into the mainframe by solving complex logic puzzles before the security system traces you.',
        tags: ['Puzzle', 'Strategy', 'Brain']
    },
    {
        id: 4,
        title: 'Void Walker',
        color: 'from-indigo-600 to-violet-700',
        emoji: '👻',
        description: 'Explore the unknown void, gather resources, and build your shelter in this atmospheric survival game.',
        tags: ['Adventure', 'Exploration', 'Rpg']
    },
];

const ALL_GAMES = Array.from({ length: 12 }).map((_, i) => ({
    id: i + 10,
    title: `Game Title ${i + 1}`,
    category: ['Action', 'Puzzle', 'Strategy'][i % 3],
    description: 'A fun and engaging game to test your skills.',
    color: 'from-gray-800 to-gray-900',
    tags: ['Casual', 'Fun'],
    emoji: ['🎮', '🎲', '♟️'][i % 3]
}));

const FILTERS = ['All', 'Action', 'Puzzle', 'Strategy', 'Multiplayer'];

export default function FunzonePage() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0); // -1 for left, 1 for right
    // Auto-rotate carousel
    useEffect(() => {
        const timer = setInterval(() => {
            nextSlide();
        }, 5000);
        return () => clearInterval(timer);
    }, [currentIndex]);

    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [selectedGame, setSelectedGame] = useState<typeof TOP_GAMES[0] | any>(null);

    const nextSlide = () => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % TOP_GAMES.length);
    };

    const prevSlide = () => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + TOP_GAMES.length) % TOP_GAMES.length);
    };

    const goToSlide = (index: number) => {
        setDirection(index > currentIndex ? 1 : -1);
        setCurrentIndex(index);
    };

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.95
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.95
        })
    };

    return (
        <div className="min-h-screen bg-transparent text-white overflow-x-hidden pb-20 relative font-sans selection:bg-blue-500 selection:text-white">

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-8">

                {/* Header */}
                <header className="mb-8 flex items-end justify-between">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
                            Featured & Recommended
                        </h1>
                    </div>
                </header>

                {/* --- Steam-style Carousel --- */}
                <section className="mb-16 relative group">
                    {/* Main Banner Area */}
                    <div className="relative h-[400px] md:h-[450px] w-full overflow-hidden rounded-2xl bg-[#161b2e] shadow-2xl border border-white/5">

                        <AnimatePresence initial={false} custom={direction} mode="popLayout">
                            <motion.div
                                key={currentIndex}
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: "spring", stiffness: 300, damping: 30 },
                                    opacity: { duration: 0.2 }
                                }}
                                className="absolute inset-0 w-full h-full flex flex-col md:flex-row cursor-pointer"
                                onClick={() => setSelectedGame(TOP_GAMES[currentIndex])}
                            >
                                {/* Left Content */}
                                <div className={`w-full md:w-2/3 h-full p-8 md:p-12 flex flex-col justify-center relative overflow-hidden bg-gradient-to-br ${TOP_GAMES[currentIndex].color}`}>
                                    {/* Abstract Pattern overlay */}
                                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay"></div>

                                    <div className="relative z-10 space-y-4">
                                        <h2 className="text-4xl md:text-6xl font-black text-white drop-shadow-lg tracking-tighter">
                                            {TOP_GAMES[currentIndex].title}
                                        </h2>
                                        <p className="text-lg md:text-xl text-white/90 max-w-xl font-medium leading-relaxed drop-shadow-md">
                                            {TOP_GAMES[currentIndex].description}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {TOP_GAMES[currentIndex].tags.map(tag => (
                                                <span key={tag} className="px-3 py-1 bg-black/30 backdrop-blur-sm rounded-lg text-sm font-semibold border border-white/10">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Content (Art/Emoji) */}
                                <div className="w-full md:w-1/3 h-full bg-[#1e2337] flex items-center justify-center relative overflow-hidden border-l border-white/5">
                                    <div className="absolute inset-0 bg-gradient-to-br from-black/0 to-black/40"></div>
                                    <motion.div
                                        initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                        transition={{ delay: 0.2, type: "spring" }}
                                        className="text-[120px] md:text-[160px] relative z-10 filter drop-shadow-2xl"
                                    >
                                        {TOP_GAMES[currentIndex].emoji}
                                    </motion.div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation Buttons */}
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                            <button
                                onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                                className="w-12 h-12 flex items-center justify-center rounded-full bg-black/50 hover:bg-blue-600 text-white backdrop-blur-md transition-all transform hover:scale-110 border border-white/10 shadow-lg"
                                aria-label="Previous Slide"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                        </div>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                            <button
                                onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                                className="w-12 h-12 flex items-center justify-center rounded-full bg-black/50 hover:bg-blue-600 text-white backdrop-blur-md transition-all transform hover:scale-110 border border-white/10 shadow-lg"
                                aria-label="Next Slide"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    </div>

                    {/* Dot Indicators */}
                    <div className="flex justify-center gap-3 mt-6">
                        {TOP_GAMES.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`h-3 rounded-full transition-all duration-300 ${index === currentIndex ? 'w-8 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'w-3 bg-white/20 hover:bg-white/40'
                                    }`}
                            />
                        ))}
                    </div>
                </section>

                {/* --- Search & Filters --- */}
                <section className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-2 z-20 bg-[#0a0f1c]/80 backdrop-blur-xl py-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:bg-transparent sm:relative sm:top-0">
                    {/* Filter Pills */}
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide w-full md:w-auto">
                        {FILTERS.map(filter => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all border
                                    ${activeFilter === filter
                                        ? 'bg-white text-black border-white'
                                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-72">
                        <input
                            type="text"
                            placeholder="Search store..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#161b2e] border border-white/10 text-white rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-500 text-sm"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>
                </section>

                {/* --- Games Grid --- */}
                <section>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {ALL_GAMES.filter(g => (activeFilter === 'All' || g.category === activeFilter) && g.title.toLowerCase().includes(searchQuery.toLowerCase())).map((game) => (
                            <motion.div
                                key={game.id}
                                onClick={() => setSelectedGame(game as any)}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ y: -5 }}
                                transition={{ duration: 0.2 }}
                                className="group bg-[#161b2e] hover:bg-[#1f263d] rounded-xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-blue-900/10 transition-all border border-white/5"
                            >
                                {/* Aspect Ratio Box for Image */}
                                <div className="aspect-[16/9] w-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center relative overflow-hidden group-hover:brightness-110 transition-all">
                                    <span className="text-5xl group-hover:scale-125 transition-transform duration-300 drop-shadow-lg">{game.emoji}</span>
                                    {/* Play Overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <div className="bg-blue-600 p-3 rounded-full text-white shadow-lg transform scale-0 group-hover:scale-100 transition-transform">
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4">
                                    <h4 className="text-gray-200 font-bold truncate group-hover:text-white transition-colors">{game.title}</h4>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded">{game.category}</span>
                                        <span className="text-xs text-green-400 font-medium">Free</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

            </div>

            {/* --- Game Detail Modal --- */}
            <AnimatePresence>
                {selectedGame && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedGame(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            layoutId={`modal-${selectedGame.id}`}
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl bg-[#161b2e] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-10"
                        >
                            {/* Modal Header/Art */}
                            <div className={`h-64 bg-gradient-to-r ${selectedGame.color || 'from-gray-800 to-black'} relative`}>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-[100px] drop-shadow-2xl animate-bounce-slow">{selectedGame.emoji}</div>
                                </div>

                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-[#161b2e] to-transparent" />

                                <button
                                    onClick={() => setSelectedGame(null)}
                                    className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors border border-white/10"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-8 -mt-10 relative z-10">
                                <h2 className="text-4xl font-bold text-white mb-2">{selectedGame.title}</h2>
                                <div className="flex gap-2 mb-6">
                                    {(selectedGame.tags || [selectedGame.category]).map((t: string) => (
                                        <span key={t} className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded border border-blue-500/30">{t}</span>
                                    ))}
                                </div>
                                <p className="text-gray-300 mb-8 leading-relaxed text-lg">{selectedGame.description || "Join the fun and compete with friends in this amazing game."}</p>

                                <div className="flex gap-4">
                                    <button className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-xl text-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all flex items-center justify-center gap-2 transform active:scale-95">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M8 5v14l11-7z" /></svg>
                                        Play Now
                                    </button>
                                    <button className="flex-1 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl text-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                        Create Lobby
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

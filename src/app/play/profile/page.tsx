'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
    return (
        <div className="min-h-screen bg-black pt-4 pb-20 px-4 sm:px-6">
            <div className="mx-auto max-w-5xl">
                {/* Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative h-48 w-full overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 sm:h-64 border border-white/5"
                >
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </motion.div>

                {/* Profile Header */}
                <div className="relative z-10 -mt-16 sm:-mt-20 px-6 sm:px-10 flex flex-col items-center sm:items-end sm:flex-row gap-6">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full border-[6px] border-black bg-zinc-900 shadow-2xl sm:h-40 sm:w-40"
                    >
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-4xl font-bold text-white">
                            U
                        </div>
                    </motion.div>

                    <div className="flex-1 text-center sm:text-left pb-4">
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-3xl font-bold text-white sm:text-4xl"
                        >
                            Guest User
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mt-1 text-gray-400 font-medium"
                        >
                            Level 1 • Novice Learner
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex gap-3 pb-4"
                    >
                        <button className="rounded-full bg-white px-6 py-2.5 text-sm font-bold text-black transition hover:bg-gray-200 shadow-lg shadow-white/10">
                            Edit Profile
                        </button>
                        <button className="rounded-full border border-white/10 bg-zinc-900 px-4 py-2.5 text-white transition hover:bg-zinc-800 hover:border-white/20">
                            ⚙️
                        </button>
                    </motion.div>
                </div>

                {/* Content Grid */}
                <div className="mt-12 grid gap-8 sm:grid-cols-3">
                    {/* Left Column - Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-6"
                    >
                        <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 backdrop-blur-sm shadow-xl">
                            <h3 className="mb-4 text-lg font-bold text-white">Statistics</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <StatBox label="Multiplier" value="1.0x" />
                                <StatBox label="Rank" value="#--" />
                                <StatBox label="Quizzes" value="0" />
                                <StatBox label="Avg Score" value="-%" />
                            </div>
                        </div>

                        <div className="relative rounded-2xl border border-white/10 overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative h-full w-full bg-[#0a0a0a]/90 p-6 backdrop-blur-xl">
                                <h3 className="mb-2 text-lg font-bold text-white">Pro Plan</h3>
                                <p className="mb-6 text-sm text-gray-400 leading-relaxed">Upgrade to unlock unlimited quizzes, advanced analytics, and exclusive badges.</p>
                                <button className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-bold text-white shadow-lg transition hover:shadow-indigo-500/25 active:scale-[0.98]">
                                    Upgrade Now
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column - Badges & Recent */}
                    <div className="sm:col-span-2 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 sm:p-8 shadow-xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white">Earned Badges</h2>
                                <button className="text-sm font-medium text-indigo-400 hover:text-indigo-300">View All</button>
                            </div>

                            {/* Badge Grid - Empty State for new user */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                <BadgeEmpty title="First Win" />
                                <BadgeEmpty title="Perfect 10" />
                                <BadgeEmpty title="7 Day Streak" />
                                <BadgeEmpty title="Quiz Master" />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 sm:p-8 shadow-xl"
                        >
                            <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-center py-12 text-gray-500 border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                                    No recent activity to show
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const StatBox = ({ label, value }: { label: string; value: string }) => (
    <div className="rounded-xl border border-white/5 bg-white/5 p-3 hover:bg-white/10 transition-colors">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-xl font-bold text-white mt-1">{value}</p>
    </div>
);

const BadgeEmpty = ({ title }: { title: string }) => (
    <div className="aspect-square rounded-xl border border-dashed border-white/10 bg-white/5 hover:bg-white/10 transition-colors flex flex-col items-center justify-center text-center p-2 group cursor-pointer relative overflow-hidden">
        <div className="h-12 w-12 rounded-full bg-white/5 mb-3 group-hover:bg-white/10 flex items-center justify-center text-2xl grayscale opacity-30 group-hover:opacity-50 transition-all group-hover:scale-110">
            🏆
        </div>
        <p className="text-xs font-semibold text-gray-600 group-hover:text-gray-400 transition-colors">{title}</p>
    </div>
);

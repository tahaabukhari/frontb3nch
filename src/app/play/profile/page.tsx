'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/context/UserContext';

import DailyStreakFab from '@/components/DailyStreakFab';

export default function ProfilePage() {
    const { user, updateProfile } = useUser();
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'avatar' | 'banner') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateProfile({ [field]: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 md:pt-32">
            <div className="mx-auto max-w-5xl">
                {/* Hidden Inputs */}
                <input
                    type="file"
                    ref={bannerInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'banner')}
                />
                <input
                    type="file"
                    ref={avatarInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'avatar')}
                />

                {/* Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative h-40 sm:h-56 w-full overflow-hidden rounded-3xl bg-zinc-900 border border-white/5 cursor-pointer group shadow-2xl"
                    onClick={() => bannerInputRef.current?.click()}
                >
                    {user.banner ? (
                        <img src={user.banner} alt="Banner" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black"></div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">Change Banner</span>
                    </div>
                </motion.div>

                {/* Profile Header */}
                <div className="relative z-10 -mt-14 sm:-mt-20 px-4 sm:px-10 flex flex-col items-center sm:items-end sm:flex-row gap-4 sm:gap-8">
                    {/* Profile Picture */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-[6px] border-[#0a0f1c] bg-zinc-800 shadow-2xl sm:h-44 sm:w-44 cursor-pointer group"
                        onClick={(e) => {
                            e.stopPropagation();
                            avatarInputRef.current?.click();
                        }}
                    >
                        {user.avatar ? (
                            <img src={user.avatar} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-4xl font-bold text-gray-400">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                    </motion.div>

                    {/* Name & Title */}
                    <div className="flex-1 text-center sm:text-left pb-2 sm:pb-6 space-y-1">
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-2xl sm:text-4xl font-bold text-white tracking-tight"
                        >
                            {user.name}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-sm sm:text-base text-gray-400 font-medium"
                        >
                            Level {user.level} <span className="text-gray-600">•</span> {user.level < 5 ? 'Novice Learner' : user.level < 10 ? 'Intermediate' : 'Expert'}
                        </motion.p>
                    </div>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex gap-3 pb-4 sm:pb-8 w-full sm:w-auto justify-center sm:justify-end"
                    >
                        <button className="rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-black transition hover:bg-gray-200 shadow-lg shadow-white/5 active:scale-95">
                            Edit Profile
                        </button>
                        <button className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-2.5 text-white transition hover:bg-zinc-800 hover:border-white/20 active:scale-95 shadow-lg">
                            ⚙️
                        </button>
                    </motion.div>
                </div>

                {/* Content Grid */}
                <div className="mt-8 sm:mt-12 grid gap-6 sm:gap-8 lg:grid-cols-3">
                    {/* Left Column - Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-6"
                    >
                        <div className="rounded-2xl border border-white/10 bg-black/40 p-5 sm:p-6 backdrop-blur-md shadow-xl">
                            <h3 className="mb-4 text-base font-bold text-white uppercase tracking-wider opacity-80">Statistics</h3>
                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                <StatBox label="XP Earned" value={`${Math.floor(user.currentExp)}`} />
                                <StatBox label="Next Level" value={`${user.maxExp}`} />
                                <StatBox label="Quizzes" value="0" />
                                <StatBox label="Avg Score" value="-%" />
                            </div>
                        </div>

                        <div className="relative rounded-2xl border border-white/10 overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 opacity-50"></div>
                            <div className="relative h-full w-full bg-[#0a0a0a]/80 p-6 backdrop-blur-xl">
                                <h3 className="mb-2 text-lg font-bold text-white">Pro Plan</h3>
                                <p className="mb-6 text-sm text-gray-400 leading-relaxed">Upgrade to unlock unlimited quizzes, advanced analytics, and exclusive badges.</p>
                                <button className="w-full rounded-xl bg-white text-black py-3 text-sm font-bold shadow-lg transition hover:bg-gray-200 active:scale-[0.98]">
                                    Upgrade Now
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column - Badges & Recent */}
                    <div className="lg:col-span-2 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="rounded-2xl border border-white/10 bg-black/40 p-5 sm:p-8 shadow-xl backdrop-blur-md"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white">Earned Badges</h2>
                                <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wide">View All</button>
                            </div>

                            {/* Badge Grid - Empty State for new user */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                <BadgeEmpty title="First Win" />
                                <BadgeEmpty title="Perfect 10" />
                                <BadgeEmpty title="7 Day Streak" />
                                <BadgeEmpty title="Quiz Master" />
                            </div>
                        </motion.div>

                        {/* My Friends Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.65 }}
                            className="rounded-2xl border border-white/10 bg-black/40 p-5 sm:p-8 shadow-xl backdrop-blur-md"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white">My Friends</h2>
                                <button className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-white/20">
                                    + Add Friend
                                </button>
                            </div>

                            <div className="space-y-3">
                                {/* Mock Friend 1 */}
                                <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3 px-4 hover:bg-white/10 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold border border-blue-500/30">
                                            JD
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white">John Doe</p>
                                            <p className="text-xs text-gray-500">Online 2m ago</p>
                                        </div>
                                    </div>
                                    <button className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                    </button>
                                </div>

                                {/* Mock Friend 2 */}
                                <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3 px-4 hover:bg-white/10 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm font-bold border border-purple-500/30">
                                            SA
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white">Sarah Alvi</p>
                                            <p className="text-xs text-gray-500">In a Quiz</p>
                                        </div>
                                    </div>
                                    <button className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                    </button>
                                </div>

                                {/* Empty State Prompt */}
                                <div className="text-center pt-2">
                                    <button className="text-xs text-gray-500 hover:text-gray-300">View all friends</button>
                                </div>
                            </div>

                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="rounded-2xl border border-white/10 bg-black/40 p-5 sm:p-8 shadow-xl backdrop-blur-md"
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
            <DailyStreakFab />
        </div >
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

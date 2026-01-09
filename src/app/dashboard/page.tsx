'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import Link from 'next/link';

// --- Sub-components for Content ---

const DashboardHome = ({ user }: { user: any }) => (
    <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 p-8 shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
                <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {user.name.split(' ')[0]}! 👋</h2>
                <p className="text-indigo-100">You're on a {user.streak} day streak. Keep it up!</p>
            </div>
            <div className="absolute top-0 right-0 -mr-8 -mt-8 h-48 w-48 rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 h-32 w-32 rounded-full bg-black/20 blur-2xl"></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
                title="Level Progress"
                value={`Lvl ${user.level}`}
                subtext={`${user.currentExp} / ${user.maxExp} XP`}
                color="bg-blue-500/10 border-blue-500/20 text-blue-400"
                progress={(user.currentExp / user.maxExp) * 100}
            />
            <StatCard
                title="Quizzes Taken"
                value="12"
                subtext="Top 10% of learners"
                color="bg-green-500/10 border-green-500/20 text-green-400"
            />
            <StatCard
                title="Study Time"
                value="4h 20m"
                subtext="This week"
                color="bg-orange-500/10 border-orange-500/20 text-orange-400"
            />
        </div>

        {/* Recent Activity */}
        <div className="rounded-3xl bg-black/40 border border-white/5 p-6 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-white mb-4">Continue Learning</h3>
            <div className="space-y-3">
                <ActivityItem title="Advanced Calculus: Limits" type="Quiz" time="2 hours ago" status="Completed (85%)" />
                <ActivityItem title="History of Art: Renaissance" type="Flashcards" time="Yesterday" status="In Progress" />
            </div>
        </div>
    </div>
);

import { CreateExamModal } from '@/components/CreateExamModal';

const MockExams = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="space-y-6">
            <CreateExamModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

            <div className="flex justify-between items-center bg-indigo-900/20 p-6 rounded-3xl border border-indigo-500/20">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Mock Exam Simulator</h2>
                    <p className="text-indigo-200 text-sm">Generate full-length exams based on your syllabus.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all"
                >
                    + Create New Exam
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-black/40 border border-white/5 space-y-4">
                    <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">Active Exams</h3>
                    <div className="text-center py-8 text-gray-500 text-sm">
                        No active exams. Start one now!
                    </div>
                </div>
                <div className="p-6 rounded-3xl bg-black/40 border border-white/5 space-y-4">
                    <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">Past Results</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                            <div>
                                <p className="font-bold text-white">Physics Mid-Term</p>
                                <p className="text-xs text-gray-500">Dec 12, 2025</p>
                            </div>
                            <div className="text-green-400 font-bold">92%</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DashboardSettings = () => {
    const { user, updateProfile } = useUser();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateProfile({
            dashboardConfig: {
                ...user.dashboardConfig,
                bgColor: e.target.value
            }
        });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateProfile({
                    dashboardConfig: {
                        ...user.dashboardConfig,
                        bgColor: 'transparent', // Clear color if image is set? Or keep it as fallback.
                        bgImage: reader.result as string
                    }
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const clearImage = () => {
        updateProfile({
            dashboardConfig: {
                ...user.dashboardConfig,
                bgImage: null
            }
        });
    }

    return (
        <div className="max-w-2xl space-y-8">
            <div className="p-8 rounded-3xl bg-black/40 border border-white/5 backdrop-blur-sm">
                <h3 className="text-2xl font-bold text-white mb-6">Appearance</h3>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Dashboard Background Color</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="color"
                                value={user.dashboardConfig?.bgColor || '#000000'}
                                onChange={handleColorChange}
                                className="h-10 w-20 rounded cursor-pointer bg-transparent border border-white/20"
                            />
                            <span className="text-sm text-gray-500">{user.dashboardConfig?.bgColor}</span>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                        <label className="block text-sm font-medium text-gray-400 mb-3">Custom Background Image</label>
                        <div className="flex items-start gap-6">
                            <div
                                className="h-32 w-48 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center bg-black/20 overflow-hidden cursor-pointer hover:border-white/40 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {user.dashboardConfig?.bgImage ? (
                                    <img src={user.dashboardConfig.bgImage} className="h-full w-full object-cover" alt="Preview" />
                                ) : (
                                    <span className="text-gray-500 text-sm">Upload Image</span>
                                )}
                            </div>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    Choose File
                                </button>
                                {user.dashboardConfig?.bgImage && (
                                    <button
                                        onClick={clearImage}
                                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Remove Image
                                    </button>
                                )}
                                <p className="text-xs text-gray-500 max-w-[200px]">
                                    Supported formats: JPG, PNG, GIF. Max size: 5MB.
                                </p>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Helper Components ---

const StatCard = ({ title, value, subtext, color, progress }: any) => (
    <div className={`p-6 rounded-3xl border transition-all ${color} bg-opacity-10 backdrop-blur-md`}>
        <h3 className="text-sm font-medium opacity-80 mb-1">{title}</h3>
        <div className="text-3xl font-bold mb-1">{value}</div>
        <div className="text-xs opacity-60">{subtext}</div>
        {progress !== undefined && (
            <div className="mt-4 h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                <div className="h-full bg-current opacity-80" style={{ width: `${progress}%` }} />
            </div>
        )}
    </div>
);

const ActivityItem = ({ title, type, time, status }: any) => (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
        <div className="flex items-center gap-4">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-lg ${type === 'Quiz' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                {type === 'Quiz' ? '🧩' : '📑'}
            </div>
            <div>
                <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">{title}</h4>
                <p className="text-xs text-gray-400">{type} • {time}</p>
            </div>
        </div>
        <span className="text-xs font-medium text-gray-500 bg-black/30 px-3 py-1 rounded-full">{status}</span>
    </div>
);

// --- Main Page Component ---

export default function DashboardPage() {
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState('Home');
    const [isSidebarHovered, setIsSidebarHovered] = useState(false);

    // Dynamic Background Styles
    const bgStyle = user.dashboardConfig?.bgImage
        ? { backgroundImage: `url(${user.dashboardConfig.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : { backgroundColor: user.dashboardConfig?.bgColor || '#0a0a0a' };

    const menuItems = [
        { name: 'Home', icon: '🏠', component: <DashboardHome user={user} /> },
        { name: 'Mock Exams', icon: '📝', component: <MockExams /> },
        { name: 'AI Learning', icon: '🤖', component: <div className="text-gray-400">AI Learning Content Coming Soon</div> }, // Placeholder
        { name: 'Notes', icon: '📓', component: <div className="text-gray-400">Notes Content Coming Soon</div> },
        { name: 'Settings', icon: '⚙️', component: <DashboardSettings /> },
    ];

    return (
        <div className="flex min-h-screen text-white transition-colors duration-500" style={bgStyle}>
            {/* Overlay for readability if image is present */}
            {user.dashboardConfig?.bgImage && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] z-0 pointer-events-none" />
            )}

            {/* Sidebar */}
            <motion.aside
                className="fixed left-0 top-0 bottom-0 z-50 flex flex-col bg-black/80 backdrop-blur-xl border-r border-white/10 pt-24 pb-8"
                initial={{ width: '80px' }}
                animate={{ width: isSidebarHovered ? '280px' : '88px' }}
                onMouseEnter={() => setIsSidebarHovered(true)}
                onMouseLeave={() => setIsSidebarHovered(false)}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            >
                <div className="flex flex-col gap-2 px-4 w-full">
                    {menuItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => setActiveTab(item.name)}
                            className={`flex items-center gap-4 p-3 rounded-2xl transition-all overflow-hidden whitespace-nowrap group ${activeTab === item.name
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                                : 'text-gray-400 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            <span className="text-2xl min-w-[32px] flex justify-center">{item.icon}</span>

                            {/* Text label - animates in opacity */}
                            <motion.span
                                animate={{ opacity: isSidebarHovered ? 1 : 0 }}
                                className="font-bold text-sm"
                            >
                                {item.name}
                            </motion.span>
                        </button>
                    ))}
                </div>

                {/* User Mini Profile at bottom of sidebar */}
                <div className="mt-auto px-4 w-full overflow-hidden">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                        <div className="h-8 w-8 rounded-full bg-zinc-700 shrink-0 flex items-center justify-center text-xs font-bold border border-white/10">
                            {user.avatar ? <img src={user.avatar} className="h-full w-full rounded-full object-cover" /> : user.name[0]}
                        </div>
                        <motion.div
                            animate={{ opacity: isSidebarHovered ? 1 : 0 }}
                            className="flex flex-col truncate"
                        >
                            <span className="text-xs font-bold text-white truncate">{user.name}</span>
                            <span className="text-[10px] text-gray-500 truncate">Pro Account</span>
                        </motion.div>
                    </div>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="relative z-10 flex-1 pl-[88px] p-8 md:p-12 transition-all duration-300">
                <div className="max-w-7xl mx-auto pt-20">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <header className="mb-8">
                            <h1 className="text-4xl font-bold text-white mb-2">{activeTab}</h1>
                            <p className="text-gray-400">Manage your learning journey.</p>
                        </header>

                        {menuItems.find(item => item.name === activeTab)?.component}
                    </motion.div>
                </div>
            </main>
        </div>
    );
}

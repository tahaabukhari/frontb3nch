'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import Link from 'next/link';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// --- Sub-components for Content ---

const MOCK_HOME_DATA = [
    { day: 'Mon', score: 40 },
    { day: 'Tue', score: 55 },
    { day: 'Wed', score: 45 },
    { day: 'Thu', score: 70 },
    { day: 'Fri', score: 65 },
    { day: 'Sat', score: 85 },
    { day: 'Sun', score: 90 },
];


const DashboardHome = ({ user }: { user: any }) => (
    <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="rounded-3xl bg-primary p-8 shadow-2xl relative overflow-hidden transition-colors duration-300">
            <div className="relative z-10">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Welcome back, {user.name.split(' ')[0]}! 👋</h2>
                <p className="text-white/80">You're on a {user.streak} day streak. Keep it up!</p>
            </div>
            {/* Subtle Texture/Pattern instead of gradient */}
            <div className="absolute inset-0 opacity-10 bg-[url('/grid-pattern.png')]"></div>
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
            {/* Study Activity Graph */}
            <div className="md:col-span-2 rounded-3xl bg-zinc-900 border border-zinc-800 p-6 relative overflow-hidden">
                <div className="flex justify-between items-center mb-4 relative z-10">
                    <div>
                        <h3 className="text-sm font-medium opacity-80 text-white">Learning Velocity</h3>
                        <p className="text-xs text-gray-500">Points earned over last 7 days</p>
                    </div>
                    <div className="text-2xl font-bold text-primary">+450 XP</div>
                </div>
                <div className="h-[120px] w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={MOCK_HOME_DATA}>
                            <defs>
                                <linearGradient id="colorScoreHome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#7CB342" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#7CB342" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', fontSize: '12px' }}
                                itemStyle={{ color: '#fff' }}
                                cursor={{ stroke: '#ffffff20' }}
                            />
                            <Area type="monotone" dataKey="score" stroke="#7CB342" strokeWidth={3} fillOpacity={1} fill="url(#colorScoreHome)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* Recent Activity & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
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
            </div>

            <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 h-full">
                <h3 className="text-xl font-bold text-white mb-4">Continue Learning</h3>
                <div className="space-y-3">
                    <ActivityItem title="Advanced Calculus: Limits" type="Quiz" time="2 hours ago" status="Completed (85%)" />
                    <ActivityItem title="History of Art: Renaissance" type="Flashcards" time="Yesterday" status="In Progress" />
                </div>
            </div>
        </div>
    </div>
);

import { CreateExamModal } from '@/components/CreateExamModal';
import { NotesSection } from '@/components/dashboard/NotesSection';
import { UserManagement } from '@/components/dashboard/UserManagement';

const MockExams = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="space-y-6">
            <CreateExamModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

            <div className="flex justify-between items-center bg-zinc-900 p-6 rounded-3xl border border-zinc-800">
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
                <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
                    <h3 className="text-lg font-bold text-white border-b border-zinc-800 pb-2">Active Exams</h3>
                    <div className="text-center py-8 text-gray-500 text-sm">
                        No active exams. Start one now!
                    </div>
                </div>
                <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
                    <h3 className="text-lg font-bold text-white border-b border-zinc-800 pb-2">Past Results</h3>
                    <div className="text-center py-8 text-gray-500 text-sm">
                        Exam history coming soon.
                    </div>
                </div>
            </div>
        </div>
    );
};

const DashboardSettings = () => {
    const { user, updateProfile } = useUser();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleColorChange = (key: string, value: string) => {
        updateProfile({
            dashboardConfig: {
                ...user.dashboardConfig,
                [key]: value
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
            <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800">
                <h3 className="text-2xl font-bold text-white mb-6">Appearance</h3>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Primary Color (Brand)</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="color"
                                value={user.dashboardConfig?.primaryColor || '#7CB342'}
                                onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                                className="h-10 w-20 rounded cursor-pointer bg-transparent border border-white/20"
                            />
                            <span className="text-sm text-gray-500">{user.dashboardConfig?.primaryColor}</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Accent Color (Highlights)</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="color"
                                value={user.dashboardConfig?.accentColor || '#ffffff'}
                                onChange={(e) => handleColorChange('accentColor', e.target.value)}
                                className="h-10 w-20 rounded cursor-pointer bg-transparent border border-white/20"
                            />
                            <span className="text-sm text-gray-500">{user.dashboardConfig?.accentColor}</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Dashboard Background Color</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="color"
                                value={user.dashboardConfig?.bgColor || '#000000'}
                                onChange={(e) => handleColorChange('bgColor', e.target.value)}
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
    <div className={`p-6 rounded-3xl border transition-all ${color ? color.replace('bg-opacity-10', '').replace('backdrop-blur-md', '') : 'border-zinc-800'} bg-zinc-900`}>
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
    <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 transition-colors cursor-pointer group border border-zinc-800">
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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    // Dynamic Background Styles
    const bgStyle = user.dashboardConfig?.bgImage
        ? { backgroundImage: `url(${user.dashboardConfig.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : { backgroundColor: user.dashboardConfig?.bgColor || '#0a0a0a' };

    const menuItems = [
        { name: 'Home', icon: '🏠', component: <DashboardHome user={user} /> },
        { name: 'Mock Exams', icon: '📝', component: <MockExams /> },
        { name: 'AI Learning', icon: '🤖', component: <div className="text-gray-400">AI Learning Content Coming Soon</div> }, // Placeholder
        { name: 'Notes', icon: '📓', component: <NotesSection /> },
        { name: 'Settings', icon: '⚙️', component: <DashboardSettings /> },
    ];

    const SidebarContent = () => (
        <>
            <div className="flex flex-col gap-2 px-4 w-full flex-1">
                {menuItems.map((item) => (
                    <button
                        key={item.name}
                        onClick={() => {
                            setActiveTab(item.name);
                            setIsMobileMenuOpen(false);
                        }}
                        className={`flex items-center gap-4 p-3 rounded-xl transition-all overflow-hidden whitespace-nowrap group text-left ${activeTab === item.name
                            ? 'bg-primary text-white shadow-md'
                            : 'text-gray-400 hover:bg-zinc-800 hover:text-white'
                            }`}
                    >
                        <span className="text-xl min-w-[24px] flex justify-center">{item.icon}</span>

                        {/* Text label */}
                        <span className="font-semibold text-sm">
                            {item.name}
                        </span>
                    </button>
                ))}
            </div>

            {/* User Mini Profile at bottom of sidebar */}
            {/* User Mini Profile at bottom of sidebar */}
            <div className="mt-auto px-4 w-full">
                <button
                    onClick={() => setIsUserMenuOpen(true)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900 border border-zinc-800 w-full hover:bg-zinc-800 transition-colors text-left"
                >
                    <div className="h-10 w-10 rounded-full bg-zinc-700 shrink-0 flex items-center justify-center text-sm font-bold border border-zinc-600">
                        {user.avatar ? <img src={user.avatar} className="h-full w-full rounded-full object-cover" /> : user.name[0]}
                    </div>
                    <div className="flex flex-col truncate">
                        <span className="text-sm font-bold text-white truncate">{user.name}</span>
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-primary truncate">Lvl {user.level}</span>
                            <span className="text-[10px] text-gray-500">• View Profile</span>
                        </div>
                    </div>
                </button>
            </div>
        </>
    );

    return (
        <div className="flex min-h-screen text-white transition-colors duration-500 flex-col md:flex-row" style={bgStyle}>
            {/* Overlay for readability if image is present */}
            {user.dashboardConfig?.bgImage && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] z-0 pointer-events-none" />
            )}

            <UserManagement isOpen={isUserMenuOpen} onClose={() => setIsUserMenuOpen(false)} />

            {/* Dashboard Mobile Sidebar Toggle - Visible only on mobile, placed to the left of the navbar */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden fixed top-4 left-4 z-[101] h-12 w-12 flex items-center justify-center rounded-full bg-black/90 border border-white/10 text-white shadow-xl active:scale-95 transition-all"
                aria-label="Toggle Dashboard Menu"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 z-50 md:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed left-0 top-0 bottom-0 w-[280px] bg-zinc-950 z-50 flex flex-col pt-24 pb-8 border-r border-white/10 md:hidden"
                        >
                            <div className="px-6 mb-8 flex justify-between items-center">
                                <span className="text-xl font-bold">Menu</span>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400">✕</button>
                            </div>
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <motion.aside
                className="fixed left-0 top-0 bottom-0 z-50 hidden md:flex flex-col bg-zinc-950 border-r border-zinc-900 pt-24 pb-8 shadow-xl"
                initial={{ width: '280px' }}
                animate={{ width: '280px' }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            >
                <SidebarContent />
            </motion.aside>

            {/* Main Content */}
            <main className="relative z-10 flex-1 p-4 md:pl-[280px] md:p-12 transition-all duration-300">
                {/* CSS Variables Injection */}
                <style jsx global>{`
                    :root {
                        --color-primary: ${user.dashboardConfig?.primaryColor || '#7CB342'};
                        --color-accent: ${user.dashboardConfig?.accentColor || '#ffffff'};
                    }
                `}</style>
                <div className="max-w-7xl mx-auto pt-24 md:pt-20">
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

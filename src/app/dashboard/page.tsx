'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Mock Component Placeholders for Dashboard Features
const DashboardHome = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                <h3 className="text-xl font-bold text-white mb-2">Recent Progress</h3>
                <p className="text-gray-400">You've completed 3 quizzes this week.</p>
                <div className="mt-4 h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[60%]"></div>
                </div>
            </div>
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                <h3 className="text-xl font-bold text-white mb-2">Study Streak</h3>
                <div className="text-4xl font-bold text-white">5 <span className="text-lg text-gray-500 font-normal">days</span></div>
                <p className="text-gray-400 mt-2">Keep it up! 🔥</p>
            </div>
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                <h3 className="text-xl font-bold text-white mb-2">Goals</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                    <li className="flex items-center gap-2">✅ Master Biology Ch. 3</li>
                    <li className="flex items-center gap-2">⬜ Complete Physics Quiz</li>
                </ul>
            </div>
        </div>
    </div>
);

const AILearning = () => (
    <div className="p-8 rounded-3xl bg-indigo-900/20 border border-indigo-500/20 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">AI Learning Companion</h2>
        <p className="text-indigo-200 mb-6">Your personalized AI tutor is ready to help you master new topics.</p>
        <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold transition-all transform hover:scale-105">
            Start a Session
        </button>
    </div>
);

const Notes = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((note) => (
            <div key={note} className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">Chemistry</span>
                    <span className="text-xs text-gray-500">2 days ago</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Lecture {note}: Organic Compounds</h3>
                <p className="text-sm text-gray-400 line-clamp-3">
                    Introduction to carbon bonding properties and the vast array of structures that carbon can form...
                </p>
            </div>
        ))}
        <div className="p-6 rounded-3xl border-2 border-dashed border-white/10 flex items-center justify-center text-gray-400 hover:border-white/30 hover:text-white transition-all cursor-pointer min-h-[200px]">
            + New Note
        </div>
    </div>
);

const GroupStudy = () => (
    <div className="space-y-4">
        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-lg font-bold text-white">BIO</div>
                <div>
                    <h3 className="text-lg font-bold text-white">Biology Pros</h3>
                    <p className="text-sm text-gray-400">5 members • Active now</p>
                </div>
            </div>
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-bold text-white transition-all">Join Room</button>
        </div>
    </div>
);

const Settings = () => (
    <div className="max-w-2xl space-y-6">
        <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Account</h3>
            <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-gray-400">Email</span>
                    <span className="text-white">guest@frontb3nch.app</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-gray-400">Username</span>
                    <span className="text-white">StudentOne</span>
                </div>
            </div>
        </div>
    </div>
);


export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState('Home');

    const menuItems = [
        { name: 'Home', icon: '🏠', component: <DashboardHome /> },
        { name: 'AI Learning', icon: '🤖', component: <AILearning /> },
        { name: 'Notes', icon: '📝', component: <Notes /> },
        { name: 'Group Study', icon: '👥', component: <GroupStudy /> },
        { name: 'Settings', icon: '⚙️', component: <Settings /> },
    ];

    return (
        <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
                <span className="text-xs font-bold px-2 py-1 rounded bg-green-500/20 text-green-400 border border-green-500/20">BETA</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar / Navigation */}
                <aside className="w-full lg:w-64 flex-shrink-0">
                    <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0">
                        {menuItems.map((item) => (
                            <button
                                key={item.name}
                                onClick={() => setActiveTab(item.name)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === item.name
                                        ? 'bg-white text-black shadow-lg shadow-white/10'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                {item.name}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 min-h-[500px]">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-white mb-1">{activeTab}</h2>
                            <p className="text-gray-500 text-sm">Manage your {activeTab.toLowerCase()} content here.</p>
                        </div>
                        {menuItems.find(item => item.name === activeTab)?.component}
                    </motion.div>
                </div>
            </div>
        </main>
    );
}


import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import { LeaderboardSection } from './LeaderboardSection';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const MOCK_PROGRESSION_DATA = [
    { day: 'Mon', score: 65, accuracy: 70 },
    { day: 'Tue', score: 75, accuracy: 75 },
    { day: 'Wed', score: 72, accuracy: 72 },
    { day: 'Thu', score: 85, accuracy: 80 },
    { day: 'Fri', score: 82, accuracy: 85 },
    { day: 'Sat', score: 90, accuracy: 88 },
    { day: 'Sun', score: 95, accuracy: 92 },
];

export const UserManagement = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const { user, updateProfile } = useUser();
    const [activeTab, setActiveTab] = useState('Profile');
    const [searchUid, setSearchUid] = useState('');

    if (!isOpen) return null;

    const tabs = [
        { id: 'Profile', icon: '👤', label: 'Profile' },
        { id: 'Leaderboard', icon: '🏆', label: 'Leaderboard' },
        { id: 'Friends', icon: '👥', label: 'Friends' },
        { id: 'Account', icon: '⚙️', label: 'Settings' },
    ];

    const renderContent = () => {
        return (
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
            >
                {activeTab === 'Profile' && (
                    <div className="space-y-6">
                        <div className="flex flex-col items-center text-center p-8 bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
                            {/* Background accent */}
                            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

                            <div className="relative mb-6 group">
                                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-zinc-800 shadow-xl ring-4 ring-primary/20 transition-transform group-hover:scale-105">
                                    {user.avatar ?
                                        <img src={user.avatar} className="w-full h-full object-cover" /> :
                                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-4xl font-bold text-gray-400">{user.name[0]}</div>
                                    }
                                </div>
                                <div className="absolute -bottom-2 relative left-1/2 -translate-x-1/2 bg-zinc-900 text-primary text-xs font-bold px-3 py-1 rounded-full border border-zinc-700 shadow-lg">
                                    Lvl {user.level}
                                </div>
                            </div>

                            <h2 className="text-3xl font-bold text-white mb-2">{user.name}</h2>
                            <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 bg-black/20 px-3 py-1 rounded-full border border-white/5">
                                <span>UID:</span>
                                <span className="font-mono text-primary select-all">{user.uid}</span>
                            </div>

                            <div className="w-full max-w-lg mb-8">
                                <p className="text-gray-300 italic text-center text-lg leading-relaxed">
                                    "{user.description || 'No description set.'}"
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
                                <div className="p-4 bg-black/20 rounded-2xl border border-white/5 backdrop-blur-sm">
                                    <div className="text-3xl font-bold text-white mb-1">{user.streak}🔥</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Day Streak</div>
                                </div>
                                <div className="p-4 bg-black/20 rounded-2xl border border-white/5 backdrop-blur-sm">
                                    <div className="text-3xl font-bold text-white mb-1">{user.currentExp.toLocaleString()}</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Total earned XP</div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-zinc-900/50 rounded-3xl border border-zinc-800">
                            <h3 className="text-lg font-bold text-white mb-6">Performance History</h3>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={MOCK_PROGRESSION_DATA}>
                                        <defs>
                                            <linearGradient id="colorScoreProfile" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#7CB342" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#7CB342" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }}
                                            itemStyle={{ color: '#fff' }}
                                            cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                                        />
                                        <Area type="monotone" dataKey="score" stroke="#7CB342" strokeWidth={3} fillOpacity={1} fill="url(#colorScoreProfile)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'Leaderboard' && (
                    <div className="h-full">
                        <LeaderboardSection />
                    </div>
                )}

                {activeTab === 'Friends' && (
                    <div className="space-y-6">
                        <div className="p-8 bg-zinc-900/50 rounded-3xl border border-zinc-800 text-center">
                            <h3 className="text-2xl font-bold text-white mb-2">Connect with Peers</h3>
                            <p className="text-gray-400 mb-8 max-w-md mx-auto">Find friends by their unique ID to compare stats and challenge them.</p>

                            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                                <input
                                    type="text"
                                    placeholder="Enter Friend UID (e.g. 8493...)"
                                    value={searchUid}
                                    onChange={(e) => setSearchUid(e.target.value)}
                                    className="flex-1 bg-black/30 border border-zinc-700 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                />
                                <button className="bg-primary hover:bg-green-500 text-black font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-primary/20">
                                    Search
                                </button>
                            </div>

                            {searchUid && (
                                <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-200 text-sm animate-in fade-in slide-in-from-top-2">
                                    🔍 Searching global database for <strong>{searchUid}</strong>... <br />
                                    <span className="opacity-60 text-xs mt-1 block">(Simulation: No user found)</span>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 bg-zinc-900/30 rounded-3xl border border-zinc-800 min-h-[200px] flex flex-col items-center justify-center text-center">
                                <div className="text-4xl mb-4 opacity-30">📬</div>
                                <h3 className="text-lg font-bold text-white mb-1">Friend Requests</h3>
                                <p className="text-gray-500 text-sm">No pending requests.</p>
                            </div>
                            <div className="p-6 bg-zinc-900/30 rounded-3xl border border-zinc-800 min-h-[200px] flex flex-col items-center justify-center text-center">
                                <div className="text-4xl mb-4 opacity-30">👥</div>
                                <h3 className="text-lg font-bold text-white mb-1">Your Friends</h3>
                                <p className="text-gray-500 text-sm">You haven't added anyone yet.</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'Account' && (
                    <div className="space-y-6">
                        <div className="p-8 bg-zinc-900/50 rounded-3xl border border-zinc-800">
                            <h3 className="text-2xl font-bold text-white mb-8">Edit Public Profile</h3>
                            <div className="space-y-6 max-w-2xl">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Display Name</label>
                                    <input
                                        type="text"
                                        value={user.name}
                                        onChange={(e) => updateProfile({ name: e.target.value })}
                                        className="w-full bg-black/30 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Bio / Description</label>
                                    <textarea
                                        value={user.description || ''}
                                        onChange={(e) => updateProfile({ description: e.target.value })}
                                        className="w-full bg-black/30 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary h-32 resize-none transition-all"
                                        placeholder="Tell other scholars about your goals..."
                                    />
                                    <p className="text-right text-xs text-gray-500 mt-2">
                                        {(user.description?.length || 0)} / 150 characters
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-red-500/5 rounded-3xl border border-red-500/10 flex items-center justify-between">
                            <div>
                                <h4 className="text-red-400 font-bold mb-1">Danger Zone</h4>
                                <p className="text-red-400/60 text-sm">Irreversible actions regarding your account.</p>
                            </div>
                            <button className="px-4 py-2 border border-red-500/30 text-red-400 rounded-lg text-sm hover:bg-red-500/10 transition-colors">
                                Delete Account
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        );
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] md:p-8 flex items-end md:items-center justify-center"
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '100%', opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="bg-zinc-950 w-full md:max-w-6xl h-[92vh] md:h-[85vh] rounded-t-[2rem] md:rounded-[2rem] border border-zinc-800 shadow-2xl flex flex-col md:flex-row overflow-hidden relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button Mobile/Desktop */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-white/10 text-white rounded-full transition-colors md:hidden"
                    >
                        ✕
                    </button>

                    {/* Navigation Sidebar (Desktop) / Top Bar (Mobile) */}
                    <div className="w-full md:w-72 bg-zinc-900/80 border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col backdrop-blur-xl z-20">
                        <div className="p-6 hidden md:block">
                            <h2 className="text-2xl font-bold text-white">User Menu</h2>
                            <p className="text-gray-500 text-sm">Manage your identity.</p>
                        </div>

                        {/* Tabs Container */}
                        <div className="flex md:flex-col overflow-x-auto md:overflow-visible gap-1 md:gap-2 p-2 md:p-4 scrollbar-hide">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap md:w-full text-left relative overflow-hidden group ${activeTab === tab.id
                                            ? 'bg-primary text-black font-bold shadow-lg shadow-primary/20'
                                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <span className="text-xl relative z-10">{tab.icon}</span>
                                    <span className="relative z-10">{tab.label}</span>
                                    {activeTab === tab.id && <motion.div layoutId="activeTabBg" className="absolute inset-0 bg-primary z-0" />}
                                </button>
                            ))}
                        </div>

                        <div className="mt-auto p-4 hidden md:block border-t border-white/5">
                            <button onClick={onClose} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-zinc-700 text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
                                Close Menu
                            </button>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden relative bg-black/20">
                        {/* Mobile Header Spacer */}
                        <div className="h-4 md:hidden" />

                        <div className="p-4 md:p-8 md:max-w-4xl mx-auto">
                            <AnimatePresence mode="wait">
                                {renderContent()}
                            </AnimatePresence>
                        </div>

                        {/* Bottom padding for mobile scrolling */}
                        <div className="h-20 md:hidden" />
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

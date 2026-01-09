
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import { LeaderboardSection } from './LeaderboardSection';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

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

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    const tabs = [
        { id: 'Profile', icon: '👤', label: 'Profile' },
        { id: 'Leaderboard', icon: '🏆', label: 'Leaderboard' },
        { id: 'Friends', icon: '👥', label: 'Find Friends' },
        { id: 'Account', icon: '⚙️', label: 'Settings' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'Profile':
                return (
                    <div className="space-y-6">
                        <div className="flex flex-col items-center text-center p-6 bg-zinc-900/50 rounded-3xl border border-zinc-800">
                            <div className="relative mb-4">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary shadow-2xl">
                                    {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-zinc-700 flex items-center justify-center text-3xl font-bold">{user.name[0]}</div>}
                                </div>
                                <div className="absolute bottom-0 right-0 bg-primary text-black text-xs font-bold px-2 py-1 rounded-full border border-black">
                                    Lvl {user.level}
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                            <p className="text-gray-400 text-sm mb-4">UID: <span className="font-mono text-primary">{user.uid}</span></p>
                            <p className="text-gray-300 italic max-w-md">"{user.description || 'No description set.'}"</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800 text-center">
                                <div className="text-2xl font-bold text-white">{user.streak}🔥</div>
                                <div className="text-xs text-gray-400">Day Streak</div>
                            </div>
                            <div className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800 text-center">
                                <div className="text-2xl font-bold text-white">{user.currentExp} XP</div>
                                <div className="text-xs text-gray-400">Total earned</div>
                            </div>
                        </div>

                        <div className="p-6 bg-zinc-900/50 rounded-3xl border border-zinc-800">
                            <h3 className="text-lg font-bold text-white mb-4">Performance</h3>
                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={MOCK_PROGRESSION_DATA}>
                                        <defs>
                                            <linearGradient id="colorScoreProfile" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#7CB342" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#7CB342" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="day" hide />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Area type="monotone" dataKey="score" stroke="#7CB342" strokeWidth={2} fillOpacity={1} fill="url(#colorScoreProfile)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                );
            case 'Leaderboard':
                return <LeaderboardSection />;
            case 'Friends':
                return (
                    <div className="space-y-6">
                        <div className="p-6 bg-zinc-900/50 rounded-3xl border border-zinc-800">
                            <h3 className="text-xl font-bold text-white mb-4">Find Friends</h3>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Enter Friend UID..."
                                    value={searchUid}
                                    onChange={(e) => setSearchUid(e.target.value)}
                                    className="flex-1 bg-black/30 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                                />
                                <button className="bg-primary hover:bg-green-600 text-white font-bold px-6 py-3 rounded-xl transition-all">
                                    Search
                                </button>
                            </div>
                            {searchUid && (
                                <div className="mt-8 text-center text-gray-500 py-8">
                                    Searching for {searchUid}... <br /> <span className="text-xs text-gray-600">(Mock Search: No users found)</span>
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-zinc-900/50 rounded-3xl border border-zinc-800">
                            <h3 className="text-xl font-bold text-white mb-4">Friend Requests</h3>
                            <div className="text-center text-gray-500 py-8">
                                No pending requests.
                            </div>
                        </div>
                    </div>
                );
            case 'Account':
                return (
                    <div className="space-y-6">
                        <div className="p-6 bg-zinc-900/50 rounded-3xl border border-zinc-800">
                            <h3 className="text-xl font-bold text-white mb-4">Edit Profile</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Display Name</label>
                                    <input
                                        type="text"
                                        value={user.name}
                                        onChange={(e) => updateProfile({ name: e.target.value })}
                                        className="w-full bg-black/30 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Bio / Description</label>
                                    <textarea
                                        value={user.description || ''}
                                        onChange={(e) => updateProfile({ description: e.target.value })}
                                        className="w-full bg-black/30 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary h-24 resize-none"
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>
                            </div>
                        </div>
                        {/* More settings could go here */}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 md:p-8"
                onClick={handleBackdropClick}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="bg-zinc-950 w-full max-w-5xl h-[85vh] rounded-[2rem] border border-zinc-800 shadow-2xl overflow-hidden flex flex-col md:flex-row"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Sidebar for Modal */}
                    <div className="w-full md:w-64 bg-zinc-900/50 border-b md:border-b-0 md:border-r border-zinc-800 p-4 md:p-6 flex flex-col gap-2">
                        <h2 className="text-xl font-bold text-white mb-6 px-2 hidden md:block">User Menu</h2>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${activeTab === tab.id ? 'bg-primary text-white font-bold shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <span className="text-lg">{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}

                        <div className="mt-auto pt-4 border-t border-zinc-800">
                            <button onClick={onClose} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-zinc-700 text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
                                Close
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
                        {renderContent()}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

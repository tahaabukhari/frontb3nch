import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { useUser } from '@/context/UserContext';

// Mock Data for Leaderboard
const MOCK_LEADERBOARD = [
    { id: 1, name: 'Alex Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', score: 9850, level: 42, accuracy: 96, library: 85, isCurrentUser: false },
    { id: 2, name: 'Sam Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam', score: 9200, level: 38, accuracy: 92, library: 78, isCurrentUser: false },
    { id: 3, name: 'Jordan Lee', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan', score: 8900, level: 35, accuracy: 88, library: 90, isCurrentUser: false },
    { id: 4, name: 'Casey Wolf', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Casey', score: 8500, level: 33, accuracy: 85, library: 60, isCurrentUser: false },
    { id: 5, name: 'Jamie Doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jamie', score: 8200, level: 31, accuracy: 89, library: 72, isCurrentUser: false },
];

const MOCK_PROGRESSION_DATA = [
    { day: 'Mon', score: 65, accuracy: 70 },
    { day: 'Tue', score: 75, accuracy: 75 },
    { day: 'Wed', score: 72, accuracy: 72 },
    { day: 'Thu', score: 85, accuracy: 80 },
    { day: 'Fri', score: 82, accuracy: 85 },
    { day: 'Sat', score: 90, accuracy: 88 },
    { day: 'Sun', score: 95, accuracy: 92 },
];

export const LeaderboardSection = () => {
    const { user } = useUser();
    const [sortBy, setSortBy] = useState<'score' | 'level' | 'accuracy' | 'library'>('score');
    const [insight, setInsight] = useState("Analyzing your learning patterns...");
    const [isGenerating, setIsGenerating] = useState(false);

    // Initial "AI" Insight Generation
    useEffect(() => {
        const insights = [
            "You're performing exceptionaly well in Calculus! Consistent practice is boosting your accuracy.",
            "Your study streak is impressive. Try tackling a Mock Exam to test your retention.",
            "Great job on the latest quiz! Focus on 'Organic Chemistry' to improve your library coverage.",
            "Your accuracy has increased by 15% this week. Keep up the momentum!"
        ];
        // Simulate 'AI' delay
        const timer = setTimeout(() => {
            setInsight(insights[Math.floor(Math.random() * insights.length)]);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const handleSort = (criteria: 'score' | 'level' | 'accuracy' | 'library') => {
        setSortBy(criteria);
    };

    const sortedLeaderboard = [...MOCK_LEADERBOARD, {
        id: 999, // Current User
        name: user.name || 'You',
        avatar: user.avatar,
        score: user.currentExp * 10 || 5000,
        level: user.level || 1,
        accuracy: 85, // Mock value if not in user object
        library: 40, // Mock value
        isCurrentUser: true
    }].sort((a, b) => b[sortBy] - a[sortBy]);


    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Top Section: Profile & key Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Profile Card */}
                <div className="lg:col-span-1 rounded-3xl bg-zinc-900 border border-zinc-800 p-6 flex flex-col items-center text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10 w-24 h-24 rounded-full border-4 border-zinc-800 overflow-hidden mb-4 shadow-xl">
                        {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-zinc-700 flex items-center justify-center text-3xl font-bold">{user.name?.[0]}</div>}
                    </div>
                    <h2 className="relative z-10 text-2xl font-bold text-white max-w-full truncate px-2">{user.name}</h2>
                    <p className="relative z-10 text-primary font-medium mb-6">Level {user.level} Scholar</p>

                    <div className="relative z-10 grid grid-cols-2 gap-4 w-full">
                        <div className="p-3 rounded-2xl bg-black/20 backdrop-blur-sm">
                            <div className="text-2xl font-bold text-white">85%</div>
                            <div className="text-xs text-gray-400">Avg. Accuracy</div>
                        </div>
                        <div className="p-3 rounded-2xl bg-black/20 backdrop-blur-sm">
                            <div className="text-2xl font-bold text-white">Top 5%</div>
                            <div className="text-xs text-gray-400">Global Rank</div>
                        </div>
                    </div>
                </div>

                {/* Progression Graph & AI Insight */}
                <div className="lg:col-span-2 space-y-6">
                    {/* AI Insight */}
                    <div className="rounded-3xl bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-20">
                            <span className="text-6xl">✨</span>
                        </div>
                        <h3 className="flex items-center gap-2 text-indigo-300 font-bold mb-2">
                            <span className="text-xl">🤖</span> AI Learning Insight
                        </h3>
                        <p className="text-white/90 text-lg font-medium leading-relaxed">
                            "{insight}"
                        </p>
                    </div>

                    {/* Chart */}
                    <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 h-[260px]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-white">Weekly Progression</h3>
                            <select className="bg-black/30 text-xs text-gray-400 rounded-lg px-2 py-1 border border-zinc-700 outline-none">
                                <option>This Week</option>
                                <option>Last Month</option>
                            </select>
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={MOCK_PROGRESSION_DATA}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#7CB342" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#7CB342" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="day" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="score" stroke="#7CB342" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Leaderboard Section */}
            <div className="rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden">
                <div className="p-6 border-b border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Leaderboards</h2>
                        <p className="text-gray-400 text-sm">See where you stand among the top scholars.</p>
                    </div>

                    {/* Sorting Tabs */}
                    <div className="flex bg-black/40 p-1 rounded-xl overflow-x-auto max-w-full">
                        {[
                            { id: 'score', label: 'Game Score' },
                            { id: 'level', label: 'Level' },
                            { id: 'accuracy', label: 'Quiz Accuracy' },
                            { id: 'library', label: 'Library Covered' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleSort(tab.id as any)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${sortBy === tab.id
                                    ? 'bg-zinc-700 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-zinc-800/50'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {/* Desktop Table */}
                    <table className="w-full text-left hidden md:table">
                        <thead className="bg-zinc-950/50 text-gray-500 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="p-4 font-medium">Rank</th>
                                <th className="p-4 font-medium">Player</th>
                                <th className="p-4 font-medium text-right">
                                    {sortBy === 'score' ? 'Game Score' :
                                        sortBy === 'level' ? 'Level' :
                                            sortBy === 'accuracy' ? 'Accuracy' : 'Library %'}
                                </th>
                                <th className="p-4 font-medium text-right hidden lg:table-cell">Badge</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {sortedLeaderboard.map((player, index) => (
                                <tr
                                    key={player.id}
                                    className={`group hover:bg-zinc-800/30 transition-colors ${player.isCurrentUser ? 'bg-primary/10 hover:bg-primary/20' : ''}`}
                                >
                                    <td className="p-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                            ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                                                index === 1 ? 'bg-gray-400/20 text-gray-300' :
                                                    index === 2 ? 'bg-orange-500/20 text-orange-400' : 'text-gray-500'}
                                        `}>
                                            #{index + 1}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700">
                                                <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <div className={`font-bold ${player.isCurrentUser ? 'text-primary' : 'text-white'}`}>
                                                    {player.name} {player.isCurrentUser && '(You)'}
                                                </div>
                                                <div className="text-xs text-gray-500">Lvl {player.level}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right font-mono text-lg font-bold text-white">
                                        {sortBy === 'score' && player.score.toLocaleString()}
                                        {sortBy === 'level' && player.level}
                                        {sortBy === 'accuracy' && `${player.accuracy}%`}
                                        {sortBy === 'library' && `${player.library}%`}
                                    </td>
                                    <td className="p-4 text-right hidden lg:table-cell">
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-800 text-gray-400 border border-zinc-700">
                                            {index < 3 ? 'Elite Scholar' : 'Student'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-2 p-4">
                        {sortedLeaderboard.map((player, index) => (
                            <div
                                key={player.id}
                                className={`flex items-center gap-4 p-4 rounded-2xl border ${player.isCurrentUser
                                        ? 'bg-primary/10 border-primary/30'
                                        : 'bg-zinc-800/30 border-zinc-700/50'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0
                                    ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                                        index === 1 ? 'bg-gray-400/20 text-gray-300' :
                                            index === 2 ? 'bg-orange-500/20 text-orange-400' : 'text-gray-500'}
                                `}>
                                    #{index + 1}
                                </div>

                                <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 shrink-0">
                                    <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className={`font-bold truncate ${player.isCurrentUser ? 'text-primary' : 'text-white'}`}>
                                        {player.name}
                                    </div>
                                    <div className="text-xs text-gray-500">Lvl {player.level}</div>
                                </div>

                                <div className="text-right">
                                    <div className="font-mono font-bold text-white">
                                        {sortBy === 'score' && player.score.toLocaleString()}
                                        {sortBy === 'level' && player.level}
                                        {sortBy === 'accuracy' && `${player.accuracy}%`}
                                        {sortBy === 'library' && `${player.library}%`}
                                    </div>
                                    <div className="text-[10px] text-gray-500 uppercase">
                                        {sortBy === 'score' ? 'Score' :
                                            sortBy === 'level' ? 'Level' :
                                                sortBy === 'accuracy' ? 'Acc' : 'Lib'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

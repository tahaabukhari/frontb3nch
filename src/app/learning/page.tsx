'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const LearningPage = () => {
    return (
        <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-24">

            {/* Top Gradient from Navbar */}
            <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-primary/20 to-transparent pointer-events-none z-[-1]" />

            {/* Hero Section */}
            <section className="text-center space-y-6 pt-10">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl md:text-7xl font-extrabold text-white tracking-tight"
                >
                    Learning, <span className="text-primary">Evolved.</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
                >
                    Experience a revolutionary way to study that combines <span className="text-primary font-semibold">AI-driven acceleration</span> with engaging <span className="text-primary font-semibold">gamification</span>.
                </motion.p>
            </section>

            {/* Gamification & Acceleration Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Gamification Card */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="p-8 rounded-3xl bg-zinc-900/50 border border-white/10 backdrop-blur-sm hover:border-primary/50 transition-all group"
                >
                    <div className="h-16 w-16 mb-6 rounded-2xl bg-primary/20 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                        🎮
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">Gamified Progression</h2>
                    <p className="text-gray-400 text-lg leading-relaxed">
                        Turn studying into an addiction in the best way possible. Earn XP, maintain streaks, and unlock achievements as you master new topics. We use game design principles to keep you motivated and consistent.
                    </p>
                    <ul className="mt-6 space-y-3">
                        <li className="flex items-center gap-3 text-gray-300">
                            <span className="text-primary">⚡</span> Daily Streaks & Rewards
                        </li>
                        <li className="flex items-center gap-3 text-gray-300">
                            <span className="text-primary">🏆</span> Global Leaderboards
                        </li>
                        <li className="flex items-center gap-3 text-gray-300">
                            <span className="text-primary">🎯</span> Skill Tiers & Badges
                        </li>
                    </ul>
                </motion.div>

                {/* Acceleration Card */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="p-8 rounded-3xl bg-zinc-900/50 border border-white/10 backdrop-blur-sm hover:border-primary/50 transition-all group"
                >
                    <div className="h-16 w-16 mb-6 rounded-2xl bg-primary/20 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                        🚀
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">Accelerated Learning</h2>
                    <p className="text-gray-400 text-lg leading-relaxed">
                        Stop wasting time on efficient methods. Our AI analyzes your weak points and adapts the curriculum in real-time, ensuring you spend effort exactly where it's needed most for maximum retention.
                    </p>
                    <ul className="mt-6 space-y-3">
                        <li className="flex items-center gap-3 text-gray-300">
                            <span className="text-primary">🤖</span> Smart AI Tutors
                        </li>
                        <li className="flex items-center gap-3 text-gray-300">
                            <span className="text-primary">🧠</span> Spaced Repetition
                        </li>
                        <li className="flex items-center gap-3 text-gray-300">
                            <span className="text-primary">📊</span> Instant Performance Analytics
                        </li>
                    </ul>
                </motion.div>
            </section>

            {/* Library Section */}
            <motion.section
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative p-10 rounded-[2.5rem] bg-zinc-900/80 border border-white/10 overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 space-y-6">
                        <h2 className="text-4xl font-bold text-white">Structured Academic Library</h2>
                        <p className="text-xl text-gray-400">
                            A comprehensive ecosystem designed for academic success. Our library isn't just a collection of files—it's a structured pathway through your curriculum.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <h3 className="font-bold text-white mb-1">Curriculum Aligned</h3>
                                <p className="text-sm text-gray-500">Content mapped to standard academic requirements.</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <h3 className="font-bold text-white mb-1">Smart Search</h3>
                                <p className="text-sm text-gray-500">Find exactly what you need in seconds.</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <h3 className="font-bold text-white mb-1">Progress Tracking</h3>
                                <p className="text-sm text-gray-500">Visual indicators for completed modules.</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <h3 className="font-bold text-white mb-1">Resource Linking</h3>
                                <p className="text-sm text-gray-500">Connect quizzes directly to source materials.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 w-full max-w-md">
                        {/* Visual representation of library structure */}
                        <div className="relative aspect-square rounded-2xl bg-zinc-800 border border-white/10 p-6 flex flex-col gap-4 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                            <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
                                <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">📚</div>
                                <div className="flex-1">
                                    <div className="h-2 w-24 bg-white/20 rounded mb-2"></div>
                                    <div className="h-2 w-16 bg-white/10 rounded"></div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 ml-4 border-l-4 border-l-purple-500">
                                <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">🧬</div>
                                <div className="flex-1">
                                    <div className="h-2 w-20 bg-white/20 rounded mb-2"></div>
                                    <div className="h-2 w-12 bg-white/10 rounded"></div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 ml-8 border-l-4 border-l-primary">
                                <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">⚗️</div>
                                <div className="flex-1">
                                    <div className="h-2 w-28 bg-white/20 rounded mb-2"></div>
                                    <div className="h-2 w-20 bg-white/10 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* CTA Section */}
            <motion.section
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="text-center py-20"
            >
                <h2 className="text-4xl font-bold text-white mb-8">Ready to transform your grades?</h2>
                <Link href="/dashboard" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-primary rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all hover:scale-105">
                    Get Started for Free
                </Link>
            </motion.section>

        </div>
    );
};

export default LearningPage;

'use client';

import { motion } from 'framer-motion';

export default function AboutPage() {
    return (
        <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-white">
            {/* Top Gradient */}
            <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-primary/20 to-transparent pointer-events-none z-[-1]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
            >
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                        About <span className="text-primary">frontb3nch</span>
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Redefining how you learn with AI-powered personalized study tools.
                    </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
                    <section>
                        <h2 className="text-2xl font-bold mb-3">Our Mission</h2>
                        <p className="text-gray-300 leading-relaxed">
                            frontb3nch is designed to make studying efficient, engaging, and effective.
                            By leveraging advanced AI, we transform your study materials into interactive quizzes
                            and personalized learning paths, ensuring you master every topic with confidence.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-3">Why frontb3nch?</h2>
                        <ul className="space-y-3 text-gray-300 list-disc list-inside">
                            <li>
                                <strong className="text-white">AI-Powered Quizzes:</strong> Instantly generate quizzes from any PDF.
                            </li>
                            <li>
                                <strong className="text-white">Smart Tracking:</strong> Monitor your progress and identify weak spots.
                            </li>
                            <li>
                                <strong className="text-white">Gamified Learning:</strong> Earn achievements and challenge friends.
                            </li>
                        </ul>
                    </section>
                </div>
            </motion.div>
        </main>
    );
}

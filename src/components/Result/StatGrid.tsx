'use client';

import { motion } from 'framer-motion';

interface StatGridProps {
    accuracy: number;
    correct: number;
    wrong: number;
    totalQuestions: number;
    averageTime: string;
    totalTime: string;
}

interface StatItemProps {
    label: string;
    value: string | number;
    subValue?: string;
    color?: string;
    delay?: number;
}

function StatItem({ label, value, subValue, color = 'text-white', delay = 0 }: StatItemProps) {
    return (
        <motion.div
            className="flex flex-col items-center p-3 rounded-xl bg-white/5 border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
        >
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</span>
            <span className={`text-2xl font-bold ${color} tabular-nums`}>{value}</span>
            {subValue && <span className="text-xs text-gray-500">{subValue}</span>}
        </motion.div>
    );
}

export default function StatGrid({
    accuracy,
    correct,
    wrong,
    totalQuestions,
    averageTime,
    totalTime,
}: StatGridProps) {
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 mt-6">
            <StatItem label="Accuracy" value={`${accuracy}%`} color="text-primary" delay={0.1} />
            <StatItem
                label="Correct"
                value={correct}
                subValue={`/ ${totalQuestions}`}
                color="text-green-400"
                delay={0.2}
            />
            <StatItem label="Wrong" value={wrong} color="text-red-400" delay={0.3} />
            <StatItem label="Avg Time" value={averageTime} delay={0.4} />
            <StatItem label="Total Time" value={totalTime} delay={0.5} />
            <StatItem
                label="Streak"
                value={correct}
                subValue="max combo"
                color="text-amber-400"
                delay={0.6}
            />
        </div>
    );
}

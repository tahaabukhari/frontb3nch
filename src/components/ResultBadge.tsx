'use client';

import { motion } from 'framer-motion';

const ResultBadge = ({ score }: { score: number }) => {
  let bgGradient = 'bg-gradient-green'; // Default: 60-79%
  let label = 'Good progress';
  let emoji = '🌿';

  if (score >= 90) {
    bgGradient = 'bg-gradient-purple';
    label = 'Star GOAT!';
    emoji = '⭐';
  } else if (score >= 80) {
    bgGradient = 'bg-gradient-gold';
    label = 'Summit reached!';
    emoji = '🏔️';
  } else if (score < 60) {
    bgGradient = 'bg-dark-card border border-dark-border';
    label = 'Keep climbing';
    emoji = '🐐';
  }

  return (
    <motion.div
      className={`flex flex-col items-center justify-center rounded-3xl ${bgGradient} p-8 shadow-xl`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <p className="text-6xl sm:text-7xl">{emoji}</p>
      <p className="mt-4 text-xl font-bold text-white sm:text-2xl">{label}</p>
      <p className="mt-2 text-sm text-white/90">You scored {score}%</p>
    </motion.div>
  );
};

export default ResultBadge;

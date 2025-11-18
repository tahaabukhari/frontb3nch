'use client';

import { motion } from 'framer-motion';

const ResultBadge = ({ score }: { score: number }) => {
  const normalized = Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 0;

  return (
    <div className="relative h-64 w-full overflow-hidden rounded-3xl bg-slate-900 shadow-2xl sm:h-72">
      <motion.div
        className="absolute -inset-10 rounded-[40px] bg-gradient-to-br from-emerald-400/40 via-cyan-500/30 to-violet-500/30 blur-3xl"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 24, ease: 'linear' }}
      />
      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-4 text-slate-50">
        <motion.div
          className="relative flex h-32 w-32 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-emerald-300/30 to-cyan-500/30 shadow-[0_0_40px_rgba(16,185,129,0.35)]"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        >
          <motion.span
            className="text-4xl font-bold tracking-tight"
            animate={{ textShadow: ['0 0 4px rgba(255,255,255,0.2)', '0 0 14px rgba(167,243,208,0.8)', '0 0 4px rgba(255,255,255,0.2)'] }}
            transition={{ repeat: Infinity, duration: 4 }}
          >
            {normalized}%
          </motion.span>
          <span className="absolute bottom-2 text-xs uppercase tracking-[0.3em] text-white/70">Score</span>
        </motion.div>
        <p className="text-sm text-white/70">Momentum badge · keeps glowing with your streaks</p>
      </div>
    </div>
  );
};

export default ResultBadge;


'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface TimerBarProps {
  duration: number;
  instanceKey: number;
  onExpire: () => void;
}

const TimerBar = ({ duration, instanceKey, onExpire }: TimerBarProps) => {
  const [percent, setPercent] = useState(100);

  useEffect(() => {
    let frame: number;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      const remaining = Math.max(duration - elapsed, 0);
      setPercent((remaining / duration) * 100);
      if (remaining <= 0) {
        onExpire();
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration, instanceKey, onExpire]);

  return (
    <div className="overflow-hidden rounded-full border-2 border-accent/30 bg-dark-card shadow-md">
      <motion.div
        className="h-4 bg-gradient-gold"
        animate={{ width: `${percent}%` }}
        transition={{ type: 'tween', ease: 'linear', duration: 0.1 }}
      />
    </div>
  );
};

export default TimerBar;

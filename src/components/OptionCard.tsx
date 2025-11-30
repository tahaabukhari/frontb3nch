'use client';

import { motion } from 'framer-motion';

export type OptionState = 'idle' | 'correct' | 'wrong' | 'highlight';

interface OptionCardProps {
  text: string;
  state?: OptionState;
  disabled?: boolean;
  onSelect?: () => void;
}

const OptionCard = ({ text, state = 'idle', disabled, onSelect }: OptionCardProps) => {
  let colorClass = 'border-dark-border bg-dark-card text-gray-300 hover:border-gray-600';
  if (state === 'correct') {
    colorClass = 'border-accent bg-accent/20 text-white';
  } else if (state === 'wrong') {
    colorClass = 'border-red-500 bg-red-500/20 text-white';
  } else if (state === 'highlight') {
    colorClass = 'border-accent bg-accent/10 text-white';
  }

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      animate={state === 'highlight' ? { scale: [1, 1.05, 1.02] } : { scale: 1 }}
      transition={state === 'highlight' ? { duration: 0.6, ease: 'easeOut' } : {}}
      className={`w-full rounded-2xl border-2 px-5 py-4 text-left text-base font-medium transition sm:text-lg ${colorClass} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:-translate-y-0.5'
        }`}
    >
      {text}
    </motion.button>
  );
};

export default OptionCard;

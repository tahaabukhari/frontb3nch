'use client';

import { motion } from 'framer-motion';
import OptionCard, { OptionState } from './OptionCard';
import type { Question } from '@/lib/questions';

interface QuestionCardProps {
  item: Question;
  index: number;
  total: number;
  selected: string | null;
  revealCorrect: boolean;
  onSelect: (choice: string) => void;
  feedback?: 'correct' | 'wrong' | null;
}

const QuestionCard = ({ item, index, total, selected, revealCorrect, onSelect, feedback }: QuestionCardProps) => (
  <motion.div
    className="rounded-3xl border border-dark-border bg-dark-card p-5 shadow-xl sm:p-8"
    initial={{ opacity: 0, x: 40 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3 }}
  >
    <p className="text-sm font-semibold uppercase tracking-wide text-accent">
      Question {index + 1} of {total} · {item.difficulty}
    </p>
    <div className="mt-4 flex items-start justify-between gap-4">
      <h2 className="flex-1 text-2xl font-bold text-white sm:text-3xl">{item.q}</h2>
      {feedback && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center sm:hidden">
          {feedback === 'correct' && <span className="text-3xl text-accent">✓</span>}
          {feedback === 'wrong' && <span className="text-3xl text-red-400">✗</span>}
        </div>
      )}
    </div>
    <p className="mt-2 text-xs uppercase text-gray-500 sm:text-sm">{item.category}</p>

    <div className="mt-6 space-y-3 sm:mt-8 sm:space-y-4">
      {item.options.map((option) => {
        let state: OptionState = 'idle';
        if (selected === option) {
          state = option === item.correct ? 'correct' : 'wrong';
        } else if (revealCorrect && option === item.correct) {
          state = 'highlight';
        }
        return <OptionCard key={option} text={option} state={state} disabled={Boolean(selected)} onSelect={() => onSelect(option)} />;
      })}
    </div>
    {(revealCorrect || selected) && (
      <div className="mt-6 rounded-2xl border border-accent/30 bg-accent/10 p-4 text-sm text-gray-200">
        <p className="font-semibold text-accent">Answer card</p>
        <p className="mt-1">Correct response: {item.correct}</p>
      </div>
    )}
  </motion.div>
);

export default QuestionCard;

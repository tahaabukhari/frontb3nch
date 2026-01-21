import type { GameMode } from './questions';

// POP Quiz duration constant (10 minutes)
export const POP_QUIZ_DURATION = 600;

const modeDurations: Record<GameMode | 'pop-quiz', number | null> = {
  normal: null,
  timed: 20,
  'pop-quiz': POP_QUIZ_DURATION,
};

export const getDurationForMode = (mode: GameMode | 'pop-quiz' | null) => (mode ? modeDurations[mode] : null);

export const formatSeconds = (seconds: number) => `${seconds.toFixed(1)}s`;

export const formatDuration = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0.0s';
  if (seconds < 60) return formatSeconds(seconds);
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds - minutes * 60;
  return `${minutes}m ${remainder.toFixed(1)}s`;
};

export const calculateAverage = (values: number[]) => {
  if (!values.length) return '0.0s';
  const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
  return formatSeconds(avg);
};

export const totalDuration = (values: number[]) => values.reduce((sum, value) => sum + value, 0);

export const computeScorePercent = (score: number, total: number) => Math.round((score / Math.max(total, 1)) * 100);

'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '@/lib/store';
import { calculateAverage, computeScorePercent, formatDuration, totalDuration } from '@/lib/utils';
import ResultBadge from '@/components/ResultBadge';

const ResultPage = () => {
  const router = useRouter();
  const { quizId, score, questions, wrongQs, responseTimes, mode } = useStore(
    useShallow((state) => ({
      quizId: state.quizId,
      score: state.score,
      questions: state.questions,
      wrongQs: state.wrongQs,
      responseTimes: state.responseTimes,
      mode: state.mode,
    }))
  );
  const [copied, setCopied] = useState(false);

  const redirectRef = useRef(false);
  useEffect(() => {
    if (!questions.length && !redirectRef.current) {
      redirectRef.current = true;
      router.replace('/play/library');
    }
  }, [questions.length, router]);

  const percent = computeScorePercent(score, questions.length);
  const average = calculateAverage(responseTimes);
  const totalTime = totalDuration(responseTimes);
  const totalTimeLabel = formatDuration(totalTime);
  const shareText = [
    `ParhaiPlay ${quizId || 'custom deck'} · ${mode ?? 'solo'} mode`,
    `Score: ${percent}% (${score}/${questions.length})`,
    `Time: ${totalTimeLabel}`,
    wrongQs.length ? `Missed: ${wrongQs.map((w) => w.correct).join(', ')}` : 'Flawless run!',
  ].join('\n');

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'ParhaiPlay results',
          text: shareText,
          url: window.location.origin,
        });
      } else {
        await navigator.clipboard.writeText(`${shareText}\n${window.location.origin}`);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <motion.section
      className="bg-slate-50 px-4 py-14 sm:px-6 sm:py-16"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="sr-only">Quiz results summary</h1>
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4 rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-100 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary sm:text-sm">Scoreboard</p>
            <p className="text-3xl font-bold text-slate-900 sm:text-4xl">{percent}%</p>
            <p className="text-sm text-slate-600 sm:text-base">
              You solved {score} / {questions.length} questions.
            </p>
            <p className="text-sm text-slate-500">Average response time: {average}</p>
            <p className="text-sm text-slate-500">Total time: {totalTimeLabel}</p>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:pt-4">
              <button
                type="button"
                onClick={() => router.push('/play/import')}
                className="rounded-full bg-primary px-6 py-3 text-center text-sm font-semibold text-white shadow-lg sm:flex-1"
              >
                Play again
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="rounded-full border border-slate-200 px-6 py-3 text-center text-sm font-semibold text-slate-800 sm:flex-1"
              >
                {copied ? 'Link copied!' : 'Share'}
              </button>
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Deck: {quizId || 'custom upload'}</p>
          </div>
          <ResultBadge score={percent} />
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white/80 p-6 text-left shadow-inner sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Shareable recap</p>
            <p className="mt-3 text-2xl font-bold text-slate-900">Spent {totalTimeLabel}</p>
            <p className="mt-2 text-sm text-slate-600">
              {score} of {questions.length} prompts solved · Mode: {mode ?? 'normal'}
            </p>
            <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-slate-900/90 p-4 text-left text-xs text-slate-100">{shareText}</pre>
            <button
              type="button"
              onClick={handleShare}
              className="mt-4 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800"
            >
              {copied ? 'Copied!' : 'Share snapshot'}
            </button>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-100 sm:p-8">
            <p className="text-lg font-semibold text-slate-900 sm:text-xl">Review your stumbles</p>
            {wrongQs.length === 0 ? (
              <p className="mt-4 text-sm text-slate-600 sm:text-base">Flawless victory! No wrong answers recorded.</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {wrongQs.map((item, idx) => (
                  <li key={`${item.q}-${idx}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="font-semibold text-slate-800">{item.q}</p>
                    {item.user && (
                      <p className="text-sm text-rose-500">
                        Your pick: <span className="font-semibold">{item.user}</span>
                      </p>
                    )}
                    <p className="text-sm text-slate-500">
                      Correct answer: <span className="font-semibold text-primary">{item.correct}</span>
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default ResultPage;

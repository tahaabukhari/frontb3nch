'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '@/lib/store';
import { calculateAverage, computeScorePercent, formatDuration, totalDuration } from '@/lib/utils';
import ResultBadge from '@/components/ResultBadge';

type ReviewStatus = 'idle' | 'loading' | 'ready' | 'error';
interface CoachReview {
  headline: string;
  strengths: string[];
  focus: string[];
  actions: string[];
}

const ResultPage = () => {
  const router = useRouter();
  const { quizId, score, questions, wrongQs, responseTimes, mode, analysis, attemptHistory, currentAttempt, actions } = useStore(
    useShallow((state) => ({
      quizId: state.quizId,
      score: state.score,
      questions: state.questions,
      wrongQs: state.wrongQs,
      responseTimes: state.responseTimes,
      mode: state.mode,
      analysis: state.analysis,
      attemptHistory: state.attemptHistory,
      currentAttempt: state.currentAttempt,
      actions: state.actions,
    }))
  );
  const [copied, setCopied] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>('idle');
  const [reviewError, setReviewError] = useState('');
  const [coachReview, setCoachReview] = useState<CoachReview | null>(null);
  const [expandedCard, setExpandedCard] = useState<'recap' | 'stumbles' | 'insights' | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

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

  const quizAttempts = attemptHistory[quizId] || [];
  const previousAttempt = quizAttempts.length >= 2 ? quizAttempts[quizAttempts.length - 2] : null;
  const improvementScore = previousAttempt ? percent - previousAttempt.percentage : null;
  const shareText = [
    `studyGoat ${quizId || 'custom deck'} · ${mode ?? 'solo'} mode`,
    `Score: ${percent}% (${score}/${questions.length})`,
    `Time: ${totalTimeLabel}`,
    wrongQs.length ? `Missed: ${wrongQs.map((w) => w.correct).join(', ')}` : 'Flawless run!',
  ].join('\n');
  const includeAnalysis = quizId === 'upload' && Boolean(analysis?.questionSet?.length);
  const summaryForAi = includeAnalysis ? analysis?.summary : undefined;
  const highlightsForAi = includeAnalysis && analysis?.highlights ? analysis.highlights : undefined;

  useEffect(() => {
    if (!questions.length) return;
    const controller = new AbortController();
    const run = async () => {
      try {
        setReviewStatus('loading');
        setReviewError('');
        const response = await fetch('/api/quiz/review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quizId,
            mode,
            score,
            total: questions.length,
            responseTimes,
            wrongQs,
            summary: summaryForAi,
            highlights: highlightsForAi ?? [],
          }),
          signal: controller.signal,
        });
        const contentType = response.headers.get('content-type') ?? '';
        let payload: any = null;
        let fallbackText = '';
        if (contentType.includes('application/json')) {
          payload = await response.json();
        } else {
          fallbackText = await response.text();
        }
        if (!response.ok) {
          const errorMsg = payload?.detail || payload?.error || fallbackText || `Request failed (${response.status})`;
          throw new Error(errorMsg);
        }
        setCoachReview(payload.review);
        setReviewStatus('ready');
      } catch (error) {
        if ((error as Error)?.name === 'AbortError') return;
        setReviewStatus('error');
        setReviewError(error instanceof Error ? error.message : 'Unexpected AI error');
      }
    };
    void run();
    return () => controller.abort();
  }, [highlightsForAi, mode, questions.length, quizId, responseTimes, score, summaryForAi, wrongQs]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'studyGoat results',
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

  const toggleCard = (card: 'recap' | 'stumbles' | 'insights') => {
    setExpandedCard(expandedCard === card ? null : card);
  };

  return (
    <motion.section
      className="min-h-screen bg-dark-bg px-4 py-14 sm:px-6 sm:py-16"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="sr-only">Quiz results summary</h1>
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4 rounded-3xl border border-dark-border bg-dark-card p-6 shadow-xl sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent sm:text-sm">Scoreboard</p>
            <p className="text-3xl font-bold text-white sm:text-4xl">{percent}%</p>
            <p className="text-sm text-gray-300 sm:text-base">
              You solved {score} / {questions.length} questions.
            </p>
            <p className="text-sm text-gray-400">Average response time: {average}</p>
            <p className="text-sm text-gray-400">Total time: {totalTimeLabel}</p>
            {quizAttempts.length > 0 && (
              <div className="rounded-xl border border-accent/30 bg-gradient-gold p-3">
                <p className="text-xs font-bold uppercase tracking-wider text-dark-bg">Attempts: {quizAttempts.length}</p>
                {improvementScore !== null && (
                  <p className="mt-1 text-lg font-bold text-dark-bg">
                    {improvementScore > 0 ? '+' : ''}{improvementScore}% improvement!
                  </p>
                )}
              </div>
            )}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:pt-4">
              <button
                type="button"
                onClick={async () => {
                  setIsRegenerating(true);
                  // Simulate regeneration delay
                  await new Promise(resolve => setTimeout(resolve, 1500));
                  actions.retakeQuiz();
                  router.push(`/play/quiz/${quizId}`);
                }}
                className="rounded-full bg-gradient-purple px-6 py-3 text-center text-sm font-semibold text-white shadow-lg transition hover:opacity-90 sm:flex-1"
              >
                {isRegenerating ? 'Regenerating...' : 'Retake Quiz'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/play/import')}
                className="rounded-full bg-primary px-6 py-3 text-center text-sm font-semibold text-white shadow-lg sm:flex-1"
              >
                New Quiz
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
        <div className="grid gap-8 lg:grid-cols-3">
          <div
            onClick={() => toggleCard('recap')}
            className="cursor-pointer rounded-3xl border border-dashed border-slate-200 bg-white/80 p-6 text-left shadow-inner transition hover:shadow-lg sm:p-8 lg:cursor-default lg:hover:shadow-inner"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Shareable recap</p>
            <div className={`lg:block ${expandedCard === 'recap' || !expandedCard ? 'block' : 'hidden lg:block'}`}>
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
          </div>
          <div
            onClick={() => toggleCard('stumbles')}
            className="cursor-pointer rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-100 transition hover:shadow-2xl sm:p-8 lg:cursor-default lg:hover:shadow-xl">
            <p className="text-lg font-semibold text-slate-900 sm:text-xl">Review your stumbles</p>
            <div className={`lg:block ${expandedCard === 'stumbles' || !expandedCard ? 'block' : 'hidden lg:block'}`}>
              {wrongQs.length === 0 ? (
                <p className="mt-4 text-sm text-slate-600 sm:text-base">Flawless victory! No wrong answers recorded.</p>
              ) : (
                <ul className="mt-4 max-h-[400px] space-y-4 overflow-y-auto pr-2 scrollbar-thin">
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
          <div
            onClick={() => toggleCard('insights')}
            className="cursor-pointer rounded-3xl border border-slate-100 bg-white p-6 shadow-xl transition hover:shadow-2xl sm:p-8 lg:cursor-default lg:hover:shadow-xl">
            <p className="text-lg font-semibold text-slate-900 sm:text-xl">AI review & insights</p>
            <div className={`lg:block ${expandedCard === 'insights' || !expandedCard ? 'block' : 'hidden lg:block'}`}>
              <div className="max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                {coachReview && (
                  <div className="mt-3 space-y-3 text-sm text-slate-600">
                    <p className="text-base font-semibold text-primary">{coachReview.headline}</p>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-500">Strengths</p>
                      <ul className="mt-1 list-disc space-y-1 pl-4">
                        {coachReview.strengths.map((item) => (
                          <li key={`strength-${item}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-500">Focus next</p>
                      <ul className="mt-1 list-disc space-y-1 pl-4">
                        {coachReview.focus.map((item) => (
                          <li key={`focus-${item}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Next actions</p>
                      <ul className="mt-1 list-disc space-y-1 pl-4">
                        {coachReview.actions.map((item) => (
                          <li key={`action-${item}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {reviewStatus === 'loading' && <p className="mt-4 text-sm text-slate-500">Asking Gemini for coaching tips…</p>}
                {reviewError && <p className="mt-4 text-sm text-rose-500">{reviewError}</p>}
                {!coachReview && reviewStatus === 'ready' && !reviewError && (
                  <p className="mt-4 text-sm text-slate-500">No AI insights available yet.</p>
                )}
                {summaryForAi && (
                  <details className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-left text-sm text-slate-600">
                    <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">PDF summary</summary>
                    <p className="mt-2">{summaryForAi}</p>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default ResultPage;

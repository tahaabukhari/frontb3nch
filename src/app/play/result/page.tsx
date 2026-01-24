'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '@/lib/store';
import { calculateAverage, computeScorePercent, formatDuration, totalDuration } from '@/lib/utils';
import AnimatedCircle from '@/components/Result/AnimatedCircle';
import StatGrid from '@/components/Result/StatGrid';
import AIInsightPanel from '@/components/Result/AIInsightPanel';
import AnswerReviewPanel from '@/components/Result/AnswerReviewPanel';

type ReviewStatus = 'idle' | 'loading' | 'ready' | 'error';
interface CoachReview {
  headline: string;
  strengths: string[];
  focus: string[];
  actions: string[];
}

const ResultPage = () => {
  const router = useRouter();
  const { quizId, score, questions, wrongQs, responseTimes, mode, analysis } = useStore(
    useShallow((state) => ({
      quizId: state.quizId,
      score: state.score,
      questions: state.questions,
      wrongQs: state.wrongQs,
      responseTimes: state.responseTimes,
      mode: state.mode,
      analysis: state.analysis,
    }))
  );
  const [copied, setCopied] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>('idle');
  const [reviewError, setReviewError] = useState('');
  const [coachReview, setCoachReview] = useState<CoachReview | null>(null);

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

  const includeAnalysis = quizId === 'upload' && Boolean(analysis?.questionSet?.length);
  const summaryForAi = includeAnalysis ? analysis?.summary : undefined;
  const highlightsForAi = includeAnalysis && analysis?.highlights ? analysis.highlights : undefined;

  useEffect(() => {
    // Play page flip sound on mount
    const audio = new Audio('/sounds/page-flip.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => { });
  }, []);

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
      className="min-h-screen px-4 py-10 sm:px-6 sm:py-14"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="sr-only">Quiz results summary</h1>

      {/* Main 3-column layout */}
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
          {/* Left Panel - AI Insights */}
          <div className="order-2 lg:order-1">
            <AIInsightPanel
              isLoading={reviewStatus === 'loading'}
              error={reviewError}
              review={coachReview}
              summary={summaryForAi}
            />
          </div>

          {/* Center Panel - Main Result Card */}
          <motion.div
            className="order-1 lg:order-2 flex flex-col items-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
          >
            <div className="rounded-3xl bg-gradient-to-b from-dark-card to-black/60 backdrop-blur-xl p-8 shadow-2xl border border-white/10 w-full max-w-md">
              {/* Header */}
              <div className="text-center mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                  Quiz Complete
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {quizId || 'Custom Quiz'} · {mode ?? 'Normal'} Mode
                </p>
              </div>

              {/* Animated Circle */}
              <div className="flex justify-center">
                <AnimatedCircle percentage={percent} duration={2.5} size={220} strokeWidth={14} />
              </div>

              {/* Stats Grid */}
              <StatGrid
                accuracy={percent}
                correct={score}
                wrong={wrongQs.length}
                totalQuestions={questions.length}
                averageTime={average}
                totalTime={totalTimeLabel}
              />

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 mt-8 sm:flex-row">
                <motion.button
                  type="button"
                  onClick={() => router.push('/play/import')}
                  className="flex-1 rounded-full bg-primary px-6 py-3 text-center text-sm font-bold text-black shadow-lg hover:brightness-110 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Play Again
                </motion.button>
                <motion.button
                  type="button"
                  onClick={handleShare}
                  className="flex-1 rounded-full border border-white/20 px-6 py-3 text-center text-sm font-semibold text-gray-300 hover:text-white hover:border-white/40 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {copied ? '✓ Copied!' : 'Share Results'}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Right Panel - Answer Review */}
          <div className="order-3">
            <AnswerReviewPanel
              wrongAnswers={wrongQs}
              totalQuestions={questions.length}
              correctCount={score}
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default ResultPage;

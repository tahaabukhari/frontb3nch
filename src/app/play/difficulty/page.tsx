'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { buildQuizQuestions, findDeck, type GameMode } from '@/lib/questions';
import { useStore } from '@/lib/store';

type PipelineStatus = 'idle' | 'loading' | 'ready' | 'error';

const modes: { key: GameMode; label: string; description: string; detail: string }[] = [
  { key: 'normal', label: 'Focus Mode', description: 'No countdown, just medium-hard prompts.', detail: 'Perfect for deep work or study groups.' },
  {
    key: 'timed',
    label: 'Blitz Mode',
    description: '45s global timer with streak bonuses.',
    detail: 'Best for quick tournament-style sessions.',
  },
];

const DifficultyContent = () => {
  const router = useRouter();
  const params = useSearchParams();
  const quizId = params.get('quiz') ?? '';
  const { upload, analysis, actions } = useStore(
    useShallow((state) => ({
      upload: state.upload,
      analysis: state.analysis,
      actions: state.actions,
    }))
  );
  const deck = findDeck(quizId);
  const [builderState, setBuilderState] = useState<{ status: PipelineStatus; message: string }>({
    status: analysis?.questionSet?.length ? 'ready' : 'idle',
    message: analysis?.questionSet?.length ? `Built ${analysis.questionSet.length} questions` : 'Waiting to analyze your PDF…',
  });
  const [builderError, setBuilderError] = useState('');

  const subtitle = useMemo(() => {
    if (deck) return `${deck.title} — ${deck.description}`;
    if (quizId === 'upload' && upload) return `Custom upload: ${upload.name}`;
    return 'Pick a deck first';
  }, [deck, quizId, upload]);

  const triggerPipeline = useCallback(async () => {
    if (!upload) return;
    setBuilderError('');
    setBuilderState({ status: 'loading', message: 'Crunching PDF pages and drafting prompts…' });
    try {
      const response = await fetch('/api/quiz/from-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl: upload.dataUrl, name: upload.name, size: upload.size }),
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
        throw new Error((payload?.error ?? fallbackText) || `Request failed (${response.status})`);
      }
      if (!payload) {
        if (fallbackText) {
          try {
            payload = JSON.parse(fallbackText);
          } catch {
            throw new Error('Quiz builder returned an unexpected payload format');
          }
        } else {
          throw new Error('Quiz builder returned an empty response');
        }
      }
      actions.setAnalysis(payload.analysis);
      setBuilderState({
        status: 'ready',
        message: `Built ${payload.analysis?.questionSet?.length ?? 0} tailored questions`,
      });
    } catch (error) {
      setBuilderState({ status: 'error', message: 'AI pipeline failed. Please try again.' });
      setBuilderError(error instanceof Error ? error.message : 'Unknown error');
    }
  }, [actions, upload]);

  useEffect(() => {
    if (quizId !== 'upload') return;
    if (!upload) return;
    if (analysis?.questionSet?.length) {
      setBuilderState({
        status: 'ready',
        message: `Built ${analysis.questionSet.length} tailored questions`,
      });
      return;
    }
    if (builderState.status === 'idle') {
      void triggerPipeline();
    }
  }, [analysis, builderState.status, quizId, triggerPipeline, upload]);

  const handleSelect = (mode: GameMode) => {
    if (!quizId) {
      router.push('/play/library');
      return;
    }
    if (!deck && quizId !== 'upload') {
      router.push('/play/library');
      return;
    }
    if (quizId === 'upload') {
      if (!analysis?.questionSet?.length) {
        setBuilderState({ status: 'error', message: 'Waiting for quiz builder to finish.' });
        setBuilderError('Please let the PDF analysis finish so we can craft questions.');
        return;
      }
      actions.setQuiz({ id: quizId, mode, questions: analysis.questionSet });
      router.push(`/play/quiz/${quizId}`);
      return;
    }
    const qs = buildQuizQuestions(deck?.id ?? quizId);
    actions.setQuiz({ id: quizId, mode, questions: qs });
    router.push(`/play/quiz/${quizId}`);
  };

  const disableCustomSelection = quizId === 'upload' && builderState.status !== 'ready';
  const pipelineSteps: { label: string; status: PipelineStatus }[] = [
    { label: 'Upload', status: upload ? 'ready' : 'idle' },
    { label: 'Analyze', status: builderState.status === 'loading' ? 'loading' : builderState.status },
    { label: 'Quiz ready', status: analysis?.questionSet?.length ? 'ready' : builderState.status },
  ];
  const progressPercent =
    builderState.status === 'ready'
      ? 100
      : builderState.status === 'loading'
        ? 70
        : builderState.status === 'error'
          ? 100
          : upload
            ? 35
            : 0;
  const progressBarColor =
    builderState.status === 'error' ? 'bg-rose-500' : builderState.status === 'ready' ? 'bg-emerald-500' : 'bg-primary';

  return (
    <motion.section
      className="bg-dark-bg px-4 py-14 sm:px-6 sm:py-16"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="sr-only">Select game mode</h1>
      <div className="mx-auto max-w-5xl space-y-10 text-center">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary sm:text-sm">Choose mode</p>
          <p className="mt-2 text-3xl font-bold text-white sm:text-4xl">How do you want to play?</p>
          <p className="mt-3 text-base text-gray-400 sm:text-lg">{subtitle}</p>
          {!deck && quizId === 'upload' && upload && (
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-gray-500">PDF size: {(upload.size / 1024 / 1024).toFixed(2)} MB</p>
          )}
          {!deck && quizId !== 'upload' && (
            <p className="mt-1 text-sm text-amber-500">Deck not found. Please head back to the library.</p>
          )}
        </header>
        {quizId === 'upload' && upload && (
          <div className="grid gap-4 rounded-3xl border border-dashed border-dark-border bg-dark-card/50 p-6 text-left shadow-inner sm:grid-cols-2 sm:p-8">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">PDF pipeline</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {pipelineSteps.map((step) => (
                  <div
                    key={step.label}
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${step.status === 'ready'
                      ? 'border-primary/20 bg-primary/10 text-primary'
                      : step.status === 'loading'
                        ? 'border-amber-500/20 bg-amber-500/10 text-amber-500 animate-pulse'
                        : 'border-dark-border text-gray-500'
                      }`}
                  >
                    {step.label}
                  </div>
                ))}
              </div>
              <div className="mt-2">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-dark-border">
                  <div
                    className={`${progressBarColor} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
              <p className="text-sm text-gray-400">{builderState.message}</p>
              {builderError && <p className="text-sm text-red-400">{builderError}</p>}
              <button
                type="button"
                onClick={() => triggerPipeline()}
                disabled={builderState.status === 'loading'}
                className="inline-flex items-center rounded-full border border-gray-600 px-4 py-2 text-sm font-semibold text-gray-300 transition hover:border-white hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {builderState.status === 'loading' ? 'Generating…' : 'Regenerate quiz'}
              </button>
            </div>
            <div className="rounded-2xl bg-black/40 border border-dark-border p-5 text-white shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary">AI brief</p>
              <p className="mt-3 text-lg font-semibold">{analysis?.summary ?? 'We are prepping a study brief based on your PDF.'}</p>
              {analysis?.highlights && (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-300">
                  {analysis.highlights.slice(0, 3).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              <p className="mt-4 text-xs text-gray-400">
                {analysis?.questionSet?.length
                  ? `${analysis.questionSet.length} custom questions ready`
                  : 'We will auto-build 8+ questions once analysis finishes.'}
              </p>
            </div>
          </div>
        )}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {modes.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => handleSelect(option.key)}
              disabled={disableCustomSelection}
              className="flex flex-col rounded-3xl border border-dark-border bg-dark-card p-5 text-left shadow-lg transition hover:-translate-y-1 hover:border-white disabled:cursor-not-allowed disabled:opacity-70 sm:p-6 group"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500 group-hover:text-primary transition-colors">{option.label}</p>
              <p className="mt-3 text-2xl font-bold text-white sm:mt-4 sm:text-3xl">{option.description}</p>
              <p className="mt-2 flex-1 text-gray-400 sm:mt-3">{option.detail}</p>
              <span className="mt-4 text-sm font-semibold text-white sm:mt-6">Select →</span>
            </button>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

const DifficultyPage = () => (
  <Suspense
    fallback={
      <section className="bg-dark-bg px-4 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-5xl animate-pulse space-y-4">
          <div className="h-6 w-32 rounded-full bg-dark-card" />
          <div className="h-10 w-2/3 rounded-full bg-dark-card" />
          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            {[...Array(3)].map((_, idx) => (
              <div key={`skeleton-${idx}`} className="h-32 rounded-3xl bg-dark-card shadow-inner sm:h-40" />
            ))}
          </div>
        </div>
      </section>
    }
  >
    <DifficultyContent />
  </Suspense>
);

export default DifficultyPage;

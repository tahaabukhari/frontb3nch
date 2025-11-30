'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { buildQuizQuestions, findDeck, type GameMode } from '@/lib/questions';
import { useStore } from '@/lib/store';

type PipelineStatus = 'idle' | 'loading' | 'ready' | 'error';

const modes: { key: GameMode; label: string; description: string; detail: string }[] = [
  { key: 'normal', label: 'Normal', description: 'No countdown, just medium-hard prompts.', detail: 'Perfect for deep work or study groups.' },
  {
    key: 'timed',
    label: 'Timed Quiz',
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
    setBuilderState({ status: 'loading', message: 'Starting PDF processing...' });

    try {
      const response = await fetch('/api/quiz/from-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({ dataUrl: upload.dataUrl, name: upload.name, size: upload.size }),
      });

      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response stream available');
      }

      let buffer = '';
      let finalAnalysis: any = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data: ')) continue;

          try {
            const data = JSON.parse(line.substring(6));

            if (data.stage === 'error') {
              throw new Error(data.message || 'Processing failed');
            }

            if (data.stage === 'result') {
              finalAnalysis = data.data.analysis;
              continue;
            }

            // Update progress message based on stage
            setBuilderState({
              status: 'loading',
              message: data.message || 'Processing...',
            });

          } catch (parseError) {
            console.error('Failed to parse SSE message:', parseError);
          }
        }
      }

      if (finalAnalysis) {
        actions.setAnalysis(finalAnalysis);
        setBuilderState({
          status: 'ready',
          message: `Built ${finalAnalysis.questionSet?.length ?? 0} tailored questions`,
        });
      } else {
        throw new Error('No analysis data received');
      }

    } catch (error) {
      console.error('Pipeline error:', error);
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

  return (
    <motion.section
      className="min-h-screen bg-dark-bg px-4 py-14 sm:px-6 sm:py-16"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="sr-only">Select game mode</h1>
      <div className="mx-auto max-w-5xl space-y-10 text-center">
        <header>
          <p className="text-3xl font-bold text-white sm:text-4xl">Choose your mode</p>
          <p className="mt-3 text-base text-gray-400 sm:text-lg">{subtitle}</p>
          {!deck && quizId === 'upload' && upload && (
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-gray-500">PDF size: {(upload.size / 1024 / 1024).toFixed(2)} MB</p>
          )}
          {!deck && quizId !== 'upload' && (
            <p className="mt-1 text-sm text-amber-400">Deck not found. Please head back to the library.</p>
          )}
        </header>
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {modes.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => handleSelect(option.key)}
              disabled={disableCustomSelection}
              className="flex flex-col rounded-3xl border-2 border-dark-border bg-dark-card p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-accent hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70">
              <p className="text-2xl font-bold text-white">{option.label}</p>
              <p className="mt-3 text-gray-400">{option.description}</p>
              <span className="mt-6 text-sm font-semibold text-accent">Start →</span>
            </button>
          ))}
        </div>
        {quizId === 'upload' && upload && (
          <div className="rounded-3xl border border-dark-border bg-dark-card p-6 shadow-sm sm:p-8">
            {builderState.status === 'loading' && (
              <div className="space-y-4 text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-base font-semibold text-slate-700">{builderState.message}</p>
                <p className="text-sm text-slate-500">Please wait while we process your PDF...</p>
              </div>
            )}
            {builderState.status === 'ready' && analysis && (
              <div className="text-left space-y-4">
                <p className="text-lg font-semibold text-slate-900">{analysis.summary}</p>
                <p className="text-sm text-emerald-700">
                  ✓ {analysis.questionSet.length} questions ready
                </p>
              </div>
            )}
            {builderState.status === 'error' && (
              <div className="space-y-3">
                <p className="text-sm text-rose-600">{builderError}</p>
                <button
                  type="button"
                  onClick={() => triggerPipeline()}
                  className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.section>
  );
};

const DifficultyPage = () => (
  <Suspense
    fallback={
      <section className="bg-slate-50 px-4 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-5xl animate-pulse space-y-4">
          <div className="h-6 w-32 rounded-full bg-slate-200" />
          <div className="h-10 w-2/3 rounded-full bg-slate-200" />
          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            {[...Array(3)].map((_, idx) => (
              <div key={`skeleton-${idx}`} className="h-32 rounded-3xl bg-white shadow-inner sm:h-40" />
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

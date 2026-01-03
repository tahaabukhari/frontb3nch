'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import TimerBar from '@/components/TimerBar';
import QuestionCard from '@/components/QuestionCard';
import LottieCorrect from '@/components/LottieCorrect';
import LottieWrong from '@/components/LottieWrong';
import { useStore } from '@/lib/store';
import { getDurationForMode } from '@/lib/utils';

const QuizPage = () => {
  const router = useRouter();
  const params = useParams<{ id: string | string[] }>();
  const routeId = useMemo(() => {
    const id = params?.id;
    if (typeof id === 'string') return id;
    if (Array.isArray(id)) return id[0];
    return '';
  }, [params]);
  const { quizId, mode, questions, index, actions } = useStore(
    useShallow((state) => ({
      quizId: state.quizId,
      mode: state.mode,
      questions: state.questions,
      index: state.index,
      actions: state.actions,
    }))
  );
  const question = questions[index];
  const duration = getDurationForMode(mode);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealCorrect, setRevealCorrect] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const missingQuizRedirectedRef = useRef(false);
  useEffect(() => {
    if (!questions.length && !missingQuizRedirectedRef.current) {
      missingQuizRedirectedRef.current = true;
      router.replace(routeId === 'upload' ? '/play/import' : '/play/library');
    }
  }, [questions.length, routeId, router]);

  useEffect(() => {
    if (routeId && quizId && routeId !== quizId) {
      router.replace(`/play/quiz/${quizId}`);
    }
  }, [routeId, quizId, router]);

  useEffect(() => {
    if (index >= questions.length && questions.length) {
      actions.saveAttempt();
      router.push('/play/result');
    }
  }, [index, questions.length, router, actions]);

  useEffect(() => {
    setSelected(null);
    setRevealCorrect(false);
    setFeedback(null);
    setTimerKey((key) => key + 1);
  }, [question?.id]);

  const goNext = useCallback(() => {
    actions.nextQuestion();
  }, [actions]);

  const handleChoice = (choice: string) => {
    if (!question || selected) return;
    setSelected(choice);
    const correct = choice === question.correct;
    setFeedback(correct ? 'correct' : 'wrong');
    actions.answer(choice, question.correct);
    if (correct) {
      setTimeout(goNext, 900);
    } else {
      setTimeout(() => setRevealCorrect(true), 800);
      setTimeout(goNext, 2100);
    }
  };

  const handleTimeout = useCallback(() => {
    if (!question || selected || !duration) return;
    setSelected('⏰ Time');
    setFeedback('wrong');
    setRevealCorrect(true);
    actions.answer('', question.correct);
    setTimeout(goNext, 1200);
  }, [actions, duration, goNext, question, selected]);

  if (!question) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center px-4 py-10 text-center text-gray-300">
        Loading quiz…
      </section>
    );
  }

  return (
    <motion.section
      className="min-h-screen px-4 py-8 sm:px-6 sm:py-10"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="sr-only">Quiz in progress</h1>
      <div className="mx-auto flex max-w-5xl flex-col gap-5 sm:gap-6">
        {duration ? (
          <TimerBar duration={duration} instanceKey={timerKey} onExpire={handleTimeout} />
        ) : (
          <div className="rounded-full border border-dashed border-accent/30 bg-dark-card px-4 py-2 text-center text-sm font-semibold text-accent">
            Free play mode · no countdown
          </div>
        )}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex-1">
            <QuestionCard
              item={question}
              index={index}
              total={questions.length}
              selected={selected}
              revealCorrect={revealCorrect}
              onSelect={handleChoice}
              feedback={feedback}
            />
          </div>
          <div className="hidden sm:flex sm:w-32 sm:flex-col sm:items-center sm:justify-center">
            {feedback === 'correct' && <LottieCorrect />}
            {feedback === 'wrong' && <LottieWrong />}
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default QuizPage;

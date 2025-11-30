'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

const Hero = () => (
  <section className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-12 text-center sm:gap-12 sm:px-6 sm:py-14 md:flex-row md:py-20 md:text-left">
    <motion.div
      className="flex-1 space-y-6"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <span className="rounded-full bg-yellow-400/30 px-4 py-1 text-sm font-semibold text-emerald-700">
        AI-powered study prep
      </span>
      <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl md:text-5xl">
        Turn any PDF into a quiz with{' '}
        <span className="text-orange-600">studyGoat</span>
      </h2>
      <p className="text-base text-slate-600 sm:text-lg">
        Upload your notes, pick a subject, and get auto-generated quizzes with playful animations, timers, and instant feedback.
      </p>
      <div className="flex flex-col gap-4 sm:flex-row">
        <Link
          href="/play/import"
          className="min-h-[48px] rounded-2xl bg-gradient-star px-8 py-3.5 text-center text-base font-semibold text-white shadow-lg shadow-star/40 transition hover:opacity-90 sm:flex-1 sm:text-lg">
          Play
        </Link>
        <Link
          href="/play/library"
          className="min-h-[48px] rounded-2xl border-2 border-accent bg-white px-8 py-3.5 text-center text-base font-semibold text-accent transition hover:bg-accent/10 sm:flex-1 sm:text-base">
          Browse library
        </Link>
      </div>
    </motion.div>
    <motion.div className="flex-1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
      <div className="glow-card rounded-3xl bg-white p-6">
        <Image src="/hero-illustration.svg" alt="Student writing on tablet" width={500} height={400} className="w-full" priority />
      </div>
    </motion.div>
  </section>
);

export default Hero;

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
      <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl">
        Master any topic with
        <br />
        <span className="text-accent">AI-powered</span> study prep
      </h1>
      <p className="mt-4 text-lg text-gray-400 sm:text-xl">
        Upload PDFs, get instant quizzes. Track progress, improve continuously.
      </p>
      <div className="flex flex-col gap-4 sm:flex-row">
        <Link
          href="/play/import"
          className="min-h-[48px] animate-pulse-glow rounded-2xl bg-gradient-gold px-8 py-3.5 text-center text-base font-semibold text-dark-bg shadow-lg transition hover:opacity-90 sm:flex-1 sm:text-lg">
          Play
        </Link>
        <Link
          href="/play/library"
          className="min-h-[48px] rounded-2xl border-2 border-gray-700 bg-dark-card px-8 py-3.5 text-center text-base font-semibold text-gray-300 transition hover:border-accent hover:text-white sm:flex-1 sm:text-base">
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

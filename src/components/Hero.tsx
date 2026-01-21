'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const Hero = () => (
  <>
    {/* Hero Section - Main */}
    <section className="relative z-10 mx-auto max-w-6xl px-4 pt-24 pb-16 sm:px-6 sm:pt-32 sm:pb-24 md:pt-40 md:pb-32 overflow-hidden">
      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-72 h-72 sm:w-96 sm:h-96 bg-primary/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-20 -right-20 w-80 h-80 sm:w-[28rem] sm:h-[28rem] bg-primary/15 rounded-full blur-3xl"
        />
      </div>

      {/* Glassmorphic Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 sm:p-12 md:p-16 overflow-hidden"
      >
        {/* Background Accent */}
        <div className="absolute -left-20 -top-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start gap-8 md:gap-12">
          {/* Left Side - Content */}
          <div className="md:w-1/2 text-center md:text-left space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">AI-Powered Learning Platform</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white tracking-tight">
              Master any topic with
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-400">
                AI-powered
              </span>{' '}
              study prep
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-xl">
              Upload PDFs, get instant quizzes. Track progress, improve continuously.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href="/play/import"
                className="w-full sm:w-auto rounded-full bg-primary px-8 py-4 text-center text-lg font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-primary/40 hover:scale-105 transition-all duration-300"
              >
                Start Playing
              </Link>
              <Link
                href="/play/library"
                className="w-full sm:w-auto rounded-full border border-white/20 bg-white/5 px-8 py-4 text-center text-lg font-semibold text-white hover:bg-white/10 hover:border-white/40 hover:scale-105 transition-all duration-300 backdrop-blur-sm"
              >
                Browse Library
              </Link>
            </div>
          </div>

          {/* Right Side - Empty space for future image */}
          <div className="hidden md:block md:w-1/2" />
        </div>

        {/* Floating Elements inside card */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
          <motion.div
            animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 right-[10%] w-3 h-3 rounded-full bg-primary/50"
          />
          <motion.div
            animate={{ y: [10, -10, 10], rotate: [0, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 right-[25%] w-4 h-4 rounded-full border-2 border-primary/40"
          />
          <motion.div
            animate={{ y: [-15, 15, -15] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-20 right-[20%] w-2 h-2 rounded-full bg-green-400/40"
          />
        </div>
      </motion.div>
    </section>

    {/* Section 2: AI Tutoring & Mock Exams */}
    <SectionTwo />

    {/* Section 3: Funzone */}
    <SectionThree />
  </>
);

const SectionTwo = () => {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 sm:p-12 md:p-16 overflow-hidden"
      >
        {/* Background Accent */}
        <div className="absolute -right-20 -top-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col items-center gap-8">
          {/* Centered Content with space for images on sides */}
          <div className="w-full md:w-2/3 lg:w-1/2 text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
              AI-Powered Tutoring &
              <br className="hidden sm:block" />
              <span className="text-primary"> Mock Exam Tools</span>
            </h2>
            <p className="text-gray-400 text-base sm:text-lg md:text-xl leading-relaxed max-w-xl mx-auto">
              Prepare smarter with personalized AI guidance. Generate mock exams, get instant feedback, and master your subjects with a tutor that never sleeps.
            </p>
            <div className="pt-4">
              <Link
                href="/dashboard"
                className="inline-block rounded-full bg-primary px-8 py-3 text-base sm:text-lg font-bold text-white shadow-lg hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-primary/20"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

const SectionThree = () => {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm p-8 sm:p-12 md:p-16 overflow-hidden"
      >
        {/* Background Accent */}
        <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start gap-8 md:gap-12">
          {/* Left Side - Content */}
          <div className="md:w-1/2 text-center md:text-left space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
              Learning redefined for
              <br className="hidden sm:block" />
              <span className="text-primary"> Gamers, by Gamers</span>
            </h2>
            <p className="text-gray-400 text-base sm:text-lg md:text-xl leading-relaxed max-w-xl mx-auto md:mx-0">
              Level up your knowledge with our learning-oriented webgames! Experience education that feels like play, designed to keep you engaged and addicted to learning.
            </p>
            <div className="pt-4">
              <Link
                href="/play/funzone"
                className="inline-block rounded-full bg-primary px-8 py-3 text-base sm:text-lg font-bold text-white shadow-lg hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-primary/20"
              >
                Enter Funzone
              </Link>
            </div>
          </div>

          {/* Right Side - Empty space for future image */}
          <div className="hidden md:block md:w-1/2" />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;

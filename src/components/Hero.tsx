'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import DailyStreakFab from '@/components/DailyStreakFab';

// Manual alignment configuration for the Body (Image)
// Adjust these values to perfectly align the static body
const ALIGNMENT = {
  mobile: {
    // Mobile-specific adjustments
    image: { x: -20, y: 380, scale: 0.85 },
  },
  desktop: {
    // Desktop-specific adjustments
    image: { x: 240, y: 0, scale: 0.85 },
  }
};

const Hero = () => (
  <>
    {/* Fullscreen Background - Bottom Layer (z-[-10]) */}
    {/* Changed from fixed to absolute so it scrolls with the page */}
    {/* Shifted right using left and width utility classes */}
    <div className="absolute top-0 left-0 w-full h-[120vh] overflow-hidden pointer-events-none z-[-10]">
      {/* Container for the image */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-auto">

        {/* Layer 1: Static Background Image (Body) */}
        {/* Using Tailwind arbitrary values for responsive transforms based on config */}
        <div
          style={{
            '--m-x': `${ALIGNMENT.mobile.image.x}px`,
            '--m-y': `${ALIGNMENT.mobile.image.y}px`,
            '--m-s': ALIGNMENT.mobile.image.scale,
            '--d-x': `${ALIGNMENT.desktop.image.x}px`,
            '--d-y': `${ALIGNMENT.desktop.image.y}px`,
            '--d-s': ALIGNMENT.desktop.image.scale,
          } as React.CSSProperties & Record<string, any>}
          className="hidden md:block absolute inset-0 h-full w-full 
            [transform:translate(var(--m-x),var(--m-y))_scale(var(--m-s))]
            md:[transform:translate(var(--d-x),var(--d-y))_scale(var(--d-s))]
          "
        >
          <img
            src="/desktop-herobg.png"
            alt="Hero Background"
            className="h-full w-full object-cover"
          />
        </div>

      </div>
    </div>

    {/* Hero Content - Top Layer (z-10) */}
    <section className="relative z-10 mx-auto flex min-h-[80vh] max-w-6xl flex-col justify-center gap-8 px-4 py-12 text-center pointer-events-none sm:gap-12 sm:px-6 sm:py-14 md:flex-row md:py-20 md:text-left md:-translate-x-[70px]">
      <div className="flex-1 space-y-6 pointer-events-auto">
        <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl tracking-tight">
          Master any topic with
          <br />
          <span className="text-gray-400">AI-powered</span> study prep
        </h1>
        <p className="mt-4 text-lg text-gray-400 sm:text-xl max-w-lg mx-auto md:mx-0">
          Upload PDFs, get instant quizzes. Track progress, improve continuously.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row justify-center md:justify-start">
          <Link
            href="/play/import"
            className="rounded-full bg-white px-8 py-4 text-center text-lg font-bold text-black shadow-lg hover:bg-gray-200 transition-all sm:min-w-[160px]">
            Start Playing
          </Link>
          <Link
            href="/play/library"
            className="rounded-full border border-white/20 bg-white/5 px-8 py-4 text-center text-lg font-semibold text-white hover:bg-white/10 hover:border-white/40 transition-all sm:min-w-[160px]">
            Browse Library
          </Link>
        </div>
      </div>

      {/* Spacer for Right Side - keeps the text to the left on desktop */}
      <div className="hidden md:block md:w-1/2" />
    </section>

    {/* Section 2: AI Tutoring & Mock Exams */}
    <SectionTwo />

    {/* Section 3: Funzone */}
    <SectionThree />

    {/* Daily Streak FAB */}
    <DailyStreakFab />
  </>
);

const SectionTwo = () => {
  // Determine login status by checking if name is Guest or specific flag. 
  // Ideally useUser would expose isLoggedIn boolean. 
  // For now, assuming default 'Guest User' means not logged in.
  // In a real app, `user` object would likely be null or have `isAuthenticated` flag.
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-32">
      <div className="flex flex-col-reverse gap-12 md:flex-row md:items-center">
        {/* Left Side - Visual Placeholder */}
        <div className="flex-1 flex justify-center md:justify-start">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative h-64 w-64 flex items-center justify-center rounded-3xl bg-zinc-900/50 border border-white/10 shadow-2xl skew-y-3"
          >
            <span className="text-9xl filter drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">📓</span>
            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 h-12 w-12 rounded-full bg-blue-500/20 blur-xl" />
            <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-purple-500/20 blur-xl" />
          </motion.div>
        </div>

        {/* Right Side - Content */}
        <div className="flex-1 text-center md:text-right space-y-6">
          <h2 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            AI-Powered Tutoring &
            <br />
            <span className="text-blue-400">Mock Exam Tools</span>
          </h2>
          <p className="text-gray-400 text-lg sm:text-xl leading-relaxed">
            Prepare smarter with personalized AI guidance. Generate mock exams, get instant feedback, and master your subjects with a tutor that never sleeps.
          </p>
          <div className="flex justify-center md:justify-end">
            <Link
              href="/dashboard"
              className="rounded-full bg-blue-600 px-8 py-3 text-lg font-bold text-white shadow-lg hover:bg-blue-500 transition-all shadow-blue-500/20"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

const SectionThree = () => {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-32">
      <div className="flex flex-col gap-12 md:flex-row md:items-center">
        {/* Left Side - Content */}
        <div className="flex-1 text-center md:text-left space-y-6">
          <h2 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            Learning redefined for
            <br />
            <span className="text-purple-400">Gamers, by Gamers</span>
          </h2>
          <p className="text-gray-400 text-lg sm:text-xl leading-relaxed">
            Level up your knowledge with our learning-oriented webgames! Experience education that feels like play, designed to keep you engaged and addicted to learning.
          </p>
          <div className="flex justify-center md:justify-start">
            <Link
              href="/play/funzone"
              className="rounded-full bg-purple-600 px-8 py-3 text-lg font-bold text-white shadow-lg hover:bg-purple-500 transition-all shadow-purple-500/20"
            >
              Enter Funzone
            </Link>
          </div>
        </div>

        {/* Right Side - Visual Placeholder */}
        <div className="flex-1 flex justify-center md:justify-end">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative h-64 w-64 flex items-center justify-center rounded-3xl bg-zinc-900/50 border border-white/10 shadow-2xl -skew-y-3"
          >
            <span className="text-9xl filter drop-shadow-[0_0_30px_rgba(168,85,247,0.3)]">🎮</span>
            {/* Decorative Elements */}
            <div className="absolute -top-4 -left-4 h-12 w-12 rounded-full bg-purple-500/20 blur-xl" />
            <div className="absolute -bottom-4 -right-4 h-16 w-16 rounded-full bg-pink-500/20 blur-xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Hero;

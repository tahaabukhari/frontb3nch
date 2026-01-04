'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

// Manual alignment configuration for the Body (Image)
// Adjust these values to perfectly align the static body
const ALIGNMENT = {
  mobile: {
    // Mobile-specific adjustments
    image: { x: -110, y: 80, scale: 1 }, // Lowered Y for mobile
  },
  desktop: {
    // Desktop-specific adjustments
    image: { x: -110, y: -10, scale: 1 },
  }
};

const Hero = () => (
  <>
    {/* Fullscreen Background - Bottom Layer (z-[-10]) */}
    {/* Changed from fixed to absolute so it scrolls with the page */}
    {/* Shifted right using left and width utility classes */}
    <div className="absolute top-0 left-0 w-full h-[120vh] overflow-hidden pointer-events-none z-[-10]">
      {/* Mobile: Centered/Cover. Desktop: Shifted slightly right (10%) */}
      <div className="absolute top-0 left-0 w-full h-full md:left-[10%] md:w-[120%] pointer-events-auto">

        {/* Layer 1: Static Background Image (Body) */}
        {/* Using Tailwind arbitrary values for responsive transforms based on config */}
        <div
          className={`absolute inset-0 h-full w-full 
            [transform:translate(${ALIGNMENT.mobile.image.x}px,${ALIGNMENT.mobile.image.y}px)_scale(${ALIGNMENT.mobile.image.scale})]
            md:[transform:translate(${ALIGNMENT.desktop.image.x}px,${ALIGNMENT.desktop.image.y}px)_scale(${ALIGNMENT.desktop.image.scale})]
          `}
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
    <section className="relative z-10 mx-auto flex min-h-[80vh] max-w-6xl flex-col justify-center gap-8 px-4 py-12 text-center pointer-events-none sm:gap-12 sm:px-6 sm:py-14 md:flex-row md:py-20 md:text-left">
      <motion.div
        className="flex-1 space-y-6 pointer-events-auto"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
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
      </motion.div>

      {/* Spacer for Right Side - keeps the text to the left on desktop */}
      <div className="hidden md:block md:w-1/2" />
    </section>
  </>
);

export default Hero;

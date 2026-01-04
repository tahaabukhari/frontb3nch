'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const Spline = dynamic(() => import('@splinetool/react-spline'), {
  loading: () => <div className="flex h-full w-full items-center justify-center text-gray-400">Loading 3D...</div>,
  ssr: false,
});

const Hero = () => (
  <section className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-12 text-center sm:gap-12 sm:px-6 sm:py-14 md:flex-row md:py-20 md:text-left">
    <motion.div
      className="flex-1 space-y-6"
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
          className="min-h-[48px] rounded-full bg-white px-8 py-3.5 text-center text-base font-bold text-black shadow-lg hover:bg-gray-200 transition-all sm:flex-1 sm:text-lg">
          Start Playing
        </Link>
        <Link
          href="/play/library"
          className="min-h-[48px] rounded-full border border-gray-800 bg-transparent px-8 py-3.5 text-center text-base font-semibold text-gray-400 hover:text-white hover:border-gray-600 transition-all sm:flex-1 sm:text-base">
          Browse library
        </Link>
      </div>
    </motion.div>
    <motion.div
      className="w-full max-w-md md:w-1/2 h-[400px] md:h-[500px] relative"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {/* 
        TODO: Replace the scene URL below with your custom "Retro Game Machine" Spline URL.
        1. Go to spline.design
        2. Create/Import your 3D model
        3. Export -> Code -> Copy the URL (ending in .splinecode)
      */}
      <div className="w-full h-full relative z-10">
        <Spline scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode" />
      </div>


    </motion.div>
  </section>
);

export default Hero;

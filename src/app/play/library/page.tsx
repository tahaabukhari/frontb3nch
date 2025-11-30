'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { allDecks } from '@/lib/questions';

const LibraryPage = () => (
  <motion.section
    className="min-h-screen bg-dark-bg px-4 py-14 sm:px-6 sm:py-16"
    initial={{ opacity: 0, x: 40 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3 }}
  >
    <h1 className="sr-only">Quiz library</h1>
    <div className="mx-auto max-w-6xl space-y-10 text-center">
      <header>
        <p className="text-3xl font-bold text-white sm:text-4xl">Quiz Library</p>
        <p className="mt-3 text-base text-gray-400 sm:text-lg">
          Choose from our curated collection of study decks
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {allDecks.map((deck) => (
          <Link
            key={deck.id}
            href={`/play/difficulty?quiz=${deck.id}`}
            className="group rounded-3xl border-2 border-dark-border bg-dark-card p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-accent hover:shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-2xl font-bold text-white group-hover:text-accent">{deck.title}</p>
                <p className="mt-3 text-sm text-gray-400">{deck.description}</p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-accent/20 bg-accent/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-accent">Preview</p>
              <p className="mt-2 text-sm text-gray-300">
                <span className="font-medium">Q:</span> {deck.previewQA.question}
              </p>
              <p className="mt-1 text-sm text-gray-400">
                <span className="font-medium">A:</span> {deck.previewQA.answer}
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-gray-500">{deck.category}</span>
              <span className="text-sm font-semibold text-accent group-hover:translate-x-1 transition-transform">
                Start →
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="pt-6">
        <Link
          href="/play/import"
          className="inline-flex items-center gap-2 rounded-2xl border-2 border-accent bg-dark-card px-6 py-3 text-base font-semibold text-accent transition hover:bg-accent hover:text-dark-bg"
        >
          <span>📄</span>
          Or upload your own PDF
        </Link>
      </div>
    </div>
  </motion.section>
);

export default LibraryPage;

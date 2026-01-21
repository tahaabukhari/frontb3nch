'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { getAllBoards } from '@/lib/curriculum';

const LibraryPage = () => {
  const boards = getAllBoards();

  return (
    <motion.section
      className="min-h-screen px-4 py-14 sm:px-6 sm:py-16"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="sr-only">Quiz Library - Select Board</h1>
      <div className="mx-auto max-w-6xl space-y-10 text-center">
        <header>
          <p className="text-3xl font-bold text-white sm:text-4xl">Quiz Library</p>
          <p className="mt-3 text-base text-gray-400 sm:text-lg">
            Select an education board to explore curated study materials
          </p>
        </header>

        {/* Board Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 lg:max-w-2xl lg:mx-auto">
          {boards.map((board) => (
            <Link
              key={board.id}
              href={`/play/library/${board.id}`}
              className="group relative overflow-hidden rounded-3xl border-2 border-dark-border bg-dark-card p-8 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-xl"
            >
              {/* Gradient Accent */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="flex items-start gap-6">
                {/* Icon */}
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 text-3xl">
                  🏫
                </div>

                <div className="flex-1">
                  <p className="text-2xl font-bold text-white group-hover:text-accent transition-colors">
                    {board.name}
                  </p>
                  <p className="mt-2 text-sm text-gray-400">
                    {board.description}
                  </p>

                  {/* Latest Curriculum Badge */}
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent">
                    <span>✓</span>
                    Latest curriculum ({board.issueDate})
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-dark-border pt-4">
                <span className="text-xs uppercase tracking-wider text-gray-500">{board.region}</span>
                <span className="text-sm font-semibold text-accent group-hover:translate-x-1 transition-transform">
                  Browse Grades →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Upload Own PDF Option */}
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
};

export default LibraryPage;

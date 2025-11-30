'use client';

import Image from 'next/image';
import Link from 'next/link';

const Navbar = () => (
  <header className="sticky top-0 z-50 border-b border-dark-border bg-dark-card/90 backdrop-blur">
    <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
      <Link href="/" className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-gold text-2xl">
          🐐
        </div>
        <span className="text-lg font-bold text-white sm:text-xl">
          study<span className="text-accent animate-glint">Goat</span>
        </span>
      </Link>
      <nav className="flex items-center gap-3">
        <Link
          href="/play/library"
          className="hidden text-sm font-medium text-gray-400 transition hover:text-white sm:block"
        >
          Library
        </Link>
        <button
          type="button"
          className="min-h-[44px] rounded-full bg-gradient-gold px-5 py-2.5 text-sm font-semibold text-dark-bg transition hover:opacity-90 sm:w-auto"
        >
          Sign in
        </button>
      </nav>
    </div>
  </header>
);

export default Navbar;

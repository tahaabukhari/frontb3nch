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
      <nav className="flex items-center gap-4 sm:gap-6">
        <Link
          href="/play/library"
          className="text-sm font-medium text-gray-400 transition hover:text-white"
        >
          Library
        </Link>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border-2 border-gray-700 bg-dark-card px-3 py-2 transition hover:border-accent"
          title="User Profile"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-gold text-sm font-bold text-dark-bg">
            U
          </div>
          <span className="hidden text-sm font-medium text-gray-300 sm:block">Profile</span>
        </button>
      </nav>
    </div>
  </header>
);

export default Navbar;

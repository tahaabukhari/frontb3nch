'use client';

import Image from 'next/image';
import Link from 'next/link';

const Navbar = () => (
  <header className="sticky top-0 z-50 border-b border-slate-200 bg-slate-50/90 backdrop-blur">
    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:gap-3 sm:px-6 sm:py-4">
      <Link href="/" className="flex items-center gap-3">
        <Image src="/logo.svg" alt="studyGoat" width={40} height={40} priority />
        <span className="text-lg font-bold text-slate-800 sm:text-xl">
          study<span className="text-orange-600 animate-glint">Goat</span>
        </span>
      </Link>
      <button
        type="button"
        className="min-h-[44px] w-full rounded-full border border-emerald-600 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50 sm:w-auto">
        Sign in with Google
      </button>
    </div>
  </header>
);

export default Navbar;

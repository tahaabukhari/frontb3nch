'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      {/* Container - Enable pointer events for the navbar itself */}
      <nav className="pointer-events-auto relative flex w-full max-w-5xl items-center justify-between gap-4 rounded-full border border-white/10 bg-black/60 p-2 pl-6 shadow-2xl backdrop-blur-xl transition-all sm:pr-2">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl border border-white/10 group-hover:scale-105 transition-transform">
            🔰
          </div>
          <span className="text-lg font-bold text-white sm:text-xl tracking-tight group-hover:text-gray-200 transition-colors">
            frontb3nch
          </span>
        </Link>

        {/* Desktop Nav Items */}
        <div className="hidden items-center gap-2 sm:flex">
          <Link
            href="/play/library"
            className="rounded-full px-5 py-2 text-sm font-medium text-gray-300 transition hover:bg-white/10 hover:text-white"
          >
            Library
          </Link>

          {/* Profile Button */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`flex items-center gap-3 rounded-full border border-white/10 bg-zinc-900/50 pl-1 pr-4 py-1 transition hover:bg-zinc-800 hover:border-white/20 ${isMenuOpen ? 'bg-zinc-800 border-white/20' : ''}`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-xs font-bold text-white shadow-lg">
                U
              </div>
              <span className="text-sm font-medium text-gray-300">Profile</span>
              {/* Chevron Icon */}
              <svg className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Desktop Dropdown */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-3 w-64 rounded-2xl border border-white/10 bg-[#0f0f0f] p-2 shadow-2xl origin-top-right overflow-hidden backdrop-blur-3xl"
                >
                  <div className="px-4 py-3 border-b border-white/5 mb-2">
                    <p className="text-sm font-bold text-white">My Account</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">guest@frontb3nch.app</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <DropdownItem href="/play/profile" icon="👤">My Profile</DropdownItem>
                    <DropdownItem href="#" icon="📊">My Records</DropdownItem>
                    <DropdownItem href="#" icon="⚙️">Settings</DropdownItem>
                    <DropdownItem href="#" icon="🎮">Funzone</DropdownItem>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Menu Button  */}
        <div className="sm:hidden mr-1">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 active:scale-95 transition-transform"
          >
            <div className="h-full w-full rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white">U</div>
          </button>
        </div>

      </nav>

      {/* Mobile Modal Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 sm:hidden pointer-events-auto"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="fixed left-4 right-4 top-1/2 -translate-y-1/2 z-50 rounded-3xl border border-white/10 bg-[#121212] p-5 shadow-2xl sm:hidden pointer-events-auto overflow-hidden bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f]"
            >
              <div className="flex items-center gap-4 mb-8 p-1">
                <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xl font-bold text-white shadow-lg ring-4 ring-white/5">U</div>
                <div>
                  <p className="text-lg font-bold text-white">My Account</p>
                  <p className="text-sm text-gray-500">Guest User</p>
                </div>
              </div>

              <div className="space-y-2">
                <DropdownItem href="/play/profile" icon="👤" onClick={() => setIsMenuOpen(false)}>My Profile</DropdownItem>
                <DropdownItem href="/play/library" icon="📚" onClick={() => setIsMenuOpen(false)}>Library</DropdownItem>
                <DropdownItem href="#" icon="📊" onClick={() => setIsMenuOpen(false)}>My Records</DropdownItem>
                <DropdownItem href="#" icon="⚙️" onClick={() => setIsMenuOpen(false)}>Settings</DropdownItem>
                <DropdownItem href="#" icon="🎮" onClick={() => setIsMenuOpen(false)}>Funzone</DropdownItem>
              </div>

              <button onClick={() => setIsMenuOpen(false)} className="mt-8 w-full py-3.5 rounded-xl bg-white/5 text-sm font-semibold text-gray-300 hover:bg-white/10 transition-colors border border-white/5">
                Close Menu
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

const DropdownItem = ({ children, href, icon, onClick }: { children: React.ReactNode; href: string; icon: string; onClick?: () => void }) => (
  <Link
    href={href}
    onClick={onClick}
    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-400 transition-all hover:bg-white/10 hover:text-white rounded-xl group"
  >
    <span className="text-lg opacity-70 group-hover:opacity-100 transition-opacity">{icon}</span>
    {children}
  </Link>
);

export default Navbar;

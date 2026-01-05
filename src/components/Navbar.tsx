'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ isDashboard = false }: { isDashboard?: boolean }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      {/* Container - Enable pointer events for the navbar itself */}
      <nav className="pointer-events-auto relative z-50 flex w-full max-w-7xl items-center justify-between gap-4 rounded-full border border-white/10 bg-black/80 p-2 pl-6 shadow-2xl backdrop-blur-xl transition-all sm:pr-2">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 border border-white/10 group-hover:scale-105 transition-transform overflow-hidden">
            <img src="/logo.png" alt="frontb3nch" className="w-full h-full object-cover" />
          </div>
          {!isDashboard && (
            <span className="text-lg font-bold text-white sm:text-xl tracking-tight group-hover:text-gray-200 transition-colors">
              frontb3nch
            </span>
          )}
        </Link>

        {/* Desktop Nav Items */}
        <div className="hidden items-center gap-1 sm:flex">
          {!isDashboard && (
            <>
              <NavLink href="/dashboard">Learning</NavLink>
              <NavLink href="/play/library">Library</NavLink>
              <NavLink href="/about">About</NavLink>
            </>
          )}

          {/* Profile Button */}
          <div className="relative ml-2">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`flex items-center gap-3 rounded-full border border-white/10 bg-zinc-900/50 pl-1 pr-4 py-1 transition hover:bg-zinc-800 hover:border-white/20 ${isMenuOpen ? 'bg-zinc-800 border-white/20' : ''}`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-700 text-xs font-bold text-white shadow-lg border border-white/10">
                U
              </div>
              <span className="text-sm font-medium text-gray-300">Account</span>
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
                  className="pointer-events-auto absolute right-0 top-full mt-3 w-64 rounded-2xl border border-white/10 bg-black/80 p-2 shadow-2xl origin-top-right overflow-hidden backdrop-blur-3xl"
                >
                  <div className="px-4 py-3 border-b border-white/5 mb-2">
                    <p className="text-sm font-bold text-white">My Account</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">guest@frontb3nch.app</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <DropdownItem href="/dashboard" icon="📊">Dashboard</DropdownItem>
                    <DropdownItem href="/play/profile" icon="👤">My Profile</DropdownItem>
                    <div className="my-1 border-b border-white/5" />
                    <DropdownItem href="/play/settings" icon="⚙️">Settings</DropdownItem>
                    <DropdownItem href="/play/funzone" icon="🎮">Funzone</DropdownItem>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Menu Button  */}
        <div className="sm:hidden relative mr-1">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 active:scale-95 transition-transform"
          >
            <div className="h-full w-full rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold text-white">U</div>
          </button>

          {/* Mobile Dropdown - Positioned relative to the button/container */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="pointer-events-auto absolute right-0 top-full mt-3 w-64 rounded-2xl border border-white/10 bg-black/80 p-2 shadow-2xl origin-top-right overflow-hidden backdrop-blur-3xl z-50"
              >
                <div className="px-4 py-3 border-b border-white/5 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-white border border-white/10">U</div>
                    <div>
                      <p className="text-sm font-bold text-white">My Account</p>
                      <p className="text-[10px] text-gray-500 truncate">guest@frontb3nch.app</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <DropdownItem href="/dashboard" icon="📊" onClick={() => setIsMenuOpen(false)}>Dashboard</DropdownItem>
                  <DropdownItem href="/play/profile" icon="👤" onClick={() => setIsMenuOpen(false)}>My Profile</DropdownItem>
                  {!isDashboard && (
                    <>
                      <div className="my-1 border-b border-white/5" />
                      <DropdownItem href="/dashboard" icon="🤖" onClick={() => setIsMenuOpen(false)}>Learning</DropdownItem>
                      <DropdownItem href="/play/library" icon="📚" onClick={() => setIsMenuOpen(false)}>Library</DropdownItem>
                      <DropdownItem href="/about" icon="ℹ️" onClick={() => setIsMenuOpen(false)}>About</DropdownItem>
                    </>
                  )}
                  <div className="my-1 border-b border-white/5" />
                  <DropdownItem href="/play/settings" icon="⚙️" onClick={() => setIsMenuOpen(false)}>Settings</DropdownItem>
                  <DropdownItem href="/play/funzone" icon="🎮" onClick={() => setIsMenuOpen(false)}>Funzone</DropdownItem>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </nav>

      {/* Click outside listener could go here, but for simplicity we rely on toggling */}
      {isMenuOpen && (
        <div className="fixed inset-0 pointer-events-auto z-40 bg-transparent" onClick={() => setIsMenuOpen(false)} aria-hidden="true" />
      )}

    </header>
  );
};

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link
    href={href}
    className="rounded-full px-5 py-2 text-sm font-medium text-gray-300 transition hover:bg-white/10 hover:text-white"
  >
    {children}
  </Link>
);

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

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import 'tailwindcss/tailwind.css';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import StarBackground from '@/components/StarBackground';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = { title: 'frontb3nch' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-[#0a0a0a]">
      <body className={`${inter.variable} font-sans min-h-screen bg-[#0a0a0a] text-white flex flex-col`}>
        <StarBackground />
        <Navbar />
        <PageTransition>
          <main className="flex-1">{children}</main>
          <Footer />
        </PageTransition>
      </body>
    </html>
  );
}

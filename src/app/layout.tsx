import type { Metadata } from 'next';
import { Comic_Neue } from 'next/font/google';
import 'tailwindcss/tailwind.css';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';

const comic = Comic_Neue({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-school' });

export const metadata: Metadata = { title: 'studyGoat' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-slate-50">
      <body className={`${comic.variable} font-school min-h-screen bg-slate-50 text-slate-800 flex flex-col`}>
        <Navbar />
        <PageTransition>
          <main className="flex-1">{children}</main>
          <Footer />
        </PageTransition>
      </body>
    </html>
  );
}

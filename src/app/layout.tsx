import type { Metadata } from 'next';
import { Comic_Neue } from 'next/font/google';
import 'tailwindcss/tailwind.css';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';

const comic = Comic_Neue({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-school' });

export const metadata: Metadata = { title: 'parhaiGoat' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-[#0a0a0a]">
      <body className={`${comic.variable} font-school min-h-screen bg-[#0a0a0a] text-white flex flex-col`}>
        <Navbar />
        <PageTransition>
          <main className="flex-1">{children}</main>
          <Footer />
        </PageTransition>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import 'tailwindcss/tailwind.css';
import './globals.css';
import GlobalLayoutWrapper from '@/components/GlobalLayoutWrapper';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = { title: 'frontb3nch' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-[#0a0a0a]">
       <body className={`${inter.variable} font-sans min-h-screen bg-transparent text-white flex flex-col`}>
        <GlobalLayoutWrapper>
          {children}
        </GlobalLayoutWrapper>
      </body>
    </html>
  );
}

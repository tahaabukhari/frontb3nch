import type { Metadata } from 'next';
import Hero from '@/components/Hero';
import BottomBar from '@/components/BottomBar';

export const metadata: Metadata = { title: 'frontb3nch | Home' };

const HomePage = () => (
  <main className="min-h-screen">
    <h1 className="sr-only">frontb3nch interactive study hub</h1>
    <Hero />
    <BottomBar />
  </main>
);

export default HomePage;

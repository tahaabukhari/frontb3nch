import type { Metadata } from 'next';
import Hero from '@/components/Hero';
import BottomBar from '@/components/BottomBar';

export const metadata: Metadata = { title: 'studyGoat | Home' };

const HomePage = () => (
  <main className="min-h-screen bg-dark-bg">
    <h1 className="sr-only">studyGoat interactive study hub</h1>
    <Hero />
    <BottomBar />
  </main>
);

export default HomePage;

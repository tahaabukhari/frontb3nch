import type { Metadata } from 'next';
import Hero from '@/components/Hero';
import BottomBar from '@/components/BottomBar';

export const metadata: Metadata = { title: 'studyGoat | Home' };

const HomePage = () => (
  <div className="bg-slate-50">
    <h1 className="sr-only">studyGoat interactive study hub</h1>
    <Hero />
    <BottomBar />
  </div>
);

export default HomePage;

'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import StarBackground from '@/components/StarBackground';
import { UserProvider } from '@/context/UserContext';
import { SoundProvider } from '@/context/SoundContext';

export default function GlobalLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');
  const isStudyDate = pathname?.startsWith('/play/study-date');

  // StudyDate4000 has its own full-screen UI, no global elements
  if (isStudyDate) {
    return (
      <UserProvider>
        <SoundProvider>{children}</SoundProvider>
      </UserProvider>
    );
  }

  if (isDashboard) {
    return (
      <UserProvider>
        <SoundProvider>
          <Navbar isDashboard={true} />
          <main>{children}</main>
        </SoundProvider>
      </UserProvider>
    );
  }

  return (
    <UserProvider>
      <SoundProvider>
        <StarBackground />
        <Navbar />
        <PageTransition>
          <main className="flex-1 pt-24 sm:pt-28">{children}</main>
          <Footer />
        </PageTransition>
      </SoundProvider>
    </UserProvider>
  );
}

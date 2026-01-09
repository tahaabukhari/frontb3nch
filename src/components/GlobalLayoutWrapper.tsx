'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import StarBackground from '@/components/StarBackground';
import { UserProvider } from '@/context/UserContext';

export default function GlobalLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  if (isDashboard) {
    return (
      <UserProvider>
        <Navbar isDashboard={true} />
        <main>{children}</main>
      </UserProvider>
    );
  }

  return (
    <UserProvider>
      <StarBackground />
      <Navbar />
      <PageTransition>
        <main className="flex-1 pt-24 sm:pt-28">{children}</main>
        <Footer />
      </PageTransition>
    </UserProvider>
  );
}

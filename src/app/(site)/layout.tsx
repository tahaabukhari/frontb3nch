import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import StarBackground from '@/components/StarBackground';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
       <StarBackground />
       <Navbar />
       <PageTransition>
         <main className="flex-1 pt-24 sm:pt-28">{children}</main>
         <Footer />
       </PageTransition>
    </div>
  );
}

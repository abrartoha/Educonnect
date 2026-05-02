import { lazy, Suspense } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import Stats from '../components/landing/Stats';
import HowItWorks from '../components/landing/HowItWorks';
import Testimonials from '../components/landing/Testimonials';
import CTA from '../components/landing/CTA';
import useStore from '../store/useStore';

const AIChatWidget = lazy(() => import('../components/chat/AIChatWidget'));

export default function Landing() {
  const { currentUser, isAuthenticated } = useStore();

  const viewMode = !isAuthenticated
    ? 'visitor'
    : currentUser?.role === 'student'
      ? 'student'
      : 'partner';

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      <main>
        <Hero viewMode={viewMode} />
        <Features viewMode={viewMode} />
        <Stats viewMode={viewMode} />
        <HowItWorks viewMode={viewMode} />
        <Testimonials />
        <CTA viewMode={viewMode} />
      </main>

      <Footer />

      <Suspense fallback={null}>
        <AIChatWidget />
      </Suspense>
    </div>
  );
}

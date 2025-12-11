import React from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import VerseSection from './components/VerseSection';
import YoutubeSection from './components/YoutubeSection'; // Already updated, ensuring overlap check
import GallerySection from './components/GallerySection';
import PrayerSection from './components/PrayerSection';
import ServiceInfoSection from './components/ServiceInfoSection';
import EventSection from './components/EventSection';
import NewcomerSection from './components/NewcomerSection';
import Footer from './components/Footer';
import CloudBackground from './components/CloudBackground';
import { useEffect } from 'react';
import Lenis from 'lenis';
import './App.css';

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false, // Mobile usually prefers native
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="app-wrapper" style={{ position: 'relative' }}>
      <CloudBackground />
      <Header />
      <HeroSection /> {/* New Hero Section at the top */}
      <VerseSection />
      <YoutubeSection /> {/* Old Hero Section, now YoutubeSection */}

      <div className="container">
        <div style={{ gridColumn: '1 / -1' }}>
          <GallerySection />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <PrayerSection />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <ServiceInfoSection />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <EventSection />
        </div>
      </div>

      <NewcomerSection />
      <Footer />
    </div>
  );
}

export default App;

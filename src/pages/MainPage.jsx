import React, { useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import VerseSection from '../components/VerseSection';
import YoutubeSection from '../components/YoutubeSection'; 
import GallerySection from '../components/GallerySection';
import PrayerSection from '../components/PrayerSection';
import ServiceInfoSection from '../components/ServiceInfoSection';
import EventSection from '../components/EventSection';
import NewcomerSection from '../components/NewcomerSection';
import Footer from '../components/Footer';
import CloudBackground from '../components/CloudBackground';
import BalloonBackground from '../components/BalloonBackground';
function MainPage() {


  return (
    <div className="app-wrapper" style={{ position: 'relative' }}>
      <CloudBackground />
      <BalloonBackground />
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

export default MainPage;

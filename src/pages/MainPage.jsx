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
function MainPage() {


  return (
    <div className="app-wrapper" style={{ position: 'relative' }}>
      <HeroSection /> {/* New Hero Section at the top */}
      <VerseSection />
      <YoutubeSection /> {/* Old Hero Section, now YoutubeSection */}

      <GallerySection />

      <PrayerSection />
      <ServiceInfoSection />
      <EventSection />

      <NewcomerSection />
      <Footer />
    </div>
  );
}

export default MainPage;

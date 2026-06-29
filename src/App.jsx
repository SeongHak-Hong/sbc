import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import MainPage from './pages/MainPage';
import NurturePage from './pages/NurturePage';
import HistoryPage from './pages/HistoryPage';
import VisionPage from './pages/VisionPage';
import WorshipPage from './pages/WorshipPage';
import TeamPage from './pages/TeamPage';
import NextGenPage from './pages/NextGenPage';
import CellgroupPage from './pages/CellgroupPage';
import SchedulePage from './pages/SchedulePage';
import MissionsPage from './pages/MissionsPage';
import NewsPage from './pages/NewsPage';
import ScrollToTop from './components/ScrollToTop';
import Lenis from 'lenis';
import './App.css';

function AppRoutes() {
  const location = useLocation();

  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<MainPage />} />
      <Route path="/nurture" element={<NurturePage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/vision" element={<VisionPage />} />
      <Route path="/worship" element={<WorshipPage />} />
      <Route path="/team" element={<TeamPage />} />
      <Route path="/nextgen" element={<NextGenPage />} />
      <Route path="/cellgroup" element={<CellgroupPage />} />
      <Route path="/schedule" element={<SchedulePage />} />
      <Route path="/missions" element={<MissionsPage />} />
      <Route path="/news" element={<NewsPage />} />
    </Routes>
  );
}

function App() {
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false, // Mobile usually prefers native
    });

    window.lenis = lenis;

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
    <Router basename={import.meta.env.BASE_URL}>
      <ScrollToTop />
      <Header />
      <AppRoutes />
    </Router>
  );
}

export default App;

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import MainPage from './pages/MainPage';
import WelcomePage from './pages/WelcomePage';
import HistoryPage from './pages/HistoryPage';
import VisionPage from './pages/VisionPage';
import WorshipPage from './pages/WorshipPage';
import TeamPage from './pages/TeamPage';
import NextGenPage from './pages/NextGenPage';
import CommunityPage from './pages/CommunityPage';
import OutreachPage from './pages/OutreachPage';
import EventsPage from './pages/EventsPage';
import NewsPage from './pages/NewsPage';
import NetworkPage from './pages/NetworkPage';
import PostDetailPage from './pages/PostDetailPage';
import MediaPage from './pages/MediaPage';
import ScrollToTop from './components/ScrollToTop';

// Admin Imports
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/admin/ProtectedRoute';
import LoginPage from './pages/admin/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCellgroups from './pages/admin/AdminCellgroups';
import AdminNextGen from './pages/admin/AdminNextGen';
import AdminMissions from './pages/admin/AdminMissions';
import AdminPosts from './pages/admin/AdminPosts';
import AdminSchedule from './pages/admin/AdminSchedule';
import AdminMembersNews from './pages/admin/AdminMembersNews';
import AdminMemberBusiness from './pages/admin/AdminMemberBusiness';
import AdminFeedback from './pages/admin/AdminFeedback';
import Migration from './pages/admin/Migration';

import Lenis from 'lenis';
import './App.css';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('GlobalErrorBoundary caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', backgroundColor: '#fee', color: 'red', minHeight: '100vh', zIndex: 9999, position: 'relative' }}>
          <h2>CRITICAL REACT ERROR</h2>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '20px', fontSize: '14px' }}>
            {this.state.error && this.state.error.toString()}
            <br /><br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

export const SquiCircleFilterStatic = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', width: 0, height: 0, visibility: 'hidden' }}
      version="1.1"
    >
      <defs>
        <filter id="SkiperSquiCircleFilterLayout">
          {/* 1. Normalize alpha so the semi-transparent background and opaque children become a uniform solid block */}
          <feColorMatrix 
            in="SourceAlpha" 
            type="matrix" 
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1000 0" 
            result="solidAlpha" 
          />
          {/* 2. Blur the uniform solid block */}
          <feGaussianBlur in="solidAlpha" stdDeviation="10" result="blur" />
          {/* 3. Threshold to create the squircle shape (20 -10 aligns the edges exactly and rounds the corners) */}
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"
            result="squircle_mask"
          />
          {/* 4. Mask the original unblurred graphic */}
          <feComposite in="SourceGraphic" in2="squircle_mask" operator="in" />
        </filter>
      </defs>
    </svg>
  );
};

function AppRoutes() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/manager-lounge');

  return (
    <>
      {!isAdminRoute && <Header />}
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<MainPage />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/vision" element={<VisionPage />} />
        <Route path="/worship" element={<WorshipPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/nextgen" element={<NextGenPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/outreach" element={<OutreachPage />} />
        <Route path="/media" element={<MediaPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/network" element={<NetworkPage />} />
        <Route path="/post/:id" element={<PostDetailPage />} />

        {/* 관리자 라우트 */}
        <Route path="/manager-lounge/login" element={<LoginPage />} />
        <Route 
            path="/manager-lounge" 
            element={
                <ProtectedRoute>
                    <AdminLayout />
                </ProtectedRoute>
            }
        >
            <Route index element={<AdminDashboard />} />
            <Route path="posts" element={<AdminPosts />} />
            <Route path="cellgroups" element={<AdminCellgroups />} />
            <Route path="nextgen" element={<AdminNextGen />} />
            <Route path="missions" element={<AdminMissions />} />
            <Route path="schedule" element={<AdminSchedule />} />
            <Route path="members-news" element={<AdminMembersNews />} />
            <Route path="member-business" element={<AdminMemberBusiness />} />
            <Route path="feedback" element={<AdminFeedback />} />
            <Route path="migration" element={<Migration />} />
        </Route>
      </Routes>
    </>
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
      <GlobalErrorBoundary>
        <SquiCircleFilterStatic />
        <ScrollToTop />
        <AppRoutes />
      </GlobalErrorBoundary>
    </Router>
  );
}

export default App;

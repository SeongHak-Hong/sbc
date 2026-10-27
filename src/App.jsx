import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header';
import MainPage from './pages/MainPage';
import WelcomePage from './pages/WelcomePage';
import HistoryPage from './pages/HistoryPage';
import GalleryPage from './pages/GalleryPage';
import VisionPage from './pages/VisionPage';
import GuidePage from './pages/GuidePage';
import TeamPage from './pages/TeamPage';
import NextGenPage from './pages/NextGenPage';
import CommunityPage from './pages/CommunityPage';
import OutreachPage from './pages/OutreachPage';
import EventsPage from './pages/EventsPage';
import NewsPage from './pages/NewsPage';
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
import AdminGallery from './pages/admin/AdminGallery';
import AdminMissions from './pages/admin/AdminMissions';
import AdminPosts from './pages/admin/AdminPosts';
import AdminSchedule from './pages/admin/AdminSchedule';
import AdminMembersNews from './pages/admin/AdminMembersNews';
import AdminMemberBusiness from './pages/admin/AdminMemberBusiness';
import AdminFeedback from './pages/admin/AdminFeedback';
import Migration from './pages/admin/Migration';
import AdminImageMove from './pages/admin/AdminImageMove';

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

const SITE_URL = 'https://shintanjin.or.kr';
const SITE_NAME = '신탄진침례교회';

// 페이지 주소 → 탭 제목. 주소를 바꾸면 public/sitemap.xml, public/_redirects, 아래 OLD_PATHS도 함께 고칠 것
const PAGE_TITLES = {
  '/': null,
  '/vision': '인사말 · 비전',
  '/guide': '교회 안내',
  '/gallery': '추억 갤러리',
  '/team': '섬기는 사람들',
  '/media': '예배영상',
  '/newcomer': '새가족',
  '/groups': '구역 안내',
  '/nextgen': '다음세대',
  '/outreach': '선교전도',
  '/news': '소식 · 주보',
  '/events': '교회 일정',
  '/photos': '갤러리',
};

// 리뉴얼 전 주소 → 새 주소 (예전 링크·검색 결과로 들어와도 맞는 페이지로)
const OLD_PATHS = [
  ['/history', '/gallery'],
  ['/welcome', '/newcomer'],
  ['/community', '/groups'],
  ['/network', '/news?tab=network'],
  ['/worship', '/guide'],
  ['/missions', '/outreach'],
];

// 페이지마다 탭 제목과 대표 주소(canonical)를 맞춘다. 게시물 팝업은 뒤에 깔린 페이지 기준
const usePageMeta = (pathname) => {
  useEffect(() => {
    if (!(pathname in PAGE_TITLES)) return;
    const title = PAGE_TITLES[pathname];
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = SITE_URL + pathname;
  }, [pathname]);
};

function AppRoutes() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/manager-lounge');
  const background = location.state && location.state.background;
  usePageMeta((background || location).pathname);

  const pageTransitionVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.4, delay: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.4 } }
  };

  return (
    <>
      {!isAdminRoute && <Header />}
      
      <AnimatePresence mode="wait">
        <motion.div
          key={(background || location).pathname}
          variants={pageTransitionVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
        >
          <Routes location={background || location}>
            <Route path="/" element={<MainPage />} />
            <Route path="/newcomer" element={<WelcomePage />} />
            <Route path="/gallery" element={<HistoryPage />} />
            <Route path="/photos" element={<GalleryPage />} />
            <Route path="/vision" element={<VisionPage />} />
            <Route path="/guide" element={<GuidePage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/nextgen" element={<NextGenPage />} />
            <Route path="/groups" element={<CommunityPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/outreach" element={<OutreachPage />} />
            <Route path="/media" element={<MediaPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/post/:id" element={<PostDetailPage />} />

            {/* 리뉴얼 전 주소 → 새 주소 (배포 서버는 public/_redirects가 먼저 301로 보낸다) */}
            {OLD_PATHS.map(([from, to]) => (
              <Route key={from} path={from} element={<Navigate to={to} replace />} />
            ))}

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
                <Route path="gallery" element={<AdminGallery />} />
                <Route path="missions" element={<AdminMissions />} />
                <Route path="schedule" element={<AdminSchedule />} />
                <Route path="members-news" element={<AdminMembersNews />} />
                <Route path="member-business" element={<AdminMemberBusiness />} />
                <Route path="feedback" element={<AdminFeedback />} />
                <Route path="migration" element={<Migration />} />
                <Route path="image-move" element={<AdminImageMove />} />
            </Route>
          </Routes>
        </motion.div>
      </AnimatePresence>

      {background && (
        <Routes>
          <Route path="/post/:id" element={<PostDetailPage />} />
        </Routes>
      )}
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

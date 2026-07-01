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
import MembersNewsPage from './pages/MembersNewsPage';
import MemberBusinessPage from './pages/MemberBusinessPage';
import PostDetailPage from './pages/PostDetailPage';
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
import Migration from './pages/admin/Migration';

import Lenis from 'lenis';
import './App.css';

function AppRoutes() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/manager-lounge');

  return (
    <>
      {!isAdminRoute && <Header />}
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
        <Route path="/members-news" element={<MembersNewsPage />} />
        <Route path="/member-business" element={<MemberBusinessPage />} />
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
      <ScrollToTop />
      <AppRoutes />
    </Router>
  );
}

export default App;

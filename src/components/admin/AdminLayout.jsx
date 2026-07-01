import React, { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import styles from './AdminLayout.module.css';

const AdminLayout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // 동적 Noindex 삽입
        let meta = document.querySelector('meta[name="robots"]');
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = 'robots';
            document.head.appendChild(meta);
        }
        meta.content = 'noindex, nofollow';

        return () => {
            // 관리자 페이지를 벗어나면 원래대로 복구 (선택 사항)
            meta.content = 'index, follow';
        };
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/manager-lounge/login');
        } catch (error) {
            console.error('로그아웃 실패:', error);
        }
    };

    return (
        <div className={styles.adminContainer}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    <h2>관리자 라운지</h2>
                </div>
                <nav className={styles.nav}>
                    <NavLink to="/manager-lounge" end className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
                        <span className="material-symbols-outlined">dashboard</span>
                        대시보드 홈
                    </NavLink>
                    <NavLink to="/manager-lounge/posts" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
                        <span className="material-symbols-outlined">forum</span>
                        나눔터 (소식/주보)
                    </NavLink>
                    <NavLink 
                        to="/manager-lounge/nextgen"
                        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                    >
                        <span className="material-symbols-outlined">child_care</span>
                        다음세대 관리
                    </NavLink>
                    <NavLink 
                        to="/manager-lounge/cellgroups"
                        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                    >
                        <span className="material-symbols-outlined">groups</span>
                        구역 안내 관리
                    </NavLink>
                    <NavLink 
                        to="/manager-lounge/missions"
                        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                    >
                        <span className="material-symbols-outlined">public</span>
                        선교전도 관리
                    </NavLink>
                    <NavLink 
                        to="/manager-lounge/schedule"
                        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                    >
                        <span className="material-symbols-outlined">event</span>
                        교회 일정 관리
                    </NavLink>
                    <NavLink 
                        to="/manager-lounge/members-news"
                        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                    >
                        <span className="material-symbols-outlined">diversity_1</span>
                        성도 소식 관리
                    </NavLink>
                    <NavLink 
                        to="/manager-lounge/member-business"
                        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                    >
                        <span className="material-symbols-outlined">storefront</span>
                        성도 사업체 관리
                    </NavLink>
                    {auth.currentUser?.email === 'ing6023@gmail.com' && (
                        <NavLink 
                            to="/manager-lounge/migration"
                            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                        >
                            <span className="material-symbols-outlined">upload_file</span>
                            데이터 마이그레이션
                        </NavLink>
                    )}
                </nav>
                <div className={styles.sidebarFooter}>
                    <button onClick={handleLogout} className={styles.logoutBtn}>로그아웃</button>
                    <a href="/" target="_blank" rel="noreferrer" className={styles.homeLink}>홈페이지 보기</a>
                </div>
            </aside>
            <main className={styles.mainContent}>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;

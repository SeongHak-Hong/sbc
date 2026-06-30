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
                    <h2>Manager Lounge</h2>
                </div>
                <nav className={styles.nav}>
                    <NavLink to="/manager-lounge" end className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
                        대시보드 홈
                    </NavLink>
                    <NavLink to="/manager-lounge/posts" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
                        나눔터 (소식/주보)
                    </NavLink>
                    <NavLink to="/manager-lounge/cellgroups" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
                        구역 안내 관리
                    </NavLink>
                    <NavLink to="/manager-lounge/nextgen" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
                        다음세대 관리
                    </NavLink>
                    <NavLink to="/manager-lounge/missions" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
                        선교전도 관리
                    </NavLink>
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

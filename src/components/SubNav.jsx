import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './SubNav.module.css';
import { motion } from 'framer-motion';

const SubNav = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const tabs = [
        { name: '인사말 및 비전', path: '/vision' },
        { name: '예배 및 오시는 길', path: '/worship' },
        { name: '교회 발자취', path: '/history' },
        { name: '섬기는 사람들', path: '/team' },
    ];

    return (
        <nav className={styles.subNav}>
            <ul className={styles.navList}>
                {tabs.map((tab) => {
                    const isActive = location.pathname === tab.path;
                    return (
                        <li 
                            key={tab.path} 
                            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                            onClick={() => navigate(tab.path)}
                        >
                            {tab.name}
                            {isActive && (
                                <motion.div 
                                    className={styles.activePill}
                                    layoutId="activeTabPill"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};

export default SubNav;

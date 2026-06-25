import React, { useState, useEffect, useRef } from 'react';
import logoSbc from '../assets/shintanjin-baptist-church-logo.svg';
import '../index.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './MenuDropdown.module.css';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeSubmenu, setActiveSubmenu] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const isSubpage = location.pathname !== '/';
    const menuRef = useRef(null);
    const toggleBtnRef = useRef(null);

    // Prevent background scrolling when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            // Close submenus after delay when menu closes
            setTimeout(() => setActiveSubmenu(null), 300);
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMenuOpen]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isMenuOpen && 
                menuRef.current && !menuRef.current.contains(e.target) &&
                toggleBtnRef.current && !toggleBtnRef.current.contains(e.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen]);

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 'var(--header-padding-y)',
        paddingBottom: 'var(--header-padding-y)',
        color: 'var(--white)',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 100,
        paddingLeft: 'var(--header-padding-x)',
        paddingRight: 'var(--header-padding-x)',
        boxSizing: 'border-box'
    };

    const handleLinkClick = (e, path) => {
        e.preventDefault();
        e.stopPropagation();
        if (path.startsWith('http')) {
            window.open(path, '_blank', 'noopener,noreferrer');
        } else {
            navigate(path);
        }
        setIsMenuOpen(false);
    };

    const toggleSubmenu = (id, e) => {
        e.stopPropagation();
        if (activeSubmenu === id) {
            setActiveSubmenu(null);
        } else {
            setActiveSubmenu(id);
        }
    };

    const menuData = [
        {
            id: "step-1", title: "교회소개", icon: "church", iconColor: styles.iconBlue,
            links: [
                { text: "인사말·비전", path: "/vision" },
                { text: "예배·오시는 길", path: "/worship" },
                { text: "추억 갤러리", path: "/history" },
                { text: "섬기는 분들", path: "/team" },
            ]
        },
        {
            id: "step-2", title: "예배찬양", icon: "music_note", iconColor: styles.iconBlue,
            links: [
                { text: "주일예배", path: "https://www.youtube.com/@sbc6312" },
                { text: "찬양대", path: "https://www.youtube.com/@sbc6312" },
                { text: "유튜브 채널", path: "https://www.youtube.com/@sbc6312" }
            ]
        },
        {
            id: "step-3", title: "양육훈련", icon: "local_library", iconColor: styles.iconBlue,
            links: [
                { text: "새가족 안내", path: "/nurture" },
                { text: "교구 및 소그룹", path: "/nurture" }
            ]
        },
        {
            id: "step-4", title: "다음세대", icon: "child_care", iconColor: styles.iconBlue,
            singlePagePath: "/nextgen"
        },
        {
            id: "step-5", title: "선교전도", icon: "public", iconColor: styles.iconBlue,
            singlePagePath: "/"
        },
        {
            id: "step-6", title: "나눔터", icon: "forum", iconColor: styles.iconBlue,
            links: [
                { text: "교회소식", path: "/" },
                { text: "교우동정", path: "/" },
                { text: "갤러리", path: "/" },
                { text: "사역일정", path: "/" }
            ]
        }
    ];

    return (
        <header style={headerStyle}>
            <Link to="/" className={styles.logo}>
                <img
                    src={logoSbc}
                    alt="신탄진교회"
                    style={{ height: 'var(--header-logo-height)', filter: 'brightness(0) invert(1)', transition: 'height 0.3s ease' }}
                />
            </Link>
            
            <div className={styles.toggleContainer}>
                <button 
                    ref={toggleBtnRef}
                    className={`${styles.toggleBtn} ${isMenuOpen ? styles.open : ''}`}
                    onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                >
                    <div className={styles.iconContainer}>
                        <span className={`material-symbols-outlined ${styles.iconMenu}`}>menu</span>
                        <span className={`material-symbols-outlined ${styles.iconClose}`}>close</span>
                    </div>
                </button>

                <div className={`${styles.backdrop} ${isMenuOpen ? styles.open : ''}`} onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); }}></div>

                <nav 
                    ref={menuRef}
                    className={`${styles.menuPanel} ${isMenuOpen ? styles.open : ''}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className={styles.menuList}>
                        {menuData.map((item, index) => {
                            const isSinglePage = !!item.singlePagePath;
                            const isExpanded = activeSubmenu === item.id;

                            return (
                                <React.Fragment key={item.id}>
                                    <li>
                                        {isSinglePage ? (
                                            <a 
                                                href={item.singlePagePath} 
                                                className={styles.menuItem}
                                                onClick={(e) => handleLinkClick(e, item.singlePagePath)}
                                            >
                                                <div className={styles.itemLeft}>
                                                    {item.title}
                                                </div>
                                            </a>
                                        ) : (
                                            <>
                                                <button 
                                                    className={`${styles.menuItem} ${isExpanded ? styles.expanded : ''}`}
                                                    onClick={(e) => toggleSubmenu(item.id, e)}
                                                >
                                                    <div className={styles.itemLeft}>
                                                        {item.title}
                                                    </div>
                                                    <span className={`material-symbols-outlined ${styles.chevron}`}>expand_more</span>
                                                </button>
                                                
                                                <div className={`${styles.submenuGrid} ${isExpanded ? styles.open : ''}`}>
                                                    <div className={styles.submenuInner}>
                                                        <ul className={styles.subList}>
                                                            {item.links.map((link, idx) => (
                                                                <li key={idx}>
                                                                    <a 
                                                                        href={link.path}
                                                                        className={styles.subItem}
                                                                        onClick={(e) => handleLinkClick(e, link.path)}
                                                                    >
                                                                        {link.text}
                                                                    </a>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </li>
                                </React.Fragment>
                            );
                        })}
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Header;

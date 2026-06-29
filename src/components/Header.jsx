import React, { useState, useEffect, useRef } from 'react';
import logoSbc from '../assets/shintanjin-baptist-church-logo.svg';
import '../index.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './MenuDropdown.module.css';
const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeSubmenu, setActiveSubmenu] = useState(null);
    const [isBulletinModalOpen, setIsBulletinModalOpen] = useState(false);
    
    // SCROLL STATES
    const [isVisible, setIsVisible] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);
    const lastScrollY = useRef(0);

    const location = useLocation();
    const navigate = useNavigate();
    const isSubpage = location.pathname !== '/';
    const menuRef = useRef(null);
    const toggleBtnRef = useRef(null);

    // Scroll listener
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            setIsScrolled(currentScrollY > 50);

            if (currentScrollY <= 0) {
                setIsVisible(true);
            } else {
                if (currentScrollY < lastScrollY.current) {
                    // Scrolling up
                    setIsVisible(true);
                } else if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
                    // Scrolling down
                    setIsVisible(false);
                }
            }
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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

    const isSolidWhite = isScrolled && isVisible && !isMenuOpen;

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 'var(--header-padding-y)',
        paddingBottom: 'var(--header-padding-y)',
        color: isSolidWhite ? 'rgb(29, 26, 28)' : 'var(--white)',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 100,
        paddingLeft: 'var(--header-padding-x)',
        paddingRight: 'var(--header-padding-x)',
        boxSizing: 'border-box',
        backgroundColor: isSolidWhite ? '#ffffff' : 'transparent',
        transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s ease, background-color 0.3s ease',
        boxShadow: isSolidWhite ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
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
                { text: "인사말 · 비전", path: "/vision" },
                { text: "예배 안내·오시는 길", path: "/worship" },
                { text: "추억 갤러리", path: "/history" },
                { text: "섬기는 사람들", path: "/team" },
            ]
        },
        {
            id: "step-3", title: "공동체", icon: "local_library", iconColor: styles.iconBlue,
            links: [
                { text: "새가족", path: "/nurture" },
                { text: "구역 안내", path: "/cellgroup" },
                { text: "찬양대", path: "https://www.youtube.com/@sbc6312" }
            ]
        },
        {
            id: "step-4", title: "다음세대", icon: "child_care", iconColor: styles.iconBlue,
            singlePagePath: "/nextgen"
        },
        {
            id: "step-5", title: "선교전도", icon: "public", iconColor: styles.iconBlue,
            singlePagePath: "/missions"
        },
        {
            id: "step-6", title: "나눔터", icon: "forum", iconColor: styles.iconBlue,
            links: [
                { text: "교회 소식", path: "/" },
                { text: "성도 소식", path: "/" },
                { text: "교회 일정", path: "/schedule" }
            ]
        }
    ];

    return (
        <>
            <header style={headerStyle}>
            <Link to="/" className={styles.logo} style={{ color: isSolidWhite ? 'rgb(29, 26, 28)' : '#fff', textDecoration: 'none' }}>
                <div
                    style={{ 
                        height: 'var(--header-logo-height)', 
                        aspectRatio: '408 / 69',
                        backgroundColor: isSolidWhite ? 'rgb(29, 26, 28)' : '#fff',
                        WebkitMaskImage: `url("${logoSbc}")`,
                        maskImage: `url("${logoSbc}")`,
                        WebkitMaskSize: 'contain',
                        maskSize: 'contain',
                        WebkitMaskRepeat: 'no-repeat',
                        maskRepeat: 'no-repeat',
                        transition: 'height 0.3s ease, background-color 0.3s ease' 
                    }}
                    role="img"
                    aria-label="신탄진교회"
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
                    <span>메뉴</span>
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
                        <button 
                            className={styles.imageButton}
                            onClick={(e) => {
                                e.preventDefault();
                                setIsBulletinModalOpen(true);
                                setIsMenuOpen(false);
                            }}
                            style={{ border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                        >
                            <span className={styles.imageButtonTitle}>주보 보기</span>
                            <span className={`material-symbols-outlined ${styles.imageButtonIcon}`}>arrow_forward</span>
                        </button>
                    </div>

                    <div className={styles.socialLinks}>
                        <a href="https://www.instagram.com/sbc6312" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                            </svg>
                        </a>
                        <a href="https://www.youtube.com/@sbc6312" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.084 0 12 0 12s0 3.916.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.872.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.916 24 12 24 12s0-3.916-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                        </a>
                    </div>
                </nav>
            </div>
        </header>

        {/* Bulletin Modal */}
        <AnimatePresence>
                {isBulletinModalOpen && (
                    <motion.div 
                        style={{
                            position: 'fixed',
                            top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            zIndex: 99999,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '24px',
                            padding: '40px 24px'
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsBulletinModalOpen(false)}
                    >
                        <motion.img 
                            src={`${import.meta.env.BASE_URL}bulletin.webp`} 
                            alt="주보" 
                            style={{
                                maxHeight: 'calc(100vh - 160px)',
                                height: 'auto',
                                maxWidth: '100%',
                                objectFit: 'contain',
                                borderRadius: '16px',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            onClick={(e) => e.stopPropagation()}
                        />
                        
                        {/* Past Bulletins Button */}
                        <motion.a 
                            href={`${import.meta.env.BASE_URL}board/bulletin`}
                            onClick={(e) => {
                                // e.preventDefault();
                            }}
                            style={{
                                padding: '12px 24px',
                                borderRadius: '999px',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                background: 'transparent',
                                color: '#ffffff',
                                fontSize: '15px',
                                fontWeight: '500',
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontFamily: 'var(--font-body)'
                            }}
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>history</span>
                            지난 주보 모아보기
                        </motion.a>

                        <button 
                            onClick={() => setIsBulletinModalOpen(false)}
                            style={{
                                position: 'absolute',
                                top: '24px',
                                right: '24px',
                                background: 'transparent',
                                border: 'none',
                                color: 'rgba(255, 255, 255, 0.6)',
                                cursor: 'pointer',
                                padding: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'color 0.2s ease',
                            }}
                            onMouseOver={(e) => e.currentTarget.style.color = '#ffffff'}
                            onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>close</span>
                        </button>

                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Header;

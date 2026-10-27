import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logoSbc from '../assets/shintanjin-baptist-church-logo.svg';
import styles from './Header.module.css';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDrilled, setIsDrilled] = useState(false);
    const [activeDrillId, setActiveDrillId] = useState(null);
    const [activeFlyoutId, setActiveFlyoutId] = useState(null);

    // 스크롤 상태: 아래로 스크롤 시 숨김, 위로 올릴 때만 헤더 노출
    const [isVisible, setIsVisible] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);
    const lastScrollY = useRef(0);
    const closeTimer = useRef(null);
    const openTimer = useRef(null);
    const navRef = useRef(null);
    const flyoutInnerRef = useRef(null);
    const flyoutGroupRefs = useRef({});

    const location = useLocation();
    const navigate = useNavigate();
    const isHistoryPage = location.pathname === '/gallery';

    // 1depth 메뉴 및 2depth 서브메뉴 데이터
    const menuItems = [
        {
            id: "about",
            title: "교회소개",
            subLabel: "교회소개 살펴보기",
            links: [
                { text: "인사말 · 비전", path: "/vision" },
                { text: "교회 안내", path: "/guide" },
                { text: "추억 갤러리", path: "/gallery" },
                { text: "섬기는 사람들", path: "/team" },
            ]
        },
        {
            id: "media",
            title: "예배영상",
            path: "/media"
        },
        {
            id: "community",
            title: "공동체",
            subLabel: "공동체 살펴보기",
            links: [
                { text: "새가족", path: "/newcomer" },
                { text: "구역 안내", path: "/groups" }
            ]
        },
        {
            id: "nextgen",
            title: "다음세대",
            path: "/nextgen"
        },
        {
            id: "outreach",
            title: "선교전도",
            path: "/outreach"
        },
        {
            id: "news",
            title: "나눔터",
            subLabel: "나눔터 살펴보기",
            links: [
                { text: "소식 · 주보", path: "/news" },
                { text: "교회 일정", path: "/events" },
                { text: "갤러리", path: "/photos" }
            ]
        }
    ];

    // 지금 페이지가 속한 메뉴 (브레드크럼 대신 메뉴 이름을 진하게 표시). 쿼리는 떼고, 하위 주소(/news/글)도 같은 메뉴로 본다
    const isHere = (path) => {
        const base = path.split('?')[0];
        return location.pathname === base || location.pathname.startsWith(`${base}/`);
    };
    const currentMenuId = menuItems.find((item) => (
        item.path ? isHere(item.path) : item.links.some((link) => isHere(link.path))
    ))?.id;

    // 스크롤 리스너: '위로 올릴 때만' 헤더 노출 규칙 적용
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setIsScrolled(currentScrollY > 40);

            if (currentScrollY <= 0) {
                setIsVisible(true);
            } else {
                if (currentScrollY < lastScrollY.current) {
                    // Scrolling up
                    setIsVisible(true);
                } else if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
                    // Scrolling down
                    if (!isMenuOpen && !activeFlyoutId) {
                        setIsVisible(false);
                    }
                }
            }
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isMenuOpen, activeFlyoutId]);

    // 라우트 변경 시 메뉴 및 시트 닫기
    useEffect(() => {
        closeAll();
    }, [location.pathname]);

    // 모바일 메뉴 열렸을 때 body 스크롤 방지
    useEffect(() => {
        if (!isMenuOpen) return;
        // 메뉴가 열린 동안 뒤 페이지 Lenis 스크롤도 멈춤 (메뉴 안만 스크롤)
        document.body.style.overflow = 'hidden';
        window.lenis?.stop();
        return () => {
            document.body.style.overflow = '';
            window.lenis?.start();
        };
    }, [isMenuOpen]);

    // ESC 키로 닫기
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                closeAll();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const closeAll = () => {
        clearTimeout(closeTimer.current);
        clearTimeout(openTimer.current);
        setActiveFlyoutId(null);
        setIsMenuOpen(false);
        setIsDrilled(false);
        setActiveDrillId(null);
    };

    // PC 호버 드롭다운 핸들러
    // 배경 판(.nav::before)이 늘어날 높이 = 활성 그룹 높이 + 시트 위아래 여백. 그룹마다 달라서 전환 때 부드럽게 늘고 줄어듦
    const setFlyoutHeight = (id) => {
        const group = flyoutGroupRefs.current[id];
        const inner = flyoutInnerRef.current;
        if (!group || !inner || !navRef.current) return;
        const cs = getComputedStyle(inner);
        const h = group.offsetHeight + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
        navRef.current.style.setProperty('--flyout-h', `${h}px`);
    };

    const handleFlyoutOpen = (id) => {
        clearTimeout(closeTimer.current);
        clearTimeout(openTimer.current);
        setFlyoutHeight(id);
        setActiveFlyoutId(id);
    };

    // 이미 열려 있으면 바로 교체, 닫혀 있으면 잠깐 머물렀을 때만 열기 (스쳐 지나갈 때 깜빡이지 않게)
    const handleFlyoutHover = (id) => {
        clearTimeout(openTimer.current);
        if (activeFlyoutId) handleFlyoutOpen(id);
        else openTimer.current = setTimeout(() => handleFlyoutOpen(id), 120);
    };

    const handleFlyoutScheduleClose = (delay = 140) => {
        clearTimeout(closeTimer.current);
        clearTimeout(openTimer.current);
        closeTimer.current = setTimeout(() => {
            setActiveFlyoutId(null);
        }, delay);
    };

    const handleNavLinkClick = (e, item) => {
        if (item.path) {
            navigate(item.path);
            closeAll();
        } else if (item.links) {
            e.preventDefault();
            if (activeFlyoutId === item.id) {
                setActiveFlyoutId(null);
            } else {
                handleFlyoutOpen(item.id);
            }
        }
    };

    const handleSubLinkClick = (e, path) => {
        e.preventDefault();
        navigate(path);
        closeAll();
    };

    // 모바일 메뉴 토글
    const handleMobileToggle = () => {
        if (isMenuOpen) {
            closeAll();
        } else {
            clearTimeout(closeTimer.current);
            setActiveFlyoutId(null);
            setIsMenuOpen(true);
            setIsDrilled(false);
            setActiveDrillId(null);
        }
    };

    const handleDrillInto = (id) => {
        setActiveDrillId(id);
        setIsDrilled(true);
    };

    const handleDrillBack = () => {
        setIsDrilled(false);
    };

    const isHeaderActuallyVisible = isVisible || isHistoryPage || isMenuOpen || !!activeFlyoutId;

    return (
        <>
            <header
                ref={navRef}
                className={`
                    ${styles.nav}
                    ${isHeaderActuallyVisible ? styles.navVisible : styles.navHidden}
                    ${isScrolled ? styles.navScrolled : ''}
                    ${activeFlyoutId ? styles.navFlyoutOpen : ''}
                    ${isMenuOpen ? styles.navOpen : ''}
                    ${isDrilled ? styles.navDrilled : ''}
                `}
                onPointerEnter={() => clearTimeout(closeTimer.current)}
                onPointerLeave={() => {
                    if (activeFlyoutId) handleFlyoutScheduleClose(140);
                }}
            >
                <div className={styles.navInner}>
                    {/* 모바일 2depth: 헤더 좌측 상단(로고 자리)의 '< 전체 메뉴' 버튼 */}
                    <button
                        type="button"
                        className={styles.navMobileBack}
                        onClick={handleDrillBack}
                        aria-label="전체 메뉴로 돌아가기"
                        tabIndex={isDrilled ? 0 : -1}
                    >
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                        <span>전체 메뉴</span>
                    </button>

                    <Link to="/" className={styles.logo} onClick={closeAll}>
                        <img
                            src={logoSbc}
                            alt="신탄진침례교회"
                            width="165"
                            height="24"
                            className={styles.logoImg}
                        />
                    </Link>

                    {/* 모바일 2줄 햄버거 ↔ X 모핑 버튼 */}
                    <button
                        type="button"
                        className={styles.navToggle}
                        onClick={handleMobileToggle}
                        aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴"}
                        aria-expanded={isMenuOpen}
                    >
                        <svg className={styles.navToggleSvg} viewBox="0 0 18 18" width="18" height="18" aria-hidden="true">
                            <polyline className={`${styles.navLine} ${styles.navLineTop}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points="2 5, 16 5" />
                            <polyline className={`${styles.navLine} ${styles.navLineBottom}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points="2 13, 16 13" />
                        </svg>
                    </button>

                    {/* PC 헤더 메뉴 (13px 기준 0.8125rem) */}
                    <nav className={styles.navLinks} aria-label="주요 메뉴">
                        {menuItems.map((item) => {
                            const hasSub = !!item.links;
                            const isActive = activeFlyoutId === item.id;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    className={`${styles.navLink} ${isActive ? styles.activeLink : ''} ${currentMenuId === item.id ? styles.currentLink : ''}`}
                                    aria-current={currentMenuId === item.id ? 'true' : undefined}
                                    onClick={(e) => handleNavLinkClick(e, item)}
                                    onPointerEnter={(e) => {
                                        if (e.pointerType === 'touch') return;
                                        if (hasSub) handleFlyoutHover(item.id);
                                        else handleFlyoutScheduleClose(90);
                                    }}
                                    onPointerLeave={() => clearTimeout(openTimer.current)}
                                    onFocus={() => {
                                        if (hasSub) handleFlyoutOpen(item.id);
                                        else setActiveFlyoutId(null);
                                    }}
                                    aria-expanded={hasSub ? isActive : undefined}
                                >
                                    {item.title}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* PC: Apple Globalnav 스타일 호버 드롭다운 시트 */}
                <div
                    className={styles.navFlyout}
                    aria-hidden={!activeFlyoutId}
                >
                    <div className={styles.navFlyoutInner} ref={flyoutInnerRef}>
                        {menuItems.filter(item => !!item.links).map((item) => {
                            const isCurrentGroup = activeFlyoutId === item.id;
                            return (
                                <div
                                    key={item.id}
                                    ref={(el) => { flyoutGroupRefs.current[item.id] = el; }}
                                    className={`${styles.navFlyoutGroup} ${isCurrentGroup ? styles.activeGroup : ''}`}
                                >
                                    <p className={styles.navFlyoutLabel}>{item.subLabel}</p>
                                    <ul className={styles.navFlyoutList}>
                                        {item.links.map((link, idx) => (
                                            <li key={link.path} style={{ '--stagger': idx }}>
                                                <a
                                                    href={link.path}
                                                    aria-current={isHere(link.path) ? 'page' : undefined}
                                                    onClick={(e) => handleSubLinkClick(e, link.path)}
                                                >
                                                    {link.text}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Mobile: Apple 스타일 풀스크린 커튼 + 좌우 슬라이드 드릴다운 */}
                <div className={styles.navMobile} aria-hidden={!isMenuOpen} data-lenis-prevent>
                    <div className={styles.navMobileStage}>
                        {/* 1depth 메인 목록 */}
                        <div className={`${styles.navMobilePane} ${styles.navMobileRoot}`}>
                            <ul className={styles.navMobileList}>
                                {menuItems.map((item, idx) => {
                                    const hasSub = !!item.links;
                                    return (
                                        <li key={item.id} style={{ '--m-i': idx }}>
                                            {hasSub ? (
                                                <button
                                                    type="button"
                                                    className={styles.navMobileItem}
                                                    aria-current={currentMenuId === item.id ? 'true' : undefined}
                                                    onClick={() => handleDrillInto(item.id)}
                                                >
                                                    <span>{item.title}</span>
                                                    <svg className={styles.navMobileChevron} viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                                        <path d="M9 6l6 6-6 6" />
                                                    </svg>
                                                </button>
                                            ) : (
                                                <a
                                                    href={item.path}
                                                    className={styles.navMobileItem}
                                                    aria-current={currentMenuId === item.id ? 'page' : undefined}
                                                    onClick={(e) => handleSubLinkClick(e, item.path)}
                                                >
                                                    <span>{item.title}</span>
                                                </a>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                        {/* 2depth 서브 패널 */}
                        <div className={`${styles.navMobilePane} ${styles.navMobileSub}`}>
                            {menuItems.filter(item => !!item.links).map((item) => {
                                const isCurrentSub = activeDrillId === item.id;
                                return (
                                    <div
                                        key={item.id}
                                        className={`${styles.navMobileSubGroup} ${isCurrentSub ? styles.activeSubGroup : ''}`}
                                    >
                                        <p className={styles.navMobileLabel}>{item.title}</p>
                                        <ul className={styles.navMobileList}>
                                            {item.links.map((link) => (
                                                <li key={link.path}>
                                                    <a
                                                        href={link.path}
                                                        className={styles.navMobileSubitem}
                                                        aria-current={isHere(link.path) ? 'page' : undefined}
                                                        onClick={(e) => handleSubLinkClick(e, link.path)}
                                                    >
                                                        {link.text}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </header>

            {/* Apple 페이지 배경 딤드 + 블러 (Scrim) */}
            <div
                className={`${styles.navScrim} ${activeFlyoutId ? styles.scrimActive : ''}`}
                aria-hidden={!activeFlyoutId}
                onPointerEnter={() => handleFlyoutScheduleClose(80)}
                onClick={closeAll}
            />
        </>
    );
};

export default Header;

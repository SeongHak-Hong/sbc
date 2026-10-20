import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import styles from './GuidePage.module.css';

import InteractiveShuttleMap from '../components/ui/InteractiveShuttleMap';
import { CHURCH_COORDS, CHURCH_ADDRESS, CHURCH_PHONE, TRANSIT_STOPS, shuttleSchedules } from '../data/shuttleData';

import map1F from '../assets/guide/1F.svg';
import map2F from '../assets/guide/2F.svg';
import map3F from '../assets/guide/3F.svg';
import mapSemi3F from '../assets/guide/semi-3F.svg';
import mapDasom1F from '../assets/guide/dasom-1F.svg';
import mapDasom2F from '../assets/guide/dasom-2F.svg';

import Breadcrumb from "../components/ui/Breadcrumb";

// rooms는 평면도 이미지의 대체 텍스트로 읽힘 (평면도 글자가 도형이라 화면 낭독기가 못 읽음)
const facilityTabs = [
    { id: '1F', label: '1층 식당', name: '본관 1층', rooms: ['식당', '안쪽식당', '초등부실', '주방', '주방 창고', '화장실'] },
    { id: '2F', label: '2층', name: '본관 2층', rooms: ['소예배실', '유치부실', '찬양연습실', '새가족실', '목양실', '교역자실', '행정실', '휴게실', '청소년실', '엘리베이터', '다솜관 연결 통로'] },
    { id: '3F', label: '3층', name: '본관 3층', rooms: ['대예배실', '강대상', '찬양대석', '헌금함', '자모실', '엘리베이터'] },
    { id: 'semi3F', label: '준3층', name: '본관 준3층', rooms: ['3층 대예배실이 내려다보이는 예배석', '방송실'] },
    { id: 'dasom1F', label: '다솜관 1층', name: '다솜관 1층', rooms: ['행복쉼터', '차·커피 진열대', '본관 2층 연결 통로'] },
    { id: 'dasom2F', label: '다솜관 2층', name: '다솜관 2층', rooms: ['예배 및 교제방', '쉼터', '회의실', '기도방'] },
];

const facilityAlt = (id) => {
    const floor = facilityTabs.find((tab) => tab.id === id);
    return floor ? `${floor.name} 평면도: ${floor.rooms.join(', ')}` : '시설 평면도';
};

const mapImages = {
    '1F': map1F,
    '2F': map2F,
    '3F': map3F,
    'semi3F': mapSemi3F,
    'dasom1F': mapDasom1F,
    'dasom2F': mapDasom2F
};

const ease = [0.16, 1, 0.3, 1];
// 선택 표시 이동: 넘침 없는 스프링 (도중에 다시 눌러도 지금 자리에서 이어 감)
const thumbSpring = { type: 'spring', bounce: 0, duration: 0.4 };

// 바뀌는 부분만 opacity + translateY(8px). custom으로 움직임 줄이기 여부를 받아 그때는 바로 바꾼다
const fadeVariants = {
    hidden: (reduce) => (reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }),
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease } },
    exit: (reduce) => (reduce
        ? { opacity: 0, transition: { duration: 0 } }
        : { opacity: 0, y: -8, transition: { duration: 0.2, ease } }),
};

// 예배시간 목록. 오른쪽에 time을 크게, 아랫줄에 "day · location"
const worshipGroups = [
    {
        id: 'adult',
        label: '어른 예배',
        items: [
            { id: 'sun1', name: '주일 1부 예배', day: '주일', time: '오전 7:00', location: '소예배실' },
            { id: 'sun2', name: '주일 2부 예배', day: '주일', time: '오전 11:00', location: '대예배실' },
            { id: 'sunpm', name: '주일 오후 예배', day: '주일', time: '오후 2:00', location: '대예배실' },
            { id: 'dawn', name: '새벽 기도회', day: '월~금', time: '새벽 5:00', location: '소예배실' },
            { id: 'intercession', name: '중보 기도회', day: '화요일', time: '오전 10:30', location: '소예배실' },
            { id: 'wed', name: '수요 예배', day: '수요일', time: '오후 7:00', location: '대예배실' },
            { id: 'fri', name: '금요 기도회', day: '금요일', time: '오후 9:00', location: '소예배실' },
        ],
    },
    {
        id: 'next',
        label: '다음세대',
        items: [
            { id: 'kinder', name: '유치부 (7세 이하)', day: '주일', time: '오전 9:00', location: '유치부실' },
            { id: 'kids', name: '초등부 주일예배', day: '주일', time: '오전 9:00', location: '러브키즈예배실' },
            { id: 'youth', name: '중고등부 주일예배', day: '주일', time: '오전 9:00', location: '소예배실' },
            { id: 'young', name: '청년부', day: '주일', time: '오후 1:30', location: '소예배실' },
            { id: 'tteok', name: '떡볶이 데이', day: '목요일', time: '오후 1~4시', location: '식당' },
        ],
    },
];

// 한 페이지에 이어진 섹션. 위 이동 버튼 줄의 순서와 같다
const sections = [
    { id: 'worship', label: '예배시간' },
    { id: 'directions', label: '오시는 길' },
    { id: 'shuttle', label: '차량운행' },
    { id: 'parking', label: '주차' },
    { id: 'facilities', label: '시설 안내' },
];
const sectionIds = sections.map((s) => s.id);

// 차량운행 예배 버튼에 쓰는 짧은 이름 (shuttleData의 id 기준)
const shuttleLabels = {
    dawn: '새벽예배',
    sunday2: '주일 2부',
    sundayAfternoon: '주일 오후',
    nextgen: '교회학교',
    wednesday: '수요예배',
};
const defaultShuttleId = 'sunday2';

const naverRouteUrl = `https://map.naver.com/index.nhn?elng=${CHURCH_COORDS.lng}&elat=${CHURCH_COORDS.lat}&etext=${encodeURIComponent('신탄진침례교회')}&menu=route`;
const kakaoRouteUrl = `https://map.kakao.com/link/to/${encodeURIComponent('신탄진침례교회')},${CHURCH_COORDS.lat},${CHURCH_COORDS.lng}`;
const stopKind = { bus: '버스', train: '기차' };

// 공통 Header 높이(4rem). Header는 내릴 때 숨고 올릴 때 나온다
const HEADER_H = 64;

const GuidePage = () => {
    // 고른 것은 URL 쿼리에 둔다 → 새로고침·링크 공유가 그대로 동작
    // 예: /guide?tab=worship&g=next, /guide?tab=shuttle&s=sunday2, /guide?tab=facilities&floor=3F
    // tab은 처음 열 때 내려갈 섹션
    const [searchParams, setSearchParams] = useSearchParams();
    const tabParam = searchParams.get('tab');
    const worshipGroup = worshipGroups.find((g) => g.id === searchParams.get('g')) ?? worshipGroups[0];
    const selectedShuttle = shuttleSchedules.find((s) => s.id === searchParams.get('s'))
        ?? shuttleSchedules.find((s) => s.id === defaultShuttleId)
        ?? shuttleSchedules[0];
    const floorParam = searchParams.get('floor');
    const floor = mapImages[floorParam] ? floorParam : facilityTabs[0].id;

    const reduceMotion = useReducedMotion();
    const [current, setCurrent] = useState(sectionIds.includes(tabParam) ? tabParam : sectionIds[0]);
    const [headerHidden, setHeaderHidden] = useState(false);
    const [tabsStuck, setTabsStuck] = useState(false);
    const [shuttleMapOpen, setShuttleMapOpen] = useState(false);
    const [addressCopied, setAddressCopied] = useState(false);

    const tabsRef = useRef(null);
    const tabListRef = useRef(null);
    const jumpingRef = useRef(false);
    const jumpTimer = useRef(null);
    const copyTimer = useRef(null);

    // 같은 섹션 안에서 고른 것만 바꾸므로 기록은 덮어쓴다 (뒤로가기가 선택을 하나씩 되감지 않게)
    const updateParams = (patch) => {
        const next = new URLSearchParams(searchParams);
        Object.entries(patch).forEach(([key, value]) => {
            if (value == null) next.delete(key);
            else next.set(key, value);
        });
        setSearchParams(next, { replace: true });
    };

    // 이동 버튼 줄은 Header 바로 아래에 붙어 따라오고, Header가 숨으면 맨 위로 올라간다 (Header와 같은 규칙)
    useEffect(() => {
        let lastY = window.scrollY;
        const onScroll = () => {
            const y = window.scrollY;
            if (y <= 0 || y < lastY) setHeaderHidden(false);
            else if (y > 50 && y > lastY) setHeaderHidden(true);
            lastY = y;
            const tabs = tabsRef.current;
            if (tabs) {
                const stickyTop = parseFloat(getComputedStyle(tabs).top) || 0;
                setTabsStuck(tabs.getBoundingClientRect().top <= stickyTop + 1);
            }
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // 지금 보는 섹션 = 화면 위쪽 1/3 선을 지나는 섹션
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (jumpingRef.current) return;
            entries.forEach((entry) => {
                if (entry.isIntersecting) setCurrent(entry.target.id);
            });
        }, { rootMargin: '-35% 0px -60% 0px' });
        sectionIds.forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, []);

    // 좁은 화면: 지금 섹션 버튼이 보이도록 버튼 줄을 옆으로 밀어 준다
    useEffect(() => {
        const list = tabListRef.current;
        const button = list?.querySelector(`[data-section="${current}"]`);
        if (!list || !button || list.scrollWidth <= list.clientWidth) return;
        list.scrollTo({ left: button.offsetLeft - 16, behavior: reduceMotion ? 'auto' : 'smooth' });
    }, [current, reduceMotion]);

    const scrollToSection = useCallback((id, { instant = false } = {}) => {
        const el = document.getElementById(id);
        if (!el) return;
        setCurrent(id);
        jumpingRef.current = true;
        clearTimeout(jumpTimer.current);
        jumpTimer.current = setTimeout(() => { jumpingRef.current = false; }, instant || reduceMotion ? 150 : 1400);

        // 위로 올라가면 Header가 다시 나오므로 그만큼 더 띄운다. 섹션 위 여백은 절반만 남긴다
        const goingUp = el.getBoundingClientRect().top < 0;
        const stickyH = (tabsRef.current?.offsetHeight ?? 64) + (goingUp ? HEADER_H : 0);
        const padTop = el.dataset.band ? 0 : parseFloat(getComputedStyle(el).paddingTop) / 2;
        const offset = padTop - stickyH;
        const immediate = instant || reduceMotion;
        if (window.lenis) {
            window.lenis.scrollTo(el, { offset, immediate });
        } else {
            window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: immediate ? 'auto' : 'smooth' });
        }
    }, [reduceMotion]);

    // 링크로 열면(?tab=…) 그 섹션으로 내려간다. ScrollToTop이 맨 위로 올린 뒤에 실행
    useEffect(() => {
        if (!sectionIds.includes(tabParam)) return undefined;
        const timer = setTimeout(() => scrollToSection(tabParam, { instant: true }), 250);
        return () => clearTimeout(timer);
        // 처음 열 때 한 번만
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleTabClick = (id) => {
        scrollToSection(id);
        updateParams({ tab: id });
    };

    // 지도는 목록 아래에서 열리므로, 펼칠 때 화면을 지도 쪽으로 내려 열린 걸 보여 준다
    const toggleShuttleMap = () => {
        const opening = !shuttleMapOpen;
        setShuttleMapOpen(opening);
        if (!opening) return;
        setTimeout(() => {
            const target = document.getElementById('shuttle-map');
            if (!target) return;
            if (window.lenis) {
                window.lenis.resize?.(); // 펼친 만큼 늘어난 페이지 길이를 Lenis에 반영
                window.lenis.scrollTo(target, { offset: -120, immediate: reduceMotion });
            } else {
                target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
            }
        }, reduceMotion ? 50 : 520); // 펼침(0.5s)이 끝난 뒤
    };

    const copyAddress = async () => {
        try {
            await navigator.clipboard.writeText(CHURCH_ADDRESS);
        } catch {
            // clipboard API가 막힌 환경(오래된 브라우저, http)용
            const field = document.createElement('textarea');
            field.value = CHURCH_ADDRESS;
            field.setAttribute('readonly', '');
            field.style.position = 'fixed';
            field.style.opacity = '0';
            document.body.appendChild(field);
            field.select();
            document.execCommand('copy');
            field.remove();
        }
        setAddressCopied(true);
        clearTimeout(copyTimer.current);
        copyTimer.current = setTimeout(() => setAddressCopied(false), 2000);
    };

    useEffect(() => () => {
        clearTimeout(copyTimer.current);
        clearTimeout(jumpTimer.current);
    }, []);

    const floorButtons = (layoutId) => facilityTabs.map((tab) => (
        <button
            key={tab.id}
            type="button"
            className={`${styles.verticalSelectButton} ${floor === tab.id ? styles.active : ''}`}
            aria-pressed={floor === tab.id}
            onClick={(e) => {
                updateParams({ floor: tab.id });
                if (layoutId.endsWith('Mobile')) {
                    e.currentTarget.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
                }
            }}
        >
            {floor === tab.id && (
                <motion.div
                    layoutId={layoutId}
                    transition={reduceMotion ? { duration: 0 } : { type: "spring", bounce: 0.3, duration: 0.6 }}
                    className={styles.activeBackground}
                />
            )}
            <span className={styles.switchText}>{tab.label}</span>
        </button>
    ));

    const listMotion = {
        initial: reduceMotion ? false : { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: reduceMotion ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -8 },
        transition: { duration: 0.4, ease },
    };

    return (
        <div className={`${styles.page} ${headerHidden ? styles.headerHidden : ''}`}>
            {/* ① 첫 화면 */}
            <section className={styles.hero}>
                <div className={styles.wrap}>
                    <Breadcrumb text="교회소개 - 교회 안내" centered />
                    <h1 className={styles.heroTitle}>환영합니다.<br />어떤 안내가 필요하신가요?</h1>
                </div>
            </section>

            {/* ② 섹션 이동 버튼 줄 */}
            <nav
                ref={tabsRef}
                className={`${styles.tabs} ${tabsStuck ? styles.tabsStuck : ''}`}
                aria-label="교회 안내 바로가기"
            >
                <div ref={tabListRef} className={styles.tabList}>
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            type="button"
                            data-section={section.id}
                            className={styles.tab}
                            aria-current={current === section.id ? 'true' : undefined}
                            onClick={() => handleTabClick(section.id)}
                        >
                            {current === section.id && (
                                <motion.span
                                    layoutId="guideSectionThumb"
                                    className={styles.pillThumb}
                                    transition={reduceMotion ? { duration: 0 } : thumbSpring}
                                />
                            )}
                            <span className={styles.pillText}>{section.label}</span>
                        </button>
                    ))}
                </div>
            </nav>

            {/* ③ 예배시간: 왼쪽 제목 / 오른쪽 표 */}
            <section id="worship" className={`${styles.sec} ${styles.two}`} aria-labelledby="worship-title">
                <div className={`${styles.wrap} ${styles.secGrid}`}>
                    <div className={styles.secHead}>
                        <h2 id="worship-title" className={styles.secTitle}>어느 예배에 오시나요?</h2>
                    </div>
                    <div>
                        <div className={styles.pillGroup} role="group" aria-label="예배 나눠 보기">
                            {worshipGroups.map((group) => (
                                <button
                                    key={group.id}
                                    type="button"
                                    className={styles.pill}
                                    aria-pressed={worshipGroup.id === group.id}
                                    onClick={() => updateParams({ g: group.id })}
                                >
                                    {worshipGroup.id === group.id && (
                                        <motion.span
                                            layoutId="worshipPillThumb"
                                            className={styles.pillThumb}
                                            transition={reduceMotion ? { duration: 0 } : thumbSpring}
                                        />
                                    )}
                                    <span className={styles.pillText}>{group.label}</span>
                                </button>
                            ))}
                        </div>
                        <div aria-live="polite">
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.ul
                                    key={worshipGroup.id}
                                    className={styles.infoList}
                                    aria-label={`${worshipGroup.label} 시간`}
                                    {...listMotion}
                                >
                                    {worshipGroup.items.map((item) => (
                                        <li key={item.id} className={styles.infoItem}>
                                            <span className={styles.infoName}>{item.name}</span>
                                            <span className={styles.infoTime}>{item.time}</span>
                                            <span className={styles.infoMeta}>{item.day} · {item.location}</span>
                                        </li>
                                    ))}
                                </motion.ul>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </section>

            {/* ④ 오시는 길: 넓은 지도 아래 글자 3단 (주소 / 가까운 정류장 / 도움이 필요할 땐) */}
            <section id="directions" className={styles.sec} aria-labelledby="directions-title">
                <div className={styles.wrap}>
                    <div className={styles.secHead}>
                        <h2 id="directions-title" className={styles.secTitle}>반가운 발걸음, 오시는 길</h2>
                    </div>
                    <div className={styles.bigMap}>
                        <InteractiveShuttleMap mode="church" />
                    </div>
                    <div className={styles.summary}>
                        <div>
                            <h3 className={styles.summaryTitle}>주소</h3>
                            <address className={styles.address}>{CHURCH_ADDRESS}<br />신탄진침례교회</address>
                            <div className={styles.links}>
                                <button type="button" className={styles.textLink} onClick={copyAddress}>
                                    <span className={styles.textLinkLabel} aria-live="polite">
                                        {addressCopied ? '복사했어요' : '주소 복사하기'}
                                    </span>
                                    <span className={`material-symbols-outlined ${styles.textLinkIcon}`} aria-hidden="true">
                                        {addressCopied ? 'check' : 'content_copy'}
                                    </span>
                                </button>
                                <a className={styles.textLink} href={naverRouteUrl} target="_blank" rel="noopener noreferrer">
                                    <span className={styles.textLinkLabel}>네이버 지도로 길찾기</span>
                                    <span className={`material-symbols-outlined ${styles.textLinkIcon}`} aria-hidden="true">arrow_outward</span>
                                </a>
                                <a className={styles.textLink} href={kakaoRouteUrl} target="_blank" rel="noopener noreferrer">
                                    <span className={styles.textLinkLabel}>카카오맵으로 길찾기</span>
                                    <span className={`material-symbols-outlined ${styles.textLinkIcon}`} aria-hidden="true">arrow_outward</span>
                                </a>
                            </div>
                        </div>
                        <div>
                            <h3 className={styles.summaryTitle}>가까운 정류장</h3>
                            <ul className={styles.stops}>
                                {TRANSIT_STOPS.map((stop) => (
                                    <li key={stop.name}>
                                        <span>{stop.name}</span>
                                        <span className={styles.stopWalk}>{stop.time}</span>
                                        <span className={styles.stopKind}>{stopKind[stop.type]}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className={styles.summaryTitle}>도움이 필요할 땐</h3>
                            <p className={styles.summaryText}>도움이 필요하시면 언제든 연락해 주세요.</p>
                            <div className={styles.links}>
                                <a className={styles.textLink} href={`tel:${CHURCH_PHONE}`}>
                                    <span className={styles.textLinkLabel}>{CHURCH_PHONE} 전화 걸기</span>
                                    <span className={`material-symbols-outlined ${styles.textLinkIcon}`} aria-hidden="true">call</span>
                                </a>
                                <a
                                    className={styles.textLink}
                                    href="?tab=shuttle"
                                    onClick={(e) => { e.preventDefault(); handleTabClick('shuttle'); }}
                                >
                                    <span className={styles.textLinkLabel}>교회 차 시간 보기</span>
                                    <span className={`material-symbols-outlined ${styles.textLinkIcon}`} aria-hidden="true">chevron_right</span>
                                </a>
                                <a
                                    className={styles.textLink}
                                    href="?tab=parking"
                                    onClick={(e) => { e.preventDefault(); handleTabClick('parking'); }}
                                >
                                    <span className={styles.textLinkLabel}>주차 안내 보기</span>
                                    <span className={`material-symbols-outlined ${styles.textLinkIcon}`} aria-hidden="true">chevron_right</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ⑤ 차량운행: 왼쪽 제목 / 오른쪽 예배 고르기 + 동네별 노선 표 (지도는 필요할 때만 펼침) */}
            <section id="shuttle" className={`${styles.sec} ${styles.two}`} aria-labelledby="shuttle-title">
                <div className={`${styles.wrap} ${styles.secGrid}`}>
                    <div className={styles.secHead}>
                        <h2 id="shuttle-title" className={styles.secTitle}>동네까지 교회 차가<br />모시러 가요</h2>
                        <p className={styles.lead}>예배를 고르시면 동네별 셔틀 시간을 알려 드려요.</p>
                    </div>
                    <div>
                        <div className={styles.pillGroup} role="group" aria-label="예배 고르기">
                            {shuttleSchedules.map((schedule) => (
                                <button
                                    key={schedule.id}
                                    type="button"
                                    className={styles.pill}
                                    aria-pressed={selectedShuttle.id === schedule.id}
                                    onClick={() => updateParams({ s: schedule.id })}
                                >
                                    {selectedShuttle.id === schedule.id && (
                                        <motion.span
                                            layoutId="shuttlePillThumb"
                                            className={styles.pillThumb}
                                            transition={reduceMotion ? { duration: 0 } : thumbSpring}
                                        />
                                    )}
                                    <span className={styles.pillText}>{shuttleLabels[schedule.id] ?? schedule.name}</span>
                                </button>
                            ))}
                        </div>
                        <div aria-live="polite">
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.ul
                                    key={selectedShuttle.id}
                                    className={styles.infoList}
                                    aria-label={`${selectedShuttle.name} 셔틀 노선`}
                                    {...listMotion}
                                >
                                    {selectedShuttle.routes.map((route) => (
                                        <li key={route.id} className={styles.infoItem}>
                                            <span className={styles.infoName}>{route.area}</span>
                                            <span className={styles.infoTime}>{route.time}</span>
                                            <span className={styles.infoMeta}>차량 {route.carNum}</span>
                                        </li>
                                    ))}
                                </motion.ul>
                            </AnimatePresence>
                        </div>
                        <button
                            type="button"
                            className={styles.mapToggle}
                            aria-expanded={shuttleMapOpen}
                            aria-controls="shuttle-map"
                            onClick={toggleShuttleMap}
                        >
                            {shuttleMapOpen ? '지도 접기' : '지도로 보기'}
                            <span className={`material-symbols-outlined ${styles.mapToggleIcon}`} aria-hidden="true">expand_more</span>
                        </button>
                        <div
                            id="shuttle-map"
                            className={`${styles.mapReveal} ${shuttleMapOpen ? styles.mapRevealOpen : ''}`}
                        >
                            <div>
                                {shuttleMapOpen && (
                                    <div className={styles.shuttleMap}>
                                        <InteractiveShuttleMap mode="shuttle" scheduleId={selectedShuttle.id} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ⑥ 주차: 회색 띠 위 가운데 큰 문장 (쉬어 가는 자리) */}
            <section id="parking" data-band="true" className={`${styles.sec} ${styles.band}`} aria-labelledby="parking-title">
                <div className={styles.wrap}>
                    <h2 id="parking-title" className={styles.bandTitle}>교회 주차장은<br />언제나 열려 있어요</h2>
                    <p className={styles.bandText}>주일에는 대죽체육관 주차장도 편하게 이용해 주세요.</p>
                </div>
            </section>

            {/* ⑦ 시설 안내: 층 버튼 + 평면도 (화면 구조는 이전과 같음) */}
            <section id="facilities" className={styles.sec} aria-labelledby="facilities-title">
                <div className={styles.wrap}>
                    <div className={styles.secHead}>
                        <h2 id="facilities-title" className={styles.secTitle}>구석구석 교회탐방</h2>
                    </div>
                    <div className={styles.facilitiesSidebarMobile}>
                        <div className={styles.verticalButtonGroup} role="group" aria-label="층 고르기">
                            {floorButtons('facilityActiveTabMobile')}
                        </div>
                    </div>
                    <div className={styles.facilitiesContainer}>
                        <div className={styles.facilitiesSidebarDesktop}>
                            <div className={styles.verticalButtonGroup} role="group" aria-label="층 고르기">
                                {floorButtons('facilityActiveTabDesktop')}
                            </div>
                        </div>
                        <div className={styles.facilitiesMapArea}>
                            <AnimatePresence mode="wait" initial={false} custom={reduceMotion}>
                                <motion.img
                                    custom={reduceMotion}
                                    key={floor}
                                    src={mapImages[floor]}
                                    alt={facilityAlt(floor)}
                                    variants={fadeVariants}
                                    initial="hidden"
                                    animate="show"
                                    exit="exit"
                                />
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default GuidePage;

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import styles from './GuidePage.module.css';

import { CHURCH_COORDS, shuttleSchedules } from '../data/shuttleData';

import map1F from '../assets/guide/1F.svg';
import map2F from '../assets/guide/2F.svg';
import map3F from '../assets/guide/3F.svg';
import mapSemi3F from '../assets/guide/semi-3F.svg';
import mapDasom1F from '../assets/guide/dasom-1F.svg';
import mapDasom2F from '../assets/guide/dasom-2F.svg';

import Breadcrumb from "../components/ui/Breadcrumb";
import Footer from '../components/Footer';

// rooms는 평면도 이미지의 대체 텍스트로 읽힘 (평면도 글자가 도형이라 화면 낭독기가 못 읽음)
const facilityTabs = [
    { id: '1F', label: '1층', name: '본관 1층', rooms: ['식당', '안쪽식당', '초등부실', '주방', '주방 창고', '화장실'] },
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
// 시설 안내 층 알약이 펼쳐지고 접힐 때: 넘침 없는 스프링 (도중에 다른 층을 눌러도 지금 모양에서 이어 감)
const viewerSpring = { type: 'spring', bounce: 0, duration: 0.45 };

// 바뀌는 부분만 opacity + translateY(8px). custom으로 움직임 줄이기 여부를 받아 그때는 바로 바꾼다
const fadeVariants = {
    hidden: (reduce) => (reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }),
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease } },
    exit: (reduce) => (reduce
        ? { opacity: 0, transition: { duration: 0 } }
        : { opacity: 0, y: -8, transition: { duration: 0.2, ease } }),
};

// 예배시간 목록. 오른쪽에 time을 크게, 아랫줄에 "day, location" (메인 '이번 주 예배'와 같은 쓰기)
// 다음 예배 계산용: days(0=일요일), at(24시간), say(문장에 넣는 이름). skipNext는 '다음 예배'로 고르지 않음 (메인과 같이 새벽 기도회 제외)
const worshipGroups = [
    {
        id: 'adult',
        label: '어른 예배',
        items: [
            { id: 'sun1', name: '주일 1부 예배', day: '일요일', time: '오전 7:00', location: '소예배실', days: [0], at: '07:00' },
            { id: 'sun2', name: '주일 2부 예배', day: '일요일', time: '오전 11:00', location: '대예배실', days: [0], at: '11:00' },
            { id: 'sunpm', name: '주일 오후 예배', day: '일요일', time: '오후 2:00', location: '대예배실', days: [0], at: '14:00' },
            { id: 'dawn', name: '새벽 기도회', day: '월~금', time: '새벽 5:00', location: '소예배실', days: [1, 2, 3, 4, 5], at: '05:00', skipNext: true },
            { id: 'intercession', name: '중보 기도회', day: '화요일', time: '오전 10:30', location: '소예배실', days: [2], at: '10:30' },
            { id: 'wed', name: '수요 예배', day: '수요일', time: '오후 7:00', location: '대예배실', days: [3], at: '19:00' },
            { id: 'fri', name: '금요 기도회', day: '금요일', time: '오후 9:00', location: '소예배실', days: [5], at: '21:00' },
        ],
    },
    {
        id: 'next',
        label: '다음세대',
        items: [
            { id: 'kinder', name: '유치부 (7세 이하)', day: '일요일', time: '오전 9:00', location: '유치부실', days: [0], at: '09:00', say: '유치부 예배' },
            { id: 'kids', name: '초등부 주일예배', day: '일요일', time: '오전 9:00', location: '러브키즈예배실', days: [0], at: '09:00', say: '초등부 예배' },
            { id: 'youth', name: '중고등부 주일예배', day: '일요일', time: '오전 9:00', location: '소예배실', days: [0], at: '09:00', say: '중고등부 예배' },
            { id: 'young', name: '청년부', day: '일요일', time: '오후 1:30', location: '소예배실', days: [0], at: '13:30', say: '청년부 예배' },
            { id: 'tteok', name: '떡볶이 데이', day: '목요일', time: '오후 1~4시', location: '식당', days: [4], at: '13:00', len: 180, event: true },
        ],
    },
];

// 메인 페이지 '이번 주 예배'와 같은 계산: 끝나기 전(기본 75분)까지는 그 예배가 '다음 예배'
const WORSHIP_LEN = 75;
const DAY_NAMES = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

const findNextWorship = (items, now) => {
    let best = null;
    items.forEach((item) => {
        if (item.skipNext) return;
        const [h, m] = item.at.split(':').map(Number);
        for (let k = 0; k < 8; k++) {
            const d = new Date(now);
            d.setDate(d.getDate() + k);
            d.setHours(h, m, 0, 0);
            if (!item.days.includes(d.getDay()) || d.getTime() + (item.len ?? WORSHIP_LEN) * 60000 <= now.getTime()) continue;
            if (!best || d < best.at) best = { at: d, items: [item] };
            else if (d.getTime() === best.at.getTime()) best.items.push(item); // 같은 시각(다음세대 주일 9시)은 함께
            break;
        }
    });
    if (!best) return null;

    const { at, items: hits } = best;
    const h = at.getHours();
    const m = at.getMinutes();
    const part = h < 6 ? '새벽' : h < 12 ? '오전' : h < 18 ? '오후' : h < 21 ? '저녁' : '밤';
    const clock = `${part} ${h > 12 ? h - 12 : h}시${m ? ` ${m}분` : ''}`;
    const dayDiff = Math.round((new Date(at).setHours(0, 0, 0, 0) - new Date(now).setHours(0, 0, 0, 0)) / 86400000);
    const dayWord = dayDiff === 0 ? '오늘' : dayDiff === 1 ? '내일' : DAY_NAMES[at.getDay()];
    // 같은 시각에 여럿(다음세대 주일 9시)이면 제목이 2줄을 넘지 않게 '교회학교 예배'로 묶는다
    const name = hits.length > 1 ? '교회학교 예배' : (hits[0].say ?? hits[0].name);
    const place = hits.length > 1 ? '각 예배실' : hits[0].location;
    // 예배는 '드려요', 떡볶이 데이 같은 모임은 '열려요'
    const isEvent = hits.length === 1 && hits[0].event;
    const doing = isEvent ? '지금 열리고 있어요' : '지금 드리고 있어요';
    const will = isEvent ? '열려요' : '드려요';
    const diff = Math.round((at - now) / 60000);
    const left = diff <= 0 ? `${place}에서 ${doing}`
        : diff < 60 ? `${diff}분 뒤, ${place}에서 ${will}`
        : diff < 1440 ? `${Math.floor(diff / 60)}시간${diff % 60 ? ` ${diff % 60}분` : ''} 뒤, ${place}에서 ${will}`
        : `${dayDiff}일 뒤, ${place}에서 ${will}`;

    return { when: `${dayWord} ${clock},`, name: `${name}가 있어요.`, left, ids: hits.map((it) => it.id) };
};

// 한 페이지에 이어진 섹션. 위 이동 버튼 줄의 순서와 같다
const sections = [
    { id: 'worship', label: '예배시간' },
    { id: 'directions', label: '오시는 길·주차' },
    { id: 'facilities', label: '시설 안내' },
    { id: 'faq', label: '자주 묻는 질문' },
];
const sectionIds = sections.map((s) => s.id);
// 예전 링크(?tab=shuttle, ?tab=parking)는 오시는 길로 보낸다. shuttle은 교회 차 시간표 팝업까지 연다
const tabAlias = { shuttle: 'directions', parking: 'directions' };

// 차량운행 예배 버튼에 쓰는 짧은 이름 (shuttleData의 id 기준)
const shuttleLabels = {
    dawn: '새벽예배',
    sunday2: '주일 2부',
    sundayAfternoon: '주일 오후',
    nextgen: '교회학교',
    wednesday: '수요예배',
};
const defaultShuttleId = 'dawn';

// '09:20~09:40' → '오전 9:20~9:40 사이에 동네를 돌아요' (그 시간 동안 교회 차가 동네를 돈다)
// 오전·오후가 같으면 뒤쪽은 숫자만 쓴다
const toClock = (t) => {
    const [h, m] = t.split(':').map(Number);
    return { part: h < 12 ? '오전' : '오후', clock: `${h > 12 ? h - 12 : h}:${String(m).padStart(2, '0')}` };
};
const formatRange = (time) => {
    const [from, to] = time.split('~').map(toClock);
    const end = from.part === to.part ? to.clock : `${to.part} ${to.clock}`;
    return `${from.part} ${from.clock}~${end} 사이에 동네를 돌아요`;
};

const naverRouteUrl = `https://map.naver.com/index.nhn?elng=${CHURCH_COORDS.lng}&elat=${CHURCH_COORDS.lat}&etext=${encodeURIComponent('신탄진침례교회')}&menu=route`;

// 오시는 길 카드 위 선 아이콘 (선 굵기 1.5, 시설 안내 ⊕와 같은 그리기)
const wayIcons = {
    // 옆에서 본 교회 승합차
    van: (
        <>
            <path d="M4 17H3.5A1.5 1.5 0 0 1 2 15.5V8a2 2 0 0 1 2-2h10.6a2 2 0 0 1 1.6.8l3.4 4.4a2 2 0 0 1 .4 1.2v3.1a1.5 1.5 0 0 1-1.5 1.5H20" />
            <path d="M10 17h4M2 11h17.5M8.5 6v5M14 6v5" />
            <circle cx="7" cy="17" r="2" />
            <circle cx="17" cy="17" r="2" />
        </>
    ),
    // 주차 표지
    parking: (
        <>
            <rect x="3" y="3" width="18" height="18" rx="5" />
            {/* 글자 폭은 9~15.5. 오른쪽 아래가 비는 P 모양이라 상자 가운데(12)보다 살짝 오른쪽에 둔다 */}
            <path d="M9 17V7h3.5a3 3 0 0 1 0 6H9" />
        </>
    ),
    // 앞에서 본 버스
    bus: (
        <>
            <rect x="5" y="3" width="14" height="15" rx="3" />
            <path d="M5 11h14M9.5 6h5M8 18v2.5M16 18v2.5" />
            <circle cx="8.5" cy="14.5" r="0.75" />
            <circle cx="15.5" cy="14.5" r="0.75" />
        </>
    ),
};

const WayIcon = ({ name }) => (
    <svg className={styles.wayIcon} viewBox="0 0 24 24" aria-hidden="true">{wayIcons[name]}</svg>
);

// 메인 페이지 '자주 묻는 것'과 같은 문구 (주차 질문은 위 오시는 길 카드에 있어 뺐다)
const faqs = [
    { q: '아무것도 모르고 가도 되나요?', a: '네, 그대로 오시면 돼요. 성경책이나 찬송가가 없어도 괜찮아요. 예배 순서와 가사는 앞 화면에 나와요.' },
    { q: '등록하라고 하거나 연락처를 묻나요?', a: '원하지 않으시면 등록하지 않으셔도 돼요. 이름이나 연락처를 적지 않아도 예배드릴 수 있어요.' },
    { q: '아이와 함께 가도 되나요?', a: '그럼요. 주일 오전 9시에 유치부·초등부·중고등부 예배가 따로 있어요. 어른 예배에 아이와 함께 앉으셔도 괜찮아요. 예배실 뒤에 자모실이 있어서 아기와 함께 오셔도 편하게 예배드릴 수 있어요.' },
    { q: '헌금을 꼭 해야 하나요?', a: '아니요. 처음 오신 분께 헌금을 바라지 않아요. 편하게 예배만 드리고 가셔도 돼요.' },
];

// 팝업 공통: 뒤 페이지 스크롤을 멈추고, Esc로 닫고, 초점은 팝업 안에서만 돌다가 닫으면 연 버튼으로 돌려준다
const useModal = (open, onClose, panelRef) => {
    const returnFocus = useRef(null);

    useEffect(() => {
        if (!open) return undefined;
        returnFocus.current = document.activeElement;
        window.lenis?.stop();
        const { overflow } = document.documentElement.style;
        document.documentElement.style.overflow = 'hidden';
        panelRef.current?.focus({ preventScroll: true });

        const onKey = (e) => {
            if (e.key === 'Escape') {
                onClose();
                return;
            }
            if (e.key !== 'Tab' || !panelRef.current) return;
            // 팝업 안에서만 초점이 돈다
            const items = panelRef.current.querySelectorAll('button, a[href]');
            if (!items.length) return;
            const first = items[0];
            const last = items[items.length - 1];
            if (e.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('keydown', onKey);
            document.documentElement.style.overflow = overflow;
            window.lenis?.start();
            returnFocus.current?.focus?.({ preventScroll: true });
        };
    }, [open, onClose, panelRef]);
};

// 애플 팝업과 같은 닫기 버튼 그림 (36px 짙은 원 + 흰 X)
const CloseIcon = () => (
    <span className={styles.dialogCloseIcon}>
        <svg viewBox="0 0 36 36" aria-hidden="true">
            <path d="M13 13l10 10M23 13L13 23" />
        </svg>
    </span>
);

// 교회 차 시간표 팝업: 딤드 + 배경 흐림. Esc·바깥 누르기로 닫는다
const ShuttleDialog = ({ open, onClose, selected, onSelect, reduceMotion }) => {
    const panelRef = useRef(null);
    useModal(open, onClose, panelRef);

    const fade = reduceMotion ? { duration: 0 } : { duration: 0.3, ease };
    return createPortal(
        <AnimatePresence>
            {open && (
                <motion.div
                    className={styles.dialogDim}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={fade}
                    data-lenis-prevent
                    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
                >
                    <motion.div
                        ref={panelRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="shuttle-dialog-title"
                        tabIndex={-1}
                        className={styles.dialog}
                        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
                        transition={reduceMotion ? { duration: 0 } : { duration: 0.45, ease }}
                    >
                        <div className={styles.dialogCloseWrap}>
                            <button type="button" className={styles.dialogClose} aria-label="교회 차 시간표 닫기" onClick={onClose}>
                                <CloseIcon />
                            </button>
                        </div>
                        <div className={styles.dialogBody}>
                            <h2 id="shuttle-dialog-title" className={styles.dialogTitle}>교회 차 시간표</h2>
                            <p className={styles.dialogLead}>예배를 고르시면 동네별로 교회 차가 오는 시간을 알려 드려요.</p>
                            <div className={styles.lineTabs} role="group" aria-label="예배 고르기">
                                {shuttleSchedules.map((schedule) => (
                                    <button
                                        key={schedule.id}
                                        type="button"
                                        className={styles.lineTab}
                                        aria-pressed={selected.id === schedule.id}
                                        onClick={() => onSelect(schedule.id)}
                                    >
                                        {shuttleLabels[schedule.id] ?? schedule.name}
                                        {selected.id === schedule.id && (
                                            <motion.span
                                                layoutId="shuttleLine"
                                                className={styles.lineTabBar}
                                                transition={reduceMotion ? { duration: 0 } : thumbSpring}
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                            {/* 모든 예배 목록을 한 칸에 겹쳐 두고 고른 것만 보인다 → 높이가 가장 긴 목록에 고정돼 탭을 바꿔도 팝업이 덜컹이지 않는다 */}
                            <div className={styles.routeStack} aria-live="polite">
                                {shuttleSchedules.map((schedule) => {
                                    const active = selected.id === schedule.id;
                                    return (
                                        <ul
                                            key={schedule.id}
                                            className={`${styles.routeList} ${active ? styles.routeListActive : ''}`}
                                            aria-label={`${schedule.name} 교회 차 시간`}
                                            aria-hidden={!active}
                                        >
                                            {schedule.routes.map((route) => (
                                                <li key={route.id} className={styles.routeItem}>
                                                    <span className={styles.routeArea}>{route.area}</span>
                                                    <span className={styles.routeMeta}>{formatRange(route.time)}</span>
                                                    <span className={styles.routeMeta}>차 번호 {route.carNum}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body,
    );
};

// 평면도 키우고 옮기기: 두 손가락 벌리기 · 한 손가락 끌기(키운 뒤) · 두 번 누르기 · 마우스 휠 · +/− 버튼
const ZOOM_MAX = 4;
const ZOOM_STEP = 1.6;

const useZoomPan = (portRef, contentRef, active) => {
    const view = useRef({ s: 1, x: 0, y: 0 });

    // 평면도가 칸 밖으로 나가지 않게 막고 그린다. anim은 버튼·두 번 누르기처럼 한 번에 바뀔 때만
    const draw = useCallback((anim) => {
        const port = portRef.current;
        const content = contentRef.current;
        if (!port || !content) return;
        const v = view.current;
        const w = port.clientWidth;
        const h = port.clientHeight;
        v.s = Math.min(ZOOM_MAX, Math.max(1, v.s));
        v.x = Math.min(0, Math.max(w - w * v.s, v.x));
        v.y = Math.min(0, Math.max(h - h * v.s, v.y));
        content.dataset.anim = anim ? 'true' : 'false';
        content.style.transform = `translate(${v.x}px, ${v.y}px) scale(${v.s})`;
    }, [portRef, contentRef]);

    const zoomAt = useCallback((next, cx, cy, anim) => {
        const v = view.current;
        const s = Math.min(ZOOM_MAX, Math.max(1, next));
        v.x = cx - (cx - v.x) * (s / v.s);
        v.y = cy - (cy - v.y) * (s / v.s);
        v.s = s;
        draw(anim);
    }, [draw]);

    const zoomCenter = useCallback((factor) => {
        const port = portRef.current;
        if (!port) return;
        zoomAt(view.current.s * factor, port.clientWidth / 2, port.clientHeight / 2, true);
    }, [portRef, zoomAt]);

    const reset = useCallback((anim = false) => {
        view.current = { s: 1, x: 0, y: 0 };
        draw(anim);
    }, [draw]);

    useEffect(() => {
        const port = portRef.current;
        if (!active || !port) return undefined;
        const points = new Map();
        let last = null;
        let moved = 0;
        let lastTap = 0;

        const local = (e) => {
            const r = port.getBoundingClientRect();
            return { x: e.clientX - r.left, y: e.clientY - r.top };
        };
        const gesture = () => {
            const [a, b] = [...points.values()];
            return b
                ? { mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, dist: Math.hypot(a.x - b.x, a.y - b.y) }
                : { mid: a, dist: 0 };
        };

        const onDown = (e) => {
            if (e.target.closest('button')) return;
            port.setPointerCapture(e.pointerId);
            points.set(e.pointerId, local(e));
            last = gesture();
            moved = 0;
        };
        const onMove = (e) => {
            if (!points.has(e.pointerId)) return;
            points.set(e.pointerId, local(e));
            const g = gesture();
            const v = view.current;
            if (points.size === 2 && last.dist) {
                v.x += g.mid.x - last.mid.x;
                v.y += g.mid.y - last.mid.y;
                zoomAt(v.s * (g.dist / last.dist), g.mid.x, g.mid.y);
            } else if (points.size === 1 && v.s > 1) {
                v.x += g.mid.x - last.mid.x;
                v.y += g.mid.y - last.mid.y;
                draw();
            }
            moved += Math.abs(g.mid.x - last.mid.x) + Math.abs(g.mid.y - last.mid.y);
            last = g;
        };
        const onUp = (e) => {
            const p = points.get(e.pointerId);
            points.delete(e.pointerId);
            if (points.size) {
                last = gesture();
                return;
            }
            // 거의 안 움직인 두 번 누르기: 그 자리를 2.5배로, 키운 상태면 처음 크기로
            if (p && moved < 6) {
                const now = Date.now();
                if (now - lastTap < 300) {
                    zoomAt(view.current.s > 1.2 ? 1 : 2.5, p.x, p.y, true);
                    lastTap = 0;
                } else {
                    lastTap = now;
                }
            }
        };
        const onWheel = (e) => {
            e.preventDefault();
            const p = local(e);
            zoomAt(view.current.s * Math.exp(-e.deltaY * 0.002), p.x, p.y);
        };
        const onResize = () => draw();

        port.addEventListener('pointerdown', onDown);
        port.addEventListener('pointermove', onMove);
        port.addEventListener('pointerup', onUp);
        port.addEventListener('pointercancel', onUp);
        port.addEventListener('wheel', onWheel, { passive: false });
        window.addEventListener('resize', onResize);
        return () => {
            port.removeEventListener('pointerdown', onDown);
            port.removeEventListener('pointermove', onMove);
            port.removeEventListener('pointerup', onUp);
            port.removeEventListener('pointercancel', onUp);
            port.removeEventListener('wheel', onWheel);
            window.removeEventListener('resize', onResize);
        };
    }, [active, portRef, draw, zoomAt]);

    return { zoomIn: () => zoomCenter(ZOOM_STEP), zoomOut: () => zoomCenter(1 / ZOOM_STEP), reset };
};

// 평면도 크게 보기: 사진 앱처럼 흰 화면 전체. 아래 층 버튼으로 바로 다른 층으로 넘어간다
const FloorPlanViewer = ({ open, onClose, floor, onPick, reduceMotion }) => {
    const panelRef = useRef(null);
    const portRef = useRef(null);
    const contentRef = useRef(null);
    const chipsRef = useRef(null);
    useModal(open, onClose, panelRef);
    const { zoomIn, zoomOut, reset } = useZoomPan(portRef, contentRef, open);
    const tab = facilityTabs.find((t) => t.id === floor) ?? facilityTabs[0];

    // 층이 바뀌면 처음 크기로, 고른 층 버튼이 보이게 옆으로 민다
    useEffect(() => {
        if (!open) return;
        reset();
        const chip = chipsRef.current?.querySelector('[aria-pressed="true"]');
        chip?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'auto' });
    }, [open, floor, reset]);

    return createPortal(
        <AnimatePresence>
            {open && (
                <motion.div
                    ref={panelRef}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="plan-view-title"
                    tabIndex={-1}
                    data-lenis-prevent
                    className={styles.planView}
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={reduceMotion ? { duration: 0 } : { duration: 0.35, ease }}
                >
                    <div className={styles.planHead}>
                        <h2 id="plan-view-title" className={styles.planTitle}>{tab.name}</h2>
                        <button type="button" className={styles.planClose} aria-label="평면도 닫기" onClick={onClose}>
                            <CloseIcon />
                        </button>
                    </div>
                    <div ref={portRef} className={styles.planPort}>
                        <div ref={contentRef} className={styles.planContent}>
                            <img src={mapImages[floor]} alt={facilityAlt(floor)} draggable="false" />
                        </div>
                        <div className={styles.planZoomBtns}>
                            <button type="button" className={styles.planZoomBtn} aria-label="크게 보기" onClick={zoomIn}>
                                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6v12M6 12h12" /></svg>
                            </button>
                            <button type="button" className={styles.planZoomBtn} aria-label="작게 보기" onClick={zoomOut}>
                                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12" /></svg>
                            </button>
                        </div>
                    </div>
                    <div className={styles.planFoot}>
                        <div ref={chipsRef} className={styles.planChips} role="group" aria-label="층 고르기">
                            {facilityTabs.map((t) => (
                                <button
                                    key={t.id}
                                    type="button"
                                    className={styles.planChip}
                                    aria-pressed={t.id === floor}
                                    onClick={() => onPick(t.id)}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                        <p className={styles.planHint}>
                            <span className={styles.planHintTouch}>두 손가락으로 벌리거나 두 번 눌러 크게 보세요</span>
                            <span className={styles.planHintMouse}>마우스 휠을 굴리거나 두 번 눌러 크게 보세요</span>
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body,
    );
};

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
    // 지금 시각. 메인 페이지처럼 ?now=2026-10-25T10:00 으로 시각을 바꿔 확인할 수 있다
    const [now] = useState(() => {
        const q = new URLSearchParams(window.location.search).get('now');
        const d = q ? new Date(q) : new Date();
        return Number.isNaN(d.getTime()) ? new Date() : d;
    });
    const nextWorship = useMemo(() => findNextWorship(worshipGroup.items, now), [worshipGroup, now]);
    const startSection = tabAlias[tabParam] ?? (sectionIds.includes(tabParam) ? tabParam : null);
    const [current, setCurrent] = useState(startSection ?? sectionIds[0]);
    const [headerHidden, setHeaderHidden] = useState(false);
    const [tabsStuck, setTabsStuck] = useState(false);
    const [shuttleOpen, setShuttleOpen] = useState(tabParam === 'shuttle');
    const closeShuttle = useCallback(() => setShuttleOpen(false), []);
    const [planOpen, setPlanOpen] = useState(false);
    const closePlan = useCallback(() => setPlanOpen(false), []);

    const tabsRef = useRef(null);
    // 층 알약을 누르면 그 버튼이 펼친 칸으로 바뀌므로, 키보드 위치를 펼친 칸으로 옮긴다
    const floorPanelRef = useRef(null);
    const floorPicked = useRef(false);
    const tabListRef = useRef(null);
    const jumpingRef = useRef(false);
    const jumpTimer = useRef(null);

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
        const padTop = parseFloat(getComputedStyle(el).paddingTop) / 2;
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
        if (!startSection) return undefined;
        const timer = setTimeout(() => scrollToSection(startSection, { instant: true }), 250);
        return () => clearTimeout(timer);
        // 처음 열 때 한 번만
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleTabClick = (id) => {
        scrollToSection(id);
        updateParams({ tab: id });
    };

    useEffect(() => () => clearTimeout(jumpTimer.current), []);

    const pickFloor = (id) => {
        floorPicked.current = true;
        updateParams({ floor: id });
    };

    useEffect(() => {
        if (!floorPicked.current) return;
        floorPicked.current = false;
        floorPanelRef.current?.focus({ preventScroll: true });
    }, [floor]);

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
                    <h1 className={styles.heroTitle}>환영해요.<br />안내를 골라 보세요.</h1>
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

            {/* ③ 예배시간: 왼쪽 다음 예배 + 어른/다음세대 고르기 / 오른쪽 표 */}
            <section id="worship" className={`${styles.sec} ${styles.two}`} aria-labelledby="worship-title">
                <div className={`${styles.wrap} ${styles.secGrid}`}>
                    {/* 메인 '이번 주 예배'처럼 왼쪽에 다음 예배를 큰 문장으로 */}
                    <div className={styles.secHead}>
                        <div aria-live="polite">
                            <h2 id="worship-title" className={`${styles.secTitle} ${styles.nextTitle}`}>
                                {nextWorship ? (
                                    <>
                                        <span>{nextWorship.when}</span>
                                        <span>{nextWorship.name}</span>
                                    </>
                                ) : '편한 시간에 함께 예배드려요.'}
                            </h2>
                            {nextWorship && <p className={styles.nextLeft}>{nextWorship.left}</p>}
                        </div>
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
                    </div>
                    <div>
                        <div aria-live="polite">
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.ul
                                    key={worshipGroup.id}
                                    className={styles.infoList}
                                    aria-label={`${worshipGroup.label} 시간`}
                                    {...listMotion}
                                >
                                    {worshipGroup.items.map((item) => (
                                        <li
                                            key={item.id}
                                            className={`${styles.infoItem} ${nextWorship?.ids.includes(item.id) ? styles.isNext : ''}`}
                                        >
                                            <span className={styles.infoName}>{item.name}</span>
                                            <span className={styles.infoTime}>{item.time}</span>
                                            <span className={styles.infoMeta}>{item.day}, {item.location}</span>
                                        </li>
                                    ))}
                                </motion.ul>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </section>

            {/* ④ 오시는 길·주차: 회색 띠 위 흰 카드 3개 (교회 차 / 주차 / 대중교통) */}
            <section id="directions" className={`${styles.sec} ${styles.band} ${styles.bandTop}`} aria-labelledby="directions-title">
                <div className={styles.wrap}>
                    <div className={styles.secHead}>
                        <h2 id="directions-title" className={styles.secTitle}>어떻게 갈지<br />걱정하지 마세요.</h2>
                    </div>
                    <div className={styles.wayCards}>
                        <div className={styles.wayCard}>
                            <WayIcon name="van" />
                            <h3 className={styles.wayTitle}>동네까지<br />모시러 가요.</h3>
                            <p className={styles.wayText}>지금은 중리동·송강동·갈마동과 교회 주변을 돌아요. 타시는 분에 따라 도는 길이 바뀌기도 하고, 예배마다 시간이 달라요.</p>
                            <button type="button" className={styles.wayLink} aria-haspopup="dialog" onClick={() => setShuttleOpen(true)}>
                                교회 차 시간표 보기
                            </button>
                        </div>
                        {/* '주차장 보기' 팝업은 주차장 사진이 준비되면 붙인다 */}
                        <div className={styles.wayCard}>
                            <WayIcon name="parking" />
                            <h3 className={styles.wayTitle}>주차도<br />걱정 없어요.</h3>
                            <p className={styles.wayText}>교회 오른쪽 주차장은 언제든 쓰실 수 있어요. 주일에는 대죽체육관 주차장도 편하게 쓰세요.</p>
                        </div>
                        <div className={styles.wayCard}>
                            <WayIcon name="bus" />
                            <h3 className={styles.wayTitle}>버스나 기차로도<br />오기 편해요.</h3>
                            <p className={styles.wayText}>계신 곳에서 가장 편한 길은 네이버 지도 길찾기로 바로 알아보실 수 있어요.</p>
                            <a className={styles.wayLink} href={naverRouteUrl} target="_blank" rel="noopener noreferrer">
                                네이버 길찾기
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ⑤ 시설 안내: 회색 띠 위 큰 흰 카드. 애플 product viewer처럼 왼쪽 층 알약(고른 층은 그 자리에서 펼쳐짐) / 오른쪽 평면도 */}
            <section id="facilities" className={`${styles.sec} ${styles.band} ${styles.bandBottom}`} aria-labelledby="facilities-title">
                <div className={styles.wrap}>
                    <div className={styles.secHead}>
                        <h2 id="facilities-title" className={styles.secTitle}>교회를 둘러보세요.</h2>
                    </div>
                    <div className={styles.viewer}>
                        <ul className={styles.viewerControls} aria-label="층 고르기">
                            {facilityTabs.map((tab, index) => {
                                const open = floor === tab.id;
                                const prev = facilityTabs[index - 1];
                                const next = facilityTabs[index + 1];
                                return (
                                    <motion.li
                                        key={tab.id}
                                        layout={!reduceMotion}
                                        transition={viewerSpring}
                                        className={`${styles.viewerItem} ${open ? styles.viewerItemOpen : ''}`}
                                    >
                                        {open ? (
                                            <motion.div
                                                ref={floorPanelRef}
                                                tabIndex={-1}
                                                layout={!reduceMotion ? 'position' : false}
                                                className={styles.viewerPanel}
                                                aria-live="polite"
                                            >
                                                <p className={styles.viewerText}>
                                                    <strong>{tab.name}.</strong> {tab.rooms.join(' · ')}
                                                </p>
                                                <div className={styles.viewerNav}>
                                                    <button
                                                        type="button"
                                                        className={styles.viewerNavBtn}
                                                        aria-label={prev ? `이전 층: ${prev.label}` : '이전 층 없음'}
                                                        disabled={!prev}
                                                        onClick={() => prev && pickFloor(prev.id)}
                                                    >
                                                        <span className="material-symbols-outlined" aria-hidden="true">chevron_left</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={styles.viewerNavBtn}
                                                        aria-label={next ? `다음 층: ${next.label}` : '다음 층 없음'}
                                                        disabled={!next}
                                                        onClick={() => next && pickFloor(next.id)}
                                                    >
                                                        <span className="material-symbols-outlined" aria-hidden="true">chevron_right</span>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <motion.button
                                                layout={!reduceMotion ? 'position' : false}
                                                type="button"
                                                className={styles.viewerOpen}
                                                aria-controls="facility-plan"
                                                onClick={() => pickFloor(tab.id)}
                                            >
                                                <svg className={styles.viewerPlus} viewBox="0 0 24 24" aria-hidden="true">
                                                    <circle cx="12" cy="12" r="11.25" />
                                                    <path d="M12 7.5v9M7.5 12h9" />
                                                </svg>
                                                {tab.label}
                                            </motion.button>
                                        )}
                                    </motion.li>
                                );
                            })}
                        </ul>
                        {/* 평면도를 누르면 전체 화면으로 크게 본다 */}
                        <button
                            type="button"
                            id="facility-plan"
                            className={styles.viewerStage}
                            aria-haspopup="dialog"
                            aria-label={`${facilityTabs.find((t) => t.id === floor)?.name} 평면도 크게 보기`}
                            onClick={() => setPlanOpen(true)}
                        >
                            <span className={styles.stageImg}>
                                <AnimatePresence mode="wait" initial={false} custom={reduceMotion}>
                                    <motion.img
                                        custom={reduceMotion}
                                        key={floor}
                                        src={mapImages[floor]}
                                        alt=""
                                        variants={fadeVariants}
                                        initial="hidden"
                                        animate="show"
                                        exit="exit"
                                    />
                                </AnimatePresence>
                            </span>
                            <span className={styles.stageHint} aria-hidden="true">
                                <svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5 20 20M10.5 8v5M8 10.5h5" /></svg>
                                크게 보기
                            </span>
                        </button>
                    </div>
                </div>
            </section>

            {/* ⑥ 자주 하는 질문: 메인 페이지 '자주 묻는 것'과 같은 모양 */}
            <section id="faq" className={styles.sec} aria-labelledby="faq-title">
                <div className={styles.wrap}>
                    <div className={styles.secHead}>
                        <h2 id="faq-title" className={styles.secTitle}>처음 오시는 분들이<br />자주 묻는 것들이에요.</h2>
                    </div>
                    <div className={styles.fqList}>
                        {faqs.map((item) => (
                            <details key={item.q} className={styles.fqItem}>
                                <summary>
                                    {item.q}
                                    <svg className={styles.fqIcon} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M6 9l6 6 6-6" />
                                    </svg>
                                </summary>
                                <p>{item.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            <ShuttleDialog
                open={shuttleOpen}
                onClose={closeShuttle}
                selected={selectedShuttle}
                onSelect={(id) => updateParams({ s: id })}
                reduceMotion={reduceMotion}
            />

            <FloorPlanViewer
                open={planOpen}
                onClose={closePlan}
                floor={floor}
                onPick={(id) => updateParams({ floor: id })}
                reduceMotion={reduceMotion}
            />

            <Footer />
        </div>
    );
};

export default GuidePage;

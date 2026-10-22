import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { db } from '../firebase';
import styles from './EventsPage.module.css';
import PageTopGradient from '../components/PageTopGradient';
import Footer from '../components/Footer';

// 고르기 창: 감쇠 1.0 스프링(튕김 없음). 눌러서 다시 닫아도 지금 위치에서 이어서 움직인다
const pickerSpring = { type: 'spring', bounce: 0, duration: 0.3 };
const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const pad2 = (n) => String(n).padStart(2, '0');

// 여러 날 일정은 시작일–끝날, 하루 일정은 그날 (두 자리)
const dayLabel = (event) => {
    if (event.startDate && event.endDate) {
        const start = parseInt(event.startDate.split('-')[2], 10);
        const end = parseInt(event.endDate.split('-')[2], 10);
        if (start && end) return start === end ? pad2(start) : `${pad2(start)}–${pad2(end)}`;
    }
    const d = parseInt(event.date, 10);
    return Number.isNaN(d) ? (event.date || '') : pad2(d);
};

const ChevronDown = () => (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
        <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ChevronSide = ({ dir }) => (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path d={dir === 'left' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const EventsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const reduceMotion = useReducedMotion();
    const today = new Date();
    const [scheduleMap, setScheduleMap] = useState({});
    const [availableYears, setAvailableYears] = useState([today.getFullYear()]);
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
    // 고르기 창 안에서 넘겨 보는 해 (달을 눌러야 실제로 바뀐다)
    const [pickerYear, setPickerYear] = useState(today.getFullYear());
    const [loading, setLoading] = useState(true);
    const [pickerOpen, setPickerOpen] = useState(false);
    const pickerRef = useRef(null);
    const triggerRef = useRef(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchSchedules();
    }, []);

    // 바깥을 누르거나 Esc를 누르면 고르기 창을 닫는다
    useEffect(() => {
        if (!pickerOpen) return undefined;
        const onPointer = (e) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target)) setPickerOpen(false);
        };
        const onKey = (e) => {
            if (e.key === 'Escape') {
                setPickerOpen(false);
                triggerRef.current?.focus();
            }
        };
        document.addEventListener('mousedown', onPointer);
        document.addEventListener('touchstart', onPointer);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onPointer);
            document.removeEventListener('touchstart', onPointer);
            document.removeEventListener('keydown', onKey);
        };
    }, [pickerOpen]);

    const fetchSchedules = async () => {
        try {
            const q = query(collection(db, 'schedules'), orderBy('createdAt', 'asc'));
            const querySnapshot = await getDocs(q);

            const map = {};
            const yearsSet = new Set([today.getFullYear()]);

            querySnapshot.forEach((doc) => {
                const item = { id: doc.id, ...doc.data() };
                let y = today.getFullYear();
                let m = today.getMonth() + 1;
                const match = item.month?.match(/(\d+)년\s*(\d+)월/);
                if (match) {
                    y = parseInt(match[1], 10);
                    m = parseInt(match[2], 10);
                }
                yearsSet.add(y);
                const key = `${y}-${m}`;
                if (!map[key]) map[key] = [];
                map[key].push(item);
            });

            Object.values(map).forEach((list) => {
                list.sort((a, b) => parseInt(a.date, 10) - parseInt(b.date, 10));
            });

            setScheduleMap(map);
            setAvailableYears(Array.from(yearsSet).sort((a, b) => a - b));
        } catch (error) {
            console.error('일정 가져오기 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    const togglePicker = () => {
        if (!pickerOpen) setPickerYear(selectedYear);
        setPickerOpen((open) => !open);
    };

    const pickMonth = (m) => {
        setSelectedYear(pickerYear);
        setSelectedMonth(m);
        setPickerOpen(false);
        triggerRef.current?.focus();
    };

    const handleEventClick = (event) => {
        const displayDate = `${event.month} ${event.date}일 (${event.day?.[0] ?? ''})`;
        const eventDateStr = `📅 날짜: ${displayDate}`;
        const timeStr = event.time ? `🕒 시간: ${event.time}` : '';
        const locStr = event.location ? `🚩 장소: ${event.location}` : '';
        const contentStr = event.content ? `\n\n${event.content}` : '';

        const contentBody = [eventDateStr, timeStr, locStr, contentStr].filter(Boolean).join('\n\n');

        navigate(`/post/schedules_${event.id}`, {
            state: {
                ...event,
                id: event.id,
                category: 'schedule',
                date: displayDate,
                content: contentBody,
                background: location,
            },
        });
    };

    const currentKey = `${selectedYear}-${selectedMonth}`;
    const currentEvents = scheduleMap[currentKey] || [];
    const yearIdx = availableYears.indexOf(pickerYear);
    const isFirstYear = yearIdx <= 0;
    const isLastYear = yearIdx === availableYears.length - 1;

    return (
        <div className={styles.page}>
            <PageTopGradient />
            <section className={styles.hero}>
                <div className={styles.wrap}>
                    <div className={styles.pickerAnchor} ref={pickerRef}>
                        <h1 className={styles.title}>
                            <button
                                ref={triggerRef}
                                type="button"
                                className={styles.titleButton}
                                aria-haspopup="dialog"
                                aria-expanded={pickerOpen}
                                aria-label={`${selectedYear}년 ${selectedMonth}월 일정, 다른 달 고르기`}
                                onClick={togglePicker}
                            >
                                <span>{String(selectedYear).slice(2)}년 {selectedMonth}월</span>
                                <span className={`${styles.titleChevron} ${pickerOpen ? styles.titleChevronOpen : ''}`}>
                                    <ChevronDown />
                                </span>
                            </button>
                        </h1>

                        <AnimatePresence>
                            {pickerOpen && (
                                <motion.div
                                    role="dialog"
                                    aria-label="연월 고르기"
                                    className={styles.picker}
                                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.98 }}
                                    transition={reduceMotion ? { duration: 0.15 } : pickerSpring}
                                >
                                    <div className={styles.pickerYearRow}>
                                        <button
                                            type="button"
                                            className={styles.pickerYearBtn}
                                            aria-label="이전 해"
                                            disabled={isFirstYear}
                                            onClick={() => setPickerYear(availableYears[yearIdx - 1])}
                                        >
                                            <ChevronSide dir="left" />
                                        </button>
                                        <span className={styles.pickerYear} aria-live="polite">{pickerYear}년</span>
                                        <button
                                            type="button"
                                            className={styles.pickerYearBtn}
                                            aria-label="다음 해"
                                            disabled={isLastYear}
                                            onClick={() => setPickerYear(availableYears[yearIdx + 1])}
                                        >
                                            <ChevronSide dir="right" />
                                        </button>
                                    </div>
                                    <div className={styles.monthGrid}>
                                        {months.map((m) => {
                                            const active = pickerYear === selectedYear && m === selectedMonth;
                                            const hasEvents = scheduleMap[`${pickerYear}-${m}`]?.length > 0;
                                            return (
                                                <button
                                                    key={m}
                                                    type="button"
                                                    className={styles.monthBtn}
                                                    aria-pressed={active}
                                                    aria-label={`${m}월${hasEvents ? ', 일정 있음' : ''}`}
                                                    onClick={() => pickMonth(m)}
                                                >
                                                    {m}월
                                                    {hasEvents && <span className={styles.monthDot} aria-hidden="true" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </section>

            <section className={styles.listSection}>
                <div className={styles.wrap}>
                    {loading ? (
                        <p className={styles.empty}>일정을 불러오고 있어요.</p>
                    ) : (
                        <ul key={currentKey} className={styles.eventList} aria-live="polite" aria-label={`${selectedYear}년 ${selectedMonth}월 일정`}>
                            {currentEvents.length === 0 ? (
                                <li className={styles.empty}>이 달에는 등록된 일정이 없어요.</li>
                            ) : (
                                currentEvents.map((event, idx) => {
                                    const day = dayLabel(event);
                                    return (
                                    <li key={event.id || `${currentKey}-${idx}`} className={`${styles.eventItem} ${day.length > 2 ? styles.eventItemRange : ''}`}>
                                        <span className={styles.eventDay}>{day}</span>
                                        <div className={styles.eventBody}>
                                            <h2 className={styles.eventTitle}>{event.title}</h2>
                                            {(event.time || event.location) && (
                                                <div className={styles.eventMetas}>
                                                    {event.time && <span className={styles.eventMeta}>{event.time}</span>}
                                                    {event.location && <span className={styles.eventMeta}>{event.location}</span>}
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                className={styles.detailLink}
                                                aria-label={`${event.title} 세부정보`}
                                                onClick={() => handleEventClick(event)}
                                            >
                                                세부정보
                                            </button>
                                        </div>
                                    </li>
                                    );
                                })
                            )}
                        </ul>
                    )}
                </div>
            </section>
            <Footer />
        </div>
    );
};

export default EventsPage;

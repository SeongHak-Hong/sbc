import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { db } from '../firebase';
import styles from './EventsPage.module.css';
import Footer from '../components/Footer';
import SubPageSection from '../components/SubPageSection';
import ScrollFadeText from '../components/ScrollFadeText';
import visionIcon from '../assets/vision/shintanjin-baptist-church-vision-icon.webp';
import iconChevronLeft from '../assets/nextgen/chevron_left_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg';
import iconChevronRight from '../assets/nextgen/chevron_right_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg';

const EventsPage = () => {
    const navigate = useNavigate();
    const [scheduleMap, setScheduleMap] = useState({});
    const [availableYears, setAvailableYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [loading, setLoading] = useState(true);
    const [showMonthGrid, setShowMonthGrid] = useState(false);
    const monthGridRef = useRef(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchSchedules();
    }, []);

    // Close month grid when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (showMonthGrid && monthGridRef.current && !monthGridRef.current.contains(e.target)) {
                setShowMonthGrid(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showMonthGrid]);

    const fetchSchedules = async () => {
        try {
            const q = query(collection(db, 'schedules'), orderBy('createdAt', 'asc'));
            const querySnapshot = await getDocs(q);
            
            const rawData = [];
            querySnapshot.forEach(doc => {
                rawData.push({ id: doc.id, ...doc.data() });
            });

            const today = new Date();
            const map = {};
            const yearsSet = new Set();

            rawData.forEach(item => {
                let y = today.getFullYear();
                let m = today.getMonth() + 1;
                const match = item.month?.match(/(\d+)년\s*(\d+)월/);
                if (match) {
                    y = parseInt(match[1], 10);
                    m = parseInt(match[2], 10);
                }
                
                yearsSet.add(y);
                const key = `${y}-${m}`;
                if (!map[key]) {
                    map[key] = [];
                }
                map[key].push(item);
            });

            // Sort events within each month
            Object.keys(map).forEach(key => {
                map[key].sort((a, b) => parseInt(a.date, 10) - parseInt(b.date, 10));
                map[key].forEach((ev, idx) => {
                    ev.delay = `${0.1 * (idx + 1)}s`;
                });
            });

            // Ensure current year is always available
            yearsSet.add(today.getFullYear());
            const years = Array.from(yearsSet).sort((a, b) => a - b);

            setScheduleMap(map);
            setAvailableYears(years);
            setSelectedYear(today.getFullYear());
            setSelectedMonth(today.getMonth() + 1);
        } catch (error) {
            console.error("일정 가져오기 실패:", error);
        } finally {
            setLoading(false);
        }
    };

    const goToPrevMonth = () => {
        if (selectedMonth === 1) {
            const idx = availableYears.indexOf(selectedYear);
            if (idx > 0) {
                setSelectedYear(availableYears[idx - 1]);
                setSelectedMonth(12);
            }
        } else {
            setSelectedMonth(selectedMonth - 1);
        }
    };

    const goToNextMonth = () => {
        if (selectedMonth === 12) {
            const idx = availableYears.indexOf(selectedYear);
            if (idx < availableYears.length - 1) {
                setSelectedYear(availableYears[idx + 1]);
                setSelectedMonth(1);
            }
        } else {
            setSelectedMonth(selectedMonth + 1);
        }
    };

    const handlePrevYear = () => {
        const idx = availableYears.indexOf(selectedYear);
        if (idx > 0) {
            setSelectedYear(availableYears[idx - 1]);
        }
    };

    const handleNextYear = () => {
        const idx = availableYears.indexOf(selectedYear);
        if (idx < availableYears.length - 1) {
            setSelectedYear(availableYears[idx + 1]);
        }
    };

    const handleEventClick = (event) => {
        const displayDate = `${event.month} ${event.date}일 (${event.day[0]})`;
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
                content: contentBody
            }
        });
    };

    const isPrevDisabled = selectedMonth === 1 && availableYears.indexOf(selectedYear) === 0;
    const isNextDisabled = selectedMonth === 12 && availableYears.indexOf(selectedYear) === availableYears.length - 1;

    if (loading) {
        return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>일정을 불러오는 중입니다...</div>;
    }

    if (availableYears.length === 0) {
        return (
            <div className={styles.pageWrapper}>
                <SubPageSection hideHeader={true}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            fontSize: '16px',
                            fontWeight: 500,
                            color: 'var(--color-text-placeholder)',
                            marginBottom: '16px',
                            fontFamily: "'YK Green Forest', var(--font-yuhan), sans-serif",
                        }}>
                            나눔터 - 교회일정
                        </div>
                        <ScrollFadeText
                            text={"은혜의 시간"}
                            as="h1"
                            style={{
                                fontFamily: 'var(--font-yuhan)',
                                fontWeight: 500,
                                fontSize: '40px',
                                letterSpacing: '0.02em',
                                color: 'var(--color-text-primary)',
                                margin: 0,
                                whiteSpace: 'pre-line',
                                wordBreak: 'keep-all',
                                textAlign: 'center'
                            }}
                            once={true}
                        />
                    </div>
                    <div className={styles.contentWrapper} style={{ textAlign: 'center', padding: '100px 0', color: '#6B7280' }}>
                        등록된 일정이 없어요.
                    </div>
                </SubPageSection>
                <Footer />
            </div>
        );
    }

    const currentKey = `${selectedYear}-${selectedMonth}`;
    const currentEvents = scheduleMap[currentKey] || [];
    const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    // Check which months have events for the selected year (for dot indicator in grid)
    const monthsWithEvents = new Set();
    months.forEach(m => {
        if (scheduleMap[`${selectedYear}-${m}`]?.length > 0) {
            monthsWithEvents.add(m);
        }
    });

    const isFirstYear = availableYears.indexOf(selectedYear) === 0;
    const isLastYear = availableYears.indexOf(selectedYear) === availableYears.length - 1;

    return (
        <div className={styles.pageWrapper}>
            <SubPageSection hideHeader={true}>
                <div style={{ textAlign: 'center' }}>
                    <div className={styles.breadcrumb}>
                        나눔터 - 교회일정
                    </div>
                    <ScrollFadeText
                        text={"은혜의 시간"}
                        as="h1"
                        className={styles.pageTitle}
                        once={true}
                    />
                </div>
                {/* Month Navigation Bar */}
                    <div className={styles.monthNav}>
                        <button 
                            className={styles.navButton} 
                            onClick={goToPrevMonth}
                            disabled={isPrevDisabled}
                            style={{ opacity: isPrevDisabled ? 0.2 : 1 }}
                        >
                            <img src={iconChevronLeft} alt="이전 달" />
                        </button>

                        <div className={styles.monthNavCenter} ref={monthGridRef}>
                            <span className={styles.yearPart}>{selectedYear}년</span>
                            <span 
                                className={styles.monthPart}
                                onClick={() => setShowMonthGrid(!showMonthGrid)}
                            >
                                {selectedMonth}월
                                <span className={`material-symbols-outlined ${styles.dropIcon} ${showMonthGrid ? styles.dropIconOpen : ''}`} translate="no">expand_more</span>
                            </span>

                            {/* Month Grid Popover */}
                            {showMonthGrid && (
                                <div className={styles.monthGridPopover}>
                                    {/* Year row inside popover */}
                                    <div className={styles.popoverYearRow}>
                                        <button 
                                            className={styles.popoverYearBtn}
                                            onClick={handlePrevYear}
                                            disabled={isFirstYear}
                                            style={{ opacity: isFirstYear ? 0.2 : 1 }}
                                        >
                                            <span className="material-symbols-outlined" translate="no">chevron_left</span>
                                        </button>
                                        <span className={styles.popoverYearText}>{selectedYear}년</span>
                                        <button 
                                            className={styles.popoverYearBtn}
                                            onClick={handleNextYear}
                                            disabled={isLastYear}
                                            style={{ opacity: isLastYear ? 0.2 : 1 }}
                                        >
                                            <span className="material-symbols-outlined" translate="no">chevron_right</span>
                                        </button>
                                    </div>

                                    {/* 3×4 Month Grid */}
                                    <div className={styles.monthGrid}>
                                        {months.map(m => {
                                            const isActive = m === selectedMonth;
                                            const hasEvents = monthsWithEvents.has(m);
                                            return (
                                                <button
                                                    key={m}
                                                    className={`${styles.monthGridItem} ${isActive ? styles.monthGridItemActive : ''}`}
                                                    onClick={() => { setSelectedMonth(m); setShowMonthGrid(false); }}
                                                >
                                                    {m}월
                                                    {hasEvents && !isActive && <span className={styles.eventDot} />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button 
                            className={styles.navButton} 
                            onClick={goToNextMonth}
                            disabled={isNextDisabled}
                            style={{ opacity: isNextDisabled ? 0.2 : 1 }}
                        >
                            <img src={iconChevronRight} alt="다음 달" />
                        </button>
                    </div>

                    {/* Event List */}
                    <div className={styles.eventsGrid} key={currentKey}>
                        {currentEvents.length === 0 ? (
                            <div className={styles.eventCard} style={{ cursor: 'default' }}>
                                <div className={styles.eventInfoLeft}>
                                    <div className={styles.calendarIcon}>
                                        <div className={styles.calendarMonth}>&nbsp;</div>
                                        <div className={styles.calendarDate}>&nbsp;</div>
                                    </div>
                                    <div className={styles.eventDetailsContainer}>
                                        <h3 className={styles.eventTitle}>등록된 일정이 없어요.</h3>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            currentEvents.map((event, eventIdx) => {
                                const calMonth = `${selectedMonth}월`;
                                let calDays = event.date || '';
                                
                                if (event.startDate && event.endDate) {
                                    const startDay = parseInt(event.startDate.split('-')[2], 10);
                                    const endDay = parseInt(event.endDate.split('-')[2], 10);
                                    if (startDay && endDay) {
                                        calDays = startDay === endDay ? `${startDay}` : `${startDay}-${endDay}`;
                                    }
                                }
                                
                                const timeStr = event.time || '';
                                const locStr = event.location || '';
                                const hasMeta = timeStr || locStr;

                                return (
                                    <motion.div 
                                        key={event.id || `${currentKey}-${eventIdx}`} 
                                        className={styles.eventCard}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        whileHover={{ y: -2, transition: { delay: 0, duration: 0.2 } }}
                                        viewport={{ once: true }}
                                        transition={{ delay: eventIdx * 0.1 }}
                                        onClick={() => handleEventClick(event)}
                                    >
                                        <div className={styles.eventInfoLeft}>
                                            <div className={styles.calendarIcon}>
                                                <div className={styles.calendarMonth}>{calMonth}</div>
                                                <div className={styles.calendarDate}>{calDays}</div>
                                            </div>
                                            <div className={styles.eventDetailsContainer}>
                                                <h3 className={styles.eventTitle}>{event.title}</h3>
                                                {hasMeta && (
                                                    <div className={styles.eventMetaRow}>
                                                        {timeStr && <span>{timeStr}</span>}
                                                        {timeStr && locStr && <span>·</span>}
                                                        {locStr && <span>{locStr}</span>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
            </SubPageSection>
            <Footer />
        </div>
    );
};

export default EventsPage;

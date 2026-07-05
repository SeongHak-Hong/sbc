import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import styles from './EventsPage.module.css';
import Footer from '../components/Footer';
import SubPageSection from '../components/SubPageSection';
import visionIcon from '../assets/vision/shintanjin-baptist-church-vision-icon.webp';

const EventsPage = () => {
    const navigate = useNavigate();
    const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
    const [groupedSchedules, setGroupedSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showMonthPicker, setShowMonthPicker] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        try {
            // Fetch schedules ordered by creation or date. 
            // In a real app, you might parse the 'month' and 'date' to properly sort chronologically.
            // For now, let's fetch all and group them in JS.
            const q = query(collection(db, 'schedules'), orderBy('createdAt', 'asc'));
            const querySnapshot = await getDocs(q);
            
            const rawData = [];
            querySnapshot.forEach(doc => {
                rawData.push({ id: doc.id, ...doc.data() });
            });

            // Find min/max range and group by normalized month
            const groupsMap = {};
            const today = new Date();
            let minYear = today.getFullYear();
            let minMonth = today.getMonth() + 1;
            let maxYear = today.getFullYear();
            let maxMonth = today.getMonth() + 1;

            rawData.forEach(item => {
                let y = today.getFullYear();
                let m = today.getMonth() + 1;
                const match = item.month?.match(/(\d+)년\s*(\d+)월/);
                if (match) {
                    y = parseInt(match[1], 10);
                    m = parseInt(match[2], 10);
                }
                
                if (y < minYear || (y === minYear && m < minMonth)) {
                    minYear = y;
                    minMonth = m;
                }
                if (y > maxYear || (y === maxYear && m > maxMonth)) {
                    maxYear = y;
                    maxMonth = m;
                }

                const normalizedMonth = `${y}년 ${m}월`;
                if (!groupsMap[normalizedMonth]) {
                    groupsMap[normalizedMonth] = {
                        month: normalizedMonth,
                        events: []
                    };
                }
                groupsMap[normalizedMonth].events.push(item);
            });

            // Fill in missing months in the range so navigation is continuous
            let currY = minYear;
            let currM = minMonth;
            while (currY < maxYear || (currY === maxYear && currM <= maxMonth)) {
                const mStr = `${currY}년 ${currM}월`;
                if (!groupsMap[mStr]) {
                    groupsMap[mStr] = {
                        month: mStr,
                        events: []
                    };
                }
                currM++;
                if (currM > 12) {
                    currM = 1;
                    currY++;
                }
            }

            // Convert to array
            const groupsArray = Object.values(groupsMap);
            
            // Sort events inside each month by date (numerically if possible)
            groupsArray.forEach(group => {
                group.events.sort((a, b) => parseInt(a.date, 10) - parseInt(b.date, 10));
                // assign delays for animation
                group.events.forEach((ev, idx) => {
                    ev.delay = `${0.1 * (idx + 1)}s`;
                });
            });

            // Sort the array by parsing the year/month chronologically
            groupsArray.sort((a, b) => {
                const parseMonth = (str) => {
                    const match = str.match(/(\d+)년\s*(\d+)월/);
                    if (match) return parseInt(match[1], 10) * 100 + parseInt(match[2], 10);
                    return 0;
                };
                return parseMonth(a.month) - parseMonth(b.month);
            });

            setGroupedSchedules(groupsArray);

            // Find current month index
            const currentMonthString = `${today.getFullYear()}년 ${today.getMonth() + 1}월`;
            const targetIndex = groupsArray.findIndex(g => g.month === currentMonthString);
            
            setCurrentMonthIndex(targetIndex !== -1 ? targetIndex : 0);
        } catch (error) {
            console.error("일정 가져오기 실패:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrevMonth = () => {
        if (currentMonthIndex > 0) {
            setCurrentMonthIndex(currentMonthIndex - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonthIndex < groupedSchedules.length - 1) {
            setCurrentMonthIndex(currentMonthIndex + 1);
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

    if (loading) {
        return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>일정을 불러오는 중입니다...</div>;
    }

    if (groupedSchedules.length === 0) {
        return (
            <div className={styles.pageWrapper}>
                <SubPageSection title="교회 일정">
                    <div className={styles.contentWrapper} style={{ textAlign: 'center', padding: '100px 0', color: '#6B7280' }}>
                        등록된 일정이 없어요.
                    </div>
                </SubPageSection>
                <Footer />
            </div>
        );
    }

    const currentSection = groupedSchedules[currentMonthIndex];

    return (
        <div className={styles.pageWrapper}>
            <SubPageSection title="교회 일정" engTitle="Events" icon={visionIcon}>
                <div className={styles.contentWrapper}>
                    <div className={styles.monthNav}>
                        <button 
                            className={styles.navButton} 
                            onClick={handlePrevMonth}
                            disabled={currentMonthIndex === 0}
                            style={{ opacity: currentMonthIndex === 0 ? 0.2 : 1 }}
                        >
                            <span className="material-symbols-outlined" translate="no">chevron_left</span>
                        </button>
                        <div style={{ position: 'relative' }}>
                            <span 
                                className={styles.monthText} 
                                onClick={() => setShowMonthPicker(!showMonthPicker)}
                                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                                {currentSection?.month}
                                <span className="material-symbols-outlined" style={{ fontSize: '24px' }} translate="no">arrow_drop_down</span>
                            </span>
                            
                            {showMonthPicker && (
                                <>
                                    <div 
                                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9 }} 
                                        onClick={() => setShowMonthPicker(false)}
                                    />
                                    <div style={{
                                        position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                                        background: 'white', border: '1px solid #E5E7EB', borderRadius: '8px',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', zIndex: 10,
                                        maxHeight: '250px', overflowY: 'auto', width: '140px', marginTop: '8px'
                                    }}>
                                        {groupedSchedules.map((g, idx) => (
                                            <div 
                                                key={g.month}
                                                onClick={() => { setCurrentMonthIndex(idx); setShowMonthPicker(false); }}
                                                style={{
                                                    padding: '12px 16px', textAlign: 'center', cursor: 'pointer',
                                                    background: idx === currentMonthIndex ? '#F3F4F6' : 'transparent',
                                                    
                                                    color: idx === currentMonthIndex ? '#111827' : '#4B5563',
                                                    fontSize: '15px', borderBottom: idx === groupedSchedules.length - 1 ? 'none' : '1px solid #F3F4F6'
                                                }}
                                            >
                                                {g.month}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                        <button 
                            className={styles.navButton} 
                            onClick={handleNextMonth}
                            disabled={currentMonthIndex === groupedSchedules.length - 1}
                            style={{ opacity: currentMonthIndex === groupedSchedules.length - 1 ? 0.2 : 1 }}
                        >
                            <span className="material-symbols-outlined" translate="no">chevron_right</span>
                        </button>
                    </div>

                    <div className={styles.agendaContainer}>
                        <div className={styles.eventStack} key={currentMonthIndex}>
                            {(!currentSection?.events || currentSection.events.length === 0) ? (
                                <div style={{ textAlign: 'center', padding: '80px 0', color: '#6B7280', fontSize: '16px' }}>
                                    등록된 일정이 없어요.
                                </div>
                            ) : (
                                currentSection.events.map((event, eventIdx) => (
                                    <div 
                                        key={event.id || `${currentMonthIndex}-${eventIdx}`} 
                                        className={`${styles.eventCard} ${styles.animateSlideUp}`}
                                        style={{ animationDelay: event.delay, cursor: 'pointer' }}
                                        onClick={() => handleEventClick(event)}
                                    >
                                        <div className={styles.timeBlock}>
                                            <span className={styles.dateDay}>{event.date}</span>
                                            <span className={styles.dateDayOfWeek}>{event.day}</span>
                                        </div>
                                        <div className={styles.eventDetails}>
                                            <div className={styles.eventTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {event.title}
                                                    {event.endDate && (() => {
                                                        const startStr = (event.startDate || '').substring(5).replace('-', '.');
                                                        const endStr = event.endDate.substring(5).replace('-', '.');
                                                        return startStr ? (
                                                            <span style={{ color: 'rgba(var(--color-text-dark-rgb), 0.7)', marginLeft: '6px', fontWeight: 'normal' }}>
                                                                ({startStr}~{endStr})
                                                            </span>
                                                        ) : null;
                                                    })()}
                                                </span>
                                                {(event.imageUrl || (event.imageUrls && event.imageUrls.length > 0) || (event.images && event.images.length > 0)) && (
                                                    <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#9CA3AF', flexShrink: 0 }} translate="no">image</span>
                                                )}
                                            </div>
                                            <div className={styles.eventMeta}>
                                                {event.meta}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </SubPageSection>
            <Footer />
        </div>
    );
};

export default EventsPage;

import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import styles from './SchedulePage.module.css';
import Footer from '../components/Footer';
import SubPageSection from '../components/SubPageSection';

const SchedulePage = () => {
    const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
    const [groupedSchedules, setGroupedSchedules] = useState([]);
    const [loading, setLoading] = useState(true);

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

            // Group by month
            const groupsMap = {};
            rawData.forEach(item => {
                if (!groupsMap[item.month]) {
                    groupsMap[item.month] = {
                        month: item.month,
                        events: []
                    };
                }
                // Determine a slight delay based on index later
                groupsMap[item.month].events.push(item);
            });

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

            // Note: Since 'month' is a string like "2026년 5월", we could sort the array by parsing the year/month.
            // For simple grouping, we just rely on order or do a basic string compare.
            groupsArray.sort((a, b) => a.month.localeCompare(b.month));

            setGroupedSchedules(groupsArray);
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

    if (loading) {
        return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>일정을 불러오는 중입니다...</div>;
    }

    if (groupedSchedules.length === 0) {
        return (
            <div className={styles.pageWrapper}>
                <SubPageSection title="교회 일정">
                    <div className={styles.contentWrapper} style={{ textAlign: 'center', padding: '100px 0', color: '#6B7280' }}>
                        등록된 일정이 없습니다.
                    </div>
                </SubPageSection>
                <Footer />
            </div>
        );
    }

    const currentSection = groupedSchedules[currentMonthIndex];

    return (
        <div className={styles.pageWrapper}>
            <SubPageSection title="교회 일정">
                <div className={styles.contentWrapper}>
                    <div className={styles.monthNav}>
                        <button 
                            className={styles.navButton} 
                            onClick={handlePrevMonth}
                            style={{ opacity: currentMonthIndex === 0 ? 0.3 : 1, cursor: currentMonthIndex === 0 ? 'default' : 'pointer' }}
                        >
                            <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                        <span className={styles.monthText}>{currentSection?.month}</span>
                        <button 
                            className={styles.navButton} 
                            onClick={handleNextMonth}
                            style={{ opacity: currentMonthIndex === groupedSchedules.length - 1 ? 0.3 : 1, cursor: currentMonthIndex === groupedSchedules.length - 1 ? 'default' : 'pointer' }}
                        >
                            <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                    </div>

                    <div className={styles.agendaContainer}>
                        <div className={styles.eventStack} key={currentMonthIndex}>
                            {currentSection?.events.map((event, eventIdx) => (
                                <div 
                                    key={event.id || `${currentMonthIndex}-${eventIdx}`} 
                                    className={`${styles.eventCard} ${styles.animateSlideUp}`}
                                    style={{ animationDelay: event.delay }}
                                >
                                    <div className={styles.timeBlock}>
                                        <span className={styles.dateDay}>{event.date}</span>
                                        <span className={styles.dateDayOfWeek}>{event.day}</span>
                                    </div>
                                    <div className={styles.eventDetails}>
                                        <div className={styles.eventTitle}>{event.title}</div>
                                        <div className={styles.eventMeta}>
                                            {event.meta}
                                        </div>
                                    </div>
                                    {event.color && (
                                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: event.color, marginLeft: 'auto', alignSelf: 'center', flexShrink: 0 }}></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </SubPageSection>
            <Footer />
        </div>
    );
};

export default SchedulePage;

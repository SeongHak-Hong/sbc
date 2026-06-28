import React, { useEffect, useState } from 'react';
import styles from './SchedulePage.module.css';
import Footer from '../components/Footer';
import SubPageSection from '../components/SubPageSection';

const scheduleData = [
    {
        month: '2026년 5월',
        events: [
            {
                date: '05',
                day: '일요일',
                title: '어린이 주일 예배 및 행사',
                meta: '오전 11:00 · 본당 및 교육관',
                delay: '0.1s',
                color: '#0c89eb'
            },
            {
                date: '19',
                day: '일요일',
                title: '청년부 헌신예배',
                meta: '오후 02:00 · 본당',
                delay: '0.2s',
                color: '#70A4FF'
            }
        ]
    },
    {
        month: '2026년 6월',
        events: [
            {
                date: '15',
                day: '토요일',
                title: '전교인 한마음 체육대회',
                meta: '오전 10:00 · 신탄진체육관',
                delay: '0.1s',
                color: '#0c89eb'
            },
            {
                date: '21',
                day: '금요일',
                title: '교회학교 여름성경학교',
                meta: '오후 02:00 · 대예배실 및 각 부서실',
                delay: '0.2s',
                color: '#70A4FF'
            },
            {
                date: '28',
                day: '금요일',
                title: '상반기 결산 구역장 회의',
                meta: '오후 07:00 · 소예배실',
                delay: '0.3s',
                color: '#A1C4FD'
            }
        ]
    },
    {
        month: '2026년 7월',
        events: [
            {
                date: '12',
                day: '금요일',
                title: '중고등부 여름수련회',
                meta: '오후 03:00 · 외부 수양관',
                delay: '0.1s',
                color: '#0c89eb'
            },
            {
                date: '28',
                day: '일요일',
                title: '하반기 제직회',
                meta: '오후 04:00 · 본당',
                delay: '0.2s',
                color: '#70A4FF'
            }
        ]
    }
];

const SchedulePage = () => {
    const [currentMonthIndex, setCurrentMonthIndex] = useState(1); // default to 6월 (index 1)

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handlePrevMonth = () => {
        if (currentMonthIndex > 0) {
            setCurrentMonthIndex(currentMonthIndex - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonthIndex < scheduleData.length - 1) {
            setCurrentMonthIndex(currentMonthIndex + 1);
        }
    };

    const currentSection = scheduleData[currentMonthIndex];

    return (
        <div className={styles.pageWrapper}>

            <SubPageSection title="교회 일정" className={`container ${styles.container}`}>
                <div className={styles.monthNav}>
                    <button 
                        className={styles.navButton} 
                        onClick={handlePrevMonth}
                        style={{ opacity: currentMonthIndex === 0 ? 0.3 : 1, cursor: currentMonthIndex === 0 ? 'default' : 'pointer' }}
                    >
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <span className={styles.monthText}>{currentSection.month}</span>
                    <button 
                        className={styles.navButton} 
                        onClick={handleNextMonth}
                        style={{ opacity: currentMonthIndex === scheduleData.length - 1 ? 0.3 : 1, cursor: currentMonthIndex === scheduleData.length - 1 ? 'default' : 'pointer' }}
                    >
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>

                <div className={styles.agendaContainer}>
                    <div className={styles.eventStack} key={currentMonthIndex}>
                        {currentSection.events.map((event, eventIdx) => (
                            <div 
                                key={`${currentMonthIndex}-${eventIdx}`} 
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
                                        <span 
                                            className={styles.statusDotSmall}
                                            style={{ background: event.color }}
                                        ></span>
                                        {event.meta}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </SubPageSection>

            <Footer />
        </div>
    );
};

export default SchedulePage;

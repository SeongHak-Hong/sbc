import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import Footer from '../components/Footer';
import SubPageSection from '../components/SubPageSection';
import ScrollFadeText from '../components/ScrollFadeText';
import visionIcon from '../assets/vision/shintanjin-baptist-church-vision-icon.webp';
import TabMenu from '../components/TabMenu';
import styles from './NextGenPage.module.css';
import thumbKindergarten from '../assets/nextgen/shintanjin-baptist-church-nextgen-thumb.webp';
import thumbElementary from '../assets/nextgen/shintanjin-baptist-church-nextgen-thumb-01.webp';
import thumbYouth from '../assets/nextgen/shintanjin-baptist-church-nextgen-thumb-02.webp';
import thumbYoungAdults from '../assets/nextgen/shintanjin-baptist-church-nextgen-thumb-03.webp';
import iconChevronLeft from '../assets/nextgen/chevron_left_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg';
import iconChevronRight from '../assets/nextgen/chevron_right_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg';

const defaultThumbs = {
    kindergarten: thumbKindergarten,
    elementary: thumbElementary,
    youth: thumbYouth,
    youngadults: thumbYoungAdults
};

const getBadgeStyle = (status) => {
    switch(status) {
        case '모집중':
        case '접수중':
        case '진행중':
            return { bg: '#DBEAFE', color: '#1E3A8A' }; // Light Blue
        case '마감임박':
            return { bg: '#FEF3C7', color: '#92400E' }; // Light Amber
        case '마감':
        case '모집완료':
            return { bg: '#F3F4F6', color: '#374151' }; // Light Gray
        case '오픈예정':
        case '예정':
            return { bg: '#EDE9FE', color: '#5B21B6' }; // Light Purple
        default:
            return { bg: '#F3F4F6', color: '#374151' };
    }
};

const NextGenPage = () => {
    const [departmentsData, setDepartmentsData] = useState(null);
    const [activeTab, setActiveTab] = useState('');
    const [activeSwitch, setActiveSwitch] = useState('churchSchool');
    const [loading, setLoading] = useState(true);
    const [hoveredEventImg, setHoveredEventImg] = useState(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const navigate = useNavigate();

    const handleMouseMove = (e) => {
        setMousePos({ x: e.clientX, y: e.clientY });
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'nextgen'));
            const data = {};
            querySnapshot.forEach((doc) => {
                data[doc.id] = doc.data();
            });
            setDepartmentsData(data);
            if (data['kindergarten']) setActiveTab('kindergarten');
            else if (Object.keys(data).length > 0) setActiveTab(Object.keys(data)[0]);
        } catch (error) {
            console.error("다음세대 데이터 불러오기 오류:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>로딩 중...</div>;
    }

    const extractImageFromContent = (content) => {
        if (!content) return null;
        const markdownRegex = /!\[.*?\]\((.*?)\)/;
        const markdownMatch = content.match(markdownRegex);
        if (markdownMatch && markdownMatch[1]) {
            return markdownMatch[1];
        }
        const htmlRegex = /<img[^>]+src="([^">]+)"/;
        const htmlMatch = content.match(htmlRegex);
        if (htmlMatch && htmlMatch[1]) {
            return htmlMatch[1];
        }
        return null;
    };

    if (!departmentsData || Object.keys(departmentsData).length === 0) {
        return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>데이터가 없습니다.</div>;
    }

    // 정렬 (유치부, 초등부, 중고등부, 청년부 순서 유도)
    const tabs = Object.values(departmentsData)
        .filter(dept => dept.id !== 'tteokbokki')
        .sort((a, b) => {
            const order = { 'kindergarten': 1, 'elementary': 2, 'youth': 3, 'youngadults': 4 };
            return (order[a.id] || 99) - (order[b.id] || 99);
        });

    const activeData = activeSwitch === 'churchSchool' 
        ? (departmentsData[activeTab] || tabs[0]) 
        : (departmentsData['tteokbokki'] || { 
            name: '떡볶이데이', 
            schedule: '오후 1:00', 
            location: '매주 목요일 4시까지, 식당', 
            events: [] 
        });

    // Aggregate events
    const allEvents = [];
    const todayStr = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0];

    Object.keys(departmentsData).forEach(deptKey => {
        const dept = departmentsData[deptKey];
        if (dept.events && Array.isArray(dept.events)) {
            dept.events.forEach((ev, idx) => {
                const eventDate = ev.endDate || ev.date || ev.startDate || '';
                if (!eventDate || eventDate >= todayStr) {
                    allEvents.push({
                        ...ev,
                        originalIndex: idx,
                        departmentKey: deptKey,
                        departmentName: dept.name || ''
                    });
                }
            });
        }
    });

    // Sort events by date (ascending - upcoming events first)
    allEvents.sort((a, b) => {
        const dateA = a.startDate || a.date || '';
        const dateB = b.startDate || b.date || '';
        if (dateA < dateB) return -1;
        if (dateA > dateB) return 1;
        return 0;
    });

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
                        다음세대
                    </div>
                    <ScrollFadeText
                        text={"하나님의 사랑을 알고,\n올바른 성경의 가치관을 가져요."}
                        as="h1"
                        className={styles.headerMainTitle}
                        once={true}
                    />
                </div>
                <div className={styles.contentWrapper}>
                    {/* Clock UI Section */}
                    <div className={styles.clockSection}>
                        <div className={styles.clockContainer}>
                            
                            {/* Switch Buttons */}
                            <div className={styles.switchContainer}>
                                <button
                                    className={`${styles.switchButton} ${activeSwitch === 'churchSchool' ? styles.active : ''}`}
                                    onClick={() => setActiveSwitch('churchSchool')}
                                >
                                    교회학교
                                </button>
                                <button
                                    className={`${styles.switchButton} ${activeSwitch === 'tteokbokki' ? styles.active : ''}`}
                                    onClick={() => setActiveSwitch('tteokbokki')}
                                >
                                    떡볶이데이
                                </button>
                            </div>

                            {/* Left Navigation Button */}
                            {activeSwitch === 'churchSchool' && (
                                <button 
                                    className={`${styles.navButton} ${styles.navButtonLeft}`}
                                    onClick={() => {
                                        const currentIndex = tabs.findIndex(t => t.id === activeTab);
                                        const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
                                        setActiveTab(tabs[prevIndex].id);
                                    }}
                                >
                                    <img src={iconChevronLeft} alt="이전 부서" />
                                </button>
                            )}

                            {/* Worship Info */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeSwitch === 'churchSchool' ? activeTab : 'tteokbokki'}
                                    className={styles.worshipInfo}
                                    initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                                    exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className={styles.worshipCategory}>
                                        {activeData.name} {activeSwitch === 'churchSchool' ? '예배' : ''}
                                    </div>
                                    <div className={styles.timeContainer}>
                                        {(() => {
                                            let amPm = '';
                                            let time = activeData.schedule || '';
                                            time = time.replace(/주일/g, '').trim();
                                            if (time.includes('오전')) {
                                                amPm = 'AM';
                                                time = time.replace('오전', '').trim();
                                            } else if (time.includes('오후')) {
                                                amPm = 'PM';
                                                time = time.replace('오후', '').trim();
                                            }
                                            
                                            // 1:30 -> 01:30, 9:00 -> 09:00
                                            if (/^\d:\d\d$/.test(time)) {
                                                time = '0' + time;
                                            }
                                            return (
                                                <>
                                                    <span className={styles.timeText}>{time}</span>
                                                    {amPm && <span className={styles.amPmText}>{amPm}</span>}
                                                </>
                                            );
                                        })()}
                                    </div>
                                    <div className={styles.locationText}>
                                        {activeData.location ? (activeSwitch === 'churchSchool' ? `매주 일요일, ${activeData.location}` : activeData.location) : ''}
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {/* Right Navigation Button */}
                            {activeSwitch === 'churchSchool' && (
                                <button 
                                    className={`${styles.navButton} ${styles.navButtonRight}`}
                                    onClick={() => {
                                        const currentIndex = tabs.findIndex(t => t.id === activeTab);
                                        const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
                                        setActiveTab(tabs[nextIndex].id);
                                    }}
                                >
                                    <img src={iconChevronRight} alt="다음 부서" />
                                </button>
                            )}

                            {/* Pagination Dots */}
                            {activeSwitch === 'churchSchool' && (
                                <div className={styles.paginationContainer}>
                                    {tabs.map((tab, idx) => (
                                        <button
                                            key={idx}
                                            className={`${styles.dot} ${activeTab === tab.id ? styles.active : ''}`}
                                            onClick={() => setActiveTab(tab.id)}
                                            aria-label={`${tab.name} 탭으로 이동`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <section className={styles.eventsSection}>
                        <div className={styles.eventsHeader}>
                            <h2 className={styles.eventsTitle}>진행 중인 행사</h2>
                        </div>
                        {allEvents.length > 0 ? (
                            <div className={styles.eventsGrid}>
                                {allEvents.map((ev, idx) => {
                                    let displayDate = ev.date;

                                    const formatDate = (dateStr) => {
                                        if (!dateStr) return '';
                                        const [y, m, d] = dateStr.split('-');
                                        return `${y.substring(2)}.${m}.${d}`;
                                    };

                                    let calMonth = '';
                                    let calDays = '';

                                    if (ev.startDate || ev.endDate) {
                                        const startStr = formatDate(ev.startDate);
                                        const endStr = formatDate(ev.endDate);
                                        if (startStr && endStr) displayDate = `${startStr} - ${endStr}`;
                                        else if (startStr) displayDate = startStr;
                                        else if (endStr) displayDate = endStr;

                                        const start = ev.startDate ? ev.startDate.split('-') : null;
                                        const end = ev.endDate ? ev.endDate.split('-') : null;

                                        if (start && end) {
                                            calMonth = `${parseInt(start[1])}월`;
                                            if (start[1] === end[1]) {
                                                calDays = `${parseInt(start[2])}-${parseInt(end[2])}`;
                                            } else {
                                                calDays = `${parseInt(start[2])}-`;
                                            }
                                        } else if (start) {
                                            calMonth = `${parseInt(start[1])}월`;
                                            calDays = `${parseInt(start[2])}`;
                                        } else if (end) {
                                            calMonth = `${parseInt(end[1])}월`;
                                            calDays = `${parseInt(end[2])}`;
                                        }
                                    } else if (ev.date) {
                                        const parts = ev.date.split('-');
                                        if (parts.length >= 3) {
                                            calMonth = `${parseInt(parts[1])}월`;
                                            calDays = `${parseInt(parts[2])}`;
                                        } else {
                                            calMonth = ev.date;
                                        }
                                    }

                                    let formattedContent = '';
                                    if (ev.time) formattedContent += `🕒 시간: ${ev.time}  \n`;
                                    if (ev.location) formattedContent += `🚩 장소: ${ev.location}  \n`;
                                    if (formattedContent) formattedContent += `\n`;
                                    formattedContent += ev.desc || '';
                                    
                                    const extractedImg = extractImageFromContent(ev.desc);
                                    const finalImg = ev.img || extractedImg || defaultThumbs[ev.departmentKey] || thumbKindergarten;
                                    const finalImageUrls = (ev.imageUrls && ev.imageUrls.length > 0) ? ev.imageUrls : (extractedImg ? [extractedImg] : [defaultThumbs[ev.departmentKey] || thumbKindergarten]);

                                    return (
                                        <motion.div
                                            key={idx}
                                            className={styles.eventCard}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: idx * 0.1 }}
                                            onMouseEnter={() => setHoveredEventImg(finalImg)}
                                            onMouseLeave={() => setHoveredEventImg(null)}
                                            onMouseMove={handleMouseMove}
                                            onClick={() => navigate(`/post/nextgen-${ev.departmentKey}-${ev.originalIndex}`, { 
                                                state: { 
                                                    title: ev.title, 
                                                    author: ev.departmentName, 
                                                    date: displayDate, 
                                                    content: formattedContent, 
                                                    imageUrl: finalImg,
                                                    imageUrls: finalImageUrls
                                                } 
                                            })}
                                        >
                                            <div className={styles.eventInfoLeft}>
                                                <div className={styles.calendarIcon}>
                                                    <div className={styles.calendarMonth}>{calMonth}</div>
                                                    <div className={styles.calendarDate}>{calDays}</div>
                                                </div>
                                                <h3 className={styles.eventTitle}>{ev.title}</h3>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className={styles.eventsGrid}>
                                <div className={styles.eventCard} style={{ cursor: 'default' }}>
                                    <div className={styles.eventInfoLeft}>
                                        <div className={styles.calendarIcon}>
                                            <div className={styles.calendarMonth}>&nbsp;</div>
                                            <div className={styles.calendarDate}>&nbsp;</div>
                                        </div>
                                        <h3 className={styles.eventTitle}>진행 중인 행사가 없어요.</h3>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
            </SubPageSection>
            <Footer />

            <AnimatePresence>
                {hoveredEventImg && (
                    <motion.div
                        className={styles.floatingThumbnailContainer}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            left: mousePos.x + 20,
                            top: mousePos.y + 20
                        }}
                    >
                        <img src={hoveredEventImg} alt="Preview" className={styles.floatingThumbnail} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NextGenPage;

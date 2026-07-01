import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import Footer from '../components/Footer';
import SubPageSection from '../components/SubPageSection';
import TabMenu from '../components/TabMenu';
import styles from './NextGenPage.module.css';
import thumbKindergarten from '../assets/nextgen/shintanjin-baptist-church-nextgen-thumb.webp';
import thumbElementary from '../assets/nextgen/shintanjin-baptist-church-nextgen-thumb-01.webp';
import thumbYouth from '../assets/nextgen/shintanjin-baptist-church-nextgen-thumb-02.webp';
import thumbYoungAdults from '../assets/nextgen/shintanjin-baptist-church-nextgen-thumb-03.webp';

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
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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

    if (!departmentsData || Object.keys(departmentsData).length === 0) {
        return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>데이터가 없습니다.</div>;
    }

    const activeData = departmentsData[activeTab];
    // 정렬 (유치부, 초등부, 중고등부, 청년부 순서 유도)
    const tabs = Object.values(departmentsData).sort((a, b) => {
        const order = { 'kindergarten': 1, 'elementary': 2, 'youth': 3, 'youngadults': 4 };
        return (order[a.id] || 99) - (order[b.id] || 99);
    });

    return (
        <div className={styles.pageWrapper}>
            <SubPageSection 
                title="다음세대" 
                subtitle={<p className={styles.headerSubtitle}>신탄진침례교회의 내일을 열어가는 주인공들입니다.</p>}
            >
                <div className={styles.contentWrapper}>
                    <TabMenu 
                        tabs={tabs}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        getTabId={(tab) => tab.id}
                        getTabLabel={(tab) => tab.name}
                        className={styles.nextgenTabs}
                    />

                    <AnimatePresence mode="wait">
                        <motion.section
                            key={activeTab}
                            className={styles.contentSection}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className={styles.infoBlock}>
                                <h2 className={styles.blockTitle}>예배 안내</h2>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>예배 시간</span>
                                    <p className={styles.infoValue}>{activeData.schedule}</p>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>예배 장소</span>
                                    <p className={styles.infoValue}>{activeData.location}</p>
                                </div>
                                {activeData.extraEvents && activeData.extraEvents.map((evt, i) => (
                                    <div key={i} className={styles.infoRow}>
                                        <span className={styles.infoLabel}>{evt.label}</span>
                                        <p className={styles.infoValue}>{evt.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.infoBlock}>
                                <h2 className={styles.blockTitle}>섬기는 분들</h2>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>{activeData.leader.role}</span>
                                    <p className={`${styles.infoValue} ${styles.highlightText}`}>{activeData.leader.name}</p>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>{activeData.director.role}</span>
                                    <p className={`${styles.infoValue} ${styles.highlightText}`}>{activeData.director.name}</p>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>{activeData.teamTitle}</span>
                                    <div className={styles.teamGrid}>
                                        {activeData.teachers.map((teacher, idx) => (
                                            <span key={idx} className={styles.teamItem}>{teacher}</span>
                                        ))}
                                        {activeData.moreTeachersCount > 0 && (
                                            <span className={styles.teamItem}>+외 {activeData.moreTeachersCount}명</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.section>
                    </AnimatePresence>

                    {activeData.events.length > 0 && (
                        <section className={styles.eventsSection}>
                            <div className={styles.eventsHeader}>
                                <h2 className={styles.eventsTitle}>주요 행사</h2>
                            </div>
                            <div className={styles.eventsGrid}>
                                {activeData.events.map((ev, idx) => {
                                    let displayStatus = ev.status;
                                    let displayDate = ev.date;

                                    const formatDate = (dateStr) => {
                                        if (!dateStr) return '';
                                        const [y, m, d] = dateStr.split('-');
                                        return `${y}. ${parseInt(m)}. ${parseInt(d)}.`;
                                    };

                                    if (ev.startDate || ev.endDate) {
                                        const startStr = formatDate(ev.startDate);
                                        const endStr = formatDate(ev.endDate);
                                        if (startStr && endStr) displayDate = `${startStr} ~ ${endStr}`;
                                        else if (startStr) displayDate = startStr;
                                        else if (endStr) displayDate = endStr;
                                    }

                                    if (ev.endDate) {
                                        const today = new Date();
                                        const yyyy = today.getFullYear();
                                        const mm = String(today.getMonth() + 1).padStart(2, '0');
                                        const dd = String(today.getDate()).padStart(2, '0');
                                        const todayStr = `${yyyy}-${mm}-${dd}`;
                                        
                                        if (todayStr > ev.endDate) {
                                            displayStatus = '마감';
                                        }
                                    }

                                    let formattedContent = '';
                                    if (ev.time) formattedContent += `**시간**: ${ev.time}  \n`;
                                    if (ev.location) formattedContent += `**장소**: ${ev.location}  \n`;
                                    if (formattedContent) formattedContent += `\n`;
                                    formattedContent += ev.desc || '';

                                    return (
                                        <motion.div
                                            key={idx}
                                            className={styles.eventCard}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: idx * 0.1 }}
                                            onClick={() => navigate(`/post/nextgen-${activeTab}-${idx}`, { 
                                                state: { 
                                                    title: ev.title, 
                                                    author: activeData.name, 
                                                    date: displayDate, 
                                                    content: formattedContent, 
                                                    imageUrl: ev.img || defaultThumbs[activeTab] || thumbKindergarten,
                                                    imageUrls: ev.imageUrls || [defaultThumbs[activeTab] || thumbKindergarten]
                                                } 
                                            })}
                                        >
                                            <div className={styles.eventImageWrapper}>
                                                <img src={ev.img || defaultThumbs[activeTab] || thumbKindergarten} alt={ev.title} className={styles.eventImage} />
                                            </div>
                                            <div>
                                                <div className={styles.eventMeta}>
                                                    <span 
                                                        className={styles.eventStatus} 
                                                        style={{ 
                                                            backgroundColor: getBadgeStyle(displayStatus).bg,
                                                            color: getBadgeStyle(displayStatus).color
                                                        }}
                                                    >
                                                        {displayStatus}
                                                    </span>
                                                    <span className={styles.eventDate}>
                                                        {displayDate}
                                                    </span>
                                                </div>
                                                <h3 className={styles.eventTitle}>{ev.title}</h3>
                                                <p className={styles.eventDesc}>{ev.desc}</p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </section>
                    )}
                </div>
            </SubPageSection>
            <Footer />
        </div>
    );
};

export default NextGenPage;

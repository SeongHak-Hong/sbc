import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './WorshipPage.module.css';

import worshipGuideImage from '../assets/worship/shintanjin-baptist-church-worship-guide-bg.webp';

import Footer from '../components/Footer';
import CloudBackground from '../components/CloudBackground';

const WorshipPage = () => {
    const [activeTab, setActiveTab] = useState('adult');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Dummy data for "어른 예배"
    const adultSchedule = [
        { name: "1부 예배", time: "오전 07:00", location: "소예배실" },
        { name: "2부 예배", time: "오전 11:00", location: "대예배실", highlight: true },
        { name: "3부 예배", time: "오후 02:00", location: "대예배실" }
    ];

    return (
        <div className={styles.pageContainer}>
            <CloudBackground heightMode="vh" />

            <main className={styles.mainContent}>
                {/* Hero Section */}
                <header className={styles.heroSection}>
                    <div className={styles.heroContent}>
                        <motion.h1 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            style={{ position: 'relative', display: 'inline-block', color: 'white', marginBottom: 0, fontSize: 'var(--text-h1)' }}
                        >
                            예배 안내 · 오시는 길
                        </motion.h1>
                    </div>
                </header>

                {/* Greeting Section */}
                <section className={styles.greetingSection}>
                    <div className={styles.greetingWrapper}>
                        <div className={styles.worshipGuideCard}>
                            
                            {/* Scrapbook Content Layout */}
                            <div className={styles.scrapbookContent}>
                                {/* Navigation Tabs (Masking Tape Style) acting as Title */}
                                <div className={styles.tabsContainer}>
                                    <button 
                                        className={`${styles.tapeTab} ${activeTab === 'adult' ? styles.activeTapeTab : ''}`}
                                        onClick={() => setActiveTab('adult')}
                                    >
                                        어른 예배
                                    </button>
                                    <button 
                                        className={`${styles.tapeTab} ${activeTab === 'nextgen' ? styles.activeTapeTab : ''}`}
                                        onClick={() => setActiveTab('nextgen')}
                                    >
                                        다음 세대
                                    </button>
                                    <button 
                                        className={`${styles.tapeTab} ${activeTab === 'meetings' ? styles.activeTapeTab : ''}`}
                                        onClick={() => setActiveTab('meetings')}
                                    >
                                        모임 안내
                                    </button>
                                </div>

                                <AnimatePresence mode="wait">
                                    {activeTab === 'adult' && (
                                        <motion.div 
                                            key="adult"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.3 }}
                                            className={styles.categorySection}
                                        >
                                            <div className={styles.scheduleList}>
                                                {adultSchedule.map((item, index) => (
                                                    <div key={index} className={styles.scheduleItem}>
                                                        <div className={styles.scheduleNameWrap}>
                                                            <p className={styles.scheduleName}>{item.name}</p>
                                                            {item.highlight && (
                                                                <span className={styles.sticker}>⭐</span>
                                                            )}
                                                        </div>
                                                        <p className={styles.scheduleDetails}>
                                                            {item.time} &middot; {item.location}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'nextgen' && (
                                        <motion.div 
                                            key="nextgen"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.3 }}
                                            className={styles.categorySection}
                                        >
                                            <div className={styles.scheduleList}>
                                                <div className={styles.scheduleItem}>
                                                    <p className={styles.scheduleName}>유치부</p>
                                                    <p className={styles.scheduleDetails}>오전 09:00 &middot; 유치부실</p>
                                                </div>
                                                <div className={styles.scheduleItem}>
                                                    <p className={styles.scheduleName}>초등부</p>
                                                    <p className={styles.scheduleDetails}>오전 09:00 &middot; 러브키즈실</p>
                                                </div>
                                                <div className={styles.scheduleItem}>
                                                    <p className={styles.scheduleName}>청소년부</p>
                                                    <p className={styles.scheduleDetails}>오전 09:00 &middot; 소예배실</p>
                                                </div>
                                                <div className={styles.scheduleItem}>
                                                    <p className={styles.scheduleName}>청년부</p>
                                                    <p className={styles.scheduleDetails}>오후 01:30 &middot; 소예배실</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'meetings' && (
                                        <motion.div 
                                            key="meetings"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.3 }}
                                            className={styles.categorySection}
                                        >
                                            <div className={styles.scheduleList}>
                                                <div className={styles.scheduleItem}>
                                                    <p className={styles.scheduleName}>새벽기도회</p>
                                                    <p className={styles.scheduleDetails}>월~금 새벽 05:00 &middot; 소예배실</p>
                                                </div>
                                                <div className={styles.scheduleItem}>
                                                    <p className={styles.scheduleName}>수요예배</p>
                                                    <p className={styles.scheduleDetails}>수 오후 07:00 &middot; 대예배실</p>
                                                </div>
                                                <div className={styles.scheduleItem}>
                                                    <p className={styles.scheduleName}>금요기도회</p>
                                                    <p className={styles.scheduleDetails}>금 오후 09:00 &middot; 소예배실</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            
                        </div>
                    </div>
                </section>

                {/* Core Pillars Section (Transplanted) */}
                <section className={styles.pillarsSection}>
                    <div className={styles.pillarsWrapper}>
                        <motion.div 
                            className={styles.pillarsHeader}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h3 className={styles.pillarsTitle}>오시는 길</h3>
                        </motion.div>

                        <div className={styles.locationContainer}>
                            <motion.div 
                                className={styles.mapCard}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                            >
                                <div className={styles.mapWrapper}>
                                    <iframe 
                                        src="https://maps.google.com/maps?q=대전%20대덕구%20석봉로%2017&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                                        width="100%" 
                                        height="100%" 
                                        style={{ border: 0, borderRadius: '16px' }} 
                                        allowFullScreen="" 
                                        loading="lazy" 
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="신탄진교회 지도"
                                    ></iframe>
                                </div>
                            </motion.div>

                            <motion.div 
                                className={styles.infoCard}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                <div className={styles.infoGroup}>
                                    <h4 className={styles.infoLabel}>주소</h4>
                                    <p className={styles.infoText}>대전 대덕구 석봉로 17<br/>(석봉동, 신탄진교회)</p>
                                </div>
                                <div className={styles.infoGroup}>
                                    <h4 className={styles.infoLabel}>대중교통</h4>
                                    <p className={styles.infoText}>신탄진역에서 도보 5분 거리<br/>버스: 신탄진역 하차 (2번, 711번, 712번)</p>
                                </div>
                                <div className={styles.infoGroup}>
                                    <h4 className={styles.infoLabel}>주차 안내</h4>
                                    <p className={styles.infoText}>교회 내 주차장 및 인근 공영주차장을 이용하실 수 있습니다.</p>
                                </div>
                                <div className={styles.infoLinks}>
                                    <a href="https://map.kakao.com/link/search/대전+대덕구+석봉로+17" target="_blank" rel="noreferrer" className={styles.mapBtn}>카카오맵</a>
                                    <a href="https://map.naver.com/v5/search/대전 대덕구 석봉로 17" target="_blank" rel="noreferrer" className={styles.mapBtn}>네이버지도</a>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default WorshipPage;

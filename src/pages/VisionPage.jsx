import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './VisionPage.module.css';

import pastorLetterImage from '../assets/vision/shintanjin-baptist-church-pastor-letter.webp';
import pastorIDImage from '../assets/vision/shintanjin-baptist-church-pastor-ID-photo.webp';

import Footer from '../components/Footer';
import CloudBackground from '../components/CloudBackground';
import BalloonBackground from '../components/BalloonBackground';

const VisionPage = () => {
    const [isLetterZoomed, setIsLetterZoomed] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

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
                            말씀으로 단단하게,<br />
                            사랑으로 따뜻하게.
                        </motion.h1>
                    </div>
                </header>

                {/* Greeting Section */}
                <section className={styles.greetingSection}>
                    <div className={styles.greetingWrapper}>
                        <div className={styles.paperLayout}>
                            <div className={styles.flutterEngine}>
                                <div 
                                    className={styles.greetingCard} 
                                    onClick={() => {
                                        if (window.innerWidth < 1024) {
                                            setIsLetterZoomed(true);
                                        }
                                    }}
                                >
                                    <img 
                                        src={pastorIDImage} 
                                        alt="Pastor ID Photo" 
                                        className={styles.idPhoto} 
                                    />
                                </div>
                    </div>
                </div>
            </div>
        </section>

                {/* Core Pillars Section */}
                <section className={styles.pillarsSection}>
                    <div className={styles.pillarsWrapper}>
                        <motion.div 
                            className={styles.pillarsHeader}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h3 className={styles.pillarsTitle}>우리의 핵심 가치</h3>
                        </motion.div>

                        <div className={styles.pillarsGrid}>
                            {/* Pillar 1 */}
                            <motion.div 
                                className={styles.pillarCard}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                            >
                                <div className={styles.iconBox1}>
                                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.icon1}>
                                        <path d="M12 22V10M12 10C12 10 12 4 18 2C18 2 20 8 12 10ZM12 10C12 10 12 4 6 2C6 2 4 8 12 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                                        <path d="M12 22C12 22 12 16 18 14C18 14 20 20 12 22Z" fill="currentColor" opacity="0.2"></path>
                                        <path d="M12 22C12 22 12 16 6 14C6 14 4 20 12 22Z" fill="currentColor" opacity="0.2"></path>
                                    </svg>
                                </div>
                                <h4 className={styles.pillarHeading}>말씀 위에 세워지는 삶</h4>
                                <p className={styles.pillarText}>
                                    변하지 않는 진리인 성경을 삶의 흔들리지 않는 기준으로 삼습니다. 바른 말씀과 양육을 통해 우리 영혼이 굳건한 믿음의 뿌리를 내립니다.
                                </p>
                            </motion.div>

                            {/* Pillar 2 */}
                            <motion.div 
                                className={styles.pillarCard}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                <div className={styles.iconBox2}>
                                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.icon2}>
                                        <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                                        <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="currentColor" opacity="0.15"></path>
                                    </svg>
                                </div>
                                <h4 className={styles.pillarHeading}>서로 사랑하는 공동체</h4>
                                <p className={styles.pillarText}>
                                    기쁨은 더하고 슬픔은 나누는 진정한 영적 가족입니다. 어떤 모습이든 있는 그대로 품어주며, 따뜻한 위로와 사랑을 실천합니다.
                                </p>
                            </motion.div>

                            {/* Pillar 3 */}
                            <motion.div 
                                className={styles.pillarCard}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                            >
                                <div className={styles.iconBox3}>
                                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.icon3}>
                                        <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.2"></circle>
                                        <path d="M12 2V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></path>
                                        <path d="M12 20V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></path>
                                        <path d="M4 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></path>
                                        <path d="M22 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></path>
                                        <path d="M19.0708 4.92896L17.6566 6.34317" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></path>
                                        <path d="M6.34326 17.6569L4.92905 19.0711" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></path>
                                        <path d="M19.0708 19.0711L17.6566 17.6569" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></path>
                                        <path d="M6.34326 6.34317L4.92905 4.92896" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></path>
                                    </svg>
                                </div>
                                <h4 className={styles.pillarHeading}>이웃을 섬기고 축복하는 교회</h4>
                                <p className={styles.pillarText}>
                                    교회 문턱을 넘어 지역 사회로 흘러갑니다. 다음 세대를 품고, 친근한 나눔을 통해 우리 동네에 빛과 소금의 역할을 다합니다.
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </section>
            </main>

            <AnimatePresence>
                {isLetterZoomed && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.85)',
                            zIndex: 9999,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'zoom-out',
                            padding: '16px'
                        }}
                        onClick={() => setIsLetterZoomed(false)}
                    >
                        <motion.img 
                            src={pastorLetterImage}
                            alt="Pastor Letter Expanded"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                                borderRadius: '8px',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>


            <Footer />
        </div>
    );
};

export default VisionPage;

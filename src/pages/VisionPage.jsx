import React from 'react';
import { motion } from 'framer-motion';
import styles from './VisionPage.module.css';
import SubNav from '../components/SubNav';
import Footer from '../components/Footer';

const VisionPage = () => {
    return (
        <div className={styles.pageContainer}>
            {/* Texture Overlay */}
            <div className="global-texture-overlay"></div>

            {/* SubNav is placed below the global header for 2-depth navigation */}
            <div className={styles.navWrapper}>
                <SubNav />
            </div>

            <main className={styles.mainContent}>
                {/* Hero Section */}
                <section className={styles.heroSection}>
                    <div className={styles.glowOrb}></div>
                    <div className={styles.heroContent}>
                        <motion.span 
                            className={styles.eyebrow}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            비전 & 소명
                        </motion.span>
                        <motion.h1 
                            className={styles.heroTitle}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            말씀 위에 든든히 <br />
                            <span className={styles.heroItalic}>세워지는 교회</span>
                            
                            <svg className={styles.heroUnderline} viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 7.5C45 -1.5 155 -1.5 198 7.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round"></path>
                            </svg>
                        </motion.h1>
                        <motion.p 
                            className={styles.heroDesc}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 0.5 }}
                        >
                            하나님의 은혜 안에 깊이 뿌리내리고, 따뜻한 사랑으로 성장하며,<br />
                            우리 동네와 세상을 향해 복음의 빛을 전하는 신탄진교회입니다.
                        </motion.p>
                    </div>
                </section>

                {/* Greeting Section */}
                <section className={styles.greetingSection}>
                    <div className={styles.greetingWrapper}>
                        <div className={styles.paperLayout}>
                            <div className={styles.flutterEngine}>
                                <div className={styles.greetingCard}>
                                    <div className={styles.greetingGrid}>
                                
                                {/* Photo Column */}
                                <motion.div 
                                    className={styles.photoCol}
                                    initial={{ opacity: 0, x: -40 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.8, type: "spring" }}
                                >
                                    <div className={styles.photoFrame}>
                                        <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Senior Pastor Portrait" className={styles.portrait} />
                                        <div className={styles.photoGradient}></div>
                                    </div>
                                </motion.div>

                                {/* Text Column */}
                                <motion.div 
                                    className={styles.textCol}
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                >
                                    <h2 className={styles.greetingTitle}>
                                        누구나 기대어 쉴 수 있는 따뜻한 가족,<br />
                                        <span className={styles.italicGold}>신탄진교회</span>로 초대합니다.
                                    </h2>
                                    
                                    <div className={styles.greetingBody}>
                                        <p>
                                            주님의 이름으로 진심을 담아 환영합니다.<br />
                                            처음 발걸음을 하신 분도, 오랜 시간 신앙의 여정을 함께 걸어오신 분도 이곳에서는 모두가 한 가족입니다. 신탄진교회는 거창하고 화려한 건물보다, 성도 한 사람 한 사람의 삶이 모여 이루어지는 '살아 숨 쉬는 공동체'를 꿈꿉니다.
                                        </p>
                                        <p>
                                            우리는 완벽하지 않지만, 완전하신 하나님의 말씀을 등대 삼아 하루하루 든든히 세워져 가고 있습니다. 주일 예배의 벅찬 감격부터, 평일 골목에서 이웃들과 나누는 소박하고 따뜻한 나눔까지, 우리 교회의 모든 순간에는 그리스도의 향기가 배어 있습니다.
                                        </p>
                                        <p>
                                            삶의 무거운 짐이 있다면 언제든 편히 찾아오세요. 말씀으로 영혼을 채우고, 사랑으로 서로의 어깨를 내어주는 이 눈부신 믿음의 여정에 당신과 함께 걷기를 간절히 소망합니다.
                                        </p>
                                    </div>

                                    <div className={styles.signatureWrap}>
                                        <div className={styles.signatureBlock}>
                                            <p className={styles.signatureEyebrow}>주님의 크신 은혜 안에서,</p>
                                            <p className={styles.signatureKoreanName}>담임목사 최 영 락 올림</p>
                                            <div className={styles.signatureName}>
                                                Young-rak Choi
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
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
                            <p className={styles.pillarsDesc}>우리가 흔들림 없이 지켜가며, 지역 사회와 함께 나누고자 하는 세 가지 비전입니다.</p>
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
            <Footer />
        </div>
    );
};

export default VisionPage;

import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Footer from '../components/Footer';
import CloudBackground from '../components/CloudBackground';
import styles from './NurturePage.module.css';

const NurturePage = () => {
    const journeyContainerRef = useRef(null);
    const [isDesktop, setIsDesktop] = useState(true);

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const { scrollYProgress } = useScroll({
        target: journeyContainerRef,
        offset: ["start start", "end end"]
    });

    // Desktop: Translate right column so 1st card starts higher than text, but 4th card aligns with text at the end
    const yTransform = useTransform(scrollYProgress, value => `calc(-${value * 80}% + ${value * 80}px)`);

    useEffect(() => {
        // Scroll to top when page is mounted
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className={styles.pageWrapper}>
            <CloudBackground heightMode="vh" />

            {/* Spacer equivalent to VisionPage's navWrapper, without the actual SubNav */}
            <div className={styles.navWrapper}></div>

            {/* Header Section */}
            <header className={styles.header}>
                <div style={{ position: 'absolute', top: '80px', left: '40px', transform: 'rotate(-15deg)', opacity: 0.7, display: 'none' }} className="md-block">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FFAE82" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                </div>
                <div style={{ position: 'absolute', top: '112px', right: '40px', transform: 'rotate(15deg)', opacity: 0.7, display: 'none' }} className="md-block">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#B0DCEE" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                </div>

                <h1 className={styles.headerTitle}>
                    새가족 여러분을<br />
                    축복하고 환영합니다!
                </h1>

            </header>

            {/* Scrapbook Section */}
            <section style={{ padding: '48px var(--grid-margin)', maxWidth: 'var(--max-width)', margin: '0 auto', position: 'relative', zIndex: 15 }}>
                <div className={styles.scrapbookGrid}>
                    {/* Photo 1 */}
                    <div className={styles.polaroid} style={{ transform: 'rotate(-3deg)' }}>
                        <div className={`${styles.tape} ${styles.tapeTexture}`} style={{ top: 0, left: '50%', transform: 'translate(-50%, -12px) rotate(-4deg)', width: '112px', height: '32px', backgroundColor: '#FDCBDE' }}></div>
                        <div className={styles.photoFrame} style={{ aspectRatio: '4/3', backgroundColor: '#E2E8F0' }}>
                            <svg style={{ width: '48px', height: '48px', color: '#94a3b8', opacity: 0.5 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                        </div>
                        <div className={styles.photoText}>
                            <p className={styles.handwriting}>따뜻했던 봄날의 피크닉 🧺</p>
                        </div>
                    </div>

                    {/* Photo 2 */}
                    <div className={styles.polaroid} style={{ transform: 'rotate(2deg)', marginTop: '48px' }}>
                        <div className={`${styles.tape} ${styles.tapeTexture}`} style={{ top: 0, left: 0, transform: 'translate(-16px, -16px) rotate(-35deg)', width: '80px', height: '32px', backgroundColor: '#FDF1B6' }}></div>
                        <div className={styles.photoFrame} style={{ aspectRatio: '3/4', backgroundColor: '#CBD5E1' }}>
                            <svg style={{ width: '48px', height: '48px', color: '#f8fafc', opacity: 0.5 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                        </div>
                        <div className={styles.photoText}>
                            <p className={styles.handwriting}>웃음꽃 피는 주일학교 놀이 시간 🎈</p>
                        </div>
                    </div>

                    {/* Photo 3 */}
                    <div className={styles.polaroid} style={{ transform: 'rotate(-1deg)' }}>
                        <div className={`${styles.tape} ${styles.tapeTexture}`} style={{ top: 0, left: '24px', transform: 'translateY(-12px) rotate(-8deg)', width: '96px', height: '32px', backgroundColor: '#D2F0E0' }}></div>
                        <div className={styles.photoFrame} style={{ aspectRatio: '1/1', backgroundColor: '#94A3B8' }}>
                            <svg style={{ width: '48px', height: '48px', color: '#e2e8f0', opacity: 0.5 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                        </div>
                        <div className={styles.photoText}>
                            <p className={styles.handwriting}>은혜가 풍성한 주일 예배 🙏</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Journey Section */}
            <div ref={journeyContainerRef} className={styles.journeyScrollWrapper}>
                <div className={styles.journeyStickyView}>
                    <section className={styles.section} style={{ marginTop: 0, padding: 0 }}>
                        <div className={styles.journeySplitContainer}>
                            {/* Left Sticky Side */}
                            <div className={styles.journeyLeft}>
                                <h2 className={styles.sectionTitle} style={{ textAlign: 'left' }}>신탄진교회 정착 여정</h2>
                                <p className={styles.sectionSubtitle} style={{ marginLeft: 0, marginRight: 0, textAlign: 'left' }}>우리 교회에 스며드는 따뜻한 4단계의 시간을 안내해 드려요.</p>
                            </div>

                            {/* Right Scrolling Side */}
                            <motion.div
                                className={styles.journeyRight}
                                style={isDesktop ? { y: yTransform } : {}}
                            >
                                {/* Step 1 */}
                                <div className={styles.stepCard}>
                                    <div className={styles.stepBadge} style={{ backgroundColor: '#FFAE82' }}>1단계</div>
                                    <div className={styles.stepIconWrap} style={{ backgroundColor: '#E5F3F9' }}>
                                        🐻<span style={{ position: 'absolute', top: 0, right: 0, fontSize: '1.5rem' }}>✨</span>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <h4 className={styles.stepTitle}>새가족 등록</h4>
                                        <p className={styles.stepDesc}>등록카드를 작성하며, 담당 교역자의 따뜻한 첫 안내를 받습니다.</p>
                                    </div>
                                </div>

                                {/* Step 2 */}
                                <div className={styles.stepCard}>
                                    <div className={styles.stepBadge} style={{ backgroundColor: '#FFD166', color: '#78350f', borderColor: '#ffffff' }}>2단계</div>
                                    <div className={styles.stepIconWrap} style={{ backgroundColor: '#fffbeb' }}>🦊</div>
                                    <div style={{ textAlign: 'center' }}>
                                        <h4 className={styles.stepTitle}>새가족 교육 (6주)</h4>
                                        <p className={styles.stepDesc}>건강한 신앙생활과 교회 정착을 위해 6주간의 기초 교육을 진행합니다.</p>
                                    </div>
                                </div>

                                {/* Step 3 */}
                                <div className={styles.stepCard}>
                                    <div className={styles.stepBadge} style={{ backgroundColor: '#06D6A0', color: '#134e4a' }}>3단계</div>
                                    <div className={styles.stepIconWrap} style={{ backgroundColor: '#f0fdfa' }}>🐰</div>
                                    <div style={{ textAlign: 'center' }}>
                                        <h4 className={styles.stepTitle}>수료 및 소그룹 배정</h4>
                                        <p className={styles.stepDesc}>교육 수료 후, 따뜻한 소그룹(목장)에 소속되어 성도들과 풍성한 교제를 나눕니다.</p>
                                    </div>
                                </div>

                                {/* Step 4 */}
                                <div className={styles.stepCard}>
                                    <div className={styles.stepBadge} style={{ backgroundColor: '#118AB2', color: '#ffffff' }}>4단계</div>
                                    <div className={styles.stepIconWrap} style={{ backgroundColor: '#f0f9ff' }}>🦉</div>
                                    <div style={{ textAlign: 'center' }}>
                                        <h4 className={styles.stepTitle}>침례 및 환영회</h4>
                                        <p className={styles.stepDesc}>침례식과 환영회를 통해 한 가족이 된 기쁨을 누리며 비전을 공유합니다.</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </section>
                </div>
            </div>


            {/* Keep the original Footer */}
            <Footer />
        </div>
    );
};

export default NurturePage;

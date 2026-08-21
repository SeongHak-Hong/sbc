import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import styles from './VisionPage.module.css';

import pastorIDImage from '../assets/vision/shintanjin-baptist-church-pastor-ID-photo.webp';
import pastorSignImage from '../assets/vision/shintanjin-baptist-church-pastor-sign.webp';

import Footer from '../components/Footer';
import SubPageSection from '../components/SubPageSection';

const WordFadeText = ({ isActive, text, delayOffset = 0, className, style }) => {
    const words = text.split(/([ \t\n\r]+)/);
    return (
        <div className={className} style={{ ...style, display: 'inline-block' }}>
            {words.map((word, index) => {
                if (word.match(/^[ \t\n\r]+$/)) {
                    return <span key={index} className={styles.spaceSpan}>{word}</span>;
                }
                return (
                    <motion.span
                        key={index}
                        initial={{ opacity: 0, filter: 'blur(10px)' }}
                        animate={isActive ? { opacity: 1, filter: 'blur(0px)' } : { opacity: 0, filter: 'blur(10px)' }}
                        transition={{ 
                            duration: 0.8, 
                            delay: isActive ? delayOffset + (index * 0.04) : 0,
                            ease: "easeOut"
                        }}
                        style={{ display: 'inline-block' }}
                    >
                        {word}
                    </motion.span>
                );
            })}
        </div>
    );
};

const ScrollDownIcon = ({ isActive, delayOffset = 0 }) => (
    <motion.div
        initial={{ opacity: 0, filter: 'blur(10px)' }}
        animate={isActive ? { opacity: 1, filter: 'blur(0px)' } : { opacity: 0, filter: 'blur(10px)' }}
        transition={isActive ? { duration: 0.5, delay: delayOffset } : { duration: 0.3 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
        <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ color: 'var(--color-text-muted)', display: 'flex' }}
        >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
        </motion.div>
    </motion.div>
);

const VisionPage = () => {
    const introScrollRef = useRef(null);
    const [introActiveIndex, setIntroActiveIndex] = useState(0);

    const { scrollYProgress: introScrollY } = useScroll({
        target: introScrollRef,
        offset: ["start start", "end end"]
    });

    useMotionValueEvent(introScrollY, "change", (latest) => {
        if (latest < 0.50) setIntroActiveIndex(0);
        else setIntroActiveIndex(1);
    });

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <>
            <SubPageSection hideHeader={true} className={styles.pageWrapper}>
                <div ref={introScrollRef} className={styles.introPinnedWrapper}>
                    <div className={styles.introSticky}>
                        
                        {/* Section 1: Intro */}
                        <div className={`${styles.introAbsoluteCenter} ${introActiveIndex === 0 ? styles.activeLayer : ''}`}>
                            <div className={styles.fadeInner}>
                                <motion.div 
                                    className={styles.breadcrumb}
                                    initial={{ opacity: 0, filter: 'blur(10px)' }}
                                    animate={introActiveIndex === 0 ? { opacity: 1, filter: 'blur(0px)' } : { opacity: 0, filter: 'blur(10px)' }}
                                    transition={{ duration: 1 }}
                                >
                                    교회소개 - 인사말 · 비전
                                </motion.div>
                                <WordFadeText isActive={introActiveIndex === 0} text={"할렐루야!\n신탄진침례교회를 찾아주신 여러분께\n하나님의 은총과 평강이 함께하시기를 축복합니다."} className={styles.yuhanText} />
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <WordFadeText isActive={introActiveIndex === 0} text={"밑으로 계속 스크롤"} className={styles.fadeBodyText} delayOffset={0.2} style={{ whiteSpace: 'nowrap' }} />
                                    <ScrollDownIcon isActive={introActiveIndex === 0} delayOffset={0.3} />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Pastor Profile */}
                        <div className={`${styles.introAbsoluteCenter} ${introActiveIndex === 1 ? styles.activeLayer : ''}`}>
                            <motion.div 
                                className={styles.fullWidthContainer}
                                initial={{ opacity: 0, filter: 'blur(10px)' }}
                                animate={introActiveIndex === 1 ? { opacity: 1, filter: 'blur(0px)' } : { opacity: 0, filter: 'blur(10px)' }}
                                transition={{ duration: 1 }}
                            >
                                <div className={styles.hallelujahBackground}>HALLELUJAH</div>
                                <div className={styles.greetingWrapper}>
                                    <div className={styles.greetingGrid}>
                                        <div className={styles.photoCol}>
                                            <img 
                                                src={pastorIDImage}
                                                alt="담임목사 프로필"
                                                className={styles.profileImage}
                                            />
                                        </div>
                                        <div className={styles.textCol}>
                                            <div className={styles.greetingBody}>
                                                <motion.p
                                                    initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                                                    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                                    viewport={{ once: true, margin: "-15%" }}
                                                    transition={{ duration: 0.8 }}
                                                >
                                                    우리 교회는 1954년 신탄진 지역에 가장 먼저 세워져, 지난 70여 년 동안 하나님의 은혜 속에서 든든히 걸어왔습니다.
                                                </motion.p>
                                                <motion.p
                                                    initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                                                    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                                    viewport={{ once: true, margin: "-15%" }}
                                                    transition={{ duration: 0.8, delay: 0.1 }}
                                                >
                                                    이제 우리는 지나온 시간에 머무르지 않고, 우리에게 맡겨주신 21세기의 새로운 비전을 향해 나아가고자 합니다. 가르치고, 치유하며, 천국 복음을 전하셨던 예수님의 발자취를 따라 복음을 전파하고, 말씀으로 성도를 양육하며, 사람을 살리고 세우는 일에 정진하겠습니다. 이 거룩한 사명에 동참하여 그리스도인으로 함께 자라갈 모든 분을 기쁘게 환영합니다.
                                                </motion.p>
                                                <motion.p
                                                    initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                                                    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                                    viewport={{ once: true, margin: "-15%" }}
                                                    transition={{ duration: 0.8, delay: 0.2 }}
                                                >
                                                    우리 교회를 찾는 모든 분이 예수님을 만나 위로와 치유를 경험하고, 진정한 주님의 제자로 세워지기를 간절히 축원합니다.
                                                </motion.p>
                                            </div>
                                            <div className={styles.signatureWrap}>
                                                <div className={styles.signatureText}>
                                                    주님의 크신 은혜 안에서<br />
                                                    담임목사 최영락 올림
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                    </div>
                </div>
            </SubPageSection>
            <Footer />
        </>
    );
};

export default VisionPage;

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { useState } from 'react';
import Lottie from 'lottie-react';
import confettiAnimation from '../assets/confetti.json';
import Footer from '../components/Footer';
import ScrollFadeText from '../components/ScrollFadeText';
import SubPageSection from '../components/SubPageSection';
import LargeButton from '../components/ui/LargeButton';
import styles from './WelcomePage.module.css';
import visionIcon from '../assets/vision/shintanjin-baptist-church-vision-icon.webp';
import welcomeImg from '../assets/nurture/shintanjin-baptist-church-welcome.webp';
import step01 from '../assets/nurture/shintanjin-baptist-church-welcome-step-01.webp';
import step02 from '../assets/nurture/shintanjin-baptist-church-welcome-step-02.webp';
import step03 from '../assets/nurture/shintanjin-baptist-church-welcome-step-03.webp';
import step04 from '../assets/nurture/shintanjin-baptist-church-welcome-step-04.webp';
import step05 from '../assets/nurture/shintanjin-baptist-church-welcome-step-05.webp';

const STEPS = [
    {
        bg: step01,
        stepText: 'STEP 1',
        title: '새가족 등록',
        desc: '등록 카드를 작성하시면 교회의 따뜻한 환영과 함께, 앞으로의 신앙생활 및 소속될 기관에 대한 전반적인 안내를 받게 됩니다.',
    },
    {
        bg: step02,
        stepText: 'STEP 2',
        title: '새가족 교육 (8주)',
        desc: '8주간 진행되는 새가족 교육 기간 동안, 새가족팀에서 주일 예배와 교육 참석 등 전반적인 교회 생활을 친절하게 안내해 드립니다.',
    },
    {
        bg: step03,
        stepText: 'STEP 3',
        title: '교육 수료 및 기관 편성',
        desc: '새가족 교육 과정을 모두 수료하시면, 연령과 지역에 맞춰 각 교구와 구역, 그리고 남·여 전도회에 정식으로 편성됩니다.',
    },
    {
        bg: step04,
        stepText: 'STEP 4',
        title: '구역 및 전도회 예배 참여',
        desc: '소속된 구역과 전도회의 예배 및 모임에 참여하여, 함께 말씀을 나누고 교제하며 신앙이 더욱 성장할 수 있도록 돕습니다.',
    },
    {
        bg: step05,
        stepText: 'STEP 5',
        title: '새가족 환영회',
        desc: '새가족 교육 수료식을 진행하며, 예수 그리스도를 구주로 영접한 성도님들을 우리 교회의 진정한 가족으로 따뜻하게 환영합니다.',
    },
];

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
                            // Stagger logic: each word index increments by 2 (spaces are odd).
                            // So index * 0.04 creates an effective 0.08s stagger per word.
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

const SimpleFadeText = WordFadeText;

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

const ScrollStackCard = ({ step, index, total, progress }) => {
    // In Skiper16, range is [index * 0.25, 1] for 5 cards
    const startProgress = index * (1 / (total - 1));
    const targetScale = 1 - ((total - index - 1) * 0.05);

    const scale = useTransform(progress, [startProgress, 1], [1, targetScale]);

    // Each card shifts up by 32px per depth level
    const targetY = -(total - index - 1) * 32;
    const y = useTransform(progress, [startProgress, 1], [0, targetY]);

    return (
        <div className={styles.stickyCardWrapper}>
            <motion.div
                className={styles.stackCard}
                style={{
                    scale,
                    y,
                    transformOrigin: 'top center',
                    backgroundImage: `url(${step.bg})`
                }}
            >
                <div className={styles.cardDim}></div>
                <div className={styles.cardContentWrapper}>
                    <div className={styles.stepBadgeNew}>{step.stepText}</div>
                    <div className={styles.cardTextContainer}>
                        <div className={styles.cardTextContent}>
                            <h4 className={styles.stepTitleNew}>{step.title}</h4>
                            <p className={styles.stepDescNew}>{step.desc}</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const WelcomePage = () => {
    const stackContainerRef = useRef(null);
    const introScrollRef = useRef(null);
    const navigate = useNavigate();
    const [showConfetti, setShowConfetti] = useState(false);
    const [introActiveIndex, setIntroActiveIndex] = useState(0);

    const { scrollYProgress } = useScroll({
        target: stackContainerRef,
        offset: ["start start", "end end"]
    });

    const { scrollYProgress: introScrollY } = useScroll({
        target: introScrollRef,
        offset: ["start start", "end end"]
    });

    useMotionValueEvent(introScrollY, "change", (latest) => {
        if (latest < 0.20) setIntroActiveIndex(0);
        else if (latest < 0.40) setIntroActiveIndex(1);
        else if (latest < 0.60) setIntroActiveIndex(2);
        else if (latest < 0.80) setIntroActiveIndex(3);
        else setIntroActiveIndex(-1);
    });

    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        if (latest >= 0.95 && !showConfetti) {
            setShowConfetti(true);
        } else if (latest < 0.90 && showConfetti) {
            setShowConfetti(false);
        }
    });

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className={styles.pageWrapper}>

            {/* Pinned Intro Sections */}
            <div ref={introScrollRef} className={styles.introPinnedWrapper}>
                <div className={styles.introSticky}>

                    {/* Section 1 */}
                    <div className={`${styles.introAbsoluteCenter} ${introActiveIndex === 0 ? styles.activeLayer : ''}`}>
                        <div className={styles.fadeInner}>
                            <motion.div 
                                initial={{ opacity: 0, filter: 'blur(10px)' }}
                                animate={introActiveIndex === 0 ? { opacity: 1, filter: 'blur(0px)' } : { opacity: 0, filter: 'blur(10px)' }}
                                transition={{ duration: 1 }}
                                style={{
                                    fontSize: '16px',
                                    fontWeight: 500,
                                    color: 'var(--color-text-placeholder)',
                                    marginBottom: '16px',
                                    fontFamily: "'YK Green Forest', var(--font-yuhan), sans-serif",
                                    textAlign: 'center'
                                }}
                            >
                                공동체 - 새가족
                            </motion.div>
                            <WordFadeText isActive={introActiveIndex === 0} text={"신탄진침례교회에 방문하신\n여러분 환영합니다."} className={styles.yuhanText} />
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <WordFadeText isActive={introActiveIndex === 0} text={"밑으로 계속 스크롤"} className={styles.fadeBodyText} delayOffset={0.2} style={{ whiteSpace: 'nowrap' }} />
                                <ScrollDownIcon isActive={introActiveIndex === 0} delayOffset={0.3} />
                            </div>
                        </div>
                    </div>
                    {/* Section 2 */}
                    <div className={`${styles.introAbsoluteCenter} ${introActiveIndex === 1 ? styles.activeLayer : ''}`}>
                        <div className={styles.fadeInner}>
                            <SimpleFadeText isActive={introActiveIndex === 1} text={"가장 먼저 드리고 싶은 말씀은,\n저희는 교회 등록을 부담스럽게 권하지 않는다는 점입니다."} className={styles.yuhanText} />
                        </div>
                    </div>
                    {/* Section 3 */}
                    <div className={`${styles.introAbsoluteCenter} ${introActiveIndex === 2 ? styles.activeLayer : ''}`}>
                        <div className={styles.fadeInner}>
                            <SimpleFadeText isActive={introActiveIndex === 2} text={"이곳에서 함께 신앙생활을 해나가도 좋을지\n충분히 경험해 보시고, 편안한 마음으로 결정하시기를 바랍니다."} className={styles.yuhanText} />
                        </div>
                    </div>
                    {/* Section 4 */}
                    <div className={`${styles.introAbsoluteCenter} ${introActiveIndex === 3 ? styles.activeLayer : ''}`}>
                        <div className={styles.fadeInner}>
                            <SimpleFadeText isActive={introActiveIndex === 3} text={"나중에 마음의 준비가 되셨을 때를 위해,\n새가족이 되는 과정을 가볍게 안내해 드릴게요."} className={styles.yuhanText} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Journey Section - Skiper16 Sticky Stack */}
            <div ref={stackContainerRef} className={styles.fanStackWrapper}>
                <div className={styles.fanStackArea}>
                    {STEPS.map((step, i) => (
                        <ScrollStackCard
                            key={i}
                            step={step}
                            index={i}
                            total={STEPS.length}
                            progress={scrollYProgress}
                        />
                    ))}
                </div>
            </div>


            {/* CTA Section */}
            <div className={styles.ctaSection}>
                <ScrollFadeText 
                    className={styles.yuhanText}
                    text={"더 궁금한 점이 있으신가요?\n문의 주시면 따뜻하고 친절하게 안내해 드리겠습니다."}
                    once={true}
                />
                <motion.div 
                    initial={{ opacity: 0, filter: 'blur(10px)' }}
                    whileInView={{ opacity: 1, filter: 'blur(0px)' }}
                    viewport={{ once: true, amount: 0, margin: "0px 0px -30% 0px" }}
                    transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                    style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}
                >
                    <LargeButton>
                        새가족 등록 문의하기
                    </LargeButton>
                </motion.div>
            </div>

            <Footer />

            {showConfetti && createPortal(
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, pointerEvents: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Lottie animationData={confettiAnimation} loop={false} style={{ width: '100%', height: '100%' }} />
                </div>,
                document.body
            )}
        </div>
    );
};

export default WelcomePage;

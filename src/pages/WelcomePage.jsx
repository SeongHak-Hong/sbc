import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { useState } from 'react';
import Lottie from 'lottie-react';
import confettiAnimation from '../assets/confetti.json';
import Footer from '../components/Footer';
import SubPageSection from '../components/SubPageSection';
import SuitButton from '../components/ui/SuitButton';
import styles from './WelcomePage.module.css';
import visionIcon from '../assets/vision/shintanjin-baptist-church-vision-icon.webp';
import welcomeImg from '../assets/nurture/shintanjin-baptist-church-welcome.webp';
import step01 from '../assets/nurture/shintanjin-baptist-church-nurture-step-01.webp';
import step02 from '../assets/nurture/shintanjin-baptist-church-nurture-step-02.webp';
import step03 from '../assets/nurture/shintanjin-baptist-church-nurture-step-03.webp';
import step04 from '../assets/nurture/shintanjin-baptist-church-nurture-step-04.webp';
import step05 from '../assets/nurture/shintanjin-baptist-church-nurture-step-05.webp';

const STEPS = [
    {
        bg: step01,
        width: 400,
        aspectRatio: '1 / 1',
        title: '첫째. 새가족 등록',
        desc: '등록카드 작성 후 교구 구역 남여전도회에 배정되며 목사님의 환영 및 안내를 받게됩니다.',
    },
    {
        bg: step02,
        width: 400,
        aspectRatio: '1 / 1',
        title: '둘째. 새가족 교육 (8주)',
        desc: '새가족 교육을 받는동안 새가족팀에게 예배참석, 교육 참석 등을 돕고 안내합니다.',
    },
    {
        bg: step03,
        width: 400,
        aspectRatio: '1 / 1',
        title: '셋째. 수료 및 교구 구역 남여전도회 배정',
        desc: '새가족 교육은 8주 교육을 마치면 각 교구 구역 남여전도회에 배정됩니다.',
    },
    {
        bg: step04,
        width: 400,
        aspectRatio: '1 / 1',
        title: '넷째. 교구구역 및 남여전도회 참여 예배 참석',
        desc: '교구 구역 및 남여전도회에 참여해서 교회에 건강하게 뿌리내리고 예배참석하여 말씀을 듣고 배움으로 신앙으로 균형을 이뤄 성장할 수 있도록 돕습니다.',
    },
    {
        bg: step05,
        width: 400,
        aspectRatio: '1 / 1',
        title: '다섯째. 새가족환영회',
        desc: '예수그리스도를 구주와 주님으로 영접한 새가족은 새가족 교육 수료식과 공동체의 가족으로 환영합니다.',
    },
];

// 각 카드의 최종 x/회전 값 (5개 카드로 조정)
const STACK_TRANSFORMS = [
    { x: -70, rotate: -6 },   // 1번째
    { x: -20, rotate: 4 },    // 2번째
    { x: 30, rotate: -3 },    // 3번째
    { x: 60, rotate: 5 },     // 4번째
    { x: 0, rotate: 0 },      // 5번째: 배치된 카드 정중앙에 올라오도록
];

const ScrollStackCard = ({ step, index, total, containerRef }) => {
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const totalCards = total;
    // 마지막 카드(index 3)가 1.0(끝)에 도달하도록 각 카드의 도달 구간 크기 계산
    const arrivalStep = 1 / (totalCards - 1);

    // 이 카드가 꼭대기(y=0)에 도달하는 시점
    const arriveEnd = index * arrivalStep;
    // 이 카드가 도착하기 위해 본격적으로 팬아웃(x/rotate 변환)을 시작하는 시점
    const arriveStart = Math.max(0, (index - 1) * arrivalStep);

    const stackTransform = STACK_TRANSFORMS[index];

    // 각 카드의 시작 Y 위치: 카드 높이(500px) + 간격(40px) 만큼 아래로
    const cardHeightPlusGap = 540;
    const startY = cardHeightPlusGap * index;

    // Y 이동: 0부터 자기 도착 지점(arriveEnd)까지 선형으로 이동
    // 모든 카드가 0에서 출발하므로 속도가 동일해져 간격(gap)이 완벽히 유지됨
    const y = useTransform(
        scrollYProgress,
        index === 0 ? [0, 1] : [0, arriveEnd],
        index === 0 ? [0, 0] : [startY, 0]
    );

    // X 이동 & 회전: 
    // 1번째 카드(index 0)는 스크롤 시작~1단계 도착(arrivalStep) 동안 왼쪽으로 이동
    // 나머지 카드는 자기 바로 이전 카드가 도착한 시점(arriveStart) ~ 자기가 도착하는 시점(arriveEnd) 동안 타겟으로 이동
    const fanStart = index === 0 ? 0 : arriveStart;
    const fanEnd = index === 0 ? arrivalStep : arriveEnd;

    const xShift = useTransform(
        scrollYProgress,
        [fanStart, fanEnd],
        [0, stackTransform.x]
    );

    const rotate = useTransform(
        scrollYProgress,
        [fanStart, fanEnd],
        [0, stackTransform.rotate]
    );

    // 스케일: 부채꼴로 펼쳐지므로 크기는 유지
    const scale = 1;

    const opacity = useTransform(
        scrollYProgress,
        [0, 1],
        [1, 1]
    );

    const innerStyle = step.bg ? {
        backgroundImage: `url(${step.bg})`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        aspectRatio: step.aspectRatio || '1 / 1',
        width: step.width ? `${step.width}px` : '100%',
        maxWidth: '100%',
        backgroundColor: 'transparent',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
        boxShadow: 'none',
        boxSizing: 'border-box',
        borderRadius: step.isCircle ? '50%' : '0',
    } : {
        backgroundColor: step.bgColor || 'rgba(var(--color-text-dark-rgb), 0.95)',
        aspectRatio: step.aspectRatio || '1 / 1',
        width: step.width ? `${step.width}px` : '100%',
        maxWidth: '100%',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        boxSizing: 'border-box',
        borderRadius: step.isCircle ? '50%' : '0',
    };

    return (
        <motion.div
            className={styles.stackCard}
            style={{
                y,
                x: xShift,
                rotate,
                scale,
                opacity,
                zIndex: index + 1,
                ...innerStyle,
            }}
        >
            <div style={{ textAlign: 'center' }}>
                <h4 className={styles.stepTitle}>{step.title}</h4>
                <p className={styles.stepDesc}>{step.desc}</p>
            </div>
        </motion.div>
    );
};

const WelcomePage = () => {
    const stackContainerRef = useRef(null);
    const navigate = useNavigate();
    const [showConfetti, setShowConfetti] = useState(false);

    const { scrollYProgress } = useScroll({
        target: stackContainerRef,
        offset: ["start start", "end end"]
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

            {/* Journey Section - Fan Stack with Header integrated */}
            <div ref={stackContainerRef} className={styles.fanStackWrapper}>
                <div className={styles.fanStackSticky}>
                    {/* Header Section (Moved inside sticky container) */}
                    <SubPageSection 
                        title={
                            <>
                                축복하고 환영합니다.
                            </>
                        } 
                        engTitle="Welcome"
                        icon={visionIcon}
                    >

                    <div className={styles.fanStackArea}>
                        {STEPS.map((step, i) => (
                            <ScrollStackCard
                                key={i}
                                step={step}
                                index={i}
                                total={STEPS.length}
                                containerRef={stackContainerRef}
                            />
                        ))}
                    </div>
                    </SubPageSection>
                </div>
            </div>


            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', paddingTop: '160px', paddingBottom: '120px', position: 'relative', zIndex: 10 }}>
                <SuitButton>
                    새가족 교육과정 보기
                </SuitButton>
                <motion.button
                    style={{
                        backgroundColor: 'var(--color-text-dark)',
                        color: 'var(--color-white)',
                        border: '1px solid var(--color-text-dark)',
                    }}
                    whileHover={{ backgroundColor: '#000000' }}
                    transition={{ duration: 0.2 }}
                >
                    새가족 등록 문의하기
                </motion.button>
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

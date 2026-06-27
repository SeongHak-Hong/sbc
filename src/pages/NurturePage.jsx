import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Footer from '../components/Footer';
import CloudBackground from '../components/CloudBackground';
import styles from './NurturePage.module.css';
import welcomeImg from '../assets/nurture/shintanjin-baptist-church-welcome.webp';
import step01 from '../assets/nurture/shintanjin-baptist-church-nurture-step-01.webp';
import step02 from '../assets/nurture/shintanjin-baptist-church-nurture-step-02.webp';
import step03 from '../assets/nurture/shintanjin-baptist-church-nurture-step-03.webp';
import step04 from '../assets/nurture/shintanjin-baptist-church-nurture-step-04.webp';

const STEPS = [
    {
        bg: step01,
        width: 400,
        aspectRatio: '1 / 1',
        title: '새가족 등록',
        desc: <>등록카드를 작성하며<br />담당 교역자의 따뜻한 첫 안내를 받습니다.</>,
    },
    {
        bg: step02,
        width: 400,
        aspectRatio: '1 / 1',
        title: '새가족 교육 (6주)',
        desc: <>건강한 신앙생활과 교회 정착을 위해<br />6주간의 기초 교육을 진행합니다.</>,
    },
    {
        bg: step03,
        width: 400,
        aspectRatio: '1 / 1',
        title: '수료 및 소그룹 배정',
        desc: '교육 수료 후, 따뜻한 소그룹(목장)에 소속되어 성도들과 풍성한 교제를 나눕니다.',
    },
    {
        bg: step04,
        width: 400,
        aspectRatio: '1 / 1',
        title: '침례 및 환영회',
        desc: '침례식과 환영회를 통해 한 가족이 된 기쁨을 누리며 비전을 공유합니다.',
    },
];

// 각 카드의 최종 x/회전 값
const STACK_TRANSFORMS = [
    { x: -60, rotate: -6 },   // 1번째: 왼쪽으로 이동, 반시계
    { x: 0, rotate: 4 },      // 2번째: x이동 없음(가운데), 시계
    { x: 60, rotate: -2 },    // 3번째: 오른쪽으로 이동, 반시계
    { x: 0, rotate: 0 },      // 4번째: 배치된 카드 정중앙에 올라오도록
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
    } : {
        backgroundColor: step.bgColor || 'rgba(255, 255, 255, 0.95)',
        aspectRatio: step.aspectRatio || '1 / 1',
        width: step.width ? `${step.width}px` : '100%',
        maxWidth: '100%',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        boxSizing: 'border-box',
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

const NurturePage = () => {
    const stackContainerRef = useRef(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className={styles.pageWrapper}>
            <CloudBackground heightMode="vh" />

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
                    <div className={styles.polaroid} style={{ transform: 'rotate(-3deg)' }}>
                        <div className={`${styles.tape} ${styles.tapeTexture}`} style={{ top: 0, left: '50%', transform: 'translate(-50%, -12px) rotate(-4deg)', width: '112px', height: '32px', backgroundColor: '#FDCBDE' }}></div>
                        <div className={styles.photoFrame} style={{ aspectRatio: '4/3', backgroundColor: '#E2E8F0', padding: 0, overflow: 'hidden' }}>
                            <img src={welcomeImg} alt="Welcome to Shintanjin Baptist Church" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Journey Section - Fan Stack */}
            <div ref={stackContainerRef} className={styles.fanStackWrapper}>
                <div className={styles.fanStackSticky}>
                    <div className={styles.scrollStackHeader}>
                        <h2 className={styles.sectionTitle}>신탄진교회 정착 여정</h2>
                        <p className={styles.sectionSubtitle}>우리 교회에 스며드는 따뜻한 4단계의 시간을 안내해 드려요.</p>
                    </div>

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
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default NurturePage;

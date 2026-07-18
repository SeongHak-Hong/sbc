import React, { useRef, useState, useEffect, useLayoutEffect, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, useScroll, useTransform } from 'framer-motion';
import { BlurFade } from '../components/ui/BlurFade';
import SuitButton from '../components/ui/SuitButton';
import LightRays from '../components/LightRays';
import Footer from '../components/Footer';
import styles from './LandingPage.module.css';

// Assets
import heroPainting from '../assets/landing/hero-painting.png';
import emmausPainting from '../assets/landing/emmaus-painting.png';
import gatheringPainting from '../assets/landing/gathering-painting.png';
import prodigalPainting from '../assets/landing/prodigal-painting.png';
import iPhoneFrameImg from '../assets/main/iPhone-14-Pro.webp';
import playBtnImg from '../assets/main/Youtube-shorts-icon.webp';
import pastorPhoto from '../assets/vision/shintanjin-baptist-church-pastor-ID-photo.webp';

gsap.registerPlugin(ScrollTrigger);

/* =========================================
   Scene 1: Hero — 캔버스 줌인
   ========================================= */
const HeroScene = () => {
    const sceneRef = useRef(null);
    const paintingRef = useRef(null);
    const textRef = useRef(null);
    const transitionRef = useRef(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 767);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useLayoutEffect(() => {
        const el = sceneRef.current;
        if (!el) return;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: el,
                    start: 'top top',
                    end: '+=300%',
                    pin: true,
                    scrub: 1,
                    anticipatePin: 1,
                },
            });

            // Zoom into the painting
            tl.to(paintingRef.current, {
                scale: isMobile ? 2 : 3,
                x: isMobile ? '-10%' : '-15%',
                y: '-10%',
                ease: 'none',
                duration: 2,
            });

            // Fade out text
            tl.to(textRef.current, {
                opacity: 0,
                y: -100,
                duration: 0.8,
            }, '<0.3');

            // Transition overlay to beige
            tl.to(transitionRef.current, {
                opacity: 1,
                duration: 0.6,
            }, '>-0.3');
        }, sceneRef);

        return () => ctx.revert();
    }, [isMobile]);

    return (
        <section ref={sceneRef} className={styles.heroScene}>
            {/* Canvas Wrapper */}
            <div className={styles.heroCanvasWrapper}>
                <img
                    ref={paintingRef}
                    src={heroPainting}
                    alt="Hero Painting"
                    className={styles.heroPainting}
                />
            </div>

            {/* Gradient Overlay */}
            <div
                className={styles.heroGradientOverlay}
                style={{
                    background: isMobile
                        ? 'linear-gradient(to right, rgba(44, 35, 25, 0.7) 0%, rgba(44, 35, 25, 0) 100%)'
                        : 'linear-gradient(to right, rgba(44, 35, 25, 0.8) 0%, rgba(44, 35, 25, 0) 50%)',
                }}
            />

            {/* LightRays */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 3,
                pointerEvents: 'none', mixBlendMode: 'plus-lighter',
            }}>
                <LightRays
                    raysOrigin="top-center"
                    raysColor="#fff5d6"
                    raysSpeed={1.5}
                    lightSpread={0.8}
                    rayLength={1.2}
                    followMouse={true}
                    mouseInfluence={0.1}
                    noiseAmount={0.1}
                    distortion={0.05}
                />
            </div>

            {/* Text */}
            <div ref={textRef} className={styles.heroTextOverlay}>
                <BlurFade delay={0.25} inView>
                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%',
                            flexWrap: isMobile ? 'wrap' : 'nowrap',
                        }}>
                            <h1 className={styles.heroEngTitle}>The Living</h1>
                            <h1 className={styles.heroEngTitle} style={{ textAlign: 'right' }}>Word</h1>
                        </div>
                        <p className={styles.heroKorSub}>말씀 위에 든든히 세워진 교회</p>
                    </div>
                </BlurFade>
            </div>

            {/* Transition Overlay */}
            <div ref={transitionRef} className={styles.heroTransitionOverlay} />
        </section>
    );
};

/* =========================================
   Scene 2: Verse — 타이포그래피 Only
   ========================================= */
const VerseScene = () => {
    const sectionRef = useRef(null);
    const textRef = useRef(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const verseText = isMobile
        ? `"지금 내가 여러분을 주와 및 그 은혜의 말씀에 부탁하노니 그 말씀이 여러분을 능히 든든히 세우사 거룩하게 하심을 입은 모든 자 가운데 기업이 있게 하시리라"\n사도행전\u00A020장\u00A032절`
        : `"지금 내가 여러분을 주와 및 그 은혜의 말씀에 부탁하노니\n그 말씀이 여러분을 능히 든든히 세우사\n거룩하게 하심을 입은 모든 자 가운데 기업이 있게 하시리라"\n사도행전\u00A020장\u00A032절`;

    const splitText = useMemo(() => {
        return verseText.split(/([ \t\n\r]+)/).map((word, index) => {
            if (word.match(/^[ \t\n\r]+$/)) return word;
            const isCitation = word.includes('사도행전');
            return (
                <span className={styles.verseWord} key={index} style={{
                    fontSize: isCitation ? (isMobile ? '20px' : 'var(--text-h4)') : 'inherit',
                    marginTop: isCitation ? '24px' : '0',
                    color: isCitation ? 'var(--color-text-dark)' : 'inherit',
                }}>
                    {isCitation && <span className={styles.verseCitation} />}
                    {word}
                </span>
            );
        });
    }, [verseText, isMobile]);

    useLayoutEffect(() => {
        const el = sectionRef.current;
        if (!el) return;

        const ctx = gsap.context(() => {
            const wordElements = el.querySelectorAll(`.${styles.verseWord}`);
            const staggerAmount = 0.08;
            const textDuration = 0.8;

            ScrollTrigger.create({
                trigger: el,
                start: 'top 70%',
                end: 'bottom 30%',
                onEnter: () => {
                    if (isMobile) {
                        gsap.fromTo(wordElements,
                            { opacity: 0.1, filter: 'blur(10px)' },
                            { opacity: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power1.out', overwrite: true }
                        );
                    } else {
                        gsap.fromTo(textRef.current,
                            { y: 100 },
                            { y: 0, ease: 'power2.out', duration: 1.5, overwrite: true }
                        );
                        gsap.fromTo(wordElements,
                            { opacity: 0.1, filter: 'blur(10px)' },
                            { opacity: 1, filter: 'blur(0px)', stagger: staggerAmount, duration: textDuration, ease: 'power1.out', overwrite: true }
                        );
                    }
                },
                onLeave: () => {
                    gsap.to(wordElements, { opacity: 0.1, filter: 'blur(10px)', duration: 0.4, overwrite: true });
                },
                onEnterBack: () => {
                    gsap.fromTo(wordElements,
                        { opacity: 0.1, filter: 'blur(10px)' },
                        { opacity: 1, filter: 'blur(0px)', stagger: isMobile ? 0 : staggerAmount, duration: textDuration, ease: 'power1.out', overwrite: true }
                    );
                },
                onLeaveBack: () => {
                    gsap.to(wordElements, { opacity: 0.1, filter: 'blur(10px)', duration: 0.4, overwrite: true });
                },
            });
        }, sectionRef);

        return () => ctx.revert();
    }, [isMobile]);

    return (
        <section ref={sectionRef} className={styles.verseScene}>
            <div className={styles.verseContainer}>
                <h2 ref={textRef} className={styles.verseText}>
                    {splitText}
                </h2>
            </div>
        </section>
    );
};

/* =========================================
   Scene 3: Our Story — 텍스트 + 포인트 이미지
   ========================================= */
const StoryScene = () => {
    return (
        <section className={styles.storyScene}>
            <div className={styles.storyGrid}>
                <div className={styles.storyTextCol}>
                    <BlurFade delay={0.2} inView>
                        <h2 className={styles.storyTitle}>
                            당신의 인생 여정에<br />함께 걷겠습니다.
                        </h2>
                    </BlurFade>
                    <BlurFade delay={0.35} inView>
                        <p className={styles.storyBody}>
                            신탄진침례교회는 말씀 위에 든든히 세워진 교회로서,
                            모든 세대가 그리스도 안에서 함께 성장하고
                            서로의 삶을 나누며 걸어가는 공동체입니다.
                            <br /><br />
                            처음 오시는 분들이 낯설지 않도록,
                            따뜻한 환영과 섬김으로 여러분을 맞이합니다.
                        </p>
                    </BlurFade>
                    <BlurFade delay={0.5} inView>
                        <SuitButton style={{ borderColor: 'var(--color-text-dark)', color: 'var(--color-text-dark)' }}>
                            비전 더 알아보기
                        </SuitButton>
                    </BlurFade>
                </div>
                <div /> {/* spacer col */}
                <div className={styles.storyImageCol}>
                    <BlurFade delay={0.3} inView>
                        <img
                            src={emmausPainting}
                            alt="엠마오로 가는 길"
                            className={styles.storyPainting}
                        />
                    </BlurFade>
                </div>
            </div>
        </section>
    );
};

/* =========================================
   Scene 4: Gathering — 캔버스 패닝
   ========================================= */
const GatheringScene = () => {
    const sceneRef = useRef(null);
    const paintingRef = useRef(null);
    const worshipCardRef = useRef(null);
    const nextgenCardRef = useRef(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 767);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useLayoutEffect(() => {
        const el = sceneRef.current;
        if (!el) return;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: el,
                    start: 'top top',
                    end: '+=250%',
                    pin: true,
                    scrub: 1,
                    anticipatePin: 1,
                },
            });

            // Hold initial view
            tl.to({}, { duration: 0.5 });

            // Pan from left to right
            tl.to(paintingRef.current, {
                x: '-20%',
                ease: 'none',
                duration: 2,
            });

            // Fade out worship card, fade in nextgen card
            tl.to(worshipCardRef.current, { opacity: 0, duration: 0.5 }, '<');
            tl.to(nextgenCardRef.current, { opacity: 1, duration: 0.5 }, '<0.5');

            // Hold final view
            tl.to({}, { duration: 0.3 });
        }, sceneRef);

        return () => ctx.revert();
    }, [isMobile]);

    return (
        <section ref={sceneRef} className={styles.gatheringScene}>
            <div className={styles.gatheringCanvasWrapper}>
                <img
                    ref={paintingRef}
                    src={gatheringPainting}
                    alt="Gathering Painting"
                    className={styles.gatheringPainting}
                />
            </div>
            <div className={styles.gatheringDarkOverlay} />
            <div className={styles.gatheringContent}>
                <BlurFade delay={0.2} inView>
                    <h2 className={styles.gatheringEngTitle}>The Gathering</h2>
                    <p className={styles.gatheringKorTitle}>
                        세대를 넘어,<br />진리가 선포되는 자리
                    </p>
                </BlurFade>

                <div className={styles.gatheringCards}>
                    <div ref={worshipCardRef} className={styles.glassCard}>
                        <p className={styles.glassCardLabel}>Worship</p>
                        <h3 className={styles.glassCardTitle}>예배 안내</h3>
                        <p className={styles.glassCardDesc}>
                            주일 오전 11시, 하나님의 말씀 앞에<br />
                            한마음으로 모여 예배드립니다.
                        </p>
                    </div>
                    <div ref={nextgenCardRef} className={styles.glassCard} style={{ opacity: 0 }}>
                        <p className={styles.glassCardLabel}>Next Generation</p>
                        <h3 className={styles.glassCardTitle}>다음 세대</h3>
                        <p className={styles.glassCardDesc}>
                            영아부부터 청년부까지,<br />
                            다음 세대를 향한 비전을 품고 섬깁니다.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

/* =========================================
   Scene 5: Sermon Shorts — iPhone 프레임
   ========================================= */
const SermonShortsScene = () => {
    const sectionRef = useRef(null);
    const phase1Ref = useRef(null);
    const phase2Ref = useRef(null);
    const [isMobile, setIsMobile] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useLayoutEffect(() => {
        const el = sectionRef.current;
        if (!el) return;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: el,
                    start: 'center center',
                    end: '+=250%',
                    pin: true,
                    scrub: true,
                    anticipatePin: 1,
                },
            });

            tl.to({}, { duration: 1 });
            tl.to(phase1Ref.current, { opacity: 0, duration: 1 });
            tl.to(phase2Ref.current, { autoAlpha: 1, duration: 1 });
            tl.to({}, { duration: 0.5 });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className={styles.shortsScene}>
            {/* Phase 1: iPhone + side texts */}
            <div ref={phase1Ref} className={styles.shortsPhase} style={{ flexDirection: isMobile ? 'column' : 'row' }}>
                <h2 className={styles.shortsSideText}>우리의 인생,</h2>
                <div className={styles.shortsPhoneWrapper}>
                    <div className={styles.shortsPhoneInner}>
                        <div className={styles.shortsScreen}>
                            <div style={{
                                position: 'absolute', inset: 0,
                                backgroundColor: '#000000',
                                zIndex: isPlaying ? 1 : 3,
                            }} />
                            <iframe
                                src={`https://www.youtube.com/embed/bQ8ybnIaKDY?controls=0&modestbranding=1&rel=0${isPlaying ? '&autoplay=1' : ''}`}
                                title="설교 쇼츠"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                                style={{
                                    position: 'absolute', inset: 0,
                                    width: '100%', height: '100%',
                                    display: 'block', zIndex: 2,
                                }}
                            />
                        </div>
                        {!isPlaying && (
                            <div className={styles.shortsPlayOverlay} onClick={() => setIsPlaying(true)}>
                                <img src={playBtnImg} alt="Play" className={styles.shortsPlayBtn} />
                            </div>
                        )}
                        <img src={iPhoneFrameImg} alt="iPhone Frame" className={styles.shortsPhoneFrame} />
                    </div>
                </div>
                <h2 className={styles.shortsSideText}>예수로부터.</h2>
            </div>

            {/* Phase 2: CTA */}
            <div ref={phase2Ref} className={`${styles.shortsPhase} ${styles.shortsPhase2}`}>
                <div className={styles.shortsPhase2Inner}>
                    <h2 className={styles.shortsPhase2Title}>
                        그 말씀이<br />당신의 삶을 변화시킵니다.
                    </h2>
                    <div className={styles.shortsButtonGroup}>
                        <SuitButton
                            onClick={() => window.open('https://www.youtube.com/@sbc6312', '_blank')}
                            style={{ borderColor: 'var(--color-text-dark)', color: 'var(--color-text-dark)' }}
                        >
                            이번 주 설교 보기
                        </SuitButton>
                        <SuitButton
                            onClick={() => window.open('https://www.youtube.com/@sbc6312', '_blank')}
                            style={{ borderColor: 'var(--color-text-dark)', color: 'var(--color-text-dark)' }}
                        >
                            유튜브 채널 가기
                        </SuitButton>
                    </div>
                </div>
            </div>
        </section>
    );
};

/* =========================================
   Scene 6: Life Together — 플랫 그리드
   ========================================= */
const LifeScene = () => {
    const cards = [
        { icon: '🤝', title: '코이노니아', desc: '소그룹 안에서 서로의 삶을 나누고, 기도로 하나 되는 따뜻한 공동체입니다.', link: '/koinonia' },
        { icon: '🌱', title: '지역봉사', desc: '교회 밖에서도 이웃을 섬기며, 그리스도의 사랑을 실천합니다.', link: '/outreach' },
        { icon: '🌏', title: '선교 · 봉사', desc: '국내외 선교를 통해 복음의 능력을 전하고 있습니다.', link: '/outreach' },
    ];

    return (
        <section className={styles.lifeScene}>
            <BlurFade delay={0.2} inView>
                <h2 className={styles.lifeTitle}>
                    교회 밖에서도<br />우리의 이야기는 계속됩니다.
                </h2>
            </BlurFade>
            <div className={styles.lifeGrid}>
                {cards.map((card, i) => (
                    <BlurFade key={i} delay={0.2 + i * 0.15} inView>
                        <div className={styles.lifeCard}>
                            <span className={styles.lifeIcon}>{card.icon}</span>
                            <h3 className={styles.lifeCardTitle}>{card.title}</h3>
                            <p className={styles.lifeCardDesc}>{card.desc}</p>
                            <SuitButton
                                style={{
                                    borderColor: 'var(--color-text-dark)',
                                    color: 'var(--color-text-dark)',
                                    marginTop: '12px',
                                }}
                            >
                                더보기 →
                            </SuitButton>
                        </div>
                    </BlurFade>
                ))}
            </div>
        </section>
    );
};

/* =========================================
   Scene 7: The Guides — 목회자 소개
   ========================================= */
const GuidesScene = () => {
    return (
        <section className={styles.guidesScene}>
            <div className={styles.guidesGrid}>
                <div className={styles.guidesImageCol}>
                    <BlurFade delay={0.2} inView>
                        <img
                            src={pastorPhoto}
                            alt="담임목사"
                            className={styles.guidesPhoto}
                        />
                    </BlurFade>
                </div>
                <div /> {/* spacer col */}
                <div className={styles.guidesTextCol}>
                    <BlurFade delay={0.3} inView>
                        <h2 className={styles.guidesEngTitle}>The Guides</h2>
                    </BlurFade>
                    <BlurFade delay={0.4} inView>
                        <p className={styles.guidesName}>
                            담임목사 · 이름
                        </p>
                    </BlurFade>
                    <BlurFade delay={0.5} inView>
                        <p className={styles.guidesGreeting}>
                            "말씀을 통해 삶이 변화되고,
                            그 변화된 삶으로 세상을 섬기는
                            건강한 교회를 꿈꿉니다.
                            신탄진침례교회에 오시는 모든 분들을
                            진심으로 환영합니다."
                        </p>
                    </BlurFade>
                    <BlurFade delay={0.6} inView>
                        <SuitButton style={{ borderColor: 'var(--color-text-dark)', color: 'var(--color-text-dark)' }}>
                            인사말 더 보기
                        </SuitButton>
                    </BlurFade>
                </div>
            </div>
        </section>
    );
};

/* =========================================
   Scene 8: Next Step — 캔버스 줌아웃 + CTA
   ========================================= */
const NextStepScene = () => {
    const sceneRef = useRef(null);
    const paintingRef = useRef(null);
    const contentRef = useRef(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 767);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useLayoutEffect(() => {
        const el = sceneRef.current;
        if (!el) return;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: el,
                    start: 'top top',
                    end: '+=200%',
                    pin: true,
                    scrub: 1,
                    anticipatePin: 1,
                },
            });

            // Zoom out from close-up
            tl.to(paintingRef.current, {
                scale: 1,
                x: '0%',
                y: '0%',
                ease: 'none',
                duration: 2,
            });

            // Fade in CTA content
            tl.to(contentRef.current, {
                opacity: 1,
                duration: 0.8,
            }, '<0.8');

            // Hold
            tl.to({}, { duration: 0.5 });
        }, sceneRef);

        return () => ctx.revert();
    }, [isMobile]);

    return (
        <section ref={sceneRef} className={styles.nextStepScene}>
            <div className={styles.nextStepCanvasWrapper}>
                <img
                    ref={paintingRef}
                    src={prodigalPainting}
                    alt="Next Step Painting"
                    className={styles.nextStepPainting}
                />
            </div>
            <div className={styles.nextStepDarkOverlay} />
            <div ref={contentRef} className={styles.nextStepContent}>
                <h2 className={styles.nextStepTitle}>
                    우리는 당신이 돌아오기를<br />늘 기다리고 있었습니다.
                </h2>
                <div className={styles.nextStepButtons}>
                    <SuitButton style={{
                        borderColor: 'var(--color-text-secondary)',
                        color: 'var(--color-text-secondary)',
                        '--suit-btn-hover-bg': 'var(--color-text-secondary)',
                        '--suit-btn-hover-border': 'var(--color-text-secondary)',
                        '--suit-btn-hover-text': 'var(--color-background-dark)',
                    }}>
                        예배 안내 보기
                    </SuitButton>
                    <SuitButton style={{
                        borderColor: 'var(--color-text-secondary)',
                        color: 'var(--color-text-secondary)',
                        '--suit-btn-hover-bg': 'var(--color-text-secondary)',
                        '--suit-btn-hover-border': 'var(--color-text-secondary)',
                        '--suit-btn-hover-text': 'var(--color-background-dark)',
                    }}>
                        오시는 길
                    </SuitButton>
                </div>
            </div>
        </section>
    );
};

/* =========================================
   Landing Page — 시안 페이지 (통합)
   ========================================= */
function LandingPage() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="app-wrapper" style={{ position: 'relative', backgroundColor: 'var(--color-background-dark)' }}>
            <HeroScene />
            <VerseScene />
            <StoryScene />
            <GatheringScene />
            <SermonShortsScene />
            <LifeScene />
            <GuidesScene />
            <NextStepScene />
            <Footer />
        </div>
    );
}

export default LandingPage;

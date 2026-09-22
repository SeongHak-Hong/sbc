import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

import styles from './HistoryPage.module.css';

// Dynamically import all images from the history folder
const imageModules = import.meta.glob('../assets/history/shintanjin-baptist-church-history-*.webp', { eager: true, import: 'default' });
const totalItems = Object.keys(imageModules).length;

const historyData = Object.entries(imageModules)
    .sort(([pathA], [pathB]) => pathA.localeCompare(pathB)) // Ensure sequence order
    .map(([path, url], index) => {
        return {
            id: `history-${index}`,
            year: 1980 + Math.round((index / Math.max(1, totalItems - 1)) * 20),
            title: `교회발자취 ${index + 1}`,
            image: url
        };
    });

const HistoryPage = () => {
    const containerRef = useRef(null);
    const galleryRef = useRef(null);
    const scrollerRef = useRef(null);
    const [scrollRange, setScrollRange] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    
    useEffect(() => {
        window.scrollTo(0, 0);
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Measure the exact width of the horizontal content to calculate the negative scroll limit
    useLayoutEffect(() => {
        const updateRange = () => {
            if (galleryRef.current) {
                const range = galleryRef.current.scrollWidth - window.innerWidth;
                setScrollRange(range > 0 ? range : 0);
            }
        };
        updateRange();
        window.addEventListener('resize', updateRange);
        return () => window.removeEventListener('resize', updateRange);
    }, []);

    // Track vertical scroll progress of the tall container (Desktop)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Track horizontal scroll progress of the native scroller (Mobile)
    const { scrollXProgress } = useScroll({
        container: scrollerRef
    });

    const activeProgress = isMobile ? scrollXProgress : scrollYProgress;

    // Apply spring physics to the scroll progress itself to eliminate any stuttering or jitter
    const smoothProgress = useSpring(activeProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    // Translate horizontal scroll explicitly by negative pixels (bulletproof for Framer Motion)
    const x = useTransform(smoothProgress, [0, 1], [0, -scrollRange]);

    // Dynamic Year calculation based on smoothed progress
    const startYear = historyData[0].year;
    const endYear = historyData[historyData.length - 1].year;
    const rawYear = useTransform(smoothProgress, [0, 1], [startYear, endYear]);
    const currentYear = useTransform(rawYear, (latest) => Math.round(latest));

    // Cross-fade animations for ending transition
    const galleryOpacity = useTransform(smoothProgress, [0.85, 0.95], [1, 0]);
    const galleryBlur = useTransform(smoothProgress, [0.85, 0.95], ['blur(0px)', 'blur(10px)']);
    const ctaOpacity = useTransform(smoothProgress, [0.9, 1], [0, 1]);
    const ctaBlur = useTransform(smoothProgress, [0.9, 1], ['blur(10px)', 'blur(0px)']);
    const ctaPointerEvents = useTransform(smoothProgress, (v) => v > 0.9 ? 'auto' : 'none');
    // Calculate dynamic height to match 1:1 scroll ratio (Desktop only)
    const scrollHeight = (!isMobile && scrollRange > 0) ? `${scrollRange + window.innerHeight}px` : '100vh';

    return (
        <div ref={containerRef} style={{ height: scrollHeight, position: 'relative' }}>
            <div className={styles.pageWrapper}>
                <motion.div style={{ opacity: galleryOpacity, filter: galleryBlur, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <main ref={scrollerRef} className={styles.scroller}>
                    <motion.div ref={galleryRef} style={{ x: isMobile ? 0 : x }} className={styles.galleryContainer}>
                        {historyData.map((item, index) => (
                            <motion.article 
                                key={item.id} 
                                className={styles.artwork}
                                initial={{ opacity: 0, y: index % 2 === 0 ? 24 : -24 }}
                                whileInView={{ opacity: 1, y: index % 2 === 0 ? 24 : -24 }}
                                viewport={{ once: true, margin: "0px -10% 0px -10%" }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            >
                                <div className={styles.imageWrapper}>
                                    <div className={styles.photoFrame} style={{ aspectRatio: '4/3' }}>
                                        <img src={item.image} alt={item.title} />
                                    </div>
                                </div>
                            </motion.article>
                        ))}

                        {/* Padding for center alignment at the end */}
                        <div style={{ width: '50vw', flexShrink: 0 }}></div>
                    </motion.div>
                </main>

                <div className={styles.timelineIndicator}>
                    <motion.span className={styles.year}>{currentYear}</motion.span>
                    <div className={styles.dash}></div>
                    <span className={styles.year} style={{ opacity: 0.3 }}>2000</span>
                </div>

                <div className={styles.scrollHint}>아래로 스크롤하여 넘겨보기</div>
                </motion.div>

                {/* CTA Overlay section */}
                <motion.div 
                    className={styles.ctaOverlay}
                    style={{ opacity: ctaOpacity, filter: ctaBlur, pointerEvents: ctaPointerEvents }}
                >
                    <div style={{ textAlign: 'center' }}>
                        <h2 className={styles.ctaTitleText}>
                            흑백 사진 속 따뜻한 사랑은 지금도 흐르고 있습니다.<br />
                            신탄진교회의 다정한 '오늘'을 인스타그램에서 만나보세요.
                        </h2>
                    </div>
                    <button 
                        className={styles.ctaButton}
                        onClick={() => window.open('https://www.instagram.com/ds3jhb2026/', '_blank')}
                    >
                        인스타그램 놀러 가기
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default HistoryPage;

import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import PretendardButton from '../components/ui/PretendardButton';

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
    const [scrollRange, setScrollRange] = useState(0);
    
    useEffect(() => {
        window.scrollTo(0, 0);
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

    // Track vertical scroll progress of the tall container
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Apply spring physics to the scroll progress itself to eliminate any stuttering or jitter
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    // Translate horizontal scroll explicitly by negative pixels (bulletproof for Framer Motion)
    const x = useTransform(smoothProgress, [0, 1], [0, -scrollRange]);

    // Dynamic Year calculation based on smoothed progress
    const startYear = historyData[0].year;
    const endYear = historyData[historyData.length - 1].year;
    const rawYear = useTransform(smoothProgress, [0, 1], [startYear, endYear]);
    const currentYear = useTransform(rawYear, (latest) => Math.round(latest));

    // Calculate dynamic height to match 1:1 scroll ratio
    const scrollHeight = scrollRange > 0 ? `${scrollRange + window.innerHeight}px` : '100vh';

    return (
        <div ref={containerRef} style={{ height: scrollHeight, position: 'relative' }}>
            <div className={styles.pageWrapper}>



                <main className={styles.scroller}>
                    <motion.div ref={galleryRef} style={{ x }} className={styles.galleryContainer}>
                        {historyData.map((item, index) => (
                            <motion.article 
                                key={item.id} 
                                className={styles.artwork}
                                initial={{ opacity: 0, y: index % 2 === 0 ? 100 : -100 }}
                                whileInView={{ opacity: 1, y: index % 2 === 0 ? 60 : -60 }}
                                viewport={{ once: true, margin: "0px -10% 0px -10%" }}
                                transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                            >
                                <div className={styles.imageWrapper}>
                                    <div className={styles.photoFrame} style={{ aspectRatio: '4/3' }}>
                                        <img src={item.image} alt={item.title} />
                                    </div>
                                </div>
                            </motion.article>
                        ))}

                        {/* CTA Section */}
                        <motion.article 
                            className={styles.ctaCard}
                            initial={{ opacity: 0, scale: 0.9, y: 0 }}
                            whileInView={{ opacity: 1, scale: 1, y: 0 }}
                            viewport={{ once: true, margin: "0px -10% 0px -10%" }}
                            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                        >
                            <p>
                                흑백 사진 속 따뜻한 사랑은<br />
                                지금도 흐르고 있습니다.<br />
                                신탄진교회의 다정한 '오늘'을<br />
                                인스타그램에서 만나보세요.
                            </p>
                            <PretendardButton 
                                style={{ color: 'var(--color-text-dark)' }}
                            >
                                인스타그램 놀러 가기
                            </PretendardButton>
                        </motion.article>
                    </motion.div>
                </main>

                <div className={styles.timelineIndicator}>
                    <motion.span className={styles.year}>{currentYear}</motion.span>
                    <div className={styles.dash}></div>
                    <span className={styles.year} style={{ opacity: 0.3 }}>2000</span>
                </div>

                <div className={styles.scrollHint}>아래로 스크롤하여 넘겨보기</div>
            </div>
        </div>
    );
};

export default HistoryPage;

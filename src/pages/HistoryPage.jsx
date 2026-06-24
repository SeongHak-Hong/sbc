import React, { useRef, useState, useLayoutEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import SubNav from '../components/SubNav';
import styles from './HistoryPage.module.css';
import CloudBackground from '../components/CloudBackground';
import BalloonBackground from '../components/BalloonBackground';

// Dynamically import all images from the history folder
const imageModules = import.meta.glob('../assets/history/shintanjin-baptist-church-history-*.jpg', { eager: true, import: 'default' });
const totalItems = Object.keys(imageModules).length;

const historyData = Object.entries(imageModules)
    .sort(([pathA], [pathB]) => pathA.localeCompare(pathB)) // Ensure sequence order
    .map(([path, url], index) => {
        const colors = ['#FDCBDE', '#FDF1B6', '#D2F0E0', '#B0DCEE'];
        const tapeColor = colors[index % colors.length];
        
        // Slightly random rotations to maintain the scrapbook feel
        const cardRots = ['-3deg', '2deg', '-1deg', '4deg', '-2deg'];
        const tapeRots = ['-4deg', '3deg', '-8deg', '12deg', '5deg'];
        
        return {
            id: `history-${index}`,
            year: 1980 + Math.round((index / Math.max(1, totalItems - 1)) * 20), // Interpolate from 1980 to 2000
            title: `교회발자취 ${index + 1}`, // Placeholder title
            image: url,
            tapeColor: tapeColor,
            tapeRot: tapeRots[index % tapeRots.length],
            tapeX: '-50%',
            tapeY: '-12px',
            cardRot: cardRots[index % cardRots.length]
        };
    });

const HistoryPage = () => {
    const containerRef = useRef(null);
    const galleryRef = useRef(null);
    const [scrollRange, setScrollRange] = useState(0);
    
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
        <div ref={containerRef} style={{ height: scrollHeight, position: 'relative', backgroundColor: 'transparent' }}>
            <div className={styles.pageWrapper}>
                <CloudBackground heightMode="vh" />

                <SubNav />

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
                                <motion.div 
                                    className={styles.polaroid} 
                                    style={{ transform: `rotate(${item.cardRot})` }}
                                    whileHover={{ scale: 1.05, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                >
                                    <div 
                                        className={`${styles.tape} ${styles.tapeTexture}`} 
                                        style={{ 
                                            top: 0, 
                                            left: '50%', 
                                            transform: `translate(${item.tapeX}, ${item.tapeY}) rotate(${item.tapeRot})`, 
                                            width: '112px', 
                                            height: '32px', 
                                            backgroundColor: item.tapeColor 
                                        }}
                                    ></div>
                                    <div className={styles.photoFrame} style={{ aspectRatio: '4/3' }}>
                                        <img src={item.image} alt={item.title} />
                                    </div>
                                    {/* photoText removed as requested */}
                                </motion.div>
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
                                옛날 사진첩은 여기까지!<br />
                                흑백 사진 속 따뜻한 사랑은 지금도 멈추지 않고 흐르고 있어요.<br />
                                신탄진교회의 가장 생생하고 다정한 '오늘'의 이야기를 인스타그램에서 만나보세요.
                            </p>
                            <motion.button 
                                className={styles.ctaButton}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400 }}
                            >
                                인스타그램 놀러 가기
                            </motion.button>
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

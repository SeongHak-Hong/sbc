import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BlurFade } from './ui/BlurFade';

import instaCharactersImg from '../assets/main/shintanjin-baptist-church-instagram-characters.webp';

// Import styles from HistoryPage to reuse the Polaroid design
import styles from '../pages/HistoryPage.module.css';

gsap.registerPlugin(ScrollTrigger);

// Dynamically import 10 images from the history folder
const imageModules = import.meta.glob('../assets/history/shintanjin-baptist-church-history-*.webp', { eager: true, import: 'default' });
const totalItems = Object.keys(imageModules).length;
const historyImages = Object.entries(imageModules)
    .sort(([pathA], [pathB]) => pathA.localeCompare(pathB))
    .slice(0, 10) // Limit to 10 images
    .map(([path, url], index) => {
        const colors = ['#FDCBDE', '#FDF1B6', '#D2F0E0', '#B0DCEE'];
        const tapeColor = colors[index % colors.length];
        const cardRots = ['-3deg', '2deg', '-1deg', '4deg', '-2deg'];
        const tapeRots = ['-4deg', '3deg', '-8deg', '12deg', '5deg'];
        
        return {
            id: `history-${index}`,
            image: url,
            tapeColor: tapeColor,
            tapeRot: tapeRots[index % tapeRots.length],
            tapeX: '-50%',
            tapeY: '-12px',
            cardRot: cardRots[index % cardRots.length]
        };
    });

const GallerySection = () => {
    const sectionRef = useRef(null);
    const trackRef = useRef(null);
    const titleRef = useRef(null);
    const foregroundRef = useRef(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useLayoutEffect(() => {
        const el = sectionRef.current;
        if (!el || !trackRef.current || !titleRef.current || !foregroundRef.current) return;

        let ctx = gsap.context(() => {
            const trackWidth = trackRef.current.scrollWidth;
            
            // Calculate a longer scroll distance to accommodate the title sequence
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: el,
                    start: 'center center',
                    end: `+=${trackWidth + window.innerHeight}`, // Extra distance for the sequence
                    pin: true,
                    scrub: 0.5, // Reduced from 1 for better performance/responsiveness
                    anticipatePin: 1
                }
            });

            // 1. Title Fades In
            tl.to(titleRef.current, { opacity: 1, duration: 0.2, force3D: true });

            // 2. Hold Title briefly
            tl.to({}, { duration: 0.2 });

            // 3. Title Fades Out
            tl.to(titleRef.current, { opacity: 0, duration: 0.2, force3D: true });

            // 4. Foreground Image Fades In & Track Slides
            // Track left is at 100%, we move it by -trackWidth to align its right edge with the screen's right edge
            tl.to(foregroundRef.current, { opacity: 1, duration: 0.5, force3D: true });
            tl.to(trackRef.current, {
                x: -trackWidth,
                duration: 4,
                ease: "none",
                force3D: true
            }, "<"); // Run at the same time as foreground image fade-in

            // 5. Final hold
            tl.to({}, { duration: 0.2 });
            
        }, sectionRef);

        return () => ctx.revert();
    }, [isMobile, historyImages.length]);

    const sectionStyle = {
        position: 'relative',
        width: '100%',
        height: '100vh',
        color: '#fff',
        overflow: 'hidden',
        boxSizing: 'border-box'
    };

    const buttonStyle = {
        color: '#fff',
        marginTop: '60px',
        position: 'relative',
        zIndex: 20
    };

    return (
        <section ref={sectionRef} style={sectionStyle}>
            {/* --- TITLE (Lowest Z-Index) --- */}
            <div ref={titleRef} style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none', opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <h2 style={{ color: '#ffffff', margin: 0, textAlign: 'center' }}>함께 걷고,<br />함께 웃습니다.</h2>
            </div>

            {/* --- LAYER 2: HORIZONTAL SCROLL GALLERY TRACK (Middle Z-Index) --- */}
            <div 
                ref={trackRef} 
                className={styles.galleryContainer} 
                style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: '100%', 
                    height: '100%', 
                    zIndex: 20,
                    margin: 0 // Reset any margins from HistoryPage if needed
                }}
            >
                {historyImages.map((item, index) => (
                    <article key={item.id} className={styles.artwork}>
                        <div 
                            className={styles.polaroid} 
                            style={{ transform: `rotate(${item.cardRot})` }}
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
                                <img src={item.image} alt="History" />
                            </div>
                        </div>
                    </article>
                ))}

                {/* Optional ending CTA if needed inside the track */}
                <article style={{ width: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <motion.button
                        style={{ ...buttonStyle, pointerEvents: 'auto' }}
                        whileHover={{ scale: 1.05 }}
                    >
                        더 많은 우리 보기
                    </motion.button>
                </article>
            </div>

            {/* --- LAYER 3: FOREGROUND IMAGES (Highest Z-Index) --- */}
            <div ref={foregroundRef} style={{
                position: 'absolute',
                bottom: '0%',
                right: '-3%',
                display: 'flex',
                alignItems: 'flex-end',
                zIndex: 30, // Highest Z-Index so it covers the track
                pointerEvents: 'none', // Prevent blocking clicks to the gallery if needed
                opacity: 0 // Hidden initially, GSAP will fade it in
            }}>
                <img
                    src={instaCharactersImg}
                    style={{ width: isMobile ? '70vw' : 'auto', maxHeight: '360px', transform: 'rotate(-7deg)' }}
                    alt="Characters"
                />
            </div>
        </section>
    );
};

export default GallerySection;

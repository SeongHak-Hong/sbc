import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import iPhoneFrameImg from '../assets/main/iPhone-14-Pro.webp';
import iPhoneBgImg from '../assets/main/iPhone-14-Pro-scene-bg.webp';
import playBtnImg from '../assets/main/Youtube-shorts-icon.webp';

gsap.registerPlugin(ScrollTrigger);

const YoutubeSection = () => {
    const sectionRef = useRef(null);
    const part1Ref = useRef(null);
    const part2Ref = useRef(null);
    const [isMobile, setIsMobile] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useLayoutEffect(() => {
        const el = sectionRef.current;
        if (!el) return;

        let ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: el,
                    start: 'center center',
                    end: '+=250%', // Increased to accommodate the initial hold
                    pin: true,
                    scrub: true,
                    anticipatePin: 1
                }
            });

            // Initial buffer to hold the view for a moment before fading
            tl.to({}, { duration: 1 });

            // 1. Fade out Part 1 (iPhone + side texts)
            tl.to(part1Ref.current, { opacity: 0, duration: 1 });
            
            // 2. Fade in Part 2 (New title + button)
            tl.to(part2Ref.current, { autoAlpha: 1, duration: 1 });
            
            // Buffer to hold the final state slightly before unpinning
            tl.to({}, { duration: 0.5 });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const containerStyle = {
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        boxSizing: 'border-box',
        zIndex: 20,
        overflow: 'hidden'
    };

    const innerContentStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        padding: '80px 20px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '40px' : '80px',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10
    };

    const sideTextStyle = {
        fontSize: isMobile ? 'var(--text-h3)' : 'var(--text-h2)',
        color: '#ffffff',
        margin: 0,
        whiteSpace: 'nowrap',
        zIndex: 10,
        textAlign: 'center'
    };

    return (
        <section ref={sectionRef} style={containerStyle}>
            {/* Part 1: iPhone & Side Texts */}
            <div ref={part1Ref} style={innerContentStyle}>
                {/* Left Text */}
                <h2 style={sideTextStyle}>
                    우리의 인생,
                </h2>

                {/* iPhone Frame */}
                <div style={{ height: isMobile ? 'auto' : '100%', display: 'flex', justifyContent: 'center', zIndex: 10 }}>
                    <div
                        style={{
                            position: 'relative',
                            flexShrink: 0,
                            width: isMobile ? '55%' : 'auto', // Reduce size on mobile so titles fit
                            maxWidth: isMobile ? '300px' : 'none',
                            height: isMobile ? 'auto' : '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        {/* Background Scene */}
                        <img 
                            src={iPhoneBgImg} 
                            alt="" 
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                zIndex: 1
                            }}
                        />

                        {/* YouTube Video */}
                        <div style={{
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '88%',
                            aspectRatio: '9 / 16',
                            zIndex: 2,
                            borderRadius: '24px',
                            overflow: 'hidden'
                        }}>
                            {!isPlaying && (
                                <div 
                                    onClick={() => setIsPlaying(true)}
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        zIndex: 10,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        backgroundColor: 'rgba(0,0,0,0.1)'
                                    }}
                                >
                                    <img 
                                        src={playBtnImg} 
                                        alt="Play Shorts" 
                                        style={{ width: isMobile ? '45px' : '80px', height: 'auto', transition: 'transform 0.2s' }} 
                                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                                    />
                                </div>
                            )}
                            <iframe
                                src={`https://www.youtube.com/embed/bQ8ybnIaKDY?controls=0&modestbranding=1&rel=0${isPlaying ? '&autoplay=1' : ''}`}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                                style={{ 
                                    position: 'absolute',
                                    top: '0',
                                    left: '0',
                                    width: '100%', 
                                    height: '100%',
                                    display: 'block'
                                }}
                            ></iframe>
                        </div>

                        {/* iPhone Frame */}
                        <img 
                            src={iPhoneFrameImg} 
                            alt="iPhone Frame" 
                            style={{
                                position: 'relative',
                                width: isMobile ? '100%' : 'auto',
                                height: isMobile ? 'auto' : '100%',
                                zIndex: 3,
                                pointerEvents: 'none',
                                display: 'block'
                            }}
                        />
                    </div>
                </div>

                {/* Right Text */}
                <h2 style={sideTextStyle}>
                    예수로부터.
                </h2>
            </div>

            {/* Part 2: New Content (Fades in) */}
            <div ref={part2Ref} style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: isMobile ? 'center' : 'center', // Center it overall, adjust if you need left align
                opacity: 0, // Hidden initially
                visibility: 'hidden', // Crucial for disabling pointer-events of the inner div before fade in
                zIndex: 20,
                padding: '0 20px',
                boxSizing: 'border-box',
                pointerEvents: 'none' // Prevent blocking clicks to the iPhone underneath
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 'var(--max-width)', pointerEvents: 'auto' }}>
                    <h2 style={{
                        marginBottom: '20px',
                        color: '#ffffff',
                        textAlign: 'center',
                        whiteSpace: 'pre-line' // To allow <br /> to work naturally
                    }}>
                        그 말씀이<br />당신의 삶을 변화시킵니다.
                    </h2>
                    <a href="https://www.youtube.com/@sbc6312" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                        <motion.button
                            style={{
                                color: '#fff',
                                marginTop: '20px'
                            }}
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                            유튜브 채널 가기
                        </motion.button>
                    </a>
                </div>
            </div>
        </section>
    );
};

export default YoutubeSection;

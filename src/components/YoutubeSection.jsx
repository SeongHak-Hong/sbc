import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import iPhoneFrameImg from '../assets/main/iPhone-14-Pro.webp';
import playBtnImg from '../assets/main/Youtube-shorts-icon.webp';
import LargeButton from './ui/LargeButton';

gsap.registerPlugin(ScrollTrigger);

const YoutubeSection = () => {
    const sectionRef = useRef(null);
    const part1Ref = useRef(null);
    const part2Ref = useRef(null);
    const [isMobile, setIsMobile] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [videoId, setVideoId] = useState('bQ8ybnIaKDY'); // Fallback video ID

    useEffect(() => {
        const fetchLatestShorts = async () => {
            const cacheKey = 'sbc_latest_shorts_id';
            const cacheTimeKey = 'sbc_latest_shorts_time';
            const cacheDuration = 1 * 60 * 60 * 1000; // 1 hour
            
            const cachedId = localStorage.getItem(cacheKey);
            const cachedTime = localStorage.getItem(cacheTimeKey);
            const now = new Date().getTime();

            if (cachedId && cachedTime && (now - parseInt(cachedTime, 10)) < cacheDuration) {
                setVideoId(cachedId);
                return;
            }

            try {
                const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
                if (!apiKey) {
                    console.warn("YouTube API Key is missing. Using fallback video.");
                    return;
                }
                const channelId = 'UCj3wg1t2u2eiMQxWIgT2OeQ';
                // Using videoDuration=short to filter for Shorts
                const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=1&order=date&type=video&videoDuration=short&key=${apiKey}`;
                
                const response = await fetch(url);
                const data = await response.json();

                if (data.items && data.items.length > 0) {
                    const newVideoId = data.items[0].id.videoId;
                    setVideoId(newVideoId);
                    localStorage.setItem(cacheKey, newVideoId);
                    localStorage.setItem(cacheTimeKey, now.toString());
                }
            } catch (error) {
                console.error("Failed to fetch latest YouTube Shorts:", error);
            }
        };

        fetchLatestShorts();
    }, []);

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
        overflow: 'hidden',
        backgroundColor: 'var(--color-white)' // Changed background color as requested
    };

    const innerContentStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        padding: '180px 20px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '32px' : '32px', // Gap set to 32px
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10
    };

    const sideTextStyle = {
        fontFamily: 'var(--font-yuhan)',
        fontWeight: 500,
        fontSize: isMobile ? '24px' : '40px',
        lineHeight: 1.6,
        letterSpacing: '0.02em',
        color: 'var(--color-text-dark)',
        margin: 0,
        whiteSpace: 'nowrap',
        zIndex: 10,
        textAlign: 'center',
        wordBreak: 'keep-all'
    };

    return (
        <section ref={sectionRef} style={containerStyle}>
            {/* Part 1: iPhone & Side Texts */}
            <div ref={part1Ref} style={innerContentStyle}>
                {/* Left Text */}
                <h2 style={sideTextStyle}>
                    우리의 인생,
                </h2>

                {/* iPhone Frame Container */}
                <div style={{ height: '100%', display: 'flex', justifyContent: 'center', zIndex: 10 }}>
                    <div
                        style={{
                            position: 'relative',
                            flexShrink: 0,
                            height: '100%', // Scale to available height
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        {/* iPhone Screen Container (Groups Cover and Iframe) */}
                        <div style={{
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '98%',
                            height: '98%',
                            zIndex: 2,
                            /* 
                                iPhone 비율(9:19.5)에 맞춰 
                                가로(17.8%)와 세로(8.2%)를 다르게 주면 완벽한 원형을 유지하며 
                                크기에 따라 비율로 무한정 늘어나고 줄어듭니다.
                            */
                            borderRadius: '17.8% / 8.2%', 
                            overflow: 'hidden',
                            backgroundColor: '#000'
                        }}>
                            {/* Black Cover (Replaces SVG) */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                backgroundColor: '#000000',
                                zIndex: isPlaying ? 1 : 3
                            }}></div>

                            {/* YouTube Video */}
                            <iframe
                                src={`https://www.youtube.com/embed/${videoId}?controls=0&modestbranding=1&rel=0${isPlaying ? '&autoplay=1' : ''}`}
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
                                    display: 'block',
                                    zIndex: 2
                                }}
                            ></iframe>
                        </div>

                        {/* Play Button Overlay */}
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
                                    cursor: 'pointer'
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

                        {/* iPhone Frame */}
                        <img 
                            src={iPhoneFrameImg} 
                            alt="iPhone Frame" 
                            style={{
                                position: 'relative',
                                height: '100%', // Take full height of wrapper
                                width: 'auto', // Maintain aspect ratio
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
                padding: isMobile ? '0 24px' : '0 48px',
                boxSizing: 'border-box',
                pointerEvents: 'none' // Prevent blocking clicks to the iPhone underneath
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 'var(--max-width)', pointerEvents: 'auto' }}>
                    <h2 style={{
                        fontFamily: 'var(--font-yuhan)',
                        fontWeight: 500,
                        fontSize: isMobile ? '24px' : '40px',
                        lineHeight: 1.6,
                        letterSpacing: '0.02em',
                        marginBottom: isMobile ? '24px' : '48px',
                        color: 'var(--color-text-dark)',
                        textAlign: 'center',
                        whiteSpace: 'pre-line',
                        wordBreak: 'keep-all'
                    }}>
                        그 말씀이<br />당신의 삶을 변화시킵니다.
                    </h2>
                    <LargeButton 
                        onClick={() => window.open('https://www.youtube.com/@sbc6312', '_blank')}
                    >
                        유튜브 채널 가기
                    </LargeButton>
                </div>
            </div>
        </section>
    );
};

export default YoutubeSection;

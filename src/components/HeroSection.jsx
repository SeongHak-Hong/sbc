import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import LightRays from './LightRays';
import { BlurFade } from './ui/BlurFade';
import heroVideo from '../assets/main/shintanjin-baptist-church-hero-bg.mp4';

const HeroSection = () => {
    const [isMobile, setIsMobile] = useState(false);
    const { scrollY } = useScroll();

    // Parallax effects for the text (moves upwards)
    const textY = useTransform(scrollY, [0, 1000], [0, -200]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 767);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const sectionStyle = {
        position: 'sticky', // Changed from relative to sticky for curtain effect
        top: 0,
        zIndex: 0,
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: isMobile ? 'flex-start' : 'center',
        alignItems: 'flex-start', // Align left
        textAlign: 'left', // Align text left
        padding: isMobile ? '96px 24px' : '96px 48px',
        boxSizing: 'border-box',
        overflow: 'hidden'
    };

    // Typography Setup
    const englishTitleStyle = {
        fontFamily: '"Playfair Display", serif',
        fontSize: isMobile ? '72px' : '160px',
        color: '#F4EEE2',
        margin: 0,
        letterSpacing: '-0.02em',
        lineHeight: 1.2
    };

    const koreanSubStyle = {
        paddingLeft: isMobile ? '16px' : '24px',
        fontSize: isMobile ? '20px' : 'var(--text-h4)',
        color: '#F4EEE2',
        opacity: 0.75,
        margin: 0,
        marginTop: '8px'
    };

    const raysContainerStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '150vh',
        pointerEvents: 'none',
        zIndex: 1,
        mixBlendMode: 'plus-lighter'
    };

    return (
        <section style={sectionStyle}>
            {/* Background Video */}
            <video
                autoPlay
                loop
                muted
                playsInline
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    zIndex: 0
                }}
            >
                <source src={heroVideo} type="video/mp4" />
            </video>

            {/* Gradient Overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: isMobile
                    ? 'linear-gradient(to right, rgba(44, 35, 25, 0.7) 0%, rgba(44, 35, 25, 0) 100%)'
                    : 'linear-gradient(to right, rgba(44, 35, 25, 0.8) 0%, rgba(44, 35, 25, 0) 50%)',
                zIndex: 1
            }} />

            {/* Background Rays */}
            <div style={{ ...raysContainerStyle, zIndex: 2 }}>
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
                    className="custom-rays"
                />
            </div>

            {/* Text Content Wrapper with Parallax */}
            <motion.div style={{ position: 'relative', zIndex: 20, y: isMobile ? 0 : textY, width: '100%', paddingTop: isMobile ? '32px' : '0' }}>
                <BlurFade delay={0.25} inView>
                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                            <h1 style={englishTitleStyle}>
                                The Living
                            </h1>
                            <h1 style={{ ...englishTitleStyle, textAlign: 'right' }}>
                                Word
                            </h1>
                        </div>
                        <p style={koreanSubStyle}>
                            말씀 위에 든든히 세워진 교회
                        </p>
                    </div>
                </BlurFade>
            </motion.div>
        </section>
    );
};

export default HeroSection;

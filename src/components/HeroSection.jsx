import React, { useState, useEffect } from 'react';
import LightRays from './LightRays';
import { BlurFade } from './ui/BlurFade';
import heroVideo from '../assets/main/shintanjin-baptist-church-hero-bg.mp4';

const HeroSection = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 767);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const sectionStyle = {
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center', // Changed to center as requested
        alignItems: 'flex-start', // Align left
        textAlign: 'left', // Align text left
        padding: isMobile ? '96px 24px' : '96px 48px',
        boxSizing: 'border-box',
        overflow: 'hidden'
    };

    // Typography Setup
    const sloganStyle = {
        position: 'relative',
        fontFamily: 'LXGWWenKaiMonoKR, sans-serif',
        fontWeight: 400, // regular
        fontSize: isMobile ? '32px' : 'var(--pc-text-h1)', // 32px on mobile, 64px on PC
        color: '#ffffff',
        lineHeight: '1.6', // 160%
        letterSpacing: '-0.1em', // -10%
        marginBottom: '0', 
        zIndex: 10
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

            {/* Text Content Wrapper */}
            <div style={{ position: 'relative', zIndex: 20 }}>
                <BlurFade delay={0.25} inView>
                    <h1 style={sloganStyle}>
                        말씀 위에 든든히<br />세워지는 교회
                    </h1>
                </BlurFade>
            </div>
        </section>
    );
};

export default HeroSection;

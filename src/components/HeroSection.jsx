import React from 'react';
import LightRays from './LightRays';
import { BlurFade } from './ui/BlurFade';

const HeroSection = () => {
    const sectionStyle = {
        position: 'relative',
        width: '100%',
        height: '100vh',
        background: 'linear-gradient(to bottom, rgba(0, 83, 148, 0.5) 0%, rgba(0, 83, 148, 0) 100%)', // 50% opacity start
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '96px 48px',
        boxSizing: 'border-box'
        // overflow: 'hidden' removed per request
    };

    // Typography Setup
    const visionStyle = {
        fontFamily: 'MemomentKkukkukk, sans-serif',
        fontSize: '40px',
        color: '#ffffff',
        lineHeight: '120%',
        letterSpacing: '-0.02em',
        marginBottom: '24px', // Gap to slogan
        position: 'relative',
        zIndex: 10
    };

    const sloganStyle = {
        position: 'relative',
        fontFamily: 'MemomentKkukkukk, sans-serif',
        // fontWeight: 700, // Removed per request
        fontSize: '116px', // Updated to 116px
        color: '#ffffff',
        lineHeight: '1.2',
        marginBottom: '0', // No bottom margin needed if verse is gone
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
        mixBlendMode: 'screen'
    };

    return (
        <section style={sectionStyle}>
            {/* Background Rays */}
            <div style={raysContainerStyle}>
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
                {/* 2026 VISION */}
                <BlurFade delay={0.1} inView>
                    <div style={visionStyle}>2026 VISION</div>
                </BlurFade>

                <BlurFade delay={0.25} inView>
                    <h1 style={sloganStyle}>
                        말씀 위에 든든히<br />
                        세워지는 교회
                    </h1>
                </BlurFade>
            </div>
        </section>
    );
};

export default HeroSection;

import React, { useState, useEffect } from 'react';
import { BlurFade } from './ui/BlurFade';
import PretendardButton from './ui/PretendardButton';

const PrayerSection = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 767);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const sectionStyle = {
        padding: 'var(--section-padding-y) 0',
        textAlign: 'center',
        color: '#fff',
        minHeight: '100vh', // Requested 100vh height including padding
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F6F9'
    };

    const titleStyle = {
        fontFamily: 'LXGWWenKaiMonoKR, sans-serif',
        fontSize: '48px',
        fontWeight: 400,
        lineHeight: '1.6',
        letterSpacing: '-0.1em',
        color: '#1D1A1C',
        marginBottom: '64px', // Standardized gap
        textAlign: 'center',
        padding: isMobile ? '0 24px' : '0 48px',
        boxSizing: 'border-box'
    };

    const buttonStyle = {
        borderColor: '#1D1A1C',
        color: '#1D1A1C',
    };

    return (
        <section style={sectionStyle}>
            <BlurFade delay={0.25} inView>
                <h2 style={titleStyle}>기쁨은 더하고, 슬픔은 나누며.</h2>
            </BlurFade>
            <BlurFade delay={0.4} inView>
                <PretendardButton style={buttonStyle}>
                    성도 소식 함께하기
                </PretendardButton>
            </BlurFade>
        </section>
    );
};

export default PrayerSection;

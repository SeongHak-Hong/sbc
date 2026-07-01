import React, { useState, useEffect } from 'react';
import { BlurFade } from './ui/BlurFade';
import SuitButton from './ui/SuitButton';
import { useNavigate } from 'react-router-dom';

const PrayerSection = () => {
    const [isMobile, setIsMobile] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 767);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const sectionStyle = {
        position: 'relative',
        zIndex: 10,
        padding: 'var(--section-padding-y) 0',
        textAlign: 'center',
        color: 'var(--color-white)',
        minHeight: '100vh', // Requested 100vh height including padding
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'var(--color-white)'
    };

    const titleStyle = {
        fontSize: isMobile ? '32px' : '48px',
        
        
        
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
                <h2 style={titleStyle}>기쁨은 더하고,{isMobile ? <br /> : ' '}슬픔은 나누며.</h2>
            </BlurFade>
            <BlurFade delay={0.4} inView>
                <SuitButton style={buttonStyle} onClick={() => navigate('/koinonia')}>
                    성도 소식 함께하기
                </SuitButton>
            </BlurFade>
        </section>
    );
};

export default PrayerSection;

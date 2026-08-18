import React, { useState, useEffect } from 'react';
import { BlurFade } from './ui/BlurFade';
import LargeButton from './ui/LargeButton';
import { useNavigate } from 'react-router-dom';

const ServiceInfoSection = () => {
    const [isMobile, setIsMobile] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 767);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const sectionStyle = {
        padding: 'var(--section-padding-y) 0',
        textAlign: 'center', // Center text on all devices since image is gone
        color: 'var(--color-white)',
        position: 'relative',
        height: 'auto', // Hug content
        minHeight: '100vh', // Requested 100vh height including padding
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center', // Center the content
        flexDirection: 'column',
        backgroundColor: 'var(--color-background-beige)'
    };

    const titleStyle = {
        fontFamily: 'var(--font-yuhan)',
        fontWeight: 500,
        fontSize: isMobile ? '24px' : '40px',
        lineHeight: 1.6,
        letterSpacing: '0.02em',
        color: 'var(--color-text-dark)',
        marginBottom: isMobile ? '24px' : '48px',
        textAlign: 'center',
        padding: isMobile ? '0 24px' : '0 48px',
        boxSizing: 'border-box',
        wordBreak: 'keep-all'
    };

    return (
        <section className="flex-mobile-column" style={sectionStyle}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <BlurFade delay={0.25} inView>
                    <h2 style={titleStyle}>당신을 기다리는<br />예배의 자리.</h2>
                </BlurFade>
                <BlurFade delay={0.4} inView>
                    <LargeButton onClick={() => navigate('/worship')}>
                        예배 안내 보기
                    </LargeButton>
                </BlurFade>
            </div>
        </section>
    );
};

export default ServiceInfoSection;

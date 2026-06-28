import React, { useState, useEffect } from 'react';
import { BlurFade } from './ui/BlurFade';
import PretendardButton from './ui/PretendardButton';

const ServiceInfoSection = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 767);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const sectionStyle = {
        padding: 'var(--section-padding-y) 0',
        textAlign: 'center', // Center text on all devices since image is gone
        color: '#fff',
        position: 'relative',
        height: 'auto', // Hug content
        minHeight: '100vh', // Requested 100vh height including padding
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center', // Center the content
        flexDirection: 'column',
        backgroundColor: '#E1EBEA'
    };

    const titleStyle = {
        fontFamily: 'LXGWWenKaiMonoKR, sans-serif',
        fontSize: isMobile ? '32px' : '48px',
        fontWeight: 400,
        lineHeight: '1.6',
        letterSpacing: '-0.1em',
        color: '#1D1A1C',
        marginBottom: '64px',
        textAlign: 'center',
        padding: isMobile ? '0 24px' : '0 48px',
        boxSizing: 'border-box'
    };

    const buttonStyle = {
        borderColor: '#1D1A1C',
        color: '#1D1A1C',
        marginTop: '20px'
    };

    return (
        <section className="flex-mobile-column" style={sectionStyle}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <BlurFade delay={0.25} inView>
                    <h2 style={titleStyle}>당신을 기다리는<br />예배의 자리.</h2>
                </BlurFade>
                <BlurFade delay={0.4} inView>
                    <PretendardButton style={buttonStyle}>
                        예배 안내 보기
                    </PretendardButton>
                </BlurFade>
            </div>
        </section>
    );
};

export default ServiceInfoSection;

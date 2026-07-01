import React, { useState, useEffect } from 'react';
import { BlurFade } from './ui/BlurFade';
import SuitButton from './ui/SuitButton';
import { useNavigate } from 'react-router-dom';

const EventSection = () => {
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
        justifyContent: 'center',
        flexDirection: 'column',
        backgroundColor: 'var(--color-background-beige)'
    };

    const titleStyle = {
        fontSize: isMobile ? '32px' : '48px',
        
        
        
        color: 'var(--color-text-dark)',
        marginBottom: '64px',
        textAlign: 'center',
        padding: isMobile ? '0 24px' : '0 48px',
        boxSizing: 'border-box'
    };

    const buttonStyle = {
        borderColor: 'var(--color-text-dark)',
        color: 'var(--color-text-dark)',
        marginTop: '20px'
    };

    return (
        <section style={sectionStyle}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <BlurFade delay={0.25} inView>
                    <h2 style={titleStyle}>함께 만들어가는<br />이달의 이야기.</h2>
                </BlurFade>
                <BlurFade delay={0.4} inView>
                    <SuitButton style={buttonStyle} onClick={() => navigate('/events')}>
                        일정 보기
                    </SuitButton>
                </BlurFade>
            </div>
        </section>
    );
};

export default EventSection;

import React, { useState, useEffect } from 'react';
import { BlurFade } from './ui/BlurFade';
import { motion } from 'framer-motion';
import PretendardButton from './ui/PretendardButton';

const NewcomerSection = ({ 
    title = <>당신을 향한 사랑,<br />이곳에 있습니다.</>,
    buttonText = "신탄진교회 오시는 길"
}) => {
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
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#192C2A'
    };

    const titleStyle = {
        fontFamily: 'LXGWWenKaiMonoKR, sans-serif',
        fontSize: isMobile ? '32px' : '48px',
        fontWeight: 400,
        lineHeight: '1.6',
        letterSpacing: '-0.1em',
        color: '#ffffff', // Changed back to white for visibility on dark background
        marginBottom: '64px',
        textAlign: 'center',
        padding: isMobile ? '0 24px' : '0 48px',
        boxSizing: 'border-box'
    };

    const buttonStyle = {
        borderColor: '#B6CDCA',
        color: '#B6CDCA'
    };

    // Mock hills using CSS
    const hillsStyle = {
        position: 'absolute',
        bottom: '-100px',
        left: '0',
        width: '100%',
        height: '250px',
        background: 'linear-gradient(180deg, #7cb342 0%, #558b2f 100%)', // Green hills
        borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
        transform: 'scaleX(1.5)',
        zIndex: -1
    };

    return (
        <section style={sectionStyle}>
            <BlurFade delay={0.25} inView>
                <h2 style={titleStyle}>{title}</h2>
            </BlurFade>
            <BlurFade delay={0.4} inView>
                <PretendardButton style={buttonStyle}>
                    {buttonText}
                </PretendardButton>
            </BlurFade>

            {/* Additional hill layers could be added for depth */}
        </section>
    );
};

export default NewcomerSection;

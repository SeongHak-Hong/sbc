import React, { useState, useEffect } from 'react';
import donkeyEvent from '../assets/main/shintanjin-baptist-church-main-donkey.webp';
import { BlurFade } from './ui/BlurFade';
import { motion } from 'framer-motion';

const EventSection = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 767);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const sectionStyle = {
        padding: 'var(--section-padding-y) 0',
        textAlign: isMobile ? 'center' : 'right', // Center text on mobile
        color: '#fff',
        position: 'relative',
        height: 'auto', // Hug content
        minHeight: '100vh', // Requested 100vh height including padding
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: isMobile ? 'column-reverse' : 'row',
        gap: '48px'
    };

    const titleStyle = {
        marginBottom: '20px',
        color: '#ffffff'
    };

    const buttonStyle = {
        // backgroundColor: '#005f99', // Handled by global
        color: '#fff',
        marginTop: '20px'
    };

    const imageBoxStyle = {
        width: isMobile ? '100%' : '452px',
        height: isMobile ? 'auto' : '452px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
    };

    const donkeyStyle = {
        width: 'auto',
        height: 'auto',
        maxWidth: '100%',
        maxHeight: '100%'
    };

    return (
        <section style={sectionStyle}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMobile ? 'center' : 'flex-end' }}>
                <BlurFade delay={0.25} inView>
                    <h2 style={titleStyle}>이번 달은<br />어떤 행사가 있어요?</h2>
                </BlurFade>
                <BlurFade delay={0.4} inView>
                    <motion.button
                        style={buttonStyle}
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                        일정 보기
                    </motion.button>
                </BlurFade>
            </div>
            <motion.div
                style={imageBoxStyle}
                initial={{ opacity: 0, x: 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }} // Re-trigger animation
                transition={{ duration: 0.8, ease: 'easeOut' }}
            >
                <img src={donkeyEvent} alt="Donkey" style={donkeyStyle} />
            </motion.div>
        </section>
    );
};

export default EventSection;

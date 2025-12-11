import React from 'react';
import lionWorship from '../assets/main/lion_worship.png';
import { BlurFade } from './ui/BlurFade';
import { motion } from 'framer-motion';

const ServiceInfoSection = () => {
    const sectionStyle = {
        padding: 'var(--section-padding-y) 0',
        textAlign: 'left', // Left align
        color: '#fff',
        position: 'relative',
        height: 'auto', // Hug content
        minHeight: '100vh', // Requested 100vh height including padding
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center', // Center the pair in the section
        flexDirection: 'row',
        gap: '48px' // Gap between box and text
    };

    const titleStyle = {
        marginBottom: '20px'
    };

    const buttonStyle = {
        // backgroundColor: '#005f99', // Handled by global
        color: '#fff',
        marginTop: '20px'
    };

    const imageBoxStyle = {
        width: '452px',
        height: '452px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
    };

    const lionStyle = {
        width: 'auto',
        height: 'auto',
        maxWidth: '100%',
        maxHeight: '100%'
    };

    return (
        <section style={sectionStyle}>

            <motion.div
                style={imageBoxStyle}
                initial={{ opacity: 0, x: -100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }} // Re-trigger animation
                transition={{ duration: 0.8, ease: 'easeOut' }}
            >
                <img src={lionWorship} alt="Worship Lion" style={lionStyle} />
            </motion.div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <BlurFade delay={0.25} inView>
                    <h2 style={titleStyle}>예배는<br />언제 있어요?</h2>
                </BlurFade>
                <BlurFade delay={0.4} inView>
                    <motion.button
                        style={buttonStyle}
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                        예배 안내 보기
                    </motion.button>
                </BlurFade>
            </div>
        </section>
    );
};

export default ServiceInfoSection;

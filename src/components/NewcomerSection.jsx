import React from 'react';
import { BlurFade } from './ui/BlurFade';
import { motion } from 'framer-motion';

const NewcomerSection = () => {
    const sectionStyle = {
        padding: 'var(--section-padding-y) 0',
        textAlign: 'center',
        color: '#fff',
        position: 'relative',
        // minHeight: '100vh', // Removed as requested
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    };

    const titleStyle = {
        marginBottom: '30px'
    };

    const buttonStyle = {
        // backgroundColor: '#005f99', // Handled by global
        color: '#fff',
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
                <h2 style={titleStyle}>사랑이 가득한<br />신탄진교회로 오세요.</h2>
            </BlurFade>
            <BlurFade delay={0.4} inView>
                <motion.button
                    style={buttonStyle}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                    오시는 길 보기
                </motion.button>
            </BlurFade>

            {/* Additional hill layers could be added for depth */}
        </section>
    );
};

export default NewcomerSection;

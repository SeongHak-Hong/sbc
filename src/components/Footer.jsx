import React from 'react';
import { motion } from 'framer-motion';
import '../index.css';

// Import local images
import footer01 from '../assets/main/footer_01.png';
import footer02 from '../assets/main/footer_02.png';
import footer03 from '../assets/main/footer_03.png';
import footer04 from '../assets/main/footer_04.png';

const Footer = () => {
    // Top-most text container style
    const contentStyle = {
        position: 'relative',
        zIndex: 20, // Highest to sit on top of images
        width: '100%',
        maxWidth: '1500px', // Match global max-width
        margin: '0 auto',
        padding: '0 48px 60px', // padding-bottom 60px per previous spec
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        height: '100%',
        boxSizing: 'border-box',
    };

    // Shared image style
    const imgBaseStyle = {
        position: 'absolute',
        display: 'block', // Fix for potential inline gap below images
        pointerEvents: 'none', // Prevent overlapping with interactive elements
        // max-width/height logic handled below
    };

    return (
        <footer className="footer-section">
            {/* 
              Z-Index Hierarchy:
              Text > footer_02 > footer_03 > footer_01 > footer_04 
            */}

            {/* Footer 04: Lowest, Static or Fade */}
            <motion.img
                src={footer04}
                alt="Footer Layer 4"
                style={{ ...imgBaseStyle, bottom: 0, left: 0, zIndex: 1, width: '100vw', height: 'auto' }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false, amount: 0.1 }}
                transition={{ duration: 0.8 }}
            />

            {/* Footer 01: Bottom 0 Left 0. Animate from bottom -30px */}
            <motion.img
                src={footer01}
                alt="Footer Layer 1"
                style={{ ...imgBaseStyle, bottom: 0, left: 0, zIndex: 3, width: '100vw', height: 'auto' }}
                initial={{ y: 200, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: false, amount: 0.1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            />

            {/* Footer 03: Bottom 0 Right 0. Animate from right -30px, bottom -30px */}
            <motion.img
                src={footer03}
                alt="Footer Layer 3"
                style={{ ...imgBaseStyle, bottom: 0, right: 0, zIndex: 4 }}
                initial={{ x: 200, y: 200, opacity: 0 }}
                whileInView={{ x: 0, y: 0, opacity: 1 }}
                viewport={{ once: false, amount: 0.1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            />

            {/* Footer 02: Bottom 0 Left 0. Animate from left -30px, bottom -30px */}
            <motion.img
                src={footer02}
                alt="Footer Layer 2"
                style={{ ...imgBaseStyle, bottom: 0, left: 0, zIndex: 5 }}
                initial={{ x: -200, y: 200, opacity: 0 }}
                whileInView={{ x: 0, y: 0, opacity: 1 }}
                viewport={{ once: false, amount: 0.1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            />

            {/* Text Content */}
            <div style={contentStyle}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '12px', fontSize: '20px' }}>
                    <span style={{ cursor: 'pointer' }}>이용약관</span>
                    <span style={{ cursor: 'pointer' }}>개인정보처리방침</span>
                </div>
                <p style={{ marginTop: '12px' }}>&copy; 2025 SINTANJIN BAPTIST CHURCH. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;

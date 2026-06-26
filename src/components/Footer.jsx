import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../index.css';
import foregroundImg from '../assets/main/shintanjin-baptist-church-foreground.webp';

const Footer = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const location = useLocation();
    const isSubpage = location.pathname !== '/';
    const themeClass = isSubpage ? 'footer-dark footer-subpage' : 'footer-dark';
    const contentStyle = {
        width: '100%',
        maxWidth: '1500px',
        margin: '0 auto',
        padding: '60px 48px', // Balanced padding
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        boxSizing: 'border-box',
    };

    return (
        <footer className={`footer-section ${themeClass}`} style={{ position: 'relative', overflow: 'visible' }}>
            <div style={contentStyle}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '12px', fontSize: '20px' }}>
                    <span style={{ cursor: 'pointer' }}>이용약관</span>
                    <span style={{ cursor: 'pointer' }}>개인정보처리방침</span>
                </div>
                <p style={{ marginTop: '12px' }}>&copy; {new Date().getFullYear()} SINTANJIN BAPTIST CHURCH. All rights reserved.</p>
            </div>
            <img 
                src={foregroundImg} 
                alt="Footer decoration" 
                style={{
                    position: 'absolute',
                    bottom: 0,
                    right: '-50px',
                    pointerEvents: 'none',
                    zIndex: 1,
                    transform: isMobile ? 'scale(0.34)' : 'scale(0.5)',
                    transformOrigin: 'bottom right'
                }} 
            />
        </footer>
    );
};

export default Footer;

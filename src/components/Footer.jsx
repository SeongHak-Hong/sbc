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
        padding: isMobile ? '0 24px 60px 24px' : '60px 48px', 
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 10
    };

    return (
        <footer className={`footer-section ${themeClass}`} style={{ position: 'relative', overflow: 'visible' }}>

            <div style={contentStyle}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '12px', fontSize: '20px' }}>
                    <span style={{ cursor: 'pointer' }}>이용약관</span>
                    <span style={{ cursor: 'pointer' }}>개인정보처리방침</span>
                </div>
                <div style={{ textAlign: 'center', marginTop: '16px', lineHeight: '1.6', opacity: 0.8 }}>
                    <p style={{ margin: 0, wordBreak: 'keep-all' }}>
                        대전 대덕구 석봉로 17 신탄진침례교회 <span style={{ margin: '0 8px', opacity: 0.5 }}>|</span> T. 042-932-8156
                    </p>
                </div>
                <p style={{ marginTop: '24px', opacity: 0.6, textAlign: 'center' }}>&copy; {new Date().getFullYear()} SINTANJIN BAPTIST CHURCH. All rights reserved.</p>
            </div>

            {!isMobile && (
                <img 
                    src={foregroundImg} 
                    alt="Footer decoration" 
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        right: '-50px',
                        pointerEvents: 'none',
                        zIndex: 1,
                        transform: 'scale(0.5)',
                        transformOrigin: 'bottom right'
                    }} 
                />
            )}
        </footer>
    );
};

export default Footer;

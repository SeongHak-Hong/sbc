import React from 'react';
import { useLocation } from 'react-router-dom';
import '../index.css';

const Footer = () => {
    const location = useLocation();
    const isSubpage = location.pathname !== '/';
    const themeClass = isSubpage ? 'footer-light' : 'footer-dark';
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
        <footer className={`footer-section ${themeClass}`} style={{ position: 'relative', overflow: 'hidden' }}>
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

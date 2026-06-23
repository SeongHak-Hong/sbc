import React, { useState, useEffect } from 'react';
import logoSbc from '../assets/logo_sbc.svg';
import '../index.css';
import { Link, useLocation } from 'react-router-dom';
import MenuOverlay from './MenuOverlay';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const isSubpage = location.pathname !== '/';

    // Prevent background scrolling when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMenuOpen]);

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '20px',
        paddingBottom: '20px',
        color: isSubpage ? 'var(--color-text-body)' : '#fff',
        position: 'fixed', // Fixed = Sticky behavior + Overlaps content (removed from flow)
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 100,
        paddingLeft: 'var(--grid-margin)',
        paddingRight: 'var(--grid-margin)',
        boxSizing: 'border-box'
    };

    const logoStyle = {
        fontFamily: "var(--font-content)",
        fontSize: '24px',
    };

    return (
        <>
            <header style={headerStyle}>
                <Link to="/" style={{ display: 'flex', zIndex: 100 }}>
                    <img
                        src={logoSbc}
                        alt="신탄진교회"
                        style={{ height: '32px', filter: isSubpage ? 'none' : 'brightness(0) invert(1)' }}
                    />
                </Link>
                <div 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    style={{ cursor: 'pointer', fontFamily: "var(--font-content)", fontSize: '32px', zIndex: 100 }}
                >
                    {isMenuOpen ? '닫기' : '메뉴'}
                </div>
            </header>
            <MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </>
    );
};

export default Header;

import React from 'react';
import logoSbc from '../assets/logo_sbc.png';
import '../index.css';

const Header = () => {
    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '20px',
        paddingBottom: '20px',
        color: '#fff',
        position: 'fixed', // Fixed = Sticky behavior + Overlaps content (removed from flow)
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 100,
        paddingLeft: 'var(--grid-margin)',
        paddingRight: 'var(--grid-margin)'
    };

    const logoStyle = {
        fontFamily: "var(--font-content)",
        fontSize: '24px',
    };

    return (
        <header style={headerStyle}>
            <a href="/" style={{ display: 'flex' }}>
                <img
                    src={logoSbc}
                    alt="신탄진교회"
                    style={{ height: '32px', filter: 'brightness(0) invert(1)' }}
                />
            </a>
            <div style={{ cursor: 'pointer', fontFamily: "var(--font-content)", fontSize: '32px' }}>메뉴</div>
        </header>
    );
};

export default Header;

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
    const location = useLocation();
    const isSubpage = location.pathname !== '/';
    
    // Applying modular classes instead of global/inline ones
    const themeClass = isSubpage ? `${styles.footerDark} ${styles.footerSubpage}` : styles.footerDark;

    return (
        <footer className={`${styles.footerSection} ${themeClass}`}>
            <div className={styles.content}>
                <div className={styles.links}>
                    <span className={styles.link}>이용약관</span>
                    <span className={styles.link}>개인정보처리방침</span>
                </div>
                <div className={styles.infoWrapper}>
                    <div className={styles.addressBox}>
                        <p className={styles.address}>
                            대전 대덕구 석봉로 17 신탄진침례교회<br />T. 042-932-8156
                        </p>
                    </div>
                    <p className={styles.copyright}>&copy; {new Date().getFullYear()} SHINTANJIN BAPTIST CHURCH. ALL RIGHTS RESERVED.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

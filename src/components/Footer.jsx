import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.wrap}>
                <div className={styles.fLinks}>
                    <a href="#">개인정보처리방침</a>
                    <a href="#">이용약관</a>
                </div>
                <p>대전 대덕구 석봉로 17 신탄진침례교회</p>
                <p>T. <a href="tel:0429328156">042-932-8156</a></p>
                <p className={styles.fCopy}>© {new Date().getFullYear()} SHINTANJIN BAPTIST CHURCH. ALL RIGHTS RESERVED.</p>
            </div>
        </footer>
    );
};

export default Footer;

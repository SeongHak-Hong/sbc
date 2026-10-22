import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import LegalSheet from './LegalSheet';
import styles from './Footer.module.css';

const Footer = () => {
    // 'privacy' | 'terms' | null — 누르면 교회 일정과 같은 팝업으로 본문을 연다
    const [legalDoc, setLegalDoc] = useState(null);

    return (
        <footer className={styles.footer}>
            <div className={styles.wrap}>
                <div className={styles.fLinks}>
                    <button type="button" aria-haspopup="dialog" onClick={() => setLegalDoc('privacy')}>개인정보처리방침</button>
                    <button type="button" aria-haspopup="dialog" onClick={() => setLegalDoc('terms')}>이용약관</button>
                </div>
                <p>대전 대덕구 석봉로 17 신탄진침례교회</p>
                <p>T. <a href="tel:0429328156">042-932-8156</a></p>
                <p className={styles.fCopy}>© {new Date().getFullYear()} SHINTANJIN BAPTIST CHURCH. ALL RIGHTS RESERVED.</p>
            </div>
            <AnimatePresence>
                {legalDoc && <LegalSheet key={legalDoc} doc={legalDoc} onClose={() => setLegalDoc(null)} />}
            </AnimatePresence>
        </footer>
    );
};

export default Footer;

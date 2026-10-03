import React, { useCallback } from 'react';
import { useReducedMotion } from 'framer-motion';
import HeroSection from './sections/HeroSection';
import Footer from '../../components/Footer';
import styles from './HomePage.module.css';

function HomePage() {
    const reduceMotion = useReducedMotion();

    // Lenis가 네이티브 scrollIntoView를 가로채므로 lenis.scrollTo 사용.
    // 대상 섹션이 아직 없으면 한 화면만큼 내려감.
    const handleExplore = useCallback((id) => {
        const target = document.getElementById(id) ?? window.scrollY + window.innerHeight;
        if (window.lenis) {
            window.lenis.scrollTo(target, { immediate: reduceMotion });
        } else {
            const top = typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
        }
    }, [reduceMotion]);

    return (
        <div className={styles.page}>
            <main>
                <HeroSection onExplore={handleExplore} />
            </main>
            <Footer />
        </div>
    );
}

export default HomePage;

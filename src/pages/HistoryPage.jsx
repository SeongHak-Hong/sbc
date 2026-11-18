import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';

import styles from './HistoryPage.module.css';
import PageTopGradient from '../components/PageTopGradient';
import Footer from '../components/Footer';

const imageModules = import.meta.glob('../assets/history/shintanjin-baptist-church-history-*.webp', { eager: true, import: 'default' });
const photoUrl = (number) => imageModules[`../assets/history/shintanjin-baptist-church-history-${number}.webp`];

// 흑백 → 컬러로 이어지는 순서. 18·21·28·30 은 사진에 찍힌 날짜(72.12.24 · 1973 · 1978.1.8 · 12.27.'98) 기준,
// 나머지 자리는 정확한 연도를 받을 때까지 임시
const photos = [
    { number: 18, alt: '1972년 12월, 강단 앞에 모인 졸업 기념 단체 사진' },
    { number: 21, alt: '1973년 성탄절에 찍은 흑백 단체 사진' },
    { number: 22, alt: '성탄 장식 앞에 가운을 입고 앉은 성가대 흑백 사진' },
    { number: 23, alt: '강단 앞에 모인 제5회 행사 흑백 단체 사진' },
    { number: 19, alt: '예배당에 모여 앉은 어린이 여름 성경 학교 흑백 사진' },
    { number: 28, alt: '1978년 1월, 집사 시무 축하 예배 흑백 단체 사진' },
    { number: 13, alt: '신탄진교회 건물 앞에 어깨띠를 두르고 선 두 사람' },
    { number: 42, alt: '교회 마당에 모인 야외 단체 사진' },
    { number: 46, alt: '어린이 제자 훈련 개강 예배 단체 사진' },
    { number: 30, alt: '1998년 12월, 붉은 옷을 입고 찬양하는 성가대' },
].map((photo) => ({ ...photo, url: photoUrl(photo.number) }));

// 스크롤 위치 → 연도. 날짜가 있는 사진을 기준점으로 삼고, 그 사이는 고르게 흐른다
const lastIndex = photos.length - 1;
const YEAR_STOPS = [0, 1 / lastIndex, 5 / lastIndex, 1];
const YEARS = [1972, 1973, 1978, 1998];

const YearLine = ({ progress, className }) => {
    const year = useTransform(progress, YEAR_STOPS, YEARS);
    const shown = useTransform(year, (value) => Math.round(value));
    return (
        <p className={className} aria-hidden="true">
            <motion.span className={styles.year}>{shown}</motion.span>
            <span className={styles.dash} />
            <span className={`${styles.year} ${styles.yearEnd}`}>{YEARS[YEARS.length - 1]}</span>
        </p>
    );
};

// 데스크톱: 세로로 내리면 사진이 옆으로 넘어간다
const DesktopStrip = () => {
    const outerRef = useRef(null);
    const trackRef = useRef(null);
    const [range, setRange] = useState(0);

    useLayoutEffect(() => {
        const measure = () => setRange(Math.max(0, trackRef.current.scrollWidth - window.innerWidth));
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, []);

    const { scrollYProgress } = useScroll({ target: outerRef, offset: ['start start', 'end end'] });
    const x = useTransform(scrollYProgress, [0, 1], [0, -range]);

    return (
        <div ref={outerRef} className={styles.stripOuter} style={{ height: `calc(${range}px + 100vh)` }}>
            <div className={styles.stripSticky}>
                <motion.ol ref={trackRef} className={styles.track} style={{ x }}>
                    {photos.map((photo) => (
                        <li key={photo.number} className={styles.slide}>
                            <img src={photo.url} alt={photo.alt} />
                        </li>
                    ))}
                </motion.ol>
                <YearLine progress={scrollYProgress} className={styles.timeline} />
                <p className={styles.hint}>아래로 내리면 사진이 옆으로 넘어가요</p>
            </div>
        </div>
    );
};

// 휴대폰: 사진은 세로로 차례로, 연도는 화면 아래에 붙어서 함께 흐른다
const MobileStack = () => {
    const wrapRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start 40%', 'end end'] });
    return (
        <div ref={wrapRef} className={styles.stackWrap}>
            <ol className={styles.stack}>
                {photos.map((photo) => (
                    <li key={photo.number}>
                        <img src={photo.url} alt={photo.alt} loading="lazy" />
                    </li>
                ))}
            </ol>
            <YearLine progress={scrollYProgress} className={styles.timelineBar} />
        </div>
    );
};

const HistoryPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <>
            <main className={styles.page}>
                <PageTopGradient />

                <header className={styles.intro}>
                    <h1 className={styles.title}>함께 걸어온 길을<br />사진으로 모았어요.</h1>
                    <p className={styles.lead}>그때의 얼굴과 자리를 한 장씩 넘겨 보세요.</p>
                </header>

                <div className={styles.desktopOnly}>
                    <DesktopStrip />
                </div>
                <MobileStack />

                <section className={styles.closing} aria-labelledby="history-closing-title">
                    <h2 id="history-closing-title" className={styles.closingTitle}>그때의 마음으로<br />오늘도 함께 모여요.</h2>
                    <p className={styles.lead}>요즘 모습은 갤러리에 모아 두었어요.</p>
                    <div className={styles.actions}>
                        <Link className={styles.primary} to="/photos">오늘의 모습 보기</Link>
                        <a className={styles.textLink} href="https://www.instagram.com/ds3jhb2026/" target="_blank" rel="noopener noreferrer">인스타그램에서도 만나요</a>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
};

export default HistoryPage;

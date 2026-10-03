import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import LargeButton from '../../../components/ui/LargeButton';
import { hero } from '../../../content/home';
import styles from './HeroSection.module.css';

const EASE = [0.16, 1, 0.3, 1];

// ScrollFadeText 스펙(blur 10px→0, opacity 0.1→1, 0.8s, stagger 0.08s)에
// 줄 사이 '한 박자 쉼'을 더한 타이밍
const WORD_DURATION = 0.8;
const WORD_STAGGER = 0.08;
const FIRST_LINE_START = 0.5;
const LINE_BEAT = 1.2; // 윗줄 마지막 단어 시작 → 아랫줄 시작

// 방문 시각에 맞는 인사 선택 (5시 이전은 전날 밤 인사)
const pickHeadline = (hour) => {
    const sorted = [...hero.headlines].sort((a, b) => a.from - b.from);
    return sorted.filter((h) => h.from <= hour).pop() ?? sorted[sorted.length - 1];
};

// 각 줄·단어의 시작 시각을 미리 계산
const buildTimeline = (lines) => {
    let start = FIRST_LINE_START;
    const timed = lines.map((line) => {
        const words = line.split(' ').map((word, i) => ({ word, delay: start + i * WORD_STAGGER }));
        start = words[words.length - 1].delay + LINE_BEAT;
        return words;
    });
    const lastWord = timed[timed.length - 1].slice(-1)[0];
    return { timed, end: lastWord.delay + WORD_DURATION };
};

const HeroSection = ({ onExplore }) => {
    const reduceMotion = useReducedMotion();
    const [headline] = useState(() => pickHeadline(new Date().getHours()));
    const { timed, end } = buildTimeline(headline.lines);

    const rise = (delay) => (reduceMotion
        ? { initial: false }
        : {
            initial: { opacity: 0, y: 12 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.8, delay, ease: EASE },
        });

    return (
        <section className={styles.hero}>
            <div className={styles.inner}>
                {/* 마음 쉼표 호흡(들이쉬기 4초 / 내쉬기 6초)과 같은 주기로 숨 쉬는 원 */}
                <motion.div
                    className={styles.circleWrap}
                    aria-hidden="true"
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.6, ease: EASE }}
                >
                    <span className={styles.circle} />
                </motion.div>

                <h1 className={styles.headline}>
                    {timed.map((words, li) => (
                        <span className={styles.line} key={li}>
                            {words.map(({ word, delay }, wi) => (
                                <React.Fragment key={wi}>
                                    {wi > 0 && ' '}
                                    <motion.span
                                        className={styles.word}
                                        initial={reduceMotion ? false : { opacity: 0.1, filter: 'blur(10px)' }}
                                        animate={{ opacity: 1, filter: 'blur(0px)' }}
                                        transition={{ duration: WORD_DURATION, delay, ease: EASE }}
                                    >
                                        {word}
                                    </motion.span>
                                </React.Fragment>
                            ))}
                        </span>
                    ))}
                </h1>

                <motion.p className={styles.sub} {...rise(end - 0.2)}>
                    {hero.sub}
                </motion.p>

                <motion.div className={styles.actions} {...rise(end)}>
                    <LargeButton
                        type="button"
                        className={`${styles.cta} ${styles.ctaPrimary}`}
                        onClick={() => onExplore(hero.primaryCta.targetId)}
                    >
                        {hero.primaryCta.label}
                    </LargeButton>
                    <Link to={hero.secondaryCta.to} className={`${styles.cta} ${styles.ctaSecondary}`}>
                        {hero.secondaryCta.label}
                    </Link>
                </motion.div>
            </div>

            <motion.div className={styles.scrollCue} aria-hidden="true" {...rise(end + 0.4)}>
                <span className={styles.scrollTrack}>
                    <span className={styles.scrollDot} />
                </span>
            </motion.div>
        </section>
    );
};

export default HeroSection;

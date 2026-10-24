import React, { useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

function Word({ children, progress, start, end, reducedMotion, restOpacity }) {
    const opacity = useTransform(progress, [start, end], [restOpacity, 1]);
    return (
        <motion.span
            style={reducedMotion ? undefined : { opacity, willChange: 'opacity' }}
        >
            {children}
        </motion.span>
    );
}

/**
 * ScrollWordReveal — 스크롤 진행도에 따라 단어 단위로 부드럽게 밝아지는 텍스트 리빌 컴포넌트
 * 동화책을 읽어 내려가듯 스크롤 위치에 맞춰 한 단어씩 순차적으로 강조됩니다.
 */
export default function ScrollWordReveal({
    as: Tag = 'p',
    className,
    lines = [],
    restOpacity = 0.22,
    offset = ['start 85%', 'start 40%'],
    revealSpan = 0.85,
    wordWindow = 0.18,
}) {
    const targetRef = useRef(null);
    const reducedMotion = useReducedMotion();

    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset,
    });

    const { totalWords, parsedLines, fullPlainText } = useMemo(() => {
        let globalIndex = 0;
        const parsed = lines.map((line) => {
            const words = line.text.trim().split(/\s+/);
            const lineWords = words.map((w) => ({
                word: w,
                index: globalIndex++,
            }));
            return {
                ...line,
                words: lineWords,
            };
        });
        const plain = lines.map((l) => l.text).join(' ');
        return {
            totalWords: globalIndex,
            parsedLines: parsed,
            fullPlainText: plain,
        };
    }, [lines]);

    const getWordRange = (index) => {
        if (totalWords <= 1) return [0, 1];
        const start = (index / (totalWords - 1)) * revealSpan;
        const end = Math.min(1, start + wordWindow);
        return [start, end];
    };

    return (
        <Tag ref={targetRef} className={className} aria-label={fullPlainText}>
            <span aria-hidden="true">
                {parsedLines.map((line, lineIdx) => {
                    const lineContent = (
                        <React.Fragment key={lineIdx}>
                            {line.words.map(({ word, index }) => {
                                const [start, end] = getWordRange(index);
                                return (
                                    <React.Fragment key={index}>
                                        <Word
                                            progress={scrollYProgress}
                                            start={start}
                                            end={end}
                                            reducedMotion={reducedMotion}
                                            restOpacity={restOpacity}
                                        >
                                            {word}
                                        </Word>
                                        {' '}
                                    </React.Fragment>
                                );
                            })}
                            {line.br !== false && lineIdx < parsedLines.length - 1 && <br />}
                        </React.Fragment>
                    );

                    return line.span ? (
                        <span key={lineIdx}>{lineContent}</span>
                    ) : (
                        lineContent
                    );
                })}
            </span>
        </Tag>
    );
}

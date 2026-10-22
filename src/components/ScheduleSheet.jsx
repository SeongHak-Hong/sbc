import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Viewer } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import styles from './ScheduleSheet.module.css';

// 교회 일정 세부정보: Apple 뉴스룸 '빠르게 보기' 팝업 모양.
// 흐린 배경 위 흰 시트 → 날짜 · 제목 · 시간/장소 · 사진 · 내용.
// 사진은 비전문가가 가로·세로 섞어 올리므로 자르지 않는다: 원래 비율 그대로, 세로는 4:5까지만(남는 곳은 연한 회색),
// 누르면 화면 가득 크게 본다.
const sheetSpring = { type: 'spring', bounce: 0, duration: 0.4 };

const CloseIcon = () => (
    <svg viewBox="0 0 36 36" aria-hidden="true">
        <path d="M13 13l10 10M23 13L13 23" />
    </svg>
);

const ScheduleSheet = ({ post, images = [], onClose }) => {
    const reduceMotion = useReducedMotion();
    const [zoomIndex, setZoomIndex] = useState(null);
    const sheetRef = useRef(null);
    const zoomCloseRef = useRef(null);

    // Esc: 크게 보기가 열려 있으면 그것만, 아니면 팝업을 닫는다
    useEffect(() => {
        const onKey = (e) => {
            if (e.key !== 'Escape') return;
            if (zoomIndex !== null) setZoomIndex(null);
            else onClose();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [zoomIndex, onClose]);

    useEffect(() => {
        sheetRef.current?.focus({ preventScroll: true });
    }, []);

    useEffect(() => {
        if (zoomIndex !== null) zoomCloseRef.current?.focus();
    }, [zoomIndex]);

    const enter = reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 };

    return (
        <motion.div
            className={styles.dim}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            data-lenis-prevent
        >
            <motion.article
                ref={sheetRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="schedule-sheet-title"
                tabIndex={-1}
                className={styles.sheet}
                onClick={(e) => e.stopPropagation()}
                initial={enter}
                animate={{ opacity: 1, y: 0 }}
                exit={enter}
                transition={reduceMotion ? { duration: 0.15 } : sheetSpring}
            >
                {/* 닫기: 높이 0인 칸을 시트 위에 붙여(sticky) 길게 내려도 화면 위에 남는다 */}
                <div className={styles.closeWrap}>
                    <button type="button" className={styles.close} aria-label="닫기" onClick={onClose}>
                        <span className={styles.closeIcon}><CloseIcon /></span>
                    </button>
                </div>

                <div className={styles.body}>
                    {post.dateText && <p className={styles.date}>{post.dateText}</p>}
                    <h1 id="schedule-sheet-title" className={styles.title}>{post.title}</h1>

                    {(post.time || post.location) && (
                        <dl className={styles.facts}>
                            {post.time && (
                                <div className={styles.fact}>
                                    <dt>시간</dt>
                                    <dd>{post.time}</dd>
                                </div>
                            )}
                            {post.location && (
                                <div className={styles.fact}>
                                    <dt>장소</dt>
                                    <dd>{post.location}</dd>
                                </div>
                            )}
                        </dl>
                    )}

                    {images.length > 0 && (
                        <div className={styles.photos}>
                            {images.map((src, i) => (
                                <button
                                    key={src}
                                    type="button"
                                    className={styles.photo}
                                    aria-label={images.length > 1 ? `사진 ${i + 1} 크게 보기` : '사진 크게 보기'}
                                    onClick={() => setZoomIndex(i)}
                                >
                                    <img src={src} alt="" loading={i === 0 ? 'eager' : 'lazy'} decoding="async" />
                                </button>
                            ))}
                        </div>
                    )}

                    {post.description && (
                        <div className={styles.text}>
                            <Viewer initialValue={post.description} />
                        </div>
                    )}
                </div>
            </motion.article>

            {/* 사진 크게 보기: 자르지 않고 화면에 맞춰 통째로 */}
            <AnimatePresence>
                {zoomIndex !== null && (
                    <motion.div
                        className={styles.zoom}
                        role="dialog"
                        aria-modal="true"
                        aria-label="사진 크게 보기"
                        onClick={(e) => { e.stopPropagation(); setZoomIndex(null); }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <button ref={zoomCloseRef} type="button" className={`${styles.close} ${styles.zoomClose}`} aria-label="크게 보기 닫기">
                            <span className={styles.closeIcon}><CloseIcon /></span>
                        </button>
                        <motion.img
                            key={images[zoomIndex]}
                            src={images[zoomIndex]}
                            alt=""
                            className={styles.zoomImg}
                            initial={reduceMotion ? false : { scale: 0.96 }}
                            animate={{ scale: 1 }}
                            transition={reduceMotion ? { duration: 0 } : sheetSpring}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ScheduleSheet;

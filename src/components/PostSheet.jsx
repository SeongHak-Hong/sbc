import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Viewer } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import styles from './PostSheet.module.css';
import cleanPostContents from '../lib/cleanPostContents';

// 게시물 팝업 (교회 일정 · 공지사항 · 교회소식 · 주보 · 성도사업): Apple 뉴스룸 '빠르게 보기' 모양.
// 흐린 배경 위 흰 시트 → 날짜 줄 · 제목 · 정보 줄(시간/장소, 업종/전화/주소) · 사진 또는 주보 · 본문 · 지도.
// 사진은 비전문가가 가로·세로 섞어 올리므로 첫 장은 자르지 않고(원래 비율, 세로는 4:5까지),
// 둘째 장부터는 2칸 격자 조각으로. 어떤 사진이든 누르면 화면 가득 크게 보고 좌우로 넘긴다.
const sheetSpring = { type: 'spring', bounce: 0, duration: 0.4 };

// 주보: 사진 2장을 각각 세로로 3등분해 6면. 순서는 기존 주보 보기와 같다 (첫 장의 오른쪽 1/3이 1면)
const BULLETIN_SLICES = 3;
const bulletinPages = (images) => {
    const count = images.length * BULLETIN_SLICES;
    return Array.from({ length: count }, (_, page) => {
        const mapped = (page + 2) % count;
        return { src: images[Math.floor(mapped / BULLETIN_SLICES)], slice: mapped % BULLETIN_SLICES };
    });
};

// 둘째 장부터 격자에 4칸까지. 더 있으면 넷째 칸에 '+남은 수'
const GRID_MAX = 4;

const CloseIcon = () => (
    <svg viewBox="0 0 36 36" aria-hidden="true">
        <path d="M13 13l10 10M23 13L13 23" />
    </svg>
);

const Chevron = ({ dir }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d={dir === 'left' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} />
    </svg>
);

// 주보 한 면: 가로로 긴 원본의 1/3만 보이는 칸. 칸 비율 = (원본 폭 / 3) : 원본 높이
const SlicedImage = ({ src, slice, ratio, className, onRatio }) => (
    <span className={`${styles.slice} ${className || ''}`} style={{ aspectRatio: ratio, '--ratio': ratio }}>
        <img
            src={src}
            alt=""
            style={{ left: `${-slice * 100}%` }}
            onLoad={onRatio ? (e) => onRatio(e.currentTarget.naturalWidth / BULLETIN_SLICES / e.currentTarget.naturalHeight) : undefined}
        />
    </span>
);

// 가로로 밀어 넘기기 (손가락·마우스 공통). 40px 넘게 밀면 넘기고, 그 뒤에 오는 click은 무시
const useSwipe = (onPrev, onNext) => {
    const start = useRef(null);
    const swiped = useRef(false);
    return {
        onPointerDown: (e) => { start.current = e.clientX; swiped.current = false; },
        onPointerUp: (e) => {
            if (start.current === null) return;
            const dx = e.clientX - start.current;
            start.current = null;
            if (Math.abs(dx) > 40) {
                swiped.current = true;
                if (dx < 0) onNext(); else onPrev();
            }
        },
        wasSwipe: () => swiped.current,
    };
};

const PostSheet = ({
    meta,
    title,
    facts = [],
    images = [],
    bulletin = [],
    description,
    extra,
    loading = false,
    onClose,
    children,
}) => {
    const reduceMotion = useReducedMotion();
    const sheetRef = useRef(null);
    const zoomCloseRef = useRef(null);
    const textRef = useRef(null);

    const pages = bulletin.length > 0 ? bulletinPages(bulletin) : [];
    const [pageIndex, setPageIndex] = useState(0);
    const [pageRatio, setPageRatio] = useState(0.47); // A3 가로 주보의 1/3 쯤. 첫 장을 불러오면 실제 비율로

    // 크게 보기: 사진이면 images, 주보면 pages를 넘긴다
    const zoomItems = pages.length > 0 ? pages : images.map((src) => ({ src, slice: null }));
    const [zoomIndex, setZoomIndex] = useState(null);
    const zoomCount = zoomItems.length;
    const zoomPrev = () => setZoomIndex((i) => (i > 0 ? i - 1 : i));
    const zoomNext = () => setZoomIndex((i) => (i < zoomCount - 1 ? i + 1 : i));
    const zoomSwipe = useSwipe(zoomPrev, zoomNext);

    const pagePrev = () => setPageIndex((i) => Math.max(0, i - 1));
    const pageNext = () => setPageIndex((i) => Math.min(pages.length - 1, i + 1));
    const pageSwipe = useSwipe(pagePrev, pageNext);

    // Esc: 크게 보기가 열려 있으면 그것만, 아니면 팝업을 닫는다. 크게 보기에선 좌우 화살표 키로 넘긴다
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') {
                if (zoomIndex !== null) setZoomIndex(null);
                else onClose();
            } else if (zoomIndex !== null && e.key === 'ArrowLeft') {
                zoomPrev();
            } else if (zoomIndex !== null && e.key === 'ArrowRight') {
                zoomNext();
            }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    });

    useEffect(() => {
        sheetRef.current?.focus({ preventScroll: true });
    }, []);

    // 본문: Viewer가 그린 직후(화면에 보이기 전) 빈 줄·번호 문단·쪼개진 목록 같은 구조를 바로잡는다 (저장된 글은 그대로)
    // Viewer가 나중에 본문을 다시 그리는 경우도 있어, 바뀔 때마다 아직 정리 안 된 본문이면 다시 정리한다
    useLayoutEffect(() => {
        const box = textRef.current;
        if (!box) return undefined;
        const clean = () => {
            const contents = box.querySelector('.toastui-editor-contents');
            if (contents && contents.children.length) cleanPostContents(contents, title);
        };
        clean();
        const observer = new MutationObserver(clean);
        observer.observe(box, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, [description, title]);

    useEffect(() => {
        if (zoomIndex !== null) zoomCloseRef.current?.focus();
    }, [zoomIndex !== null]); // eslint-disable-line react-hooks/exhaustive-deps

    const enter = reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 };
    const [firstImage, ...restImages] = images;
    const gridImages = restImages.slice(0, GRID_MAX);
    const hiddenCount = restImages.length - GRID_MAX;
    const zoomItem = zoomIndex !== null ? zoomItems[zoomIndex] : null;

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
                aria-labelledby="post-sheet-title"
                aria-busy={loading || undefined}
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
                    {loading ? (
                        <p id="post-sheet-title" className={styles.loading}>게시물을 불러오고 있어요.</p>
                    ) : (
                        <>
                            {meta && <p className={styles.date}>{meta}</p>}
                            <h1 id="post-sheet-title" className={styles.title}>{title}</h1>

                            {facts.length > 0 && (
                                <dl className={styles.facts}>
                                    {facts.map((fact) => (
                                        <div key={fact.label} className={styles.fact}>
                                            <dt>{fact.label}</dt>
                                            <dd>{fact.href ? <a href={fact.href}>{fact.value}</a> : fact.value}</dd>
                                        </div>
                                    ))}
                                </dl>
                            )}

                            {/* 주보: 한 면씩 넘기기 + 6면 작은 그림 */}
                            {pages.length > 0 && (
                                <div className={styles.bulletin}>
                                    <div
                                        className={styles.bulletinStage}
                                        onPointerDown={pageSwipe.onPointerDown}
                                        onPointerUp={pageSwipe.onPointerUp}
                                    >
                                        <button
                                            type="button"
                                            className={`${styles.pageNav} ${styles.pageNavPrev}`}
                                            aria-label="이전 면"
                                            disabled={pageIndex === 0}
                                            onClick={pagePrev}
                                        >
                                            <Chevron dir="left" />
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.bulletinPage}
                                            aria-label={`주보 ${pageIndex + 1}면 크게 보기`}
                                            onClick={() => { if (!pageSwipe.wasSwipe()) setZoomIndex(pageIndex); }}
                                        >
                                            <SlicedImage
                                                key={pageIndex}
                                                src={pages[pageIndex].src}
                                                slice={pages[pageIndex].slice}
                                                ratio={pageRatio}
                                                className={styles.bulletinSlice}
                                                onRatio={setPageRatio}
                                            />
                                        </button>
                                        <button
                                            type="button"
                                            className={`${styles.pageNav} ${styles.pageNavNext}`}
                                            aria-label="다음 면"
                                            disabled={pageIndex === pages.length - 1}
                                            onClick={pageNext}
                                        >
                                            <Chevron dir="right" />
                                        </button>
                                    </div>
                                    <p className={styles.pageCount} aria-live="polite">{pageIndex + 1} / {pages.length}면</p>
                                    <div className={styles.thumbs} role="group" aria-label="주보 면 고르기">
                                        {pages.map((page, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                className={styles.thumb}
                                                aria-label={`${i + 1}면`}
                                                aria-pressed={i === pageIndex}
                                                onClick={() => setPageIndex(i)}
                                            >
                                                <SlicedImage src={page.src} slice={page.slice} ratio={pageRatio} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 사진: 첫 장 크게(자르지 않음) + 나머지 2칸 격자 */}
                            {pages.length === 0 && firstImage && (
                                <div className={styles.photos}>
                                    <button
                                        type="button"
                                        className={styles.photo}
                                        aria-label={images.length > 1 ? `사진 1 크게 보기, 모두 ${images.length}장` : '사진 크게 보기'}
                                        onClick={() => setZoomIndex(0)}
                                    >
                                        <img src={firstImage} alt="" decoding="async" />
                                    </button>
                                    {gridImages.length > 0 && (
                                        <div className={styles.photoGrid}>
                                            {gridImages.map((src, i) => {
                                                const index = i + 1;
                                                const more = i === GRID_MAX - 1 && hiddenCount > 0;
                                                return (
                                                    <button
                                                        key={src}
                                                        type="button"
                                                        className={styles.tile}
                                                        aria-label={more ? `사진 ${index + 1}부터 ${images.length}까지 크게 보기` : `사진 ${index + 1} 크게 보기`}
                                                        onClick={() => setZoomIndex(index)}
                                                    >
                                                        <img src={src} alt="" loading="lazy" decoding="async" />
                                                        {more && <span className={styles.more} aria-hidden="true">+{hiddenCount + 1}</span>}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {description && (
                                <div ref={textRef} className={styles.text}>
                                    <Viewer key={description} initialValue={description} />
                                </div>
                            )}

                            {extra && <div className={styles.extra}>{extra}</div>}

                            {/* 직접 그리는 본문 (개인정보처리방침·이용약관처럼 편집기 글이 아닌 것) */}
                            {children}
                        </>
                    )}
                </div>
            </motion.article>

            {/* 크게 보기: 자르지 않고 화면에 맞춰 통째로. 여러 장이면 좌우로 넘긴다 */}
            <AnimatePresence>
                {zoomItem && (
                    <motion.div
                        className={styles.zoom}
                        role="dialog"
                        aria-modal="true"
                        aria-label={pages.length > 0 ? '주보 크게 보기' : '사진 크게 보기'}
                        onClick={(e) => { e.stopPropagation(); if (!zoomSwipe.wasSwipe()) setZoomIndex(null); }}
                        onPointerDown={zoomSwipe.onPointerDown}
                        onPointerUp={zoomSwipe.onPointerUp}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <button ref={zoomCloseRef} type="button" className={`${styles.close} ${styles.zoomClose}`} aria-label="크게 보기 닫기">
                            <span className={styles.closeIcon}><CloseIcon /></span>
                        </button>
                        {zoomCount > 1 && (
                            <p className={styles.zoomCount} aria-live="polite">
                                {zoomIndex + 1} / {zoomCount}{pages.length > 0 ? '면' : ''}
                            </p>
                        )}
                        <motion.div
                            key={zoomIndex}
                            className={styles.zoomStage}
                            initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={reduceMotion ? { duration: 0 } : sheetSpring}
                        >
                            {zoomItem.slice === null ? (
                                <img src={zoomItem.src} alt="" className={styles.zoomImg} draggable="false" />
                            ) : (
                                <SlicedImage src={zoomItem.src} slice={zoomItem.slice} ratio={pageRatio} className={styles.zoomSlice} />
                            )}
                        </motion.div>
                        {zoomCount > 1 && (
                            <>
                                <button
                                    type="button"
                                    className={`${styles.zoomNav} ${styles.zoomNavPrev}`}
                                    aria-label="이전"
                                    disabled={zoomIndex === 0}
                                    onClick={(e) => { e.stopPropagation(); zoomPrev(); }}
                                >
                                    <Chevron dir="left" />
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.zoomNav} ${styles.zoomNavNext}`}
                                    aria-label="다음"
                                    disabled={zoomIndex === zoomCount - 1}
                                    onClick={(e) => { e.stopPropagation(); zoomNext(); }}
                                >
                                    <Chevron dir="right" />
                                </button>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default PostSheet;

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import Footer from '../components/Footer';
import Pagination from '../components/ui/Pagination';
import PickerPopover from '../components/ui/PickerPopover';
import PageTopGradient from '../components/PageTopGradient';
import { GALLERY_CATEGORIES, galleryCategoryLabel, galleryPeriod, galleryImageUrl } from '../lib/gallery';
// 목록 틀은 미디어룸(예배영상)과 같다
import styles from './MediaPage.module.css';
import gallery from './GalleryPage.module.css';

// 나눔터 > 갤러리. 앨범은 관리자 '갤러리 관리'에서 올린다 (Firestore nextgenGallery, 사진은 R2)
const FILTERS = [{ id: 'all', label: '전체' }, ...GALLERY_CATEGORIES];
const PER_PAGE = 10;
const ease = [0.16, 1, 0.3, 1];

const ChevronDown = () => (
    <svg viewBox="0 0 36 36" aria-hidden="true">
        <circle cx="18" cy="18" r="17" strokeWidth="2" />
        <polyline points="11.9,15.4 18,21.5 24.1,15.4" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const CheckIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const CameraIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
        <circle cx="12" cy="13" r="3.5" />
    </svg>
);

const coverOf = (album) => album.photos?.find((photo) => photo.id === album.cover) || album.photos?.[0];

// 목록용(가로·세로 긴 쪽 480px)과 크게 보기용 사진을 함께 주고, 화면 폭에 맞는 쪽을 브라우저가 고르게 한다
const coverSrcSet = (photo) => {
    if (!photo.width || !photo.height) return undefined;
    const thumbWidth = Math.round((480 * photo.width) / Math.max(photo.width, photo.height));
    return `${galleryImageUrl(photo.thumb)} ${thumbWidth}w, ${galleryImageUrl(photo.full)} ${photo.width}w`;
};

// 팝업 동안 뒤 페이지 스크롤을 멈추고, 초점을 팝업 안에서만 돌게 한다 (교회 안내 평면도 창과 같음)
const useModal = (open, onClose, panelRef) => {
    useEffect(() => {
        if (!open) return undefined;
        const returnFocus = document.activeElement;
        window.lenis?.stop();
        const { overflow } = document.documentElement.style;
        document.documentElement.style.overflow = 'hidden';
        panelRef.current?.focus({ preventScroll: true });

        const onKey = (e) => {
            if (e.key === 'Escape') {
                onClose();
                return;
            }
            if (e.key !== 'Tab' || !panelRef.current) return;
            const items = panelRef.current.querySelectorAll('button:not(:disabled)');
            if (!items.length) return;
            const first = items[0];
            const last = items[items.length - 1];
            if (e.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('keydown', onKey);
            document.documentElement.style.overflow = overflow;
            window.lenis?.start();
            returnFocus?.focus?.({ preventScroll: true });
        };
    }, [open, onClose, panelRef]);
};

// 게시물 팝업: 왼쪽 큰 사진 넘기기, 오른쪽 글과 작은 사진 모아 보기 (휴대폰은 사진 위, 글 아래)
const AlbumViewer = ({ album, onClose }) => {
    const panelRef = useRef(null);
    const swipeStart = useRef(null);
    // 다른 앨범을 열면 첫 사진부터 (닫히는 동안에도 마지막 사진을 그대로 보여 준다)
    const [view, setView] = useState({ albumId: null, index: 0 });
    const reduceMotion = useReducedMotion();
    useModal(Boolean(album), onClose, panelRef);

    const photos = album?.photos ?? [];
    const last = photos.length - 1;
    const index = view.albumId === album?.id ? view.index : 0;
    const go = useCallback(
        (next) => setView({ albumId: album?.id, index: Math.max(0, Math.min(last, next)) }),
        [album?.id, last],
    );

    useEffect(() => {
        if (!album) return undefined;
        const onKey = (e) => {
            if (e.key === 'ArrowLeft') go(index - 1);
            if (e.key === 'ArrowRight') go(index + 1);
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [album, index, go]);

    // 옆 사진을 미리 받아 두어 넘길 때 바로 보이게 한다
    useEffect(() => {
        const list = album?.photos ?? [];
        [list[index - 1], list[index + 1]].forEach((item) => {
            if (item) new Image().src = galleryImageUrl(item.full);
        });
    }, [album, index]);

    const photo = photos[index];

    return createPortal(
        <AnimatePresence>
            {album && photo && (
                <motion.div
                    ref={panelRef}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="album-title"
                    tabIndex={-1}
                    data-lenis-prevent
                    className={gallery.viewer}
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={reduceMotion ? { duration: 0 } : { duration: 0.35, ease }}
                >
                    <button type="button" className={gallery.close} aria-label="닫기" onClick={onClose}>
                        <span className={gallery.closeIcon}>
                            <svg viewBox="0 0 36 36" aria-hidden="true"><path d="M13 13l10 10M23 13L13 23" /></svg>
                        </span>
                    </button>

                    <div
                        className={gallery.stage}
                        onPointerDown={(e) => { swipeStart.current = e.clientX; }}
                        onPointerUp={(e) => {
                            if (swipeStart.current === null) return;
                            const dx = e.clientX - swipeStart.current;
                            swipeStart.current = null;
                            if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
                        }}
                    >
                        <img
                            key={photo.id}
                            className={gallery.stageImg}
                            src={galleryImageUrl(photo.full)}
                            width={photo.width}
                            height={photo.height}
                            alt={`${album.title} 사진 ${index + 1}`}
                            draggable="false"
                        />
                        {/* 사진이 한 장이면 넘기기 버튼과 장수는 숨긴다 */}
                        {photos.length > 1 && (
                            <>
                                <button type="button" className={`${gallery.arrow} ${gallery.prev}`} aria-label="이전 사진" disabled={index === 0} onClick={() => go(index - 1)}>
                                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
                                </button>
                                <button type="button" className={`${gallery.arrow} ${gallery.next}`} aria-label="다음 사진" disabled={index === last} onClick={() => go(index + 1)}>
                                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
                                </button>
                                <span className={gallery.counter} aria-live="polite">{index + 1} / {photos.length}</span>
                            </>
                        )}
                    </div>

                    <div className={gallery.side}>
                        <p className={gallery.category}>{galleryCategoryLabel(album.dept)}</p>
                        <h2 id="album-title" className={gallery.title}>{album.title}</h2>
                        <p className={gallery.period}>{galleryPeriod(album)}</p>
                        {album.desc && <p className={gallery.desc}>{album.desc}</p>}
                        <p className={gallery.gridLabel}>사진 {photos.length}장</p>
                        <div className={gallery.grid} role="group" aria-label="사진 고르기">
                            {photos.map((item, i) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    className={gallery.gridItem}
                                    aria-label={`사진 ${i + 1}`}
                                    aria-current={i === index}
                                    onClick={() => go(i)}
                                >
                                    <img src={galleryImageUrl(item.thumb)} alt="" loading="lazy" decoding="async" />
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body,
    );
};

const GalleryPage = () => {
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [openAlbum, setOpenAlbum] = useState(null);
    const pickerRef = useRef(null);
    const triggerRef = useRef(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const snapshot = await getDocs(query(collection(db, 'nextgenGallery'), orderBy('date', 'desc')));
                if (!cancelled) {
                    setAlbums(snapshot.docs
                        .map((albumDoc) => ({ id: albumDoc.id, ...albumDoc.data() }))
                        .filter((album) => album.photos?.length > 0));
                }
            } catch (error) {
                console.error('갤러리 불러오기 실패:', error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, []);

    // 바깥을 누르거나 Esc를 누르면 고르기 창을 닫는다
    useEffect(() => {
        if (!pickerOpen) return undefined;
        const onPointer = (e) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target)) setPickerOpen(false);
        };
        const onKey = (e) => {
            if (e.key === 'Escape') {
                setPickerOpen(false);
                triggerRef.current?.focus();
            }
        };
        document.addEventListener('mousedown', onPointer);
        document.addEventListener('touchstart', onPointer);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onPointer);
            document.removeEventListener('touchstart', onPointer);
            document.removeEventListener('keydown', onKey);
        };
    }, [pickerOpen]);

    const closeAlbum = useCallback(() => setOpenAlbum(null), []);

    // '다음세대'(all)로 저장된 예전 앨범은 다음세대 부서를 고르면 함께 보인다
    const matches = (album, filterId) =>
        filterId === 'all' || album.dept === filterId || (album.dept === 'all' && filterId !== 'church');
    const filtered = albums.filter((album) => matches(album, activeTab));
    const totalPages = Math.ceil(filtered.length / PER_PAGE) || 1;
    const pageAlbums = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
    const activeFilter = FILTERS.find((f) => f.id === activeTab) || FILTERS[0];

    const pickFilter = (id) => {
        setActiveTab(id);
        setCurrentPage(1);
        setPickerOpen(false);
        triggerRef.current?.focus();
    };

    return (
        <div className={styles.page}>
            <PageTopGradient />
            <section className={styles.hero}>
                <div className={styles.wrap}>
                    <p className={styles.eyebrow}>갤러리</p>
                    <div className={styles.pickerAnchor} ref={pickerRef}>
                        <h1 className={styles.title}>
                            <button
                                ref={triggerRef}
                                type="button"
                                className={styles.titleButton}
                                aria-haspopup="dialog"
                                aria-expanded={pickerOpen}
                                aria-label={`${activeFilter.label} 사진, 다른 분류 고르기`}
                                onClick={() => setPickerOpen((open) => !open)}
                            >
                                <span>{activeFilter.label}</span>
                                <span className={`${styles.titleChevron} ${pickerOpen ? styles.titleChevronOpen : ''}`}>
                                    <ChevronDown />
                                </span>
                            </button>
                        </h1>

                        <AnimatePresence>
                            {pickerOpen && (
                                <PickerPopover className={styles.picker} label="사진 분류 고르기">
                                    {FILTERS.map((filter) => {
                                        const active = filter.id === activeTab;
                                        const count = albums.filter((album) => matches(album, filter.id)).length;
                                        return (
                                            <button
                                                key={filter.id}
                                                type="button"
                                                className={styles.option}
                                                aria-pressed={active}
                                                onClick={() => pickFilter(filter.id)}
                                            >
                                                <span className={styles.optionCheck}>{active && <CheckIcon />}</span>
                                                <span className={styles.optionLabel}>{filter.label}</span>
                                                {!loading && <span className={styles.optionCount}>{count}</span>}
                                            </button>
                                        );
                                    })}
                                </PickerPopover>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </section>

            <section className={styles.listSection}>
                <div className={styles.wrap}>
                    {loading ? (
                        <ul className={styles.videoList} role="status" aria-label="사진을 불러오고 있어요">
                            {Array.from({ length: 4 }, (_, i) => (
                                <li key={i} className={styles.videoItem} aria-hidden="true">
                                    <span className={`${styles.thumb} ${styles.skeleton}`} />
                                    <span className={styles.info}>
                                        <span className={`${styles.skeleton} ${styles.skeletonShort}`} />
                                        <span className={`${styles.skeleton} ${styles.skeletonLine}`} />
                                        <span className={`${styles.skeleton} ${styles.skeletonShort}`} />
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <>
                            <ul key={`${activeTab}-${currentPage}`} className={`${styles.videoList} ${styles.videoListIn}`} aria-label={`${activeFilter.label} 사진`}>
                                {pageAlbums.map((album) => {
                                    const cover = coverOf(album);
                                    return (
                                        <li key={album.id} className={styles.videoItem}>
                                            <button
                                                type="button"
                                                className={`${styles.videoLink} ${gallery.albumButton}`}
                                                aria-haspopup="dialog"
                                                onClick={() => setOpenAlbum(album)}
                                            >
                                                <span className={`${styles.thumb} ${gallery.thumb}`}>
                                                    <img
                                                        src={galleryImageUrl(cover.thumb)}
                                                        srcSet={coverSrcSet(cover)}
                                                        sizes="(max-width: 767px) 100vw, 296px"
                                                        alt=""
                                                        loading="lazy"
                                                        decoding="async"
                                                    />
                                                    <span className={gallery.count}>
                                                        <CameraIcon />
                                                        <span className={gallery.srOnly}>사진 </span>
                                                        {album.photos.length}
                                                        <span className={gallery.srOnly}>장</span>
                                                    </span>
                                                </span>
                                                <span className={styles.info}>
                                                    <span className={styles.category}>{galleryCategoryLabel(album.dept)}</span>
                                                    <span className={styles.videoTitle}>{album.title}</span>
                                                    <span className={styles.meta}>{galleryPeriod(album)}</span>
                                                </span>
                                            </button>
                                        </li>
                                    );
                                })}
                                {filtered.length === 0 && (
                                    <li className={styles.empty}>아직 올라온 사진이 없어요.</li>
                                )}
                            </ul>
                            {filtered.length > PER_PAGE && (
                                <div className={styles.paginationWrap}>
                                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
            <Footer />

            <AlbumViewer album={openAlbum} onClose={closeAlbum} />
        </div>
    );
};

export default GalleryPage;

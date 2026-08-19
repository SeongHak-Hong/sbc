import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'framer-motion';
import { Viewer } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import Footer from '../components/Footer';
import SubPageSection from '../components/SubPageSection';
import LargeButton from '../components/ui/LargeButton';
import styles from './PostDetailPage.module.css';
import dummyImg from '../assets/news/260628-church-bulletin-01.webp';
import NaverMap from '../components/ui/NaverMap';
import thumbKindergarten from '../assets/nextgen/shintanjin-baptist-church-nextgen-thumb.webp';
import thumbElementary from '../assets/nextgen/shintanjin-baptist-church-nextgen-thumb-01.webp';
import thumbYouth from '../assets/nextgen/shintanjin-baptist-church-nextgen-thumb-02.webp';
import thumbYoungAdults from '../assets/nextgen/shintanjin-baptist-church-nextgen-thumb-03.webp';

const defaultThumbs = {
    kindergarten: thumbKindergarten,
    elementary: thumbElementary,
    youth: thumbYouth,
    youngadults: thumbYoungAdults
};

const PinchZoomContainer = ({ children, onSwipeLeft, onSwipeRight }) => {
    const [scale, setScale] = useState(1);
    const [translate, setTranslate] = useState({ x: 0, y: 0 });

    const touchStartRef = useRef({ dist: 0, scale: 1, x: 0, y: 0, panX: 0, panY: 0 });
    const lastTapRef = useRef(0);

    const resetZoom = () => {
        setScale(1);
        setTranslate({ x: 0, y: 0 });
    };

    const handleTouchStart = (e) => {
        const now = Date.now();
        if (e.touches.length === 1) {
            // Double tap to zoom
            if (now - lastTapRef.current < 300) {
                if (scale > 1) {
                    resetZoom();
                } else {
                    setScale(2.5);
                    setTranslate({ x: 0, y: 0 });
                }
                lastTapRef.current = 0;
                return;
            }
            lastTapRef.current = now;

            touchStartRef.current = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
                panX: translate.x,
                panY: translate.y,
                scale,
                dist: 0
            };
        } else if (e.touches.length === 2) {
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            touchStartRef.current = {
                dist,
                scale,
                x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
                y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
                panX: translate.x,
                panY: translate.y
            };
        }
    };

    const handleTouchMove = (e) => {
        if (e.touches.length === 2 && touchStartRef.current.dist > 0) {
            if (e.cancelable) e.preventDefault();
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            const factor = dist / touchStartRef.current.dist;
            const newScale = Math.min(4, Math.max(1, touchStartRef.current.scale * factor));

            setScale(newScale);
            if (newScale <= 1) {
                setTranslate({ x: 0, y: 0 });
            }
        } else if (e.touches.length === 1) {
            const deltaX = e.touches[0].clientX - touchStartRef.current.x;
            const deltaY = e.touches[0].clientY - touchStartRef.current.y;

            if (scale > 1) {
                if (e.cancelable) e.preventDefault();
                setTranslate({
                    x: touchStartRef.current.panX + deltaX,
                    y: touchStartRef.current.panY + deltaY
                });
            }
        }
    };

    const handleTouchEnd = (e) => {
        if (scale === 1 && e.changedTouches.length === 1 && touchStartRef.current.x) {
            const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
            if (deltaX < -40 && onSwipeRight) {
                onSwipeRight();
            } else if (deltaX > 40 && onSwipeLeft) {
                onSwipeLeft();
            }
        }

        if (scale < 1.05) {
            resetZoom();
        }
    };

    return (
        <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
                width: '100%',
                overflow: 'hidden',
                touchAction: scale > 1 ? 'none' : 'pan-y',
                position: 'relative',
                userSelect: 'none',
                WebkitUserSelect: 'none'
            }}
        >
            <div
                style={{
                    transform: `translate3d(${translate.x}px, ${translate.y}px, 0) scale(${scale})`,
                    transformOrigin: 'center center',
                    transition: touchStartRef.current.dist ? 'none' : 'transform 0.15s ease-out',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                {children}
            </div>
        </div>
    );
};

const ImageViewer = ({ imageUrl, totalPages = 3, images = [], isBulletin = true }) => {
    const actualImages = images.length > 0 ? images : (imageUrl ? [imageUrl] : []);
    const count = isBulletin ? actualImages.length * totalPages : actualImages.length;
    const [currentIndex, setCurrentIndex] = useState(0);

    if (count === 0) return null;

    const renderMainImage = (index) => {
        if (isBulletin) {
            const totalWidth = count * 100;
            const translateX = (index / count) * 100;

            return (
                <div style={{
                    display: 'flex',
                    width: `${totalWidth}%`,
                    transform: `translateX(-${translateX}%)`,
                    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                    {Array.from({ length: count }).map((_, idx) => {
                        const mappedIndex = (idx + 2) % count;
                        const imageIndex = Math.floor(mappedIndex / totalPages);
                        const sliceIndex = mappedIndex % totalPages;

                        return (
                            <div key={idx} style={{
                                width: `${100 / count}%`,
                                overflow: 'hidden',
                                flexShrink: 0
                            }}>
                                <img
                                    src={actualImages[imageIndex]}
                                    alt={`주보 원본 ${idx + 1}`}
                                    style={{
                                        width: `${totalPages * 100}%`,
                                        maxWidth: 'none',
                                        height: 'auto',
                                        marginLeft: `-${sliceIndex * 100}%`,
                                        display: 'block'
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>
            );
        } else {
            return (
                <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '60vh',
                    minHeight: '400px',
                    maxHeight: '800px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#111',
                    overflow: 'hidden'
                }}>
                    {/* Blurred Background Layer */}
                    <div style={{
                        position: 'absolute',
                        top: '-10%',
                        left: '-10%',
                        width: '120%',
                        height: '120%',
                        backgroundImage: `url(${actualImages[index]})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'blur(20px)',
                        opacity: 0.4,
                        zIndex: 0,
                        transform: 'translateZ(0)',
                        willChange: 'transform, filter'
                    }} />

                    {/* Main Image */}
                    <img
                        src={actualImages[index]}
                        alt={`첨부 이미지 ${index + 1}`}
                        style={{
                            position: 'relative',
                            zIndex: 1,
                            maxWidth: '100%',
                            maxHeight: '100%',
                            width: 'auto',
                            height: 'auto',
                            objectFit: 'contain'
                        }}
                    />
                </div>
            );
        }
    };

    const renderThumbnail = (index) => {
        const mappedIndex = isBulletin ? (index + 2) % count : index;
        const imageIndex = isBulletin ? Math.floor(mappedIndex / totalPages) : index;
        const sliceIndex = isBulletin ? mappedIndex % totalPages : 0;

        if (isBulletin) {
            return (
                <img
                    src={actualImages[imageIndex]}
                    alt={`주보 썸네일 ${index + 1}면`}
                    style={{ left: `-${sliceIndex * 100}%` }}
                    className={styles.slicedImage}
                />
            );
        } else {
            return (
                <img
                    src={actualImages[imageIndex]}
                    alt={`썸네일 ${index + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            );
        }
    };

    return (
        <div
            className={styles.bulletinViewerContainer}
            style={{
                backgroundColor: isBulletin ? 'var(--color-background-beige)' : 'transparent',
                padding: isBulletin ? '40px 32px' : '0'
            }}
        >
            {/* Main Viewer Area */}
            {count > 1 && (
                <div
                    className={styles.mainViewerWrapper}
                    style={{ maxWidth: isBulletin ? '400px' : '100%' }}
                >
                    <button
                        className={`${styles.navButton} ${styles.prevButton}`}
                        onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentIndex === 0}
                        aria-label="이전 이미지"
                    >
                        <span className="material-symbols-outlined" translate="no">chevron_left</span>
                    </button>

                    <div className={styles.mainViewer}>
                        <PinchZoomContainer
                            key={currentIndex}
                            onSwipeLeft={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                            onSwipeRight={() => setCurrentIndex(prev => Math.min(count - 1, prev + 1))}
                        >
                            <div className={isBulletin ? styles.bulletinPageWrapper : ''}>
                                {renderMainImage(currentIndex)}
                            </div>
                        </PinchZoomContainer>
                    </div>

                    <button
                        className={`${styles.navButton} ${styles.nextButton}`}
                        onClick={() => setCurrentIndex(prev => Math.min(count - 1, prev + 1))}
                        disabled={currentIndex === count - 1}
                        aria-label="다음 이미지"
                    >
                        <span className="material-symbols-outlined" translate="no">chevron_right</span>
                    </button>
                </div>
            )}

            {count === 1 && (
                <div className={styles.mainViewerWrapper} style={{ maxWidth: isBulletin ? '400px' : '100%' }}>
                    <div className={styles.mainViewer}>
                        <PinchZoomContainer>
                            <div className={isBulletin ? styles.bulletinPageWrapper : ''}>
                                {renderMainImage(0)}
                            </div>
                        </PinchZoomContainer>
                    </div>
                </div>
            )}

            {/* Thumbnail Strip */}
            {count > 1 && (
                <div className={styles.thumbnailStrip}>
                    {Array.from({ length: count }).map((_, idx) => (
                        <div
                            key={idx}
                            className={`${styles.thumbnailWrapper} ${idx === currentIndex ? styles.activeThumbnail : ''}`}
                            onClick={() => setCurrentIndex(idx)}
                        >
                            <div className={styles.thumbnailInner}>
                                {renderThumbnail(idx)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const PostDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [post, setPost] = useState(location.state || null);
    const [loading, setLoading] = useState(!post);

    const lastFetchedId = useRef(null);

    useEffect(() => {
        window.scrollTo(0, 0);

        if (location.state) {
            setPost(location.state);
            setLoading(false);
            return;
        }

        if (id && lastFetchedId.current !== id) {
            lastFetchedId.current = id;
            fetchPostFromFirestore();
        }
    }, [id, location.state]);

    const fetchPostFromFirestore = async () => {
        try {
            let targetCollection = 'posts';
            let actualId = id;

            if (id.startsWith('nextgen-')) {
                const parts = id.split('-');
                if (parts.length === 3) {
                    const deptId = parts[1];
                    const index = parseInt(parts[2], 10);
                    const docRef = doc(db, 'nextgen', deptId);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        if (data.events && data.events[index]) {
                            const ev = data.events[index];
                            let displayDate = ev.date;
                            const formatDate = (dateStr) => {
                                if (!dateStr) return '';
                                const [y, m, d] = dateStr.split('-');
                                return `${y}. ${parseInt(m)}. ${parseInt(d)}.`;
                            };
                            if (ev.startDate || ev.endDate) {
                                const startStr = formatDate(ev.startDate);
                                const endStr = formatDate(ev.endDate);
                                if (startStr && endStr) displayDate = `${startStr} ~ ${endStr}`;
                                else if (startStr) displayDate = startStr;
                                else if (endStr) displayDate = endStr;
                            }

                            let formattedContent = '';
                            if (ev.time) formattedContent += `🕒 시간: ${ev.time}  \n`;
                            if (ev.location) formattedContent += `🚩 장소: ${ev.location}  \n`;
                            if (formattedContent) formattedContent += `\n`;
                            formattedContent += ev.desc || '';

                            setPost({
                                title: ev.title,
                                author: data.name,
                                date: displayDate,
                                content: formattedContent,
                                imageUrl: ev.img || defaultThumbs[deptId] || thumbKindergarten,
                                imageUrls: ev.imageUrls || [defaultThumbs[deptId] || thumbKindergarten]
                            });
                            return;
                        }
                    }
                }
                alert('해당 게시물을 직접 주소로 접근할 수 없습니다.');
                navigate(-1);
                return;
            }

            if (id.includes('_')) {
                const parts = id.split('_');
                targetCollection = parts[0];
                actualId = parts.slice(1).join('_');

                if (targetCollection === 'network') {
                    targetCollection = 'memberBusiness';
                } else if (targetCollection === 'koinonia') {
                    targetCollection = 'membersNews';
                }

                if (targetCollection === 'schedules') {
                    const querySnapshot = await getDocs(collection(db, 'monthly'));
                    let foundEvent = null;
                    querySnapshot.forEach(docSnap => {
                        const data = docSnap.data();
                        if (data.schedules) {
                            const ev = data.schedules.find(s => s.id === actualId);
                            if (ev) foundEvent = ev;
                        }
                    });

                    if (foundEvent) {
                        const displayDate = `${foundEvent.month} ${foundEvent.date}일 (${foundEvent.day[0]})`;
                        const eventDateStr = `📅 날짜: ${displayDate}`;
                        const timeStr = foundEvent.time ? `🕒 시간: ${foundEvent.time}` : '';
                        const locStr = foundEvent.location ? `🚩 장소: ${foundEvent.location}` : '';
                        const contentStr = foundEvent.content ? `\n\n${foundEvent.content}` : '';
                        const contentBody = [eventDateStr, timeStr, locStr, contentStr].filter(Boolean).join('\n\n');

                        setPost({
                            title: foundEvent.title,
                            author: '신탄진침례교회',
                            date: displayDate,
                            content: contentBody,
                            category: 'schedule'
                        });
                        return;
                    }
                    alert('존재하지 않는 게시물입니다.');
                    navigate(-1);
                    return;
                }
            }

            const docRef = doc(db, targetCollection, actualId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                setPost({ id: docSnap.id, ...data });

                await updateDoc(docRef, {
                    views: increment(1)
                });
            } else {
                alert('존재하지 않는 게시물입니다.');
                navigate(-1);
            }
        } catch (error) {
            console.error('게시물 불러오기 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>로딩 중...</div>;
    }

    if (!post) return null;

    let authorLabel = "작성자";
    let authorText = "관리자";

    if (id && (id.startsWith('network_') || id.startsWith('memberBusiness_'))) {
        authorLabel = "운영 성도";
        authorText = post.author === '관리자' ? '확인 필요' : (post.author || '관리자');
    } else {
        if (post.author) authorText = post.author;
        else if (post.category === 'news') authorText = "신탄진침례교회";
        else if (post.category === 'bulletin') authorText = "사무국";
        else if (post.category === 'schedule') authorText = "신탄진침례교회";
    }

    // Extract images correctly for ImageViewer
    let viewerImages = [];
    if (post.imageUrls && post.imageUrls.length > 0) {
        viewerImages = post.imageUrls.map(img => typeof img === 'string' ? img : img.url);
    } else if (post.imageUrl) {
        viewerImages = [post.imageUrl];
    } else if (post.images && post.images.length > 0) { // legacy fallback
        viewerImages = post.images;
    }

    return (
        <div className={styles.pageWrapper}>
            <SubPageSection title="나눔터" hideHeader={true}>
                <div className={styles.contentWrapper}>
                    <motion.div
                        className={styles.postContainer}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {/* Post Header */}
                        <div className={styles.postHeader}>
                            <h1 className={styles.postTitle}>{post.title}</h1>
                            <div className={styles.postMeta}>
                                <span>{authorLabel}: {authorText}</span>
                                <span className={styles.metaDivider}>|</span>
                                <span>{post.date}</span>
                                {post.views !== undefined && (
                                    <>
                                        <span className={styles.metaDivider}>|</span>
                                        <span>조회수 {post.views}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Post Body */}
                        <div className={styles.postBody}>
                            {viewerImages.length > 0 && (
                                <div style={{ marginBottom: '32px' }}>
                                    <ImageViewer
                                        imageUrl={viewerImages.length === 1 ? viewerImages[0] : null}
                                        images={viewerImages.length > 1 ? viewerImages : []}
                                        totalPages={3} // this handles CSS slicing fallback if needed
                                        isBulletin={post.category === 'bulletin'}
                                    />
                                </div>
                            )}

                            {post.address && (
                                <div style={{ marginBottom: '32px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                    <NaverMap
                                        address={post.address}
                                        detailAddress={post.detailAddress}
                                        title={post.title}
                                        category={post.businessCategory}
                                        phone={post.phone}
                                    />
                                </div>
                            )}

                            {post.content && (
                                <div style={{ marginTop: '24px' }}>
                                    <style>
                                        {`
                                        .toastui-editor-contents, .ProseMirror {
                                            color: var(--color-text-tertiary) !important;
                                            font-size: 16px !important;
                                        }
                                        .toastui-editor-contents *:not(table), .ProseMirror *:not(table) {
                                        }
                                        .toastui-editor-contents p, .ProseMirror p,
                                        .toastui-editor-contents span, .ProseMirror span,
                                        .toastui-editor-contents li, .ProseMirror li {
                                            font-size: 16px !important;
                                        }
                                        .toastui-editor-contents h1, .ProseMirror h1,
                                        .toastui-editor-contents h2, .ProseMirror h2,
                                        .toastui-editor-contents h3, .ProseMirror h3,
                                        .toastui-editor-contents h4, .ProseMirror h4,
                                        .toastui-editor-contents h5, .ProseMirror h5,
                                        .toastui-editor-contents h6, .ProseMirror h6 {
                                            border-bottom: none !important;
                                            color: var(--color-text-primary) !important;
                                            margin-top: 1.2em !important;
                                            margin-bottom: 0.5em !important;
                                            word-break: keep-all !important;
                                        }
                                        .toastui-editor-contents h1, .ProseMirror h1 { font-size: 36px !important; }
                                        .toastui-editor-contents h2, .ProseMirror h2 { font-size: 32px !important; }
                                        .toastui-editor-contents h3, .ProseMirror h3 { font-size: 28px !important; }
                                        .toastui-editor-contents h4, .ProseMirror h4 { font-size: 24px !important; }
                                        .toastui-editor-contents h5, .ProseMirror h5 { font-size: 20px !important; }
                                        .toastui-editor-contents h6, .ProseMirror h6 { font-size: 18px !important; }
                                        `}
                                    </style>
                                    <Viewer initialValue={post.content} />
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className={styles.buttonWrapper}>
                            <LargeButton
                                onClick={() => navigate(-1)}
                            >
                                목록으로
                            </LargeButton>
                        </div>
                    </motion.div>
                </div>
            </SubPageSection>
            <Footer />
        </div>
    );
};

export default PostDetailPage;

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'framer-motion';
import { Viewer } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import Footer from '../components/Footer';
import SubPageSection from '../components/SubPageSection';
import SuitButton from '../components/ui/SuitButton';
import styles from './PostDetailPage.module.css';
import dummyImg from '../assets/news/260628-church-bulletin-01.webp';

const ImageViewer = ({ imageUrl, totalPages = 3, images = [], isBulletin = true }) => {
    const actualImages = images.length > 0 ? images : (imageUrl ? [imageUrl] : []);
    const count = isBulletin ? actualImages.length * totalPages : actualImages.length;
    const [currentIndex, setCurrentIndex] = useState(0);
    
    // Touch event states for swiping
    const [touchStartX, setTouchStartX] = useState(null);
    const [touchEndX, setTouchEndX] = useState(null);

    if (count === 0) return null;

    const minSwipeDistance = 40;

    const onTouchStart = (e) => {
        setTouchEndX(null);
        setTouchStartX(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEndX(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStartX || !touchEndX) return;
        const distance = touchStartX - touchEndX;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && currentIndex < count - 1) {
            setCurrentIndex(prev => prev + 1);
        } else if (isRightSwipe && currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const renderMainImage = (index) => {
        if (isBulletin) {
            const totalWidth = actualImages.length * totalPages * 100;
            const translateX = (currentIndex / (actualImages.length * totalPages)) * 100;
            
            return (
                <div style={{ 
                    display: 'flex', 
                    width: `${totalWidth}%`,
                    transform: `translateX(-${translateX}%)`,
                    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                    {actualImages.map((img, idx) => (
                        <img 
                            key={idx}
                            src={img} 
                            alt={`주보 원본 ${idx + 1}`} 
                            style={{ 
                                width: `${100 / actualImages.length}%`, 
                                maxWidth: 'none',
                                height: 'auto',
                                flexShrink: 0,
                                display: 'block'
                            }} 
                        />
                    ))}
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
                        zIndex: 0
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
        const imageIndex = isBulletin ? Math.floor(index / totalPages) : index;
        const sliceIndex = isBulletin ? index % totalPages : 0;
        
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
                    style={{ maxWidth: isBulletin ? '400px' : '100%', touchAction: 'pan-y' }}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    <button 
                        className={`${styles.navButton} ${styles.prevButton}`}
                        onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentIndex === 0}
                        aria-label="이전 이미지"
                    >
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    
                    <div className={styles.mainViewer}>
                        <div className={isBulletin ? styles.bulletinPageWrapper : ''}>
                            {renderMainImage(currentIndex)}
                        </div>
                    </div>

                    <button 
                        className={`${styles.navButton} ${styles.nextButton}`}
                        onClick={() => setCurrentIndex(prev => Math.min(count - 1, prev + 1))}
                        disabled={currentIndex === count - 1}
                        aria-label="다음 이미지"
                    >
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>
            )}
            
            {count === 1 && (
                <div className={styles.mainViewerWrapper} style={{ maxWidth: isBulletin ? '400px' : '100%' }}>
                    <div className={styles.mainViewer}>
                        <div className={isBulletin ? styles.bulletinPageWrapper : ''}>
                            {renderMainImage(0)}
                        </div>
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
                                <ImageViewer 
                                    imageUrl={viewerImages.length === 1 ? viewerImages[0] : null} 
                                    images={viewerImages.length > 1 ? viewerImages : []} 
                                    totalPages={3} // this handles CSS slicing fallback if needed
                                    isBulletin={post.category === 'bulletin'}
                                />
                            )}
                            
                            {post.content && (
                                <div style={{ marginTop: '24px' }}>
                                    <style>
                                        {`
                                        .toastui-editor-contents, .ProseMirror {
                                            color: var(--color-text-body) !important;
                                            font-size: 16px !important;
                                        }
                                        .toastui-editor-contents *:not(table), .ProseMirror *:not(table) {
                                            line-height: 180% !important;
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
                                            color: var(--color-text-dark) !important;
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
                            <SuitButton 
                                onClick={() => navigate(-1)}
                                style={{ borderColor: 'rgba(var(--color-text-dark-rgb), 0.3)', color: 'var(--color-text-dark)', background: 'transparent' }}
                            >
                                목록으로
                            </SuitButton>
                        </div>
                    </motion.div>
                </div>
            </SubPageSection>
            <Footer />
        </div>
    );
};

export default PostDetailPage;

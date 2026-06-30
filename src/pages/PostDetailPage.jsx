import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';
import SubPageSection from '../components/SubPageSection';
import PretendardButton from '../components/ui/PretendardButton';
import styles from './PostDetailPage.module.css';
import dummyImg from '../assets/news/260628-church-bulletin-01.webp';

const ImageViewer = ({ imageUrl, totalPages = 3, images = [] }) => {
    const isMultipleFiles = images && images.length > 0;
    const count = isMultipleFiles ? images.length : (imageUrl ? totalPages : 0);
    const [currentIndex, setCurrentIndex] = useState(0);

    if (count === 0) return null;

    const renderMainImage = (index) => {
        if (isMultipleFiles) {
            return (
                <img 
                    src={images[index]} 
                    alt={`첨부 이미지 ${index + 1}`} 
                />
            );
        } else {
            return (
                <img 
                    src={imageUrl} 
                    alt={`주보 ${index + 1}면`} 
                    style={{ marginLeft: `-${index * 100}%` }} 
                    className={styles.slicedImage}
                />
            );
        }
    };

    const renderThumbnail = (index) => {
        if (isMultipleFiles) {
            return (
                <img 
                    src={images[index]} 
                    alt={`썸네일 ${index + 1}`} 
                />
            );
        } else {
            return (
                <img 
                    src={imageUrl} 
                    alt={`주보 썸네일 ${index + 1}면`} 
                    style={{ marginLeft: `-${index * 100}%` }} 
                    className={styles.slicedImage}
                />
            );
        }
    };

    return (
        <div className={styles.bulletinViewerContainer}>
            {/* Main Viewer Area */}
            {count > 1 && (
                <div className={styles.mainViewerWrapper}>
                    <button 
                        className={`${styles.navButton} ${styles.prevButton}`}
                        onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentIndex === 0}
                        aria-label="이전 이미지"
                    >
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    
                    <div className={styles.mainViewer}>
                        <div className={styles.bulletinPageWrapper}>
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
                <div className={styles.mainViewerWrapper}>
                    <div className={styles.mainViewer}>
                        <div className={styles.bulletinPageWrapper}>
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

import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

const PostDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [post, setPost] = useState(location.state || null);
    const [loading, setLoading] = useState(!post);

    useEffect(() => {
        window.scrollTo(0, 0);

        if (location.state) {
            setPost(location.state);
            setLoading(false);
            return;
        }

        if (id) {
            fetchPostFromFirestore();
        }
    }, [id, location.state]);

    const fetchPostFromFirestore = async () => {
        try {
            let targetCollection = 'posts';
            let actualId = id;

            // Handle nextgen- fallback (uses hyphen)
            if (id.startsWith('nextgen-')) {
                // If there's no state, nextgen posts can't be fetched easily unless we store them globally, 
                // but nextgen posts should always be passed via state. 
                // We'll fallback to 'nextgen' collection if needed but let's assume they don't exist globally as single posts.
                alert('해당 게시물을 직접 주소로 접근할 수 없습니다.');
                navigate(-1);
                return;
            }

            // Parse collection from underscore delimiter
            if (id.includes('_')) {
                const parts = id.split('_');
                targetCollection = parts[0];
                actualId = parts.slice(1).join('_');
            }

            const docRef = doc(db, targetCollection, actualId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                setPost({ id: docSnap.id, ...data });
                
                // Increment views
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

    let authorText = "관리자";
    if (post.author) authorText = post.author; // nextgen
    else if (post.category === 'news') authorText = "신탄진침례교회";
    else if (post.category === 'bulletin') authorText = "사무국";

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
                            <div style={{ marginBottom: '8px' }}>
                                {post.category && (
                                    <span style={{ 
                                        backgroundColor: post.category === 'news' ? '#DBEAFE' : '#FEF3C7', 
                                        color: post.category === 'news' ? '#1E3A8A' : '#92400E',
                                        padding: '4px 8px', borderRadius: '4px', fontSize: '13px', fontWeight: '500'
                                    }}>
                                        {post.category === 'news' ? '소식' : '주보'}
                                    </span>
                                )}
                            </div>
                            <h1 className={styles.postTitle}>{post.title}</h1>
                            <div className={styles.postMeta}>
                                <span>작성자: {authorText}</span>
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
                                />
                            )}
                            
                            <div style={{ marginTop: '24px', whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
                                {post.content}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className={styles.buttonWrapper}>
                            <PretendardButton 
                                onClick={() => navigate(-1)}
                                style={{ borderColor: 'rgba(var(--color-text-dark-rgb), 0.3)', color: 'var(--color-text-dark)', background: 'transparent' }}
                            >
                                목록으로
                            </PretendardButton>
                        </div>
                    </motion.div>
                </div>
            </SubPageSection>
            <Footer />
        </div>
    );
};

export default PostDetailPage;

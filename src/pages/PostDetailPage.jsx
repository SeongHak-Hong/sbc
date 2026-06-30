import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const PostDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        
        // Mocking a fetch for the post detail using the ID
        const isImageExample = id === '17';
        
        setPost({
            id: id,
            title: `상세 게시글 제목 (ID: ${id})`,
            author: '관리자',
            date: '2024.08.20',
            imageUrl: isImageExample && id === '17' ? dummyImg : null,
            images: id === '18' ? [dummyImg, dummyImg] : [], // Mock multiple images for testing
            isBulletin: isImageExample && id === '17', // Flag to indicate this is a 3-panel bulletin
            content: `이곳은 게시글 상세 내용이 들어갈 자리입니다.\n\n해당 게시글(ID: ${id})을 클릭하여 상세 페이지로 이동했습니다.\n향후 실제 데이터 연동 시 이 영역에 본문 내용(텍스트, 이미지 등)이 렌더링됩니다.\n\n주보 이미지나 소식 텍스트가 표시될 수 있도록 넉넉한 여백과 가독성 높은 폰트 사이즈가 적용되어 있습니다.\n\n감사합니다.`
        });
    }, [id]);

    if (!post) return null;

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
                                <span>{post.author}</span>
                                <span className={styles.metaDivider}>|</span>
                                <span>{post.date}</span>
                            </div>
                        </div>

                        {/* Post Body */}
                        <div className={styles.postBody}>
                            {(post.imageUrl || (post.images && post.images.length > 0)) && (
                                <ImageViewer 
                                    imageUrl={post.isBulletin ? post.imageUrl : null} 
                                    images={!post.isBulletin && post.images ? post.images : (post.imageUrl && !post.isBulletin ? [post.imageUrl] : [])} 
                                    totalPages={post.isBulletin ? 3 : 0} 
                                />
                            )}
                            {post.content}
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

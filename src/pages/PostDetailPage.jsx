import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';
import SubPageSection from '../components/SubPageSection';
import PretendardButton from '../components/ui/PretendardButton';
import styles from './PostDetailPage.module.css';

const PostDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        
        // Mocking a fetch for the post detail using the ID
        setPost({
            id: id,
            title: `상세 게시글 제목 (ID: ${id})`,
            author: '관리자',
            date: '2024.08.20',
            content: `이곳은 게시글 상세 내용이 들어갈 자리입니다.\n\n해당 게시글(ID: ${id})을 클릭하여 상세 페이지로 이동했습니다.\n향후 실제 데이터 연동 시 이 영역에 본문 내용(텍스트, 이미지 등)이 렌더링됩니다.\n\n주보 이미지나 소식 텍스트가 표시될 수 있도록 넉넉한 여백과 가독성 높은 폰트 사이즈가 적용되어 있습니다.\n\n감사합니다.`
        });
    }, [id]);

    if (!post) return null;

    return (
        <div className={styles.pageWrapper}>
            <SubPageSection title="나눔터">
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

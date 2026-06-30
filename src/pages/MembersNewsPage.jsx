import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import Footer from '../components/Footer';
import SubPageSection from '../components/SubPageSection';
import styles from './NewsPage.module.css';

const MembersNewsPage = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 8;

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const q = query(collection(db, 'membersNews'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const data = [];
            querySnapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });
            setPosts(data);
        } catch (error) {
            console.error("성도 소식 가져오기 오류:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleItemClick = (post) => {
        navigate(`/post/membersNews_${post.id}`, { state: post });
    };

    const totalPages = Math.ceil(posts.length / postsPerPage) || 1;
    const currentPosts = posts.slice(
        (currentPage - 1) * postsPerPage, 
        currentPage * postsPerPage
    );

    if (loading) {
        return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>로딩 중...</div>;
    }

    return (
        <div className={styles.pageWrapper}>
            <SubPageSection 
                title="성도 소식" 
                subtitle={<p className={styles.headerSubtitle} style={{ color: 'rgba(var(--color-text-dark-rgb), 0.7)', fontSize: '18px', textAlign: 'center' }}>성도님들의 기쁨과 슬픔을 함께 나눕니다.</p>}
            >
                <div className={styles.contentWrapper}>
                    <div className={styles.boardContainer}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentPage}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className={styles.boardList}
                            >
                                {currentPosts.length > 0 ? currentPosts.map((item) => (
                                    <div key={item.id} className={styles.boardItem} onClick={() => handleItemClick(item)}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ 
                                                backgroundColor: '#F3E8FF', 
                                                color: '#7E22CE',
                                                padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500'
                                            }}>
                                                성도소식
                                            </span>
                                            <p className={styles.itemTitle}>{item.title}</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '16px', color: '#6B7280', fontSize: '14px' }}>
                                            <span>{item.author}</span>
                                            <p className={styles.itemDate}>{item.date}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                        등록된 소식이 없습니다.
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Footer (Pagination) */}
                        {posts.length > 0 && (
                            <div className={styles.boardFooter}>
                                <div className={styles.pagination}>
                                    <button 
                                        className={`${styles.pageArrow} material-symbols-outlined`}
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(p => p - 1)}
                                    >chevron_left</button>
                                    
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button 
                                            key={i + 1}
                                            className={`${styles.pageButton} ${currentPage === i + 1 ? styles.active : ''}`}
                                            onClick={() => setCurrentPage(i + 1)}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    
                                    <button 
                                        className={`${styles.pageArrow} material-symbols-outlined`}
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(p => p + 1)}
                                    >chevron_right</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </SubPageSection>
            <Footer />
        </div>
    );
};

export default MembersNewsPage;

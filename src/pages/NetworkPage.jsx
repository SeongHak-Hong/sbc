import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import Footer from '../components/Footer';
import SubPageSection from '../components/SubPageSection';
import ScrollFadeText from '../components/ScrollFadeText';
import styles from './NewsPage.module.css';

const NetworkPage = () => {
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
            const q = query(collection(db, 'memberBusiness'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const data = [];
            querySnapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });
            setPosts(data);
        } catch (error) {
            console.error("성도 사업체 가져오기 오류:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleItemClick = (post) => {
        navigate(`/post/network_${post.id}`);
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
            <SubPageSection hideHeader={true} className={styles.sectionCenter}>
                <div style={{ textAlign: 'center' }}>
                    <div className={styles.breadcrumb}>
                        나눔터 - 성도 사업체
                    </div>
                    <ScrollFadeText
                        text={"성도님들의 일터를\n소개하고 기도합니다."}
                        as="h1"
                        className={styles.pageTitle}
                        once={true}
                    />
                </div>

                <div className={styles.eventsGrid}>
                    {currentPosts.length === 0 ? (
                        <div className={styles.eventCard} style={{ cursor: 'default' }}>
                            <div className={styles.eventInfoLeft}>
                                <div className={styles.eventDetailsContainer}>
                                    <h3 className={styles.eventTitle}>등록된 사업체가 없습니다.</h3>
                                </div>
                            </div>
                        </div>
                    ) : (
                        currentPosts.map((post, idx) => {
                            const authorDisplay = post.author === '관리자' ? '정보 확인 필요' : post.author;
                            
                            return (
                                <motion.div 
                                    key={post.id}
                                    className={styles.eventCard}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    whileHover={{ y: -2, boxShadow: "0px 4px 12px rgba(0,0,0,0.05)" }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    onClick={() => handleItemClick(post)}
                                >
                                    <div className={styles.eventInfoLeft}>
                                        <div className={styles.eventDetailsContainer}>
                                            <h3 className={styles.eventTitle}>{post.title}</h3>
                                            <div className={styles.eventMetaRow}>
                                                {post.businessCategory && <span>{post.businessCategory}</span>}
                                                {post.businessCategory && authorDisplay && <span>·</span>}
                                                {authorDisplay && <span>{authorDisplay}</span>}
                                                {(post.businessCategory || authorDisplay) && post.phone && <span>·</span>}
                                                {post.phone && <span>{post.phone}</span>}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className={styles.boardFooter}>
                        <div className={styles.pagination}>
                            <button
                                className={styles.pageArrow}
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                <span className="material-symbols-outlined" translate="no">chevron_left</span>
                            </button>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
                                    onClick={() => setCurrentPage(page)}
                                    disabled={currentPage === page}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                className={styles.pageArrow}
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                <span className="material-symbols-outlined" translate="no">chevron_right</span>
                            </button>
                        </div>
                    </div>
                )}
            </SubPageSection>
            <Footer />
        </div>
    );
};

export default NetworkPage;

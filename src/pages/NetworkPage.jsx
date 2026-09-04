import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import Footer from '../components/Footer';
import SubPageSection from '../components/SubPageSection';
import ScrollFadeText from '../components/ScrollFadeText';
import Pagination from '../components/ui/Pagination';
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
                        <div className={`${styles.eventCard} squircle-wrapper`} style={{ cursor: 'default' }}>
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
                                    style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    whileHover={{ y: -2, transition: { delay: 0, duration: 0.2 } }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    onClick={() => handleItemClick(post)}
                                >
                                    <div className={`${styles.eventCard} squircle-wrapper`} style={{ width: '100%', height: '100%' }}>
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
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className={styles.boardFooter}>
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(page) => setCurrentPage(page)}
                        />
                    </div>
                )}
            </SubPageSection>
            <Footer />
        </div>
    );
};

export default NetworkPage;

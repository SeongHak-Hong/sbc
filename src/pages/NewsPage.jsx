import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../components/Footer';
import SubPageSection from '../components/SubPageSection';
import TabMenu from '../components/TabMenu';
import styles from './NewsPage.module.css';

const TABS = [
    { id: 'all', label: '전체' },
    { id: 'news', label: '교회 소식' },
    { id: 'bulletin', label: '주보' }
];

const NewsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 8;
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchPosts();
    }, []);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const tab = queryParams.get('tab');
        if (tab === 'news' || tab === 'bulletin') {
            setActiveTab(tab);
        }
    }, [location.search]);

    const fetchPosts = async () => {
        try {
            const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const data = [];
            querySnapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });
            setPosts(data);
        } catch (error) {
            console.error("게시물 가져오기 오류:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPosts = activeTab === 'all' 
        ? posts 
        : posts.filter(post => post.category === activeTab);

    const totalPages = Math.ceil(filteredPosts.length / postsPerPage) || 1;
    const currentPosts = filteredPosts.slice(
        (currentPage - 1) * postsPerPage, 
        currentPage * postsPerPage
    );

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setCurrentPage(1);
    };

    const handlePostClick = (post) => {
        navigate(`/post/${post.id}`);
    };

    if (loading) {
        return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>로딩 중...</div>;
    }

    return (
        <div className={styles.pageWrapper}>
            <SubPageSection 
                title="나눔터" 
                subtitle={<p className={styles.headerSubtitle} style={{ color: 'rgba(var(--color-text-dark-rgb), 0.7)', fontSize: '18px' }}>신탄진침례교회의 다양한 소식과 주보를 나눕니다.</p>}
            >
                <div className={styles.contentWrapper}>
                    <TabMenu 
                        tabs={TABS}
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                        getTabId={(tab) => tab.id}
                        getTabLabel={(tab) => tab.label}
                    />

                    <div className={styles.boardContainer}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab + currentPage}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className={styles.boardList}
                            >
                                {currentPosts.length > 0 ? currentPosts.map(post => (
                                    <div 
                                        key={post.id} 
                                        className={styles.boardItem}
                                        onClick={() => handlePostClick(post)}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ 
                                                backgroundColor: post.category === 'news' ? '#DBEAFE' : '#FEF3C7', 
                                                color: post.category === 'news' ? '#1E3A8A' : '#92400E',
                                                padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500'
                                            }}>
                                                {post.category === 'news' ? '소식' : '주보'}
                                            </span>
                                            <p className={styles.itemTitle}>{post.title}</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '16px', color: '#6B7280', fontSize: '14px' }}>
                                            <span>조회 {post.views || 0}</span>
                                            <p className={styles.itemDate}>{post.date}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                        등록된 게시물이 없습니다.
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Pagination */}
                        {filteredPosts.length > 0 && (
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

export default NewsPage;

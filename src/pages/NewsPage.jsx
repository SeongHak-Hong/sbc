import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import Footer from '../components/Footer';
import SubPageSection from '../components/SubPageSection';
import ScrollFadeText from '../components/ScrollFadeText';
import SwitchTabs from '../components/SwitchTabs';
import styles from './NewsPage.module.css';

const TABS = [
    { id: 'koinonia', label: '공지사항' },
    { id: 'news', label: '교회 소식' },
    { id: 'bulletin', label: '주보' }
];

const NewsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('koinonia');
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
        if (tab === 'news' || tab === 'bulletin' || tab === 'koinonia') {
            setActiveTab(tab);
        }
    }, [location.search]);

    const fetchPosts = async () => {
        try {
            const q = query(collection(db, 'posts'), orderBy('date', 'desc'));
            const kq = query(collection(db, 'membersNews'), orderBy('createdAt', 'desc'));
            const [querySnapshot, koinoniaSnapshot] = await Promise.all([getDocs(q), getDocs(kq)]);
            
            const data = [];
            querySnapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });
            koinoniaSnapshot.forEach((doc) => {
                const docData = doc.data();
                let dateStr = docData.date;
                if (!dateStr && docData.createdAt) {
                    const d = docData.createdAt.toDate();
                    dateStr = `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, '0')}. ${String(d.getDate()).padStart(2, '0')}.`;
                }
                data.push({ id: `koinonia_${doc.id}`, ...docData, category: 'koinonia', date: dateStr });
            });
            setPosts(data);
        } catch (error) {
            console.error("게시물 가져오기 오류:", error);
        } finally {
            setLoading(false);
        }
    };

    const normalizeDateStr = (dateStr) => {
        if (!dateStr) return '';
        const parts = dateStr.split(/[^\d]+/).filter(Boolean);
        if (parts.length >= 3) {
            const y = parts[0];
            const m = parts[1].padStart(2, '0');
            const d = parts[2].padStart(2, '0');
            return `${y}. ${m}. ${d}.`;
        }
        return dateStr;
    };

    const getSortableDate = (dateStr) => {
        if (!dateStr) return '00000000';
        const parts = dateStr.split(/[^\d]+/).filter(Boolean);
        if (parts.length >= 3) {
            const y = parts[0];
            const m = parts[1].padStart(2, '0');
            const d = parts[2].padStart(2, '0');
            return `${y}${m}${d}`;
        }
        return dateStr;
    };

    const filteredPosts = posts
        .filter(post => post.category === activeTab)
        .map(post => ({
            ...post,
            originalDate: post.date,
            date: normalizeDateStr(post.date)
        }))
        .sort((a, b) => {
            const dateA = getSortableDate(a.originalDate);
            const dateB = getSortableDate(b.originalDate);
            if (dateA !== dateB) {
                return dateB.localeCompare(dateA); // Sort by date desc
            }
            
            // Sort by registration time if dates are identical
            const createdA = a.createdAt?.seconds || 0;
            const createdB = b.createdAt?.seconds || 0;
            if (createdA !== createdB) {
                return createdB - createdA;
            }
            
            return b.id.localeCompare(a.id);
        });

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
            <SubPageSection hideHeader={true} className={styles.sectionCenter}>
                <div style={{ textAlign: 'center' }}>
                    <div className={styles.breadcrumb}>
                        나눔터 - 소식·주보
                    </div>
                    <ScrollFadeText
                        text="소식을 전해요."
                        as="h1"
                        className={styles.pageTitle}
                        once={true}
                    />
                </div>

                    <div style={{ display: 'flex', marginBottom: '24px' }}>
                        <SwitchTabs 
                            tabs={TABS}
                            activeTab={activeTab}
                            onTabChange={handleTabChange}
                            layoutIdPrefix="activeSwitch_News"
                        />
                    </div>

                    <div className={styles.eventsGrid}>
                        {currentPosts.length === 0 ? (
                            <div className={styles.eventCard} style={{ cursor: 'default' }}>
                                <div className={styles.eventInfoLeft}>
                                    <div className={styles.eventDetailsContainer}>
                                        <h3 className={styles.eventTitle}>등록된 게시물이 없습니다.</h3>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            currentPosts.map((post, idx) => {
                                let calMonth = '';
                                let calDays = '';
                                const dateStr = post.originalDate || post.date || '';
                                const parts = dateStr.split(/[^\d]+/).filter(Boolean);
                                if (parts.length >= 3) {
                                    calMonth = `${parseInt(parts[1], 10)}월`;
                                    calDays = parseInt(parts[2], 10).toString();
                                } else {
                                    calDays = dateStr;
                                }

                                return (
                                    <motion.div 
                                        key={post.id}
                                        className={styles.eventCard}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        whileHover={{ y: -2, boxShadow: "0px 4px 12px rgba(0,0,0,0.05)", transition: { delay: 0, duration: 0.2 } }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.1 }}
                                        onClick={() => handlePostClick(post)}
                                    >
                                        <div className={styles.eventInfoLeft}>
                                            <div className={styles.calendarIcon}>
                                                <div className={styles.calendarMonth}>{calMonth}</div>
                                                <div className={styles.calendarDate}>{calDays}</div>
                                            </div>
                                            <div className={styles.eventDetailsContainer}>
                                                <h3 className={styles.eventTitle}>{post.title}</h3>
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

export default NewsPage;

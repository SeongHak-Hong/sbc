import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import Footer from '../components/Footer';
import SubPageSection from '../components/SubPageSection';
import TabMenu from '../components/TabMenu';
import visionIcon from '../assets/vision/shintanjin-baptist-church-vision-icon.webp';
import styles from './NewsPage.module.css';
import BoardList from '../components/ui/BoardList';

const TABS = [
    { id: 'news', label: '교회 소식' },
    { id: 'bulletin', label: '주보' }
];

const NewsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('news');
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
            const q = query(collection(db, 'posts'), orderBy('date', 'desc'));
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
            <SubPageSection 
                title="교회소식 · 주보" 
                engTitle="News"
                icon={visionIcon}
            >
                <div className={styles.contentWrapper}>
                    <TabMenu 
                        tabs={TABS}
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                        getTabId={(tab) => tab.id}
                        getTabLabel={(tab) => tab.label}
                    />

                    <BoardList 
                        posts={currentPosts.map(post => {
                            let displayDate = post.date;
                            let titleDate = '';

                            if ((activeTab === 'bulletin' || activeTab === 'news') && post.date) {
                                titleDate = post.date;
                                displayDate = ''; // Hide the right-side date
                            }

                            return {
                                ...post,
                                titleDate,
                                date: displayDate,
                                hasImage: (post.imageUrl || (post.imageUrls && post.imageUrls.length > 0) || (post.images && post.images.length > 0))
                            };
                        })}
                        onItemClick={handlePostClick}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        emptyMessage="등록된 게시물이 없습니다."
                        animationKey={activeTab + currentPage}
                    />
                </div>
            </SubPageSection>
            <Footer />
        </div>
    );
};

export default NewsPage;

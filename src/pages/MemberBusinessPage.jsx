import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import Footer from '../components/Footer';
import SubPageSection from '../components/SubPageSection';
import styles from './NewsPage.module.css';
import BoardList from '../components/ui/BoardList';

const MemberBusinessPage = () => {
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
        navigate(`/post/memberBusiness_${post.id}`, { state: post });
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
                title="성도 사업체" 
                subtitle={<p className={styles.headerSubtitle} style={{ color: 'rgba(var(--color-text-dark-rgb), 0.7)', fontSize: '18px', textAlign: 'center' }}>성도님들의 일터와 사업장을 소개하고 기도합니다.</p>}
            >
                <div className={styles.contentWrapper}>
                    <div className={styles.boardContainer}>
                        <BoardList
                            posts={currentPosts.map(item => ({
                                ...item,
                                author: item.author === '관리자' ? '정보 확인 필요' : item.author,
                                date: null // 사업체 목록에서는 날짜를 숨김
                            }))}
                            onItemClick={handleItemClick}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            emptyMessage="등록된 사업체가 없습니다."
                        />
                    </div>
                </div>
            </SubPageSection>
            <Footer />
        </div>
    );
};

export default MemberBusinessPage;

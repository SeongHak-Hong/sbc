import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import SubPageSection from '../components/SubPageSection';
import ScrollFadeText from '../components/ScrollFadeText';
import Pagination from '../components/ui/Pagination';
import BoardGrid from '../components/ui/BoardGrid';
import styles from './NetworkPage.module.css';

import Breadcrumb from "../components/ui/Breadcrumb";

const NetworkPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
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
        navigate(`/post/network_${post.id}`, { state: { background: location } });
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
                    <Breadcrumb text="나눔터 - 성도 사업체" />
                    <ScrollFadeText
                        text={"동네방네 성도 가게"}
                        as="h1"
                        className={styles.pageTitle}
                        once={true}
                    />
                </div>

                <BoardGrid 
                    items={currentPosts.map(post => ({
                        id: post.id,
                        title: post.title,
                        meta: post.author === '관리자' ? '정보 확인 필요' : post.author,
                        rawData: post
                    }))}
                    onItemClick={handleItemClick}
                    emptyMessage="등록된 사업체가 없습니다."
                />

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
        </div>
    );
};

export default NetworkPage;

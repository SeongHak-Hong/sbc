import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../components/Footer';
import SubPageSection from '../components/SubPageSection';
import styles from './NewsPage.module.css';

const DUMMY_DATA = [
    { id: 12, title: '김성도 집사 차녀 결혼 예배 안내', author: '경조부', date: '2024.08.12' },
    { id: 11, title: '이성도 권사님 개업 축하 예배 (베이커리)', author: '교구', date: '2024.08.01' },
    { id: 10, title: '박성도 청년 해외 유학 파송 기도', author: '청년부', date: '2024.07.20' },
    { id: 9, title: '최성도 장로님 모친상 부고', author: '경조부', date: '2024.07.15' },
    { id: 8, title: '정성도 성도님 첫돌 감사 예배', author: '교구', date: '2024.06.30' }
];

const MembersNewsPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const navigate = useNavigate();

    const handleItemClick = (id) => {
        navigate(`/post/${id}`);
    };

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
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className={styles.boardList}
                            >
                                {DUMMY_DATA.map((item) => (
                                    <div key={item.id} className={styles.boardItem} onClick={() => handleItemClick(item.id)}>
                                        <p className={styles.itemTitle}>{item.title}</p>
                                        <p className={styles.itemDate}>{item.date}</p>
                                    </div>
                                ))}
                            </motion.div>
                        </AnimatePresence>

                        {/* Footer (Pagination) */}
                        <div className={styles.boardFooter}>
                            <div className={styles.pagination}>
                                <button className={`${styles.pageArrow} material-symbols-outlined`}>chevron_left</button>
                                <button className={`${styles.pageButton} ${styles.active}`}>1</button>
                                <button className={styles.pageButton}>2</button>
                                <button className={`${styles.pageArrow} material-symbols-outlined`}>chevron_right</button>
                            </div>
                        </div>
                    </div>
                </div>
            </SubPageSection>
            <Footer />
        </div>
    );
};

export default MembersNewsPage;

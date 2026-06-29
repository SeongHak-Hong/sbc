import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../components/Footer';
import SubPageSection from '../components/SubPageSection';
import styles from './NewsPage.module.css';

const DUMMY_DATA = [
    { id: 5, title: '은혜 카페 (신탄진역 앞)', author: '홍길동 성도', date: '2024.08.12' },
    { id: 4, title: '믿음 카센터 (타이어 전문)', author: '김믿음 집사', date: '2024.08.01' },
    { id: 3, title: '사랑 베이커리 오픈 안내', author: '이사랑 권사', date: '2024.07.20' },
    { id: 2, title: '소망 인테리어 (도배/장판)', author: '박소망 장로', date: '2024.07.15' },
    { id: 1, title: '샬롬 한의원 진료 안내', author: '최샬롬 집사', date: '2024.06.30' }
];

const MemberBusinessPage = () => {
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
                title="성도 사업체" 
                subtitle={<p className={styles.headerSubtitle} style={{ color: 'rgba(var(--color-text-dark-rgb), 0.7)', margin: '16px 0 0 0', fontSize: '18px', textAlign: 'center' }}>성도님들의 일터와 사업장을 소개하고 기도합니다.</p>}
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
                                        <div className={styles.itemNumber}>{item.id}</div>
                                        <div className={styles.itemContent}>
                                            <h3 className={styles.itemTitle}>{item.title}</h3>
                                            <div className={styles.itemMeta}>
                                                <span>{item.author}</span>
                                                <span className={styles.metaDivider}>|</span>
                                                <span>{item.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        </AnimatePresence>

                        {/* Footer (Search & Pagination) */}
                        <div className={styles.boardFooter}>
                            <div className={styles.searchWrapper}>
                                <select className={styles.searchSelect}>
                                    <option value="title">상호명</option>
                                    <option value="author">성도명</option>
                                </select>
                                <input type="text" className={styles.searchInput} placeholder="검색어 입력" />
                            </div>
                            
                            <div className={styles.pagination}>
                                <button className={styles.pageArrow}>&lt;</button>
                                <button className={`${styles.pageButton} ${styles.active}`}>1</button>
                                <button className={styles.pageArrow}>&gt;</button>
                            </div>
                        </div>
                    </div>
                </div>
            </SubPageSection>
            <Footer />
        </div>
    );
};

export default MemberBusinessPage;

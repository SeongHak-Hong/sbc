import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../components/Footer';
import SubPageSection from '../components/SubPageSection';
import TabMenu from '../components/TabMenu';
import styles from './NewsPage.module.css';

const DUMMY_DATA = {
    church: [
        { id: 22, title: '2024년 하반기 제자훈련 모집 안내', author: '행정실', date: '2024.08.15' },
        { id: 21, title: '전교인 체육대회 자원봉사자 모집', author: '행정실', date: '2024.08.10' },
        { id: 20, title: '가을 특별 새벽기도회 안내', author: '행정실', date: '2024.08.05' },
        { id: 19, title: '새가족 환영회 및 식사 교제', author: '새가족부', date: '2024.07.28' },
        { id: 18, title: '여름 단기선교 파송 예배 및 기도 요청', author: '선교부', date: '2024.07.15' },
        { id: 17, title: '주차장 이용 안내 및 요일제 실시', author: '관리부', date: '2024.07.01' },
        { id: 16, title: '교회학교 여름 성경학교 자원 교사 모집', author: '교육부', date: '2024.06.20' },
        { id: 15, title: '상반기 결산 제직회 개최 공고', author: '행정실', date: '2024.06.10' }
    ],
    members: [
        { id: 12, title: '김성도 집사 차녀 결혼 예배 안내', author: '경조부', date: '2024.08.12' },
        { id: 11, title: '이성도 권사님 개업 축하 예배 (베이커리)', author: '교구', date: '2024.08.01' },
        { id: 10, title: '박성도 청년 해외 유학 파송 기도', author: '청년부', date: '2024.07.20' },
        { id: 9, title: '최성도 장로님 모친상 부고', author: '경조부', date: '2024.07.15' },
        { id: 8, title: '정성도 성도님 첫돌 감사 예배', author: '교구', date: '2024.06.30' }
    ]
};

const NewsPage = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('church');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Set tab based on URL query parameter
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const tab = queryParams.get('tab');
        if (tab === 'church' || tab === 'members') {
            setActiveTab(tab);
        }
    }, [location.search]);

    const tabs = [
        { id: 'church', name: '교회 소식' },
        { id: 'members', name: '성도 소식' }
    ];

    const currentList = DUMMY_DATA[activeTab] || [];

    const handleItemClick = () => {
        alert("게시글 상세 페이지는 준비 중입니다.");
    };

    return (
        <div className={styles.pageWrapper}>
            <SubPageSection 
                title="나눔터" 
                subtitle={<p className={styles.headerSubtitle} style={{ color: 'rgba(255, 255, 255, 0.7)', marginTop: '16px', fontSize: '18px' }}>신탄진교회의 다양한 소식을 나눕니다.</p>}
            >
                <div className={styles.contentWrapper}>
                    <TabMenu 
                        tabs={tabs} 
                        activeTab={activeTab} 
                        onTabChange={setActiveTab} 
                        getTabId={(tab) => tab.id}
                        getTabLabel={(tab) => tab.name}
                    />
                    
                    <div className={styles.boardContainer}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className={styles.boardList}
                            >
                                {currentList.map((item) => (
                                    <div key={item.id} className={styles.boardItem} onClick={handleItemClick}>
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
                                    <option value="title">제목</option>
                                    <option value="content">내용</option>
                                    <option value="author">작성자</option>
                                </select>
                                <input type="text" className={styles.searchInput} placeholder="검색어 입력" />
                            </div>
                            
                            <div className={styles.pagination}>
                                <button className={styles.pageArrow}>&lt;</button>
                                <button className={`${styles.pageButton} ${styles.active}`}>1</button>
                                <button className={styles.pageButton}>2</button>
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

export default NewsPage;

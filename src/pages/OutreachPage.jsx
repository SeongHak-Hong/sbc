import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import SubPageSection from '../components/SubPageSection';
import TabMenu from '../components/TabMenu';
import Footer from '../components/Footer';
import visionIcon from '../assets/vision/shintanjin-baptist-church-vision-icon.webp';
import styles from './OutreachPage.module.css';

const OutreachPage = () => {
    const [missionData, setMissionData] = useState(null);
    const [activeTab, setActiveTab] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'missions'));
            const data = {};
            querySnapshot.forEach((doc) => {
                data[doc.id] = doc.data();
            });
            setMissionData(data);
            if (data['overseas']) setActiveTab('overseas');
            else if (Object.keys(data).length > 0) setActiveTab(Object.keys(data)[0]);
        } catch (error) {
            console.error("선교 데이터 불러오기 오류:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>로딩 중...</div>;
    }

    if (!missionData || Object.keys(missionData).length === 0) {
        return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>데이터가 없습니다.</div>;
    }

    const activeData = missionData[activeTab];
    // 정렬: overseas -> domestic -> evangelism 순서 유도
    const tabs = Object.values(missionData).sort((a, b) => {
        const order = { 'overseas': 1, 'domestic': 2, 'evangelism': 3 };
        return (order[a.id] || 99) - (order[b.id] || 99);
    });

    return (
        <div className={styles.pageWrapper}>
            <SubPageSection 
                title="선교전도" 
                engTitle="Outreach"
                icon={visionIcon}
                subtitle={<p className={styles.headerSubtitle}>땅끝까지 이르러 내 증인이 되리라 하신 말씀을 실천합니다.</p>}
            >
                <div className={styles.contentWrapper}>
                    <TabMenu 
                        tabs={tabs}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        getTabId={(tab) => tab.id}
                        getTabLabel={(tab) => tab.name}
                        className={styles.missionsTabs}
                    />

                    <AnimatePresence mode="wait">
                        <motion.section
                            key={activeTab}
                            className={styles.contentSection}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3 }}
                        >
                            {activeData.type === 'table' && (
                                <div className={styles.missionList}>
                                    {activeData.list.map((item, idx) => (
                                        <div key={idx} className={styles.missionItem}>
                                            <p className={styles.missionName}>{item.name}</p>
                                            <p className={styles.missionDetails}>
                                                {item.organization} / {item.region}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeData.type === 'evangelism' && (
                                <>
                                    <div className={styles.infoBlock}>
                                        <h2 className={styles.blockTitle}>목요전도팀 안내</h2>
                                        <p className={styles.evangelismDesc}>목요전도팀은 다음과 같이 4개의 팀으로 구성됩니다.</p>
                                        <ul className={styles.teamList}>
                                            {activeData.teams.map((team, idx) => (
                                                <li key={idx} className={styles.teamItem}>
                                                    {idx + 1}) <span className={styles.teamName}>{team.name}</span> ({team.desc})
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className={styles.infoBlock}>
                                        <h2 className={styles.blockTitle}>목요 전도팀 운영 시간표</h2>
                                        <p className={styles.evangelismDesc}>- 일 시 : 매주 목요일 오전 10~오후 5시</p>
                                        <div className={styles.scheduleList}>
                                            {activeData.schedule.map((item, idx) => (
                                                <div key={idx} className={styles.scheduleItem}>
                                                    <span className={styles.scheduleTime}>{item.time}</span>
                                                    <span>{item.task}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className={styles.contactInfo}>
                                        문의: {activeData.contact}
                                    </div>
                                </>
                            )}
                        </motion.section>
                    </AnimatePresence>
                </div>
            </SubPageSection>
            <Footer />
        </div>
    );
};

export default OutreachPage;

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './WorshipPage.module.css';

import visionIcon from '../assets/vision/shintanjin-baptist-church-vision-icon.webp';

import Footer from '../components/Footer';
import SubPageSection from '../components/SubPageSection';
import TabMenu from '../components/TabMenu';

const WorshipPage = () => {
    const [activeTab, setActiveTab] = useState('adult');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const adultSchedule = [
        { name: "주일 1부 예배", time: "주일 오전 07:00", location: "소예배실" },
        { name: "주일 2부 예배", time: "주일 오전 11:00", location: "대예배실" },
        { name: "주일 3부 예배", time: "주일 오후 02:00", location: "대예배실" },
        { name: "새벽 기도회", time: "월~금 새벽 05:00", location: "소예배실" },
        { name: "중보 기도회", time: "매주 화요일 오전 10:30", location: "소예배실" },
        { name: "수요 예배", time: "수요일 오후 7:00", location: "대예배실" },
        { name: "금요 기도회", time: "금요일 오후 9:00", location: "소예배실" }
    ];

    const nextgenSchedule = [
        { name: "유치부(7세 이하)", time: "주일 오전 09:00", location: "유치부실" },
        { name: "초등부 주일예배", time: "주일 오전 09:00", location: "러브키즈예배실" },
        { name: "떡볶이 데이", time: "매주 목요일 오후 1~4시", location: "식당" },
        { name: "중고등부 주일예배", time: "주일 오전 09:00", location: "소예배실" },
        { name: "청년부", time: "주일 오후 1:30", location: "소예배실" }
    ];

    const meetingsSchedule = [
        { name: "운영위원회", time: "매월 마지막주 2부 예배 후", location: "목양실" }
    ];

    const getScheduleData = () => {
        switch (activeTab) {
            case 'nextgen': return nextgenSchedule;
            case 'meetings': return meetingsSchedule;
            default: return adultSchedule;
        }
    };

    return (
        <div className={styles.pageContainer}>
            <main className={styles.mainContent}>

                {/* 예배 안내 섹션 */}
                <SubPageSection title="예배 시간" engTitle="Worship" icon={visionIcon}>
                    <div className={styles.contentWrapper}>
                        <TabMenu 
                            tabs={[
                                { id: 'adult', label: '예배' },
                                { id: 'nextgen', label: '다음세대' },
                                { id: 'meetings', label: '모임' }
                            ]}
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            getTabId={(tab) => tab.id}
                            getTabLabel={(tab) => tab.label}
                        />

                        <div className={styles.listContainer}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className={styles.scheduleList}
                                >
                                    {getScheduleData().map((item, index) => (
                                        <div key={index} className={styles.scheduleItem}>
                                            <p className={styles.scheduleName}>{item.name}</p>
                                            <p className={styles.scheduleDetails}>
                                                {item.time} / {item.location}
                                            </p>
                                        </div>
                                    ))}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </SubPageSection>

                {/* 오시는 길 섹션 */}
                <SubPageSection 
                    title="오시는 길" 
                    engTitle="Visit"
                    icon={visionIcon} 
                    className={styles.lightSection} 
                    titleColor="#1D1A1C"
                    subtitle={
                        <p className={styles.addressText}>
                            대전 대덕구 석봉로 17 (석봉동, 신탄진교회)
                        </p>
                    }
                >
                    <div className={styles.directionsWrapper}>
                        <div className={styles.directionsContent}>
                            <div className={styles.directionGroup}>
                                <h4 className={styles.directionLabel}>대중교통 이용 시</h4>
                                <div className={styles.directionBody}>
                                    <p>신탄진역에서 도보 5분 거리</p>
                                    <p>버스: 신탄진역 하차 (2번, 711번, 712번)</p>
                                </div>
                            </div>

                            <div className={styles.directionGroup}>
                                <h4 className={styles.directionLabel}>자가용 이용 시</h4>
                                <div className={styles.directionBody}>
                                    <p>교회 주차장 상시 개방</p>
                                    <p>일요일은 대덕체육관 주차장 추가로 이용 가능</p>
                                </div>
                            </div>

                            <div className={styles.directionGroup}>
                                <h4 className={styles.directionLabel}>교회차량 이용 시</h4>
                                <div className={styles.directionBody}>
                                    <p>차량이용을 원하시는 분은 T. 042-932-8156로 문의해 주세요.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </SubPageSection>

            </main>

            <Footer />
        </div>
    );
};

export default WorshipPage;

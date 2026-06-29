import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SubPageSection from '../components/SubPageSection';
import TabMenu from '../components/TabMenu';
import Footer from '../components/Footer';
import styles from './MissionsPage.module.css';

const missionData = {
    overseas: {
        id: 'overseas',
        name: '해외선교',
        type: 'table',
        list: [
            { name: '김용대', organization: 'FMB', region: '인도' },
            { name: '송장헌', organization: 'FMB', region: '카자흐스탄' },
            { name: '허미라', organization: 'FMB', region: '필리핀' },
            { name: '이천우', organization: 'FMB', region: '멕시코' },
            { name: '홍현기', organization: 'FMB', region: '잠비아' },
            { name: '정영섭', organization: '우즈벡인 교회/FMB', region: '김해' },
            { name: '송창근', organization: '중국인 교회/FMB', region: '대전' }
        ]
    },
    domestic: {
        id: 'domestic',
        name: '국내선교',
        type: 'table',
        list: [
            { name: '오관영', organization: '한 빛', region: '구리' },
            { name: '배완호', organization: '금란', region: '공주' },
            { name: '김갑선', organization: '임천제일', region: '부여' },
            { name: '이병리', organization: '늘사랑', region: '진도' },
            { name: '임동순', organization: 'DFC', region: '대전' }
        ]
    },
    evangelism: {
        id: 'evangelism',
        name: '목요전도팀',
        type: 'evangelism',
        teams: [
            { name: '떡볶이 팀', desc: '떡볶이 및 음료 준비, 출석체크, 안전관리' },
            { name: '어린이 전도팀', desc: '떡볶이데이에 참여한 어린이들과 관계를 맺고 복음을 제시하여 교회로 나올 수 있게 한다' },
            { name: '지역 전도팀', desc: '지역 주민들에게 복음을 전하고 교회를 알리는 역할을 한다' },
            { name: '중보 기도팀', desc: '전도팀을 통해 아름다운 열매가 맺히도록 기도로 돕는다' }
        ],
        schedule: [
            { time: '10:00 ~ 12:00', task: '점심식사 및 떡볶이(초등학생용) 준비' },
            { time: '12:00 ~ 13:00', task: '점심식사' },
            { time: '13:00 ~ 13:30', task: '식사 정리' },
            { time: '13:30 ~ 14:00', task: '전도팀 예배 및 기도회' },
            { time: '14:00 ~', task: '전도 시작(떡볶이 나눔, 어린이 전도, 지역 전도)' }
        ],
        contact: '김정현 목사 010-3358-3579'
    }
};

const MissionsPage = () => {
    const [activeTab, setActiveTab] = useState('overseas');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const activeData = missionData[activeTab];
    const tabs = Object.values(missionData);

    return (
        <div className={styles.pageWrapper}>
            <SubPageSection 
                title="선교전도" 
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
                                <div className={styles.tableContainer}>
                                    <table className={styles.missionTable}>
                                        <thead>
                                            <tr>
                                                <th>선교사명</th>
                                                <th>교회/기관</th>
                                                <th>지 역</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {activeData.list.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td>{item.name}</td>
                                                    <td>{item.organization}</td>
                                                    <td>{item.region}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
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

export default MissionsPage;

import React, { useState, useEffect } from 'react';
import styles from './DistrictPage.module.css';
import Footer from '../components/Footer';
import CloudBackground from '../components/CloudBackground';

const districtData = {
    '1교구': {
        pastor: { name: '김정현', role: '목사', initials: '김' },
        zones: [
            { id: '101', leader: '김덕기 집사', teacher: '최옥자 집사' },
            { id: '102', leader: '정미숙 집사', teacher: '박찬명 집사' },
            { id: '103', leader: '이종금 명예집사', teacher: '이진숙 집사' },
            { id: '104', leader: '이점수 은퇴권사', teacher: '' },
            { id: '105', leader: '이계옥 시무권사', teacher: '한정남 시무권사' },
            { id: '106', leader: '안정희 시무권사', teacher: '정종우 명예집사' },
            { id: '107', leader: '황경란 집사', teacher: '' },
            { id: '108', leader: '이분희 은퇴권사', teacher: '' },
            { id: '109', leader: '김태식 원로장로', teacher: '' },
            { id: '110', leader: '지민숙 집사', teacher: '' },
            { id: '111', leader: '박경우 집사', teacher: '' },
        ]
    },
    '2교구': {
        pastor: { name: '김윤섭', role: '목사', initials: '김' },
        zones: [
            { id: '201', leader: '최영실 집사', teacher: '윤광식 시무장로' },
            { id: '202', leader: '이명애 집사', teacher: '' },
            { id: '203', leader: '서옥선 집사', teacher: '' },
            { id: '204', leader: '한경연 집사', teacher: '' },
            { id: '205', leader: '노옥선 은퇴권사', teacher: '' },
            { id: '206', leader: '정용미 집사', teacher: '' },
            { id: '207', leader: '김지아 집사', teacher: '박찬오 집사' },
            { id: '208', leader: '이양순 집사', teacher: '' },
            { id: '209', leader: '박동숙 은퇴권사', teacher: '한순희 집사' },
            { id: '210', leader: '박부덕 집사', teacher: '구윤산 집사' },
        ]
    }
};

const districtKeys = Object.keys(districtData);

const DistrictPage = () => {
    const [activeDistrict, setActiveDistrict] = useState(districtKeys[0]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const currentData = districtData[activeDistrict];

    return (
        <div className={styles.pageWrapper}>
            <CloudBackground heightMode="vh" />

            <div className={`container ${styles.notebookContainer}`}>
                {/* Page Title */}
                <div className={styles.pageTitle}>
                    <h1>교구·구역 안내</h1>
                </div>

                {/* Notebook Layout */}
                <div className={styles.notebookLayout}>
                    {/* Main Panel */}
                    <div className={styles.mainPanel}>
                        <div className={styles.profileSection}>
                            <div className={styles.profileAvatar}>
                                <span className={styles.profileInitials}>{currentData.pastor.initials}</span>
                            </div>
                            <div className={styles.profileInfo}>
                                <div className={styles.profileName}>{currentData.pastor.name}</div>
                                <p className={styles.profileRole}>담당사역자 · {currentData.pastor.role}</p>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className={styles.divider}>
                            <div className={styles.dividerLine}></div>
                        </div>

                        {/* Zone List */}
                        <div className={styles.zoneList}>
                            {currentData.zones.map((zone) => (
                                <div 
                                    key={zone.id} 
                                    className={styles.zoneItem}
                                >
                                    <div className={styles.zoneNumber}>{zone.id}</div>
                                    <div className={styles.zoneContent}>
                                        <div className={styles.zoneLeader}>
                                            <span className={styles.roleChipLeader}>구역장</span> {zone.leader}
                                        </div>
                                        {zone.teacher && (
                                            <div className={styles.zoneTeacher}>
                                                <span className={styles.roleChipTeacher}>구역교사</span> {zone.teacher}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div className={styles.listSpacer}></div>
                        </div>
                    </div>

                    {/* Side Tabs */}
                    <div className={styles.sideTabs}>
                        {districtKeys.map((key) => (
                            <button
                                key={key}
                                className={`${styles.sideTab} ${activeDistrict === key ? styles.sideTabActive : styles.sideTabInactive}`}
                                onClick={() => setActiveDistrict(key)}
                            >
                                <span className={styles.sideTabLabel}>{key}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default DistrictPage;

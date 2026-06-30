import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './CellgroupPage.module.css';
import Footer from '../components/Footer';
import SubPageSection from '../components/SubPageSection';
import TabMenu from '../components/TabMenu';

const cellgroupData = {
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

const cellgroupKeys = Object.keys(cellgroupData);

const CellgroupPage = () => {
    const [activeCellgroup, setActiveCellgroup] = useState(cellgroupKeys[0]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const currentData = cellgroupData[activeCellgroup];

    return (
        <div className={styles.pageWrapper}>

            <SubPageSection title="구역 안내">
                <div className={styles.contentWrapper}>
                    <TabMenu 
                        tabs={cellgroupKeys}
                        activeTab={activeCellgroup}
                        onTabChange={setActiveCellgroup}
                    />

                    <div className={styles.listContainer}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeCellgroup}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className={styles.zoneList}
                            >
                                {currentData.zones.map((zone, index) => (
                                    <div key={index} className={styles.zoneItem}>
                                        <p className={styles.zoneName}>{zone.id}구역</p>
                                        <p className={styles.zoneDetails}>
                                            구역장: {zone.leader}{zone.teacher ? ` / 구역교사: ${zone.teacher}` : ''}
                                        </p>
                                    </div>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </SubPageSection>

            <Footer />
        </div>
    );
};

export default CellgroupPage;

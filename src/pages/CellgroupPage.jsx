import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import styles from './CellgroupPage.module.css';
import Footer from '../components/Footer';
import SubPageSection from '../components/SubPageSection';
import TabMenu from '../components/TabMenu';

const CellgroupPage = () => {
    const [cellgroupData, setCellgroupData] = useState(null);
    const [activeCellgroup, setActiveCellgroup] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'cellgroups'));
            const data = {};
            querySnapshot.forEach((doc) => {
                data[doc.id] = doc.data();
            });
            setCellgroupData(data);
            const keys = Object.keys(data);
            if (keys.length > 0) {
                // sort keys (e.g. 1교구, 2교구)
                keys.sort();
                setActiveCellgroup(keys[0]);
            }
        } catch (error) {
            console.error("구역 데이터 불러오기 오류:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>로딩 중...</div>;
    }

    if (!cellgroupData || Object.keys(cellgroupData).length === 0) {
        return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>데이터가 없습니다.</div>;
    }

    const cellgroupKeys = Object.keys(cellgroupData).sort();
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
                                {currentData?.zones?.map((zone, index) => (
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

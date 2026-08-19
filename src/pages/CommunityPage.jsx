import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import styles from './CommunityPage.module.css';

// Blur Fade Animation Components
const fadeVariants = {
    hidden: { opacity: 0, filter: 'blur(10px)', y: 10 },
    show: { 
        opacity: 1, 
        filter: 'blur(0px)', 
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" }
    },
    exit: { 
        opacity: 0, 
        filter: 'blur(10px)', 
        y: -10,
        transition: { duration: 0.4, ease: "easeIn" }
    }
};

const buttonFadeVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" }
    },
    exit: { 
        opacity: 0, 
        y: -10,
        transition: { duration: 0.4, ease: "easeIn" }
    }
};

const CommunityPage = () => {
    const [cellgroupData, setCellgroupData] = useState(null);
    const [activeCellgroup, setActiveCellgroup] = useState(null);
    const [activeZone, setActiveZone] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchData();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchData = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'cellgroups'));
            const data = {};
            querySnapshot.forEach((doc) => {
                data[doc.id] = doc.data();
            });
            setCellgroupData(data);
        } catch (error) {
            console.error("구역 데이터 불러오기 오류:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className={styles.pageWrapper}></div>;
    }

    if (!cellgroupData || Object.keys(cellgroupData).length === 0) {
        return <div className={styles.pageWrapper}><div className={styles.centerContainer}>데이터가 없습니다.</div></div>;
    }

    const cellgroupKeys = Object.keys(cellgroupData).sort();

    const getPastorText = (pastor) => {
        if (!pastor) return '';
        if (typeof pastor === 'string') return pastor;
        const name = pastor.name || '';
        const role = pastor.role || '';
        if (!name) return '';
        if (role && !name.includes(role)) {
            return `${name} ${role}`;
        }
        return name;
    };

    // Derived State Logic
    let step = 1;
    if (activeCellgroup && !activeZone) step = 2;
    if (activeCellgroup && activeZone) step = 3;

    const currentData = activeCellgroup ? cellgroupData[activeCellgroup] : null;
    const currentZones = currentData?.zones || [];

    const handleSelectCellgroup = (key) => {
        setActiveCellgroup(key);
        setActiveZone(null);
        setDropdownOpen(false);
    };

    const handleResetCellgroup = () => {
        setActiveCellgroup(null);
        setActiveZone(null);
        setDropdownOpen(false);
    };

    const handleSelectZone = (zone) => {
        setActiveZone(zone);
        setDropdownOpen(false);
    };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    // Render Text Based on Step
    const renderMainText = () => {
        if (step === 1) return "구역 정보를 확인하기 위해\n먼저 교구를 선택하세요.";
        if (step === 2) return "확인하실 구역을 선택해 주세요.";
        if (step === 3) {
            let text = `${activeZone.id} 구역의 구역장은 ${activeZone.leader} 입니다.`;
            if (activeZone.teacher) {
                text = `${activeZone.id} 구역의 구역장은 ${activeZone.leader},\n구역교사는 ${activeZone.teacher} 입니다.`;
            }
            return text;
        }
        return "";
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.centerContainer}>
                
                {/* Breadcrumb */}
                <motion.div 
                    className={styles.breadcrumb}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                >
                    공동체 - 구역 안내
                </motion.div>

                {/* Main Text */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step === 3 ? activeZone.id : step}
                        variants={fadeVariants}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                        className={styles.mainText}
                        style={{ whiteSpace: 'pre-line' }}
                    >
                        {renderMainText()}
                    </motion.div>
                </AnimatePresence>

                {/* Buttons Area */}
                <div className={styles.buttonGroup}>
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div 
                                key="step1-buttons"
                                variants={buttonFadeVariants}
                                initial="hidden"
                                animate="show"
                                exit="exit"
                                className={styles.buttonGroup}
                            >
                                {cellgroupKeys.map(key => {
                                    const pastor = getPastorText(cellgroupData[key].pastor);
                                    return (
                                        <button 
                                            key={key} 
                                            className={styles.selectButton}
                                            onClick={() => handleSelectCellgroup(key)}
                                        >
                                            {key}{pastor ? ` - ${pastor}` : ''}
                                        </button>
                                    );
                                })}
                            </motion.div>
                        )}

                        {(step === 2 || step === 3) && (
                            <motion.div 
                                key="step2-buttons"
                                variants={buttonFadeVariants}
                                initial="hidden"
                                animate="show"
                                exit="exit"
                                className={styles.buttonGroup}
                            >
                                <div className={styles.dropdownContainer} ref={dropdownRef}>
                                    <button 
                                        className={`${styles.selectButton} ${dropdownOpen ? styles.dropdownOpenButton : ''}`} 
                                        onClick={toggleDropdown}
                                    >
                                        구역 선택
                                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                                            {dropdownOpen ? 'expand_less' : 'expand_more'}
                                        </span>
                                    </button>
                                    
                                        {dropdownOpen && (
                                            <div className={styles.dropdownMenu}>
                                                <div className={styles.scrollArea} data-lenis-prevent>
                                                    {currentZones.map((zone, idx) => (
                                                        <div 
                                                            key={idx} 
                                                            className={styles.dropdownItem}
                                                            onClick={() => handleSelectZone(zone)}
                                                        >
                                                            {zone.id}구역
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                </div>
                                <button 
                                    className={`${styles.selectButton} ${styles.secondary}`}
                                    onClick={handleResetCellgroup}
                                >
                                    교구 다시 선택하기
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </div>
    );
};

export default CommunityPage;

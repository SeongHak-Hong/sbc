import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './GuidePage.module.css';

import InteractiveShuttleMap from '../components/ui/InteractiveShuttleMap';
import { CHURCH_COORDS, shuttleSchedules } from '../data/shuttleData';

import map1F from '../assets/guide/1F.svg';
import map2F from '../assets/guide/2F.svg';
import map3F from '../assets/guide/3F.svg';
import mapSemi3F from '../assets/guide/semi-3F.svg';
import mapDasom1F from '../assets/guide/dasom-1F.svg';
import mapDasom2F from '../assets/guide/dasom-2F.svg';

import Breadcrumb from "../components/ui/Breadcrumb";

const facilityTabs = [
    { id: '1F', label: '1층 식당' },
    { id: '2F', label: '2층' },
    { id: '3F', label: '3층' },
    { id: 'semi3F', label: '준3층' },
    { id: 'dasom1F', label: '다솜관 1층' },
    { id: 'dasom2F', label: '다솜관 2층' },
];

const mapImages = {
    '1F': map1F,
    '2F': map2F,
    '3F': map3F,
    'semi3F': mapSemi3F,
    'dasom1F': mapDasom1F,
    'dasom2F': mapDasom2F
};

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

const adultSchedule = [
    { name: "주일 1부 예배", time: "주일 오전 07:00", location: "소예배실" },
    { name: "주일 2부 예배", time: "주일 오전 11:00", location: "대예배실" },
    { name: "주일 오후 예배", time: "주일 오후 02:00", location: "대예배실" },
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

const GuidePage = () => {
    // State management
    const [step, setStep] = useState(1);
    const [category, setCategory] = useState(null); // 'worship' or 'directions'
    const [subCategory, setSubCategory] = useState(null); // 'adult', 'nextgen', 'location', 'shuttle', 'transit', 'parking'
    const [selectedWorship, setSelectedWorship] = useState(null);
    const [selectedShuttle, setSelectedShuttle] = useState(null); // shuttle schedule object
    
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        window.scrollTo(0, 0);
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

    const resetToHome = () => {
        setStep(1);
        setCategory(null);
        setSubCategory(null);
        setSelectedWorship(null);
        setSelectedShuttle(null);
        setDropdownOpen(false);
    };

    const handleCategorySelect = (cat) => {
        setCategory(cat);
        setStep(2);
        setSubCategory(null);
        setSelectedWorship(null);
        setSelectedShuttle(null);
        setDropdownOpen(false);
    };

    const handleBackToWorshipCategory = () => {
        setStep(2);
        setSubCategory(null);
        setSelectedWorship(null);
        setDropdownOpen(false);
    };

    const handleBackToDirections = () => {
        setSubCategory(null);
        setSelectedShuttle(null);
        setDropdownOpen(false);
    };

    const handleSubCategorySelect = (subCat) => {
        setSubCategory(subCat);
        setSelectedShuttle(null);
        setDropdownOpen(false);
        if (category === 'worship') {
            setStep(3);
        }
    };

    const handleWorshipSelect = (worship) => {
        setSelectedWorship(worship);
        setDropdownOpen(false);
    };

    const handleShuttleSelect = (schedule) => {
        setSelectedShuttle(schedule);
        setDropdownOpen(false);
    };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    // Main Text Rendering
    const renderMainText = () => {
        if (step === 1) {
            return "환영합니다.\n어떤 안내가 필요하신가요?";
        }
        
        if (category === 'facilities') {
            return "구석구석 교회탐방";
        }
        
        if (category === 'worship') {
            if (!selectedWorship) {
                return "어느 예배의 자리를 찾으시나요?";
            }
            return `${selectedWorship.name}\n${selectedWorship.time}, ${selectedWorship.location}에서 함께합니다.`;
        }
        
        if (category === 'directions') {
            if (subCategory === 'location') {
                return "반가운 발걸음, 오시는 길";
            }
        }

        if (category === 'shuttle') {
            if (!selectedShuttle) {
                return "예배별 우리 동네 셔틀노선을 확인해 보세요.";
            }
            return "우리 동네 셔틀 노선";
        }

        if (category === 'parking') {
            return "교회 주차장은 언제나 열려 있습니다.\n주일에는 대죽체육관 주차장도 편하게 이용해 주세요.";
        }
        
        return "";
    };

    const getWorshipOptions = () => {
        if (subCategory === 'adult') return adultSchedule;
        if (subCategory === 'nextgen') return nextgenSchedule;
        if (subCategory === 'all') return [...adultSchedule, ...nextgenSchedule];
        return [];
    };

    // 지도 표시 여부 및 모드
    const showMap = (category === 'directions' && subCategory === 'location') || (category === 'shuttle' && selectedShuttle !== null);
    const mapMode = category === 'shuttle' ? 'shuttle' : 'church';
    const mapScheduleId = selectedShuttle?.id || null;

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.centerContainer}>
                
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${step}-${category}-${category === 'facilities' ? 'fixed' : subCategory}-${selectedWorship?.name}-${selectedShuttle?.id}`}
                        variants={fadeVariants}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                        style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    >
                        {/* Breadcrumb */}
                        <Breadcrumb text="교회소개 - 교회 안내" />

                        {/* Main Text */}
                        <div className="main-page-title" style={{ whiteSpace: 'pre-line', marginBottom: '24px' }}>
                            {renderMainText()}
                        </div>

                        {/* Map (마커만 표시, 플로팅 패널 없음) */}
                        {showMap && (
                            <div className={styles.mapSection}>
                                <InteractiveShuttleMap 
                                    mode={mapMode}
                                    scheduleId={mapScheduleId}
                                />
                            </div>
                        )}

                        {/* Buttons Area */}
                        {category !== 'facilities' && (
                        <div className={styles.buttonGroup}>
                            {/* Step 1: 메인 선택 */}
                            {step === 1 && (
                                <>
                                    <button className={styles.selectButton} onClick={() => { setCategory('worship'); setSubCategory('all'); setStep(2); }}>예배시간</button>
                                    <button className={styles.selectButton} onClick={() => { setCategory('directions'); setSubCategory('location'); setStep(2); }}>오시는 길</button>
                                    <button className={styles.selectButton} onClick={() => { setCategory('shuttle'); setSubCategory('shuttle'); setStep(2); }}>차량운행</button>
                                    <button className={styles.selectButton} onClick={() => { setCategory('parking'); setSubCategory('parking'); setStep(2); }}>주차</button>
                                    <button className={styles.selectButton} onClick={() => { setCategory('facilities'); setSubCategory('1F'); setStep(2); }}>시설 안내</button>
                                </>
                            )}

                            {/* 예배시간 선택됨 (드롭다운) */}
                            {step === 2 && category === 'worship' && (
                                <>
                                    <div className={styles.dropdownContainer} ref={dropdownRef}>
                                        <button 
                                            className={`${styles.selectButton} ${dropdownOpen ? styles.dropdownOpenButton : ''}`} 
                                            onClick={toggleDropdown}
                                        >
                                            예배 선택
                                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                                                {dropdownOpen ? 'expand_less' : 'expand_more'}
                                            </span>
                                        </button>
                                        
                                        {dropdownOpen && (
                                            <div className={styles.dropdownMenu}>
                                                <div className={styles.scrollArea} data-lenis-prevent>
                                                    {getWorshipOptions().map((worship, idx) => (
                                                        <div 
                                                            key={idx} 
                                                            className={styles.dropdownItem}
                                                            onClick={() => handleWorshipSelect(worship)}
                                                        >
                                                            {worship.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <button className={styles.selectButton} onClick={resetToHome}>처음으로</button>
                                </>
                            )}

                            {/* 교회 위치 및 대중교통 선택됨 (지도 화면) */}
                            {step === 2 && category === 'directions' && subCategory === 'location' && (
                                <>
                                    <a 
                                        href={`https://map.naver.com/index.nhn?elng=${CHURCH_COORDS.lng}&elat=${CHURCH_COORDS.lat}&etext=${encodeURIComponent('신탄진침례교회')}&menu=route`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className={styles.naverButton}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#03C75A" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M16.096 11.235L8.71 0H0v24h7.904V12.765L15.29 24H24V0h-7.904v11.235z"/>
                                        </svg>
                                        네이버 길찾기
                                    </a>
                                    <button className={styles.selectButton} onClick={resetToHome}>처음으로</button>
                                </>
                            )}

                            {/* 차량운행 - 셔틀 예배 선택 드롭다운 */}
                            {step === 2 && category === 'shuttle' && subCategory === 'shuttle' && (
                                <>
                                    <div className={styles.dropdownContainer} ref={dropdownRef}>
                                        <button 
                                            className={`${styles.selectButton} ${dropdownOpen ? (selectedShuttle ? styles.dropdownOpenButtonUp : styles.dropdownOpenButton) : ''}`} 
                                            onClick={toggleDropdown}
                                        >
                                            예배 선택
                                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                                                {dropdownOpen ? 'expand_less' : 'expand_more'}
                                            </span>
                                        </button>
                                        
                                        {dropdownOpen && (
                                            <div className={`${styles.dropdownMenu} ${selectedShuttle ? styles.dropdownMenuUp : ''}`}>
                                                <div className={`${styles.scrollArea} ${selectedShuttle ? styles.scrollAreaUp : ''}`} data-lenis-prevent>
                                                    {shuttleSchedules.map((schedule) => (
                                                        <div 
                                                            key={schedule.id} 
                                                            className={styles.dropdownItem}
                                                            onClick={() => handleShuttleSelect(schedule)}
                                                        >
                                                            {schedule.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <button className={styles.selectButton} onClick={resetToHome}>처음으로</button>
                                </>
                            )}

                            {/* 주차 선택됨 (첫 화면에서 직접 진입) */}
                            {step === 2 && category === 'parking' && subCategory === 'parking' && (
                                <>
                                    <button className={styles.selectButton} onClick={resetToHome}>처음으로</button>
                                </>
                            )}
                        </div>
                        )}

                        {/* 시설 안내 레이아웃 */}
                        {step === 2 && category === 'facilities' && (
                            <div className={styles.facilitiesContainer}>
                                <div className={styles.facilitiesSidebarDesktop}>
                                    <div className={styles.verticalButtonGroup}>
                                        {facilityTabs.map(tab => (
                                            <button 
                                                key={tab.id}
                                                className={`${styles.verticalSelectButton} ${subCategory === tab.id ? styles.active : ''}`}
                                                onClick={() => setSubCategory(tab.id)}
                                            >
                                                {subCategory === tab.id && (
                                                    <motion.div
                                                        layoutId="facilityActiveTabDesktop"
                                                        transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                                                        className={styles.activeBackground}
                                                    />
                                                )}
                                                <span className={styles.switchText}>{tab.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <button className={styles.selectButton} onClick={resetToHome} style={{ width: '100%', marginTop: '12px' }}>처음으로</button>
                                </div>
                                <div className={styles.facilitiesMapArea}>
                                    <AnimatePresence mode="wait">
                                        <motion.img 
                                            key={subCategory}
                                            src={mapImages[subCategory]} 
                                            alt="시설 안내 지도" 
                                            variants={fadeVariants}
                                            initial="hidden"
                                            animate="show"
                                            exit="exit"
                                        />
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
            
            {/* 시설 안내 레이아웃 (모바일 사이드바) */}
            <AnimatePresence>
                {step === 2 && category === 'facilities' && (
                    <motion.div 
                        className={styles.facilitiesSidebarMobile}
                        variants={fadeVariants}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                    >
                        <div className={styles.verticalButtonGroup}>
                            {facilityTabs.map(tab => (
                                <button 
                                    key={tab.id}
                                    className={`${styles.verticalSelectButton} ${subCategory === tab.id ? styles.active : ''}`}
                                    onClick={(e) => {
                                        setSubCategory(tab.id);
                                        e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                                    }}
                                >
                                    {subCategory === tab.id && (
                                        <motion.div
                                            layoutId="facilityActiveTabMobile"
                                            transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                                            className={styles.activeBackground}
                                        />
                                    )}
                                    <span className={styles.switchText}>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                        <button className={styles.selectButton} onClick={resetToHome} style={{ width: '100%', marginTop: '12px' }}>처음으로</button>
                    </motion.div>
                )}
            </AnimatePresence>
            
        </div>
    );
};

export default GuidePage;

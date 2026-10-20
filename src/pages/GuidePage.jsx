import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import styles from './GuidePage.module.css';

import InteractiveShuttleMap from '../components/ui/InteractiveShuttleMap';
import { CHURCH_COORDS, CHURCH_ADDRESS, CHURCH_PHONE, TRANSIT_STOPS, shuttleSchedules } from '../data/shuttleData';

import map1F from '../assets/guide/1F.svg';
import map2F from '../assets/guide/2F.svg';
import map3F from '../assets/guide/3F.svg';
import mapSemi3F from '../assets/guide/semi-3F.svg';
import mapDasom1F from '../assets/guide/dasom-1F.svg';
import mapDasom2F from '../assets/guide/dasom-2F.svg';

import Breadcrumb from "../components/ui/Breadcrumb";

// rooms는 평면도 이미지의 대체 텍스트로 읽힘 (평면도 글자가 도형이라 화면 낭독기가 못 읽음)
const facilityTabs = [
    { id: '1F', label: '1층 식당', name: '본관 1층', rooms: ['식당', '안쪽식당', '초등부실', '주방', '주방 창고', '화장실'] },
    { id: '2F', label: '2층', name: '본관 2층', rooms: ['소예배실', '유치부실', '찬양연습실', '새가족실', '목양실', '교역자실', '행정실', '휴게실', '청소년실', '엘리베이터', '다솜관 연결 통로'] },
    { id: '3F', label: '3층', name: '본관 3층', rooms: ['대예배실', '강대상', '찬양대석', '헌금함', '자모실', '엘리베이터'] },
    { id: 'semi3F', label: '준3층', name: '본관 준3층', rooms: ['3층 대예배실이 내려다보이는 예배석', '방송실'] },
    { id: 'dasom1F', label: '다솜관 1층', name: '다솜관 1층', rooms: ['행복쉼터', '차·커피 진열대', '본관 2층 연결 통로'] },
    { id: 'dasom2F', label: '다솜관 2층', name: '다솜관 2층', rooms: ['예배 및 교제방', '쉼터', '회의실', '기도방'] },
];

const facilityAlt = (id) => {
    const floor = facilityTabs.find((tab) => tab.id === id);
    return floor ? `${floor.name} 평면도: ${floor.rooms.join(', ')}` : '시설 평면도';
};

const mapImages = {
    '1F': map1F,
    '2F': map2F,
    '3F': map3F,
    'semi3F': mapSemi3F,
    'dasom1F': mapDasom1F,
    'dasom2F': mapDasom2F
};

const ease = [0.16, 1, 0.3, 1];

// 화면 전환: opacity + translateY(8px). custom으로 움직임 줄이기 여부를 받아 그때는 바로 바꾼다
const fadeVariants = {
    hidden: (reduce) => (reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }),
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease } },
    exit: (reduce) => (reduce
        ? { opacity: 0, transition: { duration: 0 } }
        : { opacity: 0, y: -8, transition: { duration: 0.2, ease } }),
};

// 예배시간 목록. 오른쪽에 time을 크게, 아랫줄에 "day · location"
const worshipGroups = [
    {
        id: 'adult',
        label: '어른 예배',
        items: [
            { id: 'sun1', name: '주일 1부 예배', day: '주일', time: '오전 7:00', location: '소예배실' },
            { id: 'sun2', name: '주일 2부 예배', day: '주일', time: '오전 11:00', location: '대예배실' },
            { id: 'sunpm', name: '주일 오후 예배', day: '주일', time: '오후 2:00', location: '대예배실' },
            { id: 'dawn', name: '새벽 기도회', day: '월~금', time: '새벽 5:00', location: '소예배실' },
            { id: 'intercession', name: '중보 기도회', day: '화요일', time: '오전 10:30', location: '소예배실' },
            { id: 'wed', name: '수요 예배', day: '수요일', time: '오후 7:00', location: '대예배실' },
            { id: 'fri', name: '금요 기도회', day: '금요일', time: '오후 9:00', location: '소예배실' },
        ],
    },
    {
        id: 'next',
        label: '다음세대',
        items: [
            { id: 'kinder', name: '유치부 (7세 이하)', day: '주일', time: '오전 9:00', location: '유치부실' },
            { id: 'kids', name: '초등부 주일예배', day: '주일', time: '오전 9:00', location: '러브키즈예배실' },
            { id: 'youth', name: '중고등부 주일예배', day: '주일', time: '오전 9:00', location: '소예배실' },
            { id: 'young', name: '청년부', day: '주일', time: '오후 1:30', location: '소예배실' },
            { id: 'tteok', name: '떡볶이 데이', day: '목요일', time: '오후 1~4시', location: '식당' },
        ],
    },
];

// URL 쿼리 tab 값 → 화면. 순서대로 첫 화면 버튼에 쓰임
const categoryTabs = ['worship', 'directions', 'shuttle', 'parking', 'facilities'];
// 차량운행 예배 버튼에 쓰는 짧은 이름 (shuttleData의 id 기준)
const shuttleLabels = {
    dawn: '새벽예배',
    sunday2: '주일 2부',
    sundayAfternoon: '주일 오후',
    nextgen: '교회학교',
    wednesday: '수요예배',
};

const naverRouteUrl = `https://map.naver.com/index.nhn?elng=${CHURCH_COORDS.lng}&elat=${CHURCH_COORDS.lat}&etext=${encodeURIComponent('신탄진침례교회')}&menu=route`;
const kakaoRouteUrl = `https://map.kakao.com/link/to/${encodeURIComponent('신탄진침례교회')},${CHURCH_COORDS.lat},${CHURCH_COORDS.lng}`;
const stopKind = { bus: '버스', train: '기차' };

const subCategoryOf = { worship: 'all', directions: 'location', shuttle: 'shuttle', parking: 'parking' };

const GuidePage = () => {
    // 선택 상태는 URL 쿼리에 둔다 → 뒤로가기·새로고침·링크 공유가 그대로 동작
    // 예: /guide?tab=worship&g=next, /guide?tab=shuttle&s=sunday2, /guide?tab=facilities&floor=3F
    const [searchParams, setSearchParams] = useSearchParams();
    const tabParam = searchParams.get('tab');
    const category = categoryTabs.includes(tabParam) ? tabParam : null;
    const step = category ? 2 : 1;
    const floorParam = searchParams.get('floor');
    const subCategory = category === 'facilities'
        ? (mapImages[floorParam] ? floorParam : facilityTabs[0].id)
        : subCategoryOf[category] ?? null;
    const worshipGroup = worshipGroups.find((g) => g.id === searchParams.get('g')) ?? worshipGroups[0];
    const selectedShuttle = category === 'shuttle'
        ? shuttleSchedules.find((s) => s.id === searchParams.get('s')) ?? null
        : null;

    const [shuttleMapOpen, setShuttleMapOpen] = useState(false);
    const reduceMotion = useReducedMotion();
    const [addressCopied, setAddressCopied] = useState(false);
    const copyTimer = useRef(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // 단계를 넘어갈 때는 기록을 쌓고(뒤로가기 = 이전 단계),
    // 같은 단계 안에서 고른 것만 바꿀 때는 덮어써서 뒤로가기가 선택을 하나씩 되감지 않게 한다
    const go = (params, { replace = false } = {}) => {
        setSearchParams(params, { replace });
    };

    const resetToHome = () => go({});

    const handleCategorySelect = (cat) => go({ tab: cat });

    const handleWorshipGroupSelect = (groupId) => {
        go({ tab: 'worship', g: groupId }, { replace: true });
    };

    const handleShuttleSelect = (schedule) => {
        go({ tab: 'shuttle', s: schedule.id }, { replace: selectedShuttle !== null });
    };

    // 지도는 목록 아래에서 열리므로, 펼칠 때 화면을 지도 쪽으로 내려 열린 걸 보여 준다
    const toggleShuttleMap = () => {
        const opening = !shuttleMapOpen;
        setShuttleMapOpen(opening);
        if (!opening) return;
        setTimeout(() => {
            const target = document.getElementById('shuttle-map');
            if (!target) return;
            if (window.lenis) {
                window.lenis.resize?.(); // 펼친 만큼 늘어난 페이지 길이를 Lenis에 반영
                window.lenis.scrollTo(target, { offset: -120, immediate: reduceMotion });
            } else {
                target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
            }
        }, reduceMotion ? 50 : 520); // 펼침(0.5s)이 끝난 뒤
    };

    const copyAddress = async () => {
        try {
            await navigator.clipboard.writeText(CHURCH_ADDRESS);
        } catch {
            // clipboard API가 막힌 환경(오래된 브라우저, http)용
            const field = document.createElement('textarea');
            field.value = CHURCH_ADDRESS;
            field.setAttribute('readonly', '');
            field.style.position = 'fixed';
            field.style.opacity = '0';
            document.body.appendChild(field);
            field.select();
            document.execCommand('copy');
            field.remove();
        }
        setAddressCopied(true);
        clearTimeout(copyTimer.current);
        copyTimer.current = setTimeout(() => setAddressCopied(false), 2000);
    };

    useEffect(() => () => clearTimeout(copyTimer.current), []);

    const handleFloorSelect = (floorId) => {
        go({ tab: 'facilities', floor: floorId }, { replace: true });
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
            return "어느 예배에 오시나요?";
        }
        
        if (category === 'directions') {
            if (subCategory === 'location') {
                return "반가운 발걸음, 오시는 길";
            }
        }

        if (category === 'shuttle') {
            return "어느 예배에 오시나요?";
        }

        if (category === 'parking') {
            return "교회 주차장은 언제나 열려 있습니다.\n주일에는 대죽체육관 주차장도 편하게 이용해 주세요.";
        }
        
        return "";
    };

    // 오시는 길 지도. 차량운행 지도는 노선 목록 아래에서 펼칠 때만 불러온다
    const showMap = category === 'directions' && subCategory === 'location';

    return (
        <div className={`${styles.pageWrapper} ${category === 'worship' || category === 'shuttle' || category === 'directions' ? styles.pageWrapperTop : ''}`}>
            <div className={styles.centerContainer}>
                
                <Breadcrumb text="교회소개 - 교회 안내" />

                {/* 고른 화면만 바뀐다. 처음 열 때는 애니메이션 없이 바로 보이게 */}
                <AnimatePresence mode="wait" initial={false} custom={reduceMotion}>
                    <motion.div
                        key={`${step}-${category}-${category === 'facilities' ? 'fixed' : subCategory}`}
                        custom={reduceMotion}
                        variants={fadeVariants}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                        style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    >
                        {/* Main Text */}
                        <h1 className={`main-page-title ${styles.pageTitle}`}>
                            {renderMainText()}
                        </h1>

                        {/* Map (마커만 표시, 플로팅 패널 없음) */}
                        {showMap && (
                            <div className={styles.mapSection}>
                                <InteractiveShuttleMap mode="church" />
                            </div>
                        )}

                        {/* 오시는 길: 할 일을 큰 줄로 + 가까운 정류장 (지도가 안 떠도 글자로) */}
                        {showMap && (
                            <div className={styles.listArea}>
                                <div className={styles.actionRows}>
                                    <button
                                        type="button"
                                        className={`${styles.actionRow} ${styles.actionRowAddress}`}
                                        onClick={copyAddress}
                                    >
                                        <span className={styles.actionMain}>{CHURCH_ADDRESS}</span>
                                        <span className={styles.actionHint} aria-live="polite">
                                            {addressCopied ? '복사했어요' : '눌러서 복사'}
                                        </span>
                                    </button>
                                    <a className={styles.actionRow} href={naverRouteUrl} target="_blank" rel="noopener noreferrer">
                                        <span className={styles.actionMain}>네이버 지도로 길찾기</span>
                                        <span className={styles.actionHint}>열기</span>
                                    </a>
                                    <a className={styles.actionRow} href={kakaoRouteUrl} target="_blank" rel="noopener noreferrer">
                                        <span className={styles.actionMain}>카카오맵으로 길찾기</span>
                                        <span className={styles.actionHint}>열기</span>
                                    </a>
                                    <a className={styles.actionRow} href={`tel:${CHURCH_PHONE}`}>
                                        <span className={styles.actionMain}>{CHURCH_PHONE}</span>
                                        <span className={styles.actionHint}>전화 걸기</span>
                                    </a>
                                </div>
                                <p className={styles.listLabel}>가까운 정류장</p>
                                <ul className={styles.infoList}>
                                    {TRANSIT_STOPS.map((stop) => (
                                        <li key={stop.name} className={styles.infoItem}>
                                            <span className={styles.infoName}>{stop.name}</span>
                                            <span className={styles.infoTime}>{stop.time}</span>
                                            <span className={styles.infoMeta}>{stopKind[stop.type]}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* 예배시간: 어른 / 다음세대 → 예배 목록을 한 번에 */}
                        {category === 'worship' && (
                            <>
                                <div className={styles.pillGroup} role="group" aria-label="예배 나눠 보기">
                                    {worshipGroups.map((group) => (
                                        <button
                                            key={group.id}
                                            type="button"
                                            className={styles.pill}
                                            aria-pressed={worshipGroup.id === group.id}
                                            onClick={() => handleWorshipGroupSelect(group.id)}
                                        >
                                            {group.label}
                                        </button>
                                    ))}
                                </div>
                                <div className={styles.listArea} aria-live="polite">
                                    <AnimatePresence mode="wait" initial={false}>
                                        <motion.ul
                                            key={worshipGroup.id}
                                            className={styles.infoList}
                                            aria-label={`${worshipGroup.label} 시간`}
                                            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={reduceMotion ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -8 }}
                                            transition={{ duration: 0.4, ease }}
                                        >
                                            {worshipGroup.items.map((item) => (
                                                <li key={item.id} className={styles.infoItem}>
                                                    <span className={styles.infoName}>{item.name}</span>
                                                    <span className={styles.infoTime}>{item.time}</span>
                                                    <span className={styles.infoMeta}>{item.day} · {item.location}</span>
                                                </li>
                                            ))}
                                        </motion.ul>
                                    </AnimatePresence>
                                </div>
                            </>
                        )}

                        {/* 차량운행: 예배 버튼 → 동네별 노선 글자 목록 (지도 없이도 답이 보이게) */}
                        {category === 'shuttle' && (
                            <>
                                <p className={styles.pageSub}>예배를 고르시면 동네별 셔틀 시간을 알려 드려요.</p>
                                <div className={styles.pillGroup} role="group" aria-label="예배 고르기">
                                    {shuttleSchedules.map((schedule) => (
                                        <button
                                            key={schedule.id}
                                            type="button"
                                            className={styles.pill}
                                            aria-pressed={selectedShuttle?.id === schedule.id}
                                            onClick={() => handleShuttleSelect(schedule)}
                                        >
                                            {shuttleLabels[schedule.id] ?? schedule.name}
                                        </button>
                                    ))}
                                </div>
                                <div className={styles.listArea} aria-live="polite">
                                    <AnimatePresence mode="wait" initial={false}>
                                        {selectedShuttle && (
                                            <motion.ul
                                                key={selectedShuttle.id}
                                                className={styles.infoList}
                                                aria-label={`${selectedShuttle.name} 셔틀 노선`}
                                                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={reduceMotion ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -8 }}
                                                transition={{ duration: 0.4, ease }}
                                            >
                                                {selectedShuttle.routes.map((route) => (
                                                    <li key={route.id} className={styles.infoItem}>
                                                        <span className={styles.infoName}>{route.area}</span>
                                                        <span className={styles.infoTime}>{route.time}</span>
                                                        <span className={styles.infoMeta}>차량 {route.carNum}</span>
                                                    </li>
                                                ))}
                                            </motion.ul>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </>
                        )}

                        {/* Buttons Area */}
                        {category !== 'facilities' && (
                        <div className={styles.buttonGroup}>
                            {/* Step 1: 메인 선택 */}
                            {step === 1 && (
                                <>
                                    <button className={styles.selectButton} onClick={() => handleCategorySelect('worship')}>예배시간</button>
                                    <button className={styles.selectButton} onClick={() => handleCategorySelect('directions')}>오시는 길</button>
                                    <button className={styles.selectButton} onClick={() => handleCategorySelect('shuttle')}>차량운행</button>
                                    <button className={styles.selectButton} onClick={() => handleCategorySelect('parking')}>주차</button>
                                    <button className={styles.selectButton} onClick={() => handleCategorySelect('facilities')}>시설 안내</button>
                                </>
                            )}

                            {step === 2 && category === 'worship' && (
                                <button className={styles.selectButton} onClick={resetToHome}>처음으로</button>
                            )}

                            {step === 2 && category === 'directions' && (
                                <button className={styles.selectButton} onClick={resetToHome}>처음으로</button>
                            )}

                            {/* 차량운행: 지도는 필요할 때만 펼침 */}
                            {step === 2 && category === 'shuttle' && (
                                <>
                                    {selectedShuttle && (
                                        <button
                                            type="button"
                                            className={styles.selectButton}
                                            aria-expanded={shuttleMapOpen}
                                            aria-controls="shuttle-map"
                                            onClick={toggleShuttleMap}
                                        >
                                            {shuttleMapOpen ? '지도 접기' : '지도로 보기'}
                                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }} aria-hidden="true">
                                                {shuttleMapOpen ? 'expand_less' : 'expand_more'}
                                            </span>
                                        </button>
                                    )}
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

                        {category === 'shuttle' && selectedShuttle && (
                            <div
                                id="shuttle-map"
                                className={`${styles.mapReveal} ${shuttleMapOpen ? styles.mapRevealOpen : ''}`}
                            >
                                <div>
                                    {shuttleMapOpen && (
                                        <div className={styles.shuttleMap}>
                                            <InteractiveShuttleMap mode="shuttle" scheduleId={selectedShuttle.id} />
                                        </div>
                                    )}
                                </div>
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
                                                aria-pressed={subCategory === tab.id}
                                                onClick={() => handleFloorSelect(tab.id)}
                                            >
                                                {subCategory === tab.id && (
                                                    <motion.div
                                                        layoutId="facilityActiveTabDesktop"
                                                        transition={reduceMotion ? { duration: 0 } : { type: "spring", bounce: 0.3, duration: 0.6 }}
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
                                    <AnimatePresence mode="wait" initial={false} custom={reduceMotion}>
                                        <motion.img
                                            custom={reduceMotion}
                                            key={subCategory}
                                            src={mapImages[subCategory]} 
                                            alt={facilityAlt(subCategory)}
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
            <AnimatePresence initial={false} custom={reduceMotion}>
                {step === 2 && category === 'facilities' && (
                    <motion.div 
                        className={styles.facilitiesSidebarMobile}
                        custom={reduceMotion}
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
                                    aria-pressed={subCategory === tab.id}
                                    onClick={(e) => {
                                        handleFloorSelect(tab.id);
                                        e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                                    }}
                                >
                                    {subCategory === tab.id && (
                                        <motion.div
                                            layoutId="facilityActiveTabMobile"
                                            transition={reduceMotion ? { duration: 0 } : { type: "spring", bounce: 0.3, duration: 0.6 }}
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

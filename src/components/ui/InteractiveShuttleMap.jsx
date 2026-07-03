import React, { useEffect, useRef, useState } from 'react';
import styles from './InteractiveShuttleMap.module.css';
import { CHURCH_COORDS, shuttleSchedules } from '../../data/shuttleData';
import TabMenu from '../TabMenu';

const InteractiveShuttleMap = () => {
    const mapElement = useRef(null);
    const mapInstance = useRef(null);
    const markersRef = useRef([]);

    // 'church' (교회 위치) or 'shuttle' (셔틀 노선)
    const [mainTab, setMainTab] = useState('church');
    // 셔틀 노선 중 활성화된 탭 (새벽예배, 주일2부 등)
    const [activeScheduleId, setActiveScheduleId] = useState(shuttleSchedules[1].id); // 기본값: 주일2부예배

    // 지도 초기화
    useEffect(() => {
        const { naver } = window;
        if (!mapElement.current || !naver || !naver.maps) return;

        if (!mapInstance.current) {
            const location = new naver.maps.LatLng(CHURCH_COORDS.lat, CHURCH_COORDS.lng);
            const mapOptions = {
                center: location,
                zoom: 16,
                zoomControl: true,
                zoomControlOptions: {
                    position: naver.maps.Position.TOP_RIGHT,
                },
            };
            mapInstance.current = new naver.maps.Map(mapElement.current, mapOptions);
        }
    }, []);

    // 탭 상태가 변경될 때마다 마커 업데이트 및 줌 조절
    useEffect(() => {
        const { naver } = window;
        if (!mapInstance.current || !naver) return;

        const map = mapInstance.current;

        // 기존 마커 모두 제거
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        if (mainTab === 'church') {
            // [교회 위치 모드]
            const churchLocation = new naver.maps.LatLng(CHURCH_COORDS.lat, CHURCH_COORDS.lng);
            
            // 교회 마커 생성 (네이버 스타일 말풍선)
            const churchMarker = new naver.maps.Marker({
                position: churchLocation,
                map: map,
                icon: {
                    content: `
                        <div class="${styles.naverMarker} ${styles.naverMarkerPrimary}">
                            신탄진침례교회
                        </div>
                    `,
                    anchor: new naver.maps.Point(0, 0)
                }
            });
            markersRef.current.push(churchMarker);

            // 교회 중심으로 줌 인 및 이동 (부드럽게)
            map.morph(churchLocation, 16, { duration: 500 });

        } else if (mainTab === 'shuttle') {
            // [셔틀 노선 모드]
            const activeSchedule = shuttleSchedules.find(s => s.id === activeScheduleId);
            if (!activeSchedule) return;

            const bounds = new naver.maps.LatLngBounds();

            // 1. 중심을 잡기 위해 교회 좌표도 bounds에 추가
            const churchLocation = new naver.maps.LatLng(CHURCH_COORDS.lat, CHURCH_COORDS.lng);
            bounds.extend(churchLocation);
            
            // 교회 마커 (네이버 스타일 말풍선)
            const churchMarker = new naver.maps.Marker({
                position: churchLocation,
                map: map,
                icon: {
                    content: `
                        <div class="${styles.naverMarker} ${styles.naverMarkerPrimary}">
                            신탄진침례교회
                        </div>
                    `,
                    anchor: new naver.maps.Point(0, 0)
                },
                zIndex: 10
            });
            markersRef.current.push(churchMarker);

            // 2. 셔틀 정류장 마커 추가
            activeSchedule.routes.forEach((route) => {
                const routeLocation = new naver.maps.LatLng(route.lat, route.lng);
                bounds.extend(routeLocation);

                // 네이버 스타일 말풍선 커스텀 마커
                const markerHTML = `
                    <div class="${styles.naverMarker}">
                        <div class="${styles.markerDot}"></div>
                        ${route.area}
                    </div>
                `;

                const marker = new naver.maps.Marker({
                    position: routeLocation,
                    map: map,
                    icon: {
                        content: markerHTML,
                        anchor: new naver.maps.Point(0, 0)
                    },
                    zIndex: 100
                });

                markersRef.current.push(marker);
            });

            // 생성된 모든 마커가 보이도록 지도의 뷰포트 자동 조절 (Auto-Fit Bounds)
            // 패널이 지도 좌측/하단을 가리므로 여백(margin)을 넉넉히 줍니다.
            map.panToBounds(bounds, { duration: 500 }, { top: 50, right: 50, bottom: 300, left: 350 });
        }

    }, [mainTab, activeScheduleId]);

    const activeSchedule = shuttleSchedules.find(s => s.id === activeScheduleId);

    return (
        <div className={styles.mapContainer}>
            {/* 네이버 지도 렌더링 타겟 */}
            <div ref={mapElement} className={styles.mapArea} />

            {/* 플로팅 정보 패널 */}
            <div className={styles.floatingPanel}>
                
                {/* 메인 탭 */}
                <TabMenu 
                    className={styles.mainTabs}
                    tabs={[{id: 'church', label: '교회위치'}, {id: 'shuttle', label: '차량운행'}]}
                    activeTab={mainTab}
                    onTabChange={setMainTab}
                    getTabId={(t) => t.id}
                    getTabLabel={(t) => t.label}
                />

                {mainTab === 'church' && (
                    <div className={styles.churchInfo}>
                        <p className={styles.churchDesc}>
                            대전 대덕구 석봉로 17<br/>
                            셔틀버스 관련 문의: <a href="tel:042-932-8156" className={styles.contact}>042-932-8156</a>
                        </p>
                    </div>
                )}

                {mainTab === 'shuttle' && (
                    <>
                        {/* 서브 탭 그룹 (예배 시간 선택) */}
                        <div className={styles.subTabsGroup}>
                            <div className={styles.subTabRow}>
                                <span className={styles.subTabLabel}>주일</span>
                                <div className={styles.subTabButtonGroup}>
                                    {shuttleSchedules.filter(s => ['sunday2', 'sundayAfternoon', 'nextgen'].includes(s.id)).map(schedule => (
                                        <button
                                            key={schedule.id}
                                            className={`${styles.subTab} ${activeScheduleId === schedule.id ? styles.active : ''}`}
                                            onClick={() => setActiveScheduleId(schedule.id)}
                                        >
                                            {schedule.name === '주일2부예배' ? '2부예배' : schedule.name === '주일오후예배' ? '오후예배' : schedule.name === '교회학교' ? '다음세대' : schedule.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className={styles.subTabRow}>
                                <span className={styles.subTabLabel}>평일</span>
                                <div className={styles.subTabButtonGroup}>
                                    {shuttleSchedules.filter(s => ['dawn', 'wednesday'].includes(s.id)).map(schedule => (
                                        <button
                                            key={schedule.id}
                                            className={`${styles.subTab} ${activeScheduleId === schedule.id ? styles.active : ''}`}
                                            onClick={() => setActiveScheduleId(schedule.id)}
                                        >
                                            {schedule.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 선택된 예배의 노선 리스트 */}
                        <div className={styles.routeList}>
                            {activeSchedule?.routes.map(route => (
                                <div key={route.id} className={styles.routeItem}>
                                    <span className={styles.routeArea}>{route.area}</span>
                                    <div className={styles.routeDetails}>
                                        {route.carNum} · {route.driver} · {route.time}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

            </div>
        </div>
    );
};

export default InteractiveShuttleMap;

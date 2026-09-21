import React, { useEffect, useRef, useState } from 'react';
import styles from './InteractiveShuttleMap.module.css';
import { CHURCH_COORDS, shuttleSchedules } from '../../data/shuttleData';

const InteractiveShuttleMap = ({ mode = 'church', scheduleId = null }) => {
    const mapElement = useRef(null);
    const mapInstance = useRef(null);
    const markersRef = useRef([]);

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
                    position: naver.maps.Position.TOP_RIGHT } };
            mapInstance.current = new naver.maps.Map(mapElement.current, mapOptions);
        }
    }, []);

    // mode와 scheduleId가 변경될 때마다 마커 업데이트
    useEffect(() => {
        const { naver } = window;
        if (!mapInstance.current || !naver) return;

        const map = mapInstance.current;

        // 기존 마커 모두 제거
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        if (mode === 'church') {
            // [교회 위치 모드]
            const churchLocation = new naver.maps.LatLng(CHURCH_COORDS.lat, CHURCH_COORDS.lng);
            
            const churchMarkerHTML = `
                <div class="${styles.churchMarkerCard}">
                    <div class="${styles.churchMarkerTitle}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                        신탄진침례교회
                    </div>
                    <div class="${styles.churchMarkerAddress}">
                        대전 대덕구 석봉로 17
                    </div>
                    <div class="${styles.churchMarkerContact}">
                        도움이 필요하시면 언제든 연락해 주세요<br/>
                        <a href="tel:042-932-8156">📞 042-932-8156</a>
                    </div>
                </div>
            `;

            const churchMarker = new naver.maps.Marker({
                position: churchLocation,
                map: map,
                icon: {
                    content: churchMarkerHTML,
                    anchor: new naver.maps.Point(0, 0)
                },
                zIndex: 10
            });

            naver.maps.Event.addListener(churchMarker, 'mouseover', () => {
                churchMarker.setZIndex(1000);
            });
            naver.maps.Event.addListener(churchMarker, 'mouseout', () => {
                churchMarker.setZIndex(10);
            });
            naver.maps.Event.addListener(churchMarker, 'click', () => {
                markersRef.current.forEach(m => {
                    const isChurch = m.getIcon().content.includes('churchMarkerTitle');
                    m.setZIndex(isChurch ? 10 : 100);
                });
                churchMarker.setZIndex(1000);
            });
            markersRef.current.push(churchMarker);

            // 대중교통 마커
            const TRANSIT_STOPS = [
                { name: '신탄진시장 정류장', time: '도보 3분', type: 'bus', lat: 36.4455, lng: 127.4265 },
                { name: '석봉네거리 정류장', time: '도보 3분', type: 'bus', lat: 36.4470, lng: 127.4205 },
                { name: '신탄진역', time: '도보 5분', type: 'train', lat: 36.4491, lng: 127.4285 }
            ];

            const bounds = new naver.maps.LatLngBounds();
            bounds.extend(churchLocation);

            TRANSIT_STOPS.forEach(stop => {
                const stopLoc = new naver.maps.LatLng(stop.lat, stop.lng);
                bounds.extend(stopLoc);
                const markerHTML = `
                    <div class="${styles.shuttleMarkerCard}">
                        <div class="${styles.shuttleMarkerTitle}">
                            <div class="${styles.transitDot}"></div>
                            ${stop.name}
                        </div>
                        <div class="${styles.shuttleMarkerDetails}">
                            <span>${stop.time}</span>
                        </div>
                    </div>
                `;
                const marker = new naver.maps.Marker({
                    position: stopLoc,
                    map: map,
                    icon: { content: markerHTML, anchor: new naver.maps.Point(0, 0) },
                    zIndex: 100
                });
                naver.maps.Event.addListener(marker, 'mouseover', () => marker.setZIndex(1000));
                naver.maps.Event.addListener(marker, 'mouseout', () => marker.setZIndex(100));
                naver.maps.Event.addListener(marker, 'click', () => {
                    markersRef.current.forEach(m => {
                        const isChurch = m.getIcon().content.includes('churchMarkerTitle');
                        m.setZIndex(isChurch ? 10 : 100);
                    });
                    marker.setZIndex(1000);
                });
                markersRef.current.push(marker);
            });

            if (map.getZoom() < 15) {
                map.morph(churchLocation, 16, { duration: 500 });
            } else {
                map.panTo(churchLocation);
            }

        } else if (mode === 'shuttle' && scheduleId) {
            // [셔틀 노선 모드]
            const activeSchedule = shuttleSchedules.find(s => s.id === scheduleId);
            if (!activeSchedule) return;

            const bounds = new naver.maps.LatLngBounds();

            const churchLocation = new naver.maps.LatLng(CHURCH_COORDS.lat, CHURCH_COORDS.lng);
            bounds.extend(churchLocation);
            
            const churchMarkerHTML = `
                <div class="${styles.churchMarkerCard}">
                    <div class="${styles.churchMarkerTitle}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                        신탄진침례교회
                    </div>
                </div>
            `;

            const churchMarker = new naver.maps.Marker({
                position: churchLocation,
                map: map,
                icon: {
                    content: churchMarkerHTML,
                    anchor: new naver.maps.Point(0, 0)
                },
                zIndex: 10
            });

            naver.maps.Event.addListener(churchMarker, 'mouseover', () => {
                churchMarker.setZIndex(1000);
            });
            naver.maps.Event.addListener(churchMarker, 'mouseout', () => {
                churchMarker.setZIndex(10);
            });
            naver.maps.Event.addListener(churchMarker, 'click', () => {
                markersRef.current.forEach(m => {
                    const isChurch = m.getIcon().content.includes('churchMarkerTitle');
                    m.setZIndex(isChurch ? 10 : 100);
                });
                churchMarker.setZIndex(1000);
            });

            markersRef.current.push(churchMarker);

            activeSchedule.routes.forEach((route) => {
                const routeLocation = new naver.maps.LatLng(route.lat, route.lng);
                bounds.extend(routeLocation);

                const markerHTML = `
                    <div class="${styles.shuttleMarkerCard}">
                        <div class="${styles.shuttleMarkerTitle}">
                            <div class="${styles.markerDot}"></div>
                            ${route.area} 방향
                        </div>
                        <div class="${styles.shuttleMarkerDetails}">
                            <span>차량: ${route.carNum} (${route.driver})</span>
                            <span>시간: ${route.time}</span>
                        </div>
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

                naver.maps.Event.addListener(marker, 'mouseover', () => {
                    marker.setZIndex(1000);
                });
                naver.maps.Event.addListener(marker, 'mouseout', () => {
                    marker.setZIndex(100);
                });
                naver.maps.Event.addListener(marker, 'click', () => {
                    markersRef.current.forEach(m => {
                        const isChurch = m.getIcon().content.includes('churchMarkerTitle');
                        m.setZIndex(isChurch ? 10 : 100);
                    });
                    marker.setZIndex(1000);
                });

                markersRef.current.push(marker);
            });

            map.panToBounds(bounds, { duration: 500 }, { top: 50, right: 50, bottom: 50, left: 50 });
        }

    }, [mode, scheduleId]);

    return (
        <div className={styles.mapContainer}>
            <div ref={mapElement} className={styles.mapArea} />
        </div>
    );
};

export default InteractiveShuttleMap;

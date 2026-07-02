import React, { useEffect, useRef } from 'react';

const NaverMap = () => {
    const mapElement = useRef(null);

    useEffect(() => {
        const initMap = () => {
            const { naver } = window;
            if (!mapElement.current || !naver || !naver.maps) return;

            // 좌표: 대전 대덕구 석봉로 17 (신탄진침례교회)
            const location = new naver.maps.LatLng(36.4475294, 127.4236487);

            const mapOptions = {
                center: location,
                zoom: 17,
                zoomControl: true,
                zoomControlOptions: {
                    position: naver.maps.Position.TOP_RIGHT,
                },
            };

            const map = new naver.maps.Map(mapElement.current, mapOptions);

            // 기본 핀(마커) 추가
            new naver.maps.Marker({
                position: location,
                map: map,
            });
        };

        // 네이버 지도 스크립트가 로드될 때까지 기다림
        if (window.naver && window.naver.maps) {
            initMap();
        } else {
            const timer = setInterval(() => {
                if (window.naver && window.naver.maps) {
                    clearInterval(timer);
                    initMap();
                }
            }, 200);

            // 5초 후에도 안 뜨면 포기 (무한 반복 방지)
            setTimeout(() => clearInterval(timer), 5000);
            
            return () => clearInterval(timer);
        }
    }, []);

    return (
        <div 
            ref={mapElement} 
            style={{ 
                width: '100%', 
                aspectRatio: '4 / 3',
                backgroundColor: '#eee' // 로딩 전 배경색
            }} 
        />
    );
};

export default NaverMap;

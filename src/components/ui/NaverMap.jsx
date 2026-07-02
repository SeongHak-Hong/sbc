import React, { useEffect, useRef } from 'react';

const NaverMap = ({ 
    address = "대전 대덕구 석봉로 17", 
    detailAddress = "",
    title = "신탄진침례교회",
    category = "",
    phone = ""
}) => {
    const mapElement = useRef(null);

    useEffect(() => {
        const { naver } = window;
        
        // 네이버 지도 및 Geocoder 서비스 로드 대기
        if (!mapElement.current || !naver || !naver.maps || !naver.maps.Service) return;

        const renderMap = (lat, lng) => {
            const location = new naver.maps.LatLng(lat, lng);

            const mapOptions = {
                center: location,
                zoom: 17,
                zoomControl: true,
                zoomControlOptions: {
                    position: naver.maps.Position.TOP_RIGHT,
                },
            };

            const map = new naver.maps.Map(mapElement.current, mapOptions);

            const marker = new naver.maps.Marker({
                position: location,
                map: map,
            });

            const contentString = `
                <div style="padding: 15px 20px; text-align: center; background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border: 1px solid #eee;">
                    <div style="display: flex; justify-content: center; align-items: center; gap: 6px; margin-bottom: 6px;">
                        <h4 style="margin: 0; font-size: 16px; font-weight: 700; color: #111; letter-spacing: -0.5px;">${title}</h4>
                        ${category ? `<span style="font-size: 11px; padding: 2px 6px; background: #f3f4f6; color: #4b5563; border-radius: 4px; font-weight: 600;">${category}</span>` : ''}
                    </div>
                    <p style="margin: 0 0 ${phone ? '4px' : '12px'} 0; font-size: 13px; color: #666; letter-spacing: -0.5px;">
                        ${address}
                        ${detailAddress ? `<br/><span style="color:#888;">${detailAddress}</span>` : ''}
                    </p>
                    ${phone ? `<p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 600; letter-spacing: -0.5px;"><a href="tel:${phone}" style="color: #3b82f6; text-decoration: none;">📞 ${phone}</a></p>` : ''}
                    <a href="https://map.naver.com/p/search/${encodeURIComponent(address)}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 8px 16px; background-color: #03c75a; color: white; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 600; letter-spacing: -0.5px;">네이버 지도로 보기</a>
                </div>
            `;

            const infoWindow = new naver.maps.InfoWindow({
                content: contentString,
                borderWidth: 0,
                disableAnchor: true,
                backgroundColor: 'transparent',
                pixelOffset: new naver.maps.Point(0, -15) // 마커 위로 살짝 띄움
            });

            naver.maps.Event.addListener(marker, "click", () => {
                if (infoWindow.getMap()) {
                    infoWindow.close();
                } else {
                    infoWindow.open(map, marker);
                }
            });

            infoWindow.open(map, marker);
        };

        // Geocoding API를 사용하여 주소를 좌표로 변환
        naver.maps.Service.geocode({ query: address }, function(status, response) {
            if (status !== naver.maps.Service.Status.OK || response.v2.addresses.length === 0) {
                console.error("Geocoding failed for address: " + address);
                // 검색 실패 시 기본값(신탄진침례교회) 좌표로 폴백
                renderMap(36.4475294, 127.4236487);
                return;
            }

            const item = response.v2.addresses[0];
            renderMap(parseFloat(item.y), parseFloat(item.x)); // item.y = 위도, item.x = 경도
        });

    }, [address, detailAddress, title, category, phone]);

    return (
        <div 
            ref={mapElement} 
            style={{ 
                width: '100%', 
                minHeight: '400px',
                aspectRatio: '4 / 3',
                backgroundColor: '#eee' // 로딩 전 배경색
            }} 
        />
    );
};

export default NaverMap;

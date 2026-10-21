import React from 'react';
import Aurora from './Aurora';
import styles from './PageTopGradient.module.css';

// 첫 화면 오로라: 하늘빛·크림빛이 하얗게 빛나며 천천히 일렁이고, 양끝에 라벤더가 살짝 묻어난다
// (빛을 더하는 방식이라 lightMode는 끈다)
export const AURORA = {
    // 양끝은 라벤더(#D6CFFF)를 하늘빛 쪽으로 많이 섞은 색이라 가장자리에 연보라가 슬쩍 비치는 정도
    colorStops: ['#BFCBFF', '#A8CFFF', '#FFF6D8', '#A8CFFF', '#BFCBFF'],
    lightMode: false,
    mouseInteraction: false,
    amplitude: 1.1,
    blend: 0.5,
    height: 0.5,
    speed: 0.8,
    glow: 0.5,
    opacity: 0.75,
    layers: 2,
};

// 서브페이지 첫 화면의 하늘빛 그라디언트 + 그 위 오로라. 페이지 감싸개의 첫 자식으로 둔다.
// className으로 높이·끝 위치를 바꿀 수 있다 (교회 안내는 바로가기 탭 줄 아래 40px에 맞춤).
// WebGL2를 못 쓰는 기기에서는 오로라가 그려지지 않아도 아래 그라디언트가 그대로 보인다.
// 움직임 줄이기 설정, 화면 밖, 다른 탭에서는 오로라가 멈춘다 (Aurora 안에서 처리)
const PageTopGradient = ({ className = '', aurora = true }) => (
    <div className={`${styles.gradient} ${className}`.trim()} aria-hidden="true">
        {aurora && <Aurora {...AURORA} style={{ position: 'absolute', inset: 0 }} />}
    </div>
);

export default PageTopGradient;

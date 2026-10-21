import React from 'react';
import styles from './PageTopGradient.module.css';

// 서브페이지 첫 화면의 하늘빛 그라디언트. 페이지 감싸개의 첫 자식으로 둔다.
// className으로 높이·끝 위치를 바꿀 수 있다 (교회 안내는 바로가기 탭 줄 아래 40px에 맞춤)
const PageTopGradient = ({ className = '' }) => (
    <div className={`${styles.gradient} ${className}`.trim()} aria-hidden="true" />
);

export default PageTopGradient;

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const MobileScrollFade = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Framer Motion을 사용하여 스크롤 진행도를 추적
  const { scrollYProgress } = useScroll();
  
  // 스크롤이 끝부분(0.95 ~ 1.0)에 도달하면 자연스럽게 페이드아웃(opacity 0)
  const opacity = useTransform(scrollYProgress, [0, 0.95, 1], [1, 1, 0]);

  // 데스크톱 환경에서는 렌더링하지 않음
  if (!isMobile) return null;

  return (
    <motion.div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '80px', // 이미지와 비슷하게 넉넉한 페이드 높이
        pointerEvents: 'none',
        zIndex: 9999,
        background: 'linear-gradient(to top, rgba(252, 235, 224, 1) 0%, rgba(252, 235, 224, 0) 100%)',
        opacity: opacity,
      }}
    />
  );
};

export default MobileScrollFade;

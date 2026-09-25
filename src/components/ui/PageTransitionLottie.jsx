import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Lottie from 'lottie-react';
import { motion } from 'framer-motion';
import transitionData from '../../assets/lottie/birdies.json';

export default function PageTransitionLottie() {
    const location = useLocation();
    const [isPlaying, setIsPlaying] = useState(false);
    const [key, setKey] = useState(0);
    const [scale, setScale] = useState(1.2);
    
    // 번갈아가며 효과를 주기 위한 토글 ref (초기값은 가로지르는 효과)
    const isCrossScreen = useRef(true);
    const isFirstRender = useRef(true);
    const prevPathname = useRef(location.pathname);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setScale(3.0);
            } else {
                setScale(1.2);
            }
        };
        
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const isPostRoute = location.pathname.startsWith('/post/');
        const wasPostRoute = prevPathname.current.startsWith('/post/');
        prevPathname.current = location.pathname;

        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        // 포스트 열고 닫을 때는 애니메이션 재생 안 함
        if (isPostRoute || wasPostRoute) {
            return;
        }
        
        setIsPlaying(true);
        setKey(prev => prev + 1);
        isCrossScreen.current = !isCrossScreen.current; // 매번 효과를 번갈아가며 토글

        const timer = setTimeout(() => {
            setIsPlaying(false);
        }, 6000); // 가로지르는 효과가 6초이므로 6초 후 리셋

        return () => clearTimeout(timer);
    }, [location.pathname]);

    if (!isPlaying) return null;

    const crossProps = {
        initial: { x: '-100vw', y: 0, opacity: 1 },
        animate: { x: '100vw', y: 0, opacity: 1 },
        transition: { duration: 6.0, delay: 0, ease: "easeInOut" }
    };

    const topRightProps = {
        initial: { x: '35vw', y: '-15vh', opacity: 1 },
        animate: { x: '35vw', y: '-80vh', opacity: 0 },
        transition: { duration: 1.5, delay: 3.0, ease: "easeInOut" }
    };

    const currentProps = isCrossScreen.current ? crossProps : topRightProps;

    return (
        <motion.div 
            key={key}
            initial={currentProps.initial}
            animate={currentProps.animate}
            transition={currentProps.transition}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none',
                zIndex: 80,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Lottie 
                key={`lottie-${key}`}
                animationData={transitionData} 
                loop={true}
                style={{ width: '100%', height: '100%', transform: isCrossScreen.current ? `scaleX(-${scale}) scaleY(${scale})` : `scale(${scale})` }}
            />
        </motion.div>
    );
}

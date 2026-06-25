import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import styles from './TeamPage.module.css';

import CloudBackground from '../components/CloudBackground';
import LanyardCanvas from '../components/LanyardCanvas';

const TeamPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Array of team members (using HTML placeholders mixed with Korean roles for context)
    const teamMembers = [
        {
            name: '최영락',
            role: '담임목사',
            image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
            bg: 'var(--accent-gold)',
            badges: [
                { text: '말씀선포', type: 'teaching' },
                { text: '목회총괄', type: 'north' }
            ]
        },
        {
            name: '김정현',
            role: '부목사',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
            bg: '#A8DADC',
            badges: [
                { text: '1교구·유초등부', type: 'north' },
                { text: '유초등부', type: 'youth' }
            ]
        },
        {
            name: '김윤섭',
            role: '부목사',
            image: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=400&q=80',
            bg: '#B5A6C9',
            badges: [
                { text: '2교구·중고등부', type: 'south' },
                { text: '중고등부', type: 'youth' }
            ]
        },
        {
            name: '강현수',
            role: '전도사',
            image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=400&q=80',
            bg: '#81B29A',
            badges: [
                { text: '청년부', type: 'central' }
            ]
        },
        {
            name: '이지은',
            role: '교육전도사',
            image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
            bg: '#F2CC8F',
            badges: [
                { text: '유치부', type: 'youth' }
            ]
        },
        {
            name: '김태인',
            role: '행정간사',
            image: 'https://images.unsplash.com/photo-1542596594-649edbc13630?auto=format&fit=crop&w=400&q=80',
            bg: '#D4A373',
            badges: [
                { text: '행정지원', type: 'central' }
            ]
        }
    ];

    const containerRef = useRef(null);
    const galleryRef = useRef(null);
    const [scrollRange, setScrollRange] = useState(0);

    useLayoutEffect(() => {
        const updateRange = () => {
            if (galleryRef.current) {
                // Wider range = slower scroll speed
                const range = (teamMembers.length * 800) - window.innerWidth;
                setScrollRange(range > 0 ? range : 0);
            }
        };
        updateRange();
        window.addEventListener('resize', updateRange);
        return () => window.removeEventListener('resize', updateRange);
    }, [teamMembers.length]);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
    const scrollHeight = scrollRange > 0 ? `${scrollRange + window.innerHeight}px` : '100vh';

    return (
        <div ref={containerRef} style={{ height: scrollHeight, position: 'relative' }}>
            <div className={styles.pageWrapper}>
                <CloudBackground heightMode="vh" />
                


                <main className={styles.mainContent}>
                    {/* 3D Lanyard Canvas handling the horizontal layout and cards */}
                    <div className={styles.fixedContainer}>
                        
                        <LanyardCanvas members={teamMembers} scrollProgress={smoothProgress} />
                    </div>
                </main>
            </div>
            
            {/* Invisible horizontal element to measure width inside the scrolling container */}
            <div ref={galleryRef} style={{ width: `${teamMembers.length * 400}px`, height: 1, position: 'absolute', top: 0, visibility: 'hidden' }} />
        </div>
    );
};

export default TeamPage;

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from './TeamPage.module.css';
import SubNav from '../components/SubNav';
import Footer from '../components/Footer';
import CloudBackground from '../components/CloudBackground';
import BalloonBackground from '../components/BalloonBackground';

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
                { text: '1교구', type: 'north' },
                { text: '유초등부', type: 'youth' }
            ]
        },
        {
            name: '김윤섭',
            role: '부목사',
            image: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=400&q=80',
            bg: '#B5A6C9',
            badges: [
                { text: '2교구', type: 'south' },
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
        }
    ];

    // Parent container animation variants for stagger
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4, duration: 0.8 } }
    };

    return (
        <div className={styles.pageContainer}>
            <CloudBackground heightMode="vh" />
            
            <div className={styles.navWrapper}>
                <SubNav />
            </div>

            <main className={styles.mainContent}>


                {/* Hero Section */}
                <section className={styles.hero}>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        우리 교회의 든든한 동역자, 교역자와 직원들을 소개합니다. 성도님들의 영적 성장과 평안한 신앙생활을 위해 기쁨으로 헌신합니다.
                    </motion.p>
                </section>

                {/* Directory Grid */}
                <motion.section 
                    className={styles.directoryGrid}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {teamMembers.map((member, idx) => (
                        <motion.article className={styles.card} key={idx} variants={cardVariants}>
                            <div className={styles.innerProfile}>
                                <div className={styles.profileText}>
                                    <h3>{member.name}</h3>
                                    <p className={styles.role}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                                        {member.role}
                                    </p>
                                </div>
                                <img src={member.image} alt={member.name} className={styles.profileImage} />
                            </div>

                            <div className={styles.bottomArea}>
                                <div className={styles.memberInfo}>
                                    <div className={styles.miniAvatarWrap}>
                                        <img src={member.image} alt="" className={styles.miniAvatar} />
                                        <div className={styles.onlineDot}></div>
                                    </div>
                                    <div className={styles.memberText}>
                                        <span className={styles.handle}>@{member.name}</span>
                                        <span className={styles.time}>{member.badges[0]?.text || 'SBC'}</span>
                                    </div>
                                </div>
                                <button className={styles.actionBtn}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                    {member.badges[1]?.text || '프로필'}
                                </button>
                            </div>
                        </motion.article>
                    ))}
                </motion.section>
            </main>
            <Footer />
        </div>
    );
};

export default TeamPage;

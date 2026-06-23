import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../components/Footer';
import styles from './NextGenPage.module.css';

const departmentsData = {
    kindergarten: {
        id: 'kindergarten',
        name: '유치부',
        color: '#4ADE80',
        title: '유치부\n예배안내',
        schedule: '매주 주일 오전 11:00',
        location: '1층 사랑홀',
        leader: { name: '이지은 전도사', role: '담당 교역자', icon: '👩‍💼' },
        director: { name: '이윤정 집사', role: '부장', icon: '👩‍🏫' },
        teamTitle: '교사팀',
        teachers: ['한순희', '임동순', '김재량', '김신혜'],
        moreTeachersCount: 0,
        events: [
            { title: '어린이 주일 특별 파티', date: '5월 5일', status: '마감임박', statusBg: '#4ADE80', img: 'https://images.pexels.com/photos/8612911/pexels-photo-8612911.jpeg?auto=compress&cs=tinysrgb&w=800', desc: '아이들을 위한 특별한 간식과 재미있는 활동이 준비되어 있습니다.' },
            { title: '여름 성경학교', date: '7월 20-21일', status: '모집중', statusBg: '#FBCB51', img: 'https://images.pexels.com/photos/8613071/pexels-photo-8613071.jpeg?auto=compress&cs=tinysrgb&w=800', desc: '말씀과 찬양 속에서 예수님을 만나는 즐거운 여름 성경학교!' }
        ]
    },
    elementary: {
        id: 'elementary',
        name: '유초등부',
        color: '#FBCB51',
        title: '유초등부\n예배안내',
        schedule: '매주 주일 오전 10:00',
        location: '2층 기쁨홀',
        leader: { name: '김정현 목사', role: '담당 교역자', icon: '👨‍💼' },
        director: { name: '이명애 집사', role: '부장', icon: '👩‍🏫' },
        teamTitle: '교사팀',
        teachers: ['오수경', '오영미', '이영미', '김선주', '홍성학', '정효정', '최대한', '오대영', '이예솔'],
        moreTeachersCount: 0,
        events: [
            { title: '가을 축제 & 게임 나이트', date: '10월 25일', status: '접수중', statusBg: '#FA7A55', img: 'https://images.pexels.com/photos/8613071/pexels-photo-8613071.jpeg?auto=compress&cs=tinysrgb&w=800', desc: '본당 앞마당에서 게임, 간식, 대형 에어바운스와 함께하는 즐거운 밤!' },
            { title: '2024 겨울 수련회', date: '11월 12-14일', status: '모집중', statusBg: '#BA87ED', img: 'https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg?auto=compress&cs=tinysrgb&w=800', desc: '하나님을 예배하고 평생의 친구를 사귀는 특별한 주말 수련회입니다.' },
            { title: '성탄절 성가대 준비', date: '12월 10일', status: '오픈예정', statusBg: '#1C2A43', img: 'https://images.pexels.com/photos/8089063/pexels-photo-8089063.jpeg?auto=compress&cs=tinysrgb&w=800', desc: '유초등부 성탄절 특별 공연에 함께할 성가대원을 곧 모집합니다.' }
        ]
    },
    youth: {
        id: 'youth',
        name: '중고등부',
        color: '#BA87ED',
        title: '중고등부\n예배안내',
        schedule: '매주 주일 오전 09:30',
        location: '3층 비전홀',
        leader: { name: '김윤섭 목사', role: '담당 교역자', icon: '👨‍💼' },
        director: { name: '박경우 집사', role: '부장', icon: '👨‍🏫' },
        teamTitle: '교사팀',
        teachers: ['안수빈', '장혁진', '최영실', '최우진', '박정민'],
        moreTeachersCount: 0,
        events: [
            { title: '청소년 비전 캠프', date: '8월 10-12일', status: '모집중', statusBg: '#BA87ED', img: 'https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg?auto=compress&cs=tinysrgb&w=800', desc: '비전을 찾고 뜨겁게 기도하는 청소년 연합 여름 캠프.' },
            { title: '중간고사 응원 이벤트', date: '10월 15일', status: '진행중', statusBg: '#FA7A55', img: 'https://images.pexels.com/photos/8612911/pexels-photo-8612911.jpeg?auto=compress&cs=tinysrgb&w=800', desc: '시험 준비에 지친 친구들을 위해 깜짝 간식을 전달합니다.' }
        ]
    },
    youngadults: {
        id: 'youngadults',
        name: '청년부',
        color: '#FA7A55',
        title: '청년부\n예배안내',
        schedule: '매주 주일 오후 2:00',
        location: '3층 비전홀',
        leader: { name: '강현수 전도사', role: '담당 교역자', icon: '👨‍💼' },
        director: { name: '홍성문 집사', role: '부장', icon: '👨‍🏫' },
        teamTitle: '임원진',
        teachers: ['회장 박현지', '부회장 유현지', '총무 송재두', '회계 임동순', '서기 이예솔'],
        moreTeachersCount: 0,
        events: [
            { title: '청년부 단기선교', date: '1월 15-20일', status: '모집완료', statusBg: '#1C2A43', img: 'https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg?auto=compress&cs=tinysrgb&w=800', desc: '동남아시아 지역으로 사랑을 전하러 떠나는 청년부 단기선교.' },
            { title: '새내기 환영회', date: '3월 10일', status: '예정', statusBg: '#FA7A55', img: 'https://images.pexels.com/photos/8613071/pexels-photo-8613071.jpeg?auto=compress&cs=tinysrgb&w=800', desc: '대학에 갓 입학한 새내기들을 진심으로 환영하는 시간!' }
        ]
    }
};

const NextGenPage = () => {
    const [activeTab, setActiveTab] = useState('kindergarten');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const activeData = departmentsData[activeTab];
    const tabs = Object.values(departmentsData);

    return (
        <div className={styles.pageWrapper}>
            <div className="global-texture-overlay"></div>
            <main className={styles.container}>
                <header className={styles.headerSection}>
                    <div style={{ position: 'absolute', top: '-40px', left: '-40px', width: '96px', height: '96px', backgroundColor: '#FBCB51', borderRadius: '50%', mixBlendMode: 'multiply', filter: 'blur(40px)', opacity: 0.4 }} className={styles.animateFloat}></div>
                    <div style={{ position: 'absolute', top: '40px', right: '-40px', width: '128px', height: '128px', backgroundColor: '#BA87ED', borderRadius: '50%', mixBlendMode: 'multiply', filter: 'blur(40px)', opacity: 0.4 }} className={styles.animateFloatDelayed}></div>

                    <motion.span 
                        className={`${styles.handwriting} ${styles.eyebrow}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        다음세대를 세우는 곳,
                    </motion.span>
                    <motion.h1 
                        className={styles.headerTitle}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <span className={styles.gradientText}>Next Generation</span>
                    </motion.h1>
                    <motion.p 
                        className={styles.headerSubtitle}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        아이들과 학생들이 신앙을 발견하고, 평생의 친구를 만들며, 진정으로 즐거움을 누릴 수 있는 곳입니다.
                    </motion.p>
                </header>

                <nav className={styles.navTabs} aria-label="Department Filter">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabActive : styles.tabInactive}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.name}
                        </button>
                    ))}
                </nav>

                <AnimatePresence mode="wait">
                    <motion.section 
                        key={activeTab}
                        className={styles.gridSection}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className={styles.mainCard} style={{ backgroundColor: activeData.color }}>
                            <div style={{ position: 'absolute', right: '-80px', top: '-80px', width: '256px', height: '256px', border: '40px solid rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
                            <div style={{ position: 'absolute', left: '-40px', bottom: '-40px', width: '160px', height: '160px', border: '20px solid rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>

                            <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', height: '100%', flexGrow: 1 }}>
                                <h2 className={styles.cardTitle}>{activeData.title}</h2>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flexGrow: 1, justifyContent: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <div className={styles.infoIconWrapper}>
                                            <div className={styles.scallopedBg}></div>
                                            <div className={styles.animateFloat} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: activeData.color }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div>
                                            <p className={styles.infoValue}>{activeData.schedule.split(' ').slice(-1)[0]}</p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <div className={styles.infoIconWrapper}>
                                            <div className={styles.scallopedBg}></div>
                                            <div className={styles.animateFloatDelayed} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: activeData.color }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div>
                                            <p className={styles.infoValue} style={{ fontSize: 'var(--text-h4)' }}>{activeData.location}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.subCard}>
                            <div>
                                <h3 className={styles.leaderTitle}>섬기는 분들</h3>
                                <div className={styles.leaderGrid}>
                                    <div className={styles.leaderBox} style={{ backgroundColor: 'rgba(251, 203, 81, 0.1)', borderColor: 'rgba(251, 203, 81, 0.2)' }}>
                                        <div className={styles.leaderIcon} style={{ backgroundColor: '#FBCB51' }}>
                                            {activeData.leader.icon}
                                        </div>
                                        <div>
                                            <span className={styles.leaderBadge}>{activeData.leader.role}</span>
                                            <p className={styles.leaderName}>{activeData.leader.name}</p>
                                        </div>
                                    </div>

                                    <div className={styles.leaderBox} style={{ backgroundColor: 'rgba(74, 222, 128, 0.1)', borderColor: 'rgba(74, 222, 128, 0.2)' }}>
                                        <div className={styles.leaderIcon} style={{ backgroundColor: '#4ADE80' }}>
                                            {activeData.director.icon}
                                        </div>
                                        <div>
                                            <span className={styles.leaderBadge}>{activeData.director.role}</span>
                                            <p className={styles.leaderName}>{activeData.director.name}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.teamBox}>
                                <div className={styles.teamHeader}>
                                    <h3 className={styles.teamTitle}>{activeData.teamTitle}</h3>
                                </div>
                                <div className={styles.teamTags}>
                                    {activeData.teachers.map((teacher, idx) => {
                                        return (
                                            <div key={idx} className={styles.teamTag}>
                                                {teacher}
                                            </div>
                                        )
                                    })}
                                    {activeData.moreTeachersCount > 0 && (
                                        <div className={styles.teamTag} style={{ borderColor: '#9CA3AF' }}>
                                            +외 {activeData.moreTeachersCount}명
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.section>
                </AnimatePresence>

                {activeData.events.length > 0 && (
                    <section className={styles.eventsSection}>
                        <div className={styles.eventsHeader}>
                            <h2 className={styles.eventsTitle}>예정된 행사</h2>
                            <a href="#" className={styles.eventsLink}>전체보기</a>
                        </div>
                        <div className={styles.eventsGrid}>
                            {activeData.events.map((ev, idx) => (
                                <motion.div 
                                    key={idx} 
                                    className={styles.eventCard}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <div className={`${styles.eventImageWrapper} ${styles.posterMask}`} style={{ backgroundColor: `${ev.statusBg}20` }}>
                                        <img src={ev.img} alt={ev.title} className={styles.eventImage} />
                                    </div>
                                    <div>
                                        <div className={styles.eventMeta}>
                                            <span className={styles.eventStatus} style={{ backgroundColor: ev.statusBg }}>
                                                {ev.status}
                                            </span>
                                            <span className={styles.eventDate}>
                                                📅 {ev.date}
                                            </span>
                                        </div>
                                        <h3 className={styles.eventTitle}>{ev.title}</h3>
                                        <p className={styles.eventDesc}>{ev.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default NextGenPage;

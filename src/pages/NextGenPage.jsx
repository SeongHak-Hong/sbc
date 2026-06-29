import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../components/Footer';
import SubPageSection from '../components/SubPageSection';
import TabMenu from '../components/TabMenu';
import styles from './NextGenPage.module.css';

const getBadgeStyle = (status) => {
    switch(status) {
        case '모집중':
        case '접수중':
        case '진행중':
            return { bg: '#DBEAFE', color: '#1E3A8A' }; // Light Blue
        case '마감임박':
            return { bg: '#FEF3C7', color: '#92400E' }; // Light Amber
        case '모집완료':
            return { bg: '#F3F4F6', color: '#374151' }; // Light Gray
        case '오픈예정':
        case '예정':
            return { bg: '#EDE9FE', color: '#5B21B6' }; // Light Purple
        default:
            return { bg: '#F3F4F6', color: '#374151' };
    }
};

const departmentsData = {
    kindergarten: {
        id: 'kindergarten',
        name: '유치부',
        color: '#4ADE80',
        schedule: '주일 오전 09:00',
        location: '유치부실',
        leader: { name: '이지은 전도사', role: '담당 교역자' },
        director: { name: '한순희 집사', role: '부장' },
        teamTitle: '교사팀',
        teachers: ['임동순', '김재량', '김신혜'],
        moreTeachersCount: 0,
        events: [
            { title: '어린이 주일 특별 파티', date: '5월 5일', status: '마감임박', img: 'https://images.pexels.com/photos/8612911/pexels-photo-8612911.jpeg?auto=compress&cs=tinysrgb&w=800', desc: '아이들을 위한 특별한 간식과 재미있는 활동이 준비되어 있습니다.' },
            { title: '여름 성경학교', date: '7월 20-21일', status: '모집중', img: 'https://images.pexels.com/photos/8613071/pexels-photo-8613071.jpeg?auto=compress&cs=tinysrgb&w=800', desc: '말씀과 찬양 속에서 예수님을 만나는 즐거운 여름 성경학교!' }
        ]
    },
    elementary: {
        id: 'elementary',
        name: '초등부',
        color: '#FBCB51',
        schedule: '주일 오전 09:00',
        location: '러브키즈예배실',
        extraEvents: [
            { label: '떡볶이 데이 시간', value: '매주 목요일 오후 1~4시' },
            { label: '떡볶이 데이 장소', value: '식당' }
        ],
        leader: { name: '김정현 목사', role: '담당 교역자' },
        director: { name: '이명애 집사', role: '부장' },
        teamTitle: '교사팀',
        teachers: ['오수경', '오영미', '이영미', '김선주', '홍성학', '정효정', '최대한', '오대영', '이예솔', '정기숙'],
        moreTeachersCount: 0,
        events: [
            { title: '가을 축제 & 게임 나이트', date: '10월 25일', status: '접수중', img: 'https://images.pexels.com/photos/8613071/pexels-photo-8613071.jpeg?auto=compress&cs=tinysrgb&w=800', desc: '본당 앞마당에서 게임, 간식, 대형 에어바운스와 함께하는 즐거운 밤!' },
            { title: '2024 겨울 수련회', date: '11월 12-14일', status: '모집중', img: 'https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg?auto=compress&cs=tinysrgb&w=800', desc: '하나님을 예배하고 평생의 친구를 사귀는 특별한 주말 수련회입니다.' },
            { title: '성탄절 성가대 준비', date: '12월 10일', status: '오픈예정', img: 'https://images.pexels.com/photos/8089063/pexels-photo-8089063.jpeg?auto=compress&cs=tinysrgb&w=800', desc: '초등부 성탄절 특별 공연에 함께할 성가대원을 곧 모집합니다.' }
        ]
    },
    youth: {
        id: 'youth',
        name: '중고등부',
        color: '#BA87ED',
        schedule: '주일 오전 09:00',
        location: '소예배실',
        extraEvents: [
            { label: '떡볶이 데이 시간', value: '매주 목요일 오후 1~4시' },
            { label: '떡볶이 데이 장소', value: '식당' }
        ],
        leader: { name: '김윤섭 목사', role: '담당 교역자' },
        director: { name: '박경우 집사', role: '부장' },
        teamTitle: '교사팀',
        teachers: ['안수빈', '장혁진', '최영실', '최우진', '박정민'],
        moreTeachersCount: 0,
        events: [
            { title: '청소년 비전 캠프', date: '8월 10-12일', status: '모집중', img: 'https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg?auto=compress&cs=tinysrgb&w=800', desc: '비전을 찾고 뜨겁게 기도하는 청소년 연합 여름 캠프.' },
            { title: '중간고사 응원 이벤트', date: '10월 15일', status: '진행중', img: 'https://images.pexels.com/photos/8612911/pexels-photo-8612911.jpeg?auto=compress&cs=tinysrgb&w=800', desc: '시험 준비에 지친 친구들을 위해 깜짝 간식을 전달합니다.' }
        ]
    },
    youngadults: {
        id: 'youngadults',
        name: '청년부',
        color: '#FA7A55',
        schedule: '주일 오후 1:30',
        location: '소예배실',
        leader: { name: '강현수 전도사', role: '담당 교역자' },
        director: { name: '홍성문 집사', role: '부장' },
        teamTitle: '임원진',
        teachers: ['회장 박현지', '부회장 유현지', '총무 송재두', '회계 임동순', '서기 이예솔'],
        moreTeachersCount: 0,
        events: [
            { title: '청년부 단기선교', date: '1월 15-20일', status: '모집완료', img: 'https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg?auto=compress&cs=tinysrgb&w=800', desc: '동남아시아 지역으로 사랑을 전하러 떠나는 청년부 단기선교.' },
            { title: '새내기 환영회', date: '3월 10일', status: '예정', img: 'https://images.pexels.com/photos/8613071/pexels-photo-8613071.jpeg?auto=compress&cs=tinysrgb&w=800', desc: '대학에 갓 입학한 새내기들을 진심으로 환영하는 시간!' }
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
            <SubPageSection 
                title="다음세대" 
                subtitle={<p className={styles.headerSubtitle}>신탄진침례교회의 내일을 열어가는 주인공들입니다.</p>}
            >
                <div className={styles.contentWrapper}>
                    <TabMenu 
                        tabs={tabs}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        getTabId={(tab) => tab.id}
                        getTabLabel={(tab) => tab.name}
                        className={styles.nextgenTabs}
                    />

                    <AnimatePresence mode="wait">
                        <motion.section
                            key={activeTab}
                            className={styles.contentSection}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className={styles.infoBlock}>
                                <h2 className={styles.blockTitle}>예배 안내</h2>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>예배 시간</span>
                                    <p className={styles.infoValue}>{activeData.schedule}</p>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>예배 장소</span>
                                    <p className={styles.infoValue}>{activeData.location}</p>
                                </div>
                                {activeData.extraEvents && activeData.extraEvents.map((evt, i) => (
                                    <div key={i} className={styles.infoRow}>
                                        <span className={styles.infoLabel}>{evt.label}</span>
                                        <p className={styles.infoValue}>{evt.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.infoBlock}>
                                <h2 className={styles.blockTitle}>섬기는 분들</h2>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>{activeData.leader.role}</span>
                                    <p className={`${styles.infoValue} ${styles.highlightText}`}>{activeData.leader.name}</p>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>{activeData.director.role}</span>
                                    <p className={`${styles.infoValue} ${styles.highlightText}`}>{activeData.director.name}</p>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>{activeData.teamTitle}</span>
                                    <div className={styles.teamGrid}>
                                        {activeData.teachers.map((teacher, idx) => (
                                            <span key={idx} className={styles.teamItem}>{teacher}</span>
                                        ))}
                                        {activeData.moreTeachersCount > 0 && (
                                            <span className={styles.teamItem}>+외 {activeData.moreTeachersCount}명</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.section>
                    </AnimatePresence>

                    {activeData.events.length > 0 && (
                        <section className={styles.eventsSection}>
                            <div className={styles.eventsHeader}>
                                <h2 className={styles.eventsTitle}>주요 행사</h2>
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
                                        <div className={styles.eventImageWrapper}>
                                            <img src={ev.img} alt={ev.title} className={styles.eventImage} />
                                        </div>
                                        <div>
                                            <div className={styles.eventMeta}>
                                                <span 
                                                    className={styles.eventStatus} 
                                                    style={{ 
                                                        backgroundColor: getBadgeStyle(ev.status).bg,
                                                        color: getBadgeStyle(ev.status).color
                                                    }}
                                                >
                                                    {ev.status}
                                                </span>
                                                <span className={styles.eventDate}>
                                                    {ev.date}
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
                </div>
            </SubPageSection>
            <Footer />
        </div>
    );
};

export default NextGenPage;

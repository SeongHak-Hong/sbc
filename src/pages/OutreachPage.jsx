import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import Footer from '../components/Footer';
import PageTopGradient from '../components/PageTopGradient';
import { DEFAULT_PRAYERS } from '../content/outreach';
import neighborPhoto from '../assets/main/shintanjin-baptist-church-neighbor-outreach.webp';
import welcomePhoto from '../assets/outreach/shintanjin-baptist-church-outreach-team-welcome.webp';
import tteokbokkiPhoto from '../assets/outreach/shintanjin-baptist-church-outreach-tteokbokki.webp';
import friendsPhoto from '../assets/outreach/shintanjin-baptist-church-outreach-children-friends.webp';
import prayerPhoto from '../assets/outreach/shintanjin-baptist-church-intercessory-prayer.webp';
import overseasPhoto from '../assets/outreach/shintanjin-baptist-church-overseas-mission-care-box.webp';
import domesticPhoto from '../assets/outreach/shintanjin-baptist-church-domestic-mission.webp';
import styles from './OutreachPage.module.css';

const ease = [0.16, 1, 0.3, 1];

// ⑤ 함께하기 배경 사진 (반갑게 손 흔들며 맞이하는 목요전도팀)
const JOIN_BG = welcomePhoto;

// ② 목요전도팀이 하는 일 (메인 '교회가 하는 일'과 같은 카드). 사진이 없는 칸은 옅은 색 면으로 둔다
const ACTIVITIES = [
    {
        lead: '떡볶이 한 그릇으로 아이들을 맞아요.',
        photo: tteokbokkiPhoto,
        alt: '신탄진침례교회 식당에서 집사님이 종이컵에 떡볶이를 담아 아이에게 건네는 모습',
        text: '학교 마칠 시간에 맞춰 떡볶이와 음료를 준비하고, 아이들이 안전하게 먹고 갈 수 있게 곁을 지켜요.',
        tone: 'sand',
    },
    {
        lead: '아이들의 이름을 기억하고 친구가 돼요.',
        photo: friendsPhoto,
        alt: '떡볶이를 든 아이와 눈을 맞추며 이야기를 나누는 목요전도팀 성도',
        text: '떡볶이를 먹으러 온 아이들과 이야기를 나누고, 예수님의 사랑을 전해요.',
        tone: 'sky',
    },
    {
        lead: '동네 이웃께 먼저 인사드려요.',
        text: '신탄진 골목을 다니며 이웃을 만나고, 교회를 소개해요.',
        photo: neighborPhoto,
        alt: '목요전도팀이 동네 골목에서 이웃 어르신께 선물을 건네는 모습',
    },
    {
        lead: '교회 안에서 기도로 함께해요.',
        photo: prayerPhoto,
        alt: '신탄진침례교회 중보 기도팀 성도들이 서로 어깨에 손을 얹고 함께 기도하는 모습',
        text: '나가는 사람들 뒤에서, 만나는 한 사람 한 사람을 위해 중보 기도팀이 기도해요.',
        tone: 'dusk',
    },
];

// ④ 선교사님 목록을 '묶음' 별로 나눈다. 묶음이 없는 분은 이름 없는 한 묶음으로 모은다
// 한 묶음 안에서 모든 분의 소속이 같으면(예: 모두 FMB) 소속은 묶음 이름에 맡기고 줄마다 쓰지 않는다
// 소속이 '우즈벡인 교회 / FMB'처럼 둘이면 앞의 것만 쓴다 (한 줄을 지역 · 단체 · 이름 세 마디로)
const firstOrg = (organization = '') => organization.split('/')[0].trim();

const groupMissionaries = (list = []) => {
    const groups = [];
    list.filter((item) => item.name?.trim()).forEach((item) => {
        const label = item.group?.trim() || '';
        let group = groups.find((g) => g.label === label);
        if (!group) {
            group = { label, items: [] };
            groups.push(group);
        }
        group.items.push(item);
    });
    return groups.map((group) => {
        const orgs = new Set(group.items.map((item) => firstOrg(item.organization)));
        const sameOrg = group.label && orgs.size === 1;
        return {
            label: group.label,
            items: group.items.map((item) => ({
                where: [item.region?.trim(), sameOrg ? '' : firstOrg(item.organization)].filter(Boolean).join(' '),
                name: item.name.trim(),
            })),
        };
    });
};

// '김정현 목사 010-3358-3579' → 'tel:01033583579'
const telHref = (contact = '') => {
    const match = contact.match(/0\d{1,2}[-\s]?\d{3,4}[-\s]?\d{4}/);
    return match ? `tel:${match[0].replace(/\D/g, '')}` : null;
};

const Media = ({ photo, alt, tone, className = '' }) => (
    <div className={`${styles.media} ${tone ? styles[tone] : ''} ${className}`.trim()}>
        {photo && <img className={styles.photo} src={photo} alt={alt} loading="lazy" />}
    </div>
);

const OutreachPage = () => {
    const [missionData, setMissionData] = useState(null);
    const trackRef = useRef(null);
    const reduceMotion = useReducedMotion();

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchData = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'missions'));
                const data = {};
                querySnapshot.forEach((doc) => {
                    data[doc.id] = doc.data();
                });
                setMissionData(data);
            } catch (error) {
                console.error('선교 데이터 불러오기 오류:', error);
                setMissionData({});
            }
        };
        fetchData();
    }, []);

    const scrollTrack = (direction) => {
        if (!trackRef.current) return;
        const card = trackRef.current.querySelector(`.${styles.maCard}`);
        const step = card ? card.getBoundingClientRect().width + 16 : 536;
        trackRef.current.scrollBy({ left: direction * step, behavior: reduceMotion ? 'auto' : 'smooth' });
    };

    // 화면에 들어올 때 아래에서 살짝 올라오며 나타남 (움직임 줄이기 설정이면 바로 보임)
    const reveal = reduceMotion
        ? {}
        : {
            initial: { opacity: 0, y: 16 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true, margin: '0px 0px -10% 0px' },
            transition: { duration: 0.8, ease },
        };

    const loaded = missionData !== null;
    const evangelism = missionData?.evangelism || {};
    const saved = evangelism.prayers || {};
    const prayers = {
        monthLabel: saved.monthLabel?.trim() || DEFAULT_PRAYERS.monthLabel,
        month: saved.month?.trim() || DEFAULT_PRAYERS.month,
        items: (saved.items?.length ? saved.items : DEFAULT_PRAYERS.items).filter((item) => item.title?.trim() || item.text?.trim()),
    };
    const missionCards = [
        { id: 'overseas', title: '해외선교', tone: 'sky', photo: overseasPhoto, alt: '해외 선교사님께 보낼 성경과 편지, 간식을 선교 상자에 담는 성도들의 손' },
        { id: 'domestic', title: '국내선교', tone: 'sand', photo: domesticPhoto, alt: '시골 교회 목사님께 쌀과 생필품 상자를 전하는 성도들' },
    ]
        .map((card) => ({ ...card, title: missionData?.[card.id]?.name || card.title, groups: groupMissionaries(missionData?.[card.id]?.list) }))
        .filter((card) => card.groups.length > 0);
    const contact = evangelism.contact || '';
    const tel = telHref(contact);

    return (
        <div className={styles.page}>
            <PageTopGradient />

            {/* ① 첫 화면: 왼쪽 제목 · 오른쪽 세로 사진 (휴대폰은 위아래) */}
            <section className={styles.hero}>
                <div className={`${styles.wrap} ${styles.heroGrid}`}>
                    <motion.div {...reveal}>
                        <h1 className={styles.heroTitle}>떡볶이 한 그릇에<br />담아 전하는 사랑</h1>
                        <p className={styles.heroLead}>
                            목요일마다 동네 아이들과 이웃을 만나요.<br />
                            가까운 곳부터 땅끝까지, 예수님의 사랑을 전해요.
                        </p>
                    </motion.div>
                    <motion.div {...reveal}>
                        <Media photo={welcomePhoto} alt="신탄진침례교회 마당에서 목요전도팀 두 분이 손을 흔들고 손가락 하트로 반갑게 맞이하는 모습" tone="warm" className={styles.heroMedia} />
                    </motion.div>
                </div>
            </section>

            {/* ② 하는 일: 메인 페이지 '교회가 하는 일'과 같은 구조 (가로로 넘기는 사진 카드 + 이전·다음) */}
            <section className={styles.ma} aria-labelledby="outreach-work">
                <div className={`${styles.wrap} ${styles.secHead}`}>
                    <h2 id="outreach-work" className={styles.secTitle}>목요일 오후,<br />네 갈래로 나가요.</h2>
                </div>
                <div ref={trackRef} className={styles.maTrack} tabIndex={0} role="region" aria-label="목요전도팀이 하는 일">
                    {ACTIVITIES.map((item) => (
                        <article key={item.lead} className={styles.maCard}>
                            <Media photo={item.photo} alt={item.alt} tone={item.tone || 'warm'} className={styles.maMedia} />
                            <p className={styles.maCap}>
                                <strong>{item.lead}</strong> {item.text}
                            </p>
                        </article>
                    ))}
                </div>
                <div className={`${styles.wrap} ${styles.maNavWrap}`}>
                    <div className={styles.maNav} aria-label="카드 이동">
                        <button className={styles.maBtn} type="button" onClick={() => scrollTrack(-1)} aria-label="이전">
                            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 18l-6-6 6-6" />
                            </svg>
                        </button>
                        <button className={styles.maBtn} type="button" onClick={() => scrollTrack(1)} aria-label="다음">
                            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 6l6 6-6 6" />
                            </svg>
                        </button>
                    </div>
                </div>
            </section>

            {/* ③ 기도 제목: 짙은 '이번 달' 카드 한 장 + 흰 카드 (관리자에서 바꿈) */}
            <section className={`${styles.sec} ${styles.band}`} aria-labelledby="outreach-prayer">
                <div className={styles.wrap}>
                    <div className={styles.secHead}>
                        <h2 id="outreach-prayer" className={styles.secTitle}>함께 기도해 주세요.</h2>
                    </div>
                    {loaded && (
                        <div className={styles.prayerGrid}>
                            <motion.div className={`${styles.prayerCard} ${styles.prayerMonth}`} {...reveal}>
                                <h3 className={styles.prayerTitle}>{prayers.monthLabel} 기도 제목</h3>
                                <p className={styles.prayerText}>{prayers.month}</p>
                            </motion.div>
                            {prayers.items.map((item, index) => (
                                <motion.div key={index} className={styles.prayerCard} {...reveal}>
                                    <h3 className={styles.prayerTitle}>{item.title}</h3>
                                    <p className={styles.prayerText}>{item.text}</p>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ④ 선교사님: 사진이 위를 채운 카드 두 장, 아래에 '묶음. 지역 단체 이름 · …' 한 문단 */}
            {missionCards.length > 0 && (
                <section className={styles.sec} aria-labelledby="outreach-missions">
                    <div className={styles.wrap}>
                        <div className={styles.secHead}>
                            <h2 id="outreach-missions" className={styles.secTitle}>가까운 이웃부터 땅끝까지</h2>
                            <p className={styles.secLead}>교회가 함께 기도하고 후원하는 선교사님들이에요.</p>
                        </div>
                        <div className={styles.missionGrid}>
                            {missionCards.map((card) => (
                                <motion.article key={card.id} className={styles.missionCard} {...reveal}>
                                    <Media photo={card.photo} alt={card.alt} tone={card.tone} className={styles.missionMedia} />
                                    <div className={styles.missionBlur} aria-hidden="true" />
                                    <div className={styles.missionBody}>
                                        <h3 className={styles.missionTitle}>{card.title}</h3>
                                        {card.groups.map((group) => (
                                            <p key={group.label || 'all'} className={styles.missionFlow}>
                                                {group.label && <><strong>{group.label}.</strong>{' '}</>}
                                                {group.items.map((item, index) => (
                                                    <React.Fragment key={`${item.name}-${index}`}>
                                                        {index > 0 && <> <span className={styles.sep} aria-hidden="true">·</span> </>}
                                                        <span className={styles.missionItem}>
                                                            {item.where && <>{item.where} </>}
                                                            <span className={styles.missionName}>{item.name}</span>
                                                        </span>
                                                    </React.Fragment>
                                                ))}
                                            </p>
                                        ))}
                                    </div>
                                </motion.article>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ⑤ 함께하기: 사진을 배경에 깔고 짙은 막을 얹어 흰 글씨가 보이게 */}
            <section className={`${styles.sec} ${styles.join}`} aria-labelledby="outreach-join">
                <img className={styles.joinBg} src={JOIN_BG} alt="" aria-hidden="true" loading="lazy" />
                <div className={styles.wrap}>
                    <h2 id="outreach-join" className={styles.secTitle}>목요일에 함께해 주세요.</h2>
                    {contact && <p className={styles.joinWho}>{contact.replace(/\s+(0\d)/, ' · $1')}</p>}
                    {tel && (
                        <a className={styles.joinBtn} href={tel}>
                            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
                            </svg>
                            전화로 문의하기
                        </a>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default OutreachPage;

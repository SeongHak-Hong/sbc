import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Footer from '../components/Footer';
import { NEXTGEN_DEPTS } from '../content/nextgenDepts';
import styles from './NextGenDeptPage.module.css';

import shotFriends from '../assets/outreach/shintanjin-baptist-church-outreach-children-friends.webp';
import shotTteok from '../assets/outreach/shintanjin-baptist-church-outreach-tteokbokki.webp';
import shotWelcome from '../assets/outreach/shintanjin-baptist-church-outreach-team-welcome.webp';

// 다음세대 부서 페이지 (/nextgen/:dept). 첫 화면 → 주일 예배 → 일 년 프로그램 → 부서 행사 → 사진
// 첫 화면 그림은 기획을 다시 잡는 중이라 지금은 부서 색 바탕에 글만 둔다

const ease = [0.16, 1, 0.3, 1];

const lines = (text) => text.split('\n').map((line, i, all) => (
    <span key={line}>{line}{i < all.length - 1 && <br />}</span>
));

// 행사 날짜: 2026-11-22 → 11월 22일, 기간이면 11월 22일 ~ 24일
const md = (s) => {
    if (!s) return '';
    const [, m, d] = s.split('-');
    return m && d ? `${parseInt(m, 10)}월 ${parseInt(d, 10)}일` : s;
};
const eventDate = (ev) => {
    const start = ev.startDate || ev.date;
    const end = ev.endDate && ev.endDate !== start ? ev.endDate : '';
    if (!start) return md(end);
    if (!end) return md(start);
    const [, sm] = start.split('-');
    const [, em, ed] = end.split('-');
    return sm === em ? `${md(start)} ~ ${parseInt(ed, 10)}일` : `${md(start)} ~ ${md(end)}`;
};
const firstImage = (content) => {
    if (!content) return null;
    const m = content.match(/!\[.*?\]\((.*?)\)/) || content.match(/<img[^>]+src="([^">]+)"/);
    return m ? m[1] : null;
};
const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];

// 이 부서(+ 함께 하는 떡볶이데이) 행사 중 끝나지 않은 것을 가까운 날짜 순으로
const useDeptEvents = (keys) => {
    const [events, setEvents] = useState(null);
    const id = keys.join(',');
    useEffect(() => {
        let alive = true;
        setEvents(null);
        Promise.all(keys.map((k) => getDoc(doc(db, 'nextgen', k))))
            .then((snaps) => {
                const now = today();
                const list = [];
                snaps.forEach((snap, si) => {
                    if (!snap.exists()) return;
                    const data = snap.data();
                    (data.events || []).forEach((ev, idx) => {
                        const last = ev.endDate || ev.date || ev.startDate || '';
                        if (last && last < now) return;
                        list.push({ ...ev, idx, deptKey: keys[si], deptName: data.name || '' });
                    });
                });
                list.sort((a, b) => (a.startDate || a.date || '').localeCompare(b.startDate || b.date || ''));
                if (alive) setEvents(list);
            })
            .catch((err) => {
                console.error('다음세대 행사 불러오기 오류:', err);
                if (alive) setEvents([]);
            });
        return () => { alive = false; };
        // keys는 매번 새 배열이라 문자열로 비교한다
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);
    return events;
};

const Poster = ({ src, title, dept }) => (
    <span className={styles.poster} aria-hidden="true">
        {src ? (
            <>
                <img className={styles.posterBg} src={src} alt="" loading="lazy" />
                <img className={styles.posterFg} src={src} alt="" loading="lazy" />
            </>
        ) : (
            <span className={styles.posterNone}><span>{dept}</span>{title}</span>
        )}
    </span>
);

const DeptEvents = ({ dept }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const keys = [dept.key, ...(dept.items || []).filter((it) => it.events).map((it) => it.events)];
    const events = useDeptEvents(keys);

    const open = (ev) => {
        const when = eventDate(ev);
        let content = '';
        if (ev.time) content += `🕒 시간: ${ev.time}  \n`;
        if (ev.location) content += `🚩 장소: ${ev.location}  \n`;
        if (content) content += '\n';
        content += ev.desc || '';
        const img = ev.img || firstImage(ev.desc);
        navigate(`/post/nextgen-${ev.deptKey}-${ev.idx}`, {
            state: {
                background: location,
                title: ev.title,
                author: ev.deptName,
                date: when,
                content,
                imageUrl: img || null,
                imageUrls: ev.imageUrls?.length ? ev.imageUrls : (img ? [img] : []),
            },
        });
    };

    const info = (ev) => (
        <span className={styles.evInfo}>
            <span className={styles.evCat}>{ev.deptName}</span>
            <span className={styles.evTitle}>{ev.title}</span>
            <span className={styles.evMeta}>{[eventDate(ev), ev.time, ev.location].filter(Boolean).join(' · ')}</span>
        </span>
    );

    let body;
    if (events === null) body = <p className={styles.empty}>행사를 불러오고 있어요.</p>;
    else if (!events.length) body = <p className={styles.empty}>정해진 행사가 아직 없어요.</p>;
    else {
        const [first, ...rest] = events;
        body = (
            <>
                <button type="button" className={styles.evFeature} onClick={() => open(first)}>
                    <Poster src={first.img || firstImage(first.desc)} title={first.title} dept={first.deptName} />
                    <span className={styles.evFeatureText}>
                        <span className={styles.evNear}>가장 가까운 행사</span>
                        {info(first)}
                        <span className={styles.btn}>자세히 보기</span>
                    </span>
                </button>
                {rest.length > 0 && (
                    <ul className={styles.evGrid}>
                        {rest.map((ev) => (
                            <li key={`${ev.deptKey}-${ev.idx}`}>
                                <button type="button" className={styles.evCard} onClick={() => open(ev)}>
                                    <Poster src={ev.img || firstImage(ev.desc)} title={ev.title} dept={ev.deptName} />
                                    {info(ev)}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </>
        );
    }

    return (
        <section className={styles.news} aria-labelledby="dept-news">
            <div className={styles.wrap}>
                <h2 id="dept-news" className={styles.secTitle}>{dept.name} 행사예요.</h2>
                <div className={styles.newsBody}>{body}</div>
            </div>
        </section>
    );
};

// 주일 예배: 새가족 '이렇게 함께해요'와 같은 그림카드. 옆으로 넘기고 오른쪽 아래 이전·다음
const SundayRail = ({ dept, reduceMotion }) => {
    const railRef = useRef(null);
    const move = (dir) => {
        const rail = railRef.current;
        if (!rail) return;
        const card = rail.firstElementChild;
        const step = card ? card.getBoundingClientRect().width + 20 : 360;
        rail.scrollBy({ left: dir * step, behavior: reduceMotion ? 'auto' : 'smooth' });
    };
    return (
        <section className={styles.sunday} aria-labelledby="dept-sunday">
            <div className={styles.wrap}>
                <h2 id="dept-sunday" className={styles.secTitle}>{lines(dept.sundayTitle)}</h2>
            </div>
            <ol ref={railRef} className={styles.rail} tabIndex={0} aria-label="주일 예배 순서">
                {dept.sunday.map((s) => (
                    <li key={s.n} className={styles.step}>
                        <img className={styles.tile} src={s.img} width={720} height={900} alt="" loading="lazy" />
                        <p className={styles.cap}><strong>{s.n}.</strong> {s.d}</p>
                    </li>
                ))}
            </ol>
            <div className={`${styles.wrap} ${styles.navWrap}`}>
                <div className={styles.nav}>
                    <button type="button" className={styles.navBtn} onClick={() => move(-1)} aria-label="이전 카드">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                    <button type="button" className={styles.navBtn} onClick={() => move(1)} aria-label="다음 카드">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
                    </button>
                </div>
            </div>
        </section>
    );
};

// 일 년 프로그램: 교회 안내 '예배시간' 섹션과 같은 구조.
// 왼쪽 = 제목 + 설명 + 고르기 버튼(고른 것 뒤로 짙은 표시가 미끄러진다), 오른쪽 = 그림
const thumbSpring = { type: 'spring', bounce: 0, duration: 0.4 };

const Programs = ({ dept, reduceMotion }) => {
    const [cur, setCur] = useState(0);
    const item = dept.items[cur];
    const swap = reduceMotion
        ? { initial: false }
        : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, ease } };
    return (
        <section className={styles.prog} aria-labelledby="dept-prog">
            <div className={`${styles.wrap} ${styles.progGrid}`}>
                <div className={styles.progHead}>
                    <h2 id="dept-prog" className={`${styles.secTitle} ${styles.progTitle}`}>일 년 동안<br />이런 날도 있어요.</h2>
                    {/* 설명은 모두 같은 칸에 겹쳐 두어, 가장 긴 문장 높이만큼 자리를 잡는다. 버튼이 위아래로 밀리지 않는다 */}
                    <div className={styles.descs} aria-live="polite">
                        {dept.items.map((it, i) => (
                            <motion.p
                                key={it.n}
                                className={i === cur ? styles.descOn : undefined}
                                aria-hidden={i !== cur}
                                initial={false}
                                animate={reduceMotion ? undefined : (i === cur ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 })}
                                transition={{ duration: 0.4, ease }}
                            >
                                {it.d}
                                {it.link && <> <Link to={it.link.to} tabIndex={i === cur ? undefined : -1}>{it.link.text}</Link></>}
                            </motion.p>
                        ))}
                    </div>
                    <div className={styles.pillGroup} role="group" aria-label="프로그램 고르기">
                        {dept.items.map((it, i) => (
                            <button key={it.n} type="button" className={styles.pill} aria-pressed={i === cur} onClick={() => setCur(i)}>
                                {i === cur && (
                                    <motion.span
                                        layoutId={`progPill-${dept.key}`}
                                        className={styles.pillThumb}
                                        transition={reduceMotion ? { duration: 0 } : thumbSpring}
                                    />
                                )}
                                <span className={styles.pillText}>{it.n}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className={styles.stage} aria-hidden="true">
                    <motion.div key={item.n} className={styles.stageInner} {...swap}>
                        {item.img
                            ? <img src={item.img} width={1024} height={1024} alt="" />
                            : <span className={styles.stageName}>{item.n}</span>}
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

const NextGenDeptPage = () => {
    const { dept: key } = useParams();
    const reduceMotion = useReducedMotion();
    const dept = NEXTGEN_DEPTS[key];

    useEffect(() => { window.scrollTo(0, 0); }, [key]);

    if (!dept) return <Navigate to="/nextgen/intro" replace />;

    const reveal = reduceMotion ? {} : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.8, ease },
    };

    return (
        <div className={styles.page} style={{ '--dept-sky': dept.sky, '--dept-ink': dept.ink }}>
            {/* ① 첫 화면: 부서 한 줄 */}
            <section className={styles.top} aria-labelledby="dept-title">
                <motion.div key={key} className={`${styles.wrap} ${styles.head}`} {...reveal}>
                    <p className={styles.who}>{dept.name}</p>
                    <h1 id="dept-title" className={styles.title}>{dept.title}</h1>
                    <p className={styles.story}>{dept.story}</p>
                    <p className={styles.when}>{dept.when}</p>
                </motion.div>
            </section>

            {dept.sunday && <SundayRail dept={dept} reduceMotion={reduceMotion} />}
            {dept.items && <Programs key={key} dept={dept} reduceMotion={reduceMotion} />}
            {dept.pending && (
                <section className={styles.sunday} aria-labelledby="dept-pending">
                    <div className={styles.wrap}>
                        <h2 id="dept-pending" className={styles.secTitle}>{lines(dept.pending.title)}</h2>
                        <p className={styles.lead}>{dept.pending.desc}</p>
                    </div>
                </section>
            )}

            <DeptEvents dept={dept} />

            {/* ⑤ 사진: 나눔터 갤러리로 */}
            <section className={styles.gal} aria-labelledby="dept-gal">
                <div className={`${styles.wrap} ${styles.galGrid}`}>
                    <div>
                        <h2 id="dept-gal" className={styles.secTitle}>
                            {key === 'youngadults' ? '청년부의 모습,' : `${dept.name} 아이들의 모습,`}<br />사진으로 만나요.
                        </h2>
                        <p className={styles.lead}>예배와 행사에서 담은 사진을 모았어요.</p>
                        <Link className={styles.btn} to="/photos">사진 보기</Link>
                    </div>
                    <div className={styles.shots}>
                        <img src={shotFriends} alt="" loading="lazy" />
                        <img src={shotTteok} alt="" loading="lazy" />
                        <img src={shotWelcome} alt="" loading="lazy" />
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default NextGenDeptPage;

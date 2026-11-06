import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useMotionTemplate, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import Footer from '../components/Footer';
import ReedSway from '../components/ReedSway';
import { InquiryDialog } from './WelcomePage';
import styles from './NextGenIntroPage.module.css';

import heroImg from '../assets/nextgen/shintanjin-baptist-church-nextgen-intro-hero-baby-basket-river.webp';
import heroTitle from '../assets/nextgen/shintanjin-baptist-church-nextgen-intro-hero-title.webp';
import heroTitleMobile from '../assets/nextgen/shintanjin-baptist-church-nextgen-intro-hero-title-mobile.webp';
import story1 from '../assets/nextgen/shintanjin-baptist-church-nextgen-intro-story-mother-hiding-baby.webp';
import story2 from '../assets/nextgen/shintanjin-baptist-church-nextgen-intro-story-mother-letting-go-basket.webp';
import story3 from '../assets/nextgen/shintanjin-baptist-church-nextgen-intro-story-sister-watching-basket.webp';
import story4 from '../assets/nextgen/shintanjin-baptist-church-nextgen-intro-story-mother-embracing-baby.webp';
import story5 from '../assets/nextgen/shintanjin-baptist-church-nextgen-intro-story-mother-son-palace-gate.webp';
import story6 from '../assets/nextgen/shintanjin-baptist-church-nextgen-intro-story-boy-looking-over-river.webp';
import storyKing from '../assets/nextgen/shintanjin-baptist-church-nextgen-intro-story-king-giving-order-palace.webp';
import storyPrincess from '../assets/nextgen/shintanjin-baptist-church-nextgen-intro-story-pharaoh-daughter-opening-basket.webp';
import storySister from '../assets/nextgen/shintanjin-baptist-church-nextgen-intro-story-sister-speaking-to-pharaoh-daughter.webp';
import storyWilderness from '../assets/nextgen/shintanjin-baptist-church-nextgen-intro-story-moses-shepherd-wilderness.webp';
import mosesImg from '../assets/nextgen/shintanjin-baptist-church-nextgen-intro-moses-parting-the-sea.webp';
import meadowImg from '../assets/nextgen/shintanjin-baptist-church-nextgen-intro-child-cycling-meadow-from-above.webp';
import wayBible from '../assets/nextgen/shintanjin-baptist-church-nextgen-intro-open-bible.webp';
import wayChairs from '../assets/nextgen/shintanjin-baptist-church-nextgen-intro-chairs-side-by-side.webp';
import wayBasket from '../assets/nextgen/shintanjin-baptist-church-nextgen-intro-basket-on-water.webp';
import askMailbox from '../assets/newcomer/shintanjin-baptist-church-newcomer-inquiry-mailbox.webp';
import reeds1 from '../assets/nextgen/shintanjin-baptist-church-nextgen-intro-reeds-1.webp';
import reeds4 from '../assets/nextgen/shintanjin-baptist-church-nextgen-intro-reeds-4.webp';
import reeds5 from '../assets/nextgen/shintanjin-baptist-church-nextgen-intro-reeds-5.webp';
import reeds6 from '../assets/nextgen/shintanjin-baptist-church-nextgen-intro-reeds-6.webp';

// 공통 이징 (CLAUDE.md 구현 메모)
const ease = [0.16, 1, 0.3, 1];

// 앞쪽 갈대는 크고 흐리게, 뒤쪽 갈대는 작고 또렷하게. x는 화면 폭 기준 가운데 위치
const FRONT_REEDS = [
    { src: reeds5, x: -0.02, h: 0.98, hPhone: 0.5, amp: 9, speed: 0.85, phase: 0.4, gain: 0.55 },
    { src: reeds6, x: 1.0, h: 0.92, hPhone: 0.46, amp: 10, speed: 0.72, phase: 2.1, gain: 0.6 },
];
const BACK_REEDS = [
    { src: reeds1, x: 0.09, h: 0.62, hPhone: 0.3, amp: 6, speed: 1.05, phase: 1.3, gain: 0.34 },
    { src: reeds4, x: 0.88, h: 0.66, hPhone: 0.32, amp: 7, speed: 0.95, phase: 0.2, gain: 0.36 },
];

// 요게뱃 이야기. 글 자리(데스크톱)는 그림의 빈 곳에 맞췄다. color는 그 장면의 빛과 색에서 뽑은 글자색. focus는 휴대폰에서 주인공이 보이도록 자르는 위치
const STORY = [
    {
        img: storyKing, color: '#FFF1CF', side: 'left', ink: 'light', shadow: true, focus: '90%', w: 1472, h: 816,
        alt: '높은 기둥이 늘어선 왕궁에서 이집트 왕이 왕좌에 앉아 손가락으로 가리키며 명령하고, 신하들이 고개를 숙인 그림',
        lines: ['아주 먼 옛날, 이집트에 히브리 사람들이 점점 많아졌어요.', '이집트 왕은 전쟁이 나면 그들이 적의 편에 설까 봐 두려웠어요.', '그래서 남자 아기를 모두 나일 강에 던지라고 명령했어요.'],
    },
    {
        img: story1, color: '#FFEBC8', side: 'right', ink: 'light', focus: '20%', w: 2944, h: 1632,
        alt: '어두운 밤, 엄마가 아기를 품에 안고 등불 곁에 몸을 숨긴 그림',
        lines: ['요게뱃이라는 엄마에게 아기가 태어났어요.', '엄마는 석 달 동안 아기를 몰래 품에 숨겼어요.'],
    },
    {
        img: story2, color: '#3D3A16', side: 'left', ink: 'dark', focus: '72%', w: 2944, h: 1632,
        alt: '엄마가 강가에 무릎을 꿇고 잠든 아기가 담긴 갈대 바구니를 물 위에 놓는 그림',
        lines: ['더는 숨길 수 없던 날, 엄마는 갈대 상자를 만들었어요.', '할 수 있는 걸 다 하고, 나머지는 하나님께 맡겼어요.'],
    },
    {
        img: story3, color: '#FFF1CF', side: 'right', ink: 'light', focus: '41%', w: 1472, h: 816,
        alt: '누나가 강가 갈대 사이에 서서 멀리 물 위에 떠 있는 아기 바구니를 지켜보는 그림',
        lines: ['아기의 누나는 멀리 갈대 사이에 서서, 상자에서 눈을 떼지 않았어요.', '아기가 어떻게 되는지 끝까지 보려고요.'],
    },
    {
        img: storyPrincess, color: '#2F2C10', side: 'right', ink: 'dark', glow: true, nudge: '1.25rem', focus: '50%', w: 1472, h: 816,
        alt: '금 장신구를 한 이집트 공주가 강가에 무릎을 꿇고 바구니 속에서 우는 아기를 내려다보고, 뒤에 시녀 두 명이 서 있는 그림',
        lines: ['강에 내려온 이집트의 공주가 상자를 열었어요.', '아기가 울고 있었어요.', '공주는 아기를 불쌍히 여겼어요.'],
    },
    {
        img: storySister, color: '#FFF1CF', side: 'right', ink: 'light', shadow: true, nudge: '2.5rem', focus: '56%', w: 1472, h: 816,
        alt: '바구니를 안은 공주에게 어린 누나가 물가에서 달려와 말을 건네는 그림',
        lines: ['지켜보던 누나가 달려 나와 말했어요.', '“아기를 돌볼 사람을 불러올까요?”', '누나가 데려온 사람은, 바로 엄마였어요.'],
    },
    {
        img: story4, color: '#43320F', side: 'left', ink: 'dark', focus: '68%', w: 2944, h: 1632,
        alt: '왕궁의 밝은 방에서 엄마가 아기를 꼭 끌어안고 볼을 맞댄 그림',
        lines: ['엄마는 아기를 다시 품에 안았어요.'],
    },
    {
        img: story5, color: '#4A3413', side: 'right', ink: 'dark', focus: '18%', w: 2944, h: 1632,
        alt: '엄마와 어린 아들이 손을 잡고 커다란 왕궁 문으로 걸어가는 뒷모습 그림',
        lines: ['아이가 자라자, 엄마는 아이를 공주에게 데려갔어요.', '아이 이름은 모세가 됐어요. 물에서 건져 냈다는 뜻이에요.'],
    },
    {
        img: story6, color: '#4A2E16', side: 'left', ink: 'dark', focus: '82%', w: 2944, h: 1632,
        alt: '어린 모세가 왕궁 테라스에 서서 멀리 흐르는 강과 도시를 바라보는 뒷모습 그림',
        lines: ['엄마는 모세가 어떤 사람이 될지 알 수 없었어요.', '모세는 어떻게 되었을까요?'],
    },
    {
        img: storyWilderness, color: '#4A2E16', side: 'right', ink: 'dark', focus: '28%', w: 1472, h: 816,
        alt: '모세가 지팡이를 들고 광야의 골짜기에서 양 떼를 이끄는 그림',
        lines: ['모세는 왕궁을 떠나 사십 년을 광야에서 양을 치며 보냈어요.', '그 긴 세월도 하나님의 손 안에 있었어요.'],
    },
    {
        img: mosesImg, color: '#FFF6DF', side: 'left', ink: 'light', textEnd: '3rem', focus: '47%', w: 1376, h: 864,
        alt: '갈라진 바다 사이의 환한 빛 앞에서 모세가 두 팔을 벌리고 지팡이를 들어 올렸고, 사람들이 그 뒤에서 지켜보는 그림',
        lines: ['그리고 하나님의 부르심을 받아, 노예로 살던 백성을 이끌고 바다를 건넜어요.', '강가에 아기를 두던 날,\n엄마는 이 길을 볼 수 없었어요.', '하나님은 보고 계셨어요.'],
    },
    {
        img: meadowImg, color: '#FFFBEA', side: 'left', ink: 'light', shadow: true, focus: '68%', w: 2752, h: 1728,
        alt: '하늘에서 내려다본 넓은 들판과 굽은 길, 그 길을 자전거로 달리는 작은 아이',
        lines: ['그 하나님이 오늘도 우리를 지켜보고 계세요.', '천천히 가도, 잠시 멈춰도, 우리와 우리 아이의 길을 지켜보고 계세요.'],
        verse: '여호와께서 너의 출입을 지금부터 영원까지 지키시리로다',
        verseRef: '시편 121:8',
    },
];

const WAYS = [
    { img: wayBible, title: '말씀으로 길을 알려 줘요', text: '유치부부터 청년부까지, 나이에 맞는 말씀으로 함께 예배해요.', alt: '펼쳐진 책 그림' },
    { img: wayChairs, title: '이름을 부르며 곁에 있어요', text: '선생님은 아이 이름을 기억하고, 잘하는 날도 힘든 날도 옆에 있어요.', alt: '나란히 놓인 큰 의자와 작은 의자 그림' },
    { img: wayBasket, title: '기도로 하나님께 맡겨요', text: '부모님과 교회가 함께 아이를 위해 기도해요.', alt: '물 위에 떠 있는 담요 덮인 바구니 그림' },
];

// 사실은 교회 안내(/guide) '자주 묻는 것'과 같은 내용에서 가져왔다
const FAQS = [
    { q: '우리 아이는 어느 부서로 가면 되나요?', a: '미취학 아동은 유치부, 초등학생은 초등부, 중고등학생은 중고등부, 청년은 청년부예요. 오셔서 물어보셔도 되고, 아래로 문의를 남겨 주셔도 돼요.' },
    { q: '예배는 언제 드리나요?', a: '유치부·초등부·중고등부는 주일 오전 9시, 청년부는 주일 오후 1시 30분에 따로 예배드려요.' },
    { q: '교회에 다닌 적이 없어도 괜찮나요?', a: '네, 그대로 오시면 돼요. 성경책이 없어도 괜찮고, 이름이나 연락처를 적지 않아도 예배드릴 수 있어요.' },
    { q: '아이가 낯을 많이 가려요.', a: '처음엔 어른 예배에 아이와 함께 앉으셔도 괜찮아요. 예배실 뒤에 자모실도 있어요. 아이가 편해질 때 부서 예배에 가도 돼요.' },
];

// 요게뱃 이야기: 이전·다음으로 넘기는 동화책. 데스크톱은 한 장면이 펼친 두 쪽을 채우고, 휴대폰은 한 쪽으로 본다
const useWide = () => {
    const [wide, setWide] = useState(() => window.matchMedia('(min-width: 900px)').matches);
    useEffect(() => {
        const mq = window.matchMedia('(min-width: 900px)');
        const on = () => setWide(mq.matches);
        mq.addEventListener('change', on);
        return () => mq.removeEventListener('change', on);
    }, []);
    return wide;
};

const PageText = ({ page }) => (
    <div className={`${styles.sceneText} ${styles[`on-${page.side}`]} ${page.shadow ? styles.sceneShadow : ''} ${page.glow ? styles.sceneGlow : ''}`} style={{ color: page.color, '--text-nudge': page.nudge, '--text-end': page.textEnd }}>
        <p>{page.lines.map((line) => <span key={line}>{line} </span>)}</p>
        {page.verse && (
            <blockquote className={styles.pageVerse}>
                {page.verse}
                <cite>{page.verseRef}</cite>
            </blockquote>
        )}
    </div>
);

// part: L·R은 펼친 책의 왼쪽·오른쪽 절반, full은 휴대폰의 한 쪽
const Face = ({ index, part }) => {
    const page = STORY[index];
    const hasText = part === 'full' || (page.side === 'right' && part === 'R') || (page.side === 'left' && part === 'L');
    const cls = part === 'full' ? styles.pageImgFull : part === 'L' ? styles.pageImgL : styles.pageImgR;
    return (
        <>
            <img className={cls} src={page.img} width={page.w} height={page.h} alt={part === 'R' ? '' : page.alt} style={{ '--focus': page.focus }} />
            {hasText && <PageText page={page} />}
        </>
    );
};

const StoryBook = ({ reduceMotion }) => {
    const wide = useWide();
    const [cur, setCur] = useState(0);
    const [turn, setTurn] = useState(null); // { from, to }
    const leafRef = useRef(null);
    const shown = turn ? turn.to : cur;
    const lastPage = shown === STORY.length - 1;

    const go = (to) => {
        if (to < 0 || to >= STORY.length || to === shown) return;
        // 넘기는 중에 또 눌러도 바로 다음 장으로 이어진다
        setCur(shown);
        if (reduceMotion) {
            setTurn(null);
            setCur(to);
        } else {
            setTurn({ from: shown, to });
        }
    };

    useLayoutEffect(() => {
        if (!turn || !leafRef.current) return undefined;
        const frames = [{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(-180deg)' }];
        const anim = leafRef.current.animate(turn.to > turn.from ? frames : [...frames].reverse(), {
            duration: 700,
            easing: 'cubic-bezier(0.77, 0, 0.175, 1)',
            fill: 'both',
        });
        anim.onfinish = () => {
            setCur(turn.to);
            setTurn(null);
        };
        return () => anim.cancel();
    }, [turn]);

    // 다음 장 그림을 미리 받아 둔다
    useEffect(() => {
        [shown - 1, shown + 1].forEach((i) => {
            if (STORY[i]) new Image().src = STORY[i].img;
        });
    }, [shown]);

    const touch = useRef(null);
    const onTouchStart = (e) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
    const onTouchEnd = (e) => {
        if (!touch.current) return;
        const dx = e.changedTouches[0].clientX - touch.current.x;
        const dy = e.changedTouches[0].clientY - touch.current.y;
        if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
        go(shown + (dx < 0 ? 1 : -1));
    };

    const forward = turn && turn.to > turn.from;
    const low = turn ? Math.min(turn.from, turn.to) : cur;
    const high = turn ? Math.max(turn.from, turn.to) : cur;
    const left = turn ? low : cur;
    const right = turn ? high : cur;
    const under = turn ? (forward ? turn.to : turn.from) : cur;

    return (
        <section className={styles.bookSec} aria-labelledby="story-title">
            <div className={styles.bookHead}>
                <h2 id="story-title" className={styles.storyTitle}>오래된 이야기를<br />하나 들려드릴게요.</h2>
                <div className={styles.nav} aria-label="책장 넘기기">
                    <button type="button" className={styles.navBtn} disabled={shown === 0} onClick={() => go(shown - 1)} aria-label="이전 쪽">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                    <button type="button" className={styles.navBtn} disabled={lastPage} onClick={() => go(shown + 1)} aria-label="다음 쪽">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
                    </button>
                </div>
            </div>
            <div className={styles.book} role="group" aria-label="요게뱃 이야기" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
                {wide ? (
                    <>
                        <div className={`${styles.slot} ${styles.slotL}`}><Face key={`L${left}`} index={left} part="L" /></div>
                        <div className={`${styles.slot} ${styles.slotR}`}><Face key={`R${right}`} index={right} part="R" /></div>
                    </>
                ) : (
                    <div className={`${styles.slot} ${styles.slotOne} ${STORY[under].ink === 'light' ? styles.sceneNight : ''}`}><Face key={under} index={under} part="full" /></div>
                )}
                {turn && (
                    <div ref={leafRef} className={styles.leaf} aria-hidden="true">
                        <div className={`${styles.face} ${styles.faceFront} ${STORY[low].ink === 'light' ? styles.sceneNight : ''}`}>
                            <Face index={low} part={wide ? 'R' : 'full'} />
                        </div>
                        <div className={`${styles.face} ${styles.faceBack}`}>
                            {wide && <Face index={high} part="L" />}
                        </div>
                    </div>
                )}
            </div>
            <p className={styles.srOnly} aria-live="polite">{shown + 1}쪽. {STORY[shown].lines.join(' ')}</p>
        </section>
    );
};

const WaysRail = () => {
    return (
        <section className={styles.sec} aria-labelledby="intro-title">
            <div className={`${styles.wrap} ${styles.railHead}`}>
                <h2 id="intro-title" className={styles.secTitle}>우리도 아이의 앞날은 몰라요.<br />그래서 곁에서 함께 기다려요.</h2>
            </div>
            <ol className={styles.rail} tabIndex={0} aria-label="다음세대가 아이와 함께하는 방법">
                {WAYS.map((way) => (
                    <li key={way.title} className={styles.step}>
                        <div className={styles.tile}>
                            <img className={styles.tileImg} src={way.img} width={1232} height={928} alt={way.alt} loading="lazy" />
                        </div>
                        <p className={styles.cap}><strong>{way.title}.</strong> {way.text}</p>
                    </li>
                ))}
            </ol>
        </section>
    );
};

const NextGenIntroPage = () => {
    const reduceMotion = useReducedMotion();

    // 첫 화면 제목: 새가족 페이지와 같은 값. 화면을 벗어나는 동안 120px 위로 떠오르고, 0.15~0.42 구간에서 흐려지며 사라진다
    const heroRef = useRef(null);
    const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
    const titleY = useTransform(heroProgress, [0, 1], [0, -120]);
    const titleOpacity = useTransform(heroProgress, [0, 0.15, 0.42], [1, 1, 0]);
    const titleBlurPx = useTransform(heroProgress, [0, 0.15, 0.42], [0, 0, 16]);
    const titleFilter = useMotionTemplate`blur(${titleBlurPx}px)`;
    const [asking, setAsking] = useState(false);
    const askButtonRef = useRef(null);
    const closeAsk = useCallback(() => {
        setAsking(false);
        askButtonRef.current?.focus();
    }, []);

    useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <div className={styles.page}>
            {/* ① 첫 화면: 부모의 질문으로 시작한다 */}
            <section ref={heroRef} className={styles.hero}>
                <img className={styles.heroImg} src={heroImg} width={2752} height={1728} fetchPriority="high" alt="강 위에 떠 있는 바구니 안에서 잠든 아기와 멀리 굽이쳐 가는 강" />
                <ReedSway className={`${styles.reeds} ${styles.reedsBack}`} reeds={BACK_REEDS} reduceMotion={reduceMotion} />
                <h1 className={styles.heroTitle}>
                    {/* 새가족 페이지 제목과 같은 연출: 스크롤하면 위로 떠오르며(패럴랙스) 흐려져 사라지고, 다시 올라오면 돌아온다 */}
                    <motion.div style={reduceMotion ? undefined : { y: titleY, opacity: titleOpacity, filter: titleFilter, willChange: 'transform, filter, opacity' }}>
                        {/* 페이지가 열리면 흐림에서 또렷하게 나타난다. 그림자(drop-shadow)는 img에 있어 겹치지 않게 감싼 층에서 움직인다 */}
                        <motion.div
                            initial={reduceMotion ? false : { opacity: 0, filter: 'blur(16px)', scale: 0.96 }}
                            animate={reduceMotion ? {} : { opacity: 1, filter: 'blur(0px)', scale: 1 }}
                            transition={{ duration: 2.0, ease, delay: 0.1 }}
                        >
                            <picture>{/* 휴대폰은 세 줄로 따로 만든 이미지 */}<source media="(max-width: 767px)" srcSet={heroTitleMobile} width={922} height={558} /><img className={styles.heroTitleImg} src={heroTitle} width={908} height={564} fetchPriority="high" alt="우리 아이는 어떤 길을 걷게 될까요?" /></picture>
                        </motion.div>
                    </motion.div>
                </h1>
                <ReedSway className={`${styles.reeds} ${styles.reedsFront}`} reeds={FRONT_REEDS} reduceMotion={reduceMotion} />
            </section>

            <StoryBook reduceMotion={reduceMotion} />

            {/* ② 소개: 새가족 페이지 '이렇게 함께해요'와 같은 그림카드 */}
            <WaysRail />

            {/* ③ 처음 오시는 부모님께: 교회 안내와 같은 모양 */}
            <section className={styles.sec} aria-labelledby="faq-title">
                <div className={styles.wrap}>
                    <h2 id="faq-title" className={styles.secTitle}>처음 오시는 부모님들이<br />자주 묻는 것들이에요.</h2>
                    <div className={styles.fqList}>
                        {FAQS.map((item) => (
                            <details key={item.q} className={styles.fqItem}>
                                <summary>
                                    {item.q}
                                    <svg className={styles.fqIcon} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M6 9l6 6 6-6" />
                                    </svg>
                                </summary>
                                <p>{item.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* ④ 문의: 새가족 페이지와 같은 모양 */}
            <section className={`${styles.sec} ${styles.askSec}`} aria-labelledby="ask-title">
                <div className={`${styles.wrap} ${styles.cta}`}>
                    <div>
                        <h2 id="ask-title" className={styles.secTitle}>아이를 보내기 전에,<br />더 궁금한 점이 있으세요?</h2>
                        <p className={styles.lead}>어떤 것이든 편하게 남겨 주세요. 확인하고 연락드릴게요.</p>
                        <div className={styles.askBtns}>
                            <button ref={askButtonRef} type="button" className={styles.btn} aria-haspopup="dialog" onClick={() => setAsking(true)}>문의 남기기</button>
                            <a className={`${styles.btn} ${styles.btnSoft}`} href="tel:0429328156">전화하기</a>
                        </div>
                    </div>
                    <img className={styles.ctaImg} src={askMailbox} width={1200} height={800} loading="lazy" alt="" />
                </div>
            </section>

            <Footer />

            {asking && (
                <InquiryDialog
                    onClose={closeAsk}
                    topic="nextgen"
                    title="다음세대 문의"
                    desc="남겨 주시면 확인하고 연락드릴게요."
                    doneDesc="확인하고 곧 연락드릴게요."
                />
            )}
        </div>
    );
};

export default NextGenIntroPage;

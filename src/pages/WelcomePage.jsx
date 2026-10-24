import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import Footer from '../components/Footer';
import PageTopGradient from '../components/PageTopGradient';
import { INQUIRY_LIMITS, sendNewcomerInquiry } from '../lib/newcomerInquiry';
import styles from './WelcomePage.module.css';

// 첫 화면 봉투 조각 ('영상, 이미지 기획' 세션 데모, docs/handoff/newcomer-envelope-hero.md)
import envInside from '../assets/newcomer/shintanjin-baptist-church-newcomer-envelope-inside.webp';
import envFlapOpen from '../assets/newcomer/shintanjin-baptist-church-newcomer-envelope-flap-open.webp';
import envLetter from '../assets/newcomer/shintanjin-baptist-church-newcomer-envelope-letter.webp';
import envPocket from '../assets/newcomer/shintanjin-baptist-church-newcomer-envelope-pocket.webp';
import envFlapClosed from '../assets/newcomer/shintanjin-baptist-church-newcomer-envelope-flap-closed.webp';
import envHeart from '../assets/newcomer/shintanjin-baptist-church-newcomer-envelope-heart.webp';
import golgothaCross from '../assets/newcomer/shintanjin-baptist-church-newcomer-golgotha-cross.webp';
import step01 from '../assets/nurture/shintanjin-baptist-church-newcomer-step-01-open-door.webp';
import step02 from '../assets/nurture/shintanjin-baptist-church-newcomer-step-02-bible-sprout.webp';
import step03 from '../assets/nurture/shintanjin-baptist-church-newcomer-step-03-neighbor-houses.webp';
import step04 from '../assets/nurture/shintanjin-baptist-church-newcomer-step-04-two-cups.webp';
import step05 from '../assets/nurture/shintanjin-baptist-church-newcomer-step-05-hands.webp';
import askMailbox from '../assets/newcomer/shintanjin-baptist-church-newcomer-inquiry-mailbox.webp';

const ease = [0.16, 1, 0.3, 1];

// ③ 새가족이 되는 과정: 애플 환경 페이지 #recover-gallery 방식 (카드 위 짧은 한마디 + 카드 아래 '굵은 제목.' 설명)
const STEPS = [
    { img: step01, callout: '반갑게\n맞이해요.', title: '새가족 등록', desc: '등록 카드를 작성하시면 앞으로의 신앙생활과 소속될 기관을 안내해 드려요.' },
    { img: step02, callout: '8주 동안\n곁에 있어요.', title: '새가족 교육 (8주)', desc: '새가족팀이 주일 예배와 교육 참석 등 교회 생활을 친절하게 안내해 드려요.' },
    { img: step03, callout: '가까운 이웃과\n이어져요.', title: '수료 및 기관 편성', desc: '연령과 지역에 맞춰 교구와 구역, 남·여 전도회에 편성돼요.' },
    { img: step04, callout: '말씀을 나누며\n자라요.', title: '구역 및 전도회 예배', desc: '소속된 구역과 전도회 모임에서 말씀을 나누고 교제해요.' },
    { img: step05, callout: '이제 한\n가족이에요.', title: '새가족 환영회', desc: '수료식과 함께 우리 교회의 가족으로 따뜻하게 환영해요.' },
];

const EMPTY_FORM = { name: '', contact: '', question: '', agree: false, website: '' };

// 열리는 편지 봉투. 마우스는 올리면 열리고(CSS), 누르면 열린 채로 토글.
// 휴대폰(hover 없음)은 화면에 60% 이상 보이면 0.6초 뒤 한 번 저절로 연다 (먼저 눌렀으면 그대로 둠)
const Envelope = () => {
    const ref = useRef(null);
    const touched = useRef(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!window.matchMedia('(hover: none)').matches || !ref.current) return undefined;
        let timer;
        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;
            observer.disconnect();
            timer = setTimeout(() => { if (!touched.current) setOpen(true); }, 600);
        }, { threshold: 0.6 });
        observer.observe(ref.current);
        return () => { observer.disconnect(); clearTimeout(timer); };
    }, []);

    return (
        <button
            ref={ref}
            type="button"
            className={`${styles.env} ${open ? styles.envOpen : ''}`}
            aria-pressed={open}
            aria-label={open ? '편지 봉투 닫기' : '편지 봉투 열기'}
            onClick={() => { touched.current = true; setOpen((v) => !v); }}
        >
            <img className={styles.envInside} src={envInside} alt="" />
            <img className={styles.envFlapOpen} src={envFlapOpen} alt="" />
            <span className={styles.envClip}><img className={styles.envLetter} src={envLetter} alt="" /></span>
            <img className={styles.envPocket} src={envPocket} alt="" />
            <img className={styles.envFlapClosed} src={envFlapClosed} alt="" />
            <img className={styles.envHeart} src={envHeart} alt="" />
        </button>
    );
};

// 부드럽게 따라오는 스프링 캐럿 입력칸 (디자인은 그대로 두고 캐럿 이동만 스프링 물리 적용)
const CARET_SPRING = { stiffness: 500, damping: 30, mass: 0.5 };
const CARET_REDUCED = { stiffness: 10000, damping: 100, mass: 0.1 };

const SmoothInput = React.forwardRef(({ value = '', onChange, onFocus, onBlur, ...props }, forwardedRef) => {
    const caretX = useMotionValue(0);
    const caretOpacity = useMotionValue(0);
    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const measureRef = useRef(null);
    const reduceMotion = useReducedMotion();

    const springCaretX = useSpring(caretX, reduceMotion ? CARET_REDUCED : CARET_SPRING);

    const setRefs = useCallback((node) => {
        inputRef.current = node;
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
    }, [forwardedRef]);

    const updateCaretFromInput = useCallback((target) => {
        const measureSpan = measureRef.current;
        if (!target || !measureSpan) return;

        const styles = window.getComputedStyle(target);
        measureSpan.style.font = `${styles.fontStyle} ${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`;
        measureSpan.style.letterSpacing = styles.letterSpacing;
        measureSpan.style.fontFeatureSettings = styles.fontFeatureSettings;
        measureSpan.style.fontVariationSettings = styles.fontVariationSettings;

        const selectionStart = target.selectionStart ?? 0;
        const selectionEnd = target.selectionEnd ?? 0;
        const hasSelection = selectionStart !== selectionEnd;
        const caretIndex = selectionStart === selectionEnd
            ? selectionStart
            : (target.selectionDirection === 'backward' ? selectionStart : selectionEnd);

        const textBeforeCaret = (target.value || '').slice(0, caretIndex);
        measureSpan.textContent = textBeforeCaret;

        const paddingLeft = parseFloat(styles.paddingLeft) || 0;
        const paddingRight = parseFloat(styles.paddingRight) || 0;
        const absoluteWidth = textBeforeCaret.length > 0
            ? measureSpan.offsetWidth + paddingLeft
            : paddingLeft;

        const maxScroll = Math.max(0, target.scrollWidth - target.clientWidth);
        const visibleRight = target.scrollLeft + target.clientWidth - paddingRight;
        const visibleLeft = target.scrollLeft + paddingLeft;

        if (absoluteWidth > visibleRight) {
            target.scrollLeft = Math.min(absoluteWidth - target.clientWidth + paddingRight, maxScroll);
        } else if (absoluteWidth < visibleLeft) {
            target.scrollLeft = Math.max(0, absoluteWidth - paddingLeft);
        }

        const caretPosition = absoluteWidth - target.scrollLeft;
        const minX = paddingLeft - 1;
        const maxX = target.clientWidth - paddingRight;
        const isCaretVisible = caretPosition >= minX && caretPosition <= maxX + 1;

        caretX.set(Math.min(caretPosition, maxX));
        caretOpacity.set(!isCaretVisible || hasSelection ? 0 : 1);
    }, [caretX, caretOpacity]);

    const updateCaretRef = useRef(updateCaretFromInput);
    updateCaretRef.current = updateCaretFromInput;

    useEffect(() => {
        const input = inputRef.current;
        if (input && document.activeElement === input) {
            updateCaretRef.current(input);
        }
    }, [value]);

    useEffect(() => {
        const input = inputRef.current;
        const container = containerRef.current;
        if (!input || !container) return undefined;

        const updateCaretIfFocused = () => {
            if (document.activeElement === input) {
                updateCaretRef.current(input);
            }
        };

        const handleSelectionChange = () => {
            if (document.activeElement !== input) return;
            requestAnimationFrame(() => {
                if (document.activeElement === input) {
                    updateCaretRef.current(input);
                }
            });
        };

        document.addEventListener('selectionchange', handleSelectionChange);
        document.fonts?.addEventListener?.('loadingdone', updateCaretIfFocused);
        document.fonts?.ready?.then(updateCaretIfFocused);
        input.addEventListener('scroll', updateCaretIfFocused);

        const resizeObserver = new ResizeObserver(updateCaretIfFocused);
        resizeObserver.observe(container);

        updateCaretIfFocused();

        return () => {
            document.removeEventListener('selectionchange', handleSelectionChange);
            document.fonts?.removeEventListener?.('loadingdone', updateCaretIfFocused);
            input.removeEventListener('scroll', updateCaretIfFocused);
            resizeObserver.disconnect();
        };
    }, []);

    return (
        <div ref={containerRef} className={styles.smoothWrap}>
            <input
                {...props}
                ref={setRefs}
                className={styles.smoothInput}
                value={value}
                onChange={(e) => {
                    onChange?.(e);
                    requestAnimationFrame(() => {
                        updateCaretRef.current(e.target);
                    });
                }}
                onFocus={(e) => {
                    requestAnimationFrame(() => {
                        updateCaretRef.current(e.target);
                    });
                    onFocus?.(e);
                }}
                onBlur={(e) => {
                    caretOpacity.set(0);
                    onBlur?.(e);
                }}
            />
            <span ref={measureRef} aria-hidden="true" className={styles.smoothMeasure} />
            <motion.span
                aria-hidden="true"
                className={styles.smoothCaret}
                style={{ x: springCaretX, opacity: caretOpacity }}
            />
        </div>
    );
});

// 여러 줄 입력칸(textarea)용 스프링 캐럿: 미러 요소로 줄바꿈 포함 가로(x)·세로(y) 좌표를 구해 부드럽게 이동
const SmoothTextarea = ({ value = '', onChange, onFocus, onBlur, ...props }) => {
    const caretX = useMotionValue(0);
    const caretY = useMotionValue(0);
    const caretOpacity = useMotionValue(0);
    const containerRef = useRef(null);
    const textareaRef = useRef(null);
    const mirrorRef = useRef(null);
    const textNodeRef = useRef(null);
    const markerRef = useRef(null);
    const reduceMotion = useReducedMotion();

    const springCfg = reduceMotion ? CARET_REDUCED : CARET_SPRING;
    const springCaretX = useSpring(caretX, springCfg);
    const springCaretY = useSpring(caretY, springCfg);

    const updateCaretFromTextarea = useCallback((target) => {
        const mirror = mirrorRef.current;
        const textNode = textNodeRef.current;
        const marker = markerRef.current;
        if (!target || !mirror || !textNode || !marker) return;

        const styles = window.getComputedStyle(target);
        mirror.style.width = `${target.clientWidth}px`;
        mirror.style.padding = styles.padding;
        mirror.style.font = `${styles.fontStyle} ${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`;
        mirror.style.lineHeight = styles.lineHeight;
        mirror.style.letterSpacing = styles.letterSpacing;
        mirror.style.fontFeatureSettings = styles.fontFeatureSettings;
        mirror.style.fontVariationSettings = styles.fontVariationSettings;

        const selectionStart = target.selectionStart ?? 0;
        const selectionEnd = target.selectionEnd ?? 0;
        const hasSelection = selectionStart !== selectionEnd;
        const caretIndex = selectionStart === selectionEnd
            ? selectionStart
            : (target.selectionDirection === 'backward' ? selectionStart : selectionEnd);

        textNode.textContent = (target.value || '').slice(0, caretIndex);

        const paddingTop = parseFloat(styles.paddingTop) || 0;
        const paddingBottom = parseFloat(styles.paddingBottom) || 0;
        const lineHeight = parseFloat(styles.lineHeight) || (parseFloat(styles.fontSize) * 1.6) || 25.6;
        const caretHeight = (parseFloat(styles.fontSize) || 16) * 1.15;

        const x = marker.offsetLeft - target.scrollLeft;
        const y = marker.offsetTop - target.scrollTop + (lineHeight - caretHeight) / 2;

        const minY = paddingTop - 4;
        const maxY = target.clientHeight - paddingBottom - caretHeight + 4;
        const isCaretVisible = y >= minY && y <= maxY;

        caretX.set(x);
        caretY.set(y);
        caretOpacity.set(!isCaretVisible || hasSelection ? 0 : 1);
    }, [caretX, caretY, caretOpacity]);

    const updateCaretRef = useRef(updateCaretFromTextarea);
    updateCaretRef.current = updateCaretFromTextarea;

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea && document.activeElement === textarea) {
            updateCaretRef.current(textarea);
        }
    }, [value]);

    useEffect(() => {
        const textarea = textareaRef.current;
        const container = containerRef.current;
        if (!textarea || !container) return undefined;

        const updateCaretIfFocused = () => {
            if (document.activeElement === textarea) {
                updateCaretRef.current(textarea);
            }
        };

        const handleSelectionChange = () => {
            if (document.activeElement !== textarea) return;
            requestAnimationFrame(() => {
                if (document.activeElement === textarea) {
                    updateCaretRef.current(textarea);
                }
            });
        };

        document.addEventListener('selectionchange', handleSelectionChange);
        document.fonts?.addEventListener?.('loadingdone', updateCaretIfFocused);
        document.fonts?.ready?.then(updateCaretIfFocused);
        textarea.addEventListener('scroll', updateCaretIfFocused);

        const resizeObserver = new ResizeObserver(updateCaretIfFocused);
        resizeObserver.observe(textarea);

        updateCaretIfFocused();

        return () => {
            document.removeEventListener('selectionchange', handleSelectionChange);
            document.fonts?.removeEventListener?.('loadingdone', updateCaretIfFocused);
            textarea.removeEventListener('scroll', updateCaretIfFocused);
            resizeObserver.disconnect();
        };
    }, []);

    return (
        <div ref={containerRef} className={styles.smoothTextareaWrap}>
            <textarea
                {...props}
                ref={textareaRef}
                className={styles.smoothTextarea}
                value={value}
                onChange={(e) => {
                    onChange?.(e);
                    requestAnimationFrame(() => {
                        updateCaretRef.current(e.target);
                    });
                }}
                onFocus={(e) => {
                    requestAnimationFrame(() => {
                        updateCaretRef.current(e.target);
                    });
                    onFocus?.(e);
                }}
                onBlur={(e) => {
                    caretOpacity.set(0);
                    onBlur?.(e);
                }}
            />
            <div ref={mirrorRef} aria-hidden="true" className={styles.smoothTextareaMirror}>
                <span ref={textNodeRef} />
                <span ref={markerRef}>&#8203;</span>
            </div>
            <motion.span
                aria-hidden="true"
                className={styles.smoothTextareaCaret}
                style={{ x: springCaretX, y: springCaretY, opacity: caretOpacity }}
            />
        </div>
    );
};

// ④ 문의 팝업: 이름·받을 연락처·궁금한 점 → 새가족팀 메일 (functions/api/newcomer-inquiry.js)
const InquiryDialog = ({ onClose }) => {
    const [form, setForm] = useState(EMPTY_FORM);
    const [status, setStatus] = useState('idle'); // idle | sending | sent
    const [error, setError] = useState('');
    const nameRef = useRef(null);
    const doneRef = useRef(null);

    useEffect(() => {
        window.lenis?.stop();
        document.body.style.overflow = 'hidden';
        nameRef.current?.focus();
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => {
            window.lenis?.start();
            document.body.style.overflow = '';
            window.removeEventListener('keydown', onKey);
        };
    }, [onClose]);

    useEffect(() => { if (status === 'sent') doneRef.current?.focus(); }, [status]);

    const change = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        if (!e.currentTarget.reportValidity()) return;
        setStatus('sending');
        setError('');
        try {
            await sendNewcomerInquiry(form);
            setStatus('sent');
        } catch (err) {
            setError(err.message);
            setStatus('idle');
        }
    };

    return createPortal(
        <div className={styles.dim} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} data-lenis-prevent>
            <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="inquiry-title">
                <button type="button" className={styles.dialogClose} onClick={onClose} aria-label="닫기">
                    <span className={styles.dialogCloseIcon}>
                        <svg viewBox="0 0 36 36" aria-hidden="true"><path d="M13 13l10 10M23 13L13 23" /></svg>
                    </span>
                </button>

                {status === 'sent' ? (
                    <div className={styles.done} aria-live="polite">
                        <h2 id="inquiry-title" className={styles.dialogTitle}>문의를 잘 받았어요.</h2>
                        <p className={styles.dialogDesc}>새가족팀이 곧 연락드릴게요.</p>
                        <button ref={doneRef} type="button" className={styles.btn} onClick={onClose}>닫기</button>
                    </div>
                ) : (
                    <>
                        <h2 id="inquiry-title" className={styles.dialogTitle}>새가족 등록 문의</h2>
                        <p className={styles.dialogDesc}>남겨 주시면 새가족팀이 연락드릴게요.</p>
                        <form onSubmit={submit} noValidate>
                            <div className={styles.field}>
                                <label htmlFor="inquiry-name">이름</label>
                                <SmoothInput ref={nameRef} id="inquiry-name" type="text" autoComplete="name" maxLength={INQUIRY_LIMITS.name} required value={form.name} onChange={change('name')} />
                            </div>
                            <div className={styles.field}>
                                <label htmlFor="inquiry-contact">받을 연락처 <small>전화번호나 이메일</small></label>
                                <SmoothInput id="inquiry-contact" type="text" autoComplete="tel" maxLength={INQUIRY_LIMITS.contact} required value={form.contact} onChange={change('contact')} />
                            </div>
                            <div className={styles.field}>
                                <label htmlFor="inquiry-question">궁금한 점 <small>비워 두셔도 돼요</small></label>
                                <SmoothTextarea id="inquiry-question" maxLength={INQUIRY_LIMITS.question} aria-describedby="inquiry-count" value={form.question} onChange={change('question')} />
                                <span id="inquiry-count" className={styles.count}>{form.question.length} / {INQUIRY_LIMITS.question}자</span>
                            </div>
                            {/* 사람에게는 보이지 않는 칸: 채워져 오면 자동 등록 프로그램으로 본다 */}
                            <div className={styles.hp} aria-hidden="true">
                                <label>홈페이지<input tabIndex={-1} autoComplete="off" value={form.website} onChange={change('website')} /></label>
                            </div>
                            <div className={styles.agree}>
                                이름과 연락처는 답변을 드리는 데에만 쓰고, 답변 후 지워요.
                                <label><input type="checkbox" required checked={form.agree} onChange={change('agree')} /> 위 내용에 동의해요</label>
                            </div>
                            {error && <p className={styles.error} role="alert">{error}</p>}
                            <button type="submit" className={styles.btn} disabled={status === 'sending'}>
                                {status === 'sending' ? '보내는 중…' : '보내기'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>,
        document.body
    );
};

const WelcomePage = () => {
    const reduceMotion = useReducedMotion();
    const railRef = useRef(null);
    const [asking, setAsking] = useState(false);
    const askButtonRef = useRef(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const reveal = reduceMotion
        ? {}
        : {
            initial: { opacity: 0, y: 16 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true, margin: '0px 0px -10% 0px' },
            transition: { duration: 0.8, ease },
        };

    const scrollRail = (direction) => {
        const rail = railRef.current;
        if (!rail) return;
        const card = rail.querySelector(`.${styles.step}`);
        const step = card ? card.getBoundingClientRect().width + 20 : 400;
        rail.scrollBy({ left: direction * step, behavior: reduceMotion ? 'auto' : 'smooth' });
    };

    // 팝업 안 effect가 다시 돌지 않게 같은 함수를 유지
    const closeAsk = useCallback(() => {
        setAsking(false);
        askButtonRef.current?.focus();
    }, []);

    return (
        <div className={styles.page}>
            <PageTopGradient />

            {/* ① 첫 화면: 열리는 편지 봉투 + 복음의 초대가 담긴 환영 제목 */}
            <section className={styles.hero}>
                <div className={styles.wrap}>
                    <motion.div className={styles.envWrap} {...reveal}>
                        <Envelope />
                    </motion.div>
                    <motion.h1 className={styles.heroTitle} {...reveal}>
                        당신을 향한 기쁜 소식,<br />이곳에 준비되어 있어요.
                    </motion.h1>
                    <motion.p className={styles.heroLead} {...reveal}>
                        신탄진침례교회에 오신 여러분을 진심으로 환영해요.
                    </motion.p>
                </div>
            </section>

            {/* ② 복음 소개: 100vw 골고다 언덕 십자가 배경 위 예수님의 구속사역 문단 */}
            <section className={styles.golgothaSec} aria-label="복음 소개">
                <img className={styles.golgothaBg} src={golgothaCross} alt="" loading="lazy" />
                <div className={`${styles.wrap} ${styles.golgothaContent}`}>
                    <motion.p className={styles.golgothaStatement} {...reveal}>
                        교회는 완벽한 사람들이 모이는 곳이 아니라,<br />우리를 구원하신 하나님의 사랑을 함께 알아가는 곳이에요.{' '}
                        <span>예수님이 우리 대신 십자가를 지시고 다시 살아나셔서, 누구에게나 죄 사함과 새로운 생명의 길을 열어 주셨어요. 이 기쁜 소식을 복음이라고 불러요.</span>
                    </motion.p>
                </div>
            </section>

            {/* ③ 마음 문장: 회색 띠 위 안심 문단 */}
            <section className={`${styles.sec} ${styles.band}`}>
                <div className={styles.wrap}>
                    <motion.p className={styles.statement} {...reveal}>
                        처음이라 아직 낯설고 어렵게 느껴지셔도 괜찮아요.{' '}
                        <span>교회 등록도 부담 갖지 않으셔도 돼요. 이곳에서 예배드리며 이 기쁜 소식을 천천히 들어 보시고, 마음이 편해지실 때 함께해요.</span>
                    </motion.p>
                </div>
            </section>

            {/* ④ 새가족이 되는 과정: 옆으로 넘기는 카드 5장, 오른쪽 아래 이전·다음 (메인 '교회가 하는 일'과 같은 자리) */}
            <section className={styles.sec} aria-labelledby="steps-title">
                <div className={`${styles.wrap} ${styles.railHead}`}>
                    <h2 id="steps-title" className={styles.secTitle}>마음이 정해지셨을 때,<br />이렇게 함께해요.</h2>
                </div>
                <ol ref={railRef} className={styles.rail} tabIndex={0} aria-label="새가족이 되는 과정">
                    {STEPS.map((step) => (
                        <li key={step.title} className={styles.step}>
                            <div className={styles.tile}>
                                <img className={styles.tileImg} src={step.img} alt="" loading="lazy" />
                            </div>
                            <p className={styles.cap}><strong>{step.title}.</strong> {step.desc}</p>
                        </li>
                    ))}
                </ol>
                <div className={`${styles.wrap} ${styles.navWrap}`}>
                    <div className={styles.nav} aria-label="카드 이동">
                        <button type="button" className={styles.navBtn} onClick={() => scrollRail(-1)} aria-label="이전">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
                        </button>
                        <button type="button" className={styles.navBtn} onClick={() => scrollRail(1)} aria-label="다음">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
                        </button>
                    </div>
                </div>
            </section>

            {/* ④ 문의: 왼쪽 글 · 오른쪽 우체통 일러스트, 버튼을 누르면 문의 팝업 */}
            <section className={`${styles.sec} ${styles.askSec}`} aria-labelledby="ask-title">
                <div className={`${styles.wrap} ${styles.cta}`}>
                    <div>
                        <h2 id="ask-title" className={styles.secTitle}>기쁜 잔치에 초대해요.<br />더 궁금한 점이 있으세요?</h2>
                        <p className={styles.lead}>교회 생활이나 복음에 대해 궁금한 점을 편하게 남겨 주세요. 새가족팀이 기쁜 마음으로 답장을 보내 드려요.</p>
                        <button ref={askButtonRef} type="button" className={styles.btn} aria-haspopup="dialog" onClick={() => setAsking(true)}>
                            새가족 등록 문의하기
                        </button>
                    </div>
                    <motion.div className={styles.ctaMedia} {...reveal}>
                        <img src={askMailbox} alt="" loading="lazy" />
                    </motion.div>
                </div>
            </section>

            <Footer />

            {asking && <InquiryDialog onClose={closeAsk} />}
        </div>
    );
};

export default WelcomePage;

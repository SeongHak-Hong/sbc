import React, { useEffect, useRef, useState } from 'react';
import heroImage from '../assets/main/shintanjin-baptist-church-exterior.webp';
import heroImageMobile from '../assets/main/shintanjin-baptist-church-exterior-mobile.webp';
import heroFilm1080 from '../assets/main/shintanjin-hero-film-1080.mp4';
import heroFilm720 from '../assets/main/shintanjin-hero-film-720.mp4';
import heroFilm1080Av1 from '../assets/main/shintanjin-hero-film-1080-av1.mp4';
import heroFilm720Av1 from '../assets/main/shintanjin-hero-film-720-av1.mp4';

// 화면에 보이는 텍스트는 없지만 검색엔진·화면 낭독기용 h1은 유지
const visuallyHidden = {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0
};

const coverStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover'
};

// 일시정지 / 재생 / 다시 보기 아이콘
const icons = {
    pause: <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />,
    play: <path d="M8 5.5v13l11-6.5z" />,
    replay: <path d="M12 5V2L7 6l5 4V7a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z" />
};

const HeroSection = () => {
    const videoRef = useRef(null);
    const [videoSrc, setVideoSrc] = useState(null);
    const [visible, setVisible] = useState(false);
    const [state, setState] = useState('playing'); // playing | paused | ended

    // 동작 줄이기·데이터 절약 설정이면 영상을 받지 않고 사진만 보여줌
    useEffect(() => {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const saveData = navigator.connection?.saveData === true;
        if (reduceMotion || saveData) return;
        const mobile = window.matchMedia('(max-width: 767px)').matches;
        // AV1이 되는 브라우저는 같은 화질을 절반 용량으로, 아니면 H.264
        const av1 = document.createElement('video').canPlayType('video/mp4; codecs="av01.0.08M.08"') === 'probably';
        setVideoSrc(mobile ? (av1 ? heroFilm720Av1 : heroFilm720) : (av1 ? heroFilm1080Av1 : heroFilm1080));
    }, []);

    useEffect(() => {
        // 자동재생이 막힌 브라우저에선 사진이 그대로 남음
        if (videoSrc) videoRef.current?.play().catch(() => {});
    }, [videoSrc]);

    const toggle = () => {
        const v = videoRef.current;
        if (!v) return;
        if (v.ended) { v.currentTime = 0; v.play(); }
        else if (v.paused) v.play();
        else v.pause();
    };

    const label = state === 'ended' ? '영상 다시 보기' : state === 'paused' ? '영상 재생' : '영상 일시정지';
    const icon = state === 'ended' ? icons.replay : state === 'paused' ? icons.play : icons.pause;

    const sectionStyle = {
        position: 'sticky', // Changed from relative to sticky for curtain effect
        top: 0,
        zIndex: 0,
        width: '100%',
        minHeight: '100vh',
        overflow: 'hidden'
    };

    return (
        <section style={sectionStyle}>
            <h1 style={visuallyHidden}>신탄진침례교회</h1>

            {/* Background Image: 화면 폭에 맞는 크기를 브라우저가 골라 받음
                (모바일은 세로로 꽉 채우느라 화면 높이의 약 1.8배 너비가 필요) */}
            <img
                src={heroImage}
                srcSet={`${heroImageMobile} 1440w, ${heroImage} 2560w`}
                sizes="(max-width: 767px) 180vh, 100vw"
                alt="신탄진침례교회 전경"
                fetchPriority="high"
                decoding="async"
                style={coverStyle}
            />

            {/* 새신자 이야기 영상: 한 번 재생 후 마지막 교회 장면에서 멈춤.
                실제로 재생되기 시작한 뒤에만 사진 위로 서서히 나타남 */}
            {videoSrc && (
                <video
                    ref={videoRef}
                    src={videoSrc}
                    muted
                    playsInline
                    preload="auto"
                    aria-hidden="true"
                    onPlaying={() => { setVisible(true); setState('playing'); }}
                    onPause={(e) => { if (!e.currentTarget.ended) setState('paused'); }}
                    onEnded={() => setState('ended')}
                    style={{
                        ...coverStyle,
                        opacity: visible ? 1 : 0,
                        transition: 'opacity 800ms cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                />
            )}

            {/* 하단 옅은 딤드: 흰 문구가 어떤 장면 위에서도 읽히도록 */}
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: '45%',
                    pointerEvents: 'none',
                    background: 'linear-gradient(to top, rgba(12, 14, 18, 0.55) 0%, rgba(12, 14, 18, 0.25) 45%, rgba(12, 14, 18, 0) 100%)'
                }}
            />

            <p
                style={{
                    position: 'absolute',
                    left: 'max(1.5rem, 5vw, env(safe-area-inset-left))',
                    bottom: 'calc(clamp(1.75rem, 6vh, 4rem) + env(safe-area-inset-bottom, 0px))',
                    margin: 0,
                    maxWidth: 'calc(100% - 3rem - 64px)',
                    color: '#fff',
                    fontFamily: 'var(--font-yuhan)',
                    fontWeight: 400,
                    fontSize: 'clamp(1.75rem, 4vw, 3.25rem)',
                    lineHeight: 1.35,
                    letterSpacing: '-0.02em',
                    wordBreak: 'keep-all',
                    textShadow: '0 2px 16px rgba(0, 0, 0, 0.3)'
                }}
            >
                세상이 줄 수 없는<br />평안이 있어요
            </p>

            {visible && (
                <button
                    type="button"
                    onClick={toggle}
                    aria-label={label}
                    title={label}
                    style={{
                        position: 'absolute',
                        right: 'max(1.5rem, 5vw, env(safe-area-inset-right))',
                        bottom: 'calc(clamp(1.75rem, 6vh, 4rem) + env(safe-area-inset-bottom, 0px))',
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        border: 0,
                        padding: 0,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(12, 14, 18, 0.5)',
                        color: '#fff',
                        cursor: 'pointer',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)'
                    }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{icon}</svg>
                </button>
            )}
        </section>
    );
};

export default HeroSection;

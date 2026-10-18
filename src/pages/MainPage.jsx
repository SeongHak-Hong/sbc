import React, { useEffect, useRef, useState } from 'react';
import styles from './MainPage.module.css';

// 비디오 & 오디오 애셋
import heroFilm1080 from '../assets/main/shintanjin-hero-film-1080.mp4';
import heroFilm720 from '../assets/main/shintanjin-hero-film-720.mp4';
import heroFilm1080Av1 from '../assets/main/shintanjin-hero-film-1080-av1.mp4';
import heroFilm720Av1 from '../assets/main/shintanjin-hero-film-720-av1.mp4';
import worshipPhoto from '../assets/main/shintanjin-baptist-church-sunday-worship.webp';
import nextgenPhoto from '../assets/main/shintanjin-baptist-church-nextgen-children.webp';
import smallGroupPhoto from '../assets/main/shintanjin-baptist-church-small-group.webp';
import outreachPhoto from '../assets/main/shintanjin-baptist-church-neighbor-outreach.webp';
import bgmAudio from '../assets/main/My-peace-I-give-unto-you.mp3';
import phoneFrame from '../assets/main/iPhone-14-Pro.webp';
import shortsThumbBg from '../assets/main/shorts-thumbnail.webp';

const CHANNEL_ID = 'UCj3wg1t2u2eiMQxWIgT2OeQ';
const FALLBACK_SHORTS = [{ id: 'MW1TfRYMA4w', title: '나의 누나에게 장애가 있다면?' }];
const CACHE_KEY = 'sbc_proto_shorts_v3';
const NOT_SERMON = /유치부|초등부|중고등부|청년부|예배대장|광고|공지|예배|기도회|성가대|찬양대/;
const CACHE_MS = 6 * 60 * 60 * 1000;

function parseDuration(pt) {
  if (!pt) return 0;
  const match = pt.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || 0, 10);
  const minutes = parseInt(match[2] || 0, 10);
  const seconds = parseInt(match[3] || 0, 10);
  return hours * 3600 + minutes * 60 + seconds;
}

function cleanShortsTitle(s) {
  if (!s) return '';
  return s.replace(/#\S+/g, '').replace(/\s{2,}/g, ' ').trim();
}

function decodeEntities(s) {
  const t = document.createElement('textarea');
  t.innerHTML = s;
  return cleanShortsTitle(t.value);
}

const MainPage = () => {
  // 1) Hero 영상 및 BGM 상태
  const videoRef = useRef(null);
  const musicRef = useRef(null);
  const [videoSrc, setVideoSrc] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // 2) 이번 주 예배 실시간 데이터
  const [liveWorship, setLiveWorship] = useState({ when: '', name: '', left: '', nextIndex: -1 });

  // 3) 설교 쇼츠 상태
  const [shortVideo, setShortVideo] = useState(FALLBACK_SHORTS[0]);
  const [isShortPlaying, setIsShortPlaying] = useState(false);
  const shortsIframeRef = useRef(null);
  const shortsPlayerRef = useRef(null);

  // YouTube IFrame API 스크립트 로드
  useEffect(() => {
    if (!window.YT && !document.getElementById('youtube-iframe-api')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }
  }, []);

  // 쇼츠 재생 중일 때 기존 <iframe>에 플레이어 이벤트 바인딩 및 종료 감지
  useEffect(() => {
    if (!isShortPlaying) {
      shortsPlayerRef.current = null;
      return;
    }

    let isMounted = true;
    let pollTimer = null;
    let lastTime = 0;

    const stopAndReset = () => {
      if (isMounted) {
        if (pollTimer) clearInterval(pollTimer);
        setIsShortPlaying(false);
      }
    };

    const startPolling = (player) => {
      if (pollTimer) clearInterval(pollTimer);
      pollTimer = setInterval(() => {
        if (!isMounted || !player) return;
        try {
          if (typeof player.getCurrentTime === 'function' && typeof player.getDuration === 'function') {
            const current = player.getCurrentTime();
            const duration = player.getDuration();

            if (duration > 0) {
              // 1) 영상 끝 0.4초 이내에 도달했거나 넘어간 경우 (중간 스킵 후 끝 도달 포함)
              if (duration - current <= 0.4) {
                stopAndReset();
                return;
              }
              // 2) 유튜브 쇼츠 자체 루프로 인해 끝에서 0초 부근으로 다시 튀는 경우
              if (lastTime > Math.max(0, duration - 1.5) && current < 1.0) {
                stopAndReset();
                return;
              }
            }
            lastTime = current;
          }
        } catch {}
      }, 150);
    };

    const bindPlayer = () => {
      if (!isMounted || !shortsIframeRef.current) return;
      if (!window.YT || !window.YT.Player) return;

      try {
        shortsPlayerRef.current = new window.YT.Player(shortsIframeRef.current, {
          events: {
            onReady: (event) => {
              if (isMounted) {
                startPolling(event.target);
              }
            },
            onStateChange: (event) => {
              // 0: YT.PlayerState.ENDED (영상 재생 종료)
              if (event.data === 0) {
                stopAndReset();
              } else if (event.target) {
                startPolling(event.target);
              }
            },
          },
        });
      } catch (err) {
        console.warn('YouTube Player binding:', err);
      }
    };

    if (window.YT && window.YT.Player) {
      bindPlayer();
    } else {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prev) prev();
        bindPlayer();
      };
    }

    // postMessage 백업 감지 (enablejsapi=1)
    const handleMessage = (e) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data && (data.event === 'onStateChange' || data.info === 0)) {
          if (data.info === 0) {
            stopAndReset();
          }
        }
      } catch {}
    };
    window.addEventListener('message', handleMessage);

    return () => {
      isMounted = false;
      if (pollTimer) clearInterval(pollTimer);
      window.removeEventListener('message', handleMessage);
      shortsPlayerRef.current = null;
    };
  }, [isShortPlaying, shortVideo.id]);

  // 4) 카드 트랙 가로 스크롤
  const trackRef = useRef(null);

  // 글자 크기 조절
  const [isLargeSize, setIsLargeSize] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sbc-text-size') === 'large';
      setIsLargeSize(saved);
      document.documentElement.dataset.size = saved ? 'large' : 'normal';
    } catch {}
  }, []);

  const toggleTextSize = () => {
    const next = !isLargeSize;
    setIsLargeSize(next);
    document.documentElement.dataset.size = next ? 'large' : 'normal';
    try { localStorage.setItem('sbc-text-size', next ? 'large' : 'normal'); } catch {}
  };

  // 영상 소스 세팅
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = navigator.connection?.saveData === true;
    if (reduceMotion || saveData) return;

    const mobile = window.matchMedia('(max-width: 767px)').matches;
    const tempVideo = document.createElement('video');
    const av1 = tempVideo.canPlayType('video/mp4; codecs="av01.0.08M.08"') === 'probably';
    const src = mobile ? (av1 ? heroFilm720Av1 : heroFilm720) : (av1 ? heroFilm1080Av1 : heroFilm1080);
    setVideoSrc(src);
  }, []);

  // 비디오 재생 시작
  useEffect(() => {
    if (!videoSrc || !videoRef.current) return;
    const v = videoRef.current;

    const handlePlaying = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsEnded(true);

    v.addEventListener('playing', handlePlaying);
    v.addEventListener('pause', handlePause);
    v.addEventListener('ended', handleEnded);

    // 모바일 4:5 세로 크롭 시 마지막 컷(18.04초~) 위치 조정
    const mobile = window.matchMedia('(max-width: 767px)').matches;
    if (mobile) {
      const LAST_CUT = 18.04;
      const sync = (t) => v.classList.toggle(styles.isLastCut, t >= LAST_CUT);
      v.addEventListener('timeupdate', () => sync(v.currentTime));
    }

    v.play().catch(() => {});

    return () => {
      v.removeEventListener('playing', handlePlaying);
      v.removeEventListener('pause', handlePause);
      v.removeEventListener('ended', handleEnded);
    };
  }, [videoSrc]);

  // 영상 토글
  const toggleVideo = () => {
    if (!videoRef.current) return;
    const v = videoRef.current;
    if (v.ended) {
      v.currentTime = 0;
      v.play();
      setIsEnded(false);
    } else if (v.paused) {
      v.play();
    } else {
      v.pause();
    }
  };

  // 음악 토글
  const toggleMusic = () => {
    if (!musicRef.current) return;
    const m = musicRef.current;
    if (m.paused) {
      m.play();
      setIsMusicPlaying(true);
    } else {
      m.pause();
      setIsMusicPlaying(false);
    }
  };

  // 예배 시간표 계산
  useEffect(() => {
    const worships = [
      { days: [0], time: '07:00', name: '주일 1부 예배', place: '소예배실', dayLabel: '일요일, 소예배실', timeLabel: '오전 7:00' },
      { days: [0], time: '11:00', name: '주일 2부 예배', place: '대예배실', dayLabel: '일요일, 대예배실', timeLabel: '오전 11:00' },
      { days: [0], time: '14:00', name: '주일 오후 예배', place: '대예배실', dayLabel: '일요일, 대예배실', timeLabel: '오후 2:00' },
      { days: [3], time: '19:00', name: '수요 예배', place: '대예배실', dayLabel: '수요일, 대예배실', timeLabel: '오후 7:00' },
      { days: [5], time: '21:00', name: '금요 기도회', place: '소예배실', dayLabel: '금요일, 소예배실', timeLabel: '오후 9:00' },
      { days: [1, 2, 3, 4, 5], time: '05:00', name: '새벽 기도회', place: '소예배실', dayLabel: '월~금, 소예배실', timeLabel: '새벽 5:00', skipNext: true }
    ];

    const q = new URLSearchParams(window.location.search).get('now');
    const now = q ? new Date(q) : new Date();
    const LEN = 75;
    const DAY = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

    let best = null;
    worships.forEach((item, index) => {
      if (item.skipNext) return;
      const [h, m] = item.time.split(':').map(Number);
      for (let k = 0; k < 8; k++) {
        const d = new Date(now);
        d.setDate(d.getDate() + k);
        d.setHours(h, m, 0, 0);
        if (!item.days.includes(d.getDay()) || d.getTime() + LEN * 60000 <= now.getTime()) continue;
        if (!best || d < best.at) best = { item, at: d, index };
        break;
      }
    });

    if (best) {
      const { item, at, index } = best;
      const h = at.getHours(), m = at.getMinutes();
      const part = h < 6 ? '새벽' : h < 12 ? '오전' : h < 18 ? '오후' : h < 21 ? '저녁' : '밤';
      const clock = `${part} ${h > 12 ? h - 12 : h}시${m ? ` ${m}분` : ''}`;
      const dayDiff = Math.round((new Date(at).setHours(0, 0, 0, 0) - new Date(now).setHours(0, 0, 0, 0)) / 86400000);
      const dayWord = dayDiff === 0 ? '오늘' : dayDiff === 1 ? '내일' : DAY[at.getDay()];
      const diff = Math.round((at - now) / 60000);
      const left = diff <= 0 ? `${item.place}에서 지금 드리고 있어요`
        : diff < 60 ? `${diff}분 뒤, ${item.place}에서 드려요`
        : diff < 1440 ? `${Math.floor(diff / 60)}시간${diff % 60 ? ` ${diff % 60}분` : ''} 뒤, ${item.place}에서 드려요`
        : `${dayDiff}일 뒤, ${item.place}에서 드려요`;

      setLiveWorship({
        when: `${dayWord} ${clock},`,
        name: `${item.name}가 있어요.`,
        left,
        nextIndex: index
      });
    }
  }, []);

  // 유튜브 쇼츠 불러오기 (3분 이하 세로 쇼츠 전용 정밀 선별)
  useEffect(() => {
    async function loadShorts() {
      try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
        if (cached && Date.now() - cached.time < CACHE_MS) {
          setShortVideo(cached.items[0]);
          return;
        }
      } catch {}

      const key = import.meta.env?.VITE_YOUTUBE_API_KEY;
      if (!key) return;

      try {
        // 1. 채널 최신 비디오 목록 조회
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&maxResults=15&order=date&type=video&key=${key}`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();
        const videoIds = (searchData.items || []).map((it) => it.id?.videoId).filter(Boolean);

        if (!videoIds.length) return;

        // 2. 비디오 상세 정보(재생시간, 라이브 여부) 조회 (videos API)
        const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,liveStreamingDetails&id=${videoIds.join(',')}&key=${key}`;
        const videosRes = await fetch(videosUrl);
        const videosData = await videosRes.json();

        // 3. 실제 쇼츠(Shorts)만 정밀 선별:
        // - 라이브 스트리밍/예배 제외 (!liveStreamingDetails)
        // - 영상 길이가 3분(180초) 이하
        // - 예배/부서/공지 영상 제목 제외
        const shorts = (videosData.items || [])
          .filter((it) => {
            const isLive = !!it.liveStreamingDetails;
            const duration = parseDuration(it.contentDetails?.duration);
            const title = it.snippet?.title || '';
            const isExcluded = NOT_SERMON.test(title);
            return !isLive && duration > 0 && duration <= 180 && !isExcluded;
          })
          .map((it) => ({
            id: it.id,
            title: decodeEntities(it.snippet?.title || ''),
          }));

        if (shorts.length) {
          setShortVideo(shorts[0]);
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ time: Date.now(), items: shorts }));
          } catch {}
        }
      } catch (err) {
        console.warn('Failed to load YouTube shorts:', err);
      }
    }
    loadShorts();
  }, []);

  // 카드 트랙 좌우 스크롤
  const scrollTrack = (direction) => {
    if (!trackRef.current) return;
    const card = trackRef.current.querySelector(`.${styles.maCard}`);
    const step = card ? card.getBoundingClientRect().width + 16 : 536;
    trackRef.current.scrollBy({ left: direction * step, behavior: 'smooth' });
  };

  return (
    <div className={styles.mainWrap}>
      <main id="main">
        {/* ① Hero: 가운데 정렬 헤드라인 + 말씀 + 본문 폭 영상 + BGM 캡션 */}
        <section className={styles.hero} id="top">
          <div className={`${styles.wrap} ${styles.heroInner}`}>
            <div className={styles.heroHead}>
              <h1>세상이 줄 수 없는,<br />평안이 여기 있어요.</h1>
              <p className={styles.heroVerse}>
                수고하고 무거운 짐 진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라<br />
                <cite>마태복음 11:28</cite>
              </p>
            </div>

            <div className={styles.heroMedia}>
              <p className={styles.srOnly}>
                처음 교회에 온 엄마와 딸이 인사를 받고, 함께 예배드리고, 국수를 먹고, 웃으며 집으로 돌아가는 하루를 담은 영상이에요.
              </p>

              {videoSrc && (
                <video
                  ref={videoRef}
                  className={styles.heroVideo}
                  src={videoSrc}
                  muted
                  playsInline
                  preload="auto"
                  aria-hidden="true"
                />
              )}

              <div className={styles.heroCtrls}>
                {videoSrc && (
                  <button
                    className={styles.heroPlay}
                    type="button"
                    onClick={toggleVideo}
                    aria-label={isEnded ? "영상 다시 보기" : isPlaying ? "영상 일시정지" : "영상 재생"}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                      {isEnded ? (
                        <path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      ) : isPlaying ? (
                        <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
                      ) : (
                        <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
                      )}
                    </svg>
                  </button>
                )}

                <button
                  className={styles.heroPlay}
                  type="button"
                  onClick={toggleMusic}
                  aria-label={isMusicPlaying ? "음악 끄기" : "음악 켜기"}
                  aria-pressed={isMusicPlaying}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {isMusicPlaying ? (
                      <>
                        <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" fill="currentColor" />
                        <path d="M16 8a5 5 0 0 1 0 8M19 5a9 9 0 0 1 0 14" />
                      </>
                    ) : (
                      <>
                        <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" fill="currentColor" />
                        <path d="M16 9.5l5 5M21 9.5l-5 5" />
                      </>
                    )}
                  </svg>
                </button>
              </div>

              <audio ref={musicRef} src={bgmAudio} preload="none" onEnded={() => setIsMusicPlaying(false)} />
            </div>

            <p className={styles.heroBgm}>
              BGM: 유튜브 @숨쉬는 건반/Pray Room - 평안을 너에게 주노라 My peace I give unto you
            </p>
          </div>
        </section>

        {/* ② 이번 주 예배: 흰 바탕. 왼쪽 '다음 예배' 큰 문장 + 오른쪽 시간표 6줄 */}
        <section className={styles.wk} id="worship" aria-label="이번 주 예배">
          <div className={`${styles.wrap} ${styles.wkGrid}`}>
            <div>
              <p className={styles.wkBig} aria-live="polite">
                <span>{liveWorship.when}</span>
                <span>{liveWorship.name}</span>
              </p>
              <p className={styles.wkLeft}>
                <span>{liveWorship.left}</span>
              </p>
            </div>
            <ul className={styles.wkList} aria-label="예배 시간표">
              <li className={liveWorship.nextIndex === 0 ? styles.isNext : ''}>
                <span className={styles.wkN}>주일 1부 예배</span>
                <span className={styles.wkT}>오전 7:00</span>
                <span className={styles.wkP}>일요일, 소예배실</span>
              </li>
              <li className={liveWorship.nextIndex === 1 ? styles.isNext : ''}>
                <span className={styles.wkN}>주일 2부 예배</span>
                <span className={styles.wkT}>오전 11:00</span>
                <span className={styles.wkP}>일요일, 대예배실</span>
              </li>
              <li className={liveWorship.nextIndex === 2 ? styles.isNext : ''}>
                <span className={styles.wkN}>주일 오후 예배</span>
                <span className={styles.wkT}>오후 2:00</span>
                <span className={styles.wkP}>일요일, 대예배실</span>
              </li>
              <li className={liveWorship.nextIndex === 3 ? styles.isNext : ''}>
                <span className={styles.wkN}>수요 예배</span>
                <span className={styles.wkT}>오후 7:00</span>
                <span className={styles.wkP}>수요일, 대예배실</span>
              </li>
              <li className={liveWorship.nextIndex === 4 ? styles.isNext : ''}>
                <span className={styles.wkN}>금요 기도회</span>
                <span className={styles.wkT}>오후 9:00</span>
                <span className={styles.wkP}>금요일, 소예배실</span>
              </li>
              <li>
                <span className={styles.wkN}>새벽 기도회</span>
                <span className={styles.wkT}>새벽 5:00</span>
                <span className={styles.wkP}>월~금, 소예배실</span>
              </li>
            </ul>
          </div>
        </section>

        {/* ③ 교회가 하는 일: 제목 위 + 가로로 넘기는 카드 4개 */}
        <section className={styles.ma} id="ministry" aria-labelledby="ma-h">
          <div className={`${styles.wrap} ${styles.maHead}`}>
            <h2 id="ma-h">예배하고, 자라고,<br />이웃에게 흘려보내요.</h2>
          </div>
          <div ref={trackRef} className={styles.maTrack} tabIndex={0} role="region" aria-label="교회가 하는 일">
            <article className={styles.maCard}>
              <div className={styles.maMedia}>
                <img className={styles.maPhoto} src={worshipPhoto} width={1392} height={777} alt="신탄진침례교회 예배당 뒷자리에서 엄마 어깨에 기대 예배드리는 아이" loading="lazy" />
              </div>
              <p className={styles.maCap}>
                <strong>주일과 주중, 말씀으로 한 주를 세워요.</strong> 주일 세 번의 예배와 수요 예배, 새벽·금요 기도회로 모여요. 지난 설교와 찬양은 영상으로 다시 볼 수 있어요.
              </p>
            </article>
            <article className={styles.maCard}>
              <div className={styles.maMedia}>
                <img className={styles.maPhoto} src={nextgenPhoto} width={1344} height={896} alt="신탄진침례교회 유치부실에서 선생님과 함께 그림 성경을 보며 웃는 아이들" loading="lazy" />
              </div>
              <p className={styles.maCap}>
                <strong>유치부부터 청년부까지, 말씀 안에서 자라요.</strong> 주일 오전 9시 유치부·초등부·중고등부, 오후 1시 30분 청년부 예배가 있어요. 매주 목요일 오후 1~4시엔 식당에서 떡볶이데이가 열려요.
              </p>
            </article>
            <article className={styles.maCard}>
              <div className={styles.maMedia}>
                <img className={styles.maPhoto} src={smallGroupPhoto} width={1344} height={896} alt="신탄진침례교회 구역 모임에서 성경을 펴 두고 웃으며 이야기 나누는 성도들" loading="lazy" />
              </div>
              <p className={styles.maCap}>
                <strong>동네별 구역 모임에서 한 주의 삶을 나눠요.</strong> 교구와 구역, 남·여 전도회로 모여 함께 말씀을 나누고 서로의 안부를 챙겨요.
              </p>
            </article>
            <article className={styles.maCard}>
              <div className={styles.maMedia}>
                <img className={styles.maPhoto} src={outreachPhoto} width={1344} height={896} alt="신탄진침례교회 목요전도팀이 동네 골목에서 이웃 어르신께 선물을 건네는 모습" loading="lazy" />
              </div>
              <p className={styles.maCap}>
                <strong>매주 목요일, 네 팀이 동네 이웃을 찾아가요.</strong> 네 개 팀으로 나뉜 목요전도팀이 가까운 이웃을 찾아가요. 국내와 해외 선교도 함께 기도하며 돕고 있어요.
              </p>
            </article>
          </div>
          <div className={`${styles.wrap} ${styles.maNavWrap}`}>
            <div className={styles.maNav} aria-label="카드 이동">
              <button className={styles.maBtn} type="button" onClick={() => scrollTrack(-1)} aria-label="이전">
                <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button className={styles.maBtn} type="button" onClick={() => scrollTrack(1)} aria-label="다음">
                <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* ④ 1분 말씀: 회색 띠(#F5F5F7), 가운데 정렬, 아이폰 목업 1대 */}
        <section className={styles.shortsSec} id="shorts" aria-labelledby="sh-h">
          <div className={`${styles.wrap} ${styles.shortsInner}`}>
            <div className={styles.shortsHead}>
              <h1 id="sh-h">1분 말씀으로<br />한 주를 시작해요.</h1>
              <a className={styles.shortsMore} href="https://www.youtube.com/@sbc6312/shorts" target="_blank" rel="noopener noreferrer">
                전체 영상 보러 가기
              </a>
            </div>
            <div className={styles.phone}>
              <div className={styles.phoneScreen}>
                {isShortPlaying ? (
                  <iframe
                    ref={shortsIframeRef}
                    className={styles.shortsIframe}
                    src={`https://www.youtube.com/embed/${shortVideo.id}?enablejsapi=1&autoplay=1&rel=0&playsinline=1&loop=0`}
                    title={cleanShortsTitle(shortVideo.title) || "주일설교 쇼츠"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <>
                    <img
                      className={styles.phoneThumb}
                      src={shortsThumbBg}
                      alt=""
                    />
                    <div className={styles.shortsContent}>
                      <span className={styles.shortsLabel}>주일설교 쇼츠</span>
                      <strong className={styles.shortsTitle}>{cleanShortsTitle(shortVideo.title)}</strong>
                    </div>
                    <button
                      className={styles.shortsPlayBtn}
                      type="button"
                      onClick={() => setIsShortPlaying(true)}
                      aria-label="쇼츠 영상 재생"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                        <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
              <img className={styles.phoneFrame} src={phoneFrame} alt="" loading="lazy" />
            </div>
          </div>
        </section>

        {/* ⑤ 자주 묻는 것: 제목 위 + 아래 한 줄 목록 5개 (1px 구분선) */}
        <section className={styles.fq} id="faq" aria-labelledby="fq-h">
          <div className={styles.wrap}>
            <div className={styles.fqHead}>
              <h2 id="fq-h">처음 오시는 분들이<br />자주 묻는 것들이에요.</h2>
            </div>
            <div className={styles.fqList}>
              <details className={styles.fqItem}>
                <summary>
                  아무것도 모르고 가도 되나요?
                  <svg className={styles.fqIcon} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <p>네, 그대로 오시면 돼요. 성경책이나 찬송가가 없어도 괜찮아요. 예배 순서와 가사는 앞 화면에 나와요.</p>
              </details>
              <details className={styles.fqItem}>
                <summary>
                  등록하라고 하거나 연락처를 묻나요?
                  <svg className={styles.fqIcon} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <p>원하지 않으시면 등록하지 않으셔도 돼요. 이름이나 연락처를 적지 않아도 예배드릴 수 있어요.</p>
              </details>
              <details className={styles.fqItem}>
                <summary>
                  아이와 함께 가도 되나요?
                  <svg className={styles.fqIcon} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <p>그럼요. 주일 오전 9시에 유치부·초등부·중고등부 예배가 따로 있어요. 어른 예배에 아이와 함께 앉으셔도 괜찮아요. 예배실 뒤에 자모실이 있어서 아기와 함께 오셔도 편하게 예배드릴 수 있어요.</p>
              </details>
              <details className={styles.fqItem}>
                <summary>
                  헌금을 꼭 해야 하나요?
                  <svg className={styles.fqIcon} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <p>아니요. 처음 오신 분께 헌금을 바라지 않아요. 편하게 예배만 드리고 가셔도 돼요.</p>
              </details>
              <details className={styles.fqItem}>
                <summary>
                  주차는 어디에 하나요?
                  <svg className={styles.fqIcon} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <p>교회 주차장을 쓰시면 돼요. 주일에는 대죽체육관 주차장도 쓸 수 있고, 동네별 셔틀도 다녀요.</p>
              </details>
            </div>
          </div>
        </section>
      </main>

      {/* ⑥ 푸터 */}
      <footer className={styles.footer}>
        <div className={styles.wrap}>
          <div className={styles.fLinks}>
            <a href="#">개인정보처리방침</a>
            <a href="#">이용약관</a>
          </div>
          <p>대전 대덕구 석봉로 17 신탄진침례교회</p>
          <p>T. <a href="tel:0429328156">042-932-8156</a></p>
          <p className={styles.fCopy}>© {new Date().getFullYear()} SHINTANJIN BAPTIST CHURCH. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  );
};

export default MainPage;

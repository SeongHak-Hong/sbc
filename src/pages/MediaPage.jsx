import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Footer from '../components/Footer';
import Pagination from '../components/ui/Pagination';
import styles from './MediaPage.module.css';
import PageTopGradient from '../components/PageTopGradient';

// 영상 고르기: 제목("전체")과 오른쪽 화살표를 누르면 교회 일정 연월 고르기와 같은 유리 창이 열린다
const FILTERS = [
    { id: 'all', label: '전체' },
    { id: 'sermon', label: '설교' },
    { id: 'praise', label: '찬양' },
    { id: 'nextgen', label: '다음세대' },
];

// 고르기 창: 감쇠 1.0 스프링(튕김 없음)
const pickerSpring = { type: 'spring', bounce: 0, duration: 0.3 };

const ChevronDown = () => (
    <svg viewBox="0 0 36 36" aria-hidden="true">
        <circle cx="18" cy="18" r="17" strokeWidth="2" />
        <polyline points="11.9,15.4 18,21.5 24.1,15.4" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const CheckIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);


const MediaPage = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 10;
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const reduceMotion = useReducedMotion();
    const [pickerOpen, setPickerOpen] = useState(false);
    const pickerRef = useRef(null);
    const triggerRef = useRef(null);

    // 바깥을 누르거나 Esc를 누르면 고르기 창을 닫는다
    useEffect(() => {
        if (!pickerOpen) return undefined;
        const onPointer = (e) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target)) setPickerOpen(false);
        };
        const onKey = (e) => {
            if (e.key === 'Escape') {
                setPickerOpen(false);
                triggerRef.current?.focus();
            }
        };
        document.addEventListener('mousedown', onPointer);
        document.addEventListener('touchstart', onPointer);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onPointer);
            document.removeEventListener('touchstart', onPointer);
            document.removeEventListener('keydown', onKey);
        };
    }, [pickerOpen]);

    // Prevent scrolling when modal is open
    useEffect(() => {
        if (selectedVideo) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [selectedVideo]);

    // Parse URL parameter to set initial tab if provided
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab === 'praise' || tab === 'sermon' || tab === 'nextgen' || tab === 'all') {
            setActiveTab(tab);
        }
    }, [location]);

    useEffect(() => {
        let cancelled = false;
        const cacheKey = 'sbc_youtube_videos_v2';

        const readCache = () => {
            try {
                const str = localStorage.getItem(cacheKey) || localStorage.getItem('sbc_youtube_videos');
                return str ? JSON.parse(str) : null;
            } catch {
                return null;
            }
        };

        const fetchJson = async (url) => {
            const response = await fetch(url);
            const data = await response.json();
            // 할당량 초과·키 제한 등은 200이 아니어도 throw되지 않으므로 직접 확인
            if (!response.ok || data.error) {
                throw new Error(data.error?.message || `HTTP ${response.status}`);
            }
            return data;
        };

        const fetchVideos = async () => {
            // 1. 캐시가 있으면 (만료됐더라도) 바로 보여 주고, 만료된 경우에만 뒤에서 새로 받아옴
            const cachedData = readCache();
            if (cachedData?.videos?.length) {
                setVideos(cachedData.videos);
                setLoading(false);
                // 6시간 = 6 * 60 * 60 * 1000 = 21600000ms
                if (Date.now() - cachedData.timestamp < 21600000) return; // API 호출 없이 종료
            }

            // 2. 캐시가 없거나 만료되었을 경우 API 호출
            const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
            if (!apiKey) {
                console.warn("YouTube API Key is missing in .env (VITE_YOUTUBE_API_KEY).");
                setLoading(false);
                return;
            }
            try {
                const channelId = 'UCj3wg1t2u2eiMQxWIgT2OeQ';
                const uploadsPlaylistId = channelId.replace(/^UC/, 'UU');

                // 최대 2페이지(100개)를 조회하여 과거 영상까지 충분히 가져옴
                const fetchPlaylist = async () => {
                    let items = [];
                    let nextPageToken = '';
                    for (let i = 0; i < 2; i++) {
                        const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${apiKey}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
                        const data = await fetchJson(playlistUrl);
                        if (data.items) items = [...items, ...data.items];
                        if (!data.nextPageToken) break;
                        nextPageToken = data.nextPageToken;
                    }
                    return items;
                };

                // 추가로 '유치부' 키워드로 채널 내 영상 검색 (최대 50개) — 실패해도 목록은 보여 줌
                const fetchNextGen = async () => {
                    try {
                        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=50&q=${encodeURIComponent('유치부')}&type=video&key=${apiKey}`;
                        const searchData = await fetchJson(searchUrl);
                        // search API의 응답은 item.id.videoId 형태이므로 호환성을 위해 변환
                        return (searchData.items || []).map(item => ({
                            ...item,
                            snippet: {
                                ...item.snippet,
                                resourceId: { videoId: item.id.videoId }
                            }
                        }));
                    } catch (searchError) {
                        console.error("Failed to fetch search results for NextGen:", searchError);
                        return [];
                    }
                };

                // 재생목록과 검색을 동시에 요청
                const [playlistItems, searchItems] = await Promise.all([fetchPlaylist(), fetchNextGen()]);
                let allItems = [...playlistItems, ...searchItems];

                // 중복 제거 (videoId 기준)
                const uniqueItemsMap = new Map();
                allItems.forEach(item => {
                    if (item.snippet && item.snippet.resourceId && item.snippet.resourceId.videoId) {
                        uniqueItemsMap.set(item.snippet.resourceId.videoId, item);
                    }
                });
                allItems = Array.from(uniqueItemsMap.values());

                if (allItems.length > 0) {
                    // 유효한 항목 필터링
                    const validItems = allItems.filter(item => item.snippet && item.snippet.resourceId && item.snippet.resourceId.videoId);
                    
                    // 길이를 조회하기 위해 50개 단위로 나누어 /videos API 호출
                    const chunkArray = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));
                    const idChunks = chunkArray(validItems.map(item => item.snippet.resourceId.videoId), 50);
                    
                    // 묶음들을 동시에 요청 (실패한 묶음은 길이를 모르는 것으로 처리)
                    const durationResults = await Promise.all(idChunks.map(chunk =>
                        fetchJson(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${chunk.join(',')}&key=${apiKey}`)
                            .catch(() => ({ items: [] }))
                    ));
                    let durationMap = {};
                    durationResults.forEach(videosData => {
                        (videosData.items || []).forEach(v => {
                            durationMap[v.id] = v.contentDetails.duration;
                        });
                    });

                    // ISO 8601 길이 파싱
                    const parseDuration = (duration) => {
                        const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
                        if (!match) return 0;
                        const hours = (parseInt(match[1]) || 0);
                        const minutes = (parseInt(match[2]) || 0);
                        const seconds = (parseInt(match[3]) || 0);
                        return hours * 3600 + minutes * 60 + seconds;
                    };

                    // 5분 이내 영상(쇼츠 등) 제외
                    const nonShortsVideos = validItems.filter(item => {
                        const title = (item.snippet.title || '').replace(/&quot;/g, '"').replace(/&#39;/g, "'").toLowerCase();
                        if (title.includes('유치부')) return true; // 유치부 영상은 길이 무관하게 포함

                        const videoId = item.snippet.resourceId.videoId;
                        const durationStr = durationMap[videoId];
                        if (durationStr) {
                            return parseDuration(durationStr) > 300;
                        }
                        return true; // 길이를 알 수 없는 경우 일단 포함
                    });

                    // 기존 로직과 호환되도록 id 구조 변경
                    const formattedVideos = nonShortsVideos.map(item => ({
                        ...item,
                        id: { videoId: item.snippet.resourceId.videoId }
                    }));

                    // 새로운 데이터를 캐시에 저장
                    try {
                        localStorage.setItem(cacheKey, JSON.stringify({
                            timestamp: Date.now(),
                            videos: formattedVideos
                        }));
                    } catch { /* 저장 공간 부족 등은 무시 */ }

                    if (!cancelled) setVideos(formattedVideos);
                }
            } catch (error) {
                // 할당량 초과(Quota Exceeded) 등 에러 발생 시, 이미 보여 준 캐시(만료됐더라도)를 그대로 둠 (빈 화면 방지)
                console.error("Failed to fetch YouTube videos:", error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchVideos();
        return () => { cancelled = true; };
    }, []);

    // Filter recent videos locally based on keyword
    const matchesFilter = (video, filterId) => {
        if (filterId === 'all') return true;

        const title = video.snippet.title.replace(/&quot;/g, '"').replace(/&#39;/g, "'").toLowerCase();

        if (filterId === 'sermon') {
            if (title.includes('유치부')) return false;
            return title.includes('주일') || title.includes('오후') || title.includes('수요') || title.includes('예배') || title.includes('설교') || title.includes('헌신');
        } else if (filterId === 'nextgen') {
            return title.includes('유치부');
        } else {
            return title.includes('찬양') || title.includes('특송');
        }
    };
    const filteredVideos = videos.filter((video) => matchesFilter(video, activeTab));

    const getBadge = (rawTitle) => {
        const title = rawTitle.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
        if (title.includes('유치부')) return '다음세대';
        if (title.includes('헌신예배')) return '헌신예배';
        if (title.includes('주일2부')) return '주일2부예배';
        if (title.includes('주일오후') || title.includes('오후예배')) return '주일오후예배';
        if (title.includes('수요')) return '수요예배';
        if (title.includes('주일')) return '주일예배';
        if (title.includes('찬양')) return '찬양';
        return '예배 영상';
    };

    const parseVideoInfo = (video) => {
        const rawTitle = video.snippet.title.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
        let desc = video.snippet.description || '';
        desc = desc.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
        
        // 1. Title Extraction
        let title = '';
        // 설명란에서 큰 따옴표(" " 또는 “ ”) 안의 텍스트 추출
        const descTitleMatch = desc.match(/["“](.*?)["”]/);
        if (descTitleMatch && descTitleMatch[1].trim() !== '') {
            title = descTitleMatch[1].trim();
        } else {
            // 따옴표가 없을 경우: 앞부분의 날짜 및 예배명 등만 제거하고 나머지는 그대로 보존 (내부의 대시 기호 등 유지)
            let cleanTitle = rawTitle;
            // 앞부분의 날짜 형식 제거 (예: 260816, 2026.08.16, [26.08.16] 등)
            cleanTitle = cleanTitle.replace(/^\[?\(?\d{2,4}[./-]?\d{2}[./-]?\d{2}\)?\]?\s*/, '');
            // 앞부분의 예배 명칭 및 바로 뒤의 구분자 제거
            cleanTitle = cleanTitle.replace(/^(주일오전예배|주일2부예배|수요예배|헌신예배|주일오후예배|오후예배|주일예배|찬양대|특송)\s*[-|｜:]?\s*/, '');
            // 혹시 맨 앞에 구분자가 남아있다면 추가 제거
            cleanTitle = cleanTitle.replace(/^[-|｜:]\s*/, '');
            
            title = cleanTitle.trim() || rawTitle;
        }
        
        // 2. Preacher Extraction
        const findPreacher = (text) => {
            const match = text.match(/([가-힣]{2,4}\s?(담임)?목사|[가-힣]{2,4}\s?전도사|[가-힣]{2,4}\s?강도사)/);
            return match ? match[0] : null;
        };
        let preacher = findPreacher(rawTitle) || findPreacher(desc) || '최영락 담임목사';
        
        if (rawTitle.toLowerCase().includes('유치부')) {
            preacher = '-';
        }

        // 3. Date Extraction (YYYY.MM.DD format)
        const publishedAt = new Date(video.snippet.publishedAt);
        const yyyy = publishedAt.getFullYear();
        const mm = String(publishedAt.getMonth() + 1).padStart(2, '0');
        const dd = String(publishedAt.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}.${mm}.${dd}`;

        // 4. Passage Extraction
        let passage = '';
        const passageRegex = /([가-힣1-3]+서?\s*\d+장\s*~?\s*\d*절?|[가-힣]+\s*\d+편\s*~?\s*\d*절?|[가-힣1-3]+서?\s*\d+:\d+~?\d*)/;
        
        const parenMatch = rawTitle.match(/\((.*?)\)/);
        if (parenMatch && passageRegex.test(parenMatch[1])) {
            passage = parenMatch[1];
        } else {
            const titlePassageMatch = rawTitle.match(passageRegex);
            if (titlePassageMatch) {
                passage = titlePassageMatch[0];
            } else {
                const descLines = desc.split('\n').slice(0, 5);
                for (let line of descLines) {
                    const linePassageMatch = line.match(passageRegex);
                    if (linePassageMatch) {
                        passage = linePassageMatch[0];
                        break;
                    }
                }
            }
        }

        if (passage) {
            passage = passage.replace(/본문\s*[:：]?\s*/, '').replace(/말씀\s*[:：]?\s*/, '').trim();
            // 00:00 형식으로 통일 (장, 절, 편 텍스트 제거 및 콜론 변환)
            passage = passage.replace(/\s*절\s*/g, '');
            passage = passage.replace(/(\d+)\s*[장편]\s*(?=\d)/g, '$1:');
            passage = passage.replace(/(\d+)\s*[장편]\s*$/g, '$1');
        }

        // 5. Combine Info
        const infoParts = [preacher];
        if (passage) infoParts.push(passage);

        const now = new Date();
        const diffTime = Math.abs(now - publishedAt);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        const isNew = diffDays <= 7;

        return {
            title: title || rawTitle,
            date: dateStr,
            info: infoParts.join(' · '),
            preacher: preacher === '-' ? '' : preacher,
            passage,
            isNew
        };
    };

    const totalPages = Math.ceil(filteredVideos.length / postsPerPage) || 1;
    const currentVideos = filteredVideos.slice(
        (currentPage - 1) * postsPerPage, 
        currentPage * postsPerPage
    );

    const activeFilter = FILTERS.find((f) => f.id === activeTab) || FILTERS[0];

    const pickFilter = (id) => {
        setActiveTab(id);
        setCurrentPage(1);
        setPickerOpen(false);
        triggerRef.current?.focus();
    };

    return (
        <div className={styles.page}>
            <PageTopGradient />
            <section className={styles.hero}>
                <div className={styles.wrap}>
                    <p className={styles.eyebrow}>미디어룸</p>
                    <div className={styles.pickerAnchor} ref={pickerRef}>
                        <h1 className={styles.title}>
                            <button
                                ref={triggerRef}
                                type="button"
                                className={styles.titleButton}
                                aria-haspopup="dialog"
                                aria-expanded={pickerOpen}
                                aria-label={`${activeFilter.label} 영상, 다른 종류 고르기`}
                                onClick={() => setPickerOpen((open) => !open)}
                            >
                                <span>{activeFilter.label}</span>
                                <span className={`${styles.titleChevron} ${pickerOpen ? styles.titleChevronOpen : ''}`}>
                                    <ChevronDown />
                                </span>
                            </button>
                        </h1>

                        <AnimatePresence>
                            {pickerOpen && (
                                <motion.div
                                    role="dialog"
                                    aria-label="영상 종류 고르기"
                                    className={styles.picker}
                                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.98 }}
                                    transition={reduceMotion ? { duration: 0.15 } : pickerSpring}
                                >
                                    {FILTERS.map((filter) => {
                                        const active = filter.id === activeTab;
                                        const count = videos.filter((video) => matchesFilter(video, filter.id)).length;
                                        return (
                                            <button
                                                key={filter.id}
                                                type="button"
                                                className={styles.option}
                                                aria-pressed={active}
                                                onClick={() => pickFilter(filter.id)}
                                            >
                                                <span className={styles.optionCheck}>{active && <CheckIcon />}</span>
                                                <span className={styles.optionLabel}>{filter.label}</span>
                                                {!loading && <span className={styles.optionCount}>{count}</span>}
                                            </button>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </section>

            <section className={styles.listSection}>
                <div className={styles.wrap}>
                    {loading ? (
                        // 불러오는 동안 실제 줄과 같은 크기의 자리를 잡아 두어 화면이 비거나 푸터가 올라오지 않게 함
                        <ul className={styles.videoList} role="status" aria-label="영상을 불러오고 있어요">
                            {Array.from({ length: 4 }, (_, i) => (
                                <li key={i} className={styles.videoItem} aria-hidden="true">
                                    <span className={`${styles.thumb} ${styles.skeleton}`} />
                                    <span className={styles.info}>
                                        <span className={`${styles.skeleton} ${styles.skeletonShort}`} />
                                        <span className={`${styles.skeleton} ${styles.skeletonLine}`} />
                                        <span className={`${styles.skeleton} ${styles.skeletonShort}`} />
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <>
                            {/* 종류·쪽을 바꾸면 목록만 opacity + translateY(8px) */}
                            <ul key={`${activeTab}-${currentPage}`} className={`${styles.videoList} ${styles.videoListIn}`} aria-label={`${activeFilter.label} 영상`}>
                                {currentVideos.map((video) => {
                                    const badge = getBadge(video.snippet.title);
                                    const parsedInfo = parseVideoInfo(video);
                                    return (
                                        <li key={video.id.videoId} className={styles.videoItem}>
                                            <a
                                                href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.videoLink}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setSelectedVideo(video);
                                                }}
                                            >
                                                <span className={styles.thumb}>
                                                    <img
                                                        src={video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium?.url}
                                                        alt=""
                                                        loading="lazy"
                                                        decoding="async"
                                                    />
                                                </span>
                                                <span className={styles.info}>
                                                    <span className={styles.category}>{badge}</span>
                                                    <span className={styles.videoTitle}>{parsedInfo.title}</span>
                                                    <span className={styles.metas}>
                                                        {parsedInfo.preacher && <span className={styles.meta}>{parsedInfo.preacher}</span>}
                                                        {parsedInfo.passage && <span className={styles.meta}>{parsedInfo.passage}</span>}
                                                    </span>
                                                </span>
                                            </a>
                                        </li>
                                    );
                                })}
                                {filteredVideos.length === 0 && (
                                    <li className={styles.empty}>해당하는 영상이 없어요.</li>
                                )}
                            </ul>
                            {filteredVideos.length > 0 && (
                                <div className={styles.paginationWrap}>
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
            <Footer />

            {/* Video Modal */}
            <AnimatePresence>
                {selectedVideo && (
                    <div className={styles.modalOverlay}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className={styles.modalBackdrop}
                            onClick={() => setSelectedVideo(null)}
                        />
                        <div className={styles.modalContent} style={{ pointerEvents: 'none' }}>
                            <div className={styles.modalBody}>
                                <motion.div 
                                    initial={{ clipPath: "inset(43.5% 43.5% 33.5% 43.5%)", opacity: 0 }}
                                    animate={{ clipPath: "inset(0 0 0 0)", opacity: 1 }}
                                    exit={{
                                        clipPath: "inset(43.5% 43.5% 33.5% 43.5%)",
                                        opacity: 0,
                                        transition: {
                                            duration: 1,
                                            type: "spring",
                                            stiffness: 100,
                                            damping: 20,
                                            opacity: { duration: 0.2, delay: 0.8 } } }}
                                    transition={{
                                        duration: 1,
                                        type: "spring",
                                        stiffness: 100,
                                        damping: 20 }}
                                    className={styles.videoWrapper}
                                    style={{ pointerEvents: 'auto' }}
                                >
                                    <button className={styles.closeButton} onClick={() => setSelectedVideo(null)}>
                                        <span className="material-symbols-outlined" translate="no" style={{ fontSize: '48px' }}>close</span>
                                    </button>
                                    <div className={styles.iframeContainer}>
                                        <iframe 
                                            src={`https://www.youtube.com/embed/${selectedVideo.id.videoId}?autoplay=1`} 
                                            title="YouTube video player" 
                                            frameBorder="0" 
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MediaPage;

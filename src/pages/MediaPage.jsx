import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import SubPageSection from '../components/SubPageSection';
import Footer from '../components/Footer';
import Pagination from '../components/ui/Pagination';
import { BlurFade } from '../components/ui/BlurFade';
import ScrollFadeText from '../components/ScrollFadeText';
import SwitchTabs from '../components/SwitchTabs';
import logoSbc from '../assets/shintanjin-baptist-church-logo.svg';
import styles from './MediaPage.module.css';

const MediaPage = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 10;
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState(null);

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
        if (tab === 'praise' || tab === 'sermon' || tab === 'all') {
            setActiveTab(tab);
        }
    }, [location]);

    useEffect(() => {
        const fetchVideos = async () => {
            setLoading(true);
            try {
                // 1. 캐시 확인 (6시간 유지)
                const cacheKey = 'sbc_youtube_videos';
                const cachedDataStr = localStorage.getItem(cacheKey);
                if (cachedDataStr) {
                    const cachedData = JSON.parse(cachedDataStr);
                    const now = new Date().getTime();
                    // 6시간 = 6 * 60 * 60 * 1000 = 21600000ms
                    if (now - cachedData.timestamp < 21600000) {
                        setVideos(cachedData.videos);
                        setLoading(false);
                        return; // API 호출 없이 종료
                    }
                }

                // 2. 캐시가 없거나 만료되었을 경우 API 호출
                const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
                if (!apiKey) {
                    console.warn("YouTube API Key is missing in .env (VITE_YOUTUBE_API_KEY).");
                    setLoading(false);
                    return;
                }
                const channelId = 'UCj3wg1t2u2eiMQxWIgT2OeQ';
                const uploadsPlaylistId = channelId.replace(/^UC/, 'UU');
                
                let allItems = [];
                let nextPageToken = '';
                
                // 최대 2페이지(100개)를 조회하여 과거 영상까지 충분히 가져옴
                for (let i = 0; i < 2; i++) {
                    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${apiKey}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
                    const response = await fetch(playlistUrl);
                    const data = await response.json();
                    
                    if (data.items) {
                        allItems = [...allItems, ...data.items];
                    }
                    if (data.nextPageToken) {
                        nextPageToken = data.nextPageToken;
                    } else {
                        break;
                    }
                }

                if (allItems.length > 0) {
                    // 유효한 항목 필터링
                    const validItems = allItems.filter(item => item.snippet && item.snippet.resourceId && item.snippet.resourceId.videoId);
                    
                    // 길이를 조회하기 위해 50개 단위로 나누어 /videos API 호출
                    const chunkArray = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));
                    const idChunks = chunkArray(validItems.map(item => item.snippet.resourceId.videoId), 50);
                    
                    let durationMap = {};
                    for (const chunk of idChunks) {
                        const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${chunk.join(',')}&key=${apiKey}`;
                        const videosResponse = await fetch(videosUrl);
                        const videosData = await videosResponse.json();
                        
                        if (videosData.items) {
                            videosData.items.forEach(v => {
                                durationMap[v.id] = v.contentDetails.duration;
                            });
                        }
                    }

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
                    localStorage.setItem('sbc_youtube_videos', JSON.stringify({
                        timestamp: new Date().getTime(),
                        videos: formattedVideos
                    }));

                    setVideos(formattedVideos);
                } else {
                    setVideos([]);
                }
            } catch (error) {
                console.error("Failed to fetch YouTube videos:", error);
                
                // 할당량 초과(Quota Exceeded) 등 에러 발생 시, 만료된 캐시라도 있다면 보여줌 (빈 화면 방지)
                const cachedDataStr = localStorage.getItem('sbc_youtube_videos');
                if (cachedDataStr) {
                    const cachedData = JSON.parse(cachedDataStr);
                    setVideos(cachedData.videos);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, []);

    // Filter recent videos locally based on keyword
    const filteredVideos = videos.filter(video => {
        if (activeTab === 'all') return true;

        const title = video.snippet.title.replace(/&quot;/g, '"').replace(/&#39;/g, "'").toLowerCase();

        if (activeTab === 'sermon') {
            return title.includes('주일') || title.includes('오후') || title.includes('수요') || title.includes('예배') || title.includes('설교') || title.includes('헌신');
        } else {
            return title.includes('찬양') || title.includes('특송');
        }
    });

    const getBadge = (rawTitle) => {
        const title = rawTitle.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
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

        return {
            title: title || rawTitle,
            date: dateStr,
            info: infoParts.join(' · ')
        };
    };

    const totalPages = Math.ceil(filteredVideos.length / postsPerPage) || 1;
    const currentVideos = filteredVideos.slice(
        (currentPage - 1) * postsPerPage, 
        currentPage * postsPerPage
    );

    return (
        <div className={styles.pageWrapper}>
            <SubPageSection hideHeader={true} className={styles.sectionCenter}>
                <div style={{ textAlign: 'center' }}>
                    <div className={styles.breadcrumb}>
                        말씀과 찬양 - 예배 영상
                    </div>
                    <ScrollFadeText
                        text="함께 예배해요."
                        as="h1"
                        className={styles.pageTitle}
                        once={true}
                    />
                </div>

                {loading ? (
                    <div className={styles.loading}>영상을 불러오는 중입니다...</div>
                ) : (
                    <>
                        <BlurFade delay={0.25} inView>
                            <div style={{ display: 'flex' }}>
                                <SwitchTabs 
                                    tabs={[
                                        { id: 'all', label: '전체' },
                                        { id: 'sermon', label: '설교' },
                                        { id: 'praise', label: '찬양대' }
                                    ]}
                                    activeTab={activeTab}
                                    onTabChange={(id) => { setActiveTab(id); setCurrentPage(1); }}
                                    layoutIdPrefix="activeSwitch_Media"
                                />
                            </div>
                        </BlurFade>

                                <div className={styles.videoGrid}>
                                    {currentVideos.map((video, index) => {
                                        const badge = getBadge(video.snippet.title);
                                        const parsedInfo = parseVideoInfo(video);
                                        return (
                                            <BlurFade key={video.id.videoId} delay={0.25 + index * 0.05} inView>
                                                <a 
                                                    href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={styles.videoCard}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setSelectedVideo(video);
                                                    }}
                                                >
                                                <div className={styles.thumbnailContainer}>
                                                    <img 
                                                        src={video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium?.url} 
                                                        alt={parsedInfo.title} 
                                                        className={styles.thumbnail}
                                                    />
                                                </div>
                                                <div className={styles.videoInfo}>
                                                    <p className={styles.date}>{parsedInfo.date}</p>
                                                    <p className={styles.title}>{parsedInfo.title}</p>
                                                    <p className={styles.description}>{parsedInfo.info}</p>
                                                    <div className={styles.badgeWrapper}>
                                                        <span className={styles.badge}>{badge}</span>
                                                    </div>
                                                </div>
                                            </a>
                                        </BlurFade>
                                        );
                                    })}
                                    {filteredVideos.length === 0 && (
                                        <div className={styles.loading} style={{ gridColumn: '1 / -1' }}>
                                            해당하는 영상이 없습니다.
                                        </div>
                                    )}
                                </div>
                                {filteredVideos.length > 0 && (
                                    <Pagination 
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                    />
                                )}
                            </>
                        )}
            </SubPageSection>
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
                                            opacity: { duration: 0.2, delay: 0.8 },
                                        },
                                    }}
                                    transition={{
                                        duration: 1,
                                        type: "spring",
                                        stiffness: 100,
                                        damping: 20,
                                    }}
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

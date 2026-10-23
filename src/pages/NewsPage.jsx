import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import Pagination from '../components/ui/Pagination';
import Footer from '../components/Footer';
import styles from './NewsPage.module.css';
import PickerPopover from '../components/ui/PickerPopover';
import PageTopGradient from '../components/PageTopGradient';

// 소식 고르기: 제목("전체")과 오른쪽 화살표를 누르면 예배 영상(미디어룸)과 같은 유리 창이 열린다.
// '전체'는 공지사항 · 교회소식 · 주보만 (성도사업은 따로 골라야 보인다)
const FILTERS = [
    { id: 'all', label: '전체' },
    { id: 'koinonia', label: '공지사항' },
    { id: 'news', label: '교회소식' },
    { id: 'bulletin', label: '주보' },
    { id: 'network', label: '성도사업' },
];
const ALL_CATEGORIES = ['koinonia', 'news', 'bulletin'];
const categoryLabel = (id) => FILTERS.find((f) => f.id === id)?.label || '';


const ChevronDown = () => (
    <svg viewBox="0 0 36 36" aria-hidden="true">
        <circle cx="18" cy="18" r="17" strokeWidth="2" />
        <polyline points="11.9,15.4 18,21.5 24.1,15.4" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// 주요 공지 표시: 압정(고정) 선 아이콘. 교회 안내 '오시는 길' 아이콘과 같은 그리기 (24칸 · 선 1.5 · 둥근 끝)
const PinIcon = () => (
    <svg className={styles.pinIcon} viewBox="0 0 24 24" role="img" aria-label="주요 공지">
        <path d="M8.5 3h7M10 3v5.5l-3 4V14h10v-1.5l-3-4V3M12 14v7" />
    </svg>
);

const CheckIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// '2026. 10. 18.' · '2026-10-18' → '20261018' (정렬용)
const sortableDate = (dateStr) => {
    const parts = String(dateStr || '').split(/[^\d]+/).filter(Boolean);
    if (parts.length < 3) return '00000000';
    return `${parts[0]}${parts[1].padStart(2, '0')}${parts[2].padStart(2, '0')}`;
};

// 목록 날짜: '2026.10.18'
const displayDate = (dateStr) => {
    const parts = String(dateStr || '').split(/[^\d]+/).filter(Boolean);
    if (parts.length < 3) return dateStr || '';
    return `${parts[0]}.${parts[1].padStart(2, '0')}.${parts[2].padStart(2, '0')}`;
};

// 날짜 내림차순, 같은 날이면 등록 시각 내림차순
const byNewest = (a, b) => {
    const dateA = sortableDate(a.date);
    const dateB = sortableDate(b.date);
    if (dateA !== dateB) return dateB.localeCompare(dateA);
    const createdA = a.createdAt?.seconds || 0;
    const createdB = b.createdAt?.seconds || 0;
    if (createdA !== createdB) return createdB - createdA;
    return String(b.id).localeCompare(String(a.id));
};

const NewsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 10;
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pickerOpen, setPickerOpen] = useState(false);
    const pickerRef = useRef(null);
    const triggerRef = useRef(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchPosts();
    }, []);

    // ?tab=koinonia 처럼 들어오면 그 종류로 (예전 /network 주소, 팝업을 바로 연 뒤 배경 등)
    useEffect(() => {
        const tab = new URLSearchParams(location.search).get('tab');
        if (FILTERS.some((f) => f.id === tab)) {
            setActiveTab(tab);
            setCurrentPage(1);
        }
    }, [location.search]);

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

    const fetchPosts = async () => {
        try {
            const q = query(collection(db, 'posts'), orderBy('date', 'desc'));
            const kq = query(collection(db, 'membersNews'), orderBy('createdAt', 'desc'));
            const nq = query(collection(db, 'memberBusiness'), orderBy('createdAt', 'desc'));
            const [querySnapshot, koinoniaSnapshot, networkSnapshot] = await Promise.all([getDocs(q), getDocs(kq), getDocs(nq)]);

            const data = [];
            querySnapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });
            koinoniaSnapshot.forEach((doc) => {
                const docData = doc.data();
                let dateStr = docData.date;
                if (!dateStr && docData.createdAt) {
                    const d = docData.createdAt.toDate();
                    dateStr = `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, '0')}. ${String(d.getDate()).padStart(2, '0')}.`;
                }
                data.push({ id: `koinonia_${doc.id}`, ...docData, category: 'koinonia', date: dateStr });
            });
            networkSnapshot.forEach((doc) => {
                data.push({ id: `network_${doc.id}`, ...doc.data(), category: 'network' });
            });
            setPosts(data);
        } catch (error) {
            console.error('게시물 가져오기 오류:', error);
        } finally {
            setLoading(false);
        }
    };

    const matchesFilter = (post, filterId) =>
        filterId === 'all' ? ALL_CATEGORIES.includes(post.category) : post.category === filterId;

    // 주요 공지: 관리자에서 '주요 공지로 고정'을 체크한 글 (성도사업 제외).
    // 관리자 공지사항 목록에서 정한 순서(pinnedOrder)대로, 순서가 없는 글은 그 뒤에 최신 글부터
    const byPinnedOrder = (a, b) => (a.pinnedOrder ?? Infinity) - (b.pinnedOrder ?? Infinity) || byNewest(a, b);
    const pinnedPosts = posts
        .filter((post) => post.pinned && ALL_CATEGORIES.includes(post.category))
        .sort(byPinnedOrder);
    // 게시물 목록도 관리자 화면처럼 주요 공지를 맨 위에 같은 순서로, 나머지는 최신 글부터
    const matched = posts.filter((post) => matchesFilter(post, activeTab));
    const filteredPosts = [
        ...matched.filter((post) => post.pinned).sort(byPinnedOrder),
        ...matched.filter((post) => !post.pinned).sort(byNewest),
    ];
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage) || 1;
    const currentPosts = filteredPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);
    const activeFilter = FILTERS.find((f) => f.id === activeTab) || FILTERS[0];

    const pickFilter = (id) => {
        setActiveTab(id);
        setCurrentPage(1);
        setPickerOpen(false);
        triggerRef.current?.focus();
    };

    // 세부정보 팝업(PostSheet)은 PostDetailPage가 글을 다시 불러와 그린다
    const handlePostClick = (post) => {
        navigate(`/post/${post.id}`, { state: { background: location } });
    };

    // 성도사업은 날짜 대신 운영 성도
    const metaText = (post) => {
        if (post.category === 'network') return post.author === '관리자' ? '정보 확인 필요' : post.author;
        return displayDate(post.date);
    };

    return (
        <div className={styles.page}>
            <PageTopGradient />
            <section className={styles.hero}>
                <div className={styles.wrap}>
                    <p className={styles.eyebrow}>소식</p>
                    <div className={styles.pickerAnchor} ref={pickerRef}>
                        <h1 className={styles.title}>
                            <button
                                ref={triggerRef}
                                type="button"
                                className={styles.titleButton}
                                aria-haspopup="dialog"
                                aria-expanded={pickerOpen}
                                aria-label={`${activeFilter.label} 소식, 다른 종류 고르기`}
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
                                <PickerPopover className={styles.picker} label="소식 종류 고르기">
                                    {FILTERS.map((filter) => {
                                        const active = filter.id === activeTab;
                                        const count = posts.filter((post) => matchesFilter(post, filter.id)).length;
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
                                </PickerPopover>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </section>

            {/* 주요 공지: 제목만 가로로. 누르면 목록의 '세부정보'와 같은 팝업 */}
            {pinnedPosts.length > 0 && (
                <section className={styles.pinnedSection} aria-labelledby="news-pinned-heading">
                    <div className={styles.wrap}>
                        <h2 id="news-pinned-heading" className={styles.pinnedHeading}>주요 공지</h2>
                        <ul className={styles.pinnedList}>
                            {pinnedPosts.map((post) => (
                                <li key={post.id}>
                                    <button
                                        type="button"
                                        className={styles.pinnedLink}
                                        onClick={() => handlePostClick(post)}
                                    >
                                        {post.title}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            )}

            <section className={styles.listSection}>
                <div className={styles.wrap}>
                    {loading ? (
                        <p className={styles.empty}>소식을 불러오고 있어요.</p>
                    ) : (
                        <>
                            {/* 종류·쪽을 바꾸면 목록만 opacity + translateY(8px) */}
                            <ul key={`${activeTab}-${currentPage}`} className={styles.postList} aria-label={`${activeFilter.label} 소식`}>
                                {currentPosts.map((post) => (
                                    <li key={post.id} className={styles.postItem}>
                                        <span className={styles.category}>{post.pinned && <PinIcon />}{categoryLabel(post.category)}</span>
                                        <h2 className={styles.postTitle}>{post.title}</h2>
                                        {metaText(post) && <span className={styles.meta}>{metaText(post)}</span>}
                                        <button
                                            type="button"
                                            className={styles.detailLink}
                                            aria-label={`${post.title} 세부정보`}
                                            onClick={() => handlePostClick(post)}
                                        >
                                            세부정보
                                        </button>
                                    </li>
                                ))}
                                {filteredPosts.length === 0 && (
                                    <li className={styles.empty}>등록된 소식이 없어요.</li>
                                )}
                            </ul>
                            {filteredPosts.length > 0 && (
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
        </div>
    );
};

export default NewsPage;

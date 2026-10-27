import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy, Timestamp, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import AdminCloseButton from '../../components/ui/AdminCloseButton';
import { db, storage } from '../../firebase';
import { uploadSiteImage } from '../../lib/gallery';
import AdminEditor from '../../components/admin/AdminEditor';
import NoticeAnnouncementEditor from '../../components/admin/NoticeAnnouncementEditor';
import NoticeTablesEditor from '../../components/admin/NoticeTablesEditor';
import { emptyAnnouncement, normalizeAnnouncement, buildAnnouncementContent, normalizeNoticeTable, noticeTablesForStore } from '../../lib/noticeItems';

const AdminMembersNews = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list');
    const [currentPost, setCurrentPost] = useState(null);
    const [saveMessage, setSaveMessage] = useState('');
    
    // Form state
    const [formId, setFormId] = useState('');
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [date, setDate] = useState('');
    const [content, setContent] = useState('');
    const [pinned, setPinned] = useState(false); // 소식 페이지 '주요 공지'에 고정
    // 안내 양식: 기본 정보 · 소개 · 소제목 묶음(notice) + 표 + 덧붙이는 글. notice가 null이면 예전 편집기로 쓴 글
    const [notice, setNotice] = useState(null);
    const [tables, setTables] = useState([]);
    const [extraContent, setExtraContent] = useState('');
    const [images, setImages] = useState([]); 
    const [newFiles, setNewFiles] = useState([]);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'membersNews'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const data = [];
            querySnapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });
            setPosts(data);
        } catch (error) {
            console.error('불러오기 실패:', error);
            alert('데이터를 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNew = () => {
        const today = new Date();
        const formattedDate = `${today.getFullYear()}. ${String(today.getMonth() + 1).padStart(2, '0')}. ${String(today.getDate()).padStart(2, '0')}`;
        setFormId(crypto.randomUUID());
        setTitle('');
        setAuthor('');
        setDate(formattedDate);
        setContent('');
        setNotice(emptyAnnouncement());
        setTables([]);
        setExtraContent('');
        setPinned(false);
        setImages([]);
        setNewFiles([]);
        setCurrentPost(null);
        setViewMode('edit');
    };

    const handleEdit = (post) => {
        setFormId(post.id);
        setCurrentPost(post);
        setTitle(post.title || '');
        setAuthor(post.author || '');
        setDate(post.date || '');
        setContent(post.content || '');
        setNotice(post.notice ? normalizeAnnouncement(post.notice) : null);
        setTables((post.tables || []).map(normalizeNoticeTable));
        setExtraContent(post.extraContent || '');
        setPinned(Boolean(post.pinned));
        setImages(post.imageUrls || []);
        setNewFiles([]);
        setViewMode('edit');
    };

    const handleDelete = async (post) => {
        if (!window.confirm('정말 이 게시물을 삭제하시겠습니까?')) return;
        setLoading(true);
        try {
            if (post.imageUrls && post.imageUrls.length > 0) {
                for (let img of post.imageUrls) {
                    try {
                        let imgUrl = typeof img === 'string' ? img : img.url;
                        if (imgUrl.includes('firebasestorage')) {
                            const imgRef = ref(storage, imgUrl);
                            await deleteObject(imgRef);
                        }
                    } catch (e) {
                        console.error('이미지 삭제 오류:', e);
                    }
                }
            }
            await deleteDoc(doc(db, 'membersNews', post.id));
            fetchPosts();
        } catch (error) {
            console.error('삭제 실패:', error);
            alert('삭제 중 오류가 발생했습니다.');
            setLoading(false);
        }
    };

    const handleRemoveExistingImage = (indexToRemove) => {
        setImages(images.filter((_, idx) => idx !== indexToRemove));
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            setNewFiles([...newFiles, ...Array.from(e.target.files)]);
        }
    };

    const handleRemoveNewFile = (indexToRemove) => {
        setNewFiles(newFiles.filter((_, idx) => idx !== indexToRemove));
    };

    // 예전 편집기로 쓴 공지를 안내 양식으로: 지금 글은 '덧붙이는 글'로 옮겨 잃어버리지 않게
    const switchToNotice = () => {
        setExtraContent(content);
        setNotice(emptyAnnouncement());
        setTables([]);
    };

    // 표를 넣은 가장 최근 공지의 표를 그대로
    const handleLoadLastTables = () => {
        const last = posts.find((post) => post.id !== formId && post.tables?.length);
        if (!last) {
            alert('표를 넣은 지난 공지가 아직 없어요.');
            return;
        }
        if (tables.length && !window.confirm(`지금 표를 '${last.title}'의 표로 바꿀까요?`)) return;
        setTables(last.tables.map((table) => ({ ...normalizeNoticeTable(table), id: crypto.randomUUID() })));
    };

    // 주요 공지는 목록 맨 위에, 정한 순서(pinnedOrder)대로. 순서가 없는 글은 최신 글이 앞
    const byPinnedOrder = (a, b) => (a.pinnedOrder ?? Infinity) - (b.pinnedOrder ?? Infinity)
        || (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
    const pinnedPosts = posts.filter((post) => post.pinned).sort(byPinnedOrder);
    const otherPosts = posts.filter((post) => !post.pinned);
    const nextPinnedOrder = pinnedPosts.reduce((max, post) => Math.max(max, post.pinnedOrder ?? -1), -1) + 1;

    // 주요 공지 순서 바꾸기: 바꾼 순서대로 0, 1, 2 …를 한 번에 저장 (소식 페이지 '주요 공지'도 이 순서)
    const movePinned = async (index, dir) => {
        const next = [...pinnedPosts];
        [next[index], next[index + dir]] = [next[index + dir], next[index]];
        const batch = writeBatch(db);
        next.forEach((post, order) => batch.update(doc(db, 'membersNews', post.id), { pinnedOrder: order }));
        try {
            await batch.commit();
            const orders = Object.fromEntries(next.map((post, order) => [post.id, order]));
            setPosts((prev) => prev.map((post) => (post.id in orders ? { ...post, pinnedOrder: orders[post.id] } : post)));
        } catch (error) {
            console.error('순서 저장 실패:', error);
            alert('순서를 저장하지 못했습니다.');
        }
    };

    const handleSave = async () => {
        if (!title.trim()) { alert('제목을 입력해주세요.'); return; }
        
        setSaveMessage('저장 준비 중...');
        try {
            const uploadedImageUrls = [...images];
            if (newFiles.length > 0) {
                setSaveMessage(`이미지 업로드 중 (0/${newFiles.length})...`);
                for (let i = 0; i < newFiles.length; i++) {
                    uploadedImageUrls.push(await uploadSiteImage(newFiles[i]));
                    setSaveMessage(`이미지 업로드 중 (${i + 1}/${newFiles.length})...`);
                }
            }

            setSaveMessage('게시물 데이터 저장 중...');
            const postData = {
                title,
                author,
                date,
                content,
                imageUrls: uploadedImageUrls,
                pinned,
                // 주요 공지 순서: 이미 고정된 글은 자리 그대로, 새로 고정하면 맨 끝
                ...(pinned ? { pinnedOrder: currentPost?.pinned && currentPost.pinnedOrder != null ? currentPost.pinnedOrder : nextPinnedOrder } : {}),
                createdAt: currentPost?.createdAt || Timestamp.now(),
                views: currentPost?.views || 0,
                isMemberNews: true,
                // 안내 양식으로 쓴 공지는 칸으로 본문을 만들고(기본 정보도 맨 위 목록으로), 다시 고칠 수 있게 칸도 함께 저장
                ...(notice ? {
                    content: buildAnnouncementContent(notice, extraContent, tables, { withFacts: true }),
                    notice: { ...notice, sections: notice.sections.filter((s) => s.title.trim() || s.lines.trim()) },
                    tables: noticeTablesForStore(tables),
                    extraContent,
                } : {}),
            };

            await setDoc(doc(db, 'membersNews', formId), postData);
            alert('게시물이 저장되었습니다.');
            setViewMode('list');
            fetchPosts();
        } catch (error) {
            console.error('저장 실패 상세 오류:', error);
            alert(`저장 중 오류가 발생했습니다.\n에러 내용: ${error.message}`);
        } finally {
            setSaveMessage('');
        }
    };

    if (loading && viewMode === 'list') return <div>데이터를 불러오는 중입니다...</div>;

    if (viewMode === 'edit') {
        return (
            <div style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '24px'}}>{currentPost ? '성도 소식 수정' : '새 성도 소식 작성'}</h2>
                </div>

                <div style={{ display: 'grid', gap: '20px' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px'}}>제목</label>
                            <input 
                                type="text" 
                                value={title} 
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="제목을 입력하세요"
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>
                        <div style={{ width: '200px' }}>
                            <label style={{ display: 'block', marginBottom: '8px'}}>작성자 <span style={{  color: '#6B7280' }}>(부서)</span></label>
                            <input 
                                type="text" 
                                value={author} 
                                onChange={(e) => setAuthor(e.target.value)}
                                placeholder="예: 경조부"
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '16px' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px'}}>작성일자</label>
                        <input 
                            type="date" 
                            value={date ? date.replace(/\.\s*/g, '-').replace(/-$/, '') : ''} 
                            onChange={(e) => {
                                const val = e.target.value;
                                if (!val) {
                                    setDate('');
                                    return;
                                }
                                const [y, m, d] = val.split('-');
                                setDate(`${y}. ${m}. ${d}`);
                            }}
                            style={{ width: '200px', padding: '10px', borderRadius: '4px', border: '1px solid #ddd'}}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={pinned}
                                onChange={(e) => setPinned(e.target.checked)}
                                style={{ width: '18px', height: '18px' }}
                            />
                            주요 공지로 고정 <span style={{  color: '#6B7280' }}>(소식 페이지 맨 위 '주요 공지'에 가로로 보입니다)</span>
                        </label>
                    </div>

                    {notice ? (
                        <>
                            <NoticeAnnouncementEditor notice={notice} onChange={setNotice} />
                            <NoticeTablesEditor tables={tables} onChange={setTables} onLoadLastWeek={handleLoadLastTables} loadLabel="지난 공지 표 불러오기" />
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px'}}>
                                    덧붙이는 글 <span style={{  color: '#6B7280' }}>(선택. 양식 칸에 맞지 않는 것)</span>
                                </label>
                                <AdminEditor
                                    key={`${formId}-extra`}
                                    initialValue={extraContent}
                                    onChange={setExtraContent}
                                />
                            </div>
                        </>
                    ) : (
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px'}}>내용</label>
                            <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#6B7280' }}>
                                예전 방식으로 쓴 글이에요.{' '}
                                <button type="button" onClick={switchToNotice} style={{ padding: '4px 10px', borderRadius: '4px', border: '1px solid #D1D5DB', backgroundColor: '#fff', cursor: 'pointer' }}>
                                    안내 양식으로 바꾸기
                                </button>
                                {' '}(지금 글은 '덧붙이는 글'로 옮겨져요)
                            </p>
                            <AdminEditor 
                                key={formId}
                                initialValue={content}
                                onChange={setContent}
                            />
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px'}}>이미지 첨부</label>
                        {images.length > 0 && (
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                    {images.map((img, idx) => (
                                        <div key={idx} style={{ position: 'relative', width: '100px', height: '100px', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                                            <img src={typeof img === 'string' ? img : img.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <AdminCloseButton 
                                                onClick={() => handleRemoveExistingImage(idx)}
                                                style={{ position: 'absolute', top: '4px', right: '4px' }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <input type="file" multiple accept="image/*,.webp,.jpg,.jpeg,.png,.gif,.heic,.heif" onChange={handleFileChange} />
                        {newFiles.length > 0 && (
                            <ul style={{ listStyle: 'none', padding: 0, marginTop: '8px' }}>
                                {newFiles.map((file, idx) => (
                                    <li key={idx} style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                                        <span style={{ marginRight: '12px' }}>{file.name}</span>
                                        <button onClick={() => handleRemoveNewFile(idx)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>[삭제]</button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button 
                            onClick={() => setViewMode('list')}
                            style={{ padding: '12px 24px', borderRadius: '4px', border: '1px solid #D1D5DB', backgroundColor: '#fff', cursor: 'pointer', fontSize: '16px'}}
                        >
                            취소
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={!!saveMessage}
                            style={{ backgroundColor: '#10B981', color: '#fff', padding: '12px 24px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '16px'}}
                        >
                            {saveMessage ? saveMessage : '저장하기'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px'}}>공지사항 관리</h2>
                <button 
                    onClick={handleCreateNew}
                    style={{ backgroundColor: '#3B82F6', color: '#fff', padding: '10px 20px', borderRadius: '4px', border: 'none', cursor: 'pointer'}}
                >
                    + 새 소식 작성
                </button>
            </div>

            <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#F9FAFB', textAlign: 'left', borderBottom: '1px solid #E5E7EB' }}>
                            <th style={{ padding: '16px' }}>제목</th>
                            <th style={{ padding: '16px', width: '200px' }}>작성자(부서)</th>
                            <th style={{ padding: '16px', width: '160px' }}>작성일</th>
                            <th style={{ padding: '16px', width: '100px', textAlign: 'center' }}>조회수</th>
                            <th style={{ padding: '16px', width: '260px', textAlign: 'center' }}>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#6B7280' }}>등록된 소식이 없습니다.</td></tr>
                        ) : [...pinnedPosts, ...otherPosts].map((post) => (
                            <tr key={post.id} style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: post.pinned ? '#F8FBFF' : undefined }}>
                                <td style={{ padding: '16px'}}>{post.pinned && <span style={{ marginRight: '8px', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#E0F2FE', color: '#075985', fontSize: '13px' }}>주요 공지</span>}{post.title}</td>
                                <td style={{ padding: '16px' }}>{post.author}</td>
                                <td style={{ padding: '16px', color: '#6B7280', fontSize: '16px' }}>{post.date}</td>
                                <td style={{ padding: '16px', textAlign: 'center', color: '#6B7280' }}>{post.views || 0}</td>
                                <td style={{ padding: '16px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                    {/* 주요 공지만 순서 바꾸기 */}
                                    {post.pinned && (
                                        <>
                                            <button onClick={() => movePinned(pinnedPosts.indexOf(post), -1)} disabled={pinnedPosts.indexOf(post) === 0} style={{ backgroundColor: '#F3F4F6', border: '1px solid #D1D5DB', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', opacity: pinnedPosts.indexOf(post) === 0 ? 0.4 : 1 }} aria-label={`'${post.title}' 주요 공지 순서 위로`}>↑</button>
                                            <button onClick={() => movePinned(pinnedPosts.indexOf(post), 1)} disabled={pinnedPosts.indexOf(post) === pinnedPosts.length - 1} style={{ backgroundColor: '#F3F4F6', border: '1px solid #D1D5DB', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', opacity: pinnedPosts.indexOf(post) === pinnedPosts.length - 1 ? 0.4 : 1 }} aria-label={`'${post.title}' 주요 공지 순서 아래로`}>↓</button>
                                        </>
                                    )}
                                    <button onClick={() => handleEdit(post)} style={{ backgroundColor: '#F3F4F6', border: '1px solid #D1D5DB', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>수정</button>
                                    <button onClick={() => handleDelete(post)} style={{ backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>삭제</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminMembersNews;

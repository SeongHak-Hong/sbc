import React, { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import AdminCloseButton from '../../components/ui/AdminCloseButton';
import { db, storage } from '../../firebase';
import AdminEditor from '../../components/admin/AdminEditor';

const AdminPosts = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'edit'
    const [currentPost, setCurrentPost] = useState(null);
    const [saveMessage, setSaveMessage] = useState('');
    
    // Form state
    const [formId, setFormId] = useState('');
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('news');
    const [date, setDate] = useState('');
    const [content, setContent] = useState('');
    const [images, setImages] = useState([]); // [{url, path}] or string
    const [newFiles, setNewFiles] = useState([]); // array of File objects

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'posts'), orderBy('date', 'desc'));
            const querySnapshot = await getDocs(q);
            const data = [];
            querySnapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });
            setPosts(data);
        } catch (error) {
            console.error('게시물 불러오기 실패:', error);
            alert('데이터를 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNew = () => {
        const today = new Date();
        const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        setFormId(crypto.randomUUID());
        setTitle('');
        setCategory('news');
        setDate(formattedDate);
        setContent('');
        setImages([]);
        setNewFiles([]);
        setCurrentPost(null);
        setViewMode('edit');
    };

    const handleEdit = (post) => {
        setFormId(post.id);
        setCurrentPost(post);
        setTitle(post.title || '');
        setCategory(post.category || 'news');
        setDate(post.date || '');
        setContent(post.content || '');
        setImages(post.imageUrls || []);
        setNewFiles([]);
        setViewMode('edit');
    };

    const handleDelete = async (post) => {
        if (!window.confirm('정말 이 게시물을 삭제하시겠습니까? (첨부된 이미지도 삭제됩니다)')) return;
        setLoading(true);
        try {
            // Delete images from storage
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
            // Delete doc
            await deleteDoc(doc(db, 'posts', post.id));
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

    const handleSave = async () => {
        let finalTitle = title.trim();
        if (!finalTitle) {
            if (!date) {
                alert('해당 주일 날짜를 입력해주세요.');
                return;
            }
            const dateStr = date.replace(/\.\s*/g, '-').replace(/-$/, '');
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) {
                alert('유효한 날짜를 입력해주세요.');
                return;
            }
            const m = d.getMonth() + 1;
            const weekNum = Math.ceil(d.getDate() / 7);
            const weekLabels = ['첫째', '둘째', '셋째', '넷째', '다섯째'];
            const weekStr = weekLabels[weekNum - 1] || `${weekNum}째`;
            finalTitle = `${m}월 ${weekStr} 주일`;
        }
        
        setSaveMessage('저장 준비 중...');
        try {
            // Upload new files
            const uploadedImageUrls = [...images];
            
            if (newFiles.length > 0) {
                const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
                const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
                if (!cloudName || !uploadPreset) {
                    throw new Error("Cloudinary API 키가 설정되지 않았습니다. .env 파일을 확인해주세요.");
                }

                setSaveMessage(`이미지 업로드 중 (0/${newFiles.length})...`);
                for (let i = 0; i < newFiles.length; i++) {
                    const file = newFiles[i];
                    
                    // 이미지 압축 적용 (넉넉하게 원본 화질 유지)
                    const options = {
                        maxSizeMB: 2,
                        maxWidthOrHeight: 1920,
                        useWebWorker: true,
                    };
                    const compressedFile = await imageCompression(file, options);
                    
                    const formData = new FormData();
                    formData.append('file', compressedFile);
                    formData.append('upload_preset', uploadPreset);
                    
                    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                        method: 'POST',
                        body: formData
                    });
                    
                    const result = await response.json();
                    
                    if (response.ok) {
                        const optimizedUrl = result.secure_url.replace('/upload/', '/upload/f_auto,q_auto/');
                        uploadedImageUrls.push(optimizedUrl);
                    } else {
                        throw new Error(`이미지 업로드 실패: ${result.error?.message || '알 수 없는 오류'}`);
                    }
                    setSaveMessage(`이미지 업로드 중 (${i + 1}/${newFiles.length})...`);
                }
            }

            setSaveMessage('게시물 데이터 저장 중...');
            const postData = {
                title: finalTitle,
                category,
                date,
                content,
                imageUrls: uploadedImageUrls,
                createdAt: currentPost?.createdAt || Timestamp.now(),
                views: currentPost?.views || 0
            };

            await setDoc(doc(db, 'posts', formId), postData);
            alert('게시물이 저장되었습니다.');
            setViewMode('list');
            fetchPosts();
        } catch (error) {
            console.error('게시물 저장 실패:', error);
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
                    <h2 style={{ fontSize: '24px'}}>{currentPost ? '게시물 수정' : '새 게시물 작성'}</h2>
                </div>

                <div style={{ display: 'grid', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px'}}>분류</label>
                        <select 
                            value={category} 
                            onChange={(e) => setCategory(e.target.value)}
                            style={{ padding: '10px', width: '200px', borderRadius: '4px', border: '1px solid #ddd' }}
                        >
                            <option value="news">교회 소식</option>
                            <option value="bulletin">주보</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px'}}>
                            제목 <span style={{  color: '#6B7280' }}>(생략 가능, 공란이면 몇째 주일인지 자동 표기됩니다)</span>
                        </label>
                        <input 
                            type="text" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="제목을 입력하세요"
                            style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '18px',  color: '#111827' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px'}}>해당 주일 날짜 <span style={{  color: '#6B7280' }}>(예: 2026-07-05)</span></label>
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
                        <label style={{ display: 'block', marginBottom: '8px'}}>
                            내용 <span style={{  color: '#6B7280' }}>(주보의 경우 생략 가능)</span>
                        </label>
                        <AdminEditor 
                            key={formId}
                            initialValue={content}
                            onChange={setContent}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px'}}>이미지 첨부 <span style={{  color: '#6B7280' }}>(여러 장 가능)</span></label>
                        
                        {/* Existing Images */}
                        {images.length > 0 && (
                            <div style={{ marginBottom: '16px' }}>
                                <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>기존 업로드된 이미지:</p>
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

                        {/* New Images */}
                        <div style={{ marginBottom: '16px' }}>
                            <input 
                                type="file" 
                                multiple 
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{ padding: '8px 0' }}
                            />
                            {newFiles.length > 0 && (
                                <div style={{ marginTop: '12px' }}>
                                    <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>새로 추가할 이미지:</p>
                                    <ul style={{ listStyle: 'none', padding: 0 }}>
                                        {newFiles.map((file, idx) => (
                                            <li key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '4px', fontSize: '14px' }}>
                                                <span style={{ marginRight: '12px' }}>{file.name}</span>
                                                <button onClick={() => handleRemoveNewFile(idx)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>[삭제]</button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
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
                <h2 style={{ fontSize: '24px'}}>나눔터 (소식/주보) 관리</h2>
                <button 
                    onClick={handleCreateNew}
                    style={{ backgroundColor: '#3B82F6', color: '#fff', padding: '10px 20px', borderRadius: '4px', border: 'none', cursor: 'pointer'}}
                >
                    + 새 게시물 작성
                </button>
            </div>

            <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#F9FAFB', textAlign: 'left', borderBottom: '1px solid #E5E7EB' }}>
                            <th style={{ padding: '16px', width: '100px' }}>분류</th>
                            <th style={{ padding: '16px' }}>제목</th>
                            <th style={{ padding: '16px', width: '160px' }}>작성일</th>
                            <th style={{ padding: '16px', width: '100px', textAlign: 'center' }}>조회수</th>
                            <th style={{ padding: '16px', width: '180px', textAlign: 'center' }}>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#6B7280' }}>등록된 게시물이 없습니다.</td>
                            </tr>
                        ) : posts.map(post => (
                            <tr key={post.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                                <td style={{ padding: '16px' }}>
                                    <span style={{ 
                                        backgroundColor: post.category === 'news' ? '#DBEAFE' : '#FEF3C7', 
                                        color: post.category === 'news' ? '#1E3A8A' : '#92400E',
                                        padding: '4px 8px', borderRadius: '4px', fontSize: '13px'}}>
                                        {post.category === 'news' ? '소식' : '주보'}
                                    </span>
                                </td>
                                <td style={{ padding: '16px'}}>{post.title}</td>
                                <td style={{ padding: '16px', color: '#6B7280', fontSize: '16px' }}>{post.date}</td>
                                <td style={{ padding: '16px', textAlign: 'center', color: '#6B7280' }}>{post.views || 0}</td>
                                <td style={{ padding: '16px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                    <button 
                                        onClick={() => handleEdit(post)}
                                        style={{ backgroundColor: '#F3F4F6', border: '1px solid #D1D5DB', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                                    >수정</button>
                                    <button 
                                        onClick={() => handleDelete(post)}
                                        style={{ backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                                    >삭제</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPosts;

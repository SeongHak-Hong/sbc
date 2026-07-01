import React, { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import AdminCloseButton from '../../components/ui/AdminCloseButton';
import { db, storage } from '../../firebase';
import AdminEditor from '../../components/admin/AdminEditor';

const AdminMemberBusiness = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list');
    const [currentPost, setCurrentPost] = useState(null);
    const [saveMessage, setSaveMessage] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 10;
    
    // Form state
    const [formId, setFormId] = useState('');
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [date, setDate] = useState('');
    const [content, setContent] = useState('');
    const [images, setImages] = useState([]); 
    const [newFiles, setNewFiles] = useState([]);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'memberBusiness'), orderBy('createdAt', 'desc'));
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
        setImages(post.imageUrls || []);
        setNewFiles([]);
        setViewMode('edit');
    };

    const handleDelete = async (post) => {
        if (!window.confirm('정말 이 사업체를 삭제하시겠습니까?')) return;
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
            await deleteDoc(doc(db, 'memberBusiness', post.id));
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
        if (!title.trim()) { alert('상호명을 입력해주세요.'); return; }
        
        setSaveMessage('저장 준비 중...');
        try {
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
                    
                    // 이미지 압축 적용
                    const options = {
                        maxSizeMB: 0.2,
                        maxWidthOrHeight: 1000,
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
                        uploadedImageUrls.push(result.secure_url);
                    } else {
                        throw new Error(`이미지 업로드 실패: ${result.error?.message || '알 수 없는 오류'}`);
                    }
                    
                    setSaveMessage(`이미지 업로드 중 (${i + 1}/${newFiles.length})...`);
                }
            }

            setSaveMessage('데이터 저장 중...');
            const postData = {
                title,
                author,
                date,
                content,
                imageUrls: uploadedImageUrls,
                createdAt: currentPost?.createdAt || Timestamp.now(),
                views: currentPost?.views || 0,
                isMemberBusiness: true
            };

            await setDoc(doc(db, 'memberBusiness', formId), postData);
            alert('사업체가 저장되었습니다.');
            setViewMode('list');
            fetchPosts();
        } catch (error) {
            console.error('저장 실패:', error);
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
                    <h2 style={{ fontSize: '24px', fontWeight: '700' }}>{currentPost ? '사업체 정보 수정' : '새 사업체 등록'}</h2>
                </div>

                <div style={{ display: 'grid', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>상호명 / 제목</label>
                        <input 
                            type="text" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="사업체 명을 입력하세요"
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>대표자 <span style={{ fontWeight: 'normal', color: '#6B7280' }}>(성도이름)</span></label>
                        <input 
                            type="text" 
                            value={author} 
                            onChange={(e) => setAuthor(e.target.value)}
                            placeholder="예: 홍길동 성도"
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '16px' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>작성일자</label>
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
                            style={{ width: '200px', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>상세 소개글</label>
                        <AdminEditor 
                            key={formId}
                            initialValue={content}
                            onChange={setContent}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>이미지 첨부 <span style={{ fontWeight: 'normal', color: '#6B7280' }}>(간판, 메뉴 등)</span></label>
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
                        <input type="file" multiple accept="image/*" onChange={handleFileChange} />
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
                            style={{ padding: '12px 24px', borderRadius: '4px', border: '1px solid #D1D5DB', backgroundColor: '#fff', cursor: 'pointer', fontSize: '16px', fontWeight: '500' }}
                        >
                            취소
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={!!saveMessage}
                            style={{ backgroundColor: '#10B981', color: '#fff', padding: '12px 24px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: '600' }}
                        >
                            {saveMessage ? saveMessage : '저장하기'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const totalPages = Math.ceil(posts.length / postsPerPage) || 1;
    const currentPosts = posts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700' }}>성도 사업체 관리</h2>
                <button 
                    onClick={handleCreateNew}
                    style={{ backgroundColor: '#3B82F6', color: '#fff', padding: '10px 20px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: '500' }}
                >
                    + 새 사업체 등록
                </button>
            </div>

            <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#F9FAFB', textAlign: 'left', borderBottom: '1px solid #E5E7EB' }}>
                            <th style={{ padding: '16px' }}>상호명 / 제목</th>
                            <th style={{ padding: '16px', width: '200px' }}>성도 이름</th>
                            <th style={{ padding: '16px', width: '160px' }}>작성일</th>
                            <th style={{ padding: '16px', width: '100px', textAlign: 'center' }}>조회수</th>
                            <th style={{ padding: '16px', width: '180px', textAlign: 'center' }}>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentPosts.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#6B7280' }}>등록된 사업체가 없습니다.</td></tr>
                        ) : currentPosts.map(post => (
                            <tr key={post.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                                <td style={{ padding: '16px', fontWeight: '500' }}>{post.title}</td>
                                <td style={{ padding: '16px' }}>{post.author}</td>
                                <td style={{ padding: '16px', color: '#6B7280', fontSize: '16px' }}>{post.date}</td>
                                <td style={{ padding: '16px', textAlign: 'center', color: '#6B7280' }}>{post.views || 0}</td>
                                <td style={{ padding: '16px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                    <button onClick={() => handleEdit(post)} style={{ backgroundColor: '#F3F4F6', border: '1px solid #D1D5DB', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>수정</button>
                                    <button onClick={() => handleDelete(post)} style={{ backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>삭제</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination UI */}
            {posts.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '24px', gap: '8px' }}>
                    <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #D1D5DB', backgroundColor: currentPage === 1 ? '#F3F4F6' : '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                    >
                        이전
                    </button>
                    
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {[...Array(totalPages)].map((_, i) => (
                            <button 
                                key={i + 1}
                                onClick={() => setCurrentPage(i + 1)}
                                style={{ 
                                    padding: '8px 16px', 
                                    borderRadius: '4px', 
                                    border: currentPage === i + 1 ? '1px solid #3B82F6' : '1px solid #D1D5DB', 
                                    backgroundColor: currentPage === i + 1 ? '#EFF6FF' : '#fff', 
                                    color: currentPage === i + 1 ? '#2563EB' : '#374151',
                                    fontWeight: currentPage === i + 1 ? '600' : '400',
                                    cursor: 'pointer' 
                                }}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>

                    <button 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #D1D5DB', backgroundColor: currentPage === totalPages ? '#F3F4F6' : '#fff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                    >
                        다음
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminMemberBusiness;

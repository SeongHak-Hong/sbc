import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { uploadGalleryPhoto, deleteGalleryPhotos, galleryImageUrl } from '../../lib/gallery';

// 앨범은 Firestore nextgenGallery/{albumId}, 사진 파일은 Cloudflare R2 에 있다 (src/lib/gallery.js).
const DEPT_ORDER = { all: 0, kindergarten: 1, elementary: 2, youth: 3, youngadults: 4 };
const UPLOAD_CONCURRENCY = 3;

const today = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const formatDate = (value) => {
    const parts = (value || '').split('-');
    return parts.length >= 3 ? `${parts[0]}. ${parts[1]}. ${parts[2]}.` : value || '-';
};

const coverOf = (album) => album.photos?.find((photo) => photo.id === album.cover) || album.photos?.[0];

const labelStyle = { display: 'block', fontSize: '14px', color: '#475569', marginBottom: '4px' };
const inputStyle = { width: '100%', padding: '0 12px', height: '48px', border: '1px solid #CBD5E1', borderRadius: '4px', boxSizing: 'border-box', backgroundColor: '#fff' };
const smallButtonStyle = { fontSize: '10px', padding: '2px 4px', backgroundColor: '#F3F4F6', color: '#1F2937', border: '1px solid #D1D5DB', borderRadius: '2px', cursor: 'pointer' };

const AdminNextGenGallery = () => {
    const [albums, setAlbums] = useState([]);
    const [deptNames, setDeptNames] = useState({ all: '다음세대 전체' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    // editing: { id: string | null, dept, title, date, photos, cover } | null
    const [editing, setEditing] = useState(null);
    // 편집을 시작할 때 이미 저장돼 있던 사진. 이걸로 '새로 올린 사진'과 '앨범에서 뺀 사진'을 가린다.
    const [savedPhotos, setSavedPhotos] = useState([]);
    const [progress, setProgress] = useState(null); // { done, total }

    const savedIds = new Set(savedPhotos.map((photo) => photo.id));
    const unsavedUploads = editing ? editing.photos.filter((photo) => !savedIds.has(photo.id)) : [];
    const hasUnsavedUploads = unsavedUploads.length > 0;

    useEffect(() => {
        const load = async () => {
            try {
                const [albumSnapshot, deptSnapshot] = await Promise.all([
                    getDocs(query(collection(db, 'nextgenGallery'), orderBy('date', 'desc'))),
                    getDocs(collection(db, 'nextgen')),
                ]);
                setAlbums(albumSnapshot.docs.map((albumDoc) => ({ id: albumDoc.id, ...albumDoc.data() })));
                const names = { all: '다음세대 전체' };
                deptSnapshot.forEach((deptDoc) => {
                    names[deptDoc.id] = deptDoc.data().name || deptDoc.id;
                });
                setDeptNames(names);
            } catch (error) {
                console.error('다음세대 갤러리 불러오기 실패:', error);
                alert('데이터를 불러오지 못했습니다.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // 새로 올린 사진을 저장하지 않고 창을 닫으려 하면 한 번 묻는다
    useEffect(() => {
        if (!hasUnsavedUploads) return;
        const warn = (event) => {
            event.preventDefault();
            event.returnValue = '';
        };
        window.addEventListener('beforeunload', warn);
        return () => window.removeEventListener('beforeunload', warn);
    }, [hasUnsavedUploads]);

    // 저장하지 않고 다른 관리 메뉴로 나가면 새로 올린 사진 파일을 지운다
    const unsavedRef = useRef([]);
    useEffect(() => {
        unsavedRef.current = unsavedUploads;
    });
    useEffect(() => () => {
        if (unsavedRef.current.length > 0) {
            deleteGalleryPhotos(unsavedRef.current).catch((error) => console.error('사진 파일 삭제 실패:', error));
        }
    }, []);

    const startEditing = (album) => {
        setEditing(album
            ? { id: album.id, dept: album.dept, title: album.title, date: album.date, photos: album.photos || [], cover: album.cover || '' }
            : { id: null, dept: '', title: '', date: today(), photos: [], cover: '' });
        setSavedPhotos(album?.photos || []);
    };

    const updateField = (field, value) => {
        setEditing((prev) => ({ ...prev, [field]: value }));
    };

    const handleUpload = async (event) => {
        const files = Array.from(event.target.files || []);
        event.target.value = ''; // 같은 사진을 다시 고를 수 있게 비운다
        if (files.length === 0) return;

        const results = new Array(files.length);
        const failed = [];
        let next = 0;
        setProgress({ done: 0, total: files.length });

        // 3장씩 동시에 줄이고 올린다. 순서는 고른 순서대로 유지한다.
        const worker = async () => {
            while (next < files.length) {
                const index = next++;
                const file = files[index];
                try {
                    results[index] = await uploadGalleryPhoto(file);
                } catch (error) {
                    console.error('사진 업로드 실패:', file.name, error);
                    failed.push(`${file.name} (${error.message})`);
                }
                setProgress((prev) => ({ ...prev, done: prev.done + 1 }));
            }
        };
        await Promise.all(Array.from({ length: Math.min(UPLOAD_CONCURRENCY, files.length) }, worker));

        const uploaded = results.filter(Boolean);
        setEditing((prev) => ({
            ...prev,
            photos: [...prev.photos, ...uploaded],
            cover: prev.cover || uploaded[0]?.id || '',
        }));
        setProgress(null);
        if (failed.length > 0) {
            alert(`올리지 못한 사진이 ${failed.length}장 있습니다.\n\n${failed.join('\n')}`);
        }
    };

    const removePhoto = (photo) => {
        // 이번에 새로 올린 사진은 바로 지우고, 저장돼 있던 사진은 '저장'을 누를 때 지운다
        if (!savedIds.has(photo.id)) {
            deleteGalleryPhotos([photo]).catch((error) => console.error('사진 파일 삭제 실패:', error));
        }
        setEditing((prev) => {
            const photos = prev.photos.filter((item) => item.id !== photo.id);
            return { ...prev, photos, cover: prev.cover === photo.id ? (photos[0]?.id || '') : prev.cover };
        });
    };

    const handleCancel = () => {
        if (hasUnsavedUploads && !window.confirm(`저장하지 않은 사진이 ${unsavedUploads.length}장 있습니다. 취소하면 새로 올린 사진은 지워집니다.`)) return;
        deleteGalleryPhotos(unsavedUploads).catch((error) => console.error('사진 파일 삭제 실패:', error));
        setEditing(null);
        setSavedPhotos([]);
    };

    const handleSave = async () => {
        const title = editing.title.trim();
        if (!editing.dept || !title || !editing.date) {
            alert('부서, 앨범 제목, 날짜를 모두 입력해 주세요.');
            return;
        }
        if (editing.photos.length === 0) {
            alert('사진을 한 장 이상 올려 주세요.');
            return;
        }

        setSaving(true);
        const data = {
            dept: editing.dept,
            title,
            date: editing.date,
            photos: editing.photos,
            cover: editing.cover || editing.photos[0].id,
            updatedAt: serverTimestamp(),
        };
        let id = editing.id;
        try {
            if (id) {
                await updateDoc(doc(db, 'nextgenGallery', id), data);
            } else {
                id = (await addDoc(collection(db, 'nextgenGallery'), { ...data, createdAt: serverTimestamp() })).id;
            }
        } catch (error) {
            console.error('앨범 저장 실패:', error);
            alert('저장 중 오류가 발생했습니다.');
            setSaving(false);
            return;
        }

        // 앨범에서 뺀 사진 파일은 저장이 끝난 뒤에 지운다
        const keptIds = new Set(editing.photos.map((photo) => photo.id));
        const removed = savedPhotos.filter((photo) => !keptIds.has(photo.id));
        deleteGalleryPhotos(removed).catch((error) => console.error('사진 파일 삭제 실패:', error));

        setAlbums((prev) => [...prev.filter((album) => album.id !== id), { id, ...data }]
            .sort((a, b) => b.date.localeCompare(a.date)));
        setEditing(null);
        setSavedPhotos([]);
        setSaving(false);
        alert('앨범이 저장되었습니다.');
    };

    const handleDeleteAlbum = async (album) => {
        if (!window.confirm(`'${album.title}' 앨범과 사진 ${album.photos?.length || 0}장을 모두 삭제하시겠습니까?`)) return;
        try {
            await deleteDoc(doc(db, 'nextgenGallery', album.id));
        } catch (error) {
            console.error('앨범 삭제 실패:', error);
            alert('삭제 중 오류가 발생했습니다.');
            return;
        }
        deleteGalleryPhotos(album.photos || []).catch((error) => console.error('사진 파일 삭제 실패:', error));
        setAlbums((prev) => prev.filter((item) => item.id !== album.id));
    };

    if (loading) return <div>데이터를 불러오는 중입니다...</div>;

    const deptOptions = Object.keys(deptNames).sort((a, b) => (DEPT_ORDER[a] ?? 99) - (DEPT_ORDER[b] ?? 99));
    const busy = Boolean(progress) || saving;

    return (
        <div>
            <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>다음세대 갤러리</h2>

            {!editing && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                    <button
                        onClick={() => startEditing(null)}
                        style={{ backgroundColor: '#3B82F6', color: '#fff', padding: '10px 20px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
                    >
                        + 새 앨범 만들기
                    </button>
                </div>
            )}

            {/* 앨범 편집 뷰 */}
            {editing && (
                <div style={{ border: '1px solid #3B82F6', padding: '24px', borderRadius: '8px', backgroundColor: '#F8FAFC', marginBottom: '32px' }}>
                    <div style={{ marginBottom: '24px', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
                        <h5 style={{ margin: 0, fontSize: '18px', color: '#1E40AF' }}>{editing.id ? '앨범 수정' : '새 앨범'}</h5>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                        <div style={{ flex: 1 }}>
                            <label htmlFor="gallery-dept" style={labelStyle}>부서 (필수)</label>
                            <select
                                id="gallery-dept"
                                value={editing.dept}
                                onChange={(e) => updateField('dept', e.target.value)}
                                style={{ ...inputStyle, border: '1px solid #3B82F6' }}
                            >
                                <option value="" disabled>부서를 선택하세요</option>
                                {deptOptions.map((deptId) => <option key={deptId} value={deptId}>{deptNames[deptId]}</option>)}
                            </select>
                        </div>
                        <div style={{ flex: 2 }}>
                            <label htmlFor="gallery-title" style={labelStyle}>앨범 제목</label>
                            <input id="gallery-title" type="text" value={editing.title} onChange={(e) => updateField('title', e.target.value)} placeholder="예: 2026 여름 수련회" style={inputStyle} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label htmlFor="gallery-date" style={labelStyle}>날짜</label>
                            <input id="gallery-date" type="date" value={editing.date} onChange={(e) => updateField('date', e.target.value)} style={inputStyle} />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="gallery-photos" style={labelStyle}>
                            사진 올리기 {progress && <span style={{ color: '#6B7280' }}>(올리는 중... {progress.done} / {progress.total}장)</span>}
                        </label>
                        <input
                            id="gallery-photos"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleUpload}
                            disabled={busy}
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '4px', boxSizing: 'border-box', backgroundColor: '#fff', cursor: busy ? 'not-allowed' : 'pointer', marginBottom: '8px' }}
                        />
                        <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 8px' }}>
                            여러 장을 한꺼번에 고를 수 있습니다. 사진은 자동으로 줄여서 올라갑니다. (지금 {editing.photos.length}장)
                        </p>
                        {editing.photos.length > 0 && (
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {editing.photos.map((photo, index) => {
                                    const isCover = (editing.cover || editing.photos[0].id) === photo.id;
                                    return (
                                        <div key={photo.id} style={{ position: 'relative', border: isCover ? '2px solid #3B82F6' : '1px solid #ddd', borderRadius: '4px', padding: '4px', backgroundColor: '#fff' }}>
                                            {isCover && <span style={{ position: 'absolute', top: 0, left: 0, backgroundColor: '#3B82F6', color: '#fff', fontSize: '10px', padding: '2px 4px', borderRadius: '2px' }}>대표 사진</span>}
                                            <img src={galleryImageUrl(photo.thumb)} alt={`사진 ${index + 1}`} style={{ height: '80px', width: 'auto', borderRadius: '2px', display: 'block', marginBottom: '4px' }} />
                                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                                {!isCover && (
                                                    <button onClick={() => updateField('cover', photo.id)} disabled={busy} style={smallButtonStyle}>대표로</button>
                                                )}
                                                <button onClick={() => removePhoto(photo)} disabled={busy} style={{ ...smallButtonStyle, backgroundColor: '#EF4444', color: '#fff', border: 'none' }}>삭제</button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid #E5E7EB', paddingTop: '16px', marginTop: '24px' }}>
                        <button
                            onClick={handleCancel}
                            disabled={busy}
                            style={{ backgroundColor: '#fff', color: '#4B5563', border: '1px solid #D1D5DB', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
                        >취소</button>
                        <button
                            onClick={handleSave}
                            disabled={busy}
                            style={{ backgroundColor: '#10B981', color: '#fff', padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
                        >
                            {saving ? '저장중...' : '저장'}
                        </button>
                    </div>
                </div>
            )}

            {/* 앨범 목록 뷰 */}
            {!editing && (
                <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#F9FAFB', textAlign: 'left', borderBottom: '1px solid #E5E7EB' }}>
                                <th style={{ padding: '16px', width: '96px', textAlign: 'center' }}>대표 사진</th>
                                <th style={{ padding: '16px', width: '120px', textAlign: 'center' }}>부서</th>
                                <th style={{ padding: '16px' }}>앨범 제목</th>
                                <th style={{ padding: '16px', width: '140px' }}>날짜</th>
                                <th style={{ padding: '16px', width: '80px', textAlign: 'center' }}>사진</th>
                                <th style={{ padding: '16px', width: '180px', textAlign: 'center' }}>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {albums.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#6B7280' }}>등록된 앨범이 없습니다.</td>
                                </tr>
                            ) : albums.map((album) => {
                                const cover = coverOf(album);
                                return (
                                    <tr key={album.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                                        <td style={{ padding: '8px 16px' }}>
                                            {cover && <img src={galleryImageUrl(cover.thumb)} alt="" style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '4px', display: 'block', margin: '0 auto' }} />}
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'center' }}>
                                            <span style={{ backgroundColor: '#F1F5F9', color: '#475569', padding: '4px 8px', borderRadius: '4px', fontSize: '13px' }}>
                                                {deptNames[album.dept] || album.dept}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px' }}>{album.title}</td>
                                        <td style={{ padding: '16px', color: '#6B7280' }}>{formatDate(album.date)}</td>
                                        <td style={{ padding: '16px', textAlign: 'center', color: '#6B7280' }}>{album.photos?.length || 0}장</td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                                <button
                                                    onClick={() => startEditing(album)}
                                                    style={{ backgroundColor: '#F3F4F6', border: '1px solid #D1D5DB', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                                                >수정</button>
                                                <button
                                                    onClick={() => handleDeleteAlbum(album)}
                                                    style={{ backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                                                >삭제</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminNextGenGallery;

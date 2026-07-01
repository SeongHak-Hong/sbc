import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import AdminCloseButton from '../../components/ui/AdminCloseButton';
import { db } from '../../firebase';
import AdminEditor from '../../components/admin/AdminEditor';

const AdminSchedule = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'edit'
    const [currentId, setCurrentId] = useState('');
    
    // Form state
    const [month, setMonth] = useState(''); // e.g. 2026년 5월
    const [date, setDate] = useState(''); // e.g. 15
    const [day, setDay] = useState('일요일');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');
    const [meta, setMeta] = useState('');
    const [saveMessage, setSaveMessage] = useState('');
    const [images, setImages] = useState([]);
    const [newFiles, setNewFiles] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedEndDate, setSelectedEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            // Fetch all schedules
            const q = query(collection(db, 'schedules'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const data = [];
            querySnapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });
            
            // Sort by schedule date (descending)
            data.sort((a, b) => {
                const getVal = (item) => {
                    let y = 0, m = 0;
                    const match = item.month?.match(/(\d+)년\s*(\d+)월/);
                    if (match) {
                        y = parseInt(match[1], 10);
                        m = parseInt(match[2], 10);
                    }
                    const d = parseInt(item.date, 10) || 0;
                    return y * 10000 + m * 100 + d;
                };
                return getVal(b) - getVal(a);
            });
            setSchedules(data);
        } catch (error) {
            console.error('일정 불러오기 실패:', error);
            alert('데이터를 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNew = () => {
        setCurrentId(crypto.randomUUID());
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const d = String(today.getDate()).padStart(2, '0');
        
        setMonth(`${y}년 ${today.getMonth() + 1}월`);
        setDate(String(today.getDate()));
        const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
        setDay(dayNames[today.getDay()]);
        setSelectedDate(`${y}-${m}-${d}`);
        setSelectedEndDate('');
        
        setTitle('');
        setContent('');
        setTime('');
        setLocation('');
        setMeta('');
        setImages([]);
        setNewFiles([]);
        setViewMode('edit');
    };

    const handleEdit = (item) => {
        setCurrentId(item.id);
        setMonth(item.month || '');
        setDate(item.date || '');
        setDay(item.day || '일요일');
        
        let initDate = item.startDate || '';
        if (!initDate && item.month && item.date) {
            const match = item.month.match(/(\d+)년\s*(\d+)월/);
            if (match) {
                const y = match[1];
                const m = match[2].padStart(2, '0');
                const d = String(item.date).replace(/[^0-9]/g, '').padStart(2, '0');
                initDate = `${y}-${m}-${d}`;
            }
        }
        setSelectedDate(initDate);
        setSelectedEndDate(item.endDate || '');
        
        setTitle(item.title || '');
        
        let initTime = item.time || '';
        let initLocation = item.location || '';
        if (!initTime && !initLocation && item.meta) {
            if (item.meta.includes('/')) {
                const parts = item.meta.split('/');
                initTime = parts[0].trim();
                initLocation = parts[1].trim();
            } else if (item.meta.includes('·')) {
                const parts = item.meta.split('·');
                initTime = parts[0].trim();
                initLocation = parts[1].trim();
            } else if (item.meta !== '주보 참조') {
                initLocation = item.meta;
            }
        }
        setTime(initTime);
        setLocation(initLocation);
        setMeta(item.meta || '');
        setContent(item.content || '');
        setImages(item.imageUrls || []);
        setNewFiles([]);
        setViewMode('edit');
    };

    const handleResizeHeight = (e) => {
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    };

    const handleDateChange = (e) => {
        const val = e.target.value;
        setSelectedDate(val);
        if (val) {
            const dateObj = new Date(val);
            const y = dateObj.getFullYear();
            const m = dateObj.getMonth() + 1;
            const d = dateObj.getDate();
            const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
            const dayName = dayNames[dateObj.getDay()];
            
            setMonth(`${y}년 ${m}월`);
            setDate(String(d));
            setDay(dayName);
        } else {
            setMonth('');
            setDate('');
            setDay('일요일');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('정말 이 일정을 삭제하시겠습니까?')) return;
        setLoading(true);
        try {
            await deleteDoc(doc(db, 'schedules', id));
            fetchSchedules();
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
        if (!month.trim() || !title.trim()) {
            alert('월과 제목은 필수 입력 항목입니다.');
            return;
        }

        setSaveMessage('저장 준비 중...');
        try {
            const uploadedImageUrls = [...images];
            
            if (newFiles.length > 0) {
                const imgbbApiKey = import.meta.env.VITE_IMGBB_API_KEY;
                if (!imgbbApiKey) {
                    throw new Error("ImgBB API 키가 설정되지 않았습니다. .env 파일에 VITE_IMGBB_API_KEY를 추가해주세요.");
                }

                setSaveMessage(`이미지 업로드 중 (0/${newFiles.length})...`);
                for (let i = 0; i < newFiles.length; i++) {
                    const file = newFiles[i];
                    
                    const formData = new FormData();
                    formData.append('image', file);
                    
                    const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
                        method: 'POST',
                        body: formData
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        uploadedImageUrls.push(result.data.url);
                    } else {
                        throw new Error(`이미지 업로드 실패: ${result.error?.message || '알 수 없는 오류'}`);
                    }
                    
                    setSaveMessage(`이미지 업로드 중 (${i + 1}/${newFiles.length})...`);
                }
            }

            setSaveMessage('데이터 저장 중...');
            const metaStr = time && location ? `${time} / ${location}` : (time || location || '주보 참조');
            const data = {
                month,
                date,
                day,
                title,
                time,
                location,
                meta: metaStr,
                content,
                imageUrls: uploadedImageUrls,
                createdAt: Timestamp.now(),
                startDate: selectedDate,
                endDate: selectedEndDate
            };

            const existing = schedules.find(s => s.id === currentId);
            if (existing && existing.createdAt) {
                data.createdAt = existing.createdAt;
            }

            await setDoc(doc(db, 'schedules', currentId), data);
            alert('일정이 저장되었습니다.');
            setViewMode('list');
            fetchSchedules();
        } catch (error) {
            console.error('저장 실패:', error);
            alert(`저장 중 오류가 발생했습니다.\n에러 내용: ${error.message}`);
        } finally {
            setSaveMessage('');
        }
    };

    const totalPages = Math.max(1, Math.ceil(schedules.length / itemsPerPage));
    const currentData = schedules.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    if (loading && viewMode === 'list') return <div>데이터를 불러오는 중입니다...</div>;

    if (viewMode === 'edit') {
        return (
            <div style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '700' }}>교회 일정 작성/수정</h2>
                </div>

                <div style={{ display: 'grid', gap: '20px' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>시작일</label>
                            <input 
                                type="date" 
                                value={selectedDate}
                                onChange={handleDateChange}
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                            />
                            <p style={{ marginTop: '8px', fontSize: '14px', color: '#6B7280' }}>
                                {month && date ? `선택됨: ${month} ${date}일 (${day})` : '날짜를 선택해 주세요.'}
                            </p>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>마감일 <span style={{ fontWeight: 'normal', color: '#6B7280' }}>(선택)</span></label>
                            <input 
                                type="date" 
                                value={selectedEndDate}
                                onChange={(e) => setSelectedEndDate(e.target.value)}
                                min={selectedDate}
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>행사 제목</label>
                        <input 
                            type="text" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="예: 어린이 주일 예배 및 행사"
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>시간</label>
                            <input 
                                type="text" 
                                value={time} 
                                onChange={(e) => setTime(e.target.value)}
                                placeholder="예: 오후 02:00"
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>장소</label>
                            <input 
                                type="text" 
                                value={location} 
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="예: 대예배실"
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>포스터 이미지 첨부 <span style={{ fontWeight: 'normal', color: '#6B7280' }}>(선택사항)</span></label>
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                            <label style={{ fontSize: '14px', fontWeight: '500', color: '#4B5563' }}>본문 내용 <span style={{ fontWeight: 'normal', color: '#6B7280' }}>(선택)</span></label>
                            <AdminEditor 
                                key={currentId || 'new'}
                                initialValue={content}
                                onChange={setContent}
                            />
                        </div>

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
                            {saveMessage ? saveMessage : '일정 저장하기'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700' }}>교회 일정 관리</h2>
                <button 
                    onClick={handleCreateNew}
                    style={{ backgroundColor: 'var(--color-btn-add)', color: '#fff', padding: '10px 20px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: '500' }}
                >
                    + 새 일정 추가
                </button>
            </div>

            <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#F9FAFB', textAlign: 'left', borderBottom: '1px solid #E5E7EB' }}>
                            <th style={{ padding: '16px', width: '150px' }}>연/월</th>
                            <th style={{ padding: '16px', width: '120px' }}>일자/요일</th>
                            <th style={{ padding: '16px' }}>행사 제목</th>
                            <th style={{ padding: '16px', width: '180px', textAlign: 'center' }}>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: '#6B7280' }}>등록된 일정이 없습니다.</td>
                            </tr>
                        ) : currentData.map(item => (
                            <tr key={item.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                                <td style={{ padding: '16px', fontWeight: '500' }}>{item.month}</td>
                                <td style={{ padding: '16px' }}>{item.date} ({item.day[0]})</td>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ fontWeight: '500' }}>
                                        {item.title}
                                        {item.endDate && (() => {
                                            const startStr = (item.startDate || '').substring(5).replace('-', '.');
                                            const endStr = item.endDate.substring(5).replace('-', '.');
                                            return startStr ? ` (${startStr}~${endStr})` : '';
                                        })()}
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>{item.meta}</div>
                                </td>
                                <td style={{ padding: '16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                    <button 
                                        onClick={() => handleEdit(item)}
                                        style={{ backgroundColor: '#F3F4F6', border: '1px solid #D1D5DB', padding: '6px 12px', borderRadius: '4px', marginRight: '8px', cursor: 'pointer' }}
                                    >수정</button>
                                    <button 
                                        onClick={() => handleDelete(item.id)}
                                        style={{ backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                                    >삭제</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: currentPage === 1 ? '#f9f9f9' : '#fff', cursor: currentPage === 1 ? 'default' : 'pointer', fontFamily: 'inherit' }}
                    >
                        이전
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                        <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            style={{ 
                                padding: '8px 12px', 
                                borderRadius: '4px', 
                                border: '1px solid #ddd', 
                                backgroundColor: currentPage === pageNum ? '#3B82F6' : '#fff', 
                                color: currentPage === pageNum ? '#fff' : '#333',
                                cursor: 'pointer',
                                fontFamily: 'inherit'
                            }}
                        >
                            {pageNum}
                        </button>
                    ))}
                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: currentPage === totalPages ? '#f9f9f9' : '#fff', cursor: currentPage === totalPages ? 'default' : 'pointer', fontFamily: 'inherit' }}
                    >
                        다음
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminSchedule;

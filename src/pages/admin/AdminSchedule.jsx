import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';

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
    const [meta, setMeta] = useState('');
    const [color, setColor] = useState('#4ADE80');
    const [saving, setSaving] = useState(false);

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
            
            // For admin, sorting by createdAt desc is fine to see recent additions
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
        setMonth(`${today.getFullYear()}년 ${today.getMonth() + 1}월`);
        setDate(String(today.getDate()).padStart(2, '0'));
        setDay('일요일');
        setTitle('');
        setMeta('');
        setColor('#4ADE80');
        setViewMode('edit');
    };

    const handleEdit = (item) => {
        setCurrentId(item.id);
        setMonth(item.month || '');
        setDate(item.date || '');
        setDay(item.day || '일요일');
        setTitle(item.title || '');
        setMeta(item.meta || '');
        setColor(item.color || '#4ADE80');
        setViewMode('edit');
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

    const handleSave = async () => {
        if (!month.trim() || !title.trim()) {
            alert('월과 제목은 필수 입력 항목입니다.');
            return;
        }

        setSaving(true);
        try {
            const data = {
                month,
                date,
                day,
                title,
                meta,
                color,
                createdAt: Timestamp.now()
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
            alert('저장 중 오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    };

    if (loading && viewMode === 'list') return <div>데이터를 불러오는 중입니다...</div>;

    if (viewMode === 'edit') {
        return (
            <div style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '700' }}>교회 일정 작성/수정</h2>
                </div>

                <div style={{ display: 'grid', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>연/월 (그룹용)</label>
                        <input 
                            type="text" 
                            value={month} 
                            onChange={(e) => setMonth(e.target.value)}
                            placeholder="예: 2026년 5월"
                            style={{ width: '200px', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>일자</label>
                            <input 
                                type="text" 
                                value={date} 
                                onChange={(e) => setDate(e.target.value)}
                                placeholder="예: 15"
                                style={{ width: '100px', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>요일</label>
                            <select 
                                value={day} 
                                onChange={(e) => setDay(e.target.value)}
                                style={{ width: '120px', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                            >
                                <option value="일요일">일요일</option>
                                <option value="월요일">월요일</option>
                                <option value="화요일">화요일</option>
                                <option value="수요일">수요일</option>
                                <option value="목요일">목요일</option>
                                <option value="금요일">금요일</option>
                                <option value="토요일">토요일</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>행사 제목</label>
                        <input 
                            type="text" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="예: 어린이 주일 예배 및 행사"
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '16px' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>세부 정보 (시간, 장소 등)</label>
                        <input 
                            type="text" 
                            value={meta} 
                            onChange={(e) => setMeta(e.target.value)}
                            placeholder="예: 오전 11:00 · 본당 및 교육관"
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>라벨 색상 지정</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <input 
                                type="color" 
                                value={color} 
                                onChange={(e) => setColor(e.target.value)}
                                style={{ width: '50px', height: '50px', padding: '0', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                            />
                            <span style={{ color: '#6B7280', fontSize: '14px' }}>클릭하여 원하는 색상을 선택하세요. (현재: {color})</span>
                        </div>
                    </div>

                    <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button 
                            onClick={() => setViewMode('list')}
                            style={{ padding: '12px 24px', borderRadius: '6px', border: '1px solid #D1D5DB', backgroundColor: '#fff', cursor: 'pointer', fontSize: '16px', fontWeight: '500' }}
                        >
                            취소
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={saving}
                            style={{ backgroundColor: '#10B981', color: '#fff', padding: '12px 24px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: '600' }}
                        >
                            {saving ? '저장 중...' : '일정 저장하기'}
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
                    style={{ backgroundColor: '#3B82F6', color: '#fff', padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '500' }}
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
                            <th style={{ padding: '16px', width: '80px', textAlign: 'center' }}>색상</th>
                            <th style={{ padding: '16px', width: '150px', textAlign: 'center' }}>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedules.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#6B7280' }}>등록된 일정이 없습니다.</td>
                            </tr>
                        ) : schedules.map(item => (
                            <tr key={item.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                                <td style={{ padding: '16px', fontWeight: '500' }}>{item.month}</td>
                                <td style={{ padding: '16px' }}>{item.date} ({item.day[0]})</td>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ fontWeight: '500' }}>{item.title}</div>
                                    <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>{item.meta}</div>
                                </td>
                                <td style={{ padding: '16px', textAlign: 'center' }}>
                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: item.color, margin: '0 auto' }}></div>
                                </td>
                                <td style={{ padding: '16px', textAlign: 'center' }}>
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
        </div>
    );
};

export default AdminSchedule;

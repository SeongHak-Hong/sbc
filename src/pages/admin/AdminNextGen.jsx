import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const AdminNextGen = () => {
    const [departments, setDepartments] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'nextgen'));
            const data = {};
            querySnapshot.forEach((doc) => {
                data[doc.id] = doc.data();
            });
            setDepartments(data);
        } catch (error) {
            console.error('다음세대 데이터 불러오기 실패:', error);
            alert('데이터를 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleFieldChange = (deptId, field, value) => {
        const newDepts = { ...departments };
        newDepts[deptId][field] = value;
        setDepartments(newDepts);
    };

    const handleNestedChange = (deptId, objectKey, field, value) => {
        const newDepts = { ...departments };
        if (!newDepts[deptId][objectKey]) newDepts[deptId][objectKey] = {};
        newDepts[deptId][objectKey][field] = value;
        setDepartments(newDepts);
    };

    const handleArrayChange = (deptId, arrayKey, index, value) => {
        const newDepts = { ...departments };
        newDepts[deptId][arrayKey][index] = value;
        setDepartments(newDepts);
    };

    const handleAddArrayItem = (deptId, arrayKey, emptyItem = '') => {
        const newDepts = { ...departments };
        if (!newDepts[deptId][arrayKey]) newDepts[deptId][arrayKey] = [];
        newDepts[deptId][arrayKey].push(emptyItem);
        setDepartments(newDepts);
    };

    const handleDeleteArrayItem = (deptId, arrayKey, index) => {
        const newDepts = { ...departments };
        newDepts[deptId][arrayKey].splice(index, 1);
        setDepartments(newDepts);
    };

    const handleEventChange = (deptId, index, field, value) => {
        const newDepts = { ...departments };
        newDepts[deptId].events[index][field] = value;
        setDepartments(newDepts);
    };

    const handleSave = async (deptId) => {
        setSaving(true);
        try {
            await setDoc(doc(db, 'nextgen', deptId), departments[deptId]);
            alert(`${departments[deptId].name} 저장이 완료되었습니다.`);
        } catch (error) {
            console.error('저장 실패:', error);
            alert('저장 중 오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>데이터를 불러오는 중입니다...</div>;

    return (
        <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>다음세대 관리</h2>
            
            {Object.keys(departments).map(deptId => {
                const dept = departments[deptId];
                return (
                    <div key={deptId} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', marginBottom: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #E5E7EB', paddingBottom: '16px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '600', color: dept.color || '#333' }}>{dept.name}</h3>
                            <button 
                                onClick={() => handleSave(deptId)}
                                disabled={saving}
                                style={{ backgroundColor: '#10B981', color: '#fff', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '500' }}
                            >
                                {saving ? '저장 중...' : '변경사항 저장'}
                            </button>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>예배 시간</label>
                                <input type="text" value={dept.schedule || ''} onChange={(e) => handleFieldChange(deptId, 'schedule', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>예배 장소</label>
                                <input type="text" value={dept.location || ''} onChange={(e) => handleFieldChange(deptId, 'location', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>담당 교역자 이름</label>
                                <input type="text" value={dept.leader?.name || ''} onChange={(e) => handleNestedChange(deptId, 'leader', 'name', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>부장 이름</label>
                                <input type="text" value={dept.director?.name || ''} onChange={(e) => handleNestedChange(deptId, 'director', 'name', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                            </div>
                        </div>

                        {/* 교사 명단 */}
                        <div style={{ marginBottom: '24px' }}>
                            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>{dept.teamTitle || '교사팀'} 명단 (쉼표 분리 불가, 한 명씩 추가)</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {dept.teachers?.map((teacher, index) => (
                                    <div key={index} style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F3F4F6', padding: '4px 8px', borderRadius: '4px' }}>
                                        <input type="text" value={teacher} onChange={(e) => handleArrayChange(deptId, 'teachers', index, e.target.value)} style={{ border: 'none', background: 'transparent', width: '80px', outline: 'none' }} />
                                        <button onClick={() => handleDeleteArrayItem(deptId, 'teachers', index)} style={{ border: 'none', background: 'transparent', color: '#EF4444', cursor: 'pointer', marginLeft: '4px' }}>x</button>
                                    </div>
                                ))}
                                <button onClick={() => handleAddArrayItem(deptId, 'teachers')} style={{ backgroundColor: '#3B82F6', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>+ 추가</button>
                            </div>
                        </div>

                        {/* 주요 행사 */}
                        <div>
                            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>주요 행사</h4>
                            {dept.events?.map((ev, index) => (
                                <div key={index} style={{ border: '1px solid #E5E7EB', padding: '16px', borderRadius: '8px', marginBottom: '16px', position: 'relative' }}>
                                    <button onClick={() => handleDeleteArrayItem(deptId, 'events', index)} style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: '#EF4444', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>행사 삭제</button>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>행사명</label>
                                            <input type="text" value={ev.title} onChange={(e) => handleEventChange(deptId, index, 'title', e.target.value)} style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>일정</label>
                                            <input type="text" value={ev.date} onChange={(e) => handleEventChange(deptId, index, 'date', e.target.value)} style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>상태 (모집중/접수중 등)</label>
                                            <input type="text" value={ev.status} onChange={(e) => handleEventChange(deptId, index, 'status', e.target.value)} style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>이미지 URL</label>
                                            <input type="text" value={ev.img} onChange={(e) => handleEventChange(deptId, index, 'img', e.target.value)} style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>행사 설명</label>
                                        <textarea value={ev.desc} onChange={(e) => handleEventChange(deptId, index, 'desc', e.target.value)} style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '60px' }} />
                                    </div>
                                </div>
                            ))}
                            <button 
                                onClick={() => handleAddArrayItem(deptId, 'events', { title: '새 행사', date: '', status: '오픈예정', img: '', desc: '' })}
                                style={{ backgroundColor: '#F3F4F6', color: '#374151', border: '1px solid #D1D5DB', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
                            >
                                + 새 행사 추가
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default AdminNextGen;

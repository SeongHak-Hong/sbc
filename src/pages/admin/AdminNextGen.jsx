import React, { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db, storage } from '../../firebase';
import AdminEditor from '../../components/admin/AdminEditor';
import AdminCloseButton from '../../components/ui/AdminCloseButton';
import TimeInput from '../../components/admin/TimeInput';

const AdminNextGen = () => {
    const [departments, setDepartments] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    // For Basic Info editing
    const [editingDeptId, setEditingDeptId] = useState(null);
    
    // For Event editing
    // editingEvent: { isNew: boolean, originalDeptId?: string, originalIndex?: number, deptId: string, event: object } | null
    const [editingEvent, setEditingEvent] = useState(null);

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

    const handleEventFieldChange = (field, value) => {
        setEditingEvent(prev => ({
            ...prev,
            event: { ...prev.event, [field]: value }
        }));
    };

    const handleImageUpload = async (files) => {
        if (!files || files.length === 0) return;
        
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
        if (!cloudName || !uploadPreset) {
            alert("Cloudinary API 키가 설정되지 않았습니다. .env 파일을 확인해주세요.");
            return;
        }

        setUploading(true);
        try {
            const uploadedUrls = [];
            
            for (let i = 0; i < files.length; i++) {
                const options = {
                    maxSizeMB: 2,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                };
                const compressedFile = await imageCompression(files[i], options);

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
                    uploadedUrls.push(optimizedUrl);
                } else {
                    throw new Error(result.error?.message || '알 수 없는 오류');
                }
            }
            
            setEditingEvent(prev => {
                const newUrls = [...(prev.event.imageUrls || []), ...uploadedUrls];
                return {
                    ...prev,
                    event: {
                        ...prev.event,
                        imageUrls: newUrls,
                        img: prev.event.img || (uploadedUrls.length > 0 ? uploadedUrls[0] : '')
                    }
                };
            });
        } catch (error) {
            console.error('이미지 업로드 실패:', error);
            alert(`이미지 업로드에 실패했습니다: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleSaveBasicInfo = async (deptId) => {
        setSaving(true);
        try {
            await setDoc(doc(db, 'nextgen', deptId), departments[deptId]);
            alert(`${departments[deptId].name} 기본정보 저장이 완료되었습니다.`);
            setEditingDeptId(null);
        } catch (error) {
            console.error('저장 실패:', error);
            alert('저장 중 오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveEvent = async () => {
        if (!editingEvent.deptId) {
            alert("부서를 선택해주세요.");
            return;
        }
        setSaving(true);
        try {
            const newDepts = { ...departments };
            const ev = editingEvent.event;
            // Clean up old status field if present
            if ('status' in ev) delete ev.status;
            
            const targetDeptId = editingEvent.deptId;
            
            if (editingEvent.isNew) {
                if (!newDepts[targetDeptId].events) newDepts[targetDeptId].events = [];
                newDepts[targetDeptId].events.push(ev);
                await setDoc(doc(db, 'nextgen', targetDeptId), newDepts[targetDeptId]);
            } else {
                const originalDeptId = editingEvent.originalDeptId;
                const originalIndex = editingEvent.originalIndex;
                
                if (originalDeptId !== targetDeptId) {
                    // Remove from old
                    newDepts[originalDeptId].events.splice(originalIndex, 1);
                    // Add to new
                    if (!newDepts[targetDeptId].events) newDepts[targetDeptId].events = [];
                    newDepts[targetDeptId].events.push(ev);
                    
                    await setDoc(doc(db, 'nextgen', originalDeptId), newDepts[originalDeptId]);
                    await setDoc(doc(db, 'nextgen', targetDeptId), newDepts[targetDeptId]);
                } else {
                    newDepts[targetDeptId].events[originalIndex] = ev;
                    await setDoc(doc(db, 'nextgen', targetDeptId), newDepts[targetDeptId]);
                }
            }
            
            setDepartments(newDepts);
            alert("행사가 저장되었습니다.");
            setEditingEvent(null);
        } catch (error) {
            console.error('행사 저장 실패:', error);
            alert('저장 중 오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    };
    
    const handleDeleteEvent = async (deptId, index) => {
        if (!window.confirm('정말 이 행사를 삭제하시겠습니까?')) return;
        const newDepts = { ...departments };
        newDepts[deptId].events.splice(index, 1);
        setDepartments(newDepts);
        try {
            await setDoc(doc(db, 'nextgen', deptId), newDepts[deptId]);
            alert('삭제되었습니다.');
        } catch (error) {
            console.error('삭제 저장 실패:', error);
            alert('삭제 내용을 저장하는 중 오류가 발생했습니다.');
        }
    };

    if (loading) return <div>데이터를 불러오는 중입니다...</div>;

    // 모아둔 모든 행사 리스트 생성
    const allEvents = [];
    Object.keys(departments).forEach(deptId => {
        const dept = departments[deptId];
        if (dept.events) {
            dept.events.forEach((ev, index) => {
                allEvents.push({ ...ev, deptId, originalIndex: index, deptName: dept.name });
            });
        }
    });
    
    // Sort events by startDate desc (latest first)
    allEvents.sort((a, b) => {
        const dateA = a.startDate || '';
        const dateB = b.startDate || '';
        if (dateA > dateB) return -1;
        if (dateA < dateB) return 1;
        return 0;
    });

    return (
        <div>
            <h2 style={{ fontSize: '24px',  marginBottom: '24px' }}>다음세대 관리</h2>
            
            {Object.keys(departments).length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {Object.keys(departments).sort((a, b) => {
                            const order = { 'kindergarten': 1, 'elementary': 2, 'youth': 3, 'youngadults': 4 };
                            return (order[a] || 99) - (order[b] || 99);
                        }).map(deptId => (
                            <button
                                key={deptId}
                                onClick={() => {
                                    setEditingEvent(null);
                                    setEditingDeptId(deptId);
                                }}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: editingDeptId === deptId ? '#1E40AF' : '#E0E7FF',
                                    color: editingDeptId === deptId ? '#fff' : '#1E40AF',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 500
                                }}
                            >
                                {departments[deptId].name} 기본정보 수정
                            </button>
                        ))}
                    </div>
                    
                    {!editingEvent && !editingDeptId && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button 
                                onClick={() => {
                                    setEditingDeptId(null);
                                    setEditingEvent({
                                        isNew: true,
                                        deptId: '',
                                        event: { title: '새 행사', startDate: '', endDate: '', time: '', location: '', img: '', imageUrls: [], desc: '' }
                                    });
                                }}
                                style={{ backgroundColor: '#3B82F6', color: '#fff', padding: '10px 20px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 500 }}
                            >
                                + 새 행사 추가
                            </button>
                        </div>
                    )}
                </div>
            )}
            
            {/* 기본정보 수정 뷰 */}
            {editingDeptId && departments[editingDeptId] && (() => {
                const deptId = editingDeptId;
                const dept = departments[deptId];
                return (
                    <div style={{ border: '1px solid #E5E7EB', padding: '24px', borderRadius: '8px', backgroundColor: '#F8FAFC', marginBottom: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
                            <h5 style={{ margin: 0, fontSize: '18px', color: '#1E293B' }}>
                                {dept.name} 기본 정보 및 {deptId === 'youngadults' ? '임원진 명단' : '교사 명단'} 편집
                            </h5>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>예배 시간</label>
                                <input type="text" value={dept.schedule || ''} onChange={(e) => handleFieldChange(deptId, 'schedule', e.target.value)} style={{ width: '100%', padding: '0 12px', height: '48px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>예배 장소</label>
                                <input type="text" value={dept.location || ''} onChange={(e) => handleFieldChange(deptId, 'location', e.target.value)} style={{ width: '100%', padding: '0 12px', height: '48px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>담당 교역자 이름</label>
                                <input type="text" value={dept.leader?.name || ''} onChange={(e) => handleNestedChange(deptId, 'leader', 'name', e.target.value)} style={{ width: '100%', padding: '0 12px', height: '48px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>부장 이름</label>
                                <input type="text" value={dept.director?.name || ''} onChange={(e) => handleNestedChange(deptId, 'director', 'name', e.target.value)} style={{ width: '100%', padding: '0 12px', height: '48px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} />
                            </div>
                        </div>

                        {/* 교사 명단 */}
                        <div style={{ marginBottom: '32px' }}>
                            <h4 style={{ fontSize: '16px',  marginBottom: '12px' }}>{dept.teamTitle || '교사팀'} 명단 (쉼표 분리 불가, 한 명씩 추가)</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {dept.teachers?.map((teacher, index) => (
                                    <div key={index} style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F3F4F6', padding: '4px 12px', borderRadius: '4px' }}>
                                        <input type="text" value={teacher} onChange={(e) => handleArrayChange(deptId, 'teachers', index, e.target.value)} style={{ border: 'none', background: 'transparent', width: '80px', outline: 'none' }} />
                                        <AdminCloseButton 
                                            onClick={() => handleDeleteArrayItem(deptId, 'teachers', index)} 
                                            style={{ marginLeft: '4px' }} 
                                        />
                                    </div>
                                ))}
                                <button onClick={() => handleAddArrayItem(deptId, 'teachers')} style={{ backgroundColor: '#10B981', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer' }}>+ 추가</button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid #E5E7EB', paddingTop: '16px' }}>
                            <button 
                                onClick={() => setEditingDeptId(null)}
                                style={{ backgroundColor: '#fff', color: '#4B5563', border: '1px solid #D1D5DB', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
                            >닫기</button>
                            <button 
                                onClick={() => handleSaveBasicInfo(deptId)}
                                disabled={saving}
                                style={{ backgroundColor: '#10B981', color: '#fff', padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer'}}
                            >
                                {saving ? '저장중...' : '저장'}
                            </button>
                        </div>
                    </div>
                );
            })()}

            {/* 행사 상세 편집 뷰 */}
            {editingEvent && (() => {
                const ev = editingEvent.event;
                return (
                    <div style={{ border: '1px solid #3B82F6', padding: '24px', borderRadius: '8px', backgroundColor: '#F8FAFC', marginBottom: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
                            <h5 style={{ margin: 0, fontSize: '18px', color: '#1E40AF' }}>행사 상세 편집</h5>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '14px', color: '#475569', marginBottom: '4px' }}>부서 선택 (필수)</label>
                                <select 
                                    value={editingEvent.deptId} 
                                    onChange={(e) => setEditingEvent(prev => ({ ...prev, deptId: e.target.value }))}
                                    style={{ width: '100%', padding: '0 12px', height: '48px', border: '1px solid #3B82F6', borderRadius: '4px', boxSizing: 'border-box', backgroundColor: '#fff', fontWeight: 'bold' }}
                                >
                                    <option value="" disabled>부서를 선택하세요</option>
                                    {Object.keys(departments).sort((a, b) => {
                                        const order = { 'kindergarten': 1, 'elementary': 2, 'youth': 3, 'youngadults': 4 };
                                        return (order[a] || 99) - (order[b] || 99);
                                    }).map(d => <option key={d} value={d}>{departments[d].name}</option>)}
                                </select>
                            </div>
                            <div style={{ flex: 2 }}>
                                <label style={{ display: 'block', fontSize: '14px', color: '#475569', marginBottom: '4px' }}>행사명</label>
                                <input type="text" value={ev.title} onChange={(e) => handleEventFieldChange('title', e.target.value)} style={{ width: '100%', padding: '0 12px', height: '48px', border: '1px solid #CBD5E1', borderRadius: '4px', boxSizing: 'border-box' }} />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', color: '#475569', marginBottom: '4px' }}>시작일</label>
                                <input type="date" value={ev.startDate || ''} onChange={(e) => handleEventFieldChange('startDate', e.target.value)} style={{ width: '100%', padding: '0 12px', height: '48px', border: '1px solid #CBD5E1', borderRadius: '4px', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', color: '#475569', marginBottom: '4px' }}>종료일</label>
                                <input type="date" value={ev.endDate || ''} onChange={(e) => handleEventFieldChange('endDate', e.target.value)} style={{ width: '100%', padding: '0 12px', height: '48px', border: '1px solid #CBD5E1', borderRadius: '4px', boxSizing: 'border-box' }} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '14px', color: '#475569', marginBottom: '4px' }}>시간</label>
                                <TimeInput 
                                    value={ev.time || ''} 
                                    onChange={(val) => handleEventFieldChange('time', val)} 
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '14px', color: '#475569', marginBottom: '4px' }}>장소</label>
                                <input type="text" value={ev.location || ''} onChange={(e) => handleEventFieldChange('location', e.target.value)} placeholder="예: 비전센터 3층" style={{ width: '100%', padding: '0 12px', height: '48px', border: '1px solid #CBD5E1', borderRadius: '4px', boxSizing: 'border-box' }} />
                            </div>
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', fontSize: '14px', color: '#475569', marginBottom: '4px' }}>행사 설명</label>
                            <div style={{ marginTop: '4px', marginBottom: '16px' }}>
                                <AdminEditor 
                                    initialValue={ev.desc}
                                    onChange={(val) => handleEventFieldChange('desc', val)}
                                    height="250px"
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', color: '#475569', marginBottom: '4px' }}>행사 이미지 업로드 {uploading && <span style={{  color: '#6B7280' }}>(업로드 중...)</span>}</label>
                            <input 
                                type="file" 
                                accept="image/*" 
                                multiple
                                onChange={(e) => handleImageUpload(e.target.files)}
                                disabled={uploading}
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '4px', boxSizing: 'border-box', backgroundColor: '#fff', cursor: uploading ? 'not-allowed' : 'pointer', marginBottom: '8px' }} 
                            />
                            {(ev.imageUrls && ev.imageUrls.length > 0) ? (
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                                    {ev.imageUrls.map((url, imgIdx) => (
                                        <div key={imgIdx} style={{ position: 'relative', border: ev.img === url ? '2px solid #3B82F6' : '1px solid #ddd', borderRadius: '4px', padding: '4px', backgroundColor: '#fff' }}>
                                            {ev.img === url && <span style={{ position: 'absolute', top: 0, left: 0, backgroundColor: '#3B82F6', color: '#fff', fontSize: '10px', padding: '2px 4px', borderRadius: '2px' }}>썸네일</span>}
                                            <img src={url} alt={`업로드된 이미지 ${imgIdx + 1}`} style={{ height: '60px', width: 'auto', borderRadius: '2px', display: 'block', marginBottom: '4px' }} />
                                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                                {ev.img !== url && (
                                                    <button onClick={() => handleEventFieldChange('img', url)} style={{ fontSize: '10px', padding: '2px 4px', backgroundColor: '#F3F4F6', color: '#1F2937', border: '1px solid #D1D5DB', borderRadius: '2px', cursor: 'pointer' }}>썸네일 지정</button>
                                                )}
                                                <button onClick={() => {
                                                    const newUrls = ev.imageUrls.filter((_, i) => i !== imgIdx);
                                                    setEditingEvent(prev => ({
                                                        ...prev,
                                                        event: {
                                                            ...prev.event,
                                                            imageUrls: newUrls,
                                                            img: prev.event.img === url ? (newUrls.length > 0 ? newUrls[0] : '') : prev.event.img
                                                        }
                                                    }));
                                                }} style={{ fontSize: '10px', padding: '2px 4px', backgroundColor: '#EF4444', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer' }}>삭제</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                ev.img && (
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                                        <div style={{ position: 'relative', border: '2px solid #3B82F6', borderRadius: '4px', padding: '4px', backgroundColor: '#fff' }}>
                                            <span style={{ position: 'absolute', top: 0, left: 0, backgroundColor: '#3B82F6', color: '#fff', fontSize: '10px', padding: '2px 4px', borderRadius: '2px' }}>썸네일</span>
                                            <img src={ev.img} alt="썸네일" style={{ height: '60px', width: 'auto', borderRadius: '2px', display: 'block', marginBottom: '4px' }} />
                                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                <button onClick={() => handleEventFieldChange('img', '')} style={{ fontSize: '10px', padding: '2px 4px', backgroundColor: '#EF4444', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer' }}>삭제</button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid #E5E7EB', paddingTop: '16px', marginTop: '24px' }}>
                            <button 
                                onClick={() => setEditingEvent(null)}
                                style={{ backgroundColor: '#fff', color: '#4B5563', border: '1px solid #D1D5DB', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
                            >취소</button>
                            <button 
                                onClick={handleSaveEvent}
                                disabled={saving}
                                style={{ backgroundColor: '#10B981', color: '#fff', padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer'}}
                            >
                                {saving ? '저장중...' : '저장'}
                            </button>
                        </div>
                    </div>
                );
            })()}

            {/* 통합 행사 리스트 뷰 */}
            {!editingEvent && !editingDeptId && (
                <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#F9FAFB', textAlign: 'left', borderBottom: '1px solid #E5E7EB' }}>
                                <th style={{ padding: '16px', width: '120px', textAlign: 'center' }}>부서</th>
                                <th style={{ padding: '16px' }}>제목 / 행사명</th>
                                <th style={{ padding: '16px', width: '200px' }}>기간</th>
                                <th style={{ padding: '16px', width: '180px', textAlign: 'center' }}>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allEvents.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: '#6B7280' }}>등록된 행사가 없습니다.</td>
                                </tr>
                            ) : allEvents.map((ev, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #E5E7EB' }}>
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        <span style={{ backgroundColor: '#F1F5F9', color: '#475569', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', fontWeight: 500 }}>
                                            {ev.deptName}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px' }}>{ev.title || '새 행사'}</td>
                                    <td style={{ padding: '16px', color: '#6B7280', fontSize: '16px' }}>
                                        {ev.startDate ? (() => {
                                            const parts = ev.startDate.split('-');
                                            return parts.length >= 3 ? `${parts[0]}. ${parts[1].padStart(2, '0')}. ${parts[2].padStart(2, '0')}.` : ev.startDate;
                                        })() : '-'}
                                        {ev.endDate && (
                                            <div style={{ marginTop: '4px' }}>~ {(() => {
                                                const parts = ev.endDate.split('-');
                                                return parts.length >= 3 ? `${parts[0]}. ${parts[1].padStart(2, '0')}. ${parts[2].padStart(2, '0')}.` : ev.endDate;
                                            })()}</div>
                                        )}
                                    </td>
                                    <td style={{ padding: '16px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                        <button 
                                            onClick={() => setEditingEvent({
                                                isNew: false,
                                                originalDeptId: ev.deptId,
                                                originalIndex: ev.originalIndex,
                                                deptId: ev.deptId,
                                                event: { ...ev } // clone event data for editing
                                            })}
                                            style={{ backgroundColor: '#F3F4F6', border: '1px solid #D1D5DB', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                                        >수정</button>
                                        <button 
                                            onClick={() => handleDeleteEvent(ev.deptId, ev.originalIndex)}
                                            style={{ backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                                        >삭제</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminNextGen;

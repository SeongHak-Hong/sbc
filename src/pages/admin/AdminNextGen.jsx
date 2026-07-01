import React, { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db, storage } from '../../firebase';
import AdminEditor from '../../components/admin/AdminEditor';
import AdminCloseButton from '../../components/ui/AdminCloseButton';

const AdminNextGen = () => {
    const [departments, setDepartments] = useState({});
    const [activeTab, setActiveTab] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

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
            if (Object.keys(data).length > 0) {
                setActiveTab(Object.keys(data)[0]);
            }
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

    const handleImageUpload = async (deptId, eventIndex, files) => {
        if (!files || files.length === 0) return;
        
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
        if (!cloudName || !uploadPreset) {
            alert("Cloudinary API 키가 설정되지 않았습니다. .env 파일을 확인해주세요.");
            return;
        }

        setUploading(true);
        try {
            const newDepts = { ...departments };
            const ev = newDepts[deptId].events[eventIndex];
            if (!ev.imageUrls) ev.imageUrls = [];
            
            for (let i = 0; i < files.length; i++) {
                // 이미지 압축 적용 (넉넉하게 원본 화질 유지)
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
                    ev.imageUrls.push(optimizedUrl);
                    if (!ev.img) {
                        ev.img = optimizedUrl;
                    }
                } else {
                    throw new Error(result.error?.message || '알 수 없는 오류');
                }
            }
            setDepartments(newDepts);
        } catch (error) {
            console.error('이미지 업로드 실패:', error);
            alert(`이미지 업로드에 실패했습니다: ${error.message}`);
        } finally {
            setUploading(false);
        }
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
            
            {Object.keys(departments).length > 0 && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
                    {Object.keys(departments).sort((a, b) => {
                        const order = { 'kindergarten': 1, 'elementary': 2, 'youth': 3, 'youngadults': 4 };
                        return (order[a] || 99) - (order[b] || 99);
                    }).map(deptId => (
                        <button
                            key={deptId}
                            onClick={() => setActiveTab(deptId)}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: activeTab === deptId ? '#1F2937' : '#F3F4F6',
                                color: activeTab === deptId ? '#fff' : '#4B5563',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: activeTab === deptId ? '600' : '500',
                                fontSize: '15px'
                            }}
                        >
                            {departments[deptId].name || deptId}
                        </button>
                    ))}
                </div>
            )}
            
            {activeTab && departments[activeTab] && (() => {
                const deptId = activeTab;
                const dept = departments[deptId];
                return (
                    <div key={deptId} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', marginBottom: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #E5E7EB', paddingBottom: '16px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--color-text-body)' }}>{dept.name}</h3>
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
                        <div style={{ marginBottom: '24px' }}>
                            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>{dept.teamTitle || '교사팀'} 명단 (쉼표 분리 불가, 한 명씩 추가)</h4>
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
                                <button onClick={() => handleAddArrayItem(deptId, 'teachers')} style={{ backgroundColor: 'var(--color-btn-add)', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer' }}>+ 추가</button>
                            </div>
                        </div>

                        {/* 주요 행사 */}
                        <div>
                            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>주요 행사</h4>
                            {dept.events?.map((ev, index) => (
                                <div key={index} style={{ border: '1px solid #E5E7EB', padding: '16px', borderRadius: '8px', marginBottom: '16px', position: 'relative' }}>
                                    <button onClick={() => handleDeleteArrayItem(deptId, 'events', index)} style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: '#EF4444', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer' }}>행사 삭제</button>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>행사명</label>
                                            <input type="text" value={ev.title} onChange={(e) => handleEventChange(deptId, index, 'title', e.target.value)} style={{ width: '100%', padding: '0 12px', height: '48px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>시작일</label>
                                            <input type="date" value={ev.startDate || ''} onChange={(e) => handleEventChange(deptId, index, 'startDate', e.target.value)} style={{ width: '100%', padding: '0 12px', height: '48px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>종료일</label>
                                            <input type="date" value={ev.endDate || ''} onChange={(e) => handleEventChange(deptId, index, 'endDate', e.target.value)} style={{ width: '100%', padding: '0 12px', height: '48px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>상태</label>
                                            <select value={ev.status} onChange={(e) => handleEventChange(deptId, index, 'status', e.target.value)} style={{ width: '100%', padding: '0 12px', height: '48px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', backgroundColor: '#fff' }}>
                                                <option value="예정">예정</option>
                                                <option value="접수중">접수중</option>
                                                <option value="모집중">모집중</option>
                                                <option value="진행중">진행중</option>
                                                <option value="마감">마감</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: '12px' }}>
                                        <label style={{ display: 'block', fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>행사 설명</label>
                                        <div style={{ marginTop: '4px', marginBottom: '16px' }}>
                                            <AdminEditor 
                                                initialValue={ev.desc}
                                                onChange={(val) => handleEventChange(deptId, index, 'desc', val)}
                                                height="250px"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>행사 이미지 업로드 {uploading && <span style={{ fontWeight: 'normal', color: '#6B7280' }}>(업로드 중...)</span>}</label>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            multiple
                                            onChange={(e) => handleImageUpload(deptId, index, e.target.files)}
                                            disabled={uploading}
                                            style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', backgroundColor: '#fff', cursor: uploading ? 'not-allowed' : 'pointer', marginBottom: '8px' }} 
                                        />
                                        {(ev.imageUrls && ev.imageUrls.length > 0) ? (
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                                                {ev.imageUrls.map((url, imgIdx) => (
                                                    <div key={imgIdx} style={{ position: 'relative', border: ev.img === url ? '2px solid #3B82F6' : '1px solid #ddd', borderRadius: '4px', padding: '4px' }}>
                                                        {ev.img === url && <span style={{ position: 'absolute', top: 0, left: 0, backgroundColor: '#3B82F6', color: '#fff', fontSize: '10px', padding: '2px 4px', borderRadius: '2px' }}>썸네일</span>}
                                                        <img src={url} alt={`업로드된 이미지 ${imgIdx + 1}`} style={{ height: '60px', width: 'auto', borderRadius: '2px', display: 'block', marginBottom: '4px' }} />
                                                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                                            {ev.img !== url && (
                                                                <button onClick={() => handleEventChange(deptId, index, 'img', url)} style={{ fontSize: '10px', padding: '2px 4px', backgroundColor: '#F3F4F6', color: '#1F2937', border: '1px solid #D1D5DB', borderRadius: '2px', cursor: 'pointer' }}>썸네일 지정</button>
                                                            )}
                                                            <button onClick={() => {
                                                                const newDepts = { ...departments };
                                                                const targetEv = newDepts[deptId].events[index];
                                                                targetEv.imageUrls = targetEv.imageUrls.filter((_, i) => i !== imgIdx);
                                                                if (targetEv.img === url) {
                                                                    targetEv.img = targetEv.imageUrls.length > 0 ? targetEv.imageUrls[0] : '';
                                                                }
                                                                setDepartments(newDepts);
                                                            }} style={{ fontSize: '10px', padding: '2px 4px', backgroundColor: '#EF4444', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer' }}>삭제</button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            ev.img && (
                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                                                    <div style={{ position: 'relative', border: '2px solid #3B82F6', borderRadius: '4px', padding: '4px' }}>
                                                        <span style={{ position: 'absolute', top: 0, left: 0, backgroundColor: '#3B82F6', color: '#fff', fontSize: '10px', padding: '2px 4px', borderRadius: '2px' }}>썸네일</span>
                                                        <img src={ev.img} alt="썸네일" style={{ height: '60px', width: 'auto', borderRadius: '2px', display: 'block', marginBottom: '4px' }} />
                                                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                            <button onClick={() => handleEventChange(deptId, index, 'img', '')} style={{ fontSize: '10px', padding: '2px 4px', backgroundColor: '#EF4444', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer' }}>삭제</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
                            <button 
                                onClick={() => handleAddArrayItem(deptId, 'events', { title: '새 행사', startDate: '', endDate: '', status: '예정', img: '', imageUrls: [], desc: '' })}
                                style={{ backgroundColor: 'var(--color-btn-add)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
                            >
                                + 새 행사 추가
                            </button>
                            <button 
                                onClick={() => handleSave(deptId)}
                                disabled={saving}
                                style={{ backgroundColor: '#10B981', color: '#fff', padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: '500' }}
                            >
                                {saving ? '저장중...' : '변경사항 저장'}
                            </button>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default AdminNextGen;

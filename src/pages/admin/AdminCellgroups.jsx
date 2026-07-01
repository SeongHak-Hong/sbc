import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const AdminCellgroups = () => {
    const [cellgroups, setCellgroups] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchCellgroups();
    }, []);

    const fetchCellgroups = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'cellgroups'));
            const data = {};
            querySnapshot.forEach((doc) => {
                data[doc.id] = doc.data();
            });
            setCellgroups(data);
        } catch (error) {
            console.error('구역 안내 불러오기 실패:', error);
            alert('데이터를 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleZoneChange = (parishKey, index, field, value) => {
        const newCellgroups = { ...cellgroups };
        newCellgroups[parishKey].zones[index][field] = value;
        setCellgroups(newCellgroups);
    };

    const handleAddZone = (parishKey) => {
        const newCellgroups = { ...cellgroups };
        if (!newCellgroups[parishKey].zones) newCellgroups[parishKey].zones = [];
        newCellgroups[parishKey].zones.push({ id: '', leader: '', teacher: '' });
        setCellgroups(newCellgroups);
    };

    const handleDeleteZone = (parishKey, index) => {
        if (!window.confirm('이 구역을 삭제하시겠습니까?')) return;
        const newCellgroups = { ...cellgroups };
        newCellgroups[parishKey].zones.splice(index, 1);
        setCellgroups(newCellgroups);
    };

    const handleSave = async (parishKey) => {
        setSaving(true);
        try {
            await setDoc(doc(db, 'cellgroups', parishKey), cellgroups[parishKey]);
            alert(`${parishKey} 저장이 완료되었습니다.`);
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
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>구역 안내 관리</h2>
            
            {Object.keys(cellgroups).map(parishKey => {
                const parish = cellgroups[parishKey];
                return (
                    <div key={parishKey} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '600' }}>{parishKey}</h3>
                        </div>
                        
                        <div style={{ marginBottom: '16px' }}>
                            <strong>담당 교역자: </strong>
                            <input 
                                type="text" 
                                value={parish.pastor?.name || ''} 
                                onChange={(e) => {
                                    const newCellgroups = { ...cellgroups };
                                    if(!newCellgroups[parishKey].pastor) newCellgroups[parishKey].pastor = {};
                                    newCellgroups[parishKey].pastor.name = e.target.value;
                                    setCellgroups(newCellgroups);
                                }}
                                style={{ padding: '6px', border: '1px solid #ddd', borderRadius: '4px', marginLeft: '8px' }}
                            />
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#F3F4F6', textAlign: 'left' }}>
                                    <th style={{ padding: '12px', borderBottom: '1px solid #E5E7EB' }}>구역번호 (ID)</th>
                                    <th style={{ padding: '12px', borderBottom: '1px solid #E5E7EB' }}>구역장</th>
                                    <th style={{ padding: '12px', borderBottom: '1px solid #E5E7EB' }}>구역교사</th>
                                    <th style={{ padding: '12px', borderBottom: '1px solid #E5E7EB' }}>관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {parish.zones && parish.zones.map((zone, index) => (
                                    <tr key={index}>
                                        <td style={{ padding: '8px', borderBottom: '1px solid #E5E7EB' }}>
                                            <input 
                                                type="text" 
                                                value={zone.id} 
                                                onChange={(e) => handleZoneChange(parishKey, index, 'id', e.target.value)}
                                                style={{ width: '80px', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
                                            />
                                        </td>
                                        <td style={{ padding: '8px', borderBottom: '1px solid #E5E7EB' }}>
                                            <input 
                                                type="text" 
                                                value={zone.leader} 
                                                onChange={(e) => handleZoneChange(parishKey, index, 'leader', e.target.value)}
                                                style={{ width: '150px', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
                                            />
                                        </td>
                                        <td style={{ padding: '8px', borderBottom: '1px solid #E5E7EB' }}>
                                            <input 
                                                type="text" 
                                                value={zone.teacher || ''} 
                                                onChange={(e) => handleZoneChange(parishKey, index, 'teacher', e.target.value)}
                                                style={{ width: '150px', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
                                            />
                                        </td>
                                        <td style={{ padding: '8px', borderBottom: '1px solid #E5E7EB' }}>
                                            <button 
                                                onClick={() => handleDeleteZone(parishKey, index)}
                                                style={{ backgroundColor: '#EF4444', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                삭제
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
                            <button 
                                onClick={() => handleAddZone(parishKey)}
                                style={{ backgroundColor: 'var(--color-btn-add)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
                            >
                                + 새 구역 추가
                            </button>
                            <button 
                                onClick={() => handleSave(parishKey)}
                                disabled={saving}
                                style={{ backgroundColor: '#10B981', color: '#fff', padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: '500' }}
                            >
                                {saving ? '저장중...' : '변경사항 저장'}
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default AdminCellgroups;

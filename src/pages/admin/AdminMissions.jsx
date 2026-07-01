import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const AdminMissions = () => {
    const [missions, setMissions] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchMissions();
    }, []);

    const fetchMissions = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'missions'));
            const data = {};
            querySnapshot.forEach((doc) => {
                data[doc.id] = doc.data();
            });
            setMissions(data);
        } catch (error) {
            console.error('선교전도 데이터 불러오기 실패:', error);
            alert('데이터를 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleListChange = (missionId, index, field, value) => {
        const newMissions = { ...missions };
        newMissions[missionId].list[index][field] = value;
        setMissions(newMissions);
    };

    const handleAddListItem = (missionId) => {
        const newMissions = { ...missions };
        if (!newMissions[missionId].list) newMissions[missionId].list = [];
        newMissions[missionId].list.push({ name: '', organization: '', region: '' });
        setMissions(newMissions);
    };

    const handleDeleteListItem = (missionId, index) => {
        if (!window.confirm('삭제하시겠습니까?')) return;
        const newMissions = { ...missions };
        newMissions[missionId].list.splice(index, 1);
        setMissions(newMissions);
    };

    const handleSave = async (missionId) => {
        setSaving(true);
        try {
            await setDoc(doc(db, 'missions', missionId), missions[missionId]);
            alert(`${missions[missionId].name} 저장이 완료되었습니다.`);
        } catch (error) {
            console.error('저장 실패:', error);
            alert('저장 중 오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>데이터를 불러오는 중입니다...</div>;

    const renderTableEditor = (missionId) => {
        const data = missions[missionId];
        if (!data) return null;

        return (
            <div key={missionId} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '20px'}}>
                        {missionId === 'overseas' ? '해외 선교' : '국내 선교'}
                    </h3>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#F3F4F6', textAlign: 'left' }}>
                            <th style={{ padding: '12px', borderBottom: '1px solid #E5E7EB' }}>이름/교회명</th>
                            <th style={{ padding: '12px', borderBottom: '1px solid #E5E7EB' }}>소속기관</th>
                            <th style={{ padding: '12px', borderBottom: '1px solid #E5E7EB' }}>파송/사역지역</th>
                            <th style={{ padding: '12px', borderBottom: '1px solid #E5E7EB' }}>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.list?.map((item, index) => (
                            <tr key={index}>
                                <td style={{ padding: '8px', borderBottom: '1px solid #E5E7EB' }}>
                                    <input 
                                        type="text" 
                                        value={item.name} 
                                        onChange={(e) => handleListChange(missionId, index, 'name', e.target.value)}
                                        style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
                                    />
                                </td>
                                <td style={{ padding: '8px', borderBottom: '1px solid #E5E7EB' }}>
                                    <input 
                                        type="text" 
                                        value={item.organization} 
                                        onChange={(e) => handleListChange(missionId, index, 'organization', e.target.value)}
                                        style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
                                    />
                                </td>
                                <td style={{ padding: '8px', borderBottom: '1px solid #E5E7EB' }}>
                                    <input 
                                        type="text" 
                                        value={item.region} 
                                        onChange={(e) => handleListChange(missionId, index, 'region', e.target.value)}
                                        style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
                                    />
                                </td>
                                <td style={{ padding: '8px', borderBottom: '1px solid #E5E7EB' }}>
                                    <button 
                                        onClick={() => handleDeleteListItem(missionId, index)}
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
                        onClick={() => handleAddListItem(missionId)}
                        style={{ backgroundColor: 'var(--color-btn-add)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer'}}
                    >
                        + 새 항목 추가
                    </button>
                    <button 
                        onClick={() => handleSave(missionId)}
                        disabled={saving}
                        style={{ backgroundColor: '#10B981', color: '#fff', padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer'}}
                    >
                        {saving ? '저장중...' : '변경사항 저장'}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div>
            <h2 style={{ fontSize: '24px',  marginBottom: '24px' }}>선교전도 관리</h2>
            
            {renderTableEditor('overseas')}
            {renderTableEditor('domestic')}

            {missions['evangelism'] && (
                <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '18px'}}>목요전도팀 안내</h3>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px'}}>문의처 연락처</label>
                        <input 
                            type="text" 
                            value={missions['evangelism'].contact || ''}
                            onChange={(e) => {
                                const newMissions = { ...missions };
                                newMissions['evangelism'].contact = e.target.value;
                                setMissions(newMissions);
                            }}
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                    </div>
                    <p style={{ color: '#6B7280', fontSize: '14px' }}>* 전도팀 상세 안내 사항 및 스케줄은 현재 고정 텍스트로 표시됩니다. 향후 상세 편집 기능이 추가될 수 있습니다.</p>
                    
                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
                        <button 
                            onClick={() => handleSave('evangelism')}
                            disabled={saving}
                            style={{ backgroundColor: '#10B981', color: '#fff', padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer'}}
                        >
                            {saving ? '저장중...' : '변경사항 저장'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMissions;

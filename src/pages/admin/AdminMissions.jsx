import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { DEFAULT_PRAYERS } from '../../content/outreach';

const AdminMissions = () => {
    const [missions, setMissions] = useState({});
    const [activeTab, setActiveTab] = useState('');
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
            if (Object.keys(data).length > 0) {
                setActiveTab('overseas');
            }
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
        newMissions[missionId].list.push({ name: '', organization: '', region: '', group: '' });
        setMissions(newMissions);
    };

    const handleDeleteListItem = (missionId, index) => {
        if (!window.confirm('삭제하시겠습니까?')) return;
        const newMissions = { ...missions };
        newMissions[missionId].list.splice(index, 1);
        setMissions(newMissions);
    };

    // 목요전도팀 기도 제목: 저장된 값이 없으면 페이지에 보이는 기본 문구로 채워 둔다
    const getPrayers = () => {
        const saved = missions['evangelism']?.prayers || {};
        return {
            monthLabel: saved.monthLabel ?? DEFAULT_PRAYERS.monthLabel,
            month: saved.month ?? DEFAULT_PRAYERS.month,
            items: saved.items ?? DEFAULT_PRAYERS.items.map((item) => ({ ...item })),
        };
    };

    const updatePrayers = (changes) => {
        const newMissions = { ...missions };
        newMissions['evangelism'] = { ...newMissions['evangelism'], prayers: { ...getPrayers(), ...changes } };
        setMissions(newMissions);
    };

    const handlePrayerItemChange = (index, field, value) => {
        const items = getPrayers().items.map((item, i) => (i === index ? { ...item, [field]: value } : item));
        updatePrayers({ items });
    };

    const handleDeletePrayerItem = (index) => {
        if (!window.confirm('삭제하시겠습니까?')) return;
        updatePrayers({ items: getPrayers().items.filter((_, i) => i !== index) });
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
                            <th style={{ padding: '12px', borderBottom: '1px solid #E5E7EB' }}>묶음</th>
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
                                    <input
                                        type="text"
                                        value={item.group || ''}
                                        placeholder="예: 침례교 해외선교회(FMB)"
                                        onChange={(e) => handleListChange(missionId, index, 'group', e.target.value)}
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
                <p style={{ color: '#6B7280', fontSize: '14px', marginTop: '12px' }}>
                    * 묶음이 같은 분들은 홈페이지에서 '묶음 이름. 지역 이름 · 지역 이름'처럼 한 문단으로 이어져요. 한 묶음 안의 소속기관이 모두 같으면 소속기관은 줄마다 쓰지 않아요.
                </p>

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
            
            {Object.keys(missions).length > 0 && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
                    {['overseas', 'domestic', 'evangelism'].map(missionId => {
                        if (!missions[missionId]) return null;
                        return (
                            <button
                                key={missionId}
                                onClick={() => setActiveTab(missionId)}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: activeTab === missionId ? '#1F2937' : '#F3F4F6',
                                    color: activeTab === missionId ? '#fff' : '#4B5563',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '15px'
                                }}
                            >
                                {missionId === 'overseas' ? '해외 선교' : missionId === 'domestic' ? '국내 선교' : '목요전도팀'}
                            </button>
                        );
                    })}
                </div>
            )}

            {activeTab === 'overseas' && renderTableEditor('overseas')}
            {activeTab === 'domestic' && renderTableEditor('domestic')}

            {activeTab === 'evangelism' && missions['evangelism'] && (
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

                    <h3 style={{ fontSize: '18px', margin: '32px 0 8px' }}>기도 제목</h3>
                    <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '16px' }}>* 홈페이지 '함께 기도해 주세요.'에 나와요. 맨 위 짙은 카드가 이달의 기도 제목이에요.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '8px', marginBottom: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px'}}>제목 앞말</label>
                            <input
                                type="text"
                                value={getPrayers().monthLabel}
                                placeholder="예: 10월"
                                onChange={(e) => updatePrayers({ monthLabel: e.target.value })}
                                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                            />
                            <span style={{ display: 'block', marginTop: '4px', color: '#6B7280', fontSize: '13px' }}>'{getPrayers().monthLabel || '이번 달'} 기도 제목'</span>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px'}}>이달의 기도 제목</label>
                            <textarea
                                value={getPrayers().month}
                                onChange={(e) => updatePrayers({ month: e.target.value })}
                                rows={3}
                                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical', font: 'inherit' }}
                            />
                        </div>
                    </div>
                    {getPrayers().items.map((item, index) => (
                        <div key={index} style={{ display: 'grid', gridTemplateColumns: '160px 1fr auto', gap: '8px', marginBottom: '8px', alignItems: 'start' }}>
                            <input
                                type="text"
                                value={item.title}
                                placeholder="제목 (예: 아이들)"
                                aria-label={`기도 제목 ${index + 1} 제목`}
                                onChange={(e) => handlePrayerItemChange(index, 'title', e.target.value)}
                                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                            />
                            <input
                                type="text"
                                value={item.text}
                                placeholder="내용"
                                aria-label={`기도 제목 ${index + 1} 내용`}
                                onChange={(e) => handlePrayerItemChange(index, 'text', e.target.value)}
                                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                            />
                            <button
                                onClick={() => handleDeletePrayerItem(index)}
                                style={{ backgroundColor: '#EF4444', color: '#fff', border: 'none', padding: '8px 10px', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                삭제
                            </button>
                        </div>
                    ))}

                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
                        <button
                            onClick={() => updatePrayers({ items: [...getPrayers().items, { title: '', text: '' }] })}
                            style={{ backgroundColor: 'var(--color-btn-add)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer'}}
                        >
                            + 기도 제목 추가
                        </button>
                    </div>

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

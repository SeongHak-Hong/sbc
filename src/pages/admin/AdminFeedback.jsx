import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy, Timestamp, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import AdminCloseButton from '../../components/ui/AdminCloseButton';

const AdminFeedback = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'create' | 'detail'
    const [currentFeedback, setCurrentFeedback] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    // Form state
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [priority, setPriority] = useState('normal'); // 'normal' | 'high'

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'adminFeedbacks'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const data = [];
            querySnapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });
            setFeedbacks(data);
        } catch (error) {
            console.error('피드백 불러오기 실패:', error);
            alert('데이터를 불러오지 못했습니다.');
        } finally {
            setLoading(false);
            setCurrentPage(1);
        }
    };

    const handleCreateNew = () => {
        setTitle('');
        setContent('');
        setPriority('normal');
        setCurrentFeedback(null);
        setViewMode('create');
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }

        if (!window.confirm('새로운 개발/수정 요청을 등록하시겠습니까?')) return;

        try {
            const newId = crypto.randomUUID();
            await setDoc(doc(db, 'adminFeedbacks', newId), {
                title: title.trim(),
                content: content.trim(),
                priority,
                status: 'pending',
                authorEmail: auth.currentUser?.email || '알 수 없음',
                createdAt: Timestamp.now()
            });
            
            alert('피드백이 성공적으로 등록되었습니다.');
            setViewMode('list');
            fetchFeedbacks();
        } catch (error) {
            console.error('등록 실패:', error);
            alert('오류가 발생했습니다.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('정말 이 요청을 삭제하시겠습니까? (복구 불가)')) return;
        
        try {
            await deleteDoc(doc(db, 'adminFeedbacks', id));
            alert('삭제되었습니다.');
            setViewMode('list');
            fetchFeedbacks();
        } catch (error) {
            console.error('삭제 실패:', error);
            alert('오류가 발생했습니다.');
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'pending' ? 'resolved' : 'pending';
        const actionStr = newStatus === 'resolved' ? '완료 처리' : '대기 상태로 변경';
        
        if (!window.confirm(`이 항목을 ${actionStr}하시겠습니까?`)) return;

        try {
            await updateDoc(doc(db, 'adminFeedbacks', id), {
                status: newStatus,
                resolvedAt: newStatus === 'resolved' ? Timestamp.now() : null
            });
            alert(`${actionStr} 되었습니다.`);
            fetchFeedbacks();
            if (currentFeedback && currentFeedback.id === id) {
                setCurrentFeedback(prev => ({...prev, status: newStatus}));
            }
        } catch (error) {
            console.error('상태 변경 실패:', error);
            alert('상태 변경 중 오류가 발생했습니다.');
        }
    };

    const renderList = () => (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>개발 / 수정 요청 (피드백)</h1>
                <p style={styles.subtitle}>사이트 기능이나 데이터와 관련된 수정 사항을 개발자에게 요청합니다.</p>
                <div style={{ marginTop: '20px' }}>
                    <button onClick={handleCreateNew} style={styles.createBtn}>+ 새 요청 작성하기</button>
                </div>
            </div>

            {loading ? (
                <div style={styles.loading}>불러오는 중...</div>
            ) : (
                <div style={styles.list}>
                    {feedbacks.length === 0 ? (
                        <div style={styles.empty}>등록된 피드백이 없습니다.</div>
                    ) : (
                        feedbacks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(fb => (
                            <div key={fb.id} style={styles.card} onClick={() => { setCurrentFeedback(fb); setViewMode('detail'); }}>
                                <div style={styles.cardHeader}>
                                    <span style={{
                                        ...styles.badge, 
                                        backgroundColor: fb.status === 'resolved' ? '#10B981' : '#F59E0B',
                                        color: fb.status === 'resolved' ? '#ECFDF5' : '#FFFBEB'
                                    }}>
                                        {fb.status === 'resolved' ? '처리 완료' : '대기중'}
                                    </span>
                                    {fb.priority === 'high' && (
                                        <span style={{...styles.badge, backgroundColor: '#EF4444', color: '#FEF2F2', marginLeft: '8px'}}>긴급</span>
                                    )}
                                    <span style={styles.date}>
                                        {fb.createdAt?.toDate ? fb.createdAt.toDate().toLocaleString() : ''}
                                    </span>
                                </div>
                                <h3 style={styles.cardTitle}>{fb.title}</h3>
                                <p style={styles.cardAuthor}>작성자: {fb.authorEmail}</p>
                            </div>
                        ))
                    )}
                </div>
            )}

            {!loading && feedbacks.length > itemsPerPage && (
                <div style={styles.pagination}>
                    {Array.from({ length: Math.ceil(feedbacks.length / itemsPerPage) }).map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentPage(idx + 1)}
                            style={{
                                ...styles.pageBtn,
                                backgroundColor: currentPage === idx + 1 ? '#3B82F6' : '#fff',
                                color: currentPage === idx + 1 ? '#fff' : '#374151',
                                border: currentPage === idx + 1 ? '1px solid #3B82F6' : '1px solid #D1D5DB'
                            }}
                        >
                            {idx + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );

    const renderCreateForm = () => (
        <div style={styles.container}>
            <AdminCloseButton onClick={() => setViewMode('list')} />
            <h1 style={{...styles.title, marginBottom: '24px'}}>새 요청 작성</h1>
            
            <form onSubmit={handleSave} style={styles.form}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>제목 *</label>
                    <input 
                        type="text" 
                        value={title} 
                        onChange={e => setTitle(e.target.value)} 
                        style={styles.input} 
                        placeholder="예) 오시는길 페이지의 버스 노선 추가 요청"
                        required 
                    />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>중요도</label>
                    <select 
                        value={priority} 
                        onChange={e => setPriority(e.target.value)} 
                        style={styles.input}
                    >
                        <option value="normal">일반</option>
                        <option value="high">긴급 (크리티컬 버그)</option>
                    </select>
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>요청 내용 *</label>
                    <textarea 
                        value={content} 
                        onChange={e => setContent(e.target.value)} 
                        style={{...styles.input, height: '200px', resize: 'vertical'}} 
                        placeholder="어떤 페이지의 어느 부분을 어떻게 수정해야 하는지 상세히 적어주세요."
                        required 
                    />
                </div>
                <div style={styles.buttonGroup}>
                    <button type="button" onClick={() => setViewMode('list')} style={styles.cancelBtn}>취소</button>
                    <button type="submit" style={styles.submitBtn}>등록하기</button>
                </div>
            </form>
        </div>
    );

    const renderDetail = () => {
        if (!currentFeedback) return null;
        return (
            <div style={styles.container}>
                
                <div style={styles.detailHeader}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px'}}>
                        <span style={{
                            ...styles.badge, 
                            backgroundColor: currentFeedback.status === 'resolved' ? '#10B981' : '#F59E0B',
                            color: currentFeedback.status === 'resolved' ? '#ECFDF5' : '#FFFBEB'
                        }}>
                            {currentFeedback.status === 'resolved' ? '처리 완료' : '대기중'}
                        </span>
                        {currentFeedback.priority === 'high' && (
                            <span style={{...styles.badge, backgroundColor: '#EF4444', color: '#FEF2F2'}}>긴급</span>
                        )}
                        <span style={styles.date}>작성일: {currentFeedback.createdAt?.toDate ? currentFeedback.createdAt.toDate().toLocaleString() : ''}</span>
                    </div>
                    <h1 style={{...styles.title, marginBottom: '8px'}}>{currentFeedback.title}</h1>
                    <p style={styles.cardAuthor}>작성자: {currentFeedback.authorEmail}</p>
                </div>

                <div style={styles.detailContent}>
                    {currentFeedback.content.split('\n').map((line, i) => (
                        <p key={i} style={{marginBottom: '8px'}}>{line || '\u00A0'}</p>
                    ))}
                </div>

                <div style={styles.detailActions}>
                    <button 
                        onClick={() => setViewMode('list')} 
                        style={styles.cancelBtn}
                    >
                        목록으로
                    </button>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button 
                            onClick={() => handleToggleStatus(currentFeedback.id, currentFeedback.status)} 
                            style={{
                                ...styles.actionBtn, 
                                backgroundColor: currentFeedback.status === 'pending' ? '#10B981' : '#F59E0B'
                            }}
                        >
                            {currentFeedback.status === 'pending' ? '✓ 완료 처리하기' : '대기중으로 되돌리기'}
                        </button>
                        <button 
                            onClick={() => handleDelete(currentFeedback.id)} 
                            style={{...styles.actionBtn, backgroundColor: '#EF4444'}}
                        >
                            삭제
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (viewMode === 'create') return renderCreateForm();
    if (viewMode === 'detail') return renderDetail();
    return renderList();
};

const styles = {
    container: {
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '24px'
    },
    header: {
        marginBottom: '32px'
    },
    title: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#111827',
        margin: '0 0 8px 0'
    },
    subtitle: {
        fontSize: '15px',
        color: '#6B7280',
        margin: 0
    },
    createBtn: {
        backgroundColor: '#3B82F6',
        color: '#fff',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '6px',
        fontSize: '15px',
        fontWeight: '500',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
        transition: 'background-color 0.2s'
    },
    list: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px'
    },
    card: {
        backgroundColor: '#fff',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    },
    cardHeader: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '12px'
    },
    badge: {
        padding: '4px 8px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: '600'
    },
    date: {
        fontSize: '13px',
        color: '#9CA3AF',
        marginLeft: 'auto'
    },
    cardTitle: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#1F2937',
        margin: '0 0 8px 0',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        wordBreak: 'break-word',
        lineHeight: '1.4'
    },
    cardAuthor: {
        fontSize: '13px',
        color: '#6B7280',
        margin: 0
    },
    empty: {
        textAlign: 'center',
        padding: '48px',
        color: '#6B7280',
        backgroundColor: '#F9FAFB',
        borderRadius: '8px',
        border: '1px dashed #D1D5DB'
    },
    form: {
        backgroundColor: '#fff',
        padding: '32px',
        borderRadius: '8px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
    },
    formGroup: {
        marginBottom: '24px'
    },
    label: {
        display: 'block',
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '8px'
    },
    input: {
        width: '100%',
        padding: '12px 16px',
        border: '1px solid #D1D5DB',
        borderRadius: '6px',
        fontSize: '15px',
        fontFamily: 'inherit',
        backgroundColor: '#fff',
        boxSizing: 'border-box'
    },
    buttonGroup: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        marginTop: '32px'
    },
    cancelBtn: {
        backgroundColor: '#fff',
        color: '#374151',
        border: '1px solid #D1D5DB',
        padding: '10px 24px',
        borderRadius: '6px',
        fontSize: '15px',
        fontWeight: '500',
        cursor: 'pointer'
    },
    submitBtn: {
        backgroundColor: '#10B981',
        color: '#fff',
        border: 'none',
        padding: '10px 24px',
        borderRadius: '6px',
        fontSize: '15px',
        fontWeight: '500',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
    },
    detailHeader: {
        backgroundColor: '#fff',
        padding: '24px 32px',
        borderRadius: '8px 8px 0 0',
        border: '1px solid #E5E7EB',
        borderBottom: 'none'
    },
    detailContent: {
        backgroundColor: '#F9FAFB',
        padding: '32px',
        border: '1px solid #E5E7EB',
        minHeight: '200px',
        fontSize: '15px',
        lineHeight: '1.6',
        color: '#374151',
        borderRadius: '0 0 8px 8px'
    },
    detailActions: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '24px'
    },
    actionBtn: {
        color: '#fff',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    loading: {
        textAlign: 'center',
        padding: '48px',
        color: '#6B7280'
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        marginTop: '32px'
    },
    pageBtn: {
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s'
    }
};

export default AdminFeedback;

import React, { useState } from 'react';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import migrationData from '../../migrationData.json';
import { motion } from 'framer-motion';

export default function Migration() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);

  if (auth.currentUser?.email !== 'ing6023@gmail.com') {
      return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#6B7280' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#EF4444', marginBottom: '16px' }}>lock</span>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1F2937', marginBottom: '8px' }}>접근 권한이 없습니다</h2>
              <p>이 페이지는 시스템 최고 관리자만 접근할 수 있습니다.</p>
          </div>
      );
  }

  const addLog = (msg) => setLogs(prev => [...prev, msg]);

  const handleMigration = async () => {
    if(!window.confirm('정말 성도 사업체 데이터를 이관하시겠습니까? 중복 데이터가 들어갈 수 있으니 최초 1회만 실행하세요.')) return;
    
    setLoading(true);
    setProgress(0);
    setLogs([]);

    const total = migrationData.length;
    let count = 0;

    for (const post of migrationData) {
      try {
        const dateObj = new Date(post.date);
        const newDocRef = doc(collection(db, 'memberBusiness'));
        
        const docData = {
          title: post.title,
          content: post.content || '',
          images: post.images || [],
          createdAt: dateObj,
          updatedAt: dateObj,
          author: post.author || '관리자',
          oldId: post.id
        };

        await setDoc(newDocRef, docData);
        count++;
        setProgress(Math.round((count / total) * 100));
        addLog(`[성공] 이관 완료: ${post.title}`);
      } catch (err) {
        addLog(`[실패] ${post.title} 이관 오류: ${err.message}`);
      }
    }

    setLoading(false);
    addLog('모든 마이그레이션 작업이 완료되었습니다!');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
      <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
              background: 'linear-gradient(135deg, #991B1B 0%, #DC2626 100%)',
              borderRadius: '16px',
              padding: '40px',
              color: '#fff',
              marginBottom: '32px',
              boxShadow: '0 10px 25px -5px rgba(220, 38, 38, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '20px'
          }}
      >
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#FEE2E2' }}>admin_panel_settings</span>
          <div>
              <h1 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 12px 0', letterSpacing: '-0.5px' }}>
                  성도 사업체 데이터 마이그레이션
              </h1>
              <p style={{ fontSize: '16px', color: '#FEE2E2', opacity: 0.9, lineHeight: '1.6', margin: 0 }}>
                  과거 홈페이지의 성도 사업체 데이터를 현재 Firestore 데이터베이스로 안전하게 이관하는 도구입니다.
              </p>
          </div>
      </motion.div>

      <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #F3F4F6' }}
      >
        <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FEF3C7', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#92400E', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>info</span>
                이관 대기 중인 데이터 안내
            </h3>
            <p style={{ color: '#B45309', margin: 0, lineHeight: '1.6' }}>
                총 <strong>{migrationData.length}</strong>개의 사업체 게시물이 이관 대기 중입니다.<br/>
                과거 홈페이지 서버의 이미지 접근 불가(404 에러)로 인해 텍스트 정보만 이관되며, 이미지는 나중에 별도로 수정하셔야 합니다.
            </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
          <button
            onClick={handleMigration}
            disabled={loading}
            style={{
                backgroundColor: loading ? '#9CA3AF' : '#DC2626',
                color: '#fff', padding: '14px 28px', borderRadius: '8px', border: 'none', 
                cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '16px',
                display: 'flex', alignItems: 'center', gap: '8px',
                transition: 'all 0.2s ease',
                boxShadow: loading ? 'none' : '0 4px 6px -1px rgba(220, 38, 38, 0.2)'
            }}
            onMouseEnter={(e) => { if(!loading) e.currentTarget.style.backgroundColor = '#B91C1C' }}
            onMouseLeave={(e) => { if(!loading) e.currentTarget.style.backgroundColor = '#DC2626' }}
          >
            {loading ? (
                <>
                    <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>sync</span>
                    이관 진행 중...
                </>
            ) : (
                <>
                    <span className="material-symbols-outlined">start</span>
                    마이그레이션 시작
                </>
            )}
          </button>
          
          {loading && (
            <div style={{ flex: 1, maxWidth: '400px' }}>
              <div style={{ height: '8px', backgroundColor: '#F3F4F6', borderRadius: '4px', overflow: 'hidden' }}>
                <div 
                  style={{ height: '100%', backgroundColor: '#DC2626', width: `${progress}%`, transition: 'width 0.3s ease' }}
                />
              </div>
              <p style={{ fontSize: '14px', color: '#6B7280', margin: '8px 0 0 0', fontWeight: '500' }}>
                  진행률: {progress}% 완료
              </p>
            </div>
          )}
        </div>

        <div style={{ backgroundColor: '#111827', padding: '24px', borderRadius: '12px', height: '320px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '14px' }}>
          {logs.length === 0 ? (
            <p style={{ color: '#4B5563', margin: 0 }}>대기 중... 실행하면 여기에 진행 로그가 표시됩니다.</p>
          ) : (
            logs.map((log, i) => (
              <div key={i} style={{ marginBottom: '6px', color: log.includes('오류') ? '#F87171' : '#34D399', lineHeight: '1.5' }}>
                {log}
              </div>
            ))
          )}
        </div>
      </motion.div>
      <style>{`
          @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
          }
      `}</style>
    </div>
  );
}

import React from 'react';
import seedDataToFirestore from '../../utils/seedData';

const AdminDashboard = () => {
    const handleSeedData = async () => {
        if(window.confirm('기존 하드코딩된 데이터들을 DB에 밀어넣으시겠습니까? 이 작업은 한 번만 수행하는 것이 좋습니다.')) {
            try {
                await seedDataToFirestore();
                alert('데이터 마이그레이션이 완료되었습니다!');
            } catch(e) {
                console.error(e);
                alert('오류가 발생했습니다: ' + e.message);
            }
        }
    };

    return (
        <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>대시보드 홈</h1>
            <p style={{ color: '#4B5563', marginBottom: '32px' }}>신탄진침례교회 웹사이트 관리자 페이지에 오신 것을 환영합니다.</p>
            
            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>데이터 마이그레이션 (Seeding)</h2>
                <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '16px', lineHeight: '1.5' }}>
                    웹사이트 소스코드에 하드코딩되어 있던 구역 안내, 다음세대, 선교전도 등의 데이터를 Firebase Firestore에 일괄 등록하는 기능입니다.<br/>
                    <strong>주의:</strong> 중복 데이터가 들어갈 수 있으므로 최초 세팅 시에만 1회 클릭해주세요.
                </p>
                <button 
                    onClick={handleSeedData}
                    style={{
                        backgroundColor: '#1E3A8A', color: '#fff', padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '500'
                    }}
                >
                    DB 일괄 등록 실행하기
                </button>
            </div>
        </div>
    );
};

export default AdminDashboard;

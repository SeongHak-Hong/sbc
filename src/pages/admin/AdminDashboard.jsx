import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import seedDataToFirestore from '../../utils/seedData';
import { auth } from '../../firebase';

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

    const quickLinks = [
        { title: '나눔터 (소식/주보)', desc: '교회 소식과 주보를 업로드하고 관리합니다.', icon: 'forum', path: '/manager-lounge/posts', color: '#3B82F6', bg: '#EFF6FF' },
        { title: '다음세대 관리', desc: '주일학교, 학생부 등 부서별 행사와 정보를 관리합니다.', icon: 'child_care', path: '/manager-lounge/nextgen', color: '#10B981', bg: '#ECFDF5' },
        { title: '구역 안내 관리', desc: '구역별 모임 안내 및 교구 정보를 관리합니다.', icon: 'groups', path: '/manager-lounge/cellgroups', color: '#F59E0B', bg: '#FFFBEB' },
        { title: '선교전도 관리', desc: '국내외 선교 현황 및 전도 관련 정보를 관리합니다.', icon: 'public', path: '/manager-lounge/missions', color: '#8B5CF6', bg: '#F5F3FF' },
        { title: '교회 일정 관리', desc: '교회의 주요 행사 및 월별 일정을 관리합니다.', icon: 'event', path: '/manager-lounge/schedule', color: '#EC4899', bg: '#FDF2F8' },
        { title: '성도 소식 관리', desc: '성도들의 경조사 및 특별한 소식을 관리합니다.', icon: 'diversity_1', path: '/manager-lounge/members-news', color: '#14B8A6', bg: '#F0FDFA' },
        { title: '성도 사업체 관리', desc: '성도들이 운영하는 사업체 정보를 등록하고 관리합니다.', icon: 'storefront', path: '/manager-lounge/member-business', color: '#F43F5E', bg: '#FFF1F2' },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
            {/* Hero Section */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
                    borderRadius: '16px',
                    padding: '40px',
                    color: '#fff',
                    marginBottom: '32px',
                    boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)'
                }}
            >
                <h1 style={{ fontSize: '32px',  marginBottom: '12px'}}>
                    환영합니다, 관리자님! 👋
                </h1>
                <p style={{ fontSize: '16px', color: '#DBEAFE', opacity: 0.9,  maxWidth: '600px' }}>
                    신탄진침례교회 웹사이트의 모든 콘텐츠를 관리할 수 있는 통합 대시보드입니다.<br/>
                    원하시는 메뉴를 선택하여 데이터를 간편하게 수정하고 업데이트하세요.
                </p>
            </motion.div>

            {/* Quick Links Grid */}
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '24px',
                    marginBottom: '48px'
                }}
            >
                {quickLinks.map((link, idx) => (
                    <motion.div key={idx} variants={itemVariants}>
                        <Link 
                            to={link.path}
                            style={{
                                display: 'block',
                                textDecoration: 'none',
                                backgroundColor: '#fff',
                                padding: '24px',
                                borderRadius: '16px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                                border: '1px solid #F3F4F6',
                                transition: 'all 0.3s ease',
                                height: '100%',
                                boxSizing: 'border-box'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                                e.currentTarget.style.borderColor = link.color;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)';
                                e.currentTarget.style.borderColor = '#F3F4F6';
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                <div style={{ 
                                    width: '48px', height: '48px', borderRadius: '12px', 
                                    backgroundColor: link.bg, color: link.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginRight: '16px'
                                }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }} translate="no">{link.icon}</span>
                                </div>
                                <h3 style={{ fontSize: '18px',  color: '#1F2937', margin: 0 }}>
                                    {link.title}
                                </h3>
                            </div>
                            <p style={{ color: '#6B7280', fontSize: '14px',  margin: 0 }}>
                                {link.desc}
                            </p>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>
            
            {/* System Zone for Migration */}
            {auth.currentUser?.email === 'ing6023@gmail.com' && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{ 
                        backgroundColor: '#FEF2F2', 
                        border: '1px solid #FECACA',
                        padding: '32px', 
                        borderRadius: '16px', 
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '24px'
                    }}
                >
                    <div style={{ 
                        backgroundColor: '#FEE2E2', color: '#EF4444', 
                        width: '56px', height: '56px', borderRadius: '14px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '28px' }} translate="no">warning</span>
                    </div>
                    <div>
                        <h2 style={{ fontSize: '20px',  color: '#991B1B', marginBottom: '8px', marginTop: 0 }}>시스템 관리 (System Administration)</h2>
                        <h3 style={{ fontSize: '16px',  color: '#B91C1C', marginBottom: '8px', marginTop: 0 }}>데이터 마이그레이션 (Seeding)</h3>
                        <p style={{ color: '#7F1D1D', fontSize: '15px', marginBottom: '20px',  maxWidth: '800px' }}>
                            웹사이트 소스코드에 하드코딩되어 있던 데이터를 Firebase Firestore DB로 일괄 등록합니다.<br/>
                            <strong>주의사항:</strong> 중복 데이터가 삽입될 수 있으므로 서버 초기 세팅 시에만 1회 클릭해야 합니다. 이 작업은 되돌릴 수 없습니다.
                        </p>
                        <button 
                            onClick={handleSeedData}
                            style={{
                                backgroundColor: '#DC2626', color: '#fff', padding: '12px 24px', 
                                borderRadius: '8px', border: 'none', cursor: 'pointer', 
                                 fontSize: '15px',
                                display: 'flex', alignItems: 'center', gap: '8px',
                                transition: 'background-color 0.2s',
                                boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.2)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B91C1C'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }} translate="no">database</span>
                            DB 일괄 등록 실행하기
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default AdminDashboard;

import React, { useEffect } from 'react';
import SubPageSection from '../components/SubPageSection';
import styles from './TeamPage.module.css';

const TeamPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Array of team members
    const teamMembers = [
        {
            name: '최영락',
            role: '담임목사',
            image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
            description: '말씀선포 및 목회총괄'
        },
        {
            name: '김정현',
            role: '부목사',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
            description: '1교구 및 유초등부 담당'
        },
        {
            name: '김윤섭',
            role: '부목사',
            image: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=400&q=80',
            description: '2교구 및 중고등부 담당'
        },
        {
            name: '강현수',
            role: '전도사',
            image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=400&q=80',
            description: '청년부 담당'
        },
        {
            name: '이지은',
            role: '교육전도사',
            image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
            description: '유치부 담당'
        },
        {
            name: '김태인',
            role: '행정간사',
            image: 'https://images.unsplash.com/photo-1542596594-649edbc13630?auto=format&fit=crop&w=400&q=80',
            description: '행정지원'
        }
    ];

    return (
        <div className={styles.pageWrapper}>
            <SubPageSection 
                title="섬기는 사람들" 
                subtitle={<p style={{ color: '#B6CDCA', marginTop: '16px', fontSize: '18px', textAlign: 'center' }}>신탄진침례교회를 섬기는 분들을 소개합니다.</p>}
            >
                <div className={styles.container}>
                    <div className={styles.teamGrid}>
                        {teamMembers.map((member, index) => (
                            <div key={index} className={styles.memberCard}>
                                <div className={styles.imageWrapper}>
                                    <img src={member.image} alt={member.name} />
                                </div>
                                <div className={styles.infoWrapper}>
                                    <h3 className={styles.memberName}>{member.name}</h3>
                                    <p className={styles.memberRole}>{member.role}</p>
                                    {member.description && (
                                        <p className={styles.memberDesc}>{member.description}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </SubPageSection>
        </div>
    );
};

export default TeamPage;

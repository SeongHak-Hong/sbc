import React, { useState, useEffect } from 'react';
import SubPageSection from '../components/SubPageSection';
import Footer from '../components/Footer';
import styles from './TeamPage.module.css';
import member01 from '../assets/team/shintanjin-baptist-church-member-01.webp';
import member01Hover from '../assets/team/shintanjin-baptist-church-member-01-hover.webp';
import member02 from '../assets/team/shintanjin-baptist-church-member-02.webp';
import member02Hover from '../assets/team/shintanjin-baptist-church-member-02-hover.webp';
import member03 from '../assets/team/shintanjin-baptist-church-member-03.webp';
import member03Hover from '../assets/team/shintanjin-baptist-church-member-03-hover.webp';
import member04 from '../assets/team/shintanjin-baptist-church-member-04.webp';
import member04Hover from '../assets/team/shintanjin-baptist-church-member-04-hover.webp';
import member05 from '../assets/team/shintanjin-baptist-church-member-05.webp';
import member05Hover from '../assets/team/shintanjin-baptist-church-member-05-hover.webp';
import member06 from '../assets/team/shintanjin-baptist-church-member-06.webp';
import member06Hover from '../assets/team/shintanjin-baptist-church-member-06-hover.webp';
import member07 from '../assets/team/shintanjin-baptist-church-member-07.webp';
import member07Hover from '../assets/team/shintanjin-baptist-church-member-07-hover.webp';

const TeamPage = () => {
    const [isInitialReveal, setIsInitialReveal] = useState(true);
    const [tappedMember, setTappedMember] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        
        // Hide hover images after 3 seconds
        const timer = setTimeout(() => {
            setIsInitialReveal(false);
        }, 3000);
        
        return () => clearTimeout(timer);
    }, []);

    // Array of team members
    const teamMembers = [
        {
            name: '최영락',
            role: '담임목사',
            image: member01,
            hoverImage: member01Hover,
            description: '말씀선포 및 목회총괄'
        },
        {
            name: '임현빈',
            role: '사모',
            image: member02,
            hoverImage: member02Hover,
            description: '담임목회 동역자'
        },
        {
            name: '김정현',
            role: '부목사',
            image: member03,
            hoverImage: member03Hover,
            description: '1교구 및 유초등부 담당'
        },
        {
            name: '김윤섭',
            role: '부목사',
            image: member04,
            hoverImage: member04Hover,
            description: '2교구 및 중고등부 담당'
        },
        {
            name: '이지은',
            role: '교육전도사',
            image: member07,
            hoverImage: member07Hover,
            description: '유치부 담당'
        },
        {
            name: '강현수',
            role: '전도사',
            image: member06,
            hoverImage: member06Hover,
            description: '청년부 담당'
        },
        {
            name: '김태인',
            role: '행정간사',
            image: member05,
            hoverImage: member05Hover,
            description: '행정지원'
        }
    ];

    const handleCardTap = (memberName) => {
        if (tappedMember === memberName) {
            setTappedMember(null);
        } else {
            setTappedMember(memberName);
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <SubPageSection 
                title="섬기는 사람들" 
                subtitle={<p style={{ color: 'rgba(var(--color-text-dark-rgb), 0.7)', fontSize: '18px', textAlign: 'center' }}>신탄진침례교회를 섬기는 분들을 소개합니다.</p>}
            >
                <div className={styles.container}>
                    {[
                        { title: '담임목사 및 사모', members: teamMembers.filter(m => m.role === '담임목사' || m.role === '사모') },
                        { title: '부목사', members: teamMembers.filter(m => m.role === '부목사') },
                        { title: '전도사', members: teamMembers.filter(m => m.role.includes('전도사')) },
                        { title: '직원', members: teamMembers.filter(m => m.role === '행정간사' || m.role.includes('직원')) }
                    ].map((category, catIdx) => {
                        if (category.members.length === 0) return null;
                        return (
                            <div key={catIdx} className={styles.categorySection}>
                                <h2 className={styles.categoryTitle}>{category.title}</h2>
                                <div className={styles.teamGrid}>
                                    {category.members.map((member, index) => (
                                        <div 
                                            key={index} 
                                            className={`${styles.memberCard} ${tappedMember === member.name ? styles.tapped : ''}`}
                                            onClick={() => handleCardTap(member.name)}
                                        >
                                            <div className={styles.imageWrapper}>
                                                <img className={styles.baseImage} src={member.image} alt={member.name} />
                                                {member.hoverImage && (
                                                    <img 
                                                        className={`${styles.hoverImage} ${isInitialReveal ? styles.initialReveal : ''}`} 
                                                        src={member.hoverImage} 
                                                        alt={`${member.name} hover`} 
                                                    />
                                                )}
                                            </div>
                                            <div className={styles.infoWrapper}>
                                                <h3 className={styles.memberName}>{member.name}</h3>
                                                {member.description && (
                                                    <p className={styles.memberDesc}>{member.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </SubPageSection>
            <Footer />
        </div>
    );
};

export default TeamPage;

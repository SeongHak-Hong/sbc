import React, { useEffect } from 'react';
import SubPageSection from '../components/SubPageSection';
import ScrollFadeText from '../components/ScrollFadeText';
import Footer from '../components/Footer';
import styles from './TeamPage.module.css';
import member01 from '../assets/team/shintanjin-baptist-church-member-01.webp';

import member02 from '../assets/team/shintanjin-baptist-church-member-02.webp';

import member03 from '../assets/team/shintanjin-baptist-church-member-03.webp';

import member04 from '../assets/team/shintanjin-baptist-church-member-04.webp';

import member05 from '../assets/team/shintanjin-baptist-church-member-05.webp';

import member06 from '../assets/team/shintanjin-baptist-church-member-06.webp';

import member07 from '../assets/team/shintanjin-baptist-church-member-07.webp';


import Breadcrumb from "../components/ui/Breadcrumb";

const TeamPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Array of team members
    const teamMembers = [
        {
            name: '최영락',
            role: '담임목사',
            image: member01,
            description: '말씀선포 및 목회총괄'
        },
        {
            name: '임현빈',
            role: '사모',
            image: member02,
            description: '담임목회 동역자'
        },
        {
            name: '김정현',
            role: '부목사',
            image: member03,
            description: '1교구 및 유초등부 담당'
        },
        {
            name: '김윤섭',
            role: '부목사',
            image: member04,
            description: '2교구 및 중고등부 담당'
        },
        {
            name: '이지은',
            role: '교육전도사',
            image: member07,
            description: '유치부 담당'
        },
        {
            name: '강현수',
            role: '전도사',
            image: member06,
            description: '청년부 담당'
        },
        {
            name: '김태인',
            role: '행정간사',
            image: member05,
            description: '행정지원'
        }
    ];


    return (
        <div className={styles.pageWrapper}>
            <SubPageSection hideHeader={true}>
                <div style={{ textAlign: 'center' }}>
                    <Breadcrumb text="교회 소개 - 섬기는 사람들" />
                    <ScrollFadeText
                        text={"따뜻한 마음과 기쁨으로\n교회를 섬기는 분들을 소개해요."}
                        as="h1"
                        className="main-page-title"
                        once={true}
                    />
                </div>
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
                                            className={styles.memberCard}
                                        >
                                            <div className={styles.imageWrapper}>
                                                <img className={styles.baseImage} src={member.image} alt={member.name} />
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

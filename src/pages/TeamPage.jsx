import React, { useEffect } from 'react';
import SubPageSection from '../components/SubPageSection';
import Footer from '../components/Footer';
import styles from './TeamPage.module.css';
import PageTopGradient from '../components/PageTopGradient';
import member01 from '../assets/team/shintanjin-baptist-church-member-01.webp';
import member02 from '../assets/team/shintanjin-baptist-church-member-02.webp';
import member03 from '../assets/team/shintanjin-baptist-church-member-03.webp';
import member04 from '../assets/team/shintanjin-baptist-church-member-04.webp';
import member05 from '../assets/team/shintanjin-baptist-church-member-05.webp';
import member06 from '../assets/team/shintanjin-baptist-church-member-06.webp';
import member07 from '../assets/team/shintanjin-baptist-church-member-07.webp';
import activeElder from '../assets/team/shintanjin-baptist-church-member-active-elder.webp';
import seniorElder01 from '../assets/team/shintanjin-baptist-church-member-senior-elder-01.webp';
import seniorElder02 from '../assets/team/shintanjin-baptist-church-member-senior-elder-02.webp';
import seniorElder04 from '../assets/team/shintanjin-baptist-church-member-senior-elder-04.webp';
import seniorElder05 from '../assets/team/shintanjin-baptist-church-member-senior-elder-05.webp';
import seniorElder06 from '../assets/team/shintanjin-baptist-church-member-senior-elder-06.webp';
import seniorElder07 from '../assets/team/shintanjin-baptist-church-member-senior-elder-07.webp';
import seniorElder08 from '../assets/team/shintanjin-baptist-church-member-senior-elder-08.webp';

// 그룹별 섬기는 사람들. lead: 담임목사·사모는 한 줄 3칸으로 조금 크게
// 원로장로 사진 번호는 가나다순: 01 고석천 02 김중호 03 김태식 04 박찬옥 05 서용태 06 안억균 07 오철세 08 임종천 09 황규현
// 03·09는 사진이 오면 senior-elder-03/09.webp를 import해서 아래 표시해 둔 자리에 추가
const groups = [
    {
        title: '담임목사 및 사모',
        lead: true,
        members: [
            { name: '최영락', role: '담임목사', image: member01, description: '말씀선포 및 목회총괄' },
            { name: '임현빈', role: '사모', image: member02, description: '담임목회 동역자' },
        ],
    },
    {
        title: '부목사',
        members: [
            { name: '김정현', role: '부목사', image: member03, description: '1교구 및 유초등부 담당' },
            { name: '김윤섭', role: '부목사', image: member04, description: '2교구 및 중고등부 담당' },
        ],
    },
    {
        title: '전도사',
        members: [
            { name: '이지은', role: '교육전도사', image: member06, description: '유치부 담당' },
            { name: '강현수', role: '전도사', image: member05, description: '청년부 담당' },
        ],
    },
    {
        title: '시무장로',
        members: [
            { name: '윤광식', role: '시무장로', image: activeElder },
        ],
    },
    {
        title: '원로장로',
        members: [
            // 표시 순서는 교회가 정한 순서 (사진 번호와 무관)
            { name: '김중호', role: '원로장로', image: seniorElder02 },
            { name: '박찬옥', role: '원로장로', image: seniorElder04 },
            { name: '임종천', role: '원로장로', image: seniorElder08 },
            // 황규현 (사진 추가 예정, senior-elder-09)
            { name: '서용태', role: '원로장로', image: seniorElder05 },
            { name: '안억균', role: '원로장로', image: seniorElder06 },
            { name: '고석천', role: '원로장로', image: seniorElder01 },
            { name: '오철세', role: '원로장로', image: seniorElder07 },
            // 김태식 (사진 추가 예정, senior-elder-03)
        ],
    },
    {
        title: '직원',
        members: [
            { name: '김태인', role: '행정간사', image: member07, description: '행정지원' },
        ],
    },
];

const TeamPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className={styles.pageWrapper}>
            <PageTopGradient />
            <SubPageSection hideHeader={true} className={styles.section}>
                {/* 사진 명단이 스스로 설명하므로 화면 제목은 없이, 화면 낭독기·검색용 h1만 둔다 */}
                <h1 className={styles.srOnly}>섬기는 사람들</h1>

                {groups.map((group) => (
                    <section key={group.title} className={styles.group} aria-labelledby={`team-${group.title}`}>
                        <h2 id={`team-${group.title}`} className={styles.groupTitle}>{group.title}</h2>
                        <ul className={`${styles.grid} ${group.lead ? styles.gridLead : ''}`}>
                            {group.members.map((member, index) => (
                                <li key={`${member.role}-${index}`} className={styles.card}>
                                    <div className={styles.photoWrap}>
                                        <img
                                            className={styles.photo}
                                            src={member.image}
                                            alt={member.name ? `${member.name} ${member.role}` : member.role}
                                            loading={group.lead ? 'eager' : 'lazy'}
                                            decoding="async"
                                            width="960"
                                            height="1280"
                                        />
                                    </div>
                                    {/* 직분은 그룹 제목에 있어 이름 옆에선 생략하고 담당 업무만 쓴다 */}
                                    <div className={styles.caption}>
                                        <h3 className={styles.name}>{member.name || member.role}</h3>
                                        {member.description && (
                                            <p className={styles.desc}>{member.description}</p>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </SubPageSection>
            <Footer />
        </div>
    );
};

export default TeamPage;

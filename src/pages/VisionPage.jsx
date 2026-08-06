import React, { useEffect } from 'react';
import styles from './VisionPage.module.css';

import pastorIDImage from '../assets/vision/shintanjin-baptist-church-pastor-ID-photo-00.webp';
import pastorSignImage from '../assets/vision/shintanjin-baptist-church-pastor-sign.webp';
import visionIcon from '../assets/vision/shintanjin-baptist-church-vision-icon.webp';

import Footer from '../components/Footer';
import SubPageSection from '../components/SubPageSection';

const VisionPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className={styles.pageContainer}>
            <main className={styles.mainContent}>
                <SubPageSection title="인사말 · 비전" engTitle="Vision" icon={visionIcon}>
                    <div className={styles.greetingWrapper}>
                        <div className={styles.greetingGrid}>
                            <div className={styles.photoCol}>
                                <img 
                                    src={pastorIDImage}
                                    alt="담임목사 프로필"
                                    className={styles.profileImage}
                                />
                            </div>
                            <div className={styles.textCol}>
                                <h3 className={styles.greetingTitle}>
                                    할렐루야! 신탄진침례교회를 찾아주신 여러분께<br />
                                    하나님의 은총과 평강이 함께하시기를 축복합니다.
                                </h3>
                                <div className={styles.greetingBody}>
                                    우리 교회는 1954년 신탄진 지역에 가장 먼저 세워져, 지난 70여 년 동안 하나님의 은혜 속에서 든든히 걸어왔습니다. 이제 우리는 지나온 시간에 머무르지 않고, 우리에게 맡겨주신 21세기의 새로운 비전을 향해 나아가고자 합니다. 가르치고, 치유하며, 천국 복음을 전하셨던 예수님의 발자취를 따라 복음을 전파하고, 말씀으로 성도를 양육하며, 사람을 살리고 세우는 일에 정진하겠습니다. 이 거룩한 사명에 동참하여 그리스도인으로 함께 자라갈 모든 분을 기쁘게 환영합니다. 우리 교회를 찾는 모든 분이 예수님을 만나 위로와 치유를 경험하고, 진정한 주님의 제자로 세워지기를 간절히 축원합니다.
                                </div>
                                <div className={styles.signatureWrap}>
                                    <div className={styles.signatureText}>
                                        주님의 크신 은혜 안에서<br />
                                        담임목사 최영락 올림
                                    </div>
                                    <img 
                                        src={pastorSignImage}
                                        alt="담임목사 서명"
                                        className={styles.signImage}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </SubPageSection>
            </main>
            <Footer />
        </div>
    );
};

export default VisionPage;

import React, { useEffect } from 'react';
import Footer from '../components/Footer';
import styles from './NurturePage.module.css';

const NurturePage = () => {
    useEffect(() => {
        // Scroll to top when page is mounted
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className={`${styles.pageWrapper} ${styles.bgDots}`}>
            <div className="global-texture-overlay"></div>
            {/* Background blur elements */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '40%', height: '40%', borderRadius: '50%', backgroundColor: '#fff', opacity: 0.4, filter: 'blur(64px)' }}></div>
                <div style={{ position: 'absolute', top: '20%', right: '-10%', width: '50%', height: '50%', borderRadius: '50%', backgroundColor: '#fff', opacity: 0.4, filter: 'blur(64px)' }}></div>
                <div style={{ position: 'absolute', bottom: '-10%', left: '20%', width: '60%', height: '60%', borderRadius: '50%', backgroundColor: '#fff', opacity: 0.4, filter: 'blur(64px)' }}></div>
            </div>

            {/* Header Section */}
            <header className={styles.header}>
                <div style={{ position: 'absolute', top: '80px', left: '40px', transform: 'rotate(-15deg)', opacity: 0.7, display: 'none' }} className="md-block">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FFAE82" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                </div>
                <div style={{ position: 'absolute', top: '112px', right: '40px', transform: 'rotate(15deg)', opacity: 0.7, display: 'none' }} className="md-block">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#B0DCEE" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                </div>

                <span className={`${styles.handwriting} ${styles.eyebrow}`}>
                    반가워요, 진심으로 환영합니다!
                </span>
                <h1 className={styles.headerTitle}>
                    새가족 안내 및 양육
                    <svg style={{ position: 'absolute', width: '100%', height: '16px', bottom: '-8px', left: 0, color: '#FFAE82', opacity: 0.6 }} viewBox="0 0 200 12" preserveAspectRatio="none">
                        <path d="M0,8 C40,-2 60,14 100,6 C140,-2 160,14 200,6" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"></path>
                    </svg>
                </h1>
                <p className={styles.headerSubtitle}>
                    신탄진교회라는 새로운 가족을 만나신 여러분을 축복합니다.<br />
                    낯선 발걸음이 편안한 쉼이 될 수 있도록,<br />
                    정착의 모든 여정을 따뜻하게 곁에서 동행하겠습니다.
                </p>
            </header>

            {/* Journey Section */}
            <section className={styles.section}>
                <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: '0 var(--grid-margin)', textAlign: 'center', marginBottom: '40px' }}>
                    <h2 className={styles.sectionTitle}>새가족 정착 여정</h2>
                    <p className={`${styles.handwriting}`} style={{ marginTop: '8px' }}>우리 교회에 스며드는 따뜻한 4단계의 시간입니다.</p>
                </div>

                <div className={styles.scrollContainer}>
                    <div className={styles.scrollFlex}>
                        <div className={styles.dashedLine}></div>

                        {/* Step 1 */}
                        <div className={styles.stepCard}>
                            <div className={styles.stepBadge} style={{ backgroundColor: '#FFAE82' }}>1단계</div>
                            <div className={styles.stepIconWrap} style={{ backgroundColor: '#E5F3F9' }}>
                                🐻<span style={{ position: 'absolute', top: 0, right: 0, fontSize: '1.5rem' }}>✨</span>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <h4 className={styles.stepTitle}>새가족 등록</h4>
                                <p className={styles.stepDesc}>등록카드 작성 후, 거주 지역이나 인도자에 따라 교구가 배정됩니다. 각 교구 목사님의 따뜻한 환영과 첫 안내를 받게 됩니다.</p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className={`${styles.stepCard} ${styles.stepCardDown}`}>
                            <div className={styles.stepBadge} style={{ backgroundColor: '#FFD166', color: '#78350f', borderColor: '#ffffff' }}>2단계</div>
                            <div className={styles.stepIconWrap} style={{ backgroundColor: '#fffbeb' }}>🦊</div>
                            <div style={{ textAlign: 'center' }}>
                                <h4 className={styles.stepTitle}>새가족 교육 (6주)</h4>
                                <p className={styles.stepDesc}>교육이 진행되는 6주 동안 각 교구의 지원팀이 함께합니다. 편안한 예배와 교육 참석을 위해 곁에서 꼼꼼히 돕고 안내해 드립니다.</p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className={styles.stepCard}>
                            <div className={styles.stepBadge} style={{ backgroundColor: '#06D6A0', color: '#134e4a' }}>3단계</div>
                            <div className={styles.stepIconWrap} style={{ backgroundColor: '#f0fdfa' }}>🐰</div>
                            <div style={{ textAlign: 'center' }}>
                                <h4 className={styles.stepTitle}>수료 및 목장 배정</h4>
                                <p className={styles.stepDesc}>6주간의 새가족 교육을 무사히 마치면, 성도님의 상황에 가장 알맞은 교구 내 목장에 배정되어 풍성한 교제를 시작합니다.</p>
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className={`${styles.stepCard} ${styles.stepCardDown}`}>
                            <div className={styles.stepBadge} style={{ backgroundColor: '#118AB2', color: '#ffffff' }}>4단계</div>
                            <div className={styles.stepIconWrap} style={{ backgroundColor: '#f0f9ff' }}>🦉</div>
                            <div style={{ textAlign: 'center' }}>
                                <h4 className={styles.stepTitle}>침례 & 새가족환영회</h4>
                                <p className={styles.stepDesc}>예수님을 구주로 영접한 분들은 침례를 통해 진정한 교인이 됩니다. 환영회에서 담임목사님의 비전을 나누며 같은 공동체의 DNA를 품게 됩니다.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Scrapbook Section */}
            <section style={{ padding: '96px var(--grid-margin)', maxWidth: 'var(--max-width)', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '64px', position: 'relative' }}>
                    <svg style={{ position: 'absolute', top: 0, right: '25%', width: '96px', height: '96px', color: '#FFAE82', opacity: 0.2, zIndex: -1 }} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10,50 Q30,10 50,50 T90,50"></path>
                        <path d="M20,60 Q40,20 60,60 T100,60"></path>
                    </svg>
                    <h2 className={styles.sectionTitle}>우리들의 스크랩북</h2>
                    <p style={{ marginTop: '16px', maxWidth: '42rem', margin: '16px auto 0' }}>
                        함께 웃고, 기도하며, 사랑을 나누는 신탄진교회 가족들의 따뜻한 일상입니다.<br />
                        곧 여러분과 함께할 빛나는 순간들도 이곳에 가득 채워지기를 소망합니다.
                    </p>
                </div>

                <div className={styles.scrapbookGrid}>
                    {/* Photo 1 */}
                    <div className={styles.polaroid} style={{ transform: 'rotate(-3deg)' }}>
                        <div className={`${styles.tape} ${styles.tapeTexture}`} style={{ top: 0, left: '50%', transform: 'translate(-50%, -12px) rotate(-4deg)', width: '112px', height: '32px', backgroundColor: '#FDCBDE' }}></div>
                        <div className={styles.photoFrame} style={{ aspectRatio: '4/3', backgroundColor: '#E2E8F0' }}>
                            <svg style={{ width: '48px', height: '48px', color: '#94a3b8', opacity: 0.5 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                        </div>
                        <div className={styles.photoText}>
                            <p className={styles.handwriting}>따뜻했던 봄날의 피크닉 🧺</p>
                        </div>
                    </div>

                    {/* Photo 2 */}
                    <div className={styles.polaroid} style={{ transform: 'rotate(2deg)', marginTop: '48px' }}>
                        <div className={`${styles.tape} ${styles.tapeTexture}`} style={{ top: 0, left: 0, transform: 'translate(-16px, -16px) rotate(-35deg)', width: '80px', height: '32px', backgroundColor: '#FDF1B6' }}></div>
                        <div className={styles.photoFrame} style={{ aspectRatio: '3/4', backgroundColor: '#CBD5E1' }}>
                            <svg style={{ width: '48px', height: '48px', color: '#f8fafc', opacity: 0.5 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                        </div>
                        <div className={styles.photoText}>
                            <p className={styles.handwriting}>웃음꽃 피는 주일학교 놀이 시간 🎈</p>
                        </div>
                    </div>

                    {/* Photo 3 */}
                    <div className={styles.polaroid} style={{ transform: 'rotate(-1deg)' }}>
                        <div className={`${styles.tape} ${styles.tapeTexture}`} style={{ top: 0, left: '24px', transform: 'translateY(-12px) rotate(-8deg)', width: '96px', height: '32px', backgroundColor: '#D2F0E0' }}></div>
                        <div className={styles.photoFrame} style={{ aspectRatio: '1/1', backgroundColor: '#94A3B8' }}>
                            <svg style={{ width: '48px', height: '48px', color: '#e2e8f0', opacity: 0.5 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                        </div>
                        <div className={styles.photoText}>
                            <p className={styles.handwriting}>은혜가 풍성한 주일 예배 🙏</p>
                        </div>
                    </div>

                    {/* Photo 4 */}
                    <div className={styles.polaroid} style={{ transform: 'rotate(4deg)' }}>
                        <div className={`${styles.tape} ${styles.tapeTexture}`} style={{ top: 0, right: '32px', transform: 'translateY(-12px) rotate(12deg)', width: '80px', height: '28px', backgroundColor: '#FDCBDE' }}></div>
                        <div className={styles.photoFrame} style={{ aspectRatio: '4/3', backgroundColor: '#E2E8F0' }}>
                            <svg style={{ width: '48px', height: '48px', color: '#94a3b8', opacity: 0.5 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                        </div>
                        <div className={styles.photoText}>
                            <p className={styles.handwriting}>성도들과 나누는 맛있는 한 끼 식사 🍲</p>
                        </div>
                    </div>

                    {/* Photo 5 */}
                    <div className={styles.polaroid} style={{ transform: 'rotate(-2deg)', marginTop: '32px' }}>
                        <div className={`${styles.tape} ${styles.tapeTexture}`} style={{ top: 0, left: '50%', transform: 'translate(-50%, -12px) rotate(3deg)', width: '96px', height: '32px', backgroundColor: '#B0DCEE' }}></div>
                        <div className={styles.photoFrame} style={{ aspectRatio: '1/1', backgroundColor: '#CBD5E1' }}>
                            <svg style={{ width: '48px', height: '48px', color: '#f8fafc', opacity: 0.5 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                        </div>
                        <div className={styles.photoText}>
                            <p className={styles.handwriting}>다 함께 공동체 정원 가꾸기 🌱</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Keep the original Footer */}
            <Footer />
        </div>
    );
};

export default NurturePage;

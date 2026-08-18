import React, { useState, useEffect } from 'react';
import { BlurFade } from './ui/BlurFade';
import LargeButton from './ui/LargeButton';
import { InfiniteSlider } from './ui/InfiniteSlider';

// Dynamically import 10 images from the history folder
const imageModules = import.meta.glob('../assets/history/shintanjin-baptist-church-history-*.webp', { eager: true, import: 'default' });
const historyImages = Object.entries(imageModules)
    .sort(([pathA], [pathB]) => pathA.localeCompare(pathB))
    .slice(0, 10) // Limit to 10 images
    .map(([path, url], index) => {
        return {
            id: `history-${index}`,
            image: url
        };
    });

const GallerySection = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const sectionStyle = {
        position: 'relative',
        zIndex: 10,
        width: '100%',
        height: '100vh',
        minHeight: '100vh',
        padding: '180px 0',
        backgroundColor: 'var(--color-background-beige)',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden'
    };

    const titleContainerStyle = {
        marginBottom: '48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'flex-end',
        padding: isMobile ? '0 24px' : '0 48px',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '24px' : '0'
    };

    const trackWrapperStyle = {
        width: '100%',
        overflow: 'hidden', // Ensures the infinite slider doesn't create horizontal scrollbars
        flex: 1, // Takes up remaining height
        display: 'flex',
        alignItems: 'center',
        paddingBottom: '24px'
    };

    return (
        <section style={sectionStyle}>
            {/* Title & Button */}
            <div style={titleContainerStyle}>
                <BlurFade delay={0.25} inView>
                    <h2 style={{ 
                        fontFamily: 'var(--font-yuhan)',
                        fontWeight: 500,
                        fontSize: isMobile ? '24px' : '40px',
                        lineHeight: 1.6,
                        letterSpacing: '0.02em',
                        color: '#1D1A1C',
                        margin: 0, 
                        textAlign: 'left',
                        wordBreak: 'keep-all'
                    }}>
                        함께 걷고, 함께 웃습니다.
                    </h2>
                </BlurFade>
                <BlurFade delay={0.4} inView>
                    <LargeButton>
                        더 많은 우리 보기
                    </LargeButton>
                </BlurFade>
            </div>

            {/* Framer Motion Auto Slider */}
            <div style={trackWrapperStyle}>
                <InfiniteSlider gap={24} duration={150}>
                    {historyImages.map((item) => (
                        <article key={item.id} style={{ flexShrink: 0 }}>
                            <img 
                                src={item.image} 
                                alt="History" 
                                style={{ 
                                    width: isMobile ? '300px' : '480px', 
                                    aspectRatio: '4/3', 
                                    objectFit: 'cover'
                                }} 
                            />
                        </article>
                    ))}

                </InfiniteSlider>
            </div>

        </section>
    );
};

export default GallerySection;

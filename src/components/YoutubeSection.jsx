import React, { useRef, useState, useEffect } from 'react';
import { BlurFade } from './ui/BlurFade';
import { motion, useScroll, useTransform, useMotionTemplate, useMotionValueEvent } from 'framer-motion';

const YoutubeSection = () => {
    const sectionRef = useRef(null);
    const [isWipeFinished, setIsWipeFinished] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Animate from when the top of the 200vh section hits the bottom of the screen
    // until the bottom of the 200vh section hits the bottom of the screen.
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start 100%", "end 100%"]
    });

    // Detect when wipe is almost finished (90% through the scroll)
    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        if (latest >= 0.9 && !isWipeFinished) {
            setIsWipeFinished(true);
        } else if (latest < 0.8 && isWipeFinished) {
            setIsWipeFinished(false);
        }
    });

    // Mask Y: 
    // -50vh aligns wave exactly at the bottom of the screen.
    // 30vh aligns wave perfectly above the top of the screen (-20vh on screen).
    // This makes the wave wipe smoothly span the entire scroll duration.
    const maskY = useTransform(scrollYProgress, [0, 1], [-50, 30]);

    // Mask X: 0% to 100% for horizontal flow
    const maskX = useTransform(scrollYProgress, [0, 1], [0, 100]);

    const maskPosition = useMotionTemplate`${maskX}% ${maskY}vh`;

    // SVG: Height 2000. Wave is at 500 (25%). Solid black is 1500 (75%).
    // Desktop amplitude is 60 (Q25,440). Mobile amplitude is 20 (Q25,480).
    const desktopSvg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 1000 2000' preserveAspectRatio='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,500 Q25,440 50,500 T100,500 T150,500 T200,500 T250,500 T300,500 T350,500 T400,500 T450,500 T500,500 T550,500 T600,500 T650,500 T700,500 T750,500 T800,500 T850,500 T900,500 T950,500 T1000,500 L1000,2000 L0,2000 Z' fill='black'/%3E%3C/svg%3E")`;
    const mobileSvg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 1000 2000' preserveAspectRatio='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,500 Q25,480 50,500 T100,500 T150,500 T200,500 T250,500 T300,500 T350,500 T400,500 T450,500 T500,500 T550,500 T600,500 T650,500 T700,500 T750,500 T800,500 T850,500 T900,500 T950,500 T1000,500 L1000,2000 L0,2000 Z' fill='black'/%3E%3C/svg%3E")`;
    const waveMaskSvg = isMobile ? mobileSvg : desktopSvg;

    const containerStyle = {
        position: 'relative',
        color: '#fff',
        height: '200vh',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: '-200vh',
        zIndex: 20,
        backgroundColor: '#005394'
    };

    const innerContentStyle = {
        width: '100%',
        height: isMobile ? 'auto' : '100vh',
        padding: isMobile ? '40px 20px' : '40px 20px 120px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '48px',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10
    };

    const titleStyle = {
        textAlign: isMobile ? 'center' : 'left',
        marginBottom: '20px',
        whiteSpace: 'pre-line',
        color: '#ffffff',
        textShadow: '0 4px 20px rgba(0,0,0,0.15)',
        position: 'relative',
        zIndex: 10,
        fontSize: 'var(--text-h2)'
    };

    const buttonStyle = {
        backgroundColor: '#ffffff',
        color: '#005394',
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.2s',
    };

    const buttonContainerStyle = {
        flex: '0 0 auto',
        display: 'flex',
        justifyContent: isMobile ? 'center' : 'flex-start',
        marginTop: '20px'
    };

    return (
        <motion.section
            ref={sectionRef}
            style={{
                ...containerStyle,
                WebkitMaskImage: waveMaskSvg,
                maskImage: waveMaskSvg,
                WebkitMaskSize: '200% 200vh',
                maskSize: '200% 200vh',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: maskPosition,
                maskPosition: maskPosition
            }}
        >
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isWipeFinished ? 1 : 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{
                    position: 'absolute',
                    top: 0, left: 0, width: '100%', height: '100%',
                    zIndex: 0,
                    background: 'radial-gradient(circle at 50% 20%, #FDC422 0%, #F28100 70%, #DE5E00 100%)',
                    filter: 'hue-rotate(200deg) saturate(125%) brightness(73%)'
                }}
            />

            <motion.div
                style={innerContentStyle}
                initial={{ opacity: 0, y: 50 }}
                animate={{
                    opacity: isWipeFinished ? 1 : 0,
                    y: isWipeFinished ? 0 : 50
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <BlurFade delay={0.1} inView style={{ height: isMobile ? 'auto' : '100%' }}>
                    <div
                        style={{
                            borderRadius: '20px',
                            overflow: 'hidden',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                            flexShrink: 0,
                            width: isMobile ? '100%' : 'auto',
                            height: isMobile ? 'auto' : '100%',
                            aspectRatio: '9 / 16'
                        }}
                    >
                        <iframe
                            width="100%"
                            height="100%"
                            src="https://www.youtube.com/embed/bQ8ybnIaKDY"
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                            style={{ display: 'block' }}
                        ></iframe>
                    </div>
                </BlurFade>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMobile ? 'center' : 'flex-start' }}>
                    <BlurFade delay={0.25} inView>
                        <h2 style={titleStyle}>
                            가장 낮은 자로 오신,<br />
                            사랑의 왕.
                        </h2>
                    </BlurFade>

                    <div style={buttonContainerStyle}>
                        <BlurFade delay={0.4} inView>
                            <a href="https://www.youtube.com/@sbc6312" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                <motion.button
                                    style={buttonStyle}
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                >
                                    유튜브 풀영상 보기
                                    <svg width="28" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ height: 'var(--btn-icon-size)', width: 'auto' }}>
                                        <path d="M27.4069 3.12838C27.0792 1.89791 26.1591 0.938873 24.9319 0.604795C22.7641 1.37328e-07 13.9898 0 13.9898 0C13.9898 0 5.23592 1.37328e-07 3.06812 0.604795C1.86135 0.938153 0.920788 1.89791 0.572668 3.12838C6.73414e-08 5.33876 0 9.9892 0 9.9892C0 9.9892 6.73414e-08 14.6396 0.572668 16.8716C0.920082 18.0812 1.86135 19.0611 3.06812 19.3952C5.23592 20 13.9898 20 13.9898 20C13.9898 20 22.7641 20 24.9319 19.3952C26.1591 19.0618 27.0792 18.0812 27.4069 16.8716C28 14.6404 28 9.9892 28 9.9892C28 9.9892 28 5.33876 27.4069 3.12838ZM11.2083 14.2861V5.71459L18.4694 9.98992L11.2083 14.2861Z" fill="currentColor" />
                                    </svg>
                                </motion.button>
                            </a>
                        </BlurFade>
                    </div>
                </div>
            </motion.div>
        </motion.section>
    );
};

export default YoutubeSection;

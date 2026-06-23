import React, { useRef, useState } from 'react';
import lionImage from '../assets/main/lion_youtube.png';
import sheepImage from '../assets/main/lamb_youtube.png';
import youtubeIcon from '../assets/main/youtube_logo.svg';
import { BlurFade } from './ui/BlurFade';
import { motion, useScroll, useTransform, useMotionTemplate, useMotionValueEvent } from 'framer-motion';

const YoutubeSection = () => {
    const sectionRef = useRef(null);
    const [isWipeFinished, setIsWipeFinished] = useState(false);
    
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

    // SVG: Height 2000 to ensure solid black covers the whole screen. Wave is at 500 (25%).
    // Amplitude is 60 (Q25,440) for a very gentle slope.
    const waveMaskSvg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 1000 2000' preserveAspectRatio='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,500 Q25,440 50,500 T100,500 T150,500 T200,500 T250,500 T300,500 T350,500 T400,500 T450,500 T500,500 T550,500 T600,500 T650,500 T700,500 T750,500 T800,500 T850,500 T900,500 T950,500 T1000,500 L1000,2000 L0,2000 Z' fill='black'/%3E%3C/svg%3E")`;

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
        backgroundColor: '#000000'
    };

    const innerContentStyle = {
        width: '100%',
        height: '100vh',
        padding: '120px 0 160px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10
    };

    const titleStyle = {
        textAlign: 'center',
        marginBottom: '0',
        whiteSpace: 'pre-line',
        height: '1px',
        color: '#ffffff',
        overflow: 'visible',
        position: 'relative',
        zIndex: 10
    };

    const assetsContainerStyle = {
        marginTop: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '1404px',
        maxWidth: '100%',
        marginLeft: 'auto',
        marginRight: 'auto'
    };

    const itemStyle = {
        flex: '0 0 auto',
        width: '357px',
        height: '428px',
        objectFit: 'contain'
    };

    const buttonStyle = {
        color: '#fff',
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.2s',
    };

    const buttonContainerStyle = {
        flex: '0 0 auto',
        display: 'flex',
        justifyContent: 'center'
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
                style={innerContentStyle}
                initial={{ opacity: 0, y: 50 }}
                animate={{ 
                    opacity: isWipeFinished ? 1 : 0, 
                    y: isWipeFinished ? 0 : 50 
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <BlurFade delay={0.25} inView>
                    <h1 style={titleStyle}>
                        예수님의 말씀으로<br />
                        영혼의 양식을 채우세요.
                    </h1>
                </BlurFade>

                <div style={assetsContainerStyle}>
                    <motion.img
                        src={lionImage}
                        alt="Lion"
                        style={itemStyle}
                        animate={{ y: [0, -15, 0] }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />

                    <div style={buttonContainerStyle}>
                        <BlurFade delay={0.4} inView>
                            <a href="https://www.youtube.com/@sbc6312" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                <motion.button
                                    style={buttonStyle}
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                >
                                    예배 영상 보기
                                    <img src={youtubeIcon} alt="Youtube" />
                                </motion.button>
                            </a>
                        </BlurFade>
                    </div>

                    <motion.img
                        src={sheepImage}
                        alt="Sheep"
                        style={itemStyle}
                        animate={{ y: [0, -15, 0] }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.5
                        }}
                    />
                </div>
            </motion.div>
        </motion.section>
    );
};

export default YoutubeSection;

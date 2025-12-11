import React from 'react';
import lionImage from '../assets/main/lion_youtube.png';
import sheepImage from '../assets/main/lamb_youtube.png';
import youtubeIcon from '../assets/main/youtube_logo.svg';
import { BlurFade } from './ui/BlurFade';
import { motion } from 'framer-motion';

const YoutubeSection = () => {
    const containerStyle = {
        textAlign: 'center',
        padding: '120px 0 160px',
        position: 'relative',
        color: '#fff',
        minHeight: '100vh',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    };

    const titleStyle = {
        marginBottom: '0',
        whiteSpace: 'pre-line',
        height: '1px',
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
        <section style={containerStyle}>
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
        </section>
    );
};

export default YoutubeSection;

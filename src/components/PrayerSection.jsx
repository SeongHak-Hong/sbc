import React from 'react';
import { motion } from 'framer-motion';
import postImage from '../assets/main/post.png';
import { BlurFade } from './ui/BlurFade';
import { InfiniteSlider } from './ui/InfiniteSlider';


const PrayerSection = () => {
    const sectionStyle = {
        padding: 'var(--section-padding-y) 0',
        textAlign: 'center',
        color: '#fff',
        minHeight: '100vh', // Requested 100vh height including padding
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    };

    const titleStyle = {
        marginBottom: '40px'
    };

    const gridStyle = {
        // display: 'flex', // Removed as Slider handles layout
        // justifyContent: 'center', // Removed
        // gap: '24px', // Handled by Slider gap prop
        // flexWrap: 'wrap', // Removed
        marginBottom: '20px',
        padding: '24px 0',
        width: '100vw', // Full viewport width
        position: 'relative',
        left: '0%',
        right: '0%',
        marginLeft: 'calc(-50vw + 50%)', // Adjusted to keep it centered relative to viewport if parent is centered container? 
        // NOTE: User asked for "left 0%". 
        // If I strictly follow "left 0%", and keep 100vw, inside a max-width container, it will overflow right.
        // However, referencing the specific selector implies they might be tweaking the full-width breakout.
        // Let's try the standard full-width breakout from center: left: 50%, margin-left: -50vw.
        // USER SAID: "left 0%".
        // If I do left: 0, margin-left: calc((100% - 100vw) / 2)?
        // Let's just set left: 0 and marginLeft: calc((100% - 100vw) / 2) which is the robust way to center 100vw inside container.
        // actually, usually it is: width: 100vw; margin-left: calc(50% - 50vw);
        // The previous code was: left: 50%; margin-left: -50vw; This IS width: 100vw; margin-left: calc(50% - 50vw) (effectively).
        // If user says "left 0%", maybe they mistakenly think it's absolute.
        // Or maybe they want it aligned to the start of the container.

        // Let's assume user wants to reset the centering and just wants it to start at left 0 relative to CONTAINER?
        // But width is 100vw?

        // Let's strictly do what user asked: left 0. 
        // And I will remove marginLeft just in case, or set it to the calc formula if that's what's implied.
        // But "left 0%" suggests they want to anchor it.

        // Actually, looking at the previous request: "left 0%".
        // If I set `left: 0` and `marginLeft: calc(50% - 50vw)` it works for centering.
        // My previous code was `left: 50%`, `marginLeft: -50vw`.
        // Maybe the user sees it shifted?

        // Let's set left: 0 and see. I will assume they also want to remove the specific `marginLeft: -50vw` that went with `left: 50%`.
        // I will use `marginLeft: 'calc(50% - 50vw)'` which is the cleaner way to do full width breakout with left: 0 (wrapped in relative).
        // Wait, `calc(50% - 50vw)` works if left is auto/0.

        marginLeft: 'calc(50% - 50vw)',
        marginRight: 'calc(50% - 50vw)'
    };

    const postItStyle = {
        width: '226px', // Size 226*226
        height: '226px',
        backgroundImage: `url(${postImage})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        // backgroundColor: '#ffd700', // Removed
        color: '#333',
        padding: '30px', // Adjusted for text area within image
        // boxShadow: '2px 2px 5px rgba(0,0,0,0.2)', // Image might have shadow or flat
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px', // Updated font size
        lineHeight: '140%', // Updated line height
        fontFamily: 'var(--font-content)',
        border: 'none' // Ensure no border
    };

    // Rotate alternate items slightly differently
    // Base style for motion.div
    // Rotation is now handled by initial and whileHover props to allow smooth transition
    const getPostItInitial = (index) => ({
        rotate: index % 2 === 0 ? -2 : 2
    });

    const getPostItStyle = () => ({
        ...postItStyle,
        // No explicit transform here, let motion handle it
    });

    const buttonStyle = {
        backgroundColor: '#005394', // Global override if needed, but index.css handles it usually. keeping for safety if inline used elsewhere
        color: '#fff',
        boxShadow: 'none', // Removed shadow
        marginTop: '20px'
    };

    const prayers = [
        "하나님께 영광<br/>올려 드리는 삶",
        "서로 사랑하는<br/>우리 교회",
        "아픈 환우를<br/>위한 기도",
        "하나님의 뜻대로<br/>세워지는 가정",
        "다음 세대를<br/>위하여"
    ];

    return (
        <section style={sectionStyle}>
            <BlurFade delay={0.25} inView>
                <h2 style={titleStyle}>함께 기도해요.</h2>
            </BlurFade>
            <div style={gridStyle}>
                <InfiniteSlider gap={24} duration={60}>
                    {prayers.map((text, i) => (
                        <motion.div
                            key={i}
                            style={getPostItStyle()}
                            initial={getPostItInitial(i)}
                            whileHover={{
                                y: -15,
                                rotate: 0,
                                transition: { type: "spring", stiffness: 300, damping: 15 }
                            }}
                            dangerouslySetInnerHTML={{ __html: text }}
                        />
                    ))}
                </InfiniteSlider>
            </div>
            <BlurFade delay={0.4} inView>
                <motion.button
                    style={buttonStyle}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                    기도 제목 나누기
                </motion.button>
            </BlurFade>
        </section>
    );
};

export default PrayerSection;

import React from 'react';
import { motion } from 'framer-motion';

// Import Balloon Images
import bloom01 from '../assets/main/bloom_01.png';
import bloom02 from '../assets/main/bloom_02.png';
import bloom03 from '../assets/main/bloom_03.png';
import bloom04 from '../assets/main/bloom_04.png';

// Define balloons outside to prevent re-creation and random value shifts on re-renders
// Use negative delays to "pre-warm" the animation so balloons are already mid-flight
const balloons = [
    // height: 100~250px.
    // zIndex: Small(Far) = 1, Medium = 3, Large(Near) = 5
    { id: 1, src: bloom01, left: '2%', delay: -5, height: 250, blur: 0, duration: 22, xSway: 20, zIndex: 5 },
    { id: 2, src: bloom02, left: '12%', delay: -12, height: 100, blur: 4, duration: 24, xSway: 25, zIndex: 1 },
    { id: 3, src: bloom03, left: '25%', delay: -2, height: 220, blur: 0.5, duration: 21, xSway: 15, zIndex: 5 },
    { id: 4, src: bloom04, left: '38%', delay: -18, height: 120, blur: 3, duration: 25, xSway: 30, zIndex: 1 },
    { id: 5, src: bloom01, left: '45%', delay: -8, height: 180, blur: 1, duration: 23, xSway: 22, zIndex: 3 },
    { id: 6, src: bloom02, left: '58%', delay: -15, height: 240, blur: 0, duration: 20, xSway: 18, zIndex: 5 },
    { id: 7, src: bloom03, left: '70%', delay: -3, height: 140, blur: 2.5, duration: 26, xSway: 28, zIndex: 1 },
    { id: 8, src: bloom04, left: '82%', delay: -20, height: 200, blur: 1, duration: 22, xSway: 24, zIndex: 3 },
    { id: 9, src: bloom01, left: '90%', delay: -10, height: 110, blur: 3.5, duration: 24, xSway: 20, zIndex: 1 },
    { id: 10, src: bloom02, left: '96%', delay: -6, height: 230, blur: 0, duration: 21, xSway: 15, zIndex: 5 },
    { id: 11, src: bloom01, left: '5%', delay: -25, height: 130, blur: 2.8, duration: 27, xSway: 22, zIndex: 1 },
    { id: 12, src: bloom03, left: '50%', delay: -22, height: 160, blur: 1.5, duration: 25, xSway: 19, zIndex: 3 },
];

const BalloonImage = ({ src, delay, left, height, blur, duration, xSway, zIndex }) => {
    return (
        <motion.img
            src={src}
            alt="Balloon"
            initial={{ y: 0, opacity: 0, x: 0 }}
            animate={{
                // Travel from site bottom (approx 100%) upwards.
                // Needs to cross Footer + Newcomer + EventSection (~2000px?).
                // -250vh should be sufficient to reach the Event Section and fade out.
                y: [0, '-250vh'],
                opacity: [0, 1, 1, 0],
                x: [0, xSway, -xSway, 0],
            }}
            transition={{
                y: {
                    duration: duration,
                    delay: delay,
                    ease: "linear",
                    repeat: Infinity,
                    repeatType: "loop"
                },
                opacity: {
                    duration: duration,
                    delay: delay,
                    times: [0, 0.1, 0.9, 1],
                    repeat: Infinity,
                    repeatType: "loop"
                },
                x: {
                    duration: 5 + Math.random() * 3,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut"
                }
            }}
            style={{
                position: 'absolute',
                top: '99%', // Start at the very bottom of the entire page
                left: left,
                width: 'auto',
                height: `${height}px`,
                filter: `blur(${blur}px)`,
                zIndex: zIndex,
                pointerEvents: 'none',
                willChange: 'transform, opacity'
            }}
        />
    );
};

const BalloonBackground = () => {
    // "Global Background" but physically attached to the page (Absolute), not the screen (Fixed).
    // This ensures balloons stay at the bottom of the content and scroll WITH the page.
    const containerStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%', // Cover the entire app height
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0
    };

    return (
        <div style={containerStyle}>
            {balloons.map((b) => (
                <BalloonImage
                    key={b.id}
                    src={b.src}
                    delay={b.delay}
                    left={b.left}
                    height={b.height}
                    blur={b.blur}
                    duration={b.duration}
                    xSway={b.xSway}
                    zIndex={b.zIndex}
                />
            ))}
        </div>
    );
};

export default BalloonBackground;

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const ScrollExpandVideo = ({
    videoSrc,
    children
}) => {
    const containerRef = useRef(null);

    // Track scroll progress within the container
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
        // "start start": Start counting when top of container hits top of viewport (sticky begins)
        // "end end": End when bottom of container hits bottom of viewport
    });

    // Transform logic:
    // 0.0 -> 0.1: Buffer 
    // 0.1 -> 0.8: Expansion phase (928px -> 100vw). Long duration (0.7 progress = 350vh) = Slow expansion.
    // 0.8 -> 0.9: Fade in content

    // Use layout prop to smooth out potential jumps, though explicit width/height usually fine.

    const width = useTransform(scrollYProgress, [0.05, 0.8], ["928px", "100vw"]);
    const height = useTransform(scrollYProgress, [0.05, 0.8], ["518px", "56.25vw"]); // 16:9 ratio of 100vw
    const borderRadius = useTransform(scrollYProgress, [0.7, 0.8], ["20px", "0px"]);

    // Content opacity
    const contentOpacity = useTransform(scrollYProgress, [0.85, 0.95], [0, 1]);
    const contentY = useTransform(scrollYProgress, [0.85, 0.95], [20, 0]);
    const pointerEvents = useTransform(scrollYProgress, (v) => v > 0.9 ? 'auto' : 'none');

    return (
        <div ref={containerRef} style={{ height: '500vh', position: 'relative' }}>
            <div style={{
                position: 'sticky',
                top: 0,
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
            }}>
                {/* Video Container */}
                <motion.div
                    initial={{ width: '928px', height: '518px' }}
                    style={{
                        width,
                        height,
                        maxWidth: '100vw',
                        maxHeight: '100vh',
                        borderRadius,
                        overflow: 'hidden',
                        position: 'relative',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                    }}>
                    <video
                        src={videoSrc}
                        autoPlay
                        muted
                        loop
                        playsInline
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                    />

                    {/* Overlay Content */}
                    <motion.div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        opacity: contentOpacity,
                        y: contentY,
                        pointerEvents
                    }}>
                        {children}
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default ScrollExpandVideo;

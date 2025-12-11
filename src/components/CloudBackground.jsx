import React from 'react';
import { motion } from 'framer-motion';
import cloud01 from '../assets/main/cloud_01.png';
import cloud02 from '../assets/main/cloud_02.png';
import cloud03 from '../assets/main/cloud_03.png';
import cloud04 from '../assets/main/cloud_04.png';

const CloudBackground = () => {
    // Cloud configuration: Denser coverage (left/right balanced per section)
    // Approx 100vh ~ 15% height. So every 15% needs ~2 left + 2 right.
    const clouds = [
        // 0-15% (Hero)
        { id: 101, src: cloud01, top: '2%', left: '-5%', opacity: 0.9, width: '600px' },
        { id: 102, src: cloud02, top: '5%', right: '-8%', opacity: 0.8, width: '700px' },
        { id: 103, src: cloud03, top: '10%', left: '-8%', opacity: 0.7, width: '400px' },
        { id: 104, src: cloud04, top: '12%', right: '-5%', opacity: 0.9, width: '500px' },

        // 15-30% (Youtube)
        { id: 201, src: cloud01, top: '18%', right: '-10%', opacity: 0.8, width: '650px' },
        { id: 202, src: cloud02, top: '22%', left: '-6%', opacity: 0.7, width: '550px' },
        { id: 203, src: cloud03, top: '25%', right: '-5%', opacity: 0.8, width: '450px' },
        { id: 204, src: cloud04, top: '28%', left: '-8%', opacity: 0.9, width: '600px' },

        // 30-45% (Gallery mid)
        { id: 301, src: cloud01, top: '32%', left: '-10%', opacity: 0.7, width: '500px' },
        { id: 302, src: cloud02, top: '35%', right: '-8%', opacity: 0.8, width: '700px' },
        { id: 303, src: cloud03, top: '40%', left: '-5%', opacity: 0.6, width: '400px' },
        { id: 304, src: cloud04, top: '42%', right: '-6%', opacity: 0.9, width: '550px' },

        // 45-60% (Prayer mid)
        { id: 401, src: cloud01, top: '48%', right: '-12%', opacity: 0.8, width: '600px' },
        { id: 402, src: cloud02, top: '52%', left: '-8%', opacity: 0.7, width: '650px' },
        { id: 403, src: cloud03, top: '55%', right: '-5%', opacity: 0.9, width: '500px' },
        { id: 404, src: cloud04, top: '58%', left: '-6%', opacity: 0.8, width: '450px' },

        // 60-75% (Service/Event)
        { id: 501, src: cloud01, top: '62%', left: '-5%', opacity: 0.7, width: '550px' },
        { id: 502, src: cloud02, top: '65%', right: '-10%', opacity: 0.8, width: '700px' },
        { id: 503, src: cloud03, top: '70%', left: '-10%', opacity: 0.6, width: '400px' },
        { id: 504, src: cloud04, top: '72%', right: '-5%', opacity: 0.9, width: '600px' },

        // 75-90% (Newcomer)
        { id: 601, src: cloud01, top: '78%', right: '-8%', opacity: 0.8, width: '650px' },
        { id: 602, src: cloud02, top: '82%', left: '-6%', opacity: 0.7, width: '500px' },
        { id: 603, src: cloud03, top: '85%', right: '-12%', opacity: 0.9, width: '550px' },
        { id: 604, src: cloud04, top: '88%', left: '-8%', opacity: 0.8, width: '450px' },

        // 90-100% (Footer area)
        { id: 701, src: cloud01, top: '92%', left: '-5%', opacity: 0.7, width: '600px' },
        { id: 702, src: cloud02, top: '95%', right: '-5%', opacity: 0.8, width: '700px' },
        { id: 703, src: cloud03, top: '98%', left: '-10%', opacity: 0.6, width: '400px' },
    ];

    const containerStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0
    };

    return (
        <div style={containerStyle}>
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <defs>
                    <filter id="cloud-mask">
                        <feColorMatrix
                            type="matrix"
                            values="0 0 0 0 1
                                    0 0 0 0 1
                                    0 0 0 0 1
                                    0.33 0.33 0.33 0 0"
                        />
                    </filter>
                </defs>
            </svg>

            {clouds.map((cloud) => (
                <motion.img
                    key={cloud.id}
                    src={cloud.src}
                    alt=""
                    style={{
                        position: 'absolute',
                        top: cloud.top,
                        left: cloud.left,
                        right: cloud.right,
                        width: cloud.width,
                        opacity: cloud.opacity,
                        filter: 'url(#cloud-mask) blur(4px)',
                        zIndex: 0,
                    }}
                    animate={{
                        y: [0, -20, 0],
                        x: [0, 10, 0]
                    }}
                    transition={{
                        duration: 5 + (cloud.id % 5), // Randomize duration
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            ))}
        </div>
    );
};

export default CloudBackground;

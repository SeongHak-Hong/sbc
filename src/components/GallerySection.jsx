import React from 'react';
import { motion } from 'framer-motion';
import gallery01 from '../assets/main/gallery_01.png';
import gallery02 from '../assets/main/gallery_02.png';
import gallery03 from '../assets/main/gallery_03.png';
import gallery04 from '../assets/main/gallery_04.png';
import gallery05 from '../assets/main/gallery_05.png';
import { BlurFade } from './ui/BlurFade';

const GallerySection = () => {
    const sectionStyle = {
        padding: 'var(--section-padding-y) 0',
        textAlign: 'center',
        color: '#fff',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'visible'
    };

    const titleStyle = {
        marginBottom: '60px'
    };

    const buttonStyle = {
        color: '#fff',
        marginTop: '60px',
        position: 'relative',
        zIndex: 20
    };

    const boxContainerStyle = {
        width: '1500px',
        height: '826px',
        maxWidth: '100%',
        padding: '24px 48px',
        position: 'relative',
        margin: '0 auto',
    };

    return (
        <section style={sectionStyle}>
            <BlurFade delay={0.25} inView>
                <h2 style={titleStyle}>추억을 만들어가요.</h2>
            </BlurFade>

            <div style={boxContainerStyle}>
                {/* 
                   Strategy:
                   03 is now CENTERED (left: 50%, x: -50%).
                   Previous 03 was Right 5% (approx Left 65-70%?). 
                   We shifted 03 LEFT by ~15-20%.
                   We apply a similar LEFT shift to everyone else to keep the "Group" feel.
                   
                   Old 01: Top 5%, Right 23%. -> Shift Left means Right increases. Right 40%.
                   Old 02: Top 20%, Left 18%. -> Shift Left means Left decreases. Left 5%.
                   Old 04: Left 25%. -> Shift Left. Left 12%.
                   
                   New 05: Opposite of 02.
                   If 02 is Left 5%, 05 should be Right 5%.
                */}

                {/* Gallery 01 */}
                <motion.img
                    src={gallery01}
                    alt="Gallery 1"
                    style={{
                        position: 'absolute',
                        top: '5%',
                        right: '35%', // Updated from 40%
                        width: 'auto',
                        zIndex: 1,
                    }}
                    initial={{ opacity: 0, rotate: 10 }}
                    whileInView={{ opacity: 1, rotate: 10 }}
                    viewport={{ once: false, amount: 0.5 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                    whileHover={{
                        rotate: 12,
                        transition: { duration: 0.3, type: 'tween' }
                    }}
                />

                {/* Gallery 02 */}
                <motion.img
                    src={gallery02}
                    alt="Gallery 2"
                    style={{
                        position: 'absolute',
                        top: '20%',
                        left: '5%', // Shifted left (decreased)
                        width: 'auto',
                        zIndex: 2,
                    }}
                    initial={{ opacity: 0, rotate: -5 }}
                    whileInView={{ opacity: 1, rotate: -5 }}
                    viewport={{ once: false, amount: 0.5 }}
                    transition={{ duration: 0.2, delay: 0.2 }}
                    whileHover={{
                        rotate: -7,
                        transition: { duration: 0.3, type: 'tween' }
                    }}
                />

                {/* Gallery 03: CENTERED */}
                <motion.img
                    src={gallery03}
                    alt="Gallery 3"
                    style={{
                        position: 'absolute',
                        bottom: '40px',
                        left: '50%',
                        x: '-50%', // Centered
                        right: 'auto',
                        width: 'auto',
                        zIndex: 3
                    }}
                    initial={{ opacity: 0, rotate: 0 }}
                    whileInView={{ opacity: 1, rotate: 0 }}
                    viewport={{ once: false, amount: 0.5 }}
                    transition={{ duration: 0.2, delay: 0.3 }}
                    whileHover={{
                        rotate: 2,
                        transition: { duration: 0.3, type: 'tween' }
                    }}
                />

                {/* Gallery 04 */}
                <motion.img
                    src={gallery04}
                    alt="Gallery 4"
                    style={{
                        position: 'absolute',
                        bottom: '15%',
                        left: '12%', // Shifted left
                        width: 'auto',
                        zIndex: 4,
                    }}
                    initial={{ opacity: 0, rotate: 0 }}
                    whileInView={{ opacity: 1, rotate: 0 }}
                    viewport={{ once: false, amount: 0.5 }}
                    transition={{ duration: 0.2, delay: 0.4 }}
                    whileHover={{
                        rotate: 5,
                        transition: { duration: 0.3, type: 'tween' }
                    }}
                />

                {/* Gallery 05: NEW (Opposite of 02) */}
                {/* 02 is Top 20%, Left 5%. So 05 is Top 20%, Right 5%. */}
                <motion.img
                    src={gallery05}
                    alt="Gallery 5"
                    style={{
                        position: 'absolute',
                        top: '20%',
                        right: '5%',
                        width: 'auto',
                        zIndex: 2,
                    }}
                    initial={{ opacity: 0, rotate: 0 }} // Updated to 0
                    whileInView={{ opacity: 1, rotate: 0 }}
                    viewport={{ once: false, amount: 0.5 }}
                    transition={{ duration: 0.2, delay: 0.5 }} // Slight delay after 04
                    whileHover={{
                        rotate: 7,
                        transition: { duration: 0.3, type: 'tween' }
                    }}
                />
            </div>

            <BlurFade delay={0.4} inView>
                <motion.button
                    style={buttonStyle}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                    갤러리 구경하기
                </motion.button>
            </BlurFade>
        </section>
    );
};

export default GallerySection;

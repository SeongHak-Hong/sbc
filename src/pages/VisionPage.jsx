import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './VisionPage.module.css';

import pastorLetterImage from '../assets/vision/shintanjin-baptist-church-pastor-letter.webp';
import pastorIDImage from '../assets/vision/shintanjin-baptist-church-pastor-ID-photo.webp';

import Footer from '../components/Footer';
import CloudBackground from '../components/CloudBackground';
import BalloonBackground from '../components/BalloonBackground';

const VisionPage = () => {
    const [isLetterZoomed, setIsLetterZoomed] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className={styles.pageContainer}>
            <CloudBackground heightMode="vh" />



            <main className={styles.mainContent}>
                {/* Hero Section */}
                <header className={styles.heroSection}>
                    <div className={styles.heroContent}>
                        <motion.h1 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            style={{ position: 'relative', display: 'inline-block', color: 'white', marginBottom: 0, fontSize: 'var(--text-h1)' }}
                        >
                            인사말·비전
                        </motion.h1>
                    </div>
                </header>

                {/* Greeting Section */}
                <section className={styles.greetingSection}>
                    <div className={styles.greetingWrapper}>
                        <div className={styles.paperLayout}>
                            <div className={styles.flutterEngine}>
                                <div 
                                    className={styles.greetingCard} 
                                    onClick={() => {
                                        if (window.innerWidth < 1024) {
                                            setIsLetterZoomed(true);
                                        }
                                    }}
                                >
                                    <img 
                                        src={pastorIDImage} 
                                        alt="Pastor ID Photo" 
                                        className={styles.idPhoto} 
                                    />
                                </div>
                    </div>
                </div>
            </div>
        </section>




            </main>

            <AnimatePresence>
                {isLetterZoomed && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.85)',
                            zIndex: 9999,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'zoom-out',
                            padding: '16px'
                        }}
                        onClick={() => setIsLetterZoomed(false)}
                    >
                        <motion.img 
                            src={pastorLetterImage}
                            alt="Pastor Letter Expanded"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                                borderRadius: '8px',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>


            <Footer />
        </div>
    );
};

export default VisionPage;

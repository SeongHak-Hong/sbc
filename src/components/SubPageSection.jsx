import React from 'react';
import { motion } from 'framer-motion';
import styles from './SubPageSection.module.css';

const SubPageSection = ({ id, title, engTitle, subtitle, icon, children, className, titleColor = 'var(--color-text-dark)', hideHeader = false }) => {
    return (
        <section id={id} className={`${styles.sectionContainer} ${className || ''}`}>
            {!hideHeader && (
                <div className={styles.headerContent}>
                    {icon && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className={styles.iconContainer}
                        >
                            <img 
                                src={icon}
                                alt={`${title} Icon`}
                                style={{ display: 'block', height: '100%', width: 'auto' }}
                            />
                        </motion.div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        {engTitle && (
                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.1 }}
                                style={{
                                    fontFamily: '"Playfair Display", serif',
                                    fontSize: 'var(--text-h2)',
                                    color: titleColor,
                                    margin: 0,
                                    letterSpacing: '-0.02em',
                                    lineHeight: 1.2
                                }}
                            >
                                {engTitle}
                            </motion.h1>
                        )}
                        <motion.h2 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className={styles.title}
                            style={{ 
                                color: titleColor, 
                                fontSize: engTitle ? 'var(--text-sub-title)' : 'var(--text-h1)',
                                fontWeight: 'var(--font-weight-regular)',
                                lineHeight: 'var(--line-height-base)',
                                margin: 0
                            }}
                        >
                            {title}
                        </motion.h2>
                        {subtitle && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                style={{ marginTop: '16px', color: titleColor, textAlign: 'center' }}
                            >
                                {subtitle}
                            </motion.div>
                        )}
                    </div>
                </div>
            )}
            {children}
        </section>
    );
};

export default SubPageSection;

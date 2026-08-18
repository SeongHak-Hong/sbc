import React from 'react';
import { motion } from 'framer-motion';
import styles from './SubPageSection.module.css';

const SubPageSection = ({ id, title, engTitle, subtitle, icon, children, className, titleColor = 'var(--color-text-dark)', hideHeader = false }) => {
    return (
        <section id={id} className={`${styles.sectionContainer} ${className || ''}`}>
            {!hideHeader && (
                <div className={styles.headerContent}>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className={styles.yuhanTitle}
                            style={{ color: titleColor }}
                        >
                            {title}
                        </motion.h1>
                    </div>
                </div>
            )}
            {children}
        </section>
    );
};

export default SubPageSection;

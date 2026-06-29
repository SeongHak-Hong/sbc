import React from 'react';
import { motion } from 'framer-motion';
import styles from './SubPageSection.module.css';

const SubPageSection = ({ title, subtitle, icon, children, className, titleColor = 'var(--color-text-dark)' }) => {
    return (
        <section className={`${styles.sectionContainer} ${className || ''}`}>
            <div className={styles.headerContent}>
                {icon && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        style={{ width: '56px', height: '56px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    >
                        <img 
                            src={icon}
                            alt={`${title} Icon`}
                            style={{ display: 'block', height: '100%', width: 'auto' }}
                        />
                    </motion.div>
                )}
                <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className={styles.title}
                    style={{ color: titleColor }}
                >
                    {title}
                </motion.h1>
                {subtitle && subtitle}
            </div>
            {children}
        </section>
    );
};

export default SubPageSection;

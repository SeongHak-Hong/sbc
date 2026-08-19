import React from 'react';
import { motion } from 'framer-motion';
import ScrollFadeText from './ScrollFadeText';
import styles from './SubPageSection.module.css';

const SubPageSection = ({ id, title, engTitle, subtitle, icon, children, className, titleColor = 'var(--color-text-primary)', hideHeader = false }) => {
    return (
        <section id={id} className={`${styles.sectionContainer} ${className || ''}`}>
            {!hideHeader && (
                <div className={styles.headerContent}>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <ScrollFadeText
                            text={title}
                            as="h1"
                            className={styles.yuhanTitle}
                            style={{ color: titleColor }}
                            once={true}
                        />
                    </div>
                </div>
            )}
            {children}
        </section>
    );
};

export default SubPageSection;

import React from 'react';
import { motion } from 'framer-motion';
import styles from './SwitchTabs.module.css';

const SwitchTabs = ({ tabs, activeTab, onTabChange, layoutIdPrefix = "activeSwitch", containerClassName = "", containerStyle = {} }) => {
    return (
        <div className={`${styles.switchContainer} ${containerClassName}`} style={containerStyle}>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    className={`${styles.switchButton} ${activeTab === tab.id ? styles.active : ''}`}
                    onClick={() => onTabChange(tab.id)}
                >
                    {activeTab === tab.id && (
                        <motion.div
                            layoutId={layoutIdPrefix}
                            transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                            className={styles.activeBackground}
                        />
                    )}
                    <span className={styles.switchText}>{tab.label}</span>
                </button>
            ))}
        </div>
    );
};

export default SwitchTabs;

import React from 'react';
import styles from './SwitchTabs.module.css';

const SwitchTabs = ({ tabs, activeTab, onTabChange, containerClassName = "", containerStyle = {} }) => {
    return (
        <div className={`${styles.switchContainer} ${containerClassName}`} style={containerStyle}>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    className={`${styles.switchButton} ${activeTab === tab.id ? styles.active : ''}`}
                    onClick={() => onTabChange(tab.id)}
                >
                    <span className={styles.switchText}>{tab.label}</span>
                </button>
            ))}
        </div>
    );
};

export default SwitchTabs;

import React from 'react';
import styles from './TabMenu.module.css';

const TabMenu = ({ 
    tabs, 
    activeTab, 
    onTabChange, 
    getTabId = (tab) => tab, 
    getTabLabel = (tab) => tab, 
    className = '',
    variant = 'default'
}) => {
    const containerClass = variant === 'mini' ? `${styles.tabsContainer} ${styles.miniContainer}` : styles.tabsContainer;
    const tabClass = variant === 'mini' ? `${styles.tab} ${styles.miniTab}` : styles.tab;
    return (
        <nav className={`${containerClass} ${className}`} aria-label="Tab Navigation">
            {tabs.map((tab) => {
                const id = getTabId(tab);
                const label = getTabLabel(tab);
                return (
                    <button
                        key={id}
                        className={`${tabClass} ${activeTab === id ? styles.activeTab : ''}`}
                        onClick={() => onTabChange(id)}
                    >
                        {label}
                    </button>
                );
            })}
        </nav>
    );
};

export default TabMenu;

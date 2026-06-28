import React from 'react';
import styles from './TabMenu.module.css';

const TabMenu = ({ 
    tabs, 
    activeTab, 
    onTabChange, 
    getTabId = (tab) => tab, 
    getTabLabel = (tab) => tab, 
    className = '' 
}) => {
    return (
        <nav className={`${styles.tabsContainer} ${className}`} aria-label="Tab Navigation">
            {tabs.map((tab) => {
                const id = getTabId(tab);
                const label = getTabLabel(tab);
                return (
                    <button
                        key={id}
                        className={`${styles.tab} ${activeTab === id ? styles.activeTab : ''}`}
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

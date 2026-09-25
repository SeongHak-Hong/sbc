import React from 'react';
import { motion } from 'framer-motion';
import styles from './BoardGrid.module.css';

/**
 * BoardGrid Component
 * Used for square-card lists like NewsPage (koinonia, news, bulletin) and NetworkPage (businesses).
 * 
 * @param {Array} items - Array of items with { id, title, meta, rawData }
 * @param {Function} onItemClick - Click handler, receives the rawData
 * @param {String} emptyMessage - Message to show when items array is empty
 */
const BoardGrid = ({ items = [], onItemClick, emptyMessage = "등록된 게시물이 없습니다." }) => {
    if (items.length === 0) {
        return (
            <div className={styles.eventsGrid}>
                <div className={styles.eventCard} style={{ cursor: 'default' }}>
                    <h3 className={`list-item-title ${styles.eventTitle}`}>{emptyMessage}</h3>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.eventsGrid}>
            {items.map((item, idx) => (
                <motion.div 
                    key={item.id}
                    style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => onItemClick && onItemClick(item.rawData)}
                >
                    <div className={styles.eventCard}>
                        <h3 className={`list-item-title ${styles.eventTitle}`}>{item.title}</h3>
                        <div className={`list-item-meta ${styles.eventMetaRow}`}>
                            {item.meta}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default BoardGrid;

import React from 'react';
import styles from '../../pages/NewsPage.module.css';

const BoardList = ({ 
    posts = [], 
    onItemClick, 
    currentPage, 
    totalPages, 
    onPageChange, 
    emptyMessage = "등록된 게시물이 없습니다.",
    animationKey
}) => {
    return (
        <div className={styles.boardContainer}>
            <div className={styles.boardList}>
                    {posts.length > 0 ? posts.map((post) => (
                        <div 
                            key={post.id} 
                            className={styles.boardItem}
                            onClick={() => onItemClick(post)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <p className={styles.itemTitle}>
                                    {post.title}
                                    {post.titleDate && (
                                        <span style={{ color: 'rgba(var(--color-text-dark-rgb), 0.7)', marginLeft: '6px', fontWeight: 'normal' }}>
                                            ({post.titleDate})
                                        </span>
                                    )}
                                </p>
                                {post.hasImage && (
                                    <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#9CA3AF' }} translate="no">image</span>
                                )}
                            </div>
                            {(post.author || post.date) && (
                                <div style={{ display: 'flex', gap: '16px', color: '#6B7280', fontSize: '16px' }}>
                                    {post.author && <span>{post.author}</span>}
                                    {post.date && <p className={styles.itemDate}>{post.date}</p>}
                                </div>
                            )}
                        </div>
                    )) : (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                            {emptyMessage}
                        </div>
                    )}
            </div>

            {/* Pagination */}
            {posts.length > 0 && (
                <div className={styles.boardFooter}>
                    <div className={styles.pagination}>
                        <button 
                            className={`${styles.pageArrow} material-symbols-outlined`}
                            disabled={currentPage === 1}
                            onClick={() => onPageChange(currentPage - 1)}
                        >chevron_left</button>
                        
                        {[...Array(totalPages)].map((_, i) => (
                            <button 
                                key={i + 1}
                                className={`${styles.pageButton} ${currentPage === i + 1 ? styles.active : ''}`}
                                onClick={() => onPageChange(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}
                        
                        <button 
                            className={`${styles.pageArrow} material-symbols-outlined`}
                            disabled={currentPage === totalPages}
                            onClick={() => onPageChange(currentPage + 1)}
                        >chevron_right</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BoardList;

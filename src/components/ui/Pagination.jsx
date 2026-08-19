import React, { useState, useEffect } from 'react';
import styles from './Pagination.module.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = isMobile ? 3 : 5;
        const halfWindow = Math.floor(maxPagesToShow / 2);

        if (totalPages <= maxPagesToShow + 2) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            let startPage = Math.max(1, currentPage - halfWindow);
            let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

            if (endPage - startPage < maxPagesToShow - 1) {
                startPage = Math.max(1, endPage - (maxPagesToShow - 1));
            }

            if (startPage > 1) {
                pages.push(1);
                if (startPage > 2) {
                    pages.push('ellipsis-start');
                }
            }

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }

            if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                    pages.push('ellipsis-end');
                }
                pages.push(totalPages);
            }
        }
        return pages;
    };

    return (
        <div className={styles.pagination}>
            <button 
                className={`${styles.pageArrow} material-symbols-outlined`}
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
            >chevron_left</button>
            
            {getPageNumbers().map((page, index) => {
                if (typeof page === 'string' && page.startsWith('ellipsis')) {
                    return (
                        <span key={`ellipsis-${index}`} className={styles.ellipsis}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="6" cy="12" r="1.5" fill="#888" />
                                <circle cx="12" cy="12" r="1.5" fill="#888" />
                                <circle cx="18" cy="12" r="1.5" fill="#888" />
                            </svg>
                        </span>
                    );
                }
                
                return (
                    <button 
                        key={page}
                        className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </button>
                );
            })}
            
            <button 
                className={`${styles.pageArrow} material-symbols-outlined`}
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
            >chevron_right</button>
        </div>
    );
};

export default Pagination;

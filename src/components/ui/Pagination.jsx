import React, { useState, useEffect } from 'react';
import styles from './Pagination.module.css';

// Apple 뉴스룸 아카이브 방식: [‹] [현재 쪽 입력] / 전체 [›]
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const [draft, setDraft] = useState(String(currentPage));

    useEffect(() => {
        setDraft(String(currentPage));
    }, [currentPage]);

    const handlePageChange = (page) => {
        onPageChange(page);
        setTimeout(() => {
            if (window.lenis) {
                window.lenis.scrollTo(0, { immediate: false, duration: 1.2 });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }, 50);
    };

    // 입력한 쪽 번호로 이동 (범위 밖이면 가장 가까운 쪽, 숫자가 아니면 되돌림)
    const commitDraft = () => {
        const n = parseInt(draft, 10);
        if (Number.isNaN(n)) {
            setDraft(String(currentPage));
            return;
        }
        const page = Math.min(Math.max(n, 1), totalPages);
        setDraft(String(page));
        if (page !== currentPage) handlePageChange(page);
    };

    return (
        <nav className={styles.pagination} aria-label="쪽 이동">
            <button
                type="button"
                className={`${styles.pageArrow} material-symbols-outlined`}
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                aria-label="이전 쪽"
            >chevron_left</button>

            <div className={styles.info}>
                <input
                    className={styles.input}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value.replace(/\D/g, ''))}
                    onBlur={commitDraft}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') e.currentTarget.blur();
                    }}
                    onFocus={(e) => e.currentTarget.select()}
                    style={{ width: `${Math.max(String(totalPages).length, draft.length, 1) + 1.4}ch` }}
                    aria-label={`쪽 번호 (전체 ${totalPages}쪽)`}
                />
                <span className={styles.total} aria-hidden="true">
                    <span className={styles.slash}>/</span>{totalPages}
                </span>
            </div>

            <button
                type="button"
                className={`${styles.pageArrow} material-symbols-outlined`}
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                aria-label="다음 쪽"
            >chevron_right</button>
        </nav>
    );
};

export default Pagination;

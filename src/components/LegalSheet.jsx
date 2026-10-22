import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import PostSheet from './PostSheet';
import { privacyPolicy, termsOfUse } from '../content/legal';
import styles from './LegalSheet.module.css';

const DOCS = { privacy: privacyPolicy, terms: termsOfUse };

// 본문 글을 블록으로: '## '는 조 제목, '1. '은 번호 목록, '- '은 점 목록, 나머지는 문단
const toBlocks = (text) => {
    const blocks = [];
    text.trim().split('\n').forEach((raw) => {
        const line = raw.trim();
        const last = blocks[blocks.length - 1];
        if (!line) return;
        if (line.startsWith('## ')) {
            blocks.push({ type: 'h2', text: line.slice(3) });
        } else if (/^\d+\.\s/.test(line)) {
            if (last?.type === 'ol') last.items.push(line.replace(/^\d+\.\s/, ''));
            else blocks.push({ type: 'ol', items: [line.replace(/^\d+\.\s/, '')] });
        } else if (line.startsWith('- ')) {
            if (last?.type === 'ul') last.items.push(line.slice(2));
            else blocks.push({ type: 'ul', items: [line.slice(2)] });
        } else {
            blocks.push({ type: 'p', text: line });
        }
    });
    return blocks;
};

// 푸터의 개인정보처리방침 · 이용약관: 교회 일정 세부정보와 같은 팝업(PostSheet)으로 본문을 보여 준다.
// 어느 페이지 푸터에서 열어도 화면 맨 위에 뜨도록 body에 그리고, 열려 있는 동안 뒤 화면 스크롤을 멈춘다
const LegalSheet = ({ doc, onClose }) => {
    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.lenis?.stop();
        return () => {
            document.body.style.overflow = prev;
            window.lenis?.start();
        };
    }, []);

    const content = DOCS[doc];
    if (!content) return null;

    return createPortal(
        <PostSheet meta={content.meta} title={content.title} onClose={onClose}>
            <div className={styles.doc}>
                {toBlocks(content.body).map((block, i) => {
                    if (block.type === 'h2') return <h2 key={i}>{block.text}</h2>;
                    if (block.type === 'ol') return <ol key={i}>{block.items.map((item) => <li key={item}>{item}</li>)}</ol>;
                    if (block.type === 'ul') return <ul key={i}>{block.items.map((item) => <li key={item}>{item}</li>)}</ul>;
                    return <p key={i}>{block.text}</p>;
                })}
            </div>
        </PostSheet>,
        document.body,
    );
};

export default LegalSheet;

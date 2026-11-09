import React from 'react';

// 게시물 '바로가기 버튼' 칸: 주소를 넣으면 게시물 팝업 제목 아래에 큰 버튼이 생기고, 누르면 새 창으로 열린다.
// 둘 다 비우면 버튼이 없다. 버튼 이름을 비우면 '바로가기'로 보인다.

// 'jesuson.co.kr' 처럼 앞부분을 빼고 적어도 열리도록 https:// 를 붙인다
export const normalizeLinkUrl = (value) => {
    const url = (value || '').trim();
    if (!url) return '';
    return /^[a-z][a-z0-9+.-]*:/i.test(url) ? url : `https://${url}`;
};

const inputStyle = { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '16px' };

const PostLinkFields = ({ label, url, onLabelChange, onUrlChange }) => (
    <div>
        <div style={{ marginBottom: '8px' }}>
            바로가기 버튼 <span style={{ color: '#6B7280' }}>(선택. 주소를 넣으면 게시물 제목 아래에 큰 버튼이 생기고, 누르면 새 창으로 열립니다)</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <label style={{ flex: '1 1 200px' }}>
                <span style={{ display: 'block', marginBottom: '6px', color: '#6B7280' }}>버튼 이름</span>
                <input
                    type="text"
                    value={label}
                    onChange={(e) => onLabelChange(e.target.value)}
                    placeholder="예: 지저스온 홈페이지 열기"
                    style={inputStyle}
                />
            </label>
            <label style={{ flex: '2 1 320px' }}>
                <span style={{ display: 'block', marginBottom: '6px', color: '#6B7280' }}>연결 주소</span>
                <input
                    type="url"
                    inputMode="url"
                    value={url}
                    onChange={(e) => onUrlChange(e.target.value)}
                    onBlur={(e) => onUrlChange(normalizeLinkUrl(e.target.value))}
                    placeholder="예: https://www.example.com"
                    style={inputStyle}
                />
            </label>
        </div>
    </div>
);

export default PostLinkFields;

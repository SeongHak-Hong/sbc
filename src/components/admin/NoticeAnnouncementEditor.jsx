import React from 'react';
import { NOTICE_FIELDS, emptyAnnouncementSection } from '../../lib/noticeItems';
import { NoticeWhenField } from './NoticeItemsEditor';

// 공지사항 안내 양식: 공지 한 건. 기본 정보(일시 · 장소 · 대상 · 신청·문의)는 팝업 제목 아래 정보 줄로,
// 소개 글과 소제목 묶음(소제목 + 한 줄씩)은 본문으로 나간다. 빈 칸은 팝업에 나오지 않는다
const inputStyle = { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '16px', boxSizing: 'border-box', color: '#111827' };
const smallButton = { padding: '6px 12px', borderRadius: '4px', border: '1px solid #D1D5DB', backgroundColor: '#fff', cursor: 'pointer', fontSize: '14px' };
const boxStyle = { padding: '16px', border: '1px solid #E5E7EB', borderRadius: '8px', backgroundColor: '#fff' };
const labelStyle = { display: 'block', fontSize: '14px', color: '#6B7280' };

const NoticeAnnouncementEditor = ({ notice, onChange }) => {
    const patch = (values) => onChange({ ...notice, ...values });
    const sections = notice.sections;
    const patchSection = (id, values) => patch({ sections: sections.map((s) => (s.id === id ? { ...s, ...values } : s)) });
    const removeSection = (section) => {
        if ((section.title.trim() || section.lines.trim()) && !window.confirm(`'${section.title || '소제목 묶음'}'을 지울까요?`)) return;
        patch({ sections: sections.filter((s) => s.id !== section.id) });
    };
    const moveSection = (index, dir) => {
        const next = [...sections];
        [next[index], next[index + dir]] = [next[index + dir], next[index]];
        patch({ sections: next });
    };

    return (
        <div style={{ display: 'grid', gap: '20px' }}>
            {/* 쓰는 기준: 모든 공지가 같은 모양으로 보이게 */}
            <ul style={{ margin: 0, padding: '12px 16px 12px 32px', backgroundColor: '#F9FAFB', borderRadius: '8px', color: '#4B5563', fontSize: '14px', lineHeight: 1.7 }}>
                <li>일시 · 장소 · 대상 · 신청·문의는 아래 칸에 적어 주세요. 팝업 맨 위 제목 아래에 나와요.</li>
                <li>소개는 두세 문장으로 짧게 적어 주세요. 빈 줄을 넣으면 문단이 나뉘어요.</li>
                <li>순서표 · 과목처럼 여러 줄인 내용은 '소제목 묶음'에 한 줄에 하나씩 적어 주세요. '20:00 ~ 20:30 찬양'처럼 시간으로 시작하면 시간 칸이 저절로 맞춰져요.</li>
            </ul>

            <div style={boxStyle}>
                <span style={{ display: 'block', marginBottom: '8px' }}>기본 정보</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '8px 12px' }}>
                    <NoticeWhenField item={notice} onPatch={patch} />
                    {NOTICE_FIELDS.map(({ key, label, placeholder }) => (
                        <label key={key} style={labelStyle}>
                            {label}
                            <input
                                type="text"
                                value={notice[key]}
                                onChange={(e) => patch({ [key]: e.target.value })}
                                placeholder={placeholder}
                                style={{ ...inputStyle, marginTop: '4px' }}
                            />
                        </label>
                    ))}
                </div>
            </div>

            <label style={{ ...labelStyle, fontSize: '16px', color: 'inherit' }}>
                소개
                <textarea
                    value={notice.intro}
                    onChange={(e) => patch({ intro: e.target.value })}
                    placeholder={"예: 우리 교회에서 아름다운 찬양의 기쁨을 함께 나눌 '교회음악교실'을 7월에 엽니다.\n모든 과목은 전공자 선생님이 직접 가르쳐요."}
                    rows={4}
                    style={{ ...inputStyle, marginTop: '8px', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
                />
            </label>

            <div>
                <span style={{ display: 'block', marginBottom: '8px' }}>소제목 묶음 <span style={{ color: '#6B7280' }}>(선택)</span></span>
                <div style={{ display: 'grid', gap: '12px' }}>
                    {sections.map((section, index) => (
                        <div key={section.id} style={boxStyle}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                                <input
                                    type="text"
                                    value={section.title}
                                    onChange={(e) => patchSection(section.id, { title: e.target.value })}
                                    placeholder="소제목 (예: 일일 진행 순서, 개설 과목)"
                                    aria-label={`${index + 1}번 소제목`}
                                    style={{ ...inputStyle, flex: 1, fontSize: '18px' }}
                                />
                                <button type="button" onClick={() => moveSection(index, -1)} disabled={index === 0} style={smallButton} aria-label="위로">↑</button>
                                <button type="button" onClick={() => moveSection(index, 1)} disabled={index === sections.length - 1} style={smallButton} aria-label="아래로">↓</button>
                                <button type="button" onClick={() => removeSection(section)} style={{ ...smallButton, color: '#DC2626', borderColor: '#FCA5A5' }}>삭제</button>
                            </div>
                            <label style={labelStyle}>
                                내용 (한 줄에 하나씩)
                                <textarea
                                    value={section.lines}
                                    onChange={(e) => patchSection(section.id, { lines: e.target.value })}
                                    placeholder={'예: 20:00 ~ 20:30 찬양\n20:30 ~ 20:35 공동기도문 낭독'}
                                    rows={3}
                                    style={{ ...inputStyle, marginTop: '4px', resize: 'vertical', fontFamily: 'inherit' }}
                                />
                            </label>
                        </div>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={() => patch({ sections: [...sections, emptyAnnouncementSection()] })}
                    style={{ marginTop: '12px', width: '100%', padding: '12px', borderRadius: '8px', border: '1px dashed #9CA3AF', backgroundColor: '#fff', cursor: 'pointer', fontSize: '16px' }}
                >
                    + 소제목 묶음 추가
                </button>
            </div>
        </div>
    );
};

export default NoticeAnnouncementEditor;

import React, { useState } from 'react';
import { NOTICE_FIELDS, emptyNoticeItem, formatNoticeWhen, timeLabel } from '../../lib/noticeItems';

// 교회소식(주보 광고) 양식 칸. 광고 한 건마다 제목 · 일시 · 장소 · 대상 · 신청·문의 · 내용.
// 빈 칸은 팝업에 나오지 않는다. 순서는 위·아래 버튼으로 바꾼다
const inputStyle = { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '16px', boxSizing: 'border-box' };
const smallButton = { padding: '6px 12px', borderRadius: '4px', border: '1px solid #D1D5DB', backgroundColor: '#fff', cursor: 'pointer', fontSize: '14px' };

const linkButton = { padding: '4px 0', border: 'none', background: 'none', color: '#2563EB', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline', textUnderlineOffset: '3px' };

// 시간 목록: 오전 6시 ~ 오후 10시, 30분 간격
const TIME_OPTIONS = Array.from({ length: 33 }, (_, i) => {
    const minutes = 6 * 60 + i * 30;
    return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
});

// 일시: 날짜는 달력, 시간은 목록에서 고르고 '2부 예배 후' 같은 말은 덧붙임 칸에.
// '매주 토요일'처럼 날짜로 못 적는 것은 '직접 적기'. 아래에 화면에 나갈 글을 미리 보여 준다
const NoticeWhenField = ({ item, onPatch }) => {
    const [showEnd, setShowEnd] = useState(Boolean(item.whenEndDate));
    const preview = formatNoticeWhen(item);

    if (item.whenManual) {
        return (
            <div style={{ gridColumn: '1 / -1', fontSize: '14px', color: '#6B7280' }}>
                <label style={{ display: 'block' }}>
                    일시 (직접 적기)
                    <input
                        type="text"
                        value={item.when}
                        onChange={(e) => onPatch({ when: e.target.value })}
                        placeholder="예: 매주 토요일 오후 4시"
                        style={{ ...inputStyle, marginTop: '4px', color: '#111827' }}
                    />
                </label>
                <button type="button" onClick={() => onPatch({ whenManual: false })} style={linkButton}>달력에서 날짜 고르기</button>
            </div>
        );
    }

    return (
        <div style={{ gridColumn: '1 / -1', fontSize: '14px', color: '#6B7280' }}>
            <span style={{ display: 'block' }}>일시</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input
                    type="date"
                    value={item.whenDate}
                    onChange={(e) => onPatch({ whenDate: e.target.value })}
                    aria-label="날짜"
                    style={{ ...inputStyle, width: 'auto', color: '#111827' }}
                />
                {showEnd ? (
                    <>
                        <span aria-hidden="true">~</span>
                        <input
                            type="date"
                            value={item.whenEndDate}
                            min={item.whenDate || undefined}
                            onChange={(e) => onPatch({ whenEndDate: e.target.value })}
                            aria-label="끝나는 날"
                            style={{ ...inputStyle, width: 'auto', color: '#111827' }}
                        />
                        <button type="button" onClick={() => { setShowEnd(false); onPatch({ whenEndDate: '' }); }} style={smallButton} aria-label="끝나는 날 지우기">×</button>
                    </>
                ) : (
                    <button type="button" onClick={() => setShowEnd(true)} style={smallButton}>+ 끝나는 날</button>
                )}
                <select
                    value={item.whenTime}
                    onChange={(e) => onPatch({ whenTime: e.target.value })}
                    aria-label="시간"
                    style={{ ...inputStyle, width: 'auto', color: '#111827' }}
                >
                    <option value="">시간 없음</option>
                    {TIME_OPTIONS.map((t) => <option key={t} value={t}>{timeLabel(t)}</option>)}
                </select>
                <input
                    type="text"
                    value={item.whenNote}
                    onChange={(e) => onPatch({ whenNote: e.target.value })}
                    placeholder="덧붙임 (예: 2부 예배 후)"
                    aria-label="일시 덧붙임"
                    style={{ ...inputStyle, flex: '1 1 160px', width: 'auto', color: '#111827' }}
                />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', alignItems: 'center', marginTop: '4px' }}>
                {preview && <span>화면에는 <b style={{ color: '#111827', fontWeight: 500 }}>{preview}</b></span>}
                <button type="button" onClick={() => onPatch({ whenManual: true, when: item.when || preview })} style={linkButton}>날짜 대신 직접 적기 (예: 매주 토요일)</button>
            </div>
        </div>
    );
};

const NoticeItemsEditor = ({ items, onChange, onLoadLastWeek }) => {
    const patch = (id, values) => onChange(items.map((item) => (item.id === id ? { ...item, ...values } : item)));
    const update = (id, key, value) => patch(id, { [key]: value });
    const remove = (id) => {
        const item = items.find((i) => i.id === id);
        if (item.title.trim() && !window.confirm(`'${item.title}' 광고를 지울까요?`)) return;
        onChange(items.filter((i) => i.id !== id));
    };
    const move = (index, dir) => {
        const next = [...items];
        [next[index], next[index + dir]] = [next[index + dir], next[index]];
        onChange(next);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ display: 'block' }}>광고</label>
                <button type="button" onClick={onLoadLastWeek} style={smallButton}>지난주 광고 불러오기</button>
            </div>

            {/* 쓰는 기준: 모든 광고가 같은 모양으로 보이게 */}
            <ul style={{ margin: '0 0 16px', padding: '12px 16px 12px 32px', backgroundColor: '#F9FAFB', borderRadius: '8px', color: '#4B5563', fontSize: '14px', lineHeight: 1.7 }}>
                <li>광고 하나에 소식 하나만 적어 주세요.</li>
                <li>제목은 짧게 적어 주세요. 예: 모임, 총남·여전도회 야유회, 장학생 선발</li>
                <li>일시는 달력에서 날짜를, 목록에서 시간을 골라 주세요. 요일은 저절로 붙어요.</li>
                <li>빈 칸은 화면에 나오지 않아요. 칸에 맞지 않는 말은 '내용'에 한 줄씩 적어 주세요.</li>
            </ul>

            <div style={{ display: 'grid', gap: '12px' }}>
                {items.map((item, index) => (
                    <div key={item.id} style={{ padding: '16px', border: '1px solid #E5E7EB', borderRadius: '8px', backgroundColor: '#fff' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ width: '28px', color: '#6B7280', fontVariantNumeric: 'tabular-nums' }}>{index + 1}</span>
                            <input
                                type="text"
                                value={item.title}
                                onChange={(e) => update(item.id, 'title', e.target.value)}
                                placeholder="제목 (예: 총남·여전도회 야유회)"
                                aria-label={`${index + 1}번 광고 제목`}
                                style={{ ...inputStyle, flex: 1, fontSize: '18px' }}
                            />
                            <button type="button" onClick={() => move(index, -1)} disabled={index === 0} style={smallButton} aria-label="위로">↑</button>
                            <button type="button" onClick={() => move(index, 1)} disabled={index === items.length - 1} style={smallButton} aria-label="아래로">↓</button>
                            <button type="button" onClick={() => remove(item.id)} style={{ ...smallButton, color: '#DC2626', borderColor: '#FCA5A5' }}>삭제</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '8px 12px', paddingLeft: '36px' }}>
                            <NoticeWhenField item={item} onPatch={(values) => patch(item.id, values)} />
                            {NOTICE_FIELDS.map(({ key, label, placeholder }) => (
                                <label key={key} style={{ display: 'block', fontSize: '14px', color: '#6B7280' }}>
                                    {label}
                                    <input
                                        type="text"
                                        value={item[key]}
                                        onChange={(e) => update(item.id, key, e.target.value)}
                                        placeholder={placeholder}
                                        style={{ ...inputStyle, marginTop: '4px', color: '#111827' }}
                                    />
                                </label>
                            ))}
                            <label style={{ display: 'block', gridColumn: '1 / -1', fontSize: '14px', color: '#6B7280' }}>
                                내용 <span>(한 줄에 하나씩)</span>
                                <textarea
                                    value={item.lines}
                                    onChange={(e) => update(item.id, 'lines', e.target.value)}
                                    placeholder={'예: 화요 중보기도 매주 화요일 오전 10:30, 소예배실\n목요 전도(떡볶이) 매주 목요일 오후 1시, 식당'}
                                    rows={2}
                                    style={{ ...inputStyle, marginTop: '4px', color: '#111827', resize: 'vertical', fontFamily: 'inherit' }}
                                />
                            </label>
                        </div>
                    </div>
                ))}
            </div>

            <button
                type="button"
                onClick={() => onChange([...items, emptyNoticeItem()])}
                style={{ marginTop: '12px', width: '100%', padding: '12px', borderRadius: '8px', border: '1px dashed #9CA3AF', backgroundColor: '#fff', cursor: 'pointer', fontSize: '16px' }}
            >
                + 광고 추가
            </button>
        </div>
    );
};

export default NoticeItemsEditor;

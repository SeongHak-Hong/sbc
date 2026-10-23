import React from 'react';
import { NOTICE_TABLE_KINDS, emptyNoticeRow, emptyNoticeTable, parsePastedTable } from '../../lib/noticeItems';

// 교회소식 표 칸: 요일 표(기간 · 주일~토) · 날짜 표(날짜 · 내용).
// 칸을 하나씩 채우거나, 엑셀 · 한글 표를 복사해 아무 칸에 붙여 넣으면 그 자리부터 채워진다
const cellStyle = { width: '100%', minWidth: '72px', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '16px', boxSizing: 'border-box', color: '#111827' };
const smallButton = { padding: '6px 12px', borderRadius: '4px', border: '1px solid #D1D5DB', backgroundColor: '#fff', cursor: 'pointer', fontSize: '14px' };

const NoticeTablesEditor = ({ tables, onChange, onLoadLastWeek, loadLabel = '지난주 표 불러오기' }) => {
    const patch = (id, values) => onChange(tables.map((t) => (t.id === id ? { ...t, ...values } : t)));
    const setCell = (table, r, c, value) => {
        const rows = table.rows.map((row, i) => (i === r ? row.map((cell, j) => (j === c ? value : cell)) : row));
        patch(table.id, { rows });
    };
    const addRow = (table) => patch(table.id, { rows: [...table.rows, emptyNoticeRow(table.kind)] });
    const removeRow = (table, r) => patch(table.id, { rows: table.rows.filter((_, i) => i !== r) });
    const removeTable = (table) => {
        if (!window.confirm(`'${table.title || NOTICE_TABLE_KINDS[table.kind].label}'를 지울까요?`)) return;
        onChange(tables.filter((t) => t.id !== table.id));
    };
    const move = (index, dir) => {
        const next = [...tables];
        [next[index], next[index + dir]] = [next[index + dir], next[index]];
        onChange(next);
    };

    // 여러 칸을 복사해 붙여 넣으면(탭·줄바꿈이 있으면) 그 칸부터 오른쪽·아래로 채우고, 모자란 줄은 늘린다
    const handlePaste = (table, r, c, e) => {
        const text = e.clipboardData.getData('text/plain');
        if (!/[\t\n]/.test(text.trim())) return;
        e.preventDefault();
        const pasted = parsePastedTable(text, table.kind);
        const width = NOTICE_TABLE_KINDS[table.kind].headers.length;
        const rows = table.rows.map((row) => [...row]);
        pasted.forEach((cells, i) => {
            if (!rows[r + i]) rows[r + i] = emptyNoticeRow(table.kind);
            cells.forEach((cell, j) => {
                if (c + j < width) rows[r + i][c + j] = cell;
            });
        });
        patch(table.id, { rows });
    };

    return (
        <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <label style={{ display: 'block' }}>표 <span style={{ color: '#6B7280' }}>(선택)</span></label>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={onLoadLastWeek} style={smallButton}>{loadLabel}</button>
                    <button type="button" onClick={() => onChange([...tables, emptyNoticeTable('weekday')])} style={smallButton}>+ 요일 표</button>
                    <button type="button" onClick={() => onChange([...tables, emptyNoticeTable('date')])} style={smallButton}>+ 날짜 표</button>
                </div>
            </div>
            <p style={{ margin: '0 0 12px', fontSize: '14px', color: '#6B7280' }}>
                엑셀이나 한글 표를 복사해서 첫 칸에 붙여 넣으면 칸이 저절로 채워져요. 빈 줄은 화면에 나오지 않아요.
            </p>

            <div style={{ display: 'grid', gap: '12px' }}>
                {tables.map((table, index) => {
                    const { label, headers, placeholder } = NOTICE_TABLE_KINDS[table.kind];
                    return (
                        <div key={table.id} style={{ padding: '16px', border: '1px solid #E5E7EB', borderRadius: '8px', backgroundColor: '#fff' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                                <span style={{ flexShrink: 0, color: '#6B7280', fontSize: '14px' }}>{label}</span>
                                <input
                                    type="text"
                                    value={table.title}
                                    onChange={(e) => patch(table.id, { title: e.target.value })}
                                    placeholder={`표 제목 (${placeholder})`}
                                    aria-label={`${index + 1}번 표 제목`}
                                    style={{ ...cellStyle, flex: 1, fontSize: '18px', padding: '10px' }}
                                />
                                <button type="button" onClick={() => move(index, -1)} disabled={index === 0} style={smallButton} aria-label="표 위로">↑</button>
                                <button type="button" onClick={() => move(index, 1)} disabled={index === tables.length - 1} style={smallButton} aria-label="표 아래로">↓</button>
                                <button type="button" onClick={() => removeTable(table)} style={{ ...smallButton, color: '#DC2626', borderColor: '#FCA5A5' }}>삭제</button>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ borderCollapse: 'separate', borderSpacing: '4px', width: '100%' }}>
                                    <thead>
                                        <tr>
                                            {headers.map((h) => (
                                                <th key={h} style={{ fontWeight: 400, fontSize: '14px', color: '#6B7280', textAlign: 'left', padding: '0 4px' }}>{h}</th>
                                            ))}
                                            <th aria-label="줄 지우기" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {table.rows.map((row, r) => (
                                            <tr key={r}>
                                                {headers.map((h, c) => (
                                                    <td key={h} style={{ minWidth: c === 0 ? '120px' : undefined, width: table.kind === 'date' && c === 1 ? '70%' : undefined }}>
                                                        <input
                                                            type="text"
                                                            value={row[c] || ''}
                                                            onChange={(e) => setCell(table, r, c, e.target.value)}
                                                            onPaste={(e) => handlePaste(table, r, c, e)}
                                                            placeholder={c === 0 ? (table.kind === 'weekday' ? '예: 10.18~24' : '예: 10/19(월)') : ''}
                                                            aria-label={`${r + 1}번째 줄 ${h}`}
                                                            style={cellStyle}
                                                        />
                                                    </td>
                                                ))}
                                                <td>
                                                    <button type="button" onClick={() => removeRow(table, r)} style={smallButton} aria-label={`${r + 1}번째 줄 지우기`}>×</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <button type="button" onClick={() => addRow(table)} style={{ ...smallButton, marginTop: '8px' }}>+ 줄 추가</button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default NoticeTablesEditor;

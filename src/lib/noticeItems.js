// 교회소식(주보 광고) 양식: 광고 한 건 = 제목 · 일시 · 장소 · 대상 · 신청·문의 · 내용.
// 관리자 화면(NoticeItemsEditor)에서 칸을 채우면, 저장할 때 늘 같은 모양의 본문 HTML을 만든다.
// 만든 본문은 팝업에서 cleanPostContents가 광고 한 묶음(번호 · 제목 · 이름 | 값)으로 그린다.

// 일시는 따로 고르는 칸(NoticeWhenField)이라 여기 없음. 화면에는 맨 앞 줄로 나간다
export const NOTICE_FIELDS = [
    { key: 'place', label: '장소', placeholder: '예: 소예배실' },
    { key: 'target', label: '대상', placeholder: '예: 성가대, 찬양단' },
    { key: 'apply', label: '신청·문의', placeholder: '예: 10월 25일(주일)까지 행정실' },
];

// 일시: 날짜(달력) · 끝나는 날(선택) · 시간(목록) · 덧붙임("2부 예배 후").
// 날짜로 못 적는 것("매주 토요일")은 whenManual로 직접 적는다(when)
export const emptyNoticeItem = () => ({
    id: crypto.randomUUID(),
    title: '',
    whenDate: '',
    whenEndDate: '',
    whenTime: '',
    whenNote: '',
    whenManual: false,
    when: '',
    place: '',
    target: '',
    apply: '',
    lines: '',
});

// 예전에 일시를 글로만 적어 둔 광고는 직접 적기로 연다
export const normalizeNoticeItem = (item) => {
    const merged = { ...emptyNoticeItem(), ...item };
    if (!merged.whenDate && merged.when && item.whenManual === undefined) merged.whenManual = true;
    return merged;
};

const WEEKDAYS = ['주일', '월', '화', '수', '목', '금', '토'];

const parseYmd = (s) => {
    const [y, m, d] = String(s || '').split('-').map((n) => parseInt(n, 10));
    return y && m && d ? new Date(y, m - 1, d) : null;
};

// '14:00' → '오후 2시', '10:30' → '오전 10시 30분', '12:00' → '낮 12시'
export const timeLabel = (hhmm) => {
    const [h, m] = String(hhmm || '').split(':').map((n) => parseInt(n, 10));
    if (Number.isNaN(h)) return '';
    const part = h === 12 ? '낮' : h < 12 ? '오전' : '오후';
    const hour = h > 12 ? h - 12 : h;
    return `${part} ${hour}시${m ? ` ${m}분` : ''}`;
};

// "10월 31일(토) 오후 2시", "11월 1일(주일) ~ 21일(토) 오후 8시", "10월 25일(주일) 2부 예배 후"
export const formatNoticeWhen = (item) => {
    if (item.whenManual) return (item.when || '').trim();
    const start = parseYmd(item.whenDate);
    if (!start) return (item.whenNote || '').trim();
    let text = `${start.getMonth() + 1}월 ${start.getDate()}일(${WEEKDAYS[start.getDay()]})`;
    const end = parseYmd(item.whenEndDate);
    if (end && end > start) {
        const month = end.getMonth() !== start.getMonth() ? `${end.getMonth() + 1}월 ` : '';
        text += ` ~ ${month}${end.getDate()}일(${WEEKDAYS[end.getDay()]})`;
    }
    return [text, timeLabel(item.whenTime), (item.whenNote || '').trim()].filter(Boolean).join(' ');
};

const escapeHtml = (s) => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// 제목이 빈 광고는 빼고, 칸마다 "이름: 값" 한 줄, 내용은 줄마다 한 줄
export const noticeItemsToHtml = (items = []) => items
    .filter((item) => item.title.trim())
    .map((item, index) => {
        const when = formatNoticeWhen(item);
        const rows = [
            ...(when ? [`일시: ${when}`] : []),
            ...NOTICE_FIELDS
                .filter(({ key }) => item[key]?.trim())
                .map(({ key, label }) => `${label}: ${item[key].trim()}`),
            ...(item.lines || '').split('\n').map((line) => line.trim()).filter(Boolean),
        ];
        const list = rows.length
            ? `<ul>${rows.map((row) => `<li><p>${escapeHtml(row)}</p></li>`).join('')}</ul>`
            : '';
        return `<p>${index + 1}. ${escapeHtml(item.title.trim())}</p>${list}`;
    })
    .join('');

// ---------- 표: 요일 표(기간 · 주일~토) · 날짜 표(날짜 · 내용) ----------
// 줄마다 칸 값 배열. 첫 칸이 기간·날짜
export const NOTICE_TABLE_KINDS = {
    weekday: { label: '요일 표', headers: ['기간', '주일', '월', '화', '수', '목', '금', '토'], placeholder: '예: 일일 릴레이 금식기도표' },
    date: { label: '날짜 표', headers: ['날짜', '내용'], placeholder: '예: 전교인 성경 통독' },
};

export const emptyNoticeRow = (kind) => NOTICE_TABLE_KINDS[kind].headers.map(() => '');

export const emptyNoticeTable = (kind) => ({
    id: crypto.randomUUID(),
    kind,
    title: '',
    rows: [emptyNoticeRow(kind), emptyNoticeRow(kind)],
});

// 엑셀 · 한글 표에서 복사한 글(칸은 탭, 줄은 줄바꿈)을 칸 배열로.
// 머리줄('날짜', '주일' …)은 건너뛰고, 날짜 표인데 가로로 놓인 표(2줄에 칸이 여럿)는 세로로 돌린다
export const parsePastedTable = (text, kind) => {
    let rows = text.replace(/\r/g, '').split('\n')
        .map((line) => line.split('\t').map((cell) => cell.trim()))
        .filter((cells) => cells.some(Boolean));
    if (kind === 'date' && rows.length === 2 && rows[0].length > 2) {
        rows = rows[0].map((_, i) => [rows[0][i] || '', rows[1][i] || '']);
    }
    const headers = NOTICE_TABLE_KINDS[kind].headers;
    if (rows.length && headers.includes(rows[0][0])) rows = rows.slice(1);
    if (rows.length && kind === 'weekday' && rows[0].slice(1).some((cell) => ['주일', '일', '월', '화'].includes(cell))) rows = rows.slice(1);
    return rows;
};

// Firestore는 배열 안의 배열을 저장하지 못한다 → 줄은 { cells: [...] }로 저장하고, 불러올 때 다시 배열로
const isEmptyRow = (row) => !row.some((cell) => String(cell || '').trim());
export const noticeTablesForStore = (tables = []) => tables.map((table) => ({
    ...table,
    rows: table.rows.filter((row) => !isEmptyRow(row)).map((cells) => ({ cells })),
}));
export const normalizeNoticeTable = (table) => ({
    ...table,
    title: table.title || '',
    rows: (table.rows || []).map((row) => (Array.isArray(row) ? row : row.cells || [])),
});

const noticeTablesToHtml = (tables = []) => tables
    .map(normalizeNoticeTable)
    .map((table) => {
        const { headers } = NOTICE_TABLE_KINDS[table.kind] || NOTICE_TABLE_KINDS.date;
        const rows = (table.rows || []).filter((row) => row.some((cell) => cell.trim()));
        if (!rows.length) return '';
        const head = `<thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead>`;
        const body = `<tbody>${rows.map((row) => `<tr>${headers.map((_, i) => `<td>${escapeHtml((row[i] || '').trim())}</td>`).join('')}</tr>`).join('')}</tbody>`;
        const title = table.title.trim() ? `<h3>${escapeHtml(table.title.trim())}</h3>` : '';
        return `${title}<table>${head}${body}</table>`;
    })
    .join('');

// 본문 = 광고 + 표 + (있으면) 구분선 + 덧붙이는 글. 구분선(<hr>)이 있어야 팝업에서 덧붙이는 글이
// 마지막 광고에 딸려 들어가지 않고 단락 간격을 두고 따로 나온다
export const buildNoticeContent = (items = [], extraContent = '', tables = []) => {
    const extra = (extraContent || '').trim();
    const hasExtra = extra && extra.replace(/<[^>]*>|&nbsp;/g, '').trim();
    return noticeItemsToHtml(items) + noticeTablesToHtml(tables) + (hasExtra ? `<hr>${extra}` : '');
};

// ---------- 공지사항 안내 양식: 공지 한 건 ----------
// 기본 정보(일시 · 장소 · 대상 · 신청·문의)는 팝업 제목 아래 정보 줄(PostSheet facts)로,
// 본문은 소개 글 → 소제목 묶음(소제목 + 한 줄씩) → 표 → 덧붙이는 글
export const emptyAnnouncement = () => ({
    ...emptyNoticeItem(),
    intro: '',
    sections: [],
});

export const emptyAnnouncementSection = () => ({ id: crypto.randomUUID(), title: '', lines: '' });

export const normalizeAnnouncement = (notice) => ({
    ...normalizeNoticeItem(notice),
    intro: notice.intro || '',
    sections: (notice.sections || []).map((s) => ({ ...emptyAnnouncementSection(), ...s })),
});

// 팝업 정보 줄: [{ label, value }]
export const announcementFacts = (notice) => {
    const when = formatNoticeWhen(notice);
    return [
        when && { label: '일시', value: when },
        ...NOTICE_FIELDS
            .filter(({ key }) => notice[key]?.trim())
            .map(({ key, label }) => ({ label, value: notice[key].trim() })),
    ].filter(Boolean);
};

const linesToHtml = (lines) => (lines || '').split('\n').map((l) => l.trim()).filter(Boolean);

// 본문 HTML. withFacts면 기본 정보도 맨 위 목록으로 넣는다(저장용 content — 정보 줄을 못 그리는 곳 대비)
export const buildAnnouncementContent = (notice, extraContent = '', tables = [], { withFacts = false } = {}) => {
    const facts = withFacts ? announcementFacts(notice) : [];
    const factsHtml = facts.length
        ? `<ul>${facts.map(({ label, value }) => `<li><p>${escapeHtml(`${label}: ${value}`)}</p></li>`).join('')}</ul>`
        : '';
    // 소개는 빈 줄로 문단을 나눈다
    const intro = (notice.intro || '').split(/\n\s*\n/).map((para) => para.trim()).filter(Boolean)
        .map((para) => `<p>${escapeHtml(para).replace(/\n/g, ' ')}</p>`).join('');
    const sections = (notice.sections || [])
        .filter((s) => s.title.trim() || linesToHtml(s.lines).length)
        .map((s) => {
            const rows = linesToHtml(s.lines);
            const title = s.title.trim() ? `<h3>${escapeHtml(s.title.trim())}</h3>` : '';
            return title + (rows.length ? `<ul>${rows.map((r) => `<li><p>${escapeHtml(r)}</p></li>`).join('')}</ul>` : '');
        })
        .join('');
    const extra = (extraContent || '').trim();
    const hasExtra = extra && extra.replace(/<[^>]*>|&nbsp;/g, '').trim();
    return factsHtml + intro + sections + noticeTablesToHtml(tables) + (hasExtra ? `<hr>${extra}` : '');
};

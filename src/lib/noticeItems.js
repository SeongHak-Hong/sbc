// 교회소식(주보 광고) 양식: 광고 한 건 = 제목 · 일시 · 장소 · 대상 · 신청·문의 · 내용.
// 관리자 화면(NoticeItemsEditor)에서 칸을 채우면, 저장할 때 늘 같은 모양의 본문 HTML을 만든다.
// 만든 본문은 팝업에서 cleanPostContents가 광고 한 묶음(번호 · 제목 · 이름 | 값)으로 그린다.

export const NOTICE_FIELDS = [
    { key: 'when', label: '일시', placeholder: '예: 10월 31일(토) 오후 2시' },
    { key: 'place', label: '장소', placeholder: '예: 소예배실' },
    { key: 'target', label: '대상', placeholder: '예: 성가대, 찬양단' },
    { key: 'apply', label: '신청·문의', placeholder: '예: 10월 25일(주일)까지 행정실' },
];

export const emptyNoticeItem = () => ({
    id: crypto.randomUUID(),
    title: '',
    when: '',
    place: '',
    target: '',
    apply: '',
    lines: '',
});

const escapeHtml = (s) => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// 제목이 빈 광고는 빼고, 칸마다 "이름: 값" 한 줄, 내용은 줄마다 한 줄
export const noticeItemsToHtml = (items = []) => items
    .filter((item) => item.title.trim())
    .map((item, index) => {
        const rows = [
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

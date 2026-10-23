// 게시물 본문 자동 정리. 저장된 원문은 그대로 두고, 화면에 그리기 직전에 구조만 바로잡는다.
// PostSheet가 Viewer를 그린 직후 부른다. 받는 것: Toast UI Viewer가 그린 .toastui-editor-contents 요소, 게시물 제목
// 하는 일:
//  1. 제목 크기(h1~h6)를 소제목 하나로 통일, 본문 첫 줄이 게시물 제목을 되풀이하면 지움
//  2. 빈 줄(<p><br></p>) 지움, 앞 공백으로 이어 쓴 줄은 윗줄에 붙임
//  3. "모 임" → "모임", "대상:성가대" → "대상: 성가대"
//  4. "< 2026년 목회계획 >" 같은 꺾쇠 줄, "📞 문의 및 신청"처럼 굵은 글씨로 시작하는 줄 → 소제목
//  5. "1. 모 임" 같은 번호 문단 → 광고 한 묶음(번호 · 제목 · 아래 목록). "대접(떡) - 엄태석 집사"는 제목 · 내용으로 나눔
//  6. 쪼개진 목록을 하나로, "일시 및 장소: …"는 이름 · 값 두 칸
//  7. 표는 좌우로 밀어 볼 수 있는 칸에 넣음
const cleanPostContents = (contents, title) => {
    if (contents.classList.contains('post-clean')) return;
    const doc = contents.ownerDocument;
    // Viewer는 본문을 <div data-nodeid> 한 겹으로 감싸 그린다 → 그 안쪽을 기준으로
    const inner = contents.firstElementChild;
    const root = contents.children.length === 1 && inner.tagName === 'DIV' ? inner : contents;
    const text = (el) => (el.textContent || '').replace(/\u00a0/g, ' ');
    const plain = (s) => s.replace(/[^가-힣a-zA-Z0-9]/g, '');
    const emojiLead = /^[\p{Extended_Pictographic}\uFE0F\u200d\s]+/u;
    const make = (tag, cls, html) => {
        const el = doc.createElement(tag);
        if (cls) el.className = cls;
        if (html != null) el.innerHTML = html;
        return el;
    };

    // 1. 제목 크기 통일 + 게시물 제목 되풀이 지움
    root.querySelectorAll('h1, h2, h4, h5, h6').forEach((h) => {
        h.replaceWith(make('h3', null, h.innerHTML));
    });
    // 첫 줄에서 제목을 빼고 남는 게 '[안내]'·교회 이름뿐일 때만 (제목이 든 첫 문장·일정 줄은 남긴다)
    const first = root.firstElementChild;
    const firstText = first ? plain(text(first)) : '';
    if (title && plain(title) && firstText.includes(plain(title))
        && /^(안내|공지|알림|신탄진침례교회|신탄진교회)*$/.test(firstText.replace(plain(title), ''))) {
        first.remove();
    }

    // 2. 빈 줄 지움
    root.querySelectorAll('p').forEach((p) => {
        if (!text(p).trim() && !p.querySelector('img')) p.remove();
    });

    // 3. 글자 정리 (글자 노드만 고친다 → 굵게·링크는 그대로)
    const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((n) => {
        n.nodeValue = n.nodeValue
            .replace(/\u00a0/g, ' ')
            .replace(/(^|\d\.\s*|\s)([가-힣]) ([가-힣])(?=\s*[:：]|\s*$)/g, '$1$2$3')
            .replace(/([가-힣)])\s*[:：]\s*/g, '$1: ');
    });

    // 2-1. 앞 공백으로 이어 쓴 줄: 윗줄이 문장 끝이 아니면 붙이고, 끝났으면 따로 둠
    [...root.children].forEach((el) => {
        if (el.tagName !== 'P' || !/^\s{2,}/.test(text(el))) return;
        const prev = el.previousElementSibling;
        if (prev && prev.tagName === 'P' && !/([.)\]!?]|니다)\s*$/.test(text(prev))) {
            prev.append(` ${text(el).trim()}`);
            el.remove();
        } else {
            el.textContent = text(el).trim();
        }
    });

    // 4. 꺾쇠 줄 · 굵은 글씨로 시작하는 줄 → 소제목
    [...root.children].forEach((el) => {
        if (el.tagName !== 'P') return;
        const m = text(el).trim().match(/^[<〈《[]\s*(.+?)\s*[>〉》\]]$/);
        if (m) {
            el.replaceWith(make('h3', null, m[1]));
            return;
        }
        const lead = el.firstChild;
        // 굵은 글씨 뒤가 띄어쓰기로 시작할 때만 ("**월삭예배**는 …"처럼 문장 안의 굵은 낱말은 그대로)
        const after = lead && lead.nextSibling;
        if (lead && lead.nodeName === 'STRONG' && text(lead).trim().length <= 16
            && after && after.nodeType === 3 && /^\s/.test(after.nodeValue)) {
            const head = make('h3', null, text(lead).trim());
            lead.remove();
            el.before(head);
        }
    });
    root.querySelectorAll('h3').forEach((h) => {
        h.textContent = text(h).replace(emojiLead, '').trim();
    });

    // 6-1. 쪼개진 목록 하나로
    [...root.querySelectorAll('ul, ol')].forEach((list) => {
        const prev = list.previousElementSibling;
        if (prev && prev.tagName === list.tagName && list.isConnected) {
            prev.append(...list.children);
            list.remove();
        }
    });

    // 5. 번호 문단 → 광고 한 묶음
    let section = null;
    [...root.children].forEach((el) => {
        const m = el.tagName === 'P' && text(el).trim().match(/^(\d{1,2})\s*[.)]\s*(.+)$/s);
        if (m) {
            section = make('section', 'ps-item');
            const [, num, rest] = m;
            const split = rest.match(/^(.{2,14}?)\s+[–—-]\s+(.+)$/);
            const head = make('h3', 'ps-item-head');
            head.append(make('span', 'ps-num', num), (split ? split[1] : rest).trim());
            section.append(head);
            if (split) {
                // "일시: 11월 1일~21일" 처럼 이름이 붙은 내용은 목록 한 줄로 → 아래에서 이름 · 값 두 칸이 된다
                const detail = split[2].trim();
                const p = make('p');
                p.append(detail);
                if (/^[^:]{1,10}:\s/.test(detail)) {
                    const ul = make('ul');
                    ul.append(make('li'));
                    ul.firstChild.append(p);
                    section.append(ul);
                } else {
                    section.append(p);
                }
            }
            el.replaceWith(section);
            return;
        }
        // 다음 소제목·표가 나오면 묶음 끝
        if (el.tagName === 'H3' || el.tagName === 'TABLE' || el.tagName === 'BLOCKQUOTE') {
            section = null;
            return;
        }
        if (section) section.append(el);
    });

    // 6-2. "이름: 값" 목록 → 두 칸
    root.querySelectorAll('li').forEach((li) => {
        const holder = li.querySelector(':scope > p') || li;
        const lead = holder.firstChild;
        let label = null;
        if (lead && lead.nodeName === 'STRONG' && /[:：]\s*$/.test(text(lead))) {
            label = text(lead).replace(/[:：]\s*$/, '').trim();
            lead.remove();
        } else if (lead && lead.nodeType === 3) {
            const m = lead.nodeValue.match(/^\s*([^:：]{1,10}?)\s*[:：]\s*(.*)$/s);
            if (m && !/\d$/.test(m[1])) {
                label = m[1];
                lead.nodeValue = m[2];
            }
        }
        if (label) {
            li.classList.add('ps-pair');
            if (label.replace(/\s/g, '').length > 6) li.classList.add('ps-pair-long');
            // 이어 쓰는 긴 이름은 값과 한 칸 띄움
            if (li.classList.contains('ps-pair-long')) holder.prepend(' ');
            holder.prepend(make('span', 'ps-label', label));
        }
    });

    // 7. 표는 좌우로 밀어 보는 칸에
    root.querySelectorAll('table').forEach((t) => {
        const wrap = make('div', 'ps-table');
        t.before(wrap);
        wrap.append(t);
    });

    contents.classList.add('post-clean');
};

export default cleanPostContents;

// POST /api/newcomer-inquiry — 새가족 페이지 '새가족 등록 문의' 팝업에서 보낸 글을 새가족팀 메일로 보낸다.
// 메일은 Resend(https://resend.com)로 보낸다. Cloudflare Pages 대시보드 > 설정 > 환경 변수에 넣을 값:
//   RESEND_API_KEY        Resend에서 받은 API 키 (비밀 값으로)
//   NEWCOMER_INQUIRY_TO   받을 새가족팀 메일 주소 (여러 개면 쉼표로)
//   NEWCOMER_INQUIRY_FROM 보내는 주소. 없으면 Resend 시험 주소(onboarding@resend.dev)를 쓰는데,
//                         이 주소는 Resend 가입 메일로만 보내진다. shintanjin.or.kr 도메인을 Resend에 인증한 뒤
//                         '신탄진침례교회 <newcomer@shintanjin.or.kr>'처럼 넣는다.
// 이름·연락처는 메일로만 전하고 어디에도 저장하지 않는다.
const LIMITS = { name: 40, contact: 100, question: 500 };
const DEFAULT_FROM = '신탄진침례교회 홈페이지 <onboarding@resend.dev>';

const fail = (status, error) => Response.json({ error }, { status });

const escapeHtml = (value) => value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export async function onRequestPost({ request, env }) {
    if (!env.RESEND_API_KEY || !env.NEWCOMER_INQUIRY_TO) {
        return fail(503, '지금은 문의를 보낼 수 없어요. 잠시 후 다시 시도해 주세요.');
    }
    if (Number(request.headers.get('Content-Length')) > 8 * 1024) {
        return fail(413, '글이 너무 길어요.');
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return fail(400, '보낸 내용을 읽지 못했어요.');
    }

    // 사람에게는 보이지 않는 칸(website)에 값이 있으면 자동 등록 프로그램으로 보고 조용히 성공 처리한다
    if (body.website) return Response.json({ ok: true });

    const name = String(body.name ?? '').trim();
    const contact = String(body.contact ?? '').trim();
    const question = String(body.question ?? '').trim();
    if (!name || !contact) return fail(400, '이름과 받을 연락처를 적어 주세요.');
    if (name.length > LIMITS.name || contact.length > LIMITS.contact || question.length > LIMITS.question) {
        return fail(400, '글자 수가 너무 많아요.');
    }
    if (body.agree !== true) return fail(400, '안내 내용에 동의해 주세요.');

    const sentAt = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
    const rows = [
        ['이름', name],
        ['받을 연락처', contact],
        ['궁금한 점', question || '(비워 두셨어요)'],
        ['보낸 시각', sentAt],
    ];

    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            from: env.NEWCOMER_INQUIRY_FROM || DEFAULT_FROM,
            to: env.NEWCOMER_INQUIRY_TO.split(',').map((v) => v.trim()).filter(Boolean),
            // 연락처가 메일 주소면 '답장'을 누르면 바로 그 분께 간다
            ...(isEmail ? { reply_to: contact } : {}),
            subject: `[새가족 문의] ${name}님`,
            text: rows.map(([k, v]) => `${k}: ${v}`).join('\n'),
            html: `<h2 style="margin:0 0 16px">새가족 등록 문의가 왔어요</h2>
<table style="border-collapse:collapse;font-size:15px;line-height:1.6">${rows
                .map(([k, v]) => `<tr><th style="text-align:left;padding:6px 16px 6px 0;vertical-align:top;white-space:nowrap">${k}</th><td style="padding:6px 0;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`)
                .join('')}</table>`,
        }),
    });

    if (!res.ok) {
        console.error('Resend 오류', res.status, await res.text());
        return fail(502, '문의를 보내지 못했어요. 잠시 후 다시 시도해 주세요.');
    }
    return Response.json({ ok: true });
}

// POST /api/gallery/image — 갤러리가 아닌 관리자 화면(글 본문·공지·주보·일정·사업체·다음세대 행사) 사진 한 장.
// 관리자 확인은 _middleware.js 가 먼저 한다. 사진은 브라우저에서 줄여서 보낸다 (src/lib/gallery.js uploadSiteImage).
const EXTENSIONS = { 'image/webp': 'webp', 'image/jpeg': 'jpg' };
const MAX_BYTES = 2.5 * 1024 * 1024;
const CACHE_CONTROL = 'public, max-age=31536000, immutable';

const fail = (status, error) => Response.json({ error }, { status });

export async function onRequestPost({ request, env }) {
    if (Number(request.headers.get('Content-Length')) > 3 * 1024 * 1024) {
        return fail(413, '사진 용량이 너무 큽니다.');
    }

    let form;
    try {
        form = await request.formData();
    } catch {
        return fail(400, '사진을 읽지 못했습니다.');
    }

    const file = form.get('file');
    if (!(file instanceof File) || !EXTENSIONS[file.type] || file.size === 0 || file.size > MAX_BYTES) {
        return fail(400, '사진 형식이나 용량이 올바르지 않습니다.');
    }

    // 예: images/2026/10/0b9e….webp
    const now = new Date();
    const key = `images/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}/${crypto.randomUUID()}.${EXTENSIONS[file.type]}`;
    await env.GALLERY_BUCKET.put(key, file, {
        httpMetadata: { contentType: file.type, cacheControl: CACHE_CONTROL },
    });

    return Response.json({ key });
}

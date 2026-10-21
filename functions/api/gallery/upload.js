// POST /api/gallery/upload — 관리자 확인은 _middleware.js 가 먼저 한다.
// 사진은 브라우저에서 크게 보기용(full)·목록용(thumb) 두 벌로 줄여서 보낸다 (src/lib/gallery.js).
const EXTENSIONS = { 'image/webp': 'webp', 'image/jpeg': 'jpg' };
const MAX_BYTES = { full: 2 * 1024 * 1024, thumb: 300 * 1024 };
// 파일 이름이 매번 새로 만들어져 내용이 바뀌지 않으므로 오래 캐시한다
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

    const files = {};
    for (const size of ['full', 'thumb']) {
        const file = form.get(size);
        if (!(file instanceof File) || !EXTENSIONS[file.type] || file.size === 0 || file.size > MAX_BYTES[size]) {
            return fail(400, '사진 형식이나 용량이 올바르지 않습니다.');
        }
        files[size] = file;
    }

    // 예: gallery/2026/10/0b9e…-full.webp
    const now = new Date();
    const id = crypto.randomUUID();
    const prefix = `gallery/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}/${id}`;

    const keys = {};
    for (const [size, file] of Object.entries(files)) {
        keys[size] = `${prefix}-${size}.${EXTENSIONS[file.type]}`;
        await env.GALLERY_BUCKET.put(keys[size], file, {
            httpMetadata: { contentType: file.type, cacheControl: CACHE_CONTROL },
        });
    }

    return Response.json({ id, ...keys });
}

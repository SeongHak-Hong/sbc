// POST /api/gallery/delete — { keys: [...] } 앨범이나 사진을 지울 때 R2 파일도 같이 지운다.
// 관리자 확인은 _middleware.js 가 먼저 하고, 여기서는 upload.js 가 만든 이름의 파일만 지울 수 있게 막는다.
const KEY_PATTERN = /^gallery\/\d{4}\/\d{2}\/[0-9a-f-]{36}-(full|thumb)\.(webp|jpg)$/;

export async function onRequestPost({ request, env }) {
    const body = await request.json().catch(() => null);
    const keys = body?.keys;
    if (!Array.isArray(keys) || keys.length === 0 || keys.length > 1000 || !keys.every((key) => KEY_PATTERN.test(key))) {
        return Response.json({ error: '지울 사진 목록이 올바르지 않습니다.' }, { status: 400 });
    }

    await env.GALLERY_BUCKET.delete(keys);
    return Response.json({ deleted: keys.length });
}

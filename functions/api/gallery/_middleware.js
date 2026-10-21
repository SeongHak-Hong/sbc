import { createRemoteJWKSet, jwtVerify } from 'jose';

// /api/gallery/* 는 관리자만 쓸 수 있다.
// 1) Firebase 로그인 토큰이 진짜인지 Google 공개키로 확인하고
// 2) 그 토큰으로 Firestore admins/{uid} 문서를 읽어 관리자인지 확인한다 (ProtectedRoute 와 같은 관리자 목록).
const firebaseKeys = createRemoteJWKSet(
    new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

const fail = (status, error) => Response.json({ error }, { status });

const verifyIdToken = async (token, projectId) => {
    const { payload } = await jwtVerify(token, firebaseKeys, {
        algorithms: ['RS256'],
        issuer: `https://securetoken.google.com/${projectId}`,
        audience: projectId,
    });

    // 서버 간 시계 차이 60초까지는 봐준다
    const now = Date.now() / 1000 + 60;
    if (typeof payload.sub !== 'string' || !payload.sub) throw new Error('sub 없음');
    if (!(payload.iat <= now && payload.auth_time <= now)) throw new Error('발급 시각 오류');
    return payload.sub;
};

export async function onRequest(context) {
    const { request, env } = context;
    // Cloudflare Pages 환경 변수는 빌드와 함수가 같이 쓴다
    const projectId = env.VITE_FIREBASE_PROJECT_ID;
    if (!projectId || !env.GALLERY_BUCKET) {
        return fail(500, '갤러리 저장소 설정이 끝나지 않았습니다.');
    }

    const token = request.headers.get('Authorization')?.match(/^Bearer (\S+)$/)?.[1];
    if (!token) return fail(401, '로그인이 필요합니다.');

    let uid;
    try {
        uid = await verifyIdToken(token, projectId);
    } catch {
        return fail(401, '로그인이 만료되었습니다. 다시 로그인해 주세요.');
    }

    // 규칙상 본인 문서만 읽을 수 있어서, 문서가 없거나(404) 거부되면(403) 관리자가 아니다
    let adminDoc;
    try {
        adminDoc = await fetch(
            `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/admins/${encodeURIComponent(uid)}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
    } catch {
        return fail(502, '관리자 확인 중 오류가 났습니다. 잠시 후 다시 시도해 주세요.');
    }
    if (!adminDoc.ok) return fail(403, '관리자 계정만 사진을 올리거나 지울 수 있습니다.');

    return context.next();
}

// 구름 형태와 배치.
// drei 기본 분포는 상자 안 무작위 + 가운데가 가장 큰 조각이라 덩어리가 공(주먹밥)처럼 둥글어진다.
// 여기서는 실제 구름처럼 형태별로 조각을 직접 배치한다.
//   - cumulus(적운): 바닥은 평평, 윗면은 봉우리 2~3개가 솟은 뭉게뭉게한 윤곽, 가로로 긴 덩어리
//   - sea(운해): 넓고 낮게 깔린 층, 윗면이 완만하게 물결침
//   - wisp(새털구름): 높은 하늘의 얇고 긴 줄
import * as THREE from 'three';

export function mulberry(seed) {
    let a = seed;
    return () => {
        a |= 0; a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// drei는 point(-1~1)에 bounds를 곱해 위치를 정하고, volume(배수)에 Cloud의 volume을 곱해 조각 크기를 정한다.
// 조각마다 index로 시드를 고정해 다시 렌더해도 모양이 바뀌지 않게 한다.

function cumulus(seed) {
    const r0 = mulberry(seed);
    const peaks = Array.from({ length: 2 + Math.floor(r0() * 2) }, () => ({
        x: r0() * 1.2 - 0.6,
        w: 0.18 + r0() * 0.22,
        h: 0.45 + r0() * 0.55,
    }));
    // 윗면 높이(0~1): 완만한 몸통 + 봉우리
    const top = (ux) => {
        let h = 0.38 * Math.pow(Math.max(0, 1 - ux * ux), 0.9);
        for (const p of peaks) h += p.h * 0.6 * Math.exp(-((ux - p.x) ** 2) / (2 * p.w * p.w));
        return Math.min(h, 1);
    };
    return (cloud, index) => {
        const r = mulberry(seed * 7919 + index * 31);
        const ux = (r() < 0.5 ? -1 : 1) * Math.pow(r(), 0.8);
        const h = top(ux);
        // 윗면 근처에 조각을 몰아 뭉게뭉게한 윤곽을 만들고, 아래는 듬성듬성 채움
        const t = Math.pow(r(), 0.45);
        const y = -1 + 2 * h * t;
        const z = (r() * 2 - 1) * (0.3 + 0.7 * h);
        // 바닥 조각은 작게 → 아래로 삐져나오지 않아 바닥이 평평해 보임
        const volume = (0.5 + 0.35 * h * (0.4 + 0.6 * t) + 0.15 * r()) * (1 - 0.25 * Math.abs(ux));
        return { point: new THREE.Vector3(ux, y, z), volume };
    };
}

function sea(seed) {
    const f = mulberry(seed);
    const a = [f() * 6, f() * 6, f() * 6];
    const surface = (x, z) => 0.5
        + 0.25 * Math.sin(x * 4.1 + a[0]) * Math.cos(z * 3.3 + a[1])
        + 0.15 * Math.sin(x * 9.7 + z * 7.1 + a[2])
        + 0.1 * Math.cos(x * 15 - z * 12);
    return (cloud, index) => {
        const r = mulberry(seed * 7919 + index * 31);
        const x = r() * 2 - 1;
        const z = r() * 2 - 1;
        const h = Math.min(1, Math.max(0, surface(x, z)));
        const y = -1 + 2 * h * (0.55 + 0.45 * r());
        return { point: new THREE.Vector3(x, y, z), volume: 0.7 + 0.3 * r() };
    };
}

function wisp(seed) {
    const f = mulberry(seed);
    const bend = f() * 0.6 - 0.3;
    return (cloud, index) => {
        const r = mulberry(seed * 7919 + index * 31);
        const x = r() * 2 - 1;
        const y = bend * x * x + (r() - 0.5) * 0.4;
        // 큰 조각을 옅게 겹쳐 점선이 아니라 하나의 부드러운 줄로 보이게
        return { point: new THREE.Vector3(x, y, (r() - 0.5) * 0.6), volume: 0.55 + 0.45 * (1 - Math.abs(x)) };
    };
}

const SHAPES = { cumulus, sea, wisp };

// 손으로 구성한 장면. position = 덩어리 중심, bounds = 반폭(가로, 높이, 깊이)
// 카메라는 z 34 → -22로 지나가며, 좌우 덩어리의 크기·거리·높이를 번갈아 리듬을 만든다.
const FORMATIONS = [
    // 발아래 운해: 전체 여정 아래에 깔림
    { shape: 'sea', seed: 3, position: [0, -6.4, 14], bounds: [42, 1.4, 26], density: 7, volume: 12 },
    { shape: 'sea', seed: 4, position: [0, -5.6, -46], bounds: [60, 1.8, 30], density: 6, volume: 15 },

    // 출발: 왼쪽에 크고 가까운 둑, 오른쪽은 낮게 → 가운데로 하늘이 열림
    { shape: 'cumulus', seed: 11, position: [-10, -2.2, 24], bounds: [8, 3.4, 4], volume: 4.2 },
    { shape: 'cumulus', seed: 12, position: [9, -3.4, 18], bounds: [6, 2, 3.5], volume: 3.2 },

    // 첫 통과: 오른쪽에 높게 솟은 구름, 왼쪽은 멀리 넓게
    { shape: 'cumulus', seed: 13, position: [11, -1.5, 5], bounds: [5.5, 5, 4], volume: 4 },
    { shape: 'cumulus', seed: 14, position: [-15, -2.5, 0], bounds: [10, 3.6, 5], volume: 4.8 },

    // 카메라 바로 아래를 스치는 낮은 덩어리 + 옆을 지나가는 작은 조각구름
    { shape: 'cumulus', seed: 15, position: [2.5, -4.2, -2], bounds: [6, 1.6, 4], volume: 3 },
    { shape: 'cumulus', seed: 16, position: [-5.5, 1.6, -9], bounds: [3.2, 1.2, 2], volume: 2.2, opacity: 0.8 },

    // 마지막 통과: 오른쪽 중간 크기
    { shape: 'cumulus', seed: 17, position: [8, -2, -13], bounds: [6.5, 2.8, 4], volume: 3.6 },

    // 도착 장면: 교회 자리(가운데)를 비워 두고 양옆 먼 곳에 큰 적운이 액자처럼
    { shape: 'cumulus', seed: 21, position: [-24, -1.5, -58], bounds: [10, 6.5, 5], volume: 6 },
    { shape: 'cumulus', seed: 22, position: [26, -2.5, -64], bounds: [11, 5.5, 5], volume: 6 },
    { shape: 'cumulus', seed: 23, position: [-9, -3.8, -40], bounds: [5, 1.6, 3], volume: 3 },
    // 교회 바로 앞의 낮은 구름 띠: 건물 아래쪽이 구름 속에 서 있도록 덮음
    { shape: 'sea', seed: 24, position: [0, -2.8, -45], bounds: [14, 0.8, 3], density: 3, volume: 4.5 },

    // 높은 하늘의 새털구름: 깊이감과 여백
    { shape: 'wisp', seed: 31, position: [-12, 10, -34], bounds: [16, 0.8, 3], volume: 6, opacity: 0.22 },
    { shape: 'wisp', seed: 32, position: [14, 12.5, -52], bounds: [18, 1, 3], volume: 7, opacity: 0.2 },
];

// 조각 수: 덩어리 크기에 비례 (모바일은 약 55%)
function segmentCount(f, isMobile) {
    const [bx, by, bz] = f.bounds;
    let n;
    if (f.shape === 'sea') n = Math.round((bx * bz) / (f.density * f.density) * 4.5);
    else if (f.shape === 'wisp') n = Math.round(bx * 1.6);
    else n = Math.round(bx * (1.6 + by * 0.35) + bz);
    return Math.max(6, Math.round(n * (isMobile ? 0.55 : 1)));
}

export function buildLayout(isMobile) {
    return FORMATIONS.map((f) => ({
        key: `${f.shape}-${f.seed}`,
        position: f.position,
        bounds: f.bounds,
        volume: f.shape === 'cumulus' ? Math.max(f.bounds[1] * 1.9, f.bounds[0] * 0.85) : f.volume, // 조각 크기 ≈ 덩어리 높이 → 조각끼리 크게 겹쳐 하나의 덩어리로 보임
        opacity: f.opacity ?? 1,
        segments: segmentCount(f, isMobile),
        distribute: SHAPES[f.shape](f.seed),
    }));
}

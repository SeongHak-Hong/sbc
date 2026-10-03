// 구름 스프라이트 텍스처 생성기 (Perlin fBm 노이즈)
// 실행: node prototypes/hero-clouds/tools/make-cloud-texture.mjs
// 결과: prototypes/hero-clouds/textures/cloud-noise.png (+ 하늘 배경 미리보기 cloud-noise-preview.png)
// 지금은 쓰지 않는 이전 텍스처. 사진풍 텍스처는 key-cloud-photo.mjs로 만든다.
//
// drei Clouds는 스프라이트를 회전시키므로, 아래가 평평하거나 한쪽만 그늘진 모양은 쓰지 않는다.
// 둥근 덩어리 + 뭉게뭉게한 가장자리 + 골짜기만 살짝 어두운 '회전해도 자연스러운' 형태로 만든다.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SIZE = 512;
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'textures');

// --- Perlin 2D ---
function makePerlin(seed) {
    let s = seed;
    const rand = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
    const p = Array.from({ length: 256 }, (_, i) => i);
    for (let i = 255; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [p[i], p[j]] = [p[j], p[i]];
    }
    const perm = new Uint8Array(512);
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
    const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
    const grad = (h, x, y) => {
        const g = h & 7;
        const u = g < 4 ? x : y;
        const v = g < 4 ? y : x;
        return ((g & 1) ? -u : u) + ((g & 2) ? -2 * v : 2 * v);
    };
    return (x, y) => {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        x -= Math.floor(x);
        y -= Math.floor(y);
        const u = fade(x);
        const v = fade(y);
        const a = perm[X] + Y;
        const b = perm[X + 1] + Y;
        const l1 = grad(perm[a], x, y) + u * (grad(perm[b], x - 1, y) - grad(perm[a], x, y));
        const l2 = grad(perm[a + 1], x, y - 1) + u * (grad(perm[b + 1], x - 1, y - 1) - grad(perm[a + 1], x, y - 1));
        return (l1 + v * (l2 - l1)) * 0.5; // 대략 -1..1
    };
}

const noiseA = makePerlin(17);
const noiseB = makePerlin(53);

// 일반 fBm (가장자리 흔들기용)
const fbm = (x, y, oct = 5) => {
    let sum = 0, amp = 0.5, f = 1;
    for (let i = 0; i < oct; i++) {
        sum += amp * noiseA(x * f, y * f);
        f *= 2.02;
        amp *= 0.5;
    }
    return sum;
};

// billow fBm: |noise|를 뒤집어 뭉게구름처럼 둥근 덩어리 무늬
const billow = (x, y, oct = 6) => {
    let sum = 0, amp = 0.5, f = 1, norm = 0;
    for (let i = 0; i < oct; i++) {
        sum += amp * (1 - Math.abs(noiseB(x * f, y * f)) * 1.6);
        norm += amp;
        f *= 2.07;
        amp *= 0.52;
    }
    return sum / norm;
};

const smooth = (a, b, t) => {
    const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
    return x * x * (3 - 2 * x);
};

// 뭉게구름 덩어리(lobe) 배치: 가운데 큰 덩어리 + 둘레의 작은 덩어리들
const LOBES = (() => {
    let s = 29;
    const rand = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
    const lobes = [{ x: 0, y: 0, r: 0.38 }];
    // 중간 덩어리: 가운데에 촘촘히 겹치게
    for (let n = 0; n < 9; n++) {
        const r = 0.2 + rand() * 0.12;
        const a = (n / 9) * Math.PI * 2 + rand() * 0.5;
        const d = 0.18 + rand() * 0.16;
        lobes.push({ x: Math.cos(a) * d, y: Math.sin(a) * d, r });
    }
    // 작은 덩어리: 윤곽을 꽃양배추처럼 울퉁불퉁하게
    for (let n = 0; n < 10; n++) {
        const r = 0.12 + rand() * 0.06;
        const a = (n / 10) * Math.PI * 2 + rand() * 0.3;
        const d = Math.min(0.42 + rand() * 0.12, 0.8 - r);
        lobes.push({ x: Math.cos(a) * d, y: Math.sin(a) * d, r });
    }
    return lobes;
})();

const rgba = Buffer.alloc(SIZE * SIZE * 4);
// 그늘색: 사이트 하늘색 계열의 옅은 블루그레이 (덩어리 사이 골짜기에만)
const SHADOW = [206, 220, 233];

for (let j = 0; j < SIZE; j++) {
    for (let i = 0; i < SIZE; i++) {
        const u = (i / (SIZE - 1)) * 2 - 1;
        const v = (j / (SIZE - 1)) * 2 - 1;

        // 가장자리를 살짝 흔들어 기계적인 원이 보이지 않게
        const wx = u + 0.08 * fbm(u * 4 + 3.1, v * 4 - 1.7);
        const wy = v + 0.08 * fbm(u * 4 - 5.3, v * 4 + 2.9);

        let density = 0;
        let dome = 0;
        for (const l of LOBES) {
            const d = Math.hypot(wx - l.x, wy - l.y) / l.r;
            density += 1 - smooth(0.35, 1.05, d);
            dome = Math.max(dome, Math.sqrt(Math.max(0, 1 - d * d)));
        }

        const detail = billow(wx * 3 + 10, wy * 3 + 10);
        density += 0.45 * (detail - 0.5);
        density *= 1 - smooth(0.85, 1.0, Math.hypot(u, v)); // 사각 경계 방지

        const alpha = smooth(0.22, 0.85, density) * 0.9; // 경계를 넓게 풀어 여러 장이 겹쳐도 거품처럼 보이지 않게

        // 덩어리 가운데는 밝고, 덩어리끼리 맞닿는 골짜기는 그늘
        const fine = billow(wx * 7 + 40, wy * 7 + 40, 4);
        const light = smooth(0.05, 0.85, 0.7 * dome + 0.3 * fine);

        const k = (j * SIZE + i) * 4;
        rgba[k] = Math.round(SHADOW[0] + (255 - SHADOW[0]) * light);
        rgba[k + 1] = Math.round(SHADOW[1] + (255 - SHADOW[1]) * light);
        rgba[k + 2] = Math.round(SHADOW[2] + (255 - SHADOW[2]) * light);
        rgba[k + 3] = Math.round(alpha * 255);
    }
}

mkdirSync(OUT_DIR, { recursive: true });
const raw = { raw: { width: SIZE, height: SIZE, channels: 4 } };
await sharp(rgba, raw).png({ compressionLevel: 9 }).toFile(join(OUT_DIR, 'cloud-noise.png'));

// 미리보기: 사이트 하늘색 위에 올려본 모습
const sky = Buffer.alloc(SIZE * SIZE * 4);
for (let j = 0; j < SIZE; j++) {
    const t = j / (SIZE - 1);
    const top = [207, 230, 245];
    const bottom = [252, 235, 224];
    for (let i = 0; i < SIZE; i++) {
        const k = (j * SIZE + i) * 4;
        for (let c = 0; c < 3; c++) sky[k + c] = Math.round(top[c] + (bottom[c] - top[c]) * t);
        sky[k + 3] = 255;
    }
}
await sharp(sky, raw)
    .composite([{ input: await sharp(rgba, raw).png().toBuffer() }])
    .png()
    .toFile(join(OUT_DIR, 'cloud-noise-preview.png'));

console.log('saved', join(OUT_DIR, 'cloud-noise.png'));

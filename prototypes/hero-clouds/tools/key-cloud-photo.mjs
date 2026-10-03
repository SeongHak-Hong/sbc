// 검정 배경 구름 사진 → 투명 배경 구름 스프라이트 텍스처
// 실행: node prototypes/hero-clouds/tools/key-cloud-photo.mjs prototypes/hero-clouds/textures/source/cloud-puffy-1.jpg
// 기본 출력: prototypes/hero-clouds/textures/cloud.png (+ 하늘 배경 미리보기 cloud-preview.png)
//
// 원본은 Higgsfield(GPT Image 2.5, quality high, 1024px)로 검정 배경에 생성한 사진풍 구름이다 (textures/source/).
//   - cloud-puffy-*: 큰 봉우리 몇 개 + 오른쪽 위에서 오는 부드러운 빛. 지금 쓰는 원본
//   - cloud-photo-*: 1차 생성. 잔 봉우리가 많고 고르게 밝은 공 모양이라 겹치면 팝콘·주먹밥처럼 보여 쓰지 않음
//
// drei 기본 텍스처와 같은 구조로 만든다 (채널을 나눠 보면 이렇게 되어 있다).
//   - 투명도: 구름 사진의 밝기 그대로. 봉우리·골짜기 같은 모든 디테일은 투명도에만 담는다
//   - 색: 거의 흰색에 아주 큰 명암만 (빛 받는 쪽은 희고 반대쪽은 옅은 회색). 디테일 없음
// 색에 골짜기 명암을 넣으면 장면에서 조각마다 회색 줄·테두리가 보인다.
// 배경 제거 도구는 구름 윤곽을 칼로 자른 듯 딱딱하게 만들어서 이 방식을 쓴다.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const TEX_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'textures');

export const DEFAULTS = {
    // 출력 크기(px)
    size: 512,
    // 원본에서 가운데를 남길 비율 (1 = 전체)
    crop: 1,
    // 노이즈 제거(미디언 필터 크기, px)와 검정 기준 여유. 배경 노이즈가 점으로 남지 않게
    denoise: 5,
    blackMargin: 0.04,
    // 투명도: 밝기가 opaqueAt을 넘으면 불투명. 낮출수록 진하고 윤곽이 또렷해진다 (drei는 완전 불투명이 8%뿐)
    opaqueAt: 1,
    // 투명도를 살짝 흐리는 반경(1024px 기준)과 원래 밝기를 섞는 비율 (1 = 흐리지 않음)
    alphaBlur: 0,
    alphaDetail: 1,
    // 가장 진한 곳도 살짝 비치게
    maxAlpha: 0.95,
    // 사각 경계 방지: 이 구간(반지름 비율)에서 바깥을 투명하게
    fadeStart: 0.8,
    fadeEnd: 1,
    // 겉 테두리 녹이기: 반경(1024px 기준, 0 = 끔)과, 그 반경으로 흐린 밝기가 meltFrom~meltTo 사이에서 투명→원래 투명도
    meltRadius: 0,
    meltFrom: 0.1,
    meltTo: 0.55,
    // 색: 큰 명암을 볼 반경(1024px 기준)과 밝기 범위. drei 텍스처의 색은 0.92~0.95 안팎이다
    lightBlur: 80,
    shadeMin: 0.88,
    shadeMax: 0.97,
};

const smooth = (a, b, t) => {
    const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
    return x * x * (3 - 2 * x);
};

// 가우시안 근사 (상자 흐림 3회). 실수 배열 그대로 흐려 8비트 계단이 생기지 않게
function blurMap(src, W, H, radius) {
    const r = Math.max(1, Math.round(radius));
    let a = Float32Array.from(src);
    let b = new Float32Array(W * H);
    const pass = (from, to, len, count, stride, step) => {
        for (let line = 0; line < count; line++) {
            const base = line * stride;
            let sum = 0;
            for (let i = -r; i <= r; i++) sum += from[base + Math.min(len - 1, Math.max(0, i)) * step];
            for (let i = 0; i < len; i++) {
                to[base + i * step] = sum / (2 * r + 1);
                sum += from[base + Math.min(len - 1, i + r + 1) * step] - from[base + Math.max(0, i - r) * step];
            }
        }
    };
    for (let n = 0; n < 3; n++) {
        pass(a, b, W, H, W, 1); // 가로
        pass(b, a, H, W, 1, W); // 세로
    }
    return a;
}

export async function keyCloud(input, options = {}) {
    const {
        size, crop, denoise, blackMargin, opaqueAt, alphaBlur, alphaDetail, maxAlpha,
        fadeStart, fadeEnd, meltRadius, meltFrom, meltTo, lightBlur, shadeMin, shadeMax,
    } = { ...DEFAULTS, ...options };

    const meta = await sharp(input).metadata();
    const side = Math.round(Math.min(meta.width, meta.height) * crop);
    const region = { left: Math.round((meta.width - side) / 2), top: Math.round((meta.height - side) / 2), width: side, height: side };
    // 생성 이미지의 미세한 노이즈를 먼저 걷어냄. 그대로 두면 장면에서 흰 점·얼룩으로 보인다
    const { data, info } = await sharp(input).removeAlpha().extract(region).median(denoise).raw().toBuffer({ resolveWithObject: true });
    const { width: W, height: H } = info;
    const scale = W / 1024;

    const raw = new Float32Array(W * H);
    for (let p = 0; p < W * H; p++) {
        const k = p * 3;
        raw[p] = (0.2126 * data[k] + 0.7152 * data[k + 1] + 0.0722 * data[k + 2]) / 255;
    }
    // 검정 기준: 테두리 픽셀의 98% 지점 밝기 (생성 이미지의 배경은 완전한 0이 아니다). 가장 밝은 곳: 상위 0.5%
    const border = [];
    for (let i = 0; i < W; i++) border.push(raw[i], raw[(H - 1) * W + i]);
    for (let j = 0; j < H; j++) border.push(raw[j * W], raw[j * W + W - 1]);
    border.sort((x, y) => x - y);
    const black = border[Math.floor(border.length * 0.98)] + blackMargin;
    const white = Float32Array.from(raw).sort()[Math.floor(W * H * 0.995)];
    const L = raw.map((v) => Math.min(1, Math.max(0, (v - black) / (white - black))));

    // 투명도: 사진 밝기 그대로 (+ 선택: 살짝 흐리기, 겉 테두리 녹이기, 사각 경계 방지)
    const Lsoft = alphaDetail < 1 ? blurMap(L, W, H, alphaBlur * scale) : L;
    const Lmelt = meltRadius > 0 ? blurMap(L, W, H, meltRadius * scale) : null;
    const alpha = new Float32Array(W * H);
    for (let j = 0; j < H; j++) {
        for (let i = 0; i < W; i++) {
            const p = j * W + i;
            const r = Math.hypot((i / (W - 1)) * 2 - 1, (j / (H - 1)) * 2 - 1);
            const melt = Lmelt ? smooth(meltFrom, meltTo, Lmelt[p]) : 1;
            alpha[p] = smooth(0, opaqueAt, alphaDetail * L[p] + (1 - alphaDetail) * Lsoft[p])
                * melt * maxAlpha * (1 - smooth(fadeStart, fadeEnd, r));
        }
    }

    // 색: 구름 안쪽 밝기를 아주 크게 흐린 값 (투명도로 가중 평균해 구름 밖 검정이 섞이지 않게)
    const light = blurMap(L.map((v, p) => v * alpha[p]), W, H, lightBlur * scale);
    const weight = blurMap(alpha, W, H, lightBlur * scale);
    const field = light.map((v, p) => (weight[p] > 1e-4 ? v / weight[p] : 1));
    // 이미지마다 노출이 달라도 같은 범위로: 구름 안쪽 큰 명암의 5%·95% 지점을 [shadeMin, shadeMax]로
    const inner = [];
    for (let p = 0; p < W * H; p++) if (alpha[p] > 0.3) inner.push(field[p]);
    inner.sort((x, y) => x - y);
    const lo = inner[Math.floor(inner.length * 0.05)];
    const hi = inner[Math.floor(inner.length * 0.95)];

    const rgb = Buffer.alloc(W * H * 3);
    const a8 = Buffer.alloc(W * H);
    for (let p = 0; p < W * H; p++) {
        const bright = shadeMin + (shadeMax - shadeMin) * smooth(lo, hi, field[p]);
        rgb.fill(Math.round(255 * bright), p * 3, p * 3 + 3);
        a8[p] = Math.round(alpha[p] * 255);
    }

    // 색과 투명도를 따로 줄인다. RGBA로 한 번에 줄이면 완전 투명한 곳의 색이 검정이 되고,
    // three.js가 텍스처를 보간할 때 그 검정이 섞여 가장자리가 어둡게 번진다
    const resize = (buf, channels) => {
        let img = sharp(buf, { raw: { width: W, height: H, channels } }).resize(size, size, { kernel: 'lanczos3' });
        if (channels === 1) img = img.extractChannel(0); // sharp는 1채널 입력도 3채널로 내보내므로 되돌림
        return img.raw().toBuffer();
    };
    const [rgbSmall, aSmall] = await Promise.all([resize(rgb, 3), resize(a8, 1)]);
    return sharp(rgbSmall, { raw: { width: size, height: size, channels: 3 } })
        .joinChannel(aSmall, { raw: { width: size, height: size, channels: 1 } })
        .png({ compressionLevel: 9 })
        .toBuffer();
}

// 미리보기: 사이트 하늘색 위에 올려본 모습
export async function previewOnSky(texture, size = 512) {
    const sky = Buffer.alloc(size * size * 3);
    const top = [207, 230, 245];
    const bottom = [252, 235, 224];
    for (let j = 0; j < size; j++) {
        const t = j / (size - 1);
        for (let i = 0; i < size; i++) {
            const k = (j * size + i) * 3;
            for (let c = 0; c < 3; c++) sky[k + c] = Math.round(top[c] + (bottom[c] - top[c]) * t);
        }
    }
    return sharp(sky, { raw: { width: size, height: size, channels: 3 } })
        .composite([{ input: await sharp(texture).resize(size, size).toBuffer() }])
        .png()
        .toBuffer();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const [input, output = join(TEX_DIR, 'cloud.png')] = process.argv.slice(2);
    if (!input) {
        console.error('사용법: node key-cloud-photo.mjs <입력 이미지> [출력.png]');
        process.exit(1);
    }
    const texture = await keyCloud(input);
    mkdirSync(dirname(output), { recursive: true });
    await sharp(texture).toFile(output);
    await sharp(await previewOnSky(texture)).toFile(join(dirname(output), 'cloud-preview.png'));
    console.log('saved', output);
}

// 교회 이미지 → 장면용 텍스처 (textures/church.png)
// 실행: node prototypes/hero-clouds/tools/prep-church.mjs
//
// 원본 textures/source/church-3.png는 Higgsfield(GPT Image 2.5, 투명 배경)로 실제 교회 사진을 참고해 다시 그린 것이다.
// 맑은 날 사진처럼 진하고 또렷해서, 연한 하늘·구름 장면에 그대로 두면 혼자 떠 보인다.
//   - 아래쪽: 정문 높이부터 구불구불한 경계로 녹인다 (수평으로 지우면 장면에서 가로 일자 경계가 보인다)
//   - 색: 채도를 낮추고 대기 안개색을 덮는다. 멀리 있는 물체처럼, 구름에 가까운 아래쪽일수록 더 옅게
//   - 빛: 오른쪽 위에서 오는 따뜻한 빛 (장면의 directional light와 같은 방향). 해나 빛나는 원은 넣지 않는다
//   - 투명한 곳의 색은 안개색으로 채운다 (검정이면 텍스처 보간 때 윤곽에 어두운 테두리가 생긴다)
import sharp from 'sharp';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const TEX_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'textures');
const SRC = join(TEX_DIR, 'source', 'church-3.png');
const OUT = join(TEX_DIR, 'church.png');

const HAZE = [232, 241, 248]; // 장면 안개(#EEF5FA)보다 살짝 푸른 대기색
const SATURATION = 0.8;
const HAZE_TOP = 0.12; // 꼭대기 안개 덮임
const HAZE_BOTTOM = 0.38; // 아래쪽 안개 덮임
const LIGHT = 0.12; // 빛 받는 쪽 밝기 올림 (screen). 장면에서는 셰이더 빛(HeroClouds.jsx Church)이 주로 맡는다
const WARM = [1, 0.96, 0.9]; // 빛 색 (따뜻한 흰색)
const FADE_Y = 790; // 정문 위 높이(원본 1024px 기준)에서 녹기 시작
const FADE_LEN = 170;
const CROP = { left: 170, top: 50, width: 854, height: 910 };

const smooth = (a, b, t) => {
    const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
    return x * x * (3 - 2 * x);
};

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width;
const H = info.height;

for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
        const o = (y * W + x) * 4;

        // 아래쪽 녹이기: 경계 높이를 좌우로 물결치게
        const edge = FADE_Y + 22 * Math.sin(x * 0.013 + 1) + 12 * Math.sin(x * 0.031 + 2) + 7 * Math.sin(x * 0.071);
        let a = data[o + 3] * (1 - smooth(edge, edge + FADE_LEN, y));
        // 원본의 타원형 구름 받침 중 건물 밖 좌우 부분 제거
        if (y > 760) a *= smooth(180, 240, x) * (1 - smooth(960, 1015, x));
        data[o + 3] = Math.round(a);

        if (a < 1) {
            for (let c = 0; c < 3; c++) data[o + c] = HAZE[c];
            continue;
        }

        let rgb = [data[o], data[o + 1], data[o + 2]].map((v) => v / 255);
        // 채도 낮추기
        const lum = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
        rgb = rgb.map((v) => lum + (v - lum) * SATURATION);
        // 오른쪽 위에서 오는 빛
        const u = (x / (W - 1)) * 2 - 1;
        const v = (y / (H - 1)) * 2 - 1;
        const lit = smooth(-0.3, 1, u * 0.55 - v * 0.85);
        rgb = rgb.map((c, i) => 1 - (1 - c) * (1 - LIGHT * lit * WARM[i]));
        // 대기 안개: 아래로 갈수록 짙게
        const haze = HAZE_TOP + (HAZE_BOTTOM - HAZE_TOP) * smooth(0.25, 0.85, y / H);
        rgb = rgb.map((c, i) => c * (1 - haze) + (HAZE[i] / 255) * haze);

        for (let c = 0; c < 3; c++) data[o + c] = Math.round(Math.min(1, rgb[c]) * 255);
    }
}

await sharp(data, { raw: { width: W, height: H, channels: 4 } })
    .extract(CROP)
    .png({ compressionLevel: 9 })
    .toFile(OUT);
console.log('saved', OUT);

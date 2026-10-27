import imageCompression from 'browser-image-compression';
import { auth } from '../firebase';

// 갤러리 사진은 Cloudflare R2 에 저장한다. 올리기·지우기는 functions/api/gallery 가 관리자 확인 후 처리한다.
// 원본은 올리지 않고 브라우저에서 크게 보기용(full)·목록용(thumb) 두 벌로 줄여서 보낸다.
const SIZES = {
    full: { maxWidthOrHeight: 1600, maxSizeMB: 1, initialQuality: 0.8 },
    thumb: { maxWidthOrHeight: 480, maxSizeMB: 0.15, initialQuality: 0.75 },
};

export const galleryImageUrl = (key) => `${import.meta.env.VITE_GALLERY_BASE_URL}/${key}`;

// 갤러리 분류 (나눔터 > 갤러리의 고르기 순서). 앨범 문서의 dept 값
export const GALLERY_CATEGORIES = [
    { id: 'church', label: '교회 행사' },
    { id: 'kindergarten', label: '유치부' },
    { id: 'elementary', label: '초등부' },
    { id: 'youth', label: '중고등부' },
    { id: 'youngadults', label: '청년부' },
];

// 다음세대 갤러리 시절 '다음세대 전체'(all)로 저장한 앨범도 이름이 나오게 둔다
export const galleryCategoryLabel = (id) =>
    GALLERY_CATEGORIES.find((category) => category.id === id)?.label ?? (id === 'all' ? '다음세대' : id);

// 2026-07-24 + 2026-07-26 → '2026.07.24 - 2026.07.26', 끝나는 날이 없으면 하루만
export const galleryPeriod = ({ date, endDate }) => {
    const dot = (value) => value.replaceAll('-', '.');
    return endDate && endDate !== date ? `${dot(date)} - ${dot(endDate)}` : dot(date);
};

// 올리기 전에 고르는 사진 비율 (관리자 사진 자르기 창). null 은 원본 그대로
export const CROP_RATIOS = [
    { id: 'landscape', label: '가로 4:3', aspect: 4 / 3 },
    { id: 'portrait', label: '세로 3:4', aspect: 3 / 4 },
    { id: 'square', label: '정사각형', aspect: 1 },
    { id: 'original', label: '원본', aspect: null },
];

// 사진 모양에 가까운 비율을 처음 값으로 쓴다
export const closestRatio = (width, height) => {
    const shape = width / height;
    if (shape > 1.15) return 'landscape';
    if (shape < 0.87) return 'portrait';
    return 'square';
};

// 고른 범위(area, 원본 픽셀 기준)를 잘라 새 파일로. 범위가 없으면 가운데를 비율대로 자른다.
// 이어서 uploadGalleryPhoto 가 다시 줄이므로, 여기서는 긴 쪽 2400px 까지만 남긴다
const unreadable = (file) =>
    new Error(/hei[cf]/i.test(file.type || file.name) ? 'HEIC 형식은 JPG로 바꿔서 올려 주세요' : '사진 파일을 읽지 못했습니다');

export const cropPhoto = async (file, aspect, area) => {
    let bitmap;
    try {
        bitmap = await createImageBitmap(file);
    } catch {
        throw unreadable(file);
    }
    let crop = area;
    if (!crop) {
        const width = Math.min(bitmap.width, bitmap.height * aspect);
        const height = width / aspect;
        crop = { x: (bitmap.width - width) / 2, y: (bitmap.height - height) / 2, width, height };
    }
    const scale = Math.min(1, 2400 / Math.max(crop.width, crop.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(crop.width * scale);
    canvas.height = Math.round(crop.height * scale);
    canvas.getContext('2d').drawImage(bitmap, crop.x, crop.y, crop.width, crop.height, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.95));
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
};

// WebP 로 저장하지 못하는 브라우저(구형 Safari 등)는 JPEG 로 보낸다
let outputType;
const getOutputType = () => {
    if (!outputType) {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 1;
        outputType = canvas.toDataURL('image/webp').startsWith('data:image/webp') ? 'image/webp' : 'image/jpeg';
    }
    return outputType;
};

const readImageSize = async (blob) => {
    const bitmap = await createImageBitmap(blob);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
};

const callApi = async (path, body) => {
    const token = await auth?.currentUser?.getIdToken();
    if (!token) throw new Error('로그인이 필요합니다.');

    const isForm = body instanceof FormData;
    const response = await fetch(`/api/gallery/${path}`, {
        method: 'POST',
        headers: isForm
            ? { Authorization: `Bearer ${token}` }
            : { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: isForm ? body : JSON.stringify(body),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || `서버 오류가 났습니다. (${response.status})`);
    return result;
};

const shrink = async (file) => {
    const fileType = getOutputType();
    try {
        return await Promise.all(
            [SIZES.full, SIZES.thumb].map((options) => imageCompression(file, { ...options, fileType, useWebWorker: true }))
        );
    } catch (error) {
        console.error('사진 줄이기 실패:', error);
        // 아이폰 HEIC 사진은 Safari 가 아니면 브라우저가 읽지 못한다
        throw unreadable(file);
    }
};

// 사진 한 장을 줄여서 올린다. 반환값 { id, full, thumb, width, height } 을 Firestore 에 그대로 저장하면 된다.
export const uploadGalleryPhoto = async (file) => {
    const [full, thumb] = await shrink(file);

    const form = new FormData();
    form.append('full', full, 'full');
    form.append('thumb', thumb, 'thumb');

    const [keys, size] = await Promise.all([callApi('upload', form), readImageSize(full)]);
    return { id: keys.id, full: keys.full, thumb: keys.thumb, ...size };
};

// 갤러리 밖 관리자 화면(글 본문·공지·주보·일정·사업체·다음세대 행사)의 사진 한 장.
// 예전 Cloudinary 때와 같은 크기(긴 쪽 1920px)로 줄여 R2 images/ 에 올리고, Firestore 에 넣을 전체 주소를 돌려준다
export const uploadSiteImage = async (file) => {
    let image;
    try {
        image = await imageCompression(file, {
            maxWidthOrHeight: 1920,
            maxSizeMB: 2,
            initialQuality: 0.85,
            fileType: getOutputType(),
            useWebWorker: true,
        });
    } catch (error) {
        console.error('사진 줄이기 실패:', error);
        throw unreadable(file);
    }

    const form = new FormData();
    form.append('file', image, 'image');
    const { key } = await callApi('image', form);
    return galleryImageUrl(key);
};

// 앨범이나 사진을 지울 때 R2 파일도 같이 지운다 (한 번에 파일 1000개까지라 500장씩 나눠 보낸다)
export const deleteGalleryPhotos = async (photos) => {
    for (let i = 0; i < photos.length; i += 500) {
        await callApi('delete', { keys: photos.slice(i, i + 500).flatMap((photo) => [photo.full, photo.thumb]) });
    }
};

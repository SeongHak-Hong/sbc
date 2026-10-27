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
        throw new Error(/hei[cf]/i.test(file.type || file.name) ? 'HEIC 형식은 JPG로 바꿔서 올려 주세요' : '사진 파일을 읽지 못했습니다');
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

// 앨범이나 사진을 지울 때 R2 파일도 같이 지운다 (한 번에 파일 1000개까지라 500장씩 나눠 보낸다)
export const deleteGalleryPhotos = async (photos) => {
    for (let i = 0; i < photos.length; i += 500) {
        await callApi('delete', { keys: photos.slice(i, i + 500).flatMap((photo) => [photo.full, photo.thumb]) });
    }
};

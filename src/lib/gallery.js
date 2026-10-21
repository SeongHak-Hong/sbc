import imageCompression from 'browser-image-compression';
import { auth } from '../firebase';

// 갤러리 사진은 Cloudflare R2 에 저장한다. 올리기·지우기는 functions/api/gallery 가 관리자 확인 후 처리한다.
// 원본은 올리지 않고 브라우저에서 크게 보기용(full)·목록용(thumb) 두 벌로 줄여서 보낸다.
const SIZES = {
    full: { maxWidthOrHeight: 1600, maxSizeMB: 1, initialQuality: 0.8 },
    thumb: { maxWidthOrHeight: 480, maxSizeMB: 0.15, initialQuality: 0.75 },
};

export const galleryImageUrl = (key) => `${import.meta.env.VITE_GALLERY_BASE_URL}/${key}`;

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

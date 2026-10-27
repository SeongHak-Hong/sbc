import React, { useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { uploadSiteImage } from '../../lib/gallery';

// 임시 화면: 예전 Cloudinary 사진을 R2 로 옮기고 Firestore 의 주소를 바꾼다. 옮기기가 끝나면 이 파일과 메뉴·경로를 지운다.
// 1) 백업 JSON 내려받기 → 2) 바꿀 목록 보기 → 3) 옮기기
const COLLECTIONS = ['posts', 'membersNews', 'memberBusiness', 'schedules', 'nextgen', 'missions', 'cellgroups', 'monthly', 'adminFeedbacks'];

// 같은 사진이 f_auto,q_auto 처럼 변환값만 다르게 여러 번 쓰여서, 변환값을 뺀 원본 주소로 묶는다
const CLOUDINARY_URL = /https:\/\/res\.cloudinary\.com\/[^/\s"'<>)]+\/image\/upload\/[^\s"'<>)]+/g;
const originalUrl = (url) => url.replace(/\/upload\/(?:[a-z]{1,3}_[^/]*\/)+/, '/upload/');

const isPlainObject = (value) => value && Object.getPrototypeOf(value) === Object.prototype;

// 문서 안의 모든 글자에서 Cloudinary 주소를 찾는다 (대표 사진 목록·본문 HTML 모두). Timestamp 같은 값은 그대로 둔다
const collectUrls = (value, found) => {
    if (typeof value === 'string') value.match(CLOUDINARY_URL)?.forEach((url) => found.add(url));
    else if (Array.isArray(value)) value.forEach((item) => collectUrls(item, found));
    else if (isPlainObject(value)) Object.values(value).forEach((item) => collectUrls(item, found));
};

const replaceUrls = (value, moved) => {
    if (typeof value === 'string') return value.replace(CLOUDINARY_URL, (url) => moved.get(originalUrl(url)) ?? url);
    if (Array.isArray(value)) return value.map((item) => replaceUrls(item, moved));
    if (isPlainObject(value)) return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replaceUrls(item, moved)]));
    return value;
};

const download = (name, data) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' }));
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
};

const box = { border: '1px solid #E2E8F0', borderRadius: '8px', padding: '20px', backgroundColor: '#fff', marginBottom: '20px' };
const button = { padding: '10px 20px', borderRadius: '4px', border: 'none', backgroundColor: '#3B82F6', color: '#fff', cursor: 'pointer', fontSize: '15px' };

const AdminImageMove = () => {
    const [docs, setDocs] = useState(null); // [{ col, id, data, urls: [원본 주소] }]
    const [errors, setErrors] = useState([]);
    const [status, setStatus] = useState('');
    const [result, setResult] = useState(null); // { moved: Map, failed: [{ url, message }], updated }
    const [working, setWorking] = useState(false);

    const scan = async () => {
        setWorking(true);
        setStatus('글을 읽는 중...');
        const backup = {};
        const found = [];
        const readErrors = [];
        for (const col of COLLECTIONS) {
            try {
                const snap = await getDocs(collection(db, col));
                backup[col] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                snap.docs.forEach((d) => {
                    const urls = new Set();
                    collectUrls(d.data(), urls);
                    if (urls.size) found.push({ col, id: d.id, data: d.data(), urls: [...new Set([...urls].map(originalUrl))] });
                });
            } catch (error) {
                readErrors.push(`${col}: ${error.code || error.message}`);
            }
        }
        download(`firestore-backup-${new Date().toISOString().slice(0, 19).replace(/:/g, '')}.json`, backup);
        setDocs(found);
        setErrors(readErrors);
        setStatus('백업 파일을 내려받았습니다. 아래 목록을 확인해 주세요.');
        setWorking(false);
    };

    const unique = docs ? [...new Set(docs.flatMap((d) => d.urls))] : [];

    const move = async () => {
        if (!window.confirm(`사진 ${unique.length}장을 R2 로 옮기고 글 ${docs.length}개의 주소를 바꿉니다. 진행할까요?`)) return;
        setWorking(true);
        const moved = new Map();
        const failed = [];
        for (let i = 0; i < unique.length; i++) {
            const url = unique[i];
            setStatus(`사진 옮기는 중 (${i + 1}/${unique.length})...`);
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`내려받기 실패 (${response.status})`);
                const blob = await response.blob();
                moved.set(url, await uploadSiteImage(new File([blob], url.split('/').pop(), { type: blob.type })));
            } catch (error) {
                failed.push({ url, message: error.message });
            }
        }

        // 바뀐 칸만 덮어쓴다 (조회수·작성일 같은 다른 칸은 건드리지 않음)
        let updated = 0;
        for (let i = 0; i < docs.length; i++) {
            const { col, id, data } = docs[i];
            setStatus(`글 주소 바꾸는 중 (${i + 1}/${docs.length})...`);
            const changes = {};
            Object.entries(data).forEach(([key, value]) => {
                const next = replaceUrls(value, moved);
                if (JSON.stringify(next) !== JSON.stringify(value)) changes[key] = next;
            });
            if (!Object.keys(changes).length) continue;
            try {
                await updateDoc(doc(db, col, id), changes);
                updated++;
            } catch (error) {
                failed.push({ url: `${col}/${id}`, message: `글 저장 실패: ${error.message}` });
            }
        }

        download('cloudinary-r2-map.json', Object.fromEntries(moved));
        setResult({ moved, failed, updated });
        setStatus('끝났습니다.');
        setWorking(false);
    };

    return (
        <div>
            <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Cloudinary 사진 옮기기 (임시)</h2>
            <p style={{ color: '#64748B', marginBottom: '24px' }}>
                예전 관리자 화면에서 Cloudinary 에 올린 사진을 R2 로 복사하고, 글 속 주소를 새 주소로 바꿉니다. Cloudinary 의 파일은 지우지 않습니다.
            </p>

            <div style={box}>
                <h3 style={{ margin: '0 0 12px', fontSize: '18px' }}>1. 백업하고 목록 보기</h3>
                <p style={{ margin: '0 0 16px', color: '#475569' }}>글을 읽기만 합니다. 누르면 백업 JSON 파일이 내려받아집니다.</p>
                <button type="button" style={button} disabled={working} onClick={scan}>백업 받고 목록 보기</button>
            </div>

            {status && <p style={{ fontWeight: 500, marginBottom: '20px' }} aria-live="polite">{status}</p>}
            {errors.length > 0 && (
                <p style={{ color: '#B91C1C', marginBottom: '20px' }}>읽지 못한 컬렉션: {errors.join(', ')}</p>
            )}

            {docs && !result && (
                <div style={box}>
                    <h3 style={{ margin: '0 0 12px', fontSize: '18px' }}>2. 옮길 사진 {unique.length}장 · 글 {docs.length}개</h3>
                    <div style={{ maxHeight: '360px', overflowY: 'auto', fontSize: '13px', marginBottom: '16px' }}>
                        {docs.map((d) => (
                            <div key={`${d.col}/${d.id}`} style={{ padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                                <strong>{d.col}</strong> · {d.data.title || d.id} — {d.urls.length}장
                            </div>
                        ))}
                    </div>
                    <button type="button" style={button} disabled={working || !unique.length} onClick={move}>
                        3. 사진 {unique.length}장 옮기기
                    </button>
                </div>
            )}

            {result && (
                <div style={box}>
                    <h3 style={{ margin: '0 0 12px', fontSize: '18px' }}>결과</h3>
                    <p style={{ margin: '0 0 8px' }}>옮긴 사진 {result.moved.size}장 · 주소를 바꾼 글 {result.updated}개 · 실패 {result.failed.length}건</p>
                    <p style={{ margin: '0 0 8px', color: '#475569' }}>예전 주소 → 새 주소 표(cloudinary-r2-map.json)도 내려받았습니다.</p>
                    {result.failed.map((f) => (
                        <p key={f.url} style={{ margin: '4px 0', fontSize: '13px', color: '#B91C1C', wordBreak: 'break-all' }}>{f.url} — {f.message}</p>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminImageMove;

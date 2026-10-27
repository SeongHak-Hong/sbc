import React, { useState, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { CROP_RATIOS, closestRatio } from '../../lib/gallery';

// 갤러리에 올리기 전에 사진을 한 장씩 비율(가로·세로·정사각형·원본)에 맞춰 자르는 창.
// 끝나면 onDone([{ file, aspect, area }]) — aspect 가 null 이면 원본 그대로, area 는 원본 픽셀 기준 자를 범위
const buttonStyle = { padding: '10px 18px', borderRadius: '4px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#D1D5DB', backgroundColor: '#fff', color: '#374151', cursor: 'pointer', fontSize: '14px' };
const primaryStyle = { ...buttonStyle, backgroundColor: '#10B981', borderColor: '#10B981', color: '#fff' };

const PhotoCropDialog = ({ files, onDone, onCancel }) => {
    const [index, setIndex] = useState(0);
    // 사진마다 { url, ratio, crop, zoom, area, failed }
    const [items, setItems] = useState(() => files.map((file) => ({
        file,
        url: URL.createObjectURL(file),
        ratio: null,
        crop: { x: 0, y: 0 },
        zoom: 1,
        area: null,
        failed: false,
    })));

    useEffect(() => () => items.forEach((item) => URL.revokeObjectURL(item.url)), [items.length]); // eslint-disable-line react-hooks/exhaustive-deps

    const item = items[index];
    const ratio = CROP_RATIOS.find((r) => r.id === item.ratio);
    const isLast = index === items.length - 1;

    const update = (changes, at = index) => {
        setItems((prev) => prev.map((it, i) => (i === at ? { ...it, ...changes } : it)));
    };

    // 처음 열 때 사진 모양에 가까운 비율로 맞춰 둔다
    const onLoad = (width, height) => {
        if (!item.ratio) update({ ratio: closestRatio(width, height) });
    };

    const result = (list) => list.map((it) => {
        const picked = CROP_RATIOS.find((r) => r.id === it.ratio);
        return { file: it.file, aspect: it.failed ? null : picked?.aspect ?? null, area: it.area };
    });

    // 남은 사진은 지금 고른 비율로 가운데를 잘라 한꺼번에 올린다
    const applyToRest = () => {
        onDone(result(items.map((it, i) => (i > index ? { ...it, ratio: item.ratio, area: null } : it))));
    };

    return (
        <div role="dialog" aria-modal="true" aria-labelledby="crop-title" data-lenis-prevent style={{ position: 'fixed', inset: 0, zIndex: 3000, backgroundColor: 'rgba(17, 24, 39, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div style={{ width: 'min(880px, 100%)', maxHeight: '100%', overflowY: 'auto', backgroundColor: '#fff', borderRadius: '8px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
                    <h3 id="crop-title" style={{ margin: 0, fontSize: '18px', color: '#1E40AF' }}>사진 자르기</h3>
                    <span style={{ fontSize: '14px', color: '#6B7280' }}>{index + 1} / {items.length}장 · {item.file.name}</span>
                </div>

                <div role="group" aria-label="비율 고르기" style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    {CROP_RATIOS.map((r) => (
                        <button
                            key={r.id}
                            type="button"
                            aria-pressed={item.ratio === r.id}
                            disabled={item.failed}
                            onClick={() => update({ ratio: r.id, crop: { x: 0, y: 0 }, zoom: 1, area: null })}
                            style={{ ...buttonStyle, ...(item.ratio === r.id ? { backgroundColor: '#1E40AF', borderColor: '#1E40AF', color: '#fff' } : {}) }}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>

                <div style={{ position: 'relative', height: '440px', backgroundColor: '#111827', borderRadius: '4px', overflow: 'hidden' }}>
                    {item.failed ? (
                        <p style={{ color: '#F9FAFB', textAlign: 'center', marginTop: '200px', padding: '0 24px' }}>
                            이 사진은 미리 볼 수 없습니다. (아이폰 HEIC 사진이면 JPG로 바꿔서 올려 주세요)
                        </p>
                    ) : ratio?.aspect ? (
                        <Cropper
                            key={`${index}-${item.ratio}`}
                            image={item.url}
                            crop={item.crop}
                            zoom={item.zoom}
                            aspect={ratio.aspect}
                            onCropChange={(crop) => update({ crop })}
                            onZoomChange={(zoom) => update({ zoom })}
                            onCropComplete={(_, area) => update({ area })}
                            onMediaLoaded={(media) => onLoad(media.naturalWidth, media.naturalHeight)}
                        />
                    ) : (
                        <img
                            key={index}
                            src={item.url}
                            alt=""
                            onLoad={(e) => onLoad(e.currentTarget.naturalWidth, e.currentTarget.naturalHeight)}
                            onError={() => update({ failed: true })}
                            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                        />
                    )}
                </div>

                {ratio?.aspect && !item.failed && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px', fontSize: '14px', color: '#475569' }}>
                        확대
                        <input
                            type="range"
                            min={1}
                            max={3}
                            step={0.01}
                            value={item.zoom}
                            onChange={(e) => update({ zoom: Number(e.target.value) })}
                            style={{ flex: 1 }}
                        />
                    </label>
                )}
                <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#6B7280' }}>
                    사진을 끌어서 남길 부분을 맞추고, 휠이나 막대로 확대할 수 있습니다.
                </p>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between', flexWrap: 'wrap', borderTop: '1px solid #E5E7EB', paddingTop: '16px', marginTop: '16px' }}>
                    <button type="button" onClick={onCancel} style={buttonStyle}>취소</button>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {!isLast && item.ratio && (
                            <button type="button" onClick={applyToRest} style={buttonStyle}>
                                나머지 {items.length - index - 1}장도 '{ratio.label}'로 가운데 맞춰 올리기
                            </button>
                        )}
                        <button type="button" disabled={index === 0} onClick={() => setIndex(index - 1)} style={{ ...buttonStyle, opacity: index === 0 ? 0.5 : 1 }}>이전</button>
                        {isLast ? (
                            <button type="button" onClick={() => onDone(result(items))} style={primaryStyle}>{items.length}장 올리기</button>
                        ) : (
                            <button type="button" onClick={() => setIndex(index + 1)} style={primaryStyle}>다음 사진</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhotoCropDialog;

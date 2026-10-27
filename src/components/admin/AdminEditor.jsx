import React, { useRef, useEffect } from 'react';
import { Editor } from '@toast-ui/react-editor';
import { uploadSiteImage } from '../../lib/gallery';
import '@toast-ui/editor/dist/toastui-editor.css';
import '@toast-ui/editor/dist/i18n/ko-kr';

const AdminEditor = ({ initialValue, onChange, height = '800px' }) => {
    const editorRef = useRef();
    const wrapperRef = useRef(null);

    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        const handleNativeWheel = (e) => {
            // 에디터 내부에 포커스가 있는지 확인 (선택되었을 때만)
            const isFocused = wrapper.contains(document.activeElement);
            if (!isFocused) return;

            let target = e.target;
            while (target && target !== wrapper) {
                if (target.scrollHeight > target.clientHeight) {
                    const overflowY = window.getComputedStyle(target).overflowY;
                    if (overflowY === 'auto' || overflowY === 'scroll') {
                        const isAtTop = target.scrollTop === 0;
                        const isAtBottom = Math.abs(target.scrollHeight - target.scrollTop - target.clientHeight) < 2;

                        if ((e.deltaY > 0 && !isAtBottom) || (e.deltaY < 0 && !isAtTop)) {
                            e.stopPropagation(); // 스크롤이 가능하면 Lenis 이벤트 전파 중단
                            return;
                        }
                    }
                }
                target = target.parentNode;
            }
        };

        wrapper.addEventListener('wheel', handleNativeWheel, { passive: true });
        return () => {
            wrapper.removeEventListener('wheel', handleNativeWheel);
        };
    }, []);

    const handleChange = () => {
        if (editorRef.current) {
            const instance = editorRef.current.getInstance();
            onChange(instance.getHTML());
        }
    };

    // 본문 사진은 R2 에 올린다 (src/lib/gallery.js)
    const handleImageUpload = async (blob, callback) => {
        try {
            callback(await uploadSiteImage(blob), blob.name || 'image');
        } catch (error) {
            console.error('이미지 업로드 중 오류 발생:', error);
            alert(`이미지 업로드에 실패했습니다.\n${error.message}`);
            callback('', '업로드 실패');
        }
    };

    return (
        <div ref={wrapperRef} style={{ backgroundColor: '#fff', borderRadius: '4px' }}>
            <style>
                {`
                .toastui-editor-contents, .ProseMirror {
                    color: var(--color-text-tertiary) !important;
                    font-size: 16px !important;
                    font-family: var(--font-body) !important;
                }
                .toastui-editor-contents *:not(table), .ProseMirror *:not(table) {
                }
                .toastui-editor-contents p, .ProseMirror p,
                .toastui-editor-contents span, .ProseMirror span,
                .toastui-editor-contents li, .ProseMirror li {
                    font-size: 16px !important;
                }
                .toastui-editor-contents h1, .ProseMirror h1,
                .toastui-editor-contents h2, .ProseMirror h2,
                .toastui-editor-contents h3, .ProseMirror h3,
                .toastui-editor-contents h4, .ProseMirror h4,
                .toastui-editor-contents h5, .ProseMirror h5,
                .toastui-editor-contents h6, .ProseMirror h6 {
                    border-bottom: none !important;
                    color: var(--color-text-body) !important;
                    margin-top: 1.2em !important;
                    margin-bottom: 0.5em !important;
                    word-break: keep-all !important;
                    font-weight: 400 !important;
                }
                .toastui-editor-contents h1, .ProseMirror h1,
                .toastui-editor-contents h2, .ProseMirror h2,
                .toastui-editor-contents h3, .ProseMirror h3,
                .toastui-editor-contents h4, .ProseMirror h4,
                .toastui-editor-contents h5, .ProseMirror h5,
                .toastui-editor-contents h6, .ProseMirror h6 { font-size: 16px !important; }
                
                /* 커스텀 제목 드롭다운 (H1~H4 숨김, H5->제목1, H6->제목2) */
                .toastui-editor-popup-add-heading li:nth-child(1),
                .toastui-editor-popup-add-heading li:nth-child(2),
                .toastui-editor-popup-add-heading li:nth-child(3),
                .toastui-editor-popup-add-heading li:nth-child(4),
                .toastui-editor-popup-add-heading li[data-level="1"],
                .toastui-editor-popup-add-heading li[data-level="2"],
                .toastui-editor-popup-add-heading li[data-level="3"],
                .toastui-editor-popup-add-heading li[data-level="4"] {
                    display: none !important;
                }
                
                .toastui-editor-popup-add-heading li:nth-child(5) *,
                .toastui-editor-popup-add-heading li[data-level="5"] * {
                    font-size: 0 !important;
                }
                .toastui-editor-popup-add-heading li:nth-child(5) *::before,
                .toastui-editor-popup-add-heading li[data-level="5"] *::before {
                    content: '제목 1' !important;
                    font-size: 20px !important;
                    visibility: visible !important;
                }
                
                .toastui-editor-popup-add-heading li:nth-child(6) *,
                .toastui-editor-popup-add-heading li[data-level="6"] * {
                    font-size: 0 !important;
                }
                .toastui-editor-popup-add-heading li:nth-child(6) *::before,
                .toastui-editor-popup-add-heading li[data-level="6"] *::before {
                    content: '제목 2' !important;
                    font-size: 18px !important;
                    visibility: visible !important;
                }
                `}
            </style>
            <Editor
                ref={editorRef}
                initialValue={initialValue || ' '}
                previewStyle="vertical"
                height={height}
                initialEditType="wysiwyg"
                useCommandShortcut={true}
                language="ko-KR"
                hideModeSwitch={true}
                onChange={handleChange}
                hooks={{
                    addImageBlobHook: handleImageUpload
                }}
                toolbarItems={[
                    ['italic', 'strike'],
                    ['hr', 'quote'],
                    ['ul', 'ol', 'task', 'indent', 'outdent'],
                    ['table', 'link'],
                    ['code', 'codeblock']
                ]}
            />
        </div>
    );
};

export default AdminEditor;

import React, { useRef } from 'react';
import { Editor } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import '@toast-ui/editor/dist/i18n/ko-kr';

const AdminEditor = ({ initialValue, onChange, height = '800px' }) => {
    const editorRef = useRef();

    const handleChange = () => {
        if (editorRef.current) {
            const instance = editorRef.current.getInstance();
            onChange(instance.getMarkdown());
        }
    };

    // ImgBB 이미지 업로드 훅
    const handleImageUpload = async (blob, callback) => {
        const imgbbApiKey = import.meta.env.VITE_IMGBB_API_KEY;
        if (!imgbbApiKey) {
            alert('ImgBB API 키가 설정되지 않았습니다.');
            callback('', '업로드 실패');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('image', blob);
            
            const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            if (result.success) {
                callback(result.data.url, result.data.title || 'image');
            } else {
                throw new Error(result.error?.message);
            }
        } catch (error) {
            console.error('이미지 업로드 중 오류 발생:', error);
            alert('이미지 업로드에 실패했습니다.');
            callback('', '업로드 실패');
        }
    };

    return (
        <div style={{ backgroundColor: '#fff', borderRadius: '4px' }} data-lenis-prevent="true">
            <style>
                {`
                .toastui-editor-contents, .ProseMirror {
                    font-family: var(--font-body) !important;
                    color: var(--color-text-body) !important;
                    font-size: 16px !important;
                    letter-spacing: -0.02em !important;
                }
                .toastui-editor-contents p, .ProseMirror p,
                .toastui-editor-contents span, .ProseMirror span,
                .toastui-editor-contents li, .ProseMirror li {
                    font-size: 16px !important;
                    font-family: inherit !important;
                    line-height: var(--leading-body) !important;
                }
                .toastui-editor-contents h1, .ProseMirror h1,
                .toastui-editor-contents h2, .ProseMirror h2,
                .toastui-editor-contents h3, .ProseMirror h3,
                .toastui-editor-contents h4, .ProseMirror h4,
                .toastui-editor-contents h5, .ProseMirror h5,
                .toastui-editor-contents h6, .ProseMirror h6 {
                    font-family: var(--font-body) !important;
                    border-bottom: none !important;
                    color: var(--color-text-dark) !important;
                    font-weight: 600 !important;
                    letter-spacing: -0.02em !important;
                    margin-top: 1.2em !important;
                    margin-bottom: 0.5em !important;
                    line-height: 1.4 !important;
                    word-break: keep-all !important;
                }
                .toastui-editor-contents h1, .ProseMirror h1 { font-size: 36px !important; }
                .toastui-editor-contents h2, .ProseMirror h2 { font-size: 32px !important; }
                .toastui-editor-contents h3, .ProseMirror h3 { font-size: 28px !important; }
                .toastui-editor-contents h4, .ProseMirror h4 { font-size: 24px !important; }
                .toastui-editor-contents h5, .ProseMirror h5 { font-size: 20px !important; }
                .toastui-editor-contents h6, .ProseMirror h6 { font-size: 18px !important; }
                
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
                    ['heading', 'bold', 'italic', 'strike'],
                    ['hr', 'quote'],
                    ['ul', 'ol', 'task', 'indent', 'outdent'],
                    ['table', 'image', 'link'],
                    ['code', 'codeblock']
                ]}
            />
        </div>
    );
};

export default AdminEditor;

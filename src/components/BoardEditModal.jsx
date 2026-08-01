import React, { useState, useEffect, useRef } from 'react';
import { X, Lock, Edit3, Check, Image as ImageIcon, Loader2 } from 'lucide-react';

function BoardEditModal({ isOpen, onClose, post, onPostUpdated }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);
    const imageMapRef = useRef({});

    useEffect(() => {
        if (post && post.content) {
            setTitle(post.title || '');
            setPassword('');
            setErrorMsg('');

            // Parse existing Base64 images and convert to clean shortcode aliases
            imageMapRef.current = {};
            let count = 1;
            let displayContent = post.content;

            const imageRegex = /!\[.*?\]\((data:image\/[^;]+;base64,[^\)]+)\)/g;
            displayContent = displayContent.replace(imageRegex, (match, dataUrl) => {
                const shortcode = `![📷 첨부 이미지 ${count++}]`;
                imageMapRef.current[shortcode] = dataUrl;
                return shortcode;
            });

            setContent(displayContent);
        }
    }, [post]);

    if (!isOpen || !post) return null;

    // Handle File Input Selection
    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('이미지 파일만 업로드할 수 있습니다.');
            return;
        }

        processImageFile(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Handle Ctrl+V Clipboard Image Paste
    const handlePaste = (e) => {
        const clipboardData = e.clipboardData;
        if (!clipboardData || !clipboardData.items) return;

        for (let i = 0; i < clipboardData.items.length; i++) {
            const item = clipboardData.items[i];
            if (item.type.startsWith('image/')) {
                e.preventDefault(); // Prevent default text paste
                const file = item.getAsFile();
                if (file) {
                    processImageFile(file);
                }
                break;
            }
        }
    };

    const processImageFile = (file) => {
        setUploadingImage(true);
        const reader = new FileReader();

        reader.onload = (event) => {
            const base64Url = event.target?.result;
            if (base64Url && typeof base64Url === 'string') {
                const imgCount = Object.keys(imageMapRef.current).length + 1;
                const shortcode = `![📷 첨부 이미지 ${imgCount}]`;
                imageMapRef.current[shortcode] = base64Url;

                const markdownTag = `\n\n${shortcode}\n\n`;

                if (textareaRef.current) {
                    const start = textareaRef.current.selectionStart || content.length;
                    const end = textareaRef.current.selectionEnd || content.length;
                    const newContent = content.substring(0, start) + markdownTag + content.substring(end);
                    setContent(newContent);
                } else {
                    setContent(prev => prev + markdownTag);
                }
            }
            setUploadingImage(false);
        };

        reader.onerror = () => {
            alert('이미지를 불러오는데 실패했습니다.');
            setUploadingImage(false);
        };

        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim() || !password.trim()) {
            setErrorMsg('비밀번호를 입력해 주세요.');
            return;
        }

        setSubmitting(true);
        setErrorMsg('');

        // Restore shortcodes back to actual full Base64 URLs before update
        let finalContent = content.trim();
        for (const [alias, dataUrl] of Object.entries(imageMapRef.current)) {
            finalContent = finalContent.split(alias).join(`![이미지](${dataUrl})`);
        }

        const rawId = post.rawId || String(post.id).replace(/^community-/, '');

        try {
            const res = await fetch(`/api/posts/${rawId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    content: finalContent,
                    password: password.trim()
                })
            });

            if (res.status === 403) {
                setErrorMsg('비밀번호가 일치하지 않습니다.');
                setSubmitting(false);
                return;
            }
        } catch (e) {
            // Local fallback check
            if (post.password && post.password !== password.trim()) {
                setErrorMsg('비밀번호가 일치하지 않습니다.');
                setSubmitting(false);
                return;
            }
        }

        const updatedPost = {
            ...post,
            title: title.trim(),
            content: finalContent
        };

        onPostUpdated(updatedPost);
        imageMapRef.current = {};
        setSubmitting(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[70] p-4 backdrop-blur-sm">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={() => {
                        imageMapRef.current = {};
                        onClose();
                    }}
                    className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Edit3 className="text-brand-accent" size={24} />
                    게시글 수정하기
                </h3>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">글 제목</label>
                        <input
                            type="text"
                            placeholder="제목을 입력하세요"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
                            maxLength={100}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-xs font-semibold text-slate-400">
                                내용 <span className="text-[10px] text-brand-highlight font-normal ml-2">💡 캡처 후 Ctrl+V 로 바로 이미지 붙여넣기 가능!</span>
                            </label>

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingImage}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition-all border border-slate-600 shadow-sm"
                            >
                                {uploadingImage ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin text-brand-accent" />
                                        이미지 읽는 중...
                                    </>
                                ) : (
                                    <>
                                        <ImageIcon size={14} className="text-brand-accent" />
                                        🖼️ 이미지 추가 첨부
                                    </>
                                )}
                            </button>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>

                        <textarea
                            ref={textareaRef}
                            rows={8}
                            onPaste={handlePaste}
                            placeholder="수정할 본문 내용을 입력하세요."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-accent resize-none leading-relaxed font-mono text-xs sm:text-sm"
                        />
                    </div>

                    {errorMsg && (
                        <p className="text-xs font-semibold text-red-400 text-right">{errorMsg}</p>
                    )}

                    {/* Bottom Action Bar with Password Input Right Next to Submit */}
                    <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-2">
                        <div className="relative w-full sm:w-60">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                            <input
                                type="password"
                                placeholder="비밀번호 입력"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (errorMsg) setErrorMsg('');
                                }}
                                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                                maxLength={20}
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    imageMapRef.current = {};
                                    onClose();
                                }}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs sm:text-sm rounded-lg transition-colors font-medium"
                            >
                                취소
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || uploadingImage}
                                className="px-5 py-2 bg-brand-accent hover:bg-brand-highlight text-white text-xs sm:text-sm font-bold rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-brand-accent/30 whitespace-nowrap"
                            >
                                <Check size={16} />
                                수정 완료
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default BoardEditModal;

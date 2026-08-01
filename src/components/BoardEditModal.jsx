import React, { useState, useEffect, useRef } from 'react';
import { X, Lock, Edit3, Check, Image as ImageIcon, Loader2, Eye, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function convertClipboardTableToMarkdown(clipboardData) {
    if (!clipboardData) return null;
    let matrix = [];

    // 1. Try HTML Table first (MS Word, Web pages, Notion copy-paste)
    const htmlText = clipboardData.getData('text/html');
    if (htmlText && (htmlText.includes('<table') || htmlText.includes('<tr'))) {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');
            const table = doc.querySelector('table');
            if (table) {
                const trs = Array.from(table.querySelectorAll('tr'));
                matrix = trs.map(tr => {
                    const cells = Array.from(tr.querySelectorAll('th, td'));
                    return cells.map(cell => cell.textContent ? cell.textContent.replace(/\r?\n+/g, ' ').trim() : '');
                }).filter(row => row.length > 0);
            }
        } catch (e) { }
    }

    // 2. Fallback to Plain Text TSV (Excel, Google Sheets)
    if (matrix.length === 0) {
        const plainText = clipboardData.getData('text/plain');
        if (plainText && plainText.includes('\t')) {
            const lines = plainText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
            if (lines.length > 0) {
                matrix = lines.map(line => line.split('\t').map(cell => cell.replace(/\r?\n+/g, ' ').trim()));
            }
        }
    }

    if (matrix.length === 0) return null;

    const colCount = Math.max(...matrix.map(r => r.length));
    if (colCount < 2) return null;

    // Helper to calculate visual width for Korean & Monospace alignment
    const getVisualWidth = (str) => {
        let width = 0;
        for (let i = 0; i < str.length; i++) {
            const code = str.charCodeAt(i);
            if ((code >= 0xac00 && code <= 0xd7a3) || (code >= 0x1100 && code <= 0x11ff) || (code >= 0x3130 && code <= 0x318f)) {
                width += 2;
            } else {
                width += 1;
            }
        }
        return width;
    };

    const padCell = (str, targetVisualWidth) => {
        const currentVisualWidth = getVisualWidth(str);
        const missing = Math.max(0, targetVisualWidth - currentVisualWidth);
        return str + ' '.repeat(missing);
    };

    // Calculate maximum visual width for each column to line up all | pipes
    const colWidths = Array.from({ length: colCount }, (_, c) => {
        let maxW = 3;
        for (let r = 0; r < matrix.length; r++) {
            const val = matrix[r][c] || (r === 0 ? `열 ${c + 1}` : '');
            const w = getVisualWidth(val);
            if (w > maxW) maxW = w;
        }
        return maxW;
    });

    let md = '\n\n';

    // 1. Header row
    const headerCells = Array.from({ length: colCount }, (_, c) => padCell(matrix[0][c] || `열 ${c + 1}`, colWidths[c]));
    md += '| ' + headerCells.join(' | ') + ' |\n';

    // 2. Separator row
    const sepCells = Array.from({ length: colCount }, (_, c) => '-'.repeat(Math.max(3, colWidths[c])));
    md += '| ' + sepCells.join(' | ') + ' |\n';

    // 3. Data rows
    for (let r = 1; r < matrix.length; r++) {
        const rowCells = Array.from({ length: colCount }, (_, c) => padCell(matrix[r][c] || '', colWidths[c]));
        md += '| ' + rowCells.join(' | ') + ' |\n';
    }

    return md + '\n';
}

function BoardEditModal({ isOpen, onClose, post, onPostUpdated }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [password, setPassword] = useState('');
    const [activeTab, setActiveTab] = useState('write'); // 'write' | 'preview'
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

    // Handle Ctrl+V Paste for Images and MS Word / Excel / Web Tables
    const handlePaste = (e) => {
        const clipboardData = e.clipboardData;
        if (!clipboardData) return;

        // 1. Check for clipboard image paste first
        if (clipboardData.items) {
            for (let i = 0; i < clipboardData.items.length; i++) {
                const item = clipboardData.items[i];
                if (item.type.startsWith('image/')) {
                    e.preventDefault();
                    const file = item.getAsFile();
                    if (file) {
                        processImageFile(file);
                    }
                    return;
                }
            }
        }

        // 2. Check for MS Word / HTML / Excel Table paste
        const tableMarkdown = convertClipboardTableToMarkdown(clipboardData);
        if (tableMarkdown) {
            e.preventDefault();
            if (textareaRef.current) {
                const start = textareaRef.current.selectionStart || content.length;
                const end = textareaRef.current.selectionEnd || content.length;
                const newContent = content.substring(0, start) + tableMarkdown + content.substring(end);
                setContent(newContent);
            } else {
                setContent(prev => prev + tableMarkdown);
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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[70] p-4 md:p-6 backdrop-blur-sm overflow-y-auto">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-4xl lg:max-w-5xl w-full p-6 md:p-8 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto">
                <button
                    onClick={() => {
                        imageMapRef.current = {};
                        onClose();
                    }}
                    className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
                >
                    <X size={22} />
                </button>

                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 border-b border-slate-700/60 pb-4">
                    <h3 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
                        <Edit3 className="text-brand-accent" size={28} />
                        게시글 수정하기
                    </h3>

                    {/* Editor View Switcher Tabs (Write vs Live Table Preview) */}
                    <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-700/80">
                        <button
                            type="button"
                            onClick={() => setActiveTab('write')}
                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'write' ? 'bg-brand-accent text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                        >
                            <FileText size={14} /> 작성하기
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('preview')}
                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'preview' ? 'bg-brand-accent text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Eye size={14} /> 👁️ 실시간 표/완성 미리보기
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">글 제목</label>
                        <input
                            type="text"
                            placeholder="제목을 입력하세요"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-3.5 bg-slate-900 border border-slate-700 rounded-xl text-base text-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
                            maxLength={100}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-xs font-semibold text-slate-400">
                                본문 내용 <span className="text-[11px] text-brand-highlight font-normal ml-2">💡 워드/엑셀 표 복사나 캡처 이미지 Ctrl+V 로 바로 붙여넣기 가능!</span>
                            </label>

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingImage}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition-all border border-slate-600 shadow-sm"
                            >
                                {uploadingImage ? (
                                    <>
                                        <Loader2 size={15} className="animate-spin text-brand-accent" />
                                        이미지 읽는 중...
                                    </>
                                ) : (
                                    <>
                                        <ImageIcon size={15} className="text-brand-accent" />
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

                        {/* Toggle between Write Mode and Live Markdown Table Preview Mode */}
                        {activeTab === 'write' ? (
                            <textarea
                                ref={textareaRef}
                                rows={14}
                                onPaste={handlePaste}
                                placeholder="수정할 본문 내용을 입력하세요. MS 워드/한글/엑셀 표를 복사해서 [Ctrl+V]를 누르면 깨짐 없이 파이프(|) 기호가 수직으로 정갈하게 맞춰집니다."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-accent resize-y leading-relaxed font-mono min-h-[380px] whitespace-pre"
                            />
                        ) : (
                            <div className="w-full p-6 bg-slate-900 border border-slate-700 rounded-xl min-h-[380px] max-h-[500px] overflow-y-auto">
                                <div className="text-xs text-brand-highlight font-extrabold mb-3 flex items-center gap-1 border-b border-slate-800 pb-2">
                                    <Eye size={14} /> 👁️ 게시글 완성 실시간 표/본문 모습 미리보기
                                </div>
                                <div className="prose prose-invert prose-slate max-w-none text-slate-200 text-sm leading-relaxed prose-img:rounded-xl prose-img:max-h-96 prose-img:mx-auto">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        urlTransform={(url) => url}
                                        components={{
                                            table: ({ node, ...props }) => (
                                                <div className="overflow-x-auto my-4 rounded-xl border border-slate-700/60 shadow-xl bg-slate-800/40">
                                                    <table className="min-w-full divide-y divide-slate-700/60 text-left text-sm" {...props} />
                                                </div>
                                            ),
                                            thead: ({ node, ...props }) => (
                                                <thead className="bg-slate-800/90 text-brand-highlight font-extrabold text-xs tracking-wider border-b border-slate-700" {...props} />
                                            ),
                                            tbody: ({ node, ...props }) => (
                                                <tbody className="divide-y divide-slate-700/50 bg-slate-900/30" {...props} />
                                            ),
                                            tr: ({ node, ...props }) => (
                                                <tr className="hover:bg-slate-700/30 transition-colors" {...props} />
                                            ),
                                            th: ({ node, ...props }) => (
                                                <th className="px-4 py-3 font-bold text-slate-200 border-r border-slate-700/40 last:border-r-0" {...props} />
                                            ),
                                            td: ({ node, ...props }) => (
                                                <td className="px-4 py-3 text-slate-300 border-r border-slate-700/30 last:border-r-0 leading-normal" {...props} />
                                            )
                                        }}
                                    >
                                        {content ? content : '*아직 작성된 내용이 없습니다.*'}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        )}
                    </div>

                    {errorMsg && (
                        <p className="text-xs font-semibold text-red-400 text-right">{errorMsg}</p>
                    )}

                    {/* Bottom Action Bar with Password Input Right Next to Submit */}
                    <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-2">
                        <div className="relative w-full sm:w-60">
                            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                            <input
                                type="password"
                                placeholder="비밀번호 입력"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (errorMsg) setErrorMsg('');
                                }}
                                className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-accent"
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
                                className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs sm:text-sm rounded-xl transition-colors font-medium"
                            >
                                취소
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || uploadingImage}
                                className="px-6 py-2.5 bg-brand-accent hover:bg-brand-highlight text-white text-xs sm:text-sm font-extrabold rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-brand-accent/30 whitespace-nowrap"
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

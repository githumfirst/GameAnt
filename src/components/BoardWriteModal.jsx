import React, { useState, useRef } from 'react';
import { X, User, Lock, Edit3, Check, Image as ImageIcon, Loader2, Eye, FileText } from 'lucide-react';
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

function BoardWriteModal({ isOpen, onClose, onPostCreated }) {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [password, setPassword] = useState('');
    const [content, setContent] = useState('');
    const [activeTab, setActiveTab] = useState('write'); // 'write' | 'preview'
    const [submitting, setSubmitting] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);
    const imageMapRef = useRef({});

    if (!isOpen) return null;

    // Handle Image File Upload via File Input
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
            e.preventDefault(); // Prevent default text paste
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
        if (!title.trim() || !author.trim() || !password.trim() || !content.trim()) {
            alert('모든 항목(제목, 닉네임, 비밀번호, 내용)을 입력해 주세요.');
            return;
        }

        setSubmitting(true);

        // Replace shortcode aliases with actual Base64 data URLs before submit
        let finalContent = content.trim();
        for (const [alias, dataUrl] of Object.entries(imageMapRef.current)) {
            finalContent = finalContent.split(alias).join(`![이미지](${dataUrl})`);
        }

        const newPostObj = {
            id: Date.now(),
            title: title.trim(),
            author: author.trim(),
            content: finalContent,
            password: password.trim(),
            created_at: new Date().toISOString().substring(0, 10)
        };

        try {
            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    author: author.trim(),
                    content: finalContent,
                    password: password.trim()
                })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.id) {
                    newPostObj.id = data.id;
                }
            }
        } catch (e) {
            console.log("Saving post locally");
        }

        onPostCreated(newPostObj);

        // Reset form
        setTitle('');
        setAuthor('');
        setPassword('');
        setContent('');
        imageMapRef.current = {};
        setSubmitting(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 md:p-6 backdrop-blur-sm overflow-y-auto">
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
                        ant@IT 새 글 작성
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1">작성자 (닉네임)</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="닉네임"
                                    value={author}
                                    onChange={(e) => setAuthor(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
                                    maxLength={20}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1">비밀번호 (삭제용)</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                                <input
                                    type="password"
                                    placeholder="비밀번호"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
                                    maxLength={20}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-xs font-semibold text-slate-400">
                                본문 내용 <span className="text-[11px] text-brand-highlight font-normal ml-2">💡 워드/엑셀 표 복사나 캡처 이미지 Ctrl+V 로 바로 붙여넣기 가능!</span>
                            </label>

                            {/* Image Upload Trigger Button */}
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
                                        🖼️ 이미지 첨부
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
                                placeholder="글을 작성해 보세요. MS 워드/한글/엑셀 표를 복사해서 [Ctrl+V]를 누르면 깨짐 없이 파이프(|) 기호가 수직으로 정갈하게 맞춰집니다."
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

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                imageMapRef.current = {};
                                onClose();
                            }}
                            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-xl transition-colors font-medium"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || uploadingImage}
                            className="px-7 py-3 bg-brand-accent hover:bg-brand-highlight text-white text-sm font-extrabold rounded-xl transition-colors flex items-center gap-2 shadow-xl shadow-brand-accent/30"
                        >
                            <Check size={18} />
                            글 등록하기
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default BoardWriteModal;

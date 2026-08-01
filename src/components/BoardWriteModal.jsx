import React, { useState } from 'react';
import { X, User, Lock, Edit3, Check } from 'lucide-react';

function BoardWriteModal({ isOpen, onClose, onPostCreated }) {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [password, setPassword] = useState('');
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !author.trim() || !password.trim() || !content.trim()) {
            alert('모든 항목(제목, 닉네임, 비밀번호, 내용)을 입력해 주세요.');
            return;
        }

        setSubmitting(true);
        const newPostObj = {
            id: Date.now(),
            title: title.trim(),
            author: author.trim(),
            content: content.trim(),
            password: password.trim(),
            created_at: new Date().toLocaleDateString('ko-KR', {
                year: 'numeric', month: '2-digit', day: '2-digit'
            })
        };

        try {
            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    author: author.trim(),
                    content: content.trim(),
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
        setSubmitting(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Edit3 className="text-brand-accent" size={24} />
                    자유 게시판 새 글 작성
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1">작성자 (닉네임)</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="닉네임"
                                    value={author}
                                    onChange={(e) => setAuthor(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
                                    maxLength={20}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1">비밀번호 (삭제용)</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                <input
                                    type="password"
                                    placeholder="비밀번호"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
                                    maxLength={20}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">내용</label>
                        <textarea
                            rows={6}
                            placeholder="자유롭게 글을 적어보세요..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-accent resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg transition-colors font-medium"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2.5 bg-brand-accent hover:bg-brand-highlight text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-brand-accent/30"
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

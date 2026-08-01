import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Trash2, User, Lock, CornerDownRight } from 'lucide-react';

function CommentSection({ postId }) {
    const [comments, setComments] = useState([]);
    const [author, setAuthor] = useState('');
    const [password, setPassword] = useState('');
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ open: false, commentId: null, password: '' });
    const [deleteError, setDeleteError] = useState('');

    const storageKey = `comments_${postId}`;

    const loadComments = async () => {
        try {
            const res = await fetch(`/api/comments?post_id=${encodeURIComponent(postId)}`);
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.comments && data.comments.length > 0) {
                    setComments(data.comments);
                    localStorage.setItem(storageKey, JSON.stringify(data.comments));
                    return;
                }
            }
        } catch (e) {
            console.log("Using local comments fallback");
        }

        // Fallback to local storage for offline / dev preview
        const local = localStorage.getItem(storageKey);
        if (local) {
            try {
                setComments(JSON.parse(local));
            } catch (e) {
                setComments([]);
            }
        }
    };

    useEffect(() => {
        if (postId) {
            loadComments();
        }
    }, [postId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!author.trim() || !password.trim() || !content.trim()) {
            alert('닉네임, 비밀번호, 댓글 내용을 모두 입력해 주세요.');
            return;
        }

        setSubmitting(true);
        const newCommentObj = {
            id: Date.now(),
            post_id: postId,
            author: author.trim(),
            content: content.trim(),
            password: password.trim(),
            created_at: new Date().toLocaleDateString('ko-KR', {
                year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
            })
        };

        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    post_id: postId,
                    author: author.trim(),
                    content: content.trim(),
                    password: password.trim()
                })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.id) {
                    newCommentObj.id = data.id;
                }
            }
        } catch (e) {
            console.log("Saving locally");
        }

        const updated = [...comments, newCommentObj];
        setComments(updated);
        localStorage.setItem(storageKey, JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));

        setContent('');
        setSubmitting(false);
    };

    const handleDelete = async () => {
        if (!deleteModal.password.trim()) {
            setDeleteError('비밀번호를 입력해 주세요.');
            return;
        }

        try {
            const res = await fetch('/api/comments', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: deleteModal.commentId,
                    password: deleteModal.password.trim()
                })
            });

            if (res.status === 403) {
                setDeleteError('비밀번호가 일치하지 않습니다.');
                return;
            }
        } catch (e) {
            // Local fallback check
            const target = comments.find(c => c.id === deleteModal.commentId);
            if (target && target.password && target.password !== deleteModal.password.trim()) {
                setDeleteError('비밀번호가 일치하지 않습니다.');
                return;
            }
        }

        const updated = comments.filter(c => c.id !== deleteModal.commentId);
        setComments(updated);
        localStorage.setItem(storageKey, JSON.stringify(updated));

        setDeleteModal({ open: false, commentId: null, password: '' });
        setDeleteError('');
    };

    return (
        <section className="mt-12 border-t border-slate-700/60 pt-10">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <MessageSquare className="text-brand-accent" size={24} />
                댓글 ({comments.length})
            </h3>

            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="bg-slate-800/60 rounded-2xl border border-slate-700/60 p-5 mb-8 shadow-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="닉네임"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                            maxLength={20}
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                        <input
                            type="password"
                            placeholder="비밀번호 (수정/삭제용)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                            maxLength={20}
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <textarea
                        rows={3}
                        placeholder="타인을 배려하는 따뜻한 댓글을 남겨주세요."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-accent resize-none"
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="bg-brand-accent hover:bg-brand-highlight text-white font-bold py-2 px-6 rounded-lg text-sm flex items-center gap-2 transition-all shadow-md"
                    >
                        <Send size={16} />
                        댓글 등록
                    </button>
                </div>
            </form>

            {/* Comment List */}
            <div className="space-y-4">
                {comments.length > 0 ? (
                    comments.map((comment) => (
                        <div key={comment.id} className="bg-slate-800/40 rounded-xl border border-slate-700/40 p-4 transition-all hover:border-slate-600/60">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-brand-accent text-sm">{comment.author}</span>
                                    <span className="text-xs text-slate-500">{comment.created_at}</span>
                                </div>
                                <button
                                    onClick={() => {
                                        setDeleteModal({ open: true, commentId: comment.id, password: '' });
                                        setDeleteError('');
                                    }}
                                    className="text-slate-500 hover:text-red-400 transition-colors p-1"
                                    title="댓글 삭제"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-slate-500 text-sm">
                        아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!
                    </div>
                )}
            </div>

            {/* Delete Password Modal */}
            {deleteModal.open && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                        <h4 className="text-lg font-bold text-white mb-2">댓글 삭제</h4>
                        <p className="text-xs text-slate-400 mb-4">댓글 작성 시 설정한 비밀번호를 입력하세요.</p>

                        <input
                            type="password"
                            placeholder="비밀번호"
                            value={deleteModal.password}
                            onChange={(e) => setDeleteModal({ ...deleteModal, password: e.target.value })}
                            className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white mb-2 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                        />

                        {deleteError && (
                            <p className="text-xs text-red-400 mb-3">{deleteError}</p>
                        )}

                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => setDeleteModal({ open: false, commentId: null, password: '' })}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-lg transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors"
                            >
                                삭제하기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default CommentSection;

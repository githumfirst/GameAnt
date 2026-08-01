import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, FileText, PenTool, MessageSquare, Sparkles, X, Trash2, Eye, Edit3 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import BoardWriteModal from '../components/BoardWriteModal';
import BoardEditModal from '../components/BoardEditModal';
import CommentSection from '../components/CommentSection';

const rawMarkdownFiles = import.meta.glob('../content/devlog/*.md', { query: '?raw', import: 'default', eager: true });

function getCommentCount(post) {
    if (!post) return 0;
    const candidates = [
        `comments_${post.id}`,
        `comments_${post.slug}`,
        `comments_article-${post.slug}`,
        `comments_community-${post.rawId || post.id}`,
        `comments_${post.rawId}`
    ];

    for (const key of candidates) {
        if (!key) continue;
        try {
            const local = localStorage.getItem(key);
            if (local) {
                const parsed = JSON.parse(local);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed.length;
                }
            }
        } catch (e) { }
    }
    return post.comment_count || 0;
}

function formatDate(dateStr) {
    if (!dateStr) return new Date().toISOString().substring(0, 10);
    const s = String(dateStr).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

    const matches = s.match(/\d+/g);
    if (matches && matches.length >= 3) {
        const y = matches[0];
        const m = matches[1].padStart(2, '0');
        const d = matches[2].padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
    if (matches && matches.length === 2) {
        const y = matches[0];
        const m = matches[1].padStart(2, '0');
        const todayD = new Date().getDate().toString().padStart(2, '0');
        return `${y}-${m}-${todayD}`;
    }
    return s.substring(0, 10);
}

function getViewCount(postId, defaultViews = 15) {
    try {
        const local = localStorage.getItem(`views_${postId}`);
        if (local) {
            return parseInt(local, 10) || defaultViews;
        }
    } catch (e) { }
    return defaultViews;
}

function incrementViewCount(postId, currentViews = 15) {
    const newViews = getViewCount(postId, currentViews) + 1;
    try {
        localStorage.setItem(`views_${postId}`, newViews.toString());
    } catch (e) { }
    return newViews;
}

// Preserve existing 4 markdown posts
function parsePreservedPosts() {
    const loadedPosts = [];
    for (const path in rawMarkdownFiles) {
        const content = rawMarkdownFiles[path];
        if (typeof content !== 'string') continue;
        try {
            const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
            const match = content.match(frontmatterRegex);

            let data = {};
            let markdownContent = content;

            if (match) {
                const yamlString = match[1];
                markdownContent = match[2];

                yamlString.split('\n').forEach(line => {
                    const [key, ...valueParts] = line.split(':');
                    if (key && valueParts.length > 0) {
                        let val = valueParts.join(':').trim();
                        val = val.replace(/^["'](.*)["']$/, '$1');
                        data[key.trim()] = val;
                    }
                });
            }

            const fileName = path.split('/').pop();
            const slug = fileName.replace('.md', '');

            loadedPosts.push({
                id: `article-${slug}`,
                slug,
                isSSG: true,
                title: data.title || 'Untitled',
                writer: data.writer || 'Anonymous',
                date: data.date || 'Unknown Date',
                content: markdownContent,
                views: getViewCount(`article-${slug}`, 15)
            });
        } catch (err) {
            console.error('Error parsing preserved markdown:', path, err);
        }
    }
    loadedPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
    return loadedPosts;
}

function DevLogList() {
    const [staticPosts] = useState(() => parsePreservedPosts());
    const [communityPosts, setCommunityPosts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ open: false, postId: null, password: '' });
    const [deleteError, setDeleteError] = useState('');
    const postsPerPage = 10;

    const loadCommunityPosts = async () => {
        try {
            const res = await fetch('/api/posts');
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.posts && data.posts.length > 0) {
                    const formatted = data.posts.map(p => ({
                        id: `community-${p.id}`,
                        rawId: p.id,
                        isSSG: false,
                        title: p.title,
                        writer: p.author,
                        views: getViewCount(`community-${p.id}`, p.views || 1),
                        comment_count: p.comment_count || 0,
                        date: p.created_at ? p.created_at.substring(0, 10) : 'Recent',
                        content: p.content
                    }));
                    setCommunityPosts(formatted);
                    localStorage.setItem('community_posts', JSON.stringify(formatted));
                    return;
                }
            }
        } catch (e) {
            console.log("Using local community posts fallback");
        }

        // Fallback to local storage
        const local = localStorage.getItem('community_posts');
        if (local) {
            try {
                const parsed = JSON.parse(local);
                const updated = parsed.map(p => {
                    const cleanId = String(p.id).replace(/^community-/, '');
                    return {
                        ...p,
                        id: `community-${cleanId}`,
                        rawId: cleanId,
                        views: getViewCount(`community-${cleanId}`, p.views || 1)
                    };
                });
                setCommunityPosts(updated);
            } catch (e) {
                setCommunityPosts([]);
            }
        }
    };

    useEffect(() => {
        loadCommunityPosts();

        // Check if initial page URL is a direct /post/:id link
        const pathname = window.location.pathname;
        const postMatch = pathname.match(/^\/post\/(.+)$/);
        if (postMatch) {
            const targetRawId = postMatch[1];
            fetch(`/api/posts/${targetRawId}`)
                .then(res => res.json())
                .then(data => {
                    if (data && data.title) {
                        const directPost = {
                            id: `community-${targetRawId}`,
                            rawId: targetRawId,
                            isSSG: false,
                            title: data.title,
                            writer: data.author,
                            views: data.views || 1,
                            comment_count: data.comment_count || 0,
                            date: data.created_at ? data.created_at.substring(0, 10) : 'Recent',
                            content: data.content
                        };
                        setSelectedPost(directPost);
                    }
                })
                .catch(() => { });
        }

        const handleStorageChange = () => {
            loadCommunityPosts();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handlePostCreated = (newPost) => {
        const cleanId = String(newPost.id || Date.now()).replace(/^community-/, '');
        const formatted = {
            id: `community-${cleanId}`,
            rawId: cleanId,
            isSSG: false,
            title: newPost.title,
            writer: newPost.author,
            password: newPost.password,
            views: 1,
            comment_count: 0,
            date: newPost.created_at ? newPost.created_at.substring(0, 10) : 'Recent',
            content: newPost.content
        };
        const updated = [formatted, ...communityPosts.filter(p => p.id !== formatted.id)];
        setCommunityPosts(updated);
        localStorage.setItem('community_posts', JSON.stringify(updated));

        setTimeout(() => {
            loadCommunityPosts();
        }, 500);
    };

    const handleOpenPost = (post) => {
        const newViews = incrementViewCount(post.id, post.views || 1);
        const updatedPost = { ...post, views: newViews };

        if (post.isSSG) {
            setSelectedPost(updatedPost);
            if (post.slug) {
                window.history.pushState({}, '', `/devlog/${post.slug}`);
            }
        } else {
            setCommunityPosts(prev => prev.map(p => p.id === post.id ? updatedPost : p));
            setSelectedPost(updatedPost);

            const rawId = post.rawId || String(post.id).replace(/^community-/, '');
            if (rawId) {
                // Update URL to /post/:id so AdSense crawler and direct visitors get full Edge SSR HTML
                window.history.pushState({}, '', `/post/${rawId}`);
                try {
                    fetch(`/api/posts/${rawId}`).catch(() => { });
                } catch (e) { }
            }
        }
    };

    const handleClosePost = () => {
        setSelectedPost(null);
        window.history.pushState({}, '', '/devlog');
    };

    const handleDeletePost = async () => {
        if (!deleteModal.password.trim()) {
            setDeleteError('비밀번호를 입력해 주세요.');
            return;
        }

        const target = communityPosts.find(p => p.id === deleteModal.postId);
        const rawId = target ? (target.rawId || String(deleteModal.postId).replace(/^community-/, '')) : deleteModal.postId;

        try {
            const res = await fetch(`/api/posts/${rawId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: deleteModal.password.trim() })
            });

            if (res.status === 403) {
                setDeleteError('비밀번호가 일치하지 않습니다.');
                return;
            }
        } catch (e) {
            if (target && target.password && target.password !== deleteModal.password.trim()) {
                setDeleteError('비밀번호가 일치하지 않습니다.');
                return;
            }
        }

        const updated = communityPosts.filter(p => p.id !== deleteModal.postId);
        setCommunityPosts(updated);
        localStorage.setItem('community_posts', JSON.stringify(updated));

        if (selectedPost && selectedPost.id === deleteModal.postId) {
            handleClosePost();
        }
        setDeleteModal({ open: false, postId: null, password: '' });
        setDeleteError('');
    };

    // Combine preserved articles + community posts in one unified list (Latest First)
    const parseDateScore = (post) => {
        if (!post) return 0;
        if (!post.isSSG && post.rawId) {
            const numericId = Number(post.rawId);
            if (!isNaN(numericId) && numericId > 10000000) {
                return numericId; // Timestamp ID
            }
        }
        const cleanDate = String(post.date || '').replace(/\./g, '-').replace(/\s+/g, '').replace(/-+$/, '');
        const timestamp = new Date(cleanDate).getTime();
        return isNaN(timestamp) ? 0 : timestamp;
    };

    const allUnifiedPosts = [...communityPosts, ...staticPosts].sort((a, b) => {
        const scoreA = parseDateScore(a);
        const scoreB = parseDateScore(b);
        return scoreB - scoreA;
    });

    const filteredPosts = allUnifiedPosts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.writer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage) || 1;

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-brand-accent selection:text-white pb-20 pt-6 px-4 lg:px-8">
            <div className="mx-auto max-w-5xl">

                {/* Header Sequence */}
                <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-800 pb-6">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
                            <FileText className="text-brand-accent" size={36} />
                            ant@IT 통합 게시판
                        </h1>
                        <p className="mt-2 text-slate-400 text-sm">IT 정보, 기술 지식, 개발 가이드 및 자유 커뮤니티 공간</p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={() => setIsWriteModalOpen(true)}
                            className="bg-brand-accent hover:bg-brand-highlight text-white font-extrabold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-brand-accent/30 w-full md:w-auto text-base transform hover:scale-105"
                        >
                            <PenTool size={18} />
                            글쓰기
                        </button>
                    </div>
                </div>

                {/* Search Bar & Total Stats */}
                <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50">
                    <div className="text-sm font-semibold text-slate-300">
                        전체 게시글 <span className="text-brand-highlight font-bold font-mono">{filteredPosts.length}</span> 개
                    </div>

                    <div className="relative w-full sm:w-72">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-500" />
                        </div>
                        <input
                            type="text"
                            placeholder="제목 또는 작성자 검색..."
                            className="block w-full pl-9 pr-3 py-2 border border-slate-700 rounded-xl bg-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-brand-accent"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                </div>

                {/* Unified Dashboard Table */}
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-700/50">
                            <thead className="bg-slate-800/80">
                                <tr>
                                    <th scope="col" className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider w-20">구분</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">제목</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider w-36">작성자</th>
                                    <th scope="col" className="px-4 py-4 text-center text-xs font-semibold text-slate-300 uppercase tracking-wider w-24">조회수</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider w-32">작성일</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50 bg-slate-800/30">
                                {currentPosts.length > 0 ? (
                                    currentPosts.map((post) => {
                                        const cCount = getCommentCount(post);

                                        return (
                                            <tr key={post.id} className="hover:bg-slate-700/40 transition-colors">
                                                <td className="px-5 py-4 whitespace-nowrap text-xs">
                                                    {post.isSSG ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                                            <Sparkles size={10} /> 아티클
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                            <MessageSquare size={10} /> 게시글
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium">
                                                    <div className="flex items-center gap-2">
                                                        {post.isSSG ? (
                                                            <Link to={`/devlog/${post.slug}`} className="text-white hover:text-brand-accent transition-colors block">
                                                                {post.title}
                                                            </Link>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleOpenPost(post)}
                                                                className="text-white hover:text-brand-accent transition-colors text-left font-semibold block"
                                                            >
                                                                {post.title}
                                                            </button>
                                                        )}

                                                        {/* Comment Badge */}
                                                        {cCount > 0 && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-brand-accent/20 text-brand-highlight border border-brand-accent/30 shadow-sm">
                                                                <MessageSquare size={10} />
                                                                {cCount}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                                                    {post.writer}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-xs text-slate-400 text-center">
                                                    <span className="inline-flex items-center gap-1 text-slate-400 font-mono">
                                                        <Eye size={12} className="text-slate-500" />
                                                        {post.views || 1}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400 font-mono">
                                                    {formatDate(post.date)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500 text-sm">
                                            게시글이 없습니다. [글쓰기] 버튼을 눌러 첫 번째 글을 등록해 보세요!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-between border-t border-slate-800 pt-6">
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-slate-400">
                                    Showing <span className="font-medium text-white">{indexOfFirstPost + 1}</span> to <span className="font-medium text-white">{Math.min(indexOfLastPost, filteredPosts.length)}</span> of <span className="font-medium text-white">{filteredPosts.length}</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                    <button
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className={`relative inline-flex items-center rounded-l-md px-2 py-2 border border-slate-700 ${currentPage === 1 ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                        <button
                                            key={number}
                                            onClick={() => paginate(number)}
                                            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border border-slate-700 ${currentPage === number ? 'z-10 bg-brand-accent text-white border-brand-accent' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                                        >
                                            {number}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => paginate(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className={`relative inline-flex items-center rounded-r-md px-2 py-2 border border-slate-700 ${currentPage === totalPages ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Write Modal */}
            <BoardWriteModal
                isOpen={isWriteModalOpen}
                onClose={() => setIsWriteModalOpen(false)}
                onPostCreated={handlePostCreated}
            />

            {/* Edit Modal */}
            <BoardEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                post={selectedPost}
                onPostUpdated={(updatedPost) => {
                    setSelectedPost(updatedPost);
                    setCommunityPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
                    const local = localStorage.getItem('community_posts');
                    if (local) {
                        try {
                            const parsed = JSON.parse(local);
                            const updatedList = parsed.map(p => p.id === updatedPost.id ? updatedPost : p);
                            localStorage.setItem('community_posts', JSON.stringify(updatedList));
                        } catch (e) { }
                    }
                }}
            />

            {/* Selected Post Detail Modal */}
            {selectedPost && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 md:p-6 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-4xl lg:max-w-5xl w-full p-6 md:p-8 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600">
                        <button
                            onClick={handleClosePost}
                            className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex justify-between items-start mb-4 pr-8">
                            <div>
                                {selectedPost.isSSG ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-2">
                                        <Sparkles size={12} /> 기술 아티클
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
                                        <MessageSquare size={12} /> 자유 게시글
                                    </span>
                                )}
                                <h2 className="text-2xl font-bold text-white leading-tight">{selectedPost.title}</h2>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-xs text-slate-400 border-b border-slate-700/60 pb-4 mb-6">
                            <div className="flex items-center gap-4">
                                <span>작성자: <strong className="text-white">{selectedPost.writer}</strong></span>
                                <span className="flex items-center gap-1 text-slate-400"><Eye size={12} /> {selectedPost.views || 1}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-mono">{formatDate(selectedPost.date)}</span>
                                {!selectedPost.isSSG && (
                                    <>
                                        <button
                                            onClick={() => setIsEditModalOpen(true)}
                                            className="text-slate-400 hover:text-brand-accent transition-colors flex items-center gap-1 font-semibold"
                                        >
                                            <Edit3 size={12} /> 수정
                                        </button>
                                        <button
                                            onClick={() => setDeleteModal({ open: true, postId: selectedPost.id, password: '' })}
                                            className="text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1"
                                        >
                                            <Trash2 size={12} /> 삭제
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Post Content Box with Dedicated Vertical Scrollbar */}
                        <div className="prose prose-invert prose-slate max-w-none text-slate-200 text-sm leading-relaxed mb-8 bg-slate-900/60 p-5 rounded-xl border border-slate-700/50 prose-img:rounded-xl prose-img:max-h-[600px] prose-img:mx-auto max-h-[65vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 shadow-inner">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                urlTransform={(url) => url}
                                components={{
                                    table: ({ node, ...props }) => (
                                        <div className="overflow-x-auto my-6 rounded-xl border border-slate-700/60 shadow-xl bg-slate-800/40">
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
                                    ),
                                    a: ({ node, href, children, ...props }) => (
                                        <a
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                window.open(href, '_blank', 'width=1024,height=800,scrollbars=yes,resizable=yes');
                                            }}
                                            className="text-brand-highlight underline hover:text-brand-accent transition-colors font-semibold cursor-pointer"
                                            title="클릭 시 새 창(사이즈 조절 가능)에서 연결됩니다"
                                            {...props}
                                        >
                                            {children}
                                        </a>
                                    )
                                }}
                            >
                                {selectedPost.content ? selectedPost.content.replace(/(^|[\s\n])(https?:\/\/[^\s\n\)<>]+)/g, '$1[$2]($2)') : ''}
                            </ReactMarkdown>
                        </div>

                        {/* Integrated Real-time Comments */}
                        <CommentSection postId={selectedPost.id} />
                    </div>
                </div>
            )}

            {/* Post Delete Password Modal */}
            {deleteModal.open && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                        <h4 className="text-lg font-bold text-white mb-2">게시글 삭제</h4>
                        <p className="text-xs text-slate-400 mb-4">게시글 작성 시 설정한 비밀번호를 입력하세요.</p>

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
                                onClick={() => setDeleteModal({ open: false, postId: null, password: '' })}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-lg transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleDeletePost}
                                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors"
                            >
                                삭제하기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DevLogList;

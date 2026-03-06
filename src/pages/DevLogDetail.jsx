import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Calendar, User } from 'lucide-react';

function DevLogDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            setLoading(true);
            try {
                // Read all markdown files
                const markdownFiles = import.meta.glob('../content/devlog/*.md', { query: '?raw', import: 'default' });

                const decodedSlug = decodeURIComponent(slug);
                const targetPath = `../content/devlog/${decodedSlug}.md`;

                if (markdownFiles[targetPath]) {
                    const content = await markdownFiles[targetPath]();

                    // Simple custom frontmatter parser
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

                    setPost({
                        title: data.title || 'Untitled',
                        writer: data.writer || 'Anonymous',
                        date: data.date || 'Unknown Date',
                        content: markdownContent
                    });
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error("Error loading devlog detail:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-accent"></div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center">
                <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
                <p className="text-slate-400 mb-8">The devlog post you're looking for doesn't exist.</p>
                <button
                    onClick={() => navigate('/devlog')}
                    className="bg-brand-accent hover:bg-brand-highlight text-white font-bold py-2 px-6 rounded-full flex items-center gap-2 transition-all shadow-lg"
                >
                    <ArrowLeft size={16} /> Let's go back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-brand-accent selection:text-white py-12 px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <Link to="/devlog" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-brand-accent transition-colors mb-8 group">
                    <ArrowLeft size={16} className="mr-2 transform group-hover:-translate-x-1 transition-transform" />
                    Back to DevLog List
                </Link>

                <article className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 md:p-10 shadow-2xl backdrop-blur-sm">
                    <header className="mb-10 text-center border-b border-slate-700/50 pb-8">
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
                            {post.title}
                        </h1>
                        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
                            <div className="flex items-center gap-2">
                                <User size={16} className="text-brand-accent" />
                                <span>{post.writer}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-brand-accent" />
                                <span>{post.date}</span>
                            </div>
                        </div>
                    </header>

                    <div className="prose prose-invert prose-slate max-w-none prose-a:text-brand-accent hover:prose-a:text-brand-highlight prose-img:rounded-xl">
                        <ReactMarkdown>
                            {post.content}
                        </ReactMarkdown>
                    </div>
                </article>
            </div>
        </div>
    );
}

export default DevLogDetail;

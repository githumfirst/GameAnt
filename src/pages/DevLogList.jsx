import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, FileText } from 'lucide-react';

function DevLogList() {
    const [posts, setPosts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 10;

    useEffect(() => {
        const fetchPosts = async () => {
            // Use Vite's import.meta.glob with raw query to get markdown content as string
            const markdownFiles = import.meta.glob('../content/devlog/*.md', { query: '?raw', import: 'default' });
            const loadedPosts = [];

            for (const path in markdownFiles) {
                const content = await markdownFiles[path]();

                // Parse frontmatter
                try {
                    // Simple custom frontmatter parser for browser compatibility
                    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
                    const match = content.match(frontmatterRegex);

                    let data = {};
                    let markdownContent = content;

                    if (match) {
                        const yamlString = match[1];
                        markdownContent = match[2];

                        // Parse basic YAML key-value pairs
                        yamlString.split('\n').forEach(line => {
                            const [key, ...valueParts] = line.split(':');
                            if (key && valueParts.length > 0) {
                                // Clean up quotes and trailing whitespace
                                let val = valueParts.join(':').trim();
                                val = val.replace(/^["'](.*)["']$/, '$1');
                                data[key.trim()] = val;
                            }
                        });
                    }

                    // Extract slug from filename
                    const fileName = path.split('/').pop();
                    const slug = fileName.replace('.md', '');

                    loadedPosts.push({
                        slug,
                        title: data.title || 'Untitled',
                        writer: data.writer || 'Anonymous',
                        date: data.date || 'Unknown Date',
                        content: markdownContent
                    });
                } catch (err) {
                    console.error('Error parsing markdown:', path, err);
                }
            }

            // Sort by date descending
            loadedPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
            setPosts(loadedPosts);
        };

        fetchPosts();
    }, []);

    // Filter by search term
    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination logic
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage) || 1;

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-brand-accent selection:text-white pb-20 pt-10 px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
                {/* Header Sequence */}
                <div className="mb-10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
                            <FileText className="text-brand-accent" size={36} />
                            DevLog
                        </h1>
                        <p className="mt-2 text-slate-400 text-sm">Development updates, game patches, and behind-the-scenes.</p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-72">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-500" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search posts by title..."
                            className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-lg bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1); // Reset to first page on search
                            }}
                        />
                    </div>
                </div>

                {/* Dashboard Table */}
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-700/50">
                            <thead className="bg-slate-800/80">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider w-16">No.</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Title</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider w-40">Writer</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider w-40">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50 bg-slate-800/30">
                                {currentPosts.length > 0 ? (
                                    currentPosts.map((post, index) => (
                                        <tr key={post.slug} className="hover:bg-slate-700/40 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                {indexOfFirstPost + index + 1}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium">
                                                <Link to={`/devlog/${post.slug}`} className="text-white hover:text-brand-accent transition-colors block">
                                                    {post.title}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                                {post.writer}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                                {post.date}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                            No posts found matching your search.
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
                        <div className="flex flex-1 justify-between sm:hidden">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${currentPage === 1 ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${currentPage === totalPages ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                            >
                                Next
                            </button>
                        </div>
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
                                        <span className="sr-only">Previous</span>
                                        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
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
                                        <span className="sr-only">Next</span>
                                        <ChevronRight className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}

                {/* Home Return */}
                <div className="mt-12 text-center">
                    <Link to="/" className="text-sm text-slate-400 hover:text-white transition-colors">
                        &larr; Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default DevLogList;

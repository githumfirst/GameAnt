export async function onRequestGet(context) {
    const { params, env } = context;
    const postId = params.id;

    let title = "ant@IT 게시글";
    let author = "NolGaeMi";
    let date = "2026-08-01";
    let content = "게시글 내용을 불러오고 있습니다.";
    let views = 1;

    // Check DB first if binding exists
    if (env && env.DB) {
        try {
            await env.DB.prepare("UPDATE posts SET views = COALESCE(views, 0) + 1 WHERE id = ?").bind(postId).run();
            const dbPost = await env.DB.prepare("SELECT id, title, author, content, COALESCE(views, 0) AS views, created_at FROM posts WHERE id = ?").bind(postId).first();
            if (dbPost) {
                title = dbPost.title;
                author = dbPost.author;
                content = dbPost.content;
                views = dbPost.views || 1;
                date = dbPost.created_at ? dbPost.created_at.substring(0, 10) : date;
            }
        } catch (e) {
            console.error("D1 Fetch Error:", e);
        }
    }

    const parsedContentHtml = renderMarkdownToHtml(content);

    // Build complete, crawler-friendly HTML string on Cloudflare Edge
    const html = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)} - ant@IT</title>
    <meta name="description" content="${escapeHtml(content.substring(0, 150))}" />
    <meta property="og:title" content="${escapeHtml(title)} - ant@IT" />
    <meta property="og:description" content="${escapeHtml(content.substring(0, 150))}" />
    <link rel="stylesheet" crossorigin href="/assets/index-BLyDXJJX.css">
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3130573171479694" crossorigin="anonymous"></script>
</head>
<body class="bg-gray-900 text-white">
    <div id="root">
        <div class="min-h-screen bg-slate-900 text-white font-sans py-12 px-6 lg:px-8">
            <div class="max-w-3xl mx-auto">
                <a class="inline-flex items-center text-sm font-medium text-slate-400 hover:text-brand-accent mb-8" href="/">&larr; ant@IT 메인 게시판으로 돌아가기</a>
                <article class="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 md:p-10 shadow-2xl">
                    <header className="mb-10 text-center border-b border-slate-700/50 pb-8">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-4 leading-tight">${escapeHtml(title)}</h1>
                        <div className="flex justify-center gap-6 text-sm text-slate-400">
                            <span>작성자: <strong className="text-white">${escapeHtml(author)}</strong></span>
                            <span>조회수: ${views}</span>
                            <span>작성일: ${date}</span>
                        </div>
                    </header>
                    <div className="prose prose-invert max-w-none text-slate-200 text-base leading-relaxed mt-8">
                        ${parsedContentHtml}
                    </div>
                </article>
            </div>
        </div>
    </div>
    <script type="module" crossorigin src="/assets/index-DkEiuEm5.js"></script>
</body>
</html>`;

    return new Response(html, {
        headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "public, max-age=60, s-maxage=3600"
        }
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function renderMarkdownToHtml(text) {
    if (!text) return '';
    let escaped = escapeHtml(text);

    // Convert markdown images ![alt](src) into <img> tags
    escaped = escaped.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, src) => {
        return `<img src="${src}" alt="${alt}" class="rounded-xl my-6 max-w-full shadow-xl mx-auto block" />`;
    });

    // Auto convert plain URLs into <a> tags with resizable popup open window handler
    escaped = escaped.replace(/(^|[\s\n])(https?:\/\/[^\s\n\)<>]+)/g, (match, prefix, url) => {
        return `${prefix}<a href="${url}" target="_blank" rel="noopener noreferrer" onclick="window.open(this.href, '_blank', 'width=1024,height=800,scrollbars=yes,resizable=yes'); return false;" class="text-sky-400 underline font-semibold cursor-pointer">${url}</a>`;
    });

    // Parse Markdown tables (| col1 | col2 |) into styled HTML tables
    escaped = escaped.replace(/((?:\|[^\n]+\|\r?\n)+)/g, (match) => {
        const lines = match.trim().split(/\r?\n/);
        if (lines.length < 2) return match;

        let tableHtml = '<div class="overflow-x-auto my-6 rounded-xl border border-slate-700/60 shadow-xl bg-slate-800/40"><table class="min-w-full divide-y divide-slate-700/60 text-left text-sm">';
        
        // Header
        const headerCells = lines[0].split('|').slice(1, -1).map(c => c.trim());
        tableHtml += '<thead class="bg-slate-800/90 text-amber-400 font-extrabold text-xs tracking-wider border-b border-slate-700"><tr>';
        headerCells.forEach(cell => {
            tableHtml += `<th class="px-4 py-3 border-r border-slate-700/40 last:border-r-0">${cell}</th>`;
        });
        tableHtml += '</tr></thead><tbody class="divide-y divide-slate-700/50 bg-slate-900/30">';

        // Skip separator line (lines[1])
        const startRow = lines[1] && lines[1].includes('---') ? 2 : 1;

        for (let i = startRow; i < lines.length; i++) {
            const dataCells = lines[i].split('|').slice(1, -1).map(c => c.trim());
            tableHtml += '<tr class="hover:bg-slate-700/30 transition-colors">';
            dataCells.forEach(cell => {
                tableHtml += `<td class="px-4 py-3 text-slate-300 border-r border-slate-700/30 last:border-r-0">${cell}</td>`;
            });
            tableHtml += '</tr>';
        }

        tableHtml += '</tbody></table></div>';
        return tableHtml;
    });

    // Convert newlines to paragraphs
    const paragraphs = escaped.split('\n\n').map(p => `<p class="mb-4 leading-relaxed">${p.replace(/\n/g, '<br/>')}</p>`);
    return paragraphs.join('');
}

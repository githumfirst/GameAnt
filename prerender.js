import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toAbs = (p) => path.resolve(__dirname, p);

function getPageMeta(url, games, devlogDir) {
    let title = 'ant@IT - IT 정보, 기술 지식, 코딩 & AI 웹사이트';
    let description = 'ant@IT IT 정보, 개발 지식, 코딩, AI 지식을 의미있게 공유하는 통합 IT 커뮤니티 및 플레이그라운드 공간입니다.';

    if (url.startsWith('/play/')) {
        const gameId = url.replace('/play/', '');
        const game = games.find(g => g.id === gameId);
        if (game) {
            title = `${game.title} | ant@IT 게임 플레이그라운드`;
            description = (game.long_description || game.description || `${game.title} - 정교한 알고리즘과 재미를 선사하는 게임 ant@IT`).substring(0, 160);
        }
    } else if (url.startsWith('/devlog/')) {
        const slug = url.replace('/devlog/', '');
        const mdPath = path.join(devlogDir, `${slug}.md`);
        let articleSnippet = '';

        if (fs.existsSync(mdPath)) {
            const rawMd = fs.readFileSync(mdPath, 'utf-8');
            // Clean markdown headings & extract snippet for meta description
            articleSnippet = rawMd.replace(/#+\s*/g, '').replace(/!\[.*?\]\(.*?\)/g, '').replace(/\[(.*?)\]\(.*?\)/g, '$1').substring(0, 150).trim();
        }

        title = `${slug.replace(/_/g, ' ')} | ant@IT 개발 로그`;
        description = articleSnippet || `${slug} 관련 최신 IT 개발 정보 및 기술 아티클입니다.`;
    } else if (url === '/devlog') {
        title = 'ant@IT 통합 IT 게시판 & 지식 데이터베이스';
        description = 'IT 개발 지식, 코딩 팁, 자바스크립트 및 온라인 커뮤니티 자유 게시판입니다.';
    }

    return { title, description };
}

async function prerender() {
    const template = fs.readFileSync(toAbs('dist/index.html'), 'utf-8');
    const { render } = await import('./dist-ssr/entry-server.js');

    // 1. Static Routes
    const routesToRender = ['/', '/devlog'];

    // 2. Add All DevLog slugs dynamically from src/content/devlog/*.md
    const devlogDir = toAbs('src/content/devlog');
    if (fs.existsSync(devlogDir)) {
        const devlogFiles = fs.readdirSync(devlogDir);
        devlogFiles.forEach((file) => {
            if (file.endsWith('.md')) {
                const slug = file.replace('.md', '');
                routesToRender.push(`/devlog/${slug}`);
            }
        });
    }

    // 3. Load games JSON
    let games = [];
    const gamesJsonPath = toAbs('public/data/games.json');
    if (fs.existsSync(gamesJsonPath)) {
        try {
            games = JSON.parse(fs.readFileSync(gamesJsonPath, 'utf-8'));
            games.forEach((game) => {
                if (game.id) {
                    routesToRender.push(`/play/${game.id}`);
                }
            });
        } catch (e) {
            console.warn('Failed to parse games.json for SSG:', e);
        }
    }

    console.log(`[SSG Prerender] Pre-rendering ${routesToRender.length} routes...`);

    for (const url of routesToRender) {
        try {
            const { html: appHtml } = render(url);
            const { title, description } = getPageMeta(url, games, devlogDir);

            let html = template.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

            // Inject unique <title>
            html = html.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);

            // Inject unique <meta name="description"> and OpenGraph tags into <head>
            const metaTagHtml = `
    <title>${title}</title>
    <meta name="description" content="${description.replace(/"/g, '&quot;')}" />
    <meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />
    <meta property="og:description" content="${description.replace(/"/g, '&quot;')}" />
    <meta property="og:type" content="website" />
`;

            html = html.replace(/<title>.*?<\/title>/i, metaTagHtml.trim());

            const filePath = url === '/' ? 'dist/index.html' : `dist${url}/index.html`;
            const dirPath = path.dirname(toAbs(filePath));

            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }

            fs.writeFileSync(toAbs(filePath), html, 'utf-8');
            console.log(`  ✓ Pre-rendered with SEO: ${url} -> ${filePath}`);
        } catch (err) {
            console.error(`  ✗ Error rendering ${url}:`, err);
        }
    }

    console.log('[SSG Prerender] Static site generation & SEO Meta Injection complete!');
}

prerender();

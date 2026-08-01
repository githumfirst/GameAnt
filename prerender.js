import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toAbs = (p) => path.resolve(__dirname, p);

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

  // 3. Add All Game play routes dynamically from public/data/games.json
  const gamesJsonPath = toAbs('public/data/games.json');
  if (fs.existsSync(gamesJsonPath)) {
    try {
      const games = JSON.parse(fs.readFileSync(gamesJsonPath, 'utf-8'));
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

      const html = template.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

      const filePath = url === '/' ? 'dist/index.html' : `dist${url}/index.html`;
      const dirPath = path.dirname(toAbs(filePath));

      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      fs.writeFileSync(toAbs(filePath), html, 'utf-8');
      console.log(`  ✓ Pre-rendered: ${url} -> ${filePath}`);
    } catch (err) {
      console.error(`  ✗ Error rendering ${url}:`, err);
    }
  }

  console.log('[SSG Prerender] Static site generation complete!');
}

prerender();

// Draws the link preview image (1200x630) for each template's own page:
// public/assets/og/<key>.jpg, shown when /t/<key> is shared.
//
//   node scripts/make-og-images.mjs            every template
//   node scripts/make-og-images.mjs ghost      just these keys
//
// Run it after adding a template or changing how one looks, and commit the
// images. It needs Playwright with Chromium (not a dependency of this repo;
// it is preinstalled in Claude Code cloud sessions).
//
// Where Google Fonts and cdnjs are blocked (those cloud sessions), install
// local copies somewhere outside the repo and point OG_LOCAL_NPM at that
// node_modules folder, or the pages are drawn in fallback fonts:
//   npm i @fontsource/vt323 @fontsource/cinzel @fontsource/rock-salt @fortawesome/fontawesome-free@6.4.0
import http from 'node:http';
import { createRequire } from 'node:module';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { templateOrder } from '../public/js/templates/order.js';
import { templateMeta, escapeHtml } from '../public/js/templates/meta.js';

const { chromium } = createRequire(import.meta.url)('playwright');
const root = new URL('..', import.meta.url).pathname;
const pub = join(root, 'public');
const outDir = join(pub, 'assets/og');
const localNpm = process.env.OG_LOCAL_NPM;
const wanted = process.argv.slice(2);
const keys = (wanted.length ? wanted : templateOrder).filter((k) => templateMeta[k] && !templateMeta[k].noOgImage);

const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = http.createServer((req, res) => {
  const path = new URL(req.url, 'http://x').pathname;
  const file = join(pub, path === '/' ? 'index.html' : path);
  if (!file.startsWith(pub) || !existsSync(file)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
  res.end(readFileSync(file));
});
await new Promise((done) => server.listen(0, done));
const base = `http://localhost:${server.address().port}`;

async function useLocalFonts(page) {
  const font = (pkg, file) => `url(http://og-local/@fontsource/${pkg}/files/${file}) format('woff2')`;
  const css = `
    @font-face { font-family: 'VT323'; src: ${font('vt323', 'vt323-latin-400-normal.woff2')}; }
    @font-face { font-family: 'Cinzel'; font-weight: 700; src: ${font('cinzel', 'cinzel-latin-700-normal.woff2')}; }
    @font-face { font-family: 'Rock Salt'; src: ${font('rock-salt', 'rock-salt-latin-400-normal.woff2')}; }`;
  const cors = { 'Access-Control-Allow-Origin': '*' };
  await page.route(/fonts\.googleapis\.com/, (r) => r.fulfill({ contentType: 'text/css', body: css }));
  await page.route(/og-local\//, (r) => r.fulfill({
    contentType: 'font/woff2', headers: cors, body: readFileSync(join(localNpm, new URL(r.request().url()).pathname))
  }));
  await page.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome\/6\.4\.0\//, (r) => {
    const file = new URL(r.request().url()).pathname.split('/6.4.0/')[1];
    r.fulfill({
      contentType: file.endsWith('.css') ? 'text/css' : 'font/woff2', headers: cors,
      body: readFileSync(join(localNpm, '@fortawesome/fontawesome-free', file))
    });
  });
}

function cardHtml(label, sheetPng) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
    * { box-sizing: border-box; margin: 0; }
    body { width: 1200px; height: 630px; overflow: hidden; position: relative;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      font-family: Inter, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Liberation Sans", sans-serif; color: #f1f5f9; }
    .text { position: absolute; left: 64px; top: 64px; bottom: 64px; width: 500px;
      display: flex; flex-direction: column; justify-content: space-between; }
    .brand { font-size: 34px; font-weight: 800; letter-spacing: -0.5px; }
    .brand span { color: #fb7185; }
    .kicker { font: 700 20px/1.3 ui-monospace, "DejaVu Sans Mono", "Liberation Mono", Menlo, Consolas, monospace;
      letter-spacing: 3px; text-transform: uppercase; color: #34d399; margin-bottom: 18px; }
    h1 { font-size: ${label.length > 22 ? 58 : 70}px; line-height: 1.08; font-weight: 800; letter-spacing: -1px; }
    .foot { font-size: 26px; color: #cbd5e1; }
    .sheet { position: absolute; left: 640px; top: 56px; width: 500px; transform: rotate(3deg);
      transform-origin: top left; box-shadow: 0 30px 60px rgba(0,0,0,.55); border-radius: 4px; }
  </style></head><body>
    <div class="text">
      <div class="brand">PaperJammed<span>.net</span></div>
      <div><div class="kicker">Printer test page</div><h1>${escapeHtml(label)}</h1></div>
      <div class="foot">Free to print. Leave it in the tray.</div>
    </div>
    <img class="sheet" src="data:image/png;base64,${sheetPng.toString('base64')}">
  </body></html>`;
}

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1.5 });
if (localNpm) await useLocalFonts(page);
await page.route(/\/api\/|buymeacoffee/, (r) => r.abort());
const card = await browser.newPage({ viewport: { width: 1200, height: 630 } });

for (const key of keys) {
  await page.goto(`${base}/?t=${key}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const sheet = await page.locator('#printSheet').screenshot({ type: 'png' });
  await card.setContent(cardHtml(templateMeta[key].label, sheet), { waitUntil: 'load' });
  await card.screenshot({ path: join(outDir, `${key}.jpg`), type: 'jpeg', quality: 82 });
  console.log(`wrote public/assets/og/${key}.jpg`);
}

await browser.close();
server.close();

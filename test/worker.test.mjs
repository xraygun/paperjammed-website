// The Worker's page routes, run in plain Node with stand-in bindings.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import worker from '../src/index.js';
import { templateOrder } from '../public/js/templates/order.js';

const indexHtml = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');

function makeEnv(kv = {}) {
  const store = new Map(Object.entries(kv));
  return {
    store,
    ASSETS: {
      fetch: async (req) => new URL(req.url).pathname === '/'
        ? new Response(indexHtml, { headers: { 'Content-Type': 'text/html' } })
        : new Response('Not found', { status: 404 })
    },
    DAILY_TEMPLATE: {
      get: async (k) => (store.has(k) ? store.get(k) : null),
      put: async (k, v) => { store.set(k, v); }
    }
  };
}

async function get(path, env = makeEnv()) {
  const pending = [];
  const res = await worker.fetch(new Request(`https://paperjammed.net${path}`), env, { waitUntil: (p) => pending.push(p) });
  await Promise.all(pending);
  return res;
}

test('/t/<key> serves the app with that template\'s own title, canonical and preview image', async () => {
  const res = await get('/t/ghost');
  assert.equal(res.status, 200);
  assert.match(res.headers.get('Content-Type'), /text\/html/);
  const html = await res.text();
  assert.match(html, /<title>Ghost-Buffer Exorcism \| Funny Printer Test Page \| PaperJammed\.net<\/title>/);
  assert.ok(html.includes('<link rel="canonical" href="https://paperjammed.net/t/ghost">'));
  assert.ok(html.includes('<meta property="og:image" content="https://paperjammed.net/assets/og/ghost.jpg">'));
  assert.ok(html.includes('About this test page: Ghost-Buffer Exorcism'));
  // The home page's own head must be gone, not doubled up.
  assert.equal(html.split('<title>').length - 1, 1);
  assert.equal(html.split('rel="canonical"').length - 1, 1);
  // The rest of the app is untouched.
  assert.ok(html.includes('<script type="module" src="/js/app.js"></script>'));
});

test('labels with quotes are escaped in the head', async () => {
  const html = await (await get('/t/alignment')).text();
  assert.ok(html.includes('<title>&quot;Parallel&quot; Alignment Test |'));
  assert.ok(html.includes('content="&quot;Parallel&quot; Alignment Test |'));
});

test('the daily template falls back to the site-wide preview image', async () => {
  const html = await (await get('/t/dailyMystery')).text();
  assert.ok(html.includes('<meta property="og:image" content="https://paperjammed.net/assets/og-image.png">'));
});

test('one address per template: other spellings redirect, unknown keys go home', async () => {
  for (const path of ['/t/GHOST', '/t/ghost/']) {
    const res = await get(path);
    assert.equal(res.status, 301, path);
    assert.equal(res.headers.get('Location'), 'https://paperjammed.net/t/ghost');
  }
  const res = await get('/t/nope');
  assert.equal(res.status, 302);
  assert.equal(res.headers.get('Location'), 'https://paperjammed.net/');
});

test('/sitemap.xml lists the home page and every template page', async () => {
  const res = await get('/sitemap.xml');
  assert.equal(res.status, 200);
  assert.match(res.headers.get('Content-Type'), /xml/);
  const xml = await res.text();
  assert.ok(xml.includes('<loc>https://paperjammed.net/</loc>'));
  for (const key of templateOrder) assert.ok(xml.includes(`<loc>https://paperjammed.net/t/${key}</loc>`), key);
  assert.equal(xml.split('<loc>').length - 1, templateOrder.length + 1);
});

test('a QR scan is counted and lands on the pranked page', async () => {
  const env = makeEnv();
  const res = await get('/Q/GHOST', env);
  assert.equal(res.status, 302);
  assert.equal(res.headers.get('Location'), '/pranked?t=ghost');
  assert.equal(env.store.get('count:scan-ghost'), '1');
});

test('a qr-redirects override still wins over the pranked page', async () => {
  const env = makeEnv({ 'qr-redirects': JSON.stringify({ all: '/promo.html?from={key}' }) });
  const res = await get('/q/ghost', env);
  assert.equal(res.headers.get('Location'), '/promo.html?from=ghost');
  assert.equal(env.store.get('count:scan-ghost'), '1');
});

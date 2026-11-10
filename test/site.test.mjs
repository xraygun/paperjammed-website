// Run with `npm test`. Guards the things that drift quietly: a template added
// without its page text / preview image / footer link, and a class added
// without rebuilding the stylesheet.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { templates, templateOrder } from '../public/js/templates/index.js';
import { templateMeta } from '../public/js/templates/meta.js';

const root = new URL('..', import.meta.url).pathname;
const indexHtml = readFileSync(join(root, 'public/index.html'), 'utf8');

test('every template has page text in meta.js, and nothing extra', () => {
  assert.deepEqual(Object.keys(templateMeta).sort(), [...templateOrder].sort());
  for (const key of templateOrder) {
    assert.equal(templateMeta[key].label, templates[key].label, `${key}: label differs from the template file`);
    assert.ok(templateMeta[key].description.length >= 50, `${key}: description too short`);
    assert.ok(templateMeta[key].description.length <= 170, `${key}: description too long for search results`);
  }
});

test('every template has a link preview image', () => {
  for (const key of templateOrder) {
    if (templateMeta[key].noOgImage) continue;
    assert.ok(existsSync(join(root, `public/assets/og/${key}.jpg`)), `missing public/assets/og/${key}.jpg`);
  }
});

test('index.html links to every template page and keeps the Worker markers', () => {
  for (const key of templateOrder) {
    assert.ok(indexHtml.includes(`href="/t/${key}"`), `footer link to /t/${key} missing`);
  }
  for (const marker of ['<!-- SEO:BEGIN', '<!-- SEO:END -->', '<!-- ABOUT:BEGIN -->', '<!-- ABOUT:END -->']) {
    assert.equal(indexHtml.split(marker).length - 1, 1, `expected exactly one "${marker}"`);
  }
});

test('index.html works when served from /t/<key>: no relative asset paths, no Tailwind CDN', () => {
  assert.ok(!indexHtml.includes('cdn.tailwindcss.com'));
  const local = [...indexHtml.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((u) => !/^(https?:|mailto:|data:|\/|#)/.test(u));
  assert.deepEqual(local, []);
});

test('public/css/tailwind.css is up to date (run `npm run build:css`)', () => {
  const out = join(mkdtempSync(join(tmpdir(), 'pj-css-')), 'tailwind.css');
  execFileSync(
    join(root, 'node_modules/.bin/tailwindcss'),
    ['-c', 'tailwind.config.cjs', '-i', 'tailwind.input.css', '-o', out, '--minify'],
    { cwd: root, stdio: 'pipe' }
  );
  assert.equal(readFileSync(join(root, 'public/css/tailwind.css'), 'utf8'), readFileSync(out, 'utf8'));
});

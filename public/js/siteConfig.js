import qrcode from './lib/qrcode.js';

// Single source of truth for the site's URL. Change it once here and it
// updates everywhere it's used — the shared global footer (index.html /
// app.js) AND any multi-page template that manages its own per-page footer.
export const SITE_URL = 'paperjammed.net';

// Ready-to-drop-in footer line for multi-page templates.
//
// Why this exists: single-page templates get the URL for free via the
// shared #globalFooterContainer in index.html, because app.js only hides
// that container when a template sets `multiPage: true`. Multi-page
// templates render their own footer per page, so they need to explicitly
// include this snippet on any content-bearing page.
//
// Don't add this to intentionally-blank filler pages (e.g. trayfeed's pages
// 2+, certificate's page 2) — those are supposed to print 100% blank.
export function siteFooterLine(label = '') {
  return `<span class="text-[9px] text-slate-400 font-sans font-bold uppercase tracking-wider">${SITE_URL}${label ? ' — ' + label : ''}</span>`;
}

// ----------------------------------------------------------------------------
// Per-template QR code, printed next to the site URL.
// ----------------------------------------------------------------------------
// Each template gets its own code pointing at /q/<key>. The Worker counts
// the scan for that template and redirects to /?t=<key>, which opens the
// same template. Drawn here as inline SVG (lib/qrcode.js is a vendored copy
// of the MIT "qrcode-generator" package), so there's no third-party request.
//
// The URL is upper-cased so it fits QR "alphanumeric" mode: a smaller code
// with bigger dots for the same 18mm, which cheap printers render more
// reliably. The Worker matches /Q/<KEY> case-insensitively.

const QR_SIZE = '18mm';
const QR_QUIET_MODULES = 4; // white margin scanners need, in QR "dots"
const qrCache = new Map();

export function qrUrl(templateKey) {
  return `https://${SITE_URL}/q/${templateKey}`;
}

export function siteQr(templateKey) {
  if (!qrCache.has(templateKey)) {
    const qr = qrcode(0, 'M');
    qr.addData(qrUrl(templateKey).toUpperCase(), 'Alphanumeric');
    qr.make();
    const n = qr.getModuleCount();
    const size = n + 2 * QR_QUIET_MODULES;
    let path = '';
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (qr.isDark(r, c)) path += `M${c + QR_QUIET_MODULES} ${r + QR_QUIET_MODULES}h1v1h-1z`;
      }
    }
    qrCache.set(templateKey,
      `<svg class="site-qr" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${QR_SIZE}" height="${QR_SIZE}" shape-rendering="crispEdges" role="img" aria-label="QR code: ${qrUrl(templateKey)}" style="display:block; flex:none; background:#fff; position:relative; z-index:10;"><rect width="${size}" height="${size}" fill="#fff"/><path fill="#000" d="${path}"/></svg>`
    );
  }
  return qrCache.get(templateKey);
}

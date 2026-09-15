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

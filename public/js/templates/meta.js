// Search/share text for each template's own page (/t/<key>), kept in its own
// file with no imports so the Worker (src/index.js) can read it too. The
// Worker must never load the template files themselves.
//
// `label` must match the template file's label (test/site.test.mjs checks).
// `description` is the one or two sentences shown in search results, link
// previews and the sidebar's "About this test page" box: say what prints.
// Each key also needs a link preview image at public/assets/og/<key>.jpg,
// unless it sets `noOgImage: true` (then the site-wide image is used).
export const templateMeta = {
  jamRemover: {
    label: 'Printer Jam Remover 2.0',
    description: 'A printer test page with actual jam on it. Pick the toast crispness, the jam flavor and how far it drips, then print the evidence.'
  },
  trayfeed: {
    label: 'Tray Feed Stress Test',
    description: 'Stress-test a paper tray: page 1 prints the instructions, then 2 to 100 completely blank sheets follow. A real feed test and a quiet office prank.'
  },
  kiss: {
    label: 'K-I-S-S IT Checkbox',
    description: 'The minimal, ink-saving printer test page: one header and one checkbox asking whoever finds it to return it to the IT department.'
  },
  ghost: {
    label: 'Ghost-Buffer Exorcism',
    description: 'A printer test page that performs an exorcism: pseudo-Latin chants, a warding sigil and an official certificate of poltergeist removal.'
  },
  certificate: {
    label: 'Installation Certificate',
    description: 'An official-looking installation certificate listing the new printer\'s quirks, followed by one extra, completely blank page.'
  },
  pcloadletter: {
    label: 'PC LOAD LETTER',
    description: 'The classic PC LOAD LETTER error as a big dot-matrix style printer test page, a throwback inspired by Office Space (1999).'
  },
  recipe: {
    label: 'Toner Soup Recipe',
    description: 'A printer test page disguised as an official recipe card for toner soup, with thoroughly chaotic ingredients.'
  },
  technobabble: {
    label: 'Technobabble Report',
    description: 'A serious-looking printer calibration report packed with absurd futuristic IT jargon. It looks legit until someone reads it.'
  },
  allyourbase: {
    label: 'All Your Base',
    description: 'A CATS system transmission log and printer diagnostic override. All your base are belong to this printer test page.'
  },
  alignment: {
    label: '"Parallel" Alignment Test',
    description: 'A printer alignment test page that claims to check straight, parallel lines, while the lines clearly cross and curve.'
  },
  invoice: {
    label: 'Mail Order Livestock Receipt',
    description: 'A shipping confirmation for one (1) live animal the recipient never ordered. Choose the animal, the recipient and the address, then print.'
  },
  spaceball: {
    label: 'Spaceball One',
    description: 'A high-speed printer test page with CMYK color bars, a Ludicrous Speed status log and an abrupt transition to plaid.'
  },
  dailyMystery: {
    label: 'Temple of Unhinged Testpages',
    description: 'A different printer test page every day: a deadpan official report on a printer malfunction, with a slider that takes it from mild to unhinged.',
    noOgImage: true
  }
};

// Shared wording, so the page a crawler gets and the page app.js draws match.
export const SITE_NAME = 'PaperJammed.net';

export function templatePageTitle(key) {
  return `${templateMeta[key].label} | Funny Printer Test Page | ${SITE_NAME}`;
}

export function templatePath(key) {
  return `/t/${key}`;
}

export function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

// Inner HTML of the sidebar's "About this test page" box (#templateAbout).
export function templateAboutHtml(key) {
  const m = templateMeta[key];
  if (!m) return '';
  return `<h2 class="text-rose-400 font-semibold text-sm">About this test page: ${escapeHtml(m.label)}</h2>` +
    `<p>${escapeHtml(m.description)}</p>` +
    `<p>Free to print, no sign-up. Pick it, hit print and leave it in the tray.</p>`;
}

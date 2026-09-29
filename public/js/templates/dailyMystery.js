// "The One That Keeps Changing" — content is generated once a day by a
// Cloudflare Cron Trigger (see src/index.js `scheduled()`), never by the
// visitor. This file only ever reads the cached result from
// /api/daily-template (wired up in app.js) and renders it — it never
// calls any AI model itself.
//
// state.dailyTemplateData holds whatever the last successful fetch
// returned. DEFAULT_CONTENT below is what renders before that fetch
// completes, or if it 404s because nothing has generated yet.
//
// On top of that static daily text, this template adds a SEPARATE,
// purely visual randomness layer driven by state.dailyHash (a text field
// the visitor can edit or reroll) and state.dailyIntensity (a 0-3 "how
// would you like your template?" slider). The hash seeds a deterministic
// PRNG so the same hash always looks the same; intensity scales how far
// font size / family / border are allowed to drift from normal. This is
// intentionally cosmetic only — the actual text content stays whatever
// the daily generation produced.

const DEFAULT_CONTENT = {
  headline: 'DIAGNOSTIC CONTENT LOADING',
  subheadline: "Today's mystery hasn't printed itself into existence yet.",
  bodyParagraphs: [
    "This template pulls fresh, computer-generated nonsense once a day. If you're seeing this placeholder, either the daily job hasn't run yet or the connection to fetch it failed."
  ],
  bulletPoints: [
    'Reload the page in a moment',
    'Try a different template in the meantime',
    'Yell at the nearest printer for solidarity'
  ],
  footerNote: 'Nothing to see here. Yet.'
};

// Slider labels — also duplicated in app.js's live status-text update.
// Kept as a plain literal rather than a shared export so app.js never has
// to import a specific template file directly (see templates/index.js).
const INTENSITY_LABELS = ['Rare', 'Medium', 'Well Done', 'Cooked'];

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ----------------------------------------------------------------------------
// Deterministic "randomness hash" — same hash + same intensity always
// produces the same look, but any change to either reshuffles it.
// ----------------------------------------------------------------------------
function stringToSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h;
}

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Intensity 0-3 -> how far from baseline the randomized styling drifts.
// Deliberately clamped even at "Cooked" — this still has to survive the
// site's print shrink-to-fit, not go fully unbounded.
const INTENSITY_MULTIPLIER = [0.15, 0.4, 0.7, 1.0];

const FONT_POOL = [
  'inherit',
  "'VT323','Courier New',monospace",
  "'Cinzel','Georgia',serif"
];

const BORDER_STYLES = ['solid', 'dashed', 'dotted', 'double'];

// "Cooked" (intensity 3) extras: a combustion warning banner and a few
// lines of real-looking code spilled onto the page at odd angles. Purely
// decorative — kept inside an overflow:hidden container so it can never
// push layout around (see the Ghost template's old footer-collision bug).
const CODE_SNIPPETS = [
  'for (let i = 0; i < n; i++) {',
  'SELECT * FROM jams WHERE stuck = true;',
  'def combust(): return True',
  "git commit -m 'it works now, do not ask'",
  'sudo rm -rf /toner',
  '0x6A6D0000 <- printer.exe stopped responding',
  'while (true) { jam(); }',
  '// TODO: fix this before it prints',
  'std::cout << "send help" << std::endl;',
  'curl -X POST /api/regret',
  'except Exception: pass  # fine, probably',
  'ERROR 0x00000451: FEELINGS_NOT_FOUND'
];

function computeCookedExtras(hash) {
  const rand = mulberry32(stringToSeed(`${hash == null ? '' : hash}::cooked`));
  const count = 3 + Math.floor(rand() * 3);
  const lines = [];
  for (let i = 0; i < count; i++) {
    lines.push({
      snippet: CODE_SNIPPETS[Math.floor(rand() * CODE_SNIPPETS.length)],
      top: Math.round(rand() * 78) + 6,
      left: Math.round(rand() * 65) + 4,
      rotate: Math.round(rand() * 16 - 8)
    });
  }
  return { lines };
}

function computeRandomStyle(hash, intensityLevel) {
  const seed = stringToSeed(String(hash == null ? '' : hash));
  const rand = mulberry32(seed);
  const m = INTENSITY_MULTIPLIER[intensityLevel] ?? INTENSITY_MULTIPLIER[0];

  // Font scale: centered on 1.0, max ~±15% drift even at full intensity.
  const drift = 1 + (rand() * 2 - 1) * 0.15 * m;
  const fontScale = Math.max(0.9, Math.min(1.15, drift));

  // Font family: low intensity almost always stays default; higher
  // intensity has a real chance of landing on one of the flavor fonts.
  const fontFamily = rand() < 1 - m * 0.8
    ? FONT_POOL[0]
    : FONT_POOL[1 + Math.floor(rand() * (FONT_POOL.length - 1))];

  // Border creeps thicker and weirder with intensity.
  const borderWidth = Math.round(2 + rand() * 2 * m);
  const borderStyle = rand() < m * 0.6
    ? BORDER_STYLES[Math.floor(rand() * BORDER_STYLES.length)]
    : 'solid';

  return { fontScale, fontFamily, borderWidth, borderStyle };
}

export default {
  key: 'dailyMystery',
  label: 'The One That Keeps Changing',
  description: "A brand new nonsense diagnostic sheet, written by a robot, once a day. Nobody knows what it'll say next — including us.",
  icon: 'fa-dice',
  badge: { text: 'DAILY', className: 'bg-fuchsia-500 text-white' },
  borderClasses: 'border-fuchsia-500/50 hover:border-fuchsia-400 bg-fuchsia-950/20 hover:bg-fuchsia-900/30',
  radioAccent: 'accent-fuchsia-500',
  labelTextClass: 'text-fuchsia-300',
  configType: 'bw',
  multiPage: false,

  controlsHtml(state) {
    const hash = state.dailyHash ?? '';
    const intensity = state.dailyIntensity ?? 0;
    const label = INTENSITY_LABELS[intensity] || INTENSITY_LABELS[0];

    return `
      <div class="mt-2 bg-fuchsia-950/30 border border-fuchsia-500/30 rounded-lg p-3 space-y-2.5">
        <div class="flex items-end gap-2">
          <div class="flex-1">
            <label for="dailyHashInput" class="text-[11px] font-bold text-fuchsia-300 uppercase tracking-wider flex items-center gap-1.5">
              <i class="fa-solid fa-hashtag text-fuchsia-400"></i>
              <span>Randomness Hash:</span>
            </label>
            <input type="text" id="dailyHashInput" value="${esc(String(hash))}" oninput="handleDailyHashChange(this.value)"
              class="w-full mt-1 bg-slate-900 border border-fuchsia-500/40 rounded px-2 py-1.5 text-xs font-mono text-fuchsia-100 focus:outline-none focus:border-fuchsia-400">
          </div>
          <button type="button" onclick="handleDailyHashRefresh()" title="Roll a new hash"
            class="shrink-0 bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition">
            <i class="fa-solid fa-dice"></i>
          </button>
        </div>
        <p class="text-[9px] text-fuchsia-300/60 italic">Seeds the page's visual weirdness. Not fully explained or understood.</p>

        <div class="pt-1">
          <label for="dailyIntensityInput" class="text-[11px] font-bold text-fuchsia-300 uppercase tracking-wider block mb-1">How would you like your template?</label>
          <input type="range" id="dailyIntensityInput" min="0" max="3" step="1" value="${intensity}"
            oninput="handleDailyIntensityChange(this.value)"
            class="w-full accent-fuchsia-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer">
          <p id="dailyIntensityStatus" class="text-center text-xs font-mono font-bold text-fuchsia-200 mt-1 uppercase tracking-wider">${label}</p>
          <p id="dailyCookedNote" class="text-[9px] text-red-400 font-bold text-center mt-1" style="display:${intensity === 3 ? 'block' : 'none'};">⚠ Cooked adds a combustion warning &amp; rogue code on the page.</p>
        </div>
      </div>
    `;
  },

  render(state) {
    const c = state.dailyTemplateData || DEFAULT_CONTENT;
    const intensityLevel = state.dailyIntensity ?? 0;
    const style = computeRandomStyle(state.dailyHash, intensityLevel);
    const cooked = intensityLevel === 3 ? computeCookedExtras(state.dailyHash) : null;

    const paragraphs = (c.bodyParagraphs || [])
      .map((p) => `<p class="text-[10px] leading-relaxed text-slate-800 mb-1.5">${esc(p)}</p>`)
      .join('');

    const bullets = (c.bulletPoints || [])
      .map((b) => `<li>${esc(b)}</li>`)
      .join('');

    const warningBanner = cooked
      ? `<div class="border-2 border-red-600 bg-red-50 text-red-700 text-[9px] font-black uppercase tracking-wider text-center py-1 mb-2">⚠ WARNING: THIS PAGE MAY COMBUST IN PRINTER ⚠</div>`
      : '';

    const codeSpill = cooked
      ? cooked.lines
          .map(
            (l) =>
              `<div style="position:absolute; top:${l.top}%; left:${l.left}%; transform:rotate(${l.rotate}deg); font-family:'Courier New',monospace; font-size:7px; line-height:1; color:#15803d; opacity:0.25; white-space:nowrap; pointer-events:none; z-index:0;">${esc(l.snippet)}</div>`
          )
          .join('')
      : '';

    const sheetHtml = `
      <div class="p-3 bg-slate-50 font-mono text-slate-900" style="position:relative; overflow:hidden; border-color:#000; border-style:${style.borderStyle}; border-width:${style.borderWidth}px;">
        ${codeSpill}
        <div style="position:relative; z-index:1; transform: scale(${style.fontScale.toFixed(3)}); transform-origin: top left; width: ${(100 / style.fontScale).toFixed(2)}%; font-family: ${style.fontFamily};">
          ${warningBanner}
          <div class="border-b-4 border-black pb-1 mb-2 text-center">
            <span class="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600 block">AUTOMATED DAILY DIAGNOSTIC — CONTENT MAY VARY WITHOUT WARNING</span>
            <h1 class="text-lg font-black uppercase tracking-widest text-slate-950 my-1 leading-tight">${esc(c.headline)}</h1>
            <p class="text-[10px] italic text-slate-700">${esc(c.subheadline)}</p>
          </div>

          <div class="space-y-1">${paragraphs}</div>

          <div class="my-2 border-2 border-black p-2 bg-white">
            <p class="font-bold uppercase text-[9px] tracking-wider text-center border-b border-black pb-1 mb-1">STATUS CHECKLIST</p>
            <ul class="text-[10px] leading-relaxed text-slate-800 space-y-0.5 pl-4 list-disc">${bullets}</ul>
          </div>

          <div class="border-t-2 border-black mt-2 pt-1 text-[9px] text-slate-800 leading-tight italic">
            ${esc(c.footerNote)}
          </div>
        </div>
      </div>
    `;

    // "Cooked" withholds its own on-screen preview — the actual sheet only
    // renders under @media print (see .print-only in style.css), so the
    // visitor genuinely has to print it to see what happened. The teaser
    // takes the screen slot instead.
    if (!cooked) return sheetHtml;

    const teaser = `
      <div class="no-print flex-1 flex flex-col items-center justify-center text-center gap-3 p-8 min-h-[500px] bg-gradient-to-b from-red-950/40 to-slate-950 border-4 border-dashed border-red-600 rounded-lg">
        <i class="fa-solid fa-skull-crossbones text-5xl text-red-500"></i>
        <p class="text-red-400 font-black uppercase tracking-widest text-sm">Preview Withheld</p>
        <p class="text-fuchsia-200 font-mono text-sm max-w-xs">I guess you'll have to click print to find out&hellip; if you aren't too scared.</p>
        <p class="text-[10px] text-slate-500 italic">(Cooked hides its own preview. The paper won't.)</p>
      </div>
    `;

    return teaser + `<div class="print-only">${sheetHtml}</div>`;
  }
};

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
// the visitor can edit or reroll) and state.dailyIntensity (a continuous
// 0-100 "how would you like your template?" slider — same smooth,
// no-stops feel as the Jam Coverage slider). The hash seeds a
// deterministic PRNG so the same hash always looks the same; intensity
// scales how far font size/family/border/spacing drift from normal, all
// continuously rather than in fixed steps. A few effects are inherently
// on/off rather than gradual (the Cooked-only warning banner, code
// spill, hidden preview) — those switch on together once intensity
// crosses into the top quarter (see intensityBand/isCooked below).
//
// On top of THAT, the daily content can itself contain [[N]] placeholder
// tokens (see the swaps object src/index.js asks the model for) — a
// handful of nouns the model marked as swappable, each with 5 synonym
// options. state.dailySwapIndex (a plain {key: chosenIndex} map app.js
// mutates on a flat 3s timer, picking one random key and bumping it to a
// DIFFERENT index each time) holds which synonym currently shows for
// each slot — independent of the intensity slider, so a word is always
// quietly rotating no matter how the visual weirdness is set.

const DEFAULT_CONTENT = {
  headline: 'DIAGNOSTIC CONTENT LOADING',
  subheadline: "Today's mystery hasn't printed itself into existence yet.",
  bodyParagraphs: [
    "This template pulls fresh nonsense once a day. If you're seeing this placeholder, either the daily job hasn't run yet or the connection to fetch it failed."
  ],
  bulletPoints: [
    'Reload the page in a moment',
    'Try a different template in the meantime',
    'Yell at the nearest printer for solidarity'
  ],
  footerNote: 'Nothing to see here. Yet.',
  swaps: {}
};

// Slider labels — also duplicated in app.js's live status-text update.
// Kept as a plain literal rather than a shared export so app.js never has
// to import a specific template file directly (see templates/index.js).
const INTENSITY_LABELS = ['Rare', 'Medium', 'Well Done', 'Cooked'];

// Maps the continuous 0-100 slider onto the same four named bands for
// display and for the effects that are genuinely on/off rather than
// gradual. Thresholds duplicated in app.js's status-text update.
function intensityBand(pct) {
  if (pct >= 75) return 3;
  if (pct >= 50) return 2;
  if (pct >= 25) return 1;
  return 0;
}
function isCooked(pct) {
  return pct >= 75;
}

// The status readout gets sharper right at the top of the range: Cooked
// still shows through 84%, then "Warning" (shaky red) from 85-99%, then
// "Unhinged" (fades in, dissolves, reappears) right at 100. Both variant
// names double as CSS class suffixes (dm-status-warning/-unhinged) — see
// style.css. Thresholds duplicated in app.js's live status-text update.
function intensityStatus(pct) {
  if (pct >= 100) return { text: 'Unhinged', variant: 'unhinged' };
  if (pct >= 85) return { text: 'Warning', variant: 'warning' };
  return { text: INTENSITY_LABELS[intensityBand(pct)], variant: '' };
}

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

// Replaces every [[N]] token in text with swaps[N][indexMap[N]] — every
// occurrence of the same [[N]] across headline/paragraphs/bullets shows
// the same word, since they all read from the same indexMap entry. A
// token with no matching swaps entry (older cached content, a model
// slip) just disappears rather than leaving a raw [[N]] on the page.
function applySwaps(text, swaps, indexMap) {
  if (!text) return text;
  return String(text).replace(/\[\[(\d+)\]\]/g, (_match, key) => {
    const options = swaps && swaps[key];
    if (!options || !options.length) return '';
    const idx = (indexMap && indexMap[key]) || 0;
    return options[idx % options.length];
  });
}

// Well Done and Cooked don't just look different — the prose itself
// starts visibly breaking down. Runs off plain Math.random() (not the
// hash) on purpose: it's called on every render, so it reshuffles both
// on the 3s word-swap tick AND immediately when the hash/intensity
// controls are touched, rather than sitting fixed between renders.
const GLITCH_CHARS = '#%&*0123456789';

function scrambleWord(word) {
  const chars = word.split('');
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

function glitchInsert(word) {
  const pos = Math.floor(Math.random() * (word.length + 1));
  const ch = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
  return word.slice(0, pos) + ch + word.slice(pos);
}

function mangleText(text, pct) {
  if (!text || pct < 50) return text;
  const mangleChance = ((pct - 50) / 50) * 0.35;
  const glitchChance = pct < 75 ? 0 : ((pct - 75) / 25) * 0.25;

  return text
    .split(' ')
    .map((word) => {
      if (word.length < 3) return word;
      let w = word;
      if (Math.random() < mangleChance) {
        w = Math.random() < 0.5 ? w.split('').reverse().join('') : scrambleWord(w);
      }
      if (glitchChance && Math.random() < glitchChance) {
        w = glitchInsert(w);
      }
      return w;
    })
    .join(' ');
}

// Intensity 0-100 -> how far from baseline the randomized styling drifts,
// continuous rather than four fixed steps. Deliberately clamped even at
// 100 — this still has to survive the site's print shrink-to-fit, not go
// fully unbounded.
function intensityMultiplier(pct) {
  return 0.15 + (pct / 100) * 0.85;
}

const FONT_POOL = [
  'inherit',
  "'VT323','Courier New',monospace",
  "'Cinzel','Georgia',serif"
];

const BORDER_STYLES = ['solid', 'dashed', 'dotted', 'double'];
const ALIGN_POOL = ['center', 'justify'];

// Objects "flying" through the selected sidebar button's black window —
// one more joins every 10% of intensity.
const FLOAT_EMOJI = ['⏰', '🧙', '🐇', '🚽', '🪠', '🔮', '🧦', '🪑'];
function floatCount(pct) {
  return 2 + Math.floor(pct / 10);
}

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

function computeRandomStyle(hash, pct) {
  const seed = stringToSeed(String(hash == null ? '' : hash));
  const rand = mulberry32(seed);
  const m = intensityMultiplier(pct);

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

  // Letter-spacing and paragraph alignment barely move at Rare, but by
  // Cooked the body text visibly sprawls and goes ragged — "ramblings of
  // a printer gone mad" rather than just a slightly bigger font.
  const letterSpacing = +(rand() * 0.14 * m).toFixed(3);
  const textAlign = rand() < m * 0.55 ? ALIGN_POOL[Math.floor(rand() * ALIGN_POOL.length)] : 'left';

  return { fontScale, fontFamily, borderWidth, borderStyle, letterSpacing, textAlign };
}

function starfieldHtml(hash, pct) {
  const count = floatCount(pct);
  // Seeded from the hash alone (not pct): dragging the slider draws more
  // objects from the same sequence rather than reshuffling everyone's
  // position every time the percentage ticks over.
  const rand = mulberry32(stringToSeed(`${hash == null ? '' : hash}::starfield`));

  let floaters = '';
  for (let i = 0; i < count; i++) {
    const emoji = FLOAT_EMOJI[Math.floor(rand() * FLOAT_EMOJI.length)];
    const left = Math.round(rand() * 90) + 5;
    const top = Math.round(rand() * 80) + 8;
    const size = 12 + Math.round(rand() * 10);
    const duration = 9 + Math.round(rand() * 12);
    // Negative delay starts the animation already mid-cycle, so floaters
    // are already in transit on the first frame instead of starting
    // parked at their entry point.
    const negDelay = -Math.round(rand() * duration);

    // Asteroids-style wraparound: travel a straight line from one
    // off-screen edge to the opposite one (a big enough distance that it
    // fully clears the button, not just fades at the border), then snap
    // instantly back to the start and repeat — see the keyframes' 49.9%
    // -> 50% jump in style.css. One random angle per floater, not just
    // horizontal, so they don't all drift the same direction.
    const angle = rand() * Math.PI * 2;
    const dist = 550 + rand() * 250;
    const dx = Math.round(Math.cos(angle) * dist);
    const dy = Math.round(Math.sin(angle) * dist);
    const sx = -Math.round(dx / 2);
    const sy = -Math.round(dy / 2);
    const ex = Math.round(dx / 2);
    const ey = Math.round(dy / 2);

    floaters += `<span class="dm-float" style="left:${left}%; top:${top}%; font-size:${size}px; animation-duration:${duration}s; animation-delay:${negDelay}s; --sx:${sx}%; --sy:${sy}%; --ex:${ex}%; --ey:${ey}%;">${emoji}</span>`;
  }

  return `<div class="dm-stars"></div>${floaters}`;
}

export default {
  key: 'dailyMystery',
  label: 'Temple of Unhinged Testpages',
  description: '',
  icon: 'fa-dice',
  badge: { text: 'Fresh Content Daily', className: 'bg-fuchsia-500 text-white' },
  borderClasses: 'border-fuchsia-500/50 hover:border-fuchsia-400 bg-fuchsia-950/20 hover:bg-fuchsia-900/30 min-h-[92px]',
  radioAccent: 'accent-fuchsia-500',
  labelTextClass: 'text-white',
  configType: 'bw',
  multiPage: false,

  // Sidebar-only: wraps each letter of the label so it can be color-cycled
  // by CSS while this button is selected (see .tout-letter in style.css).
  // A fixed per-letter stagger, not randomness — this runs once at boot.
  //
  // Two wrapping layers, both load-bearing:
  // - The whole thing sits in one outer <span> so the label row's flex+gap
  //   only ever sees ONE child here (plus the icon) — without it, every
  //   individual letter becomes its own flex item and gets a 6px gap
  //   shoved after it.
  // - Each WORD is further wrapped in its own <span class="tout-word">
  //   (white-space:nowrap) — adjacent inline-block elements get an
  //   implicit line-break opportunity between them even with no
  //   whitespace in the markup, so without this a long word can wrap
  //   mid-word (e.g. "Testpage" / "s" on its own line). Wrapping only
  //   happens at the real spaces between tout-word spans now.
  labelHtml() {
    let i = 0;
    const words = this.label
      .split(' ')
      .map((word) => {
        const letters = word
          .split('')
          .map((ch) => {
            const delay = ((i++ * 173) % 2600) / 1000;
            return `<span class="tout-letter" style="animation-delay:${delay}s">${esc(ch)}</span>`;
          })
          .join('');
        return `<span class="tout-word">${letters}</span>`;
      })
      .join(' ');
    return `<span>${words}</span>`;
  },

  // At Unhinged the print layout becomes two pages (see render()); app.js
  // reads this to set #printSheet's multi-page mode to match.
  isMultiPage(state) {
    return (state.dailyIntensity ?? 0) >= 100;
  },

  // Sidebar-only: the black "window" + floating emoji behind the button,
  // shown only while selected (see .dm-starfield-layer). Re-rendered by
  // app.js on hash reroll and intensity change (both feed its seed).
  starfieldHtml(state) {
    return starfieldHtml(state.dailyHash, state.dailyIntensity ?? 0);
  },

  // No hint text, no explanation of what any of this does — on purpose.
  // Nobody gets told what Discombobulator Seed or the slider do; you turn
  // them and watch.
  controlsHtml(state) {
    const hash = state.dailyHash ?? '';
    const pct = state.dailyIntensity ?? 0;
    const status = intensityStatus(pct);
    const statusClass = status.variant ? ` dm-status-${status.variant}` : '';

    return `
      <div class="mt-2 bg-fuchsia-950/30 border border-fuchsia-500/30 rounded-lg p-3 space-y-2.5">
        <div class="flex items-end gap-2">
          <div class="flex-1">
            <label for="dailyHashInput" class="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <i class="fa-solid fa-hashtag text-white"></i>
              <span>Discombobulator Seed:</span>
            </label>
            <input type="text" id="dailyHashInput" value="${esc(String(hash))}" oninput="handleDailyHashChange(this.value)"
              class="w-full mt-1 bg-slate-900 border border-fuchsia-500/40 rounded px-2 py-1.5 text-xs font-mono text-fuchsia-100 focus:outline-none focus:border-fuchsia-400">
          </div>
          <button type="button" onclick="handleDailyHashRefresh()" title="Re-discombobulate"
            class="shrink-0 bg-transparent hover:bg-fuchsia-500/10 text-white text-xs font-bold px-3 py-2 rounded-lg transition border border-fuchsia-500/40">
            <i class="fa-solid fa-dice"></i>
          </button>
        </div>

        <div class="pt-1">
          <label for="dailyIntensityInput" class="text-[11px] font-bold text-white uppercase tracking-wider block mb-1">How would you like your template?</label>
          <input type="range" id="dailyIntensityInput" min="0" max="100" value="${pct}"
            oninput="handleDailyIntensityChange(this.value)"
            class="w-full accent-white h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer">
          <p id="dailyIntensityStatus" class="text-center text-xs font-mono font-bold text-white mt-1 uppercase tracking-wider${statusClass}">${status.text}</p>
        </div>
      </div>
    `;
  },

  render(state) {
    const c = state.dailyTemplateData || DEFAULT_CONTENT;
    const pct = state.dailyIntensity ?? 0;
    const style = computeRandomStyle(state.dailyHash, pct);
    const cooked = isCooked(pct) ? computeCookedExtras(state.dailyHash) : null;

    const sw = (text) => mangleText(applySwaps(text, c.swaps, state.dailySwapIndex), pct);
    const proseStyle = `letter-spacing:${style.letterSpacing}em; text-align:${style.textAlign};`;
    const listItemStyle = `letter-spacing:${style.letterSpacing}em;`;

    const paragraphs = (c.bodyParagraphs || [])
      .map((p) => `<p class="text-[14px] leading-relaxed text-slate-800 mb-1.5" style="${proseStyle}">${esc(sw(p))}</p>`)
      .join('');

    const bullets = (c.bulletPoints || [])
      .map((b) => `<li style="${listItemStyle}">${esc(sw(b))}</li>`)
      .join('');

    const warningBanner = cooked
      ? `<div class="border-2 border-red-600 bg-red-50 text-red-700 text-[13px] font-black uppercase tracking-wider text-center py-1 mb-2">⚠ WARNING: THIS PAGE MAY COMBUST IN PRINTER ⚠</div>`
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
            <span class="text-[13px] font-bold uppercase tracking-[0.2em] text-slate-600 block">AUTOMATED DAILY DIAGNOSTIC — CONTENT MAY VARY WITHOUT WARNING</span>
            <h1 class="text-xl font-black uppercase tracking-widest text-slate-950 my-1 leading-tight">${esc(applySwaps(c.headline, c.swaps, state.dailySwapIndex))}</h1>
            <p class="text-[14px] italic text-slate-700" style="${proseStyle}">${esc(sw(c.subheadline))}</p>
          </div>

          <div class="space-y-1">${paragraphs}</div>

          <div class="my-2 border-2 border-black p-2 bg-white">
            <p class="font-bold uppercase text-[13px] tracking-wider text-center border-b border-black pb-1 mb-1">STATUS CHECKLIST</p>
            <ul class="text-[14px] leading-relaxed text-slate-800 space-y-0.5 pl-4 list-disc">${bullets}</ul>
          </div>

          <div class="border-t-2 border-black mt-2 pt-1 text-[13px] text-slate-800 leading-tight italic" style="${proseStyle}">
            ${esc(sw(c.footerNote))}
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

    // At Unhinged specifically, the actual sheet moves to a genuine SECOND
    // printed page behind a blank first one — someone skimming the print
    // preview (which the browser always shows, and which the .print-only
    // trick alone can't hide — that's a platform limitation, not
    // something a page can suppress) sees a blank page and prints,
    // instead of paging forward to find the content. This depends on
    // app.js's renderDailyMysteryIfActive() toggling #printSheet's
    // multi-page-mode class to match — it can't be done here, since this
    // function only returns markup, it doesn't touch the DOM directly.
    if (pct >= 100) {
      return teaser + `<div class="print-only"><div class="print-page"></div><div class="print-page">${sheetHtml}</div></div>`;
    }

    return teaser + `<div class="print-only">${sheetHtml}</div>`;
  }
};

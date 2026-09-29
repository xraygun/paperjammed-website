// "The One That Keeps Changing" — content is generated once a day by a
// Cloudflare Cron Trigger (see src/index.js `scheduled()`), never by the
// visitor. This file only ever reads the cached result from
// /api/daily-template (wired up in app.js) and renders it — it never
// calls any AI model itself.
//
// state.dailyTemplateData holds whatever the last successful fetch
// returned. DEFAULT_CONTENT below is what renders before that fetch
// completes, or if it 404s because nothing has generated yet.

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

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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

  render(state) {
    const c = state.dailyTemplateData || DEFAULT_CONTENT;

    const paragraphs = (c.bodyParagraphs || [])
      .map((p) => `<p class="text-[10px] leading-relaxed text-slate-800 mb-1.5">${esc(p)}</p>`)
      .join('');

    const bullets = (c.bulletPoints || [])
      .map((b) => `<li>${esc(b)}</li>`)
      .join('');

    return `
      <div class="border-4 border-black p-3 bg-slate-50 font-mono text-slate-900">
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
    `;
  }
};

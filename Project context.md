# PaperJammed.net — Project Context & Template Authoring Guide

Paste this whole file into a fresh chat to bring an assistant up to speed, then
state what you want. It covers what the site is, how it's built, how to add a
template that actually works, and the mistakes that have already cost time.

---

## 1. What the site is

A prank printer test-page generator at **paperjammed.net**. Pick a "diagnostic"
template from the sidebar, optionally customize it, print it. The joke is that
it looks like a legitimate IT test page. The intended user is a technician who
just installed a printer and wants to verify it works while leaving something
funny in the output tray.

## 2. Hosting & repo

- **Repo:** `github.com/xraygun/paperjammed-website`
- **Production branch:** `main` → deploys to `paperjammed.net`
- **Host:** Cloudflare **Worker** (not Pages). Preview URLs follow
  `https://<branch-name>-paperjammednet.paperjammedadmin.workers.dev`
- **Site root is `public/`** — everything the browser loads lives under it
- **No build step.** Plain ES modules served as-is. No bundler, no framework,
  no npm dependencies at runtime.
- **Print counter:** a Worker endpoint at `/api/counter` (`?action=get`,
  `?action=up`). It only exists on deployed URLs, so locally the counter falls
  back to localStorage and its status dot goes amber. That is expected, not a bug.

### Local testing

ES modules are blocked over `file://`, so opening `index.html` directly shows a
blank page. Serve it instead:

```
cd ~/Documents/GitHub/paperjammed-website/public
python -m http.server 8000
```

Then open `http://localhost:8000`.

## 3. File structure

```
public/
  index.html                  Page shell only — header, sidebar chrome, print area.
                              No template markup lives here.
  css/style.css               Print rules (@page, .print-area, .print-page) + custom fonts.
  js/app.js                   State, print counter, sidebar rendering, template
                              switching, all control handlers.
  js/siteConfig.js            SITE_URL constant + siteFooterLine() helper.
  js/calibrationBars.js       The two CMYK / grayscale swatch strips.
  js/templates/index.js       THE REGISTRY — imports every template, defines order.
  js/templates/*.js           One file per template.
```

Current templates: `jamRemover`, `trayfeed`, `kiss`, `ghost`, `certificate`,
`pcloadletter`, `recipe`, `technobabble`, `alignment`, `invoice`, `spaceball`,
`allyourbase`.

> **Note:** `invoice.js` contains the Mail Order Livestock Receipt. The filename
> is stale from an earlier version. Renaming a key means touching four places,
> so it was left alone deliberately.

## 4. How a template works

Each file default-exports one object. `app.js` never knows what's inside — it
just reads the fields and calls `render()`.

```js
export default {
  key: 'myTemplate',            // camelCase, MUST match the filename and registry
  label: 'My Template',         // sidebar text
  description: 'One sentence.', // sidebar subtext
  icon: 'fa-flask',             // Font Awesome 6 solid, WITH the fa- prefix, or null
  badge: { text: 'NEW', className: 'bg-cyan-500 text-slate-950' },  // or null
  borderClasses: '...',         // Tailwind classes for the sidebar option
  radioAccent: 'accent-indigo-500',
  labelTextClass: 'text-cyan-300',   // '' for plain white
  configType: 'color',          // 'color' | 'bw' — picks the calibration bar
  multiPage: false,             // true only if render() emits .print-page divs

  controlsHtml(state) { ... },  // OPTIONAL — sidebar control for this template
  render(state) { ... }         // REQUIRED — returns the printed sheet as an HTML string
};
```

Helper functions and lookup tables may be defined **above** `export default` at
module scope — `jamRemover.js` does this extensively. That code is part of the
file and must be preserved on any edit.

### Single-page vs multi-page

- `multiPage: false` — the sheet is wrapped by the shared global footer
  (status line, site URL, calibration bar), which print CSS pins to the bottom
  of the page. **Do not** put `class="print-page"` in your markup. Doing so
  forces `98vh` + `page-break-after: always` on top of the shared footer and
  reliably produces a blank second page.
- `multiPage: true` — the shared footer is hidden. Wrap each physical page in
  `<div class="print-page">` and add the URL yourself with
  `${siteFooterLine('LABEL')}` (import it from `../siteConfig.js`).

### Registering a template

In `public/js/templates/index.js`, three additions:

```js
import myTemplate from './myTemplate.js';          // 1
export const templateOrder = [ ..., 'myTemplate' ]; // 2 — controls sidebar order
export const templates = { ..., myTemplate };       // 3
```

Nothing else needs to change. `index.html` and the sidebar are fully data-driven.

## 5. Interactive controls (the app.js integration)

This is the only part that is not self-contained in a template file.

`controlsHtml(state)` returns HTML that appears under the template's sidebar
entry when selected. Inputs use **inline handlers**:

```html
<input type="range" oninput="handleMyThing(this.value)" ...>
<select onchange="handleMyThing(this.value)">...</select>
```

Those handlers must exist in `app.js`. Three edits there:

**1. Add a state key** (inside the `state` object at the top):

```js
const state = {
  currentTemplateKey: 'jamRemover',
  myThingValue: '',
  ...
};
```

**2. Add the handler.** The standard pattern updates state and re-renders:

```js
function renderMyTemplateIfActive() {
  if (state.currentTemplateKey === 'myTemplate') {
    const el = document.getElementById('templateContent');
    if (el) el.innerHTML = templates.myTemplate.render(state);
  }
}

function handleMyThing(val) {
  state.myThingValue = val;
  renderMyTemplateIfActive();
}
```

**3. Expose it on window** (near the other `window.*` lines at the bottom) —
inline `oninput` attributes can only reach globals, and `app.js` is a module:

```js
window.handleMyThing = handleMyThing;
```

Re-rendering `#templateContent` does not touch the sidebar controls, so the
control keeps focus and its value while typing.

### Reading state in render()

Always provide a fallback — `render()` runs before the user touches anything:

```js
const val = (state.myThingValue && state.myThingValue.trim() !== '')
  ? state.myThingValue
  : '[ default text ]';
```

### Escaping free-form input

Multi-line or free-text fields get HTML-escaped before injection (see
`invoice.js`, the delivery-address field). Short single-line fields in known
positions are used directly.

### Existing state keys

```
currentTemplateKey, jamCoverage, jamFlavor, toastiness, splatterDensity,
trayFeedCount, certTechName, orderAnimal, orderRecipient, orderAddress
```

### Existing handlers on window

```
setTemplate, handleJamSliderChange, handleJamFlavorChange, handleToastinessChange,
handleSplatterChange, handleTrayFeedChange, handleCertTechNameChange,
handleOrderAnimalChange, handleOrderRecipientChange, handleOrderAddressChange,
updateCustomNote, handlePrintAction
```

### The shared "Technician Note" field

A single sidebar text box drives several templates via element IDs that
`updateCustomNote()` looks for: `printedFootnote`, `ghostTechName`,
`kissTechName`. Give an element one of those IDs to opt in. The certificate and
invoice use their own dedicated fields instead.

## 6. Print CSS — hard-won rules

All in `public/css/style.css` under `@media print`. These were each fixed after a
real bug; changing them tends to reintroduce one.

- **`.print-area` must not be `display: block`.** `#printSheet` is
  `flex flex-col justify-between`; forcing block collapses content to the top of
  the page with a large gap below.
- **Page height is `98vh`, not `100vh`,** in both `.print-area` and
  `.print-page`. Browsers compute `100vh` slightly larger than the printable
  area, which tips content onto a phantom second page. Lower it further
  (96, 94) if a specific template still spills.
- **Flex items need `overflow: hidden; min-height: 0`.** Flex items default to a
  minimum size equal to their content, which leaks extra height into pagination
  even when visually clipped. Applied to `#templateContent`,
  `#globalFooterContainer`, and nested `.flex-1`.
- **The global footer is absolutely positioned** (`bottom: 10mm`) rather than
  relying on flex-grow arithmetic, which was off by enough to spawn a blank page.
- **Layout wrappers are reset** (`html, body, body > div, body > div > main`) —
  their screen padding and `min-h-screen` otherwise add height beyond the sheet.
  **Do not broaden these selectors** to `body > div > div` and do not add
  `display: block` — that catches `#printSheet` itself and destroys its layout.

### If a template produces a blank second page

In order of likelihood: a `print-page` class on a `multiPage: false` template;
content genuinely too tall (trim it); or the `98vh` value needs lowering.

## 7. Tools

Two local dev tools (`tools/` in this working copy — **keep the CMS out of the
deployed site**, it has a GitHub token field):

- **`template-preview.html`** — paste or drop a template file, see the sidebar
  card and print output rendered with the real site CSS.
- **`template-cms.html`** — full editor: form fields, markup snippets, live
  preview, generated source, registry updater, GitHub publish, and an "app.js"
  tab that loads `app.js` so controls become live in the preview.

CMS notes:
- Module-level code above `export default` is captured in the "Module-level
  code" section and re-emitted. Earlier versions silently dropped it.
- Changing a `key` on an existing file is a rename; the CMS blocks in-place save
  and directs you to Publish so the registry is updated too.
- `app.js` is never auto-edited. The Publish tab generates the handler snippet
  to paste manually.

## 8. Git workflow

Short-lived branch per change, branched fresh from `main`:

```
git checkout main
git pull
git checkout -b my-change
# edit files
git add <files>
git commit -m "Describe the change"
git push -u origin my-change
```

Open a PR, check the Cloudflare preview URL, merge, delete the branch. Merging
via PR also gives you a Revert button — pushing straight to `main` does not.

### Failure modes that have already happened

- **Duplicate template copies.** Files once existed in both `public/js/` and
  `public/js/templates/`. Edits went to one while the site loaded the other.
  Only `app.js`, `siteConfig.js`, and `calibrationBars.js` belong directly in
  `public/js/`. Verify with:
  `git ls-files public/js/ | grep -v templates/`
- **Editing on github.com and locally in parallel** — pull before branching.
- **Testing the wrong deployment.** If changes don't appear, check the URL, and
  check DevTools → Network → JS: the converted site loads a dozen `.js` module
  files. If none appear, you are looking at an old deployment.
- **Forgetting to commit after copying files in.** `git status` before assuming
  a push happened.
- **Deploys silently stop after a merge.** Two independent ways this has
  happened, both invisible until you go looking:
  - The Workers Builds "Deploy command" (Settings → Build) got set to
    `npx wrangler versions upload` instead of `npx wrangler deploy`. That
    command only stages a new version and prints a preview URL — it never
    promotes it to production traffic, so every merge "succeeds" in the
    build log while the live site keeps serving whatever was deployed last.
  - The Cloudflare "Workers and Pages" GitHub App lost repository access
    (e.g. after disconnecting/reconnecting the integration), so pushes to
    `main` stop triggering builds at all — no entry appears in
    Deployments, manual or automatic. Fix on GitHub's side: Settings →
    Applications → Installed GitHub Apps → Cloudflare Workers and Pages →
    Configure → make sure `paperjammed-website` is in the repository
    access list, not just the Cloudflare side.
  - If a change isn't showing up, check both before assuming the code is
    wrong: Deployments tab for a recent build matching your commit, and
    that its deploy command actually promoted to production.

## 9. Content guidelines

These print on shared office printers where anyone might pick them up. Keep
jokes workplace-safe. No real named public figures. No copyrighted lyrics or
long quoted text. Mild profanity is acceptable where it is part of an existing
reference (the Office Space line in `pcloadletter.js`).

## 10. Checklist for a new template

- [ ] `key` matches the filename exactly, camelCase
- [ ] `icon` includes the `fa-` prefix
- [ ] No `print-page` class if `multiPage: false`
- [ ] Any `controlsHtml` handler exists in `app.js` AND is on `window`
- [ ] State keys have fallbacks in `render()`
- [ ] Free-form text input is HTML-escaped
- [ ] Registered in `templates/index.js` in all three places
- [ ] Print-tested: fits one page, no blank second page
- [ ] Tested on a deployed preview URL, not just localhost

---
---

# PART TWO — TEMPLATE GENERATION SPEC

> **Sections 1–10 above are project context** — for working on the repo itself.
>
> **This part is a self-contained brief for generating one new template file.**
> You can paste this whole document into a fresh chat, or just Part Two on its
> own, and say: *"Create a new template based on [idea], following this spec."*

## Your deliverables

When asked to create a template, produce exactly these, and nothing else:

1. **One complete `.js` file** — saved to `public/js/templates/<key>.js`
2. **The registry diff** for `public/js/templates/index.js` (three additions)
3. **An `app.js` snippet — only if the template has interactive controls.**
   Do not attempt to rewrite `app.js`; hand over the exact lines to paste.

Do **not** modify `index.html`, `css/style.css`, or `calibrationBars.js`.

## The contract

```js
export default {
  key: 'myTemplate',            // REQUIRED. camelCase. Must equal the filename.
  label: 'My Template',         // REQUIRED. Sidebar text.
  description: 'One sentence.', // REQUIRED. Sidebar subtext.
  icon: 'fa-flask',             // Font Awesome 6 solid name WITH fa- prefix, or null.
  badge: { text: 'NEW', className: 'bg-cyan-500 text-slate-950' },  // or null
  borderClasses: 'border-slate-700 hover:border-slate-500 bg-slate-800/50 hover:bg-slate-700/50',
  radioAccent: 'accent-indigo-500',
  labelTextClass: 'text-cyan-300',   // '' for plain white
  configType: 'color',          // 'color' | 'bw' — which calibration bar shows
  multiPage: false,             // true ONLY if render() emits .print-page divs

  controlsHtml(state) { ... },  // OPTIONAL — see "Interactive controls" below
  render(state) { ... }         // REQUIRED — returns the printed sheet as a string
};
```

Helpers and lookup tables may be declared at module scope above
`export default`. Keep them in the same file.

## Hard rules

1. **No `@page` or `@media print` rules.** Global print CSS already exists;
   a second `@page` conflicts with it.
2. **No `class="print-page"` when `multiPage: false`.** It forces `98vh` plus
   `page-break-after: always` on a sheet that also receives the shared footer,
   which reliably produces a blank second page. This is the single most common
   failure.
3. **No standalone print functions.** No `window.print()`, no hidden-iframe
   printing, no `renderX(containerId)` helpers. The site owns printing and the
   print counter. A template only describes what appears on the sheet.
4. **`render()` and `controlsHtml()` must be pure.** No `document.getElementById`,
   no side effects, no fetch, no async. Input comes from `state`, output is a
   string.
5. **Prefix custom CSS classes** with the template key (`.sb-header`, not
   `.header`). Prefer Tailwind utilities — most templates use no custom CSS at
   all. A raw `<style>` block inside the returned string works if needed.
6. **Content must fit one page.** Roughly 5,000–6,000 characters of rendered
   markup is the practical ceiling for a single-page template. If it overflows,
   trim content rather than shrinking the page.
7. **Escape free-form user input** before injecting it (see the address field in
   `invoice.js`).
8. **Keep it workplace-safe.** These print on shared office printers. No real
   named public figures, no copyrighted lyrics or long quoted passages.

## House style

Templates look like industrial diagnostic printouts. Conventions in use:

- `font-mono` throughout; `font-sans` only for deliberate contrast
- Small type: `text-[9px]`, `text-[10px]`, `text-[11px]`, `text-xs`
- Hard black rules: `border-b-2 border-black`, `border-2 border-slate-800`
- `uppercase tracking-wider` / `tracking-widest` for headers and labels
- Section markers like `§1 — INITIALIZATION SEQUENCE`
- Boxed callouts: `border-l-4` accent bars, `bg-slate-50` panels
- Fake precision: reference codes, timestamps, measured-vs-nominal tables,
  version strings, `STATUS: OPTIMAL`

## Interactive controls

Only if the template needs user input. `controlsHtml(state)` returns HTML shown
under the sidebar entry when the template is selected. Inputs use **inline
handlers**, because `app.js` is a module and inline attributes can only reach
globals:

```html
<input type="text" value="${state.myValue || ''}" oninput="handleMyValue(this.value)"
  class="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-xs text-slate-100">
```

Then supply this `app.js` snippet as a separate deliverable:

```js
// 1. add to the `state` object at the top of app.js:
myValue: '',

// 2. add the handler:
function renderMyTemplateIfActive() {
  if (state.currentTemplateKey === 'myTemplate') {
    const el = document.getElementById('templateContent');
    if (el) el.innerHTML = templates.myTemplate.render(state);
  }
}

function handleMyValue(val) {
  state.myValue = val;
  renderMyTemplateIfActive();
}

// 3. expose it near the other window.* lines at the bottom:
window.handleMyValue = handleMyValue;
```

In `render()`, always give state a fallback:

```js
const v = (state.myValue && state.myValue.trim() !== '') ? state.myValue : '[ default ]';
```

**Names already taken** — do not reuse:
`jamCoverage`, `jamFlavor`, `toastiness`, `splatterDensity`, `trayFeedCount`,
`certTechName`, `orderAnimal`, `orderRecipient`, `orderAddress`,
`currentTemplateKey`, and any `handle*` listed in §5.

## Multi-page templates

Set `multiPage: true`, wrap each physical page in `<div class="print-page">`,
and add the site URL yourself:

```js
import { siteFooterLine } from '../siteConfig.js';
// ...then inside render():
${siteFooterLine('UNIT LABEL')}
```

The shared footer is hidden for multi-page templates. Don't add the footer to
intentionally-blank filler pages.

## Registry diff format

Always deliver it in this shape:

```
// public/js/templates/index.js

// 1. with the other imports:
import myTemplate from './myTemplate.js';

// 2. add to templateOrder (position = sidebar order):
'myTemplate'

// 3. add to the templates object:
myTemplate
```

## Complete worked example

A real, shipping template — the simplest one in the project. Match this shape.

```js
export default {
  key: 'kiss',
  label: 'K-I-S-S IT Checkbox',
  description: 'Keep It Simple, Stupid. Minimal top header with check box to return to IT Dept.',
  icon: 'fa-check-square',
  badge: { text: 'INK SAVER', className: 'bg-emerald-500 text-slate-950' },
  borderClasses: 'border-emerald-500/50 hover:border-emerald-400 bg-emerald-950/20 hover:bg-emerald-900/30',
  radioAccent: 'accent-emerald-500',
  labelTextClass: 'text-emerald-300',
  configType: 'bw',
  multiPage: false,

  render() {
    return `
      <div class="font-mono text-slate-900 h-full flex flex-col justify-between py-2">
        <div>
          <div class="border-b-2 border-slate-900 pb-2 flex justify-between items-center text-xs">
            <span class="font-bold uppercase tracking-wider">IT DEPT. QUICK TEST PAGE</span>
            <span class="text-[10px] text-slate-500">REF: K-I-S-S PROTOCOL</span>
          </div>

          <div class="my-8 p-5 border-2 border-slate-900 rounded bg-slate-50 flex items-start gap-4">
            <div class="w-7 h-7 border-2 border-slate-900 rounded-sm shrink-0 mt-0.5 bg-white"></div>
            <div>
              <p class="text-sm font-bold text-slate-900 leading-snug">
                Please check box and return sheet to IT Department if test print is successful.
              </p>
              <p class="text-xs text-slate-600 mt-1">
                Printer: <span id="kissTechName">[ System Default Printer ]</span> • Tested: ${new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        <div class="text-[10px] text-slate-400 text-center uppercase tracking-widest border-t border-dashed border-slate-300 pt-3">
          [ MINIMAL INK CONSUMPTION TEST • KEEP IT SIMPLE, STUPID ]
        </div>
      </div>
    `;
  }
};
```

Note: `render()` takes no argument here because this template reads no state.
The `id="kissTechName"` opts it into the shared Technician Note field (§5).

## Pre-delivery checklist

- [ ] `key` equals the filename, camelCase
- [ ] `icon` has the `fa-` prefix (or is `null`)
- [ ] No `print-page` class if `multiPage: false`
- [ ] No `@page`, `@media print`, or print functions
- [ ] `render()` is pure and returns a string
- [ ] Any handler referenced in `controlsHtml` is included in the app.js snippet
      and exposed on `window`
- [ ] No state-key or handler-name collisions with the lists above
- [ ] State reads have fallbacks; free-form input is escaped
- [ ] Registry diff included
- [ ] Content is plausibly one page

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
trayFeedCount, certTechName, orderAnimal, orderRecipient, orderAddress,
isPrintIncrementing
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

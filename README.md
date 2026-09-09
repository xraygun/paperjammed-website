# PaperJammed.net

## Structure

```
index.html                  Page shell — header, sidebar chrome, print area. No template markup lives here.
css/style.css                Print rules + custom fonts (unchanged from before).
js/app.js                    App logic: state, print counter, sidebar rendering, template switching.
js/calibrationBars.js        The two color/grayscale calibration swatch strips.
js/templates/index.js        THE REGISTRY. Import a template here + add its key to templateOrder.
js/templates/jamRemover.js   One file per prank template.
js/templates/trayfeed.js
js/templates/kiss.js
js/templates/ghost.js
js/templates/certificate.js
js/templates/pcloadletter.js
js/templates/recipe.js
js/templates/technobabble.js
js/templates/alignment.js
js/templates/invoice.js
```

No build step — it's plain ES modules, so you can open it with any static file
server (it won't work over `file://` because browsers block module imports
from the filesystem; `python3 -m http.server` or your existing Cloudflare
Pages/Worker setup both work fine).

## Adding a new template

1. Copy the simplest existing file, `js/templates/recipe.js`, to
   `js/templates/myNewPrank.js`.
2. Fill in the fields:

```js
export default {
  key: 'myNewPrank',              // must match the filename/import key
  label: 'My New Prank',          // shown in the sidebar
  description: 'What it does.',   // shown under the label
  icon: 'fa-flask',                // any Font Awesome solid icon name, or null
  badge: { text: 'NEW', className: 'bg-cyan-500 text-slate-950' }, // or null
  borderClasses: 'border-slate-700 hover:border-slate-500 bg-slate-800/50 hover:bg-slate-700/50',
  radioAccent: 'accent-indigo-500',
  labelTextClass: 'text-cyan-300', // or '' for a plain white label
  configType: 'bw',                // 'bw' or 'color' — picks the calibration bar
  multiPage: false,                // true if render() emits multiple .print-page divs

  render(state) {
    return `<div>...your print sheet markup...</div>`;
  }
};
```

   If your template needs its own interactive control (like the Jam Remover's
   slider or the Tray Feed's page-count input), add a `controlsHtml(state)`
   method that returns that control's HTML — it'll automatically show/hide
   itself when your template is selected.

3. Register it in `js/templates/index.js`:

```js
import myNewPrank from './myNewPrank.js';
// ...
export const templateOrder = [..., 'myNewPrank'];
export const templates = { ..., myNewPrank };
```

That's it. The sidebar list, the print preview, and the calibration bar all
pick it up automatically — `index.html` and `app.js` never need to change.

## Things that stayed the same

- The global print counter (localStorage + `/api/counter` Cloudflare Worker
  sync) lives in `app.js`, unchanged in behavior.
- The "Technician / Installer Name" field still drives `certTechName`,
  `ghostTechName`, `kissTechName`, and `printedFootnote` — wire those same
  element IDs into any new template if you want it to pick up the custom
  note too.
- Print CSS (`@page`, `.print-area`, `.print-page`, multi-page mode) is
  unchanged in `css/style.css`.

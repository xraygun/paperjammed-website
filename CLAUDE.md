# CLAUDE.md — PaperJammed.net

Prank printer test pages, live at https://paperjammed.net. Static site in
`public/` served by a Cloudflare Worker (`src/index.js`). For how templates
work, print CSS rules and the template spec, read `Project context.md`.
Ideas on hold live in `parked.md`.

## Working with the owner (read first — usage is limited)

- **Batch.** Do everything asked in one go; don't split into many small turns.
- **No PR babysitting.** Don't subscribe to PR activity or schedule hourly
  check-ins for routine PRs. Verify the preview build yourself (below)
  before replying, then stop.
- **Merging.** Merge only when the owner says so. If they said "ship it if
  the preview passes", merge as soon as the preview build succeeds.
- **Keep replies short.** Link the preview and the PR, say what to check.
- **Public messaging:** don't lean into "AI-generated" — keep AI out of
  site copy and promo text.

## Deploys and previews (Cloudflare Workers Builds)

- Worker `paperjammednet`, account `0cf47ba59743774195897790d77116e0`.
- `main` → production (`npx wrangler deploy`). Any other branch → preview
  (`npx wrangler preview`), served at
  `https://<branch-with-slashes-as-dashes>-paperjammednet.paperjammedadmin.workers.dev`.
- Each branch gets its own build trigger, copied from the dashboard's
  non-production command when first pushed. If a preview fails with
  "name … must match the name of your Worker", that trigger is using
  `versions upload`: PATCH it to `npx wrangler preview`
  (`/accounts/{id}/builds/triggers/{trigger_uuid}`) and start a build with
  POST `…/builds/triggers/{trigger_uuid}/builds` `{branch, commit_hash}`.
- Check a build: GET `/accounts/{id}/builds/builds/{build_uuid}` and
  `…/logs`; list a branch's builds via
  `/accounts/{id}/builds/workers/{external_script_id}/builds?per_page=1`
  (the build's `trigger.external_script_id`).
- `wrangler.jsonc` needs its `previews` block (previews don't inherit
  bindings; no crons there).

## Cloudflare API token (injected, scoped to api.cloudflare.com)

Can: KV read/write, Workers Scripts read, Workers Builds config edit,
Web Analytics site info. **Can't:** Workers AI, Worker logs/observability,
analytics GraphQL. When it's blocked, ask the owner to look in the dashboard.

## Daily template ("Temple of Unhinged Testpages", key `dailyMystery`)

- Cron `0 9 * * *` UTC runs `scheduled()`: Llama 3.1 8B writes a JSON page
  using numbered `[[N]]` swap tokens, saved to KV key `latest`
  (namespace `0a148b477f20418782bc83163d143b86`, binding `DAILY_TEMPLATE`).
  A bad reply is logged and KV is left alone.
- `max_tokens: 1500` is required (Workers AI defaults to 256, which
  truncated every run until 2026-10-02).
- Hand-written fallbacks: KV keys `bank-*`. To swap one in, copy it to
  `latest` with a fresh `generatedAt`. Validate first: tokens numbered 1..N
  with no gaps, every token has a `swaps` entry and vice versa, no empty
  `[]`, no "a"/"an" before a token, plural tokens get plural swaps.
- Intensity slider: swaps every 3s; past 50% a few words print backwards
  or upside down; 75%+ "Cooked" (combust banner, code spill); 100%
  "Unhinged" hides the preview and prints a blank page 1 plus page 2 with
  the crayon note or Printer's log, print defects, a Wingdings border and
  its own copy of the site footer.

## QR codes and per-template counters

- Every printed page carries an 18mm QR (`siteQr(key)` in
  `public/js/siteConfig.js`, drawn in-page from the vendored
  `public/js/lib/qrcode.js`) pointing at `/q/<key>` (encoded in capitals
  for QR alphanumeric mode). The Worker bumps CounterAPI `scan-<key>` and
  302s to `/?t=<key>`, which preselects that template.
- Printing also bumps `print-<key>` (`/api/counter?action=up&k=<key>`) next
  to the unchanged total. See both at `/api/template-stats`.
- Keys come from `public/js/templates/order.js` (shared with the Worker).
  Never rename a key once it's printed; add a redirect alias instead.

## Site rules

- Anything that prints must show the site footer/URL somewhere.
- Template fonts ≥ 13px; `.no-print` / `.print-only` for screen vs paper.
- Adding any third-party request (script, image, font, embed) means
  updating `public/privacy.html` in the same PR.
- Tip jar: Buy Me a Coffee `printerjammed` (desktop footer + bottom of the
  phone sidebar).

## Testing in this sandbox

- The proxy blocks paperjammed.net, *.workers.dev, Google Fonts, the
  Tailwind CDN and img.buymeacoffee.com, so check the real look on the
  preview, or use the TinyFish connector to open it.
- Headless Chromium: Playwright at `/opt/node22/lib/node_modules/playwright`,
  `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`; serve `public/` with
  `python3 -m http.server`. For real styling, build Tailwind v3 locally
  (`npx tailwindcss` with `content: public/**/*.{html,js}`) and serve it in
  place of `cdn.tailwindcss.com` via `page.route`. To see scrollbars, launch
  with `ignoreDefaultArgs: ['--hide-scrollbars']`.
- Print checks: `page.emulateMedia({media:'print'})` + `page.pdf()`, then
  rasterize/search with PyMuPDF (`import fitz`).
- Run `pkill -f "http.server …"` as its own command — combined with other
  commands it kills its own shell (exit 144).

## Next up (owner-approved ideas)

1. **TinyFish connector**: open the live site and previews to verify
   changes the sandbox can't load.
2. **Tally**: a "suggest a template" form linked from the footer.
3. **dot.**: shareable review links for previews.
4. A short screen-recording clip (as a looping muted video, not a GIF) of
   Chrome's "See more…" printer picker in the "Why use PaperJammed.net?"
   box. Waiting on the owner's recording.
5. Ads/affiliates once accounts exist; update the privacy page first.

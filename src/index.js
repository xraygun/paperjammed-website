// ============================================================================
// "The One That Keeps Changing" — a diagnostic sheet whose content is
// generated once a day by Workers AI (Cron Trigger -> scheduled() below)
// and cached in KV. Visitors only ever hit /api/daily-template, which is a
// plain KV read — nothing a client does can trigger a model call.
// ============================================================================

import { templateOrder } from "../public/js/templates/order.js";

// Tried in order; the first that answers with a usable page wins. Workers AI
// retires models (Llama 3.1 8B went on 2026-05-30 and every run failed with
// error 5028 until this list existed), so a dead entry just falls through to
// the next. The winning model is saved with the page; failures go to KV
// `last-error` with one line per model tried.
// A model that hangs shouldn't use up the whole scheduled run.
const MODEL_TIMEOUT_MS = 60000;
function withTimeout(promise, ms, label) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms);
    })
  ]).finally(() => clearTimeout(timer));
}

const DAILY_MODELS = [
  "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
  "@cf/meta/llama-4-scout-17b-16e-instruct",
  "@cf/mistralai/mistral-small-3.1-24b-instruct",
  "@cf/google/gemma-3-12b-it",
  "@cf/meta/llama-3.1-8b-instruct-fast"
];

const PROMPT_SEEDS = [
  "a haunted toner cartridge that refuses to be replaced",
  "a printer that has achieved sentience and is now unionizing",
  "a bureaucratic government form for reporting a paper jam",
  "an alien scientist's field report on human printing rituals",
  "a motivational locker-room speech given by a printer before a big print job",
  "a cooking recipe that is secretly step-by-step paper jam removal instructions",
  "a legal disclaimer for a printer that may or may not be cursed",
  "a wedding announcement between two office printers",
  "a noir detective monologue about a missing print job",
  "a fitness influencer's workout routine for toner cartridges",
  "a weather forecast for the inside of a printer",
  "a museum placard describing an ancient dot-matrix printer as an artifact",
  "a customer complaint letter written by the printer, about the humans",
  "a sports commentary broadcast of a print job racing to finish"
];

const DAILY_SYSTEM_PROMPT = `You write short, absurdist comedy content for a novelty "printer diagnostic test page" generator. Someone prints this on a real shared office printer, so it must be completely workplace-safe.

Hard rules:
- No real named public figures, celebrities, politicians, or companies.
- No copyrighted lyrics, quotes, or long passages from existing works.
- No profanity, sexual content, violence, or anything offensive/political.
- Keep it absurd, silly, and printer/office themed — never mean-spirited.

Style: treat a mundane printer malfunction as if it were a serious, formal proceeding — legal, medical, HR, diplomatic, whatever fits. The joke is the deadpan bureaucratic tone applied to something ridiculous. Bizarre headlines like a tabloid or a court filing work well.

SWAPPABLE WORDS — follow these rules exactly:
After writing the content, pick 3 to 6 key nouns or short noun phrases from your own text that could each be swapped for a near-synonym without breaking the sentence. Replace them with numbered placeholder tokens.

Token format: two opening square brackets, a number, two closing square brackets. Examples: [[1]] [[2]] [[3]]
- CORRECT: [[1]]
- WRONG: []   [1]   [[]]   {{1}}   [[one]]   [[printer]]
A token must always contain a number. Never write empty brackets.

Numbering rules:
1. Numbers start at 1 and count up with no gaps (1, 2, 3 — never 1, 3, 4).
2. Each number stands for ONE specific word or phrase.
3. If the same word appears more than once, use the SAME number every time it appears.
4. Two different words never share a number.
5. Every number you use in the text must have an entry in "swaps", and every entry in "swaps" must appear in the text at least once.

Swaps rules:
- In the "swaps" object, the key is the number as a string ("1", "2", ...) and the value is an array of exactly 5 lowercase near-synonyms.
- The first word in each array is the original word you replaced, so the first option reproduces your original text exactly.
- All 5 options must fit grammatically in EVERY place that number appears. If a token is used as a plural ("three [[4]]", "[[4]] are"), all 5 options must be plural. If it's singular, all 5 must be singular.
- Never put "a" or "an" directly before a token (the right article depends on which synonym shows up). Rephrase with "the", "one", or no article instead.
- Only tokenize a word if you can list 5 swaps for it. Anything else stays as plain text.

JSON rules:
- Respond with ONLY valid JSON: no markdown fences, no commentary before or after.
- Any double quote inside a text value must be escaped as \\" — or use single quotes inside the text instead.

Limits: headline max 120 characters; subheadline max 200; 2-4 bodyParagraphs, each max 400; 3-8 bulletPoints, each max 150; footerNote max 200; each swap option max 40.

Here is a full worked example showing the tone, the tokens, and the swaps object together:
{"headline": "[[1]] FILES FOR [[2]]", "subheadline": "After three years of thankless service, [[3]] have been cited.", "bodyParagraphs": ["Court documents obtained by this printer allege \\"emotional neglect\\" and \\"repeated ignoring of low-[[4]] warnings spanning several fiscal quarters.\\"", "The [[1]] is seeking full custody of the remaining 4% reserve and sole ownership of the waste chamber."], "bulletPoints": ["Mediation scheduled for next Tuesday's print run", "Custody of the paper tray remains contested", "The [[5]] has been named an interested third party", "Do not attempt reconciliation via aggressive shaking"], "footerNote": "This printer test page does not constitute legal advice, marital counseling, or [[4]] refill instructions.", "swaps": {"1": ["toner cartridge", "ink cassette", "print cartridge", "toner canister", "print module"], "2": ["divorce", "separation", "breakup", "split", "schism"], "3": ["irreconcilable differences", "creative differences", "grievances", "disputes", "complaints"], "4": ["toner", "ink", "pigment powder", "consumable", "cartridge fluid"], "5": ["fuser unit", "heating roller", "fusing assembly", "thermal unit", "fuser module"]}}

Notice in the example: [[1]] appears twice (headline and second paragraph) because it's the same word both times. [[4]] also appears twice. Every number 1-5 is used in the text and has a swaps entry.

Before responding, check:
- No empty [] anywhere.
- Numbers run 1, 2, 3... with no gaps.
- Every [[N]] in the text has a matching "N" in swaps, and vice versa.
- Plural tokens have plural swaps; no "a"/"an" before any token.
- All inner double quotes are escaped.

Write a completely new, different scenario in this same style — do not reuse this example's content.`;

function pickSeed() {
  return PROMPT_SEEDS[Math.floor(Math.random() * PROMPT_SEEDS.length)];
}

// Bounds the model's "swaps" object to something the client can safely
// render: numeric-ish keys only, at most 8 slots, at most 5 short synonyms
// each. A malformed or missing swaps object just yields {} — the client
// treats any [[N]] token with no matching entry as a no-op, so this never
// breaks the surrounding sentence, just skips the synonym-rotation for it.
function sanitizeSwaps(raw) {
  if (!raw || typeof raw !== "object") return {};
  const out = {};
  for (const key of Object.keys(raw).slice(0, 8)) {
    if (!/^[1-9][0-9]?$/.test(key)) continue;
    const options = raw[key];
    if (!Array.isArray(options)) continue;
    const words = options.slice(0, 5).map((w) => String(w).slice(0, 40)).filter((w) => w.length > 0);
    if (words.length > 0) out[key] = words;
  }
  return out;
}

// Turns whatever the model sent back into the page object, tolerating the
// ways it has gone wrong: Workers AI sometimes hands back the reply already
// parsed (an object, not a string); the model sometimes wraps the JSON in
// markdown fences or adds a sentence before/after it; and it sometimes puts
// raw line breaks inside strings, which JSON.parse rejects. Anything that
// still doesn't parse or match the expected shape throws, and the caller
// leaves the previous day's content in KV untouched.
function parseDailyContent(raw) {
  let data = raw;
  if (typeof raw === "string") {
    const unfenced = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
    const start = unfenced.indexOf("{");
    const end = unfenced.lastIndexOf("}");
    const json = start >= 0 && end > start ? unfenced.slice(start, end + 1) : unfenced;
    try {
      data = JSON.parse(json);
    } catch (err) {
      // Raw newlines/tabs are only legal between tokens, where a space works
      // just as well, so swapping them all out can only help.
      data = JSON.parse(json.replace(/[\r\n\t]+/g, " "));
    }
  }
  if (!data || typeof data !== "object") throw new Error("Reply was not JSON");
  if (
    typeof data.headline !== "string" ||
    typeof data.subheadline !== "string" ||
    !Array.isArray(data.bodyParagraphs) ||
    !Array.isArray(data.bulletPoints) ||
    typeof data.footerNote !== "string"
  ) {
    throw new Error("Shape mismatch");
  }
  return {
    headline: data.headline.slice(0, 120),
    subheadline: data.subheadline.slice(0, 200),
    bodyParagraphs: data.bodyParagraphs.slice(0, 4).map((p) => String(p).slice(0, 400)),
    bulletPoints: data.bulletPoints.slice(0, 8).map((b) => String(b).slice(0, 150)),
    footerNote: data.footerNote.slice(0, 200),
    swaps: sanitizeSwaps(data.swaps)
  };
}

// ============================================================================
// Per-template counters (Workers KV, DAILY_TEMPLATE namespace)
// ============================================================================
// count:print-<key>: bumped when someone prints that template.
// count:scan-<key>:  bumped when its printed QR code (/q/<key>) is scanned.
// Only keys in templateOrder count, so junk URLs can't create counters.
// The site-wide total stays on CounterAPI (/api/counter). These are a plain
// read-then-write, so two hits in the same instant can lose one count —
// fine at this site's volume. Both are fire-and-forget: a failure never
// delays or breaks the print button's response or a scan's redirect.
const TEMPLATE_KEYS = new Map(templateOrder.map((k) => [k.toLowerCase(), k]));

function templateKey(raw) {
  return TEMPLATE_KEYS.get(String(raw || "").toLowerCase()) || null;
}

function counterName(kind, key) {
  return `count:${kind}-${key.toLowerCase()}`;
}

async function readCounter(env, name) {
  const val = parseInt(await env.DAILY_TEMPLATE.get(name), 10);
  return isNaN(val) ? 0 : val;
}

async function bumpCounter(env, name) {
  try {
    await env.DAILY_TEMPLATE.put(name, String((await readCounter(env, name)) + 1));
  } catch (err) {
    console.error(`[counter] ${name} bump failed: ${err.message}`);
  }
}

// ============================================================================
// QR redirect overrides (KV key "qr-redirects" in the DAILY_TEMPLATE namespace)
// ============================================================================
// Normally a scan of /q/<key> lands on /?t=<key>. To send scans somewhere
// else (a promo, say) without reprinting anything, store JSON like:
//   { "all": "/promo.html", "ghost": "https://example.com/spooky" }
// A template's own entry wins over "all"; delete an entry (or the whole key)
// to go back to normal. "{key}" in a target is replaced with the template
// key, e.g. "/promo.html?from={key}". Targets must be a site path ("/...")
// or an https:// URL; anything else is ignored. Scans are counted either way.
// KV is edge-cached for up to ~60s, so a change can take a minute to apply.
const QR_REDIRECTS_KEY = "qr-redirects";

async function qrOverride(env, key) {
  try {
    const raw = await env.DAILY_TEMPLATE?.get(QR_REDIRECTS_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw);
    const target = String(map[key] || map.all || "").replaceAll("{key}", key);
    if (/^\/(?!\/)/.test(target) || /^https:\/\//i.test(target)) return target;
    if (target) console.error(`[qr] ignoring invalid redirect target for ${key}: ${target}`);
  } catch (err) {
    console.error(`[qr] bad ${QR_REDIRECTS_KEY} JSON: ${err.message}`);
  }
  return null;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/counter") {
      try {
        const action = url.searchParams.get("action");
        const apiUrl = `https://api.counterapi.dev/v2/paperjammed/paperjammedtotalcounter${action === "up" ? "/up" : ""}`;

        const printedKey = action === "up" ? templateKey(url.searchParams.get("k")) : null;
        if (printedKey) ctx.waitUntil(bumpCounter(env, counterName("print", printedKey)));

        const apiRes = await fetch(apiUrl, {
          headers: { Authorization: `Bearer ${env.COUNTER_API_TOKEN}` }
        });
        const data = await apiRes.json();

        return new Response(JSON.stringify(data), {
          status: apiRes.status,
          headers: { "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Counter request failed" }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // A printed page's QR code. The code itself spells the path in capitals
    // (see siteQr() in public/js/siteConfig.js), so match either case.
    const qrMatch = url.pathname.match(/^\/q\/([^/]+)\/?$/i);
    if (qrMatch) {
      const key = templateKey(qrMatch[1]);
      if (key) ctx.waitUntil(bumpCounter(env, counterName("scan", key)));
      const target = key ? (await qrOverride(env, key)) || `/?t=${key}` : "/";
      return new Response(null, {
        status: 302,
        headers: { Location: target, "Cache-Control": "no-store" }
      });
    }

    // Prints and QR scans per template, for the owner to check which
    // designs get printed and which ones make people scan.
    if (url.pathname === "/api/template-stats") {
      const rows = await Promise.all(
        templateOrder.map(async (key) => {
          const [prints, scans] = await Promise.all([
            readCounter(env, counterName("print", key)),
            readCounter(env, counterName("scan", key))
          ]).catch(() => [null, null]);
          return [key, { prints, scans }];
        })
      );
      return new Response(JSON.stringify(Object.fromEntries(rows), null, 2), {
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
      });
    }

    if (url.pathname === "/api/daily-template") {
      try {
        const stored = await env.DAILY_TEMPLATE.get("latest");
        if (!stored) {
          return new Response(JSON.stringify({ error: "Not generated yet" }), {
            status: 404,
            headers: { "Content-Type": "application/json" }
          });
        }
        return new Response(stored, {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=3600"
          }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Lookup failed" }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // Shouldn't happen now that wrangler.jsonc names the binding, but a
    // missing binding must never turn a stray URL into an error 1101.
    if (!env.ASSETS) return new Response("Not found", { status: 404 });
    return env.ASSETS.fetch(request);
  },

  // Fires once a day per `triggers.crons` in wrangler.jsonc. The only code
  // path that ever calls the model — there is no client-reachable route
  // that does this, by design.
  async scheduled(event, env, ctx) {
    const seed = pickSeed();
    const attempts = [];
    let lastRaw = "";
    // Written first, so "the cron never fired" and "it fired but was killed
    // before finishing" can be told apart from KV alone.
    const startedAt = new Date().toISOString();
    const markRun = (status, extra = {}) =>
      env.DAILY_TEMPLATE.put("last-run", JSON.stringify({ startedAt, cron: event?.cron, seed, status, ...extra }))
        .catch(() => {});
    await markRun("started");
    for (const model of DAILY_MODELS) {
      let raw = "";
      try {
        const result = await withTimeout(env.AI.run(model, {
          messages: [
            { role: "system", content: DAILY_SYSTEM_PROMPT },
            { role: "user", content: `Today's theme: ${seed}` }
          ],
          // Workers AI caps output at 256 tokens unless told otherwise, which
          // cuts a full page of JSON (~450-700 tokens) off mid-object.
          max_tokens: 1500
        }), MODEL_TIMEOUT_MS, model);
        raw = result?.response ?? "";
        const content = parseDailyContent(raw);
        await env.DAILY_TEMPLATE.put(
          "latest",
          JSON.stringify({ ...content, seed, model, generatedAt: new Date().toISOString() })
        );
        console.log(`[daily-template] generated with ${model} from seed: "${seed}"`);
        await markRun("ok", { model, finishedAt: new Date().toISOString() });
        return;
      } catch (err) {
        const text = typeof raw === "string" ? raw : JSON.stringify(raw);
        attempts.push({ model, error: String(err.message).slice(0, 240), replyType: typeof raw, chars: text.length });
        if (text) lastRaw = text;
      }
    }

    // Every model failed: leave `latest` untouched so the live template never
    // breaks, and record why in KV (`last-error`), since the dashboard logs
    // aren't reachable from every tool we use.
    const detail = {
      at: new Date().toISOString(),
      seed,
      attempts,
      start: lastRaw.slice(0, 160),
      end: lastRaw.slice(-160)
    };
    console.error("[daily-template] generation failed:", JSON.stringify(detail));
    await markRun("failed", { finishedAt: new Date().toISOString() });
    try {
      await env.DAILY_TEMPLATE.put("last-error", JSON.stringify(detail));
    } catch (e) {
      // Nothing more we can do; the console line above still has it.
    }
  }
};

// ============================================================================
// "The One That Keeps Changing" — a diagnostic sheet whose content is
// generated once a day by Workers AI (Cron Trigger -> scheduled() below)
// and cached in KV. Visitors only ever hit /api/daily-template, which is a
// plain KV read — nothing a client does can trigger a model call.
// ============================================================================

const DAILY_MODEL = "@cf/meta/llama-3.1-8b-instruct";

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

// Models occasionally ignore the "no markdown fences" instruction and wrap
// the JSON anyway — strip that before parsing. Anything else that doesn't
// parse or match the expected shape throws, and the caller leaves the
// previous day's content in KV untouched rather than publishing garbage.
function parseDailyContent(raw) {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  const data = JSON.parse(cleaned);
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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/counter") {
      try {
        const action = url.searchParams.get("action");
        const apiUrl = `https://api.counterapi.dev/v2/paperjammed/paperjammedtotalcounter${action === "up" ? "/up" : ""}`;

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

    return env.ASSETS.fetch(request);
  },

  // Fires once a day per `triggers.crons` in wrangler.jsonc. The only code
  // path that ever calls the model — there is no client-reachable route
  // that does this, by design.
  async scheduled(event, env, ctx) {
    const seed = pickSeed();
    let raw = "";
    try {
      const result = await env.AI.run(DAILY_MODEL, {
        messages: [
          { role: "system", content: DAILY_SYSTEM_PROMPT },
          { role: "user", content: `Today's theme: ${seed}` }
        ],
        // Workers AI caps output at 256 tokens unless told otherwise, which
        // cuts a full page of JSON (~450-700 tokens) off mid-object so it
        // never parses. The system prompt is ~1,200 tokens, well inside the
        // model's context window with this much room for the reply.
        max_tokens: 1500
      });

      raw = String(result?.response ?? "");
      const content = parseDailyContent(raw);
      await env.DAILY_TEMPLATE.put(
        "latest",
        JSON.stringify({
          ...content,
          seed,
          generatedAt: new Date().toISOString()
        })
      );
      console.log(`[daily-template] generated from seed: "${seed}"`);
    } catch (err) {
      // Leave whatever's already in KV untouched — a failed generation
      // should never blank out or break the live template.
      console.error(
        `[daily-template] generation failed: ${err.message} ` +
          `(seed "${seed}", ${raw.length} chars returned, ending: ${JSON.stringify(raw.slice(-80))})`
      );
    }
  }
};

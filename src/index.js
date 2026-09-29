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
- Respond with ONLY valid JSON, no markdown fences, no commentary, matching exactly this shape:
{"headline": "SHORT ALL-CAPS TITLE", "subheadline": "one sarcastic sentence", "bodyParagraphs": ["short paragraph", "short paragraph"], "bulletPoints": ["short item", "short item", "short item", "short item"], "footerNote": "one short sarcastic closing line"}`;

function pickSeed() {
  return PROMPT_SEEDS[Math.floor(Math.random() * PROMPT_SEEDS.length)];
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
    footerNote: data.footerNote.slice(0, 200)
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
    try {
      const result = await env.AI.run(DAILY_MODEL, {
        messages: [
          { role: "system", content: DAILY_SYSTEM_PROMPT },
          { role: "user", content: `Today's theme: ${seed}` }
        ]
      });

      const content = parseDailyContent(result.response);
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
      console.error("[daily-template] generation failed:", err.message);
    }
  }
};

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);

      if (url.pathname === "/api/counter") {
        const action = url.searchParams.get("action");
        const apiKey = await env.COUNTER_API_TOKEN.get();
        const apiUrl = `https://api.counterapi.dev/v2/paperjammed/paperjammedtotalcounter${action === "up" ? "/up" : ""}`;

        const apiRes = await fetch(apiUrl, {
          headers: { Authorization: `Bearer ${apiKey}` }
        });
        const data = await apiRes.json();

        return new Response(JSON.stringify(data), {
          status: apiRes.status,
          headers: { "Content-Type": "application/json" }
        });
      }

      return env.ASSETS.fetch(request);
    } catch (err) {
      // TEMPORARY: expose the real error for debugging
      return new Response("ERROR: " + err.message + "\n\nSTACK: " + err.stack, {
        status: 500,
        headers: { "Content-Type": "text/plain" }
      });
    }
  }
};

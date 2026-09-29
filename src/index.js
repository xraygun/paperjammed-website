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

    return env.ASSETS.fetch(request);
  }
};

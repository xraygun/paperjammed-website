export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const action = url.searchParams.get('action'); // "get" or "up"

  const apiKey = await env.COUNTER_API_TOKEN.get();

  const apiUrl = `https://api.counterapi.dev/v2/paperjammed/paperjammedtotalcounter${action === 'up' ? '/up' : ''}`;

  const apiRes = await fetch(apiUrl, {
    headers: { Authorization: `Bearer ${apiKey}` }
  });
  const data = await apiRes.json();

  return new Response(JSON.stringify(data), {
    status: apiRes.status,
    headers: { 'Content-Type': 'application/json' }
  });
}

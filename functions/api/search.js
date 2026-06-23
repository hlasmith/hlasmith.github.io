const MODEL = "@cf/baai/bge-base-en-v1.5";
const TOPK = 10, THRESHOLD = 0.35, MAX_RESULTS = 5, MAX_Q = 200, CACHE_TTL = 3600;

export async function onRequestGet({ request, env }) {
  const q = (new URL(request.url).searchParams.get("q") || "").trim();
  if (!q) return json({ results: [] });
  if (q.length > MAX_Q) return json({ error: "Query too long." }, 400);

  const key = "q:" + q.toLowerCase().replace(/\s+/g, " ");
  if (env.SEARCH_CACHE) {
    const cached = await env.SEARCH_CACHE.get(key);
    if (cached) return json(JSON.parse(cached), 200, true);
  }

  const { data } = await env.AI.run(MODEL, { text: [q] });
  const hits = await env.VECTORIZE.query(data[0], { topK: TOPK, returnMetadata: "all" });

  const byUrl = new Map();
  for (const m of hits.matches) {
    if (m.score < THRESHOLD) continue;
    const cur = byUrl.get(m.metadata.url);
    if (!cur || cur.score < m.score) byUrl.set(m.metadata.url, { ...m.metadata, score: m.score });
  }
  const results = [...byUrl.values()].sort((a, b) => b.score - a.score).slice(0, MAX_RESULTS);
  const payload = { query: q, results };

  if (env.SEARCH_CACHE) await env.SEARCH_CACHE.put(key, JSON.stringify(payload), { expirationTtl: CACHE_TTL });
  return json(payload);
}

function json(obj, status = 200, cached = false) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store", "x-cache": cached ? "hit" : "miss" },
  });
}

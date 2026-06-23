const MODEL = "@cf/baai/bge-base-en-v1.5";
const CHUNK_WORDS = 180;

export async function onRequestPost({ request, env }) {
  if (request.headers.get("x-reindex-key") !== env.REINDEX_KEY) {
    return new Response("Unauthorized", { status: 401 });
  }
  const origin = new URL(request.url).origin;

  let urls = [];
  try { urls = await fromSitemap(origin); } catch (_) {}
  if (urls.length === 0) urls = await fromWritingIndex(origin);
  urls = [...new Set(urls)];

  const vectors = [];
  for (const url of urls) {
    try {
      const html = await (await fetch(url)).text();
      const { title, category, snippet, text } = parsePost(html);
      const chunks = chunk(text, CHUNK_WORDS);
      if (!chunks.length) continue;
      const { data } = await env.AI.run(MODEL, { text: chunks });
      data.forEach((values, i) => vectors.push({
        id: `${url}#${i}`, values, metadata: { url, title, category, snippet },
      }));
    } catch (_) { /* skip a post that fails, keep going */ }
  }
  if (vectors.length) await env.VECTORIZE.upsert(vectors);
  return Response.json({ posts: urls.length, vectors: vectors.length });
}

async function fromSitemap(origin) {
  const res = await fetch(`${origin}/sitemap.xml`);
  if (!res.ok) return [];
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim()).filter(u => u.includes("/blog/"));
}

async function fromWritingIndex(origin) {
  const html = await (await fetch(`${origin}/writing.html`)).text();
  return [...html.matchAll(/href="((?:\.\/)?blog\/[^"]+\.html)"/g)]
    .map(m => new URL(m[1].replace(/^\.\//, ""), `${origin}/`).toString());
}

function parsePost(html) {
  let h = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ");
  const h1 = (h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || "";
  const titleTag = (h.match(/<title>([^<]*)<\/title>/i) || [])[1] || "";
  const title = decode(h1.replace(/<[^>]+>/g, "").trim())
    || decode(titleTag).replace(/\s*[—-]\s*Harrison Smith\s*$/, "").trim();
  const snippet = decode((h.match(/<meta\s+name="description"\s+content="([^"]*)"/i) || [])[1] || "").trim();
  const metaBlock = (h.match(/class="post-hero-meta"[^>]*>([\s\S]*?)<\/div>/i) || [])[1] || "";
  const category = decode(metaBlock.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim().split("·")[0].trim();

  const start = h.search(/class="post-content"/i);
  let body = start >= 0 ? h.slice(start) : h;
  const footer = body.search(/class="footer-inner"|<footer/i);
  if (footer >= 0) body = body.slice(0, footer);
  const text = decode(body.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
  return { title, category, snippet, text };
}

function chunk(text, words) {
  const w = text.split(/\s+/).filter(Boolean);
  const out = [];
  for (let i = 0; i < w.length; i += words) out.push(w.slice(i, i + words).join(" "));
  return out;
}

function decode(s) {
  return s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ");
}

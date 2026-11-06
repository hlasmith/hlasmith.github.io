// Cloudflare Pages serves every file in the repo, including docs, tooling and CI
// config that visitors have no reason to see. This returns the site's 404 page
// for those paths. _routes.json limits this to just these paths (and /api/*), so
// ordinary page views never run a Function.
const HIDDEN = /^\/(?:\.claude\/|\.github\/|tools\/|(?:CLAUDE|SEARCH-SETUP|README)\.md$|\.lighthouserc\.json$)/i;

export async function onRequest({ request, next, env }) {
  const { pathname } = new URL(request.url);
  if (!HIDDEN.test(pathname)) return next();
  let body = 'Not found';
  try {
    const page = await env.ASSETS.fetch(new URL('/404', request.url));
    if (page.ok) body = await page.text();
  } catch (_) { /* fall back to plain text */ }
  return new Response(body, {
    status: 404,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex', 'x-content-type-options': 'nosniff' },
  });
}

# Semantic search — one-time setup (Cloudflare dashboard / CLI)

These steps are done once, in your Cloudflare account. The code is already in the repo.

1. Create the Vectorize index:
   `npx wrangler vectorize create blog-search --dimensions=768 --metric=cosine`

2. Create a KV namespace for the query cache (dashboard: Workers & Pages > KV, or):
   `npx wrangler kv namespace create SEARCH_CACHE`

3. In the Pages project > Settings > Bindings, add:
   - Workers AI binding named `AI`
   - Vectorize binding named `VECTORIZE`, index `blog-search`
   - KV namespace binding named `SEARCH_CACHE`

4. In Settings > Variables and secrets, add an encrypted secret:
   `REINDEX_KEY` = a long random string (keep it private).

5. Push to `main` and let it deploy.

6. Build the index once (replace YOUR_KEY):
   `curl -X POST -H "x-reindex-key: YOUR_KEY" https://hlasmith.co.uk/api/reindex`
   Expect JSON like `{"posts":N,"vectors":M}`.

7. Security > WAF > Rate limiting rules: add a rule on path `/api/search`,
   e.g. 10 requests per minute per IP.

8. Test: open https://hlasmith.co.uk/search.html and run a query.
   Check the dashboard shows usage tracking as free.

## Keep it free
- Stay on the Workers Free plan and do not add a payment method. On the free
  plan, exceeding a limit returns an error until the daily reset, never a charge.
- Re-run step 6 whenever you publish a new post (or wire it to a GitHub Action).

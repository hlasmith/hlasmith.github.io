// Renders a 1200x630 share image (LinkedIn / Open Graph) for every post,
// from the post's title, shelf and story diagram, into images/og/<slug>.png.
// Run after adding a post or changing its diagram:  node tools/og-images.js [slug ...]
// Needs Google Chrome installed (set CHROME=path if it isn't in the default place).
const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'images', 'og');
const CHROME = process.env.CHROME || [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
].find(p => fs.existsSync(p));
if (!CHROME) throw new Error('Chrome not found; set CHROME=/path/to/chrome');

const SHELF_CLASS = { 'Delivery, Agile & Tech': 's-delivery', 'University': 's-university', 'Life': 's-life', 'Sports': 's-sports' };
const FONTS = (fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').match(/<link rel="stylesheet" href="(https:\/\/fonts\.googleapis\.com[^"]+)"/) || [])[1];

function post(slug) {
  const html = fs.readFileSync(path.join(ROOT, 'blog', slug + '.html'), 'utf8');
  const title = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1].replace(/<[^>]+>/g, '').trim();
  const shelf = ((html.match(/class="post-hero-meta">([^<]*)/) || [])[1] || '').trim();
  const fig = (html.match(/<figure class="container cover">\s*([\s\S]*?)<\/figure>/) || [])[1];
  const author = (html.match(/"author":\s*\{[^}]*"name":\s*"([^"]+)"/) || [])[1] || 'Harrison Smith';
  if (!fig) throw new Error(slug + ': no story diagram (figure.cover) found');
  return { title, shelf, fig, author };
}

function page(p) {
  const shelfName = p.shelf.replace(/&amp;/g, '&');
  const initials = p.author.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<link rel="stylesheet" href="${FONTS}"><link rel="stylesheet" href="/css/style.css">
<style>
  html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; background: var(--bg); }
  .og { position: relative; box-sizing: border-box; width: 1200px; height: 630px; padding: 56px 56px 56px 78px;
        display: grid; grid-template-columns: 500px minmax(0, 1fr); gap: 44px; align-items: center; }
  .og::before { content: ""; position: absolute; inset: 0 auto 0 0; width: 18px; background: var(--s-bg); }
  .kick { display: flex; align-items: center; gap: 12px; font: 700 20px/1 var(--f-ui); letter-spacing: .06em; text-transform: uppercase; color: var(--muted); }
  .kick .shelf-dot { width: 16px; height: 16px; background: var(--s-bg); }
  .t { margin: 22px 0 0; font: 700 60px/1.04 var(--f-display); color: var(--ink); max-height: 380px; overflow: hidden; }
  .by { position: absolute; left: 78px; bottom: 44px; display: flex; align-items: center; gap: 12px; font: 600 20px/1 var(--f-ui); color: var(--muted); }
  .by .avatar { width: 40px; height: 40px; font-size: 15px; }
  .box { width: 100%; min-width: 0; height: 518px; display: flex; align-items: center; justify-content: center; }
  .fit { width: 700px; flex: none; transform-origin: center; }
</style></head>
<body><div class="og ${SHELF_CLASS[shelfName] || 's-delivery'}">
  <div><div class="kick"><span class="shelf-dot"></span>${p.shelf}</div><h1 class="t">${p.title}</h1></div>
  <div class="box"><div class="fit">${p.fig}</div></div>
  <div class="by"><span class="avatar" aria-hidden="true">${initials}</span>${p.author} · hlasmith.co.uk</div>
</div>
<script>
  function fit() {
    const t = document.querySelector('.t'); let s = 60; t.style.fontSize = '';
    while (t.scrollHeight > 380 && s > 36) t.style.fontSize = (s -= 2) + 'px';
    const box = document.querySelector('.box'), fit = document.querySelector('.fit');
    // Try a few layout widths; keep the one that can be drawn biggest without overflowing.
    let best = { k: 0, w: 700 };
    for (const w of [560, 600, 640, 700]) {
      fit.style.transform = ''; fit.style.width = w + 'px';
      const squashed = [fit, ...fit.querySelectorAll("*")].some(e => e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0);
      if (squashed) continue;
      const k = Math.min(box.clientWidth / fit.offsetWidth, box.clientHeight / fit.offsetHeight, 1.6);
      if (k > best.k) best = { k, w };
    }
    fit.style.width = best.w + 'px';
    if (!best.k) best.k = Math.min(box.clientWidth / fit.offsetWidth, box.clientHeight / fit.offsetHeight, 1);
    fit.style.transform = 'scale(' + best.k + ')';
  }
  Promise.all([document.fonts.load("700 60px 'Bodoni Moda'"), document.fonts.load("600 16px 'Public Sans'"), document.fonts.load("italic 16px Newsreader")]).then(() => document.fonts.ready).then(fit);
</script></body></html>`;
}

const slugs = process.argv.slice(2).length ? process.argv.slice(2)
  : fs.readdirSync(path.join(ROOT, 'blog')).filter(f => f.endsWith('.html')).map(f => f.replace(/\.html$/, ''));
const pages = Object.fromEntries(slugs.map(s => [s, page(post(s))]));

const TYPES = { '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  const m = u.match(/^\/__og\/(.+)$/);
  if (m && pages[m[1]]) { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); return res.end(pages[m[1]]); }
  const f = path.join(ROOT, u);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(0, () => {
  const port = server.address().port;
  fs.mkdirSync(OUT, { recursive: true });
  const shoot = (i) => {
    if (i >= slugs.length) return server.close();
    const s = slugs[i], file = path.join(OUT, s + '.png');
    // Chrome must run async so this process can keep serving its requests.
    require('child_process').execFile(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars',
      '--force-device-scale-factor=1', '--window-size=1200,630', '--virtual-time-budget=8000',
      '--user-data-dir=' + path.join(require('os').tmpdir(), 'og-chrome'),
      '--screenshot=' + file, `http://localhost:${port}/__og/${s}`], () => { console.log('images/og/' + s + '.png'); shoot(i + 1); });
  };
  shoot(0);
});

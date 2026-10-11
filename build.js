#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const { ROOT, BASE, data, url } = require('./src/lib');
const { page } = require('./src/layout');

const OUT = path.join(ROOT, 'docs');
const ASSETS = path.join(ROOT, 'src', 'assets');

const rm = p => fs.existsSync(p) && fs.rmSync(p, { recursive: true, force: true });
const mk = p => fs.mkdirSync(p, { recursive: true });

function write(routePath, html) {
  const rel = routePath === '/' ? 'index.html'
    : routePath.replace(/^\//, '').replace(/\/$/, '') + '/index.html';
  const full = path.join(OUT, rel);
  mk(path.dirname(full));
  fs.writeFileSync(full, html);
  return rel;
}

function copyDir(src, dest) {
  mk(dest);
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dest, e.name);
    if (e.isDirectory()) copyDir(s, d); else fs.copyFileSync(s, d);
  }
}

/* ------------------------------------------------------------------ assets */
function assets() {
  copyDir(ASSETS, path.join(OUT, 'assets'));

  /* Vendor only the GSAP modules actually used — ScrollTrigger, SplitText,
     DrawSVG, CustomEase, Flip. Self-hosted: no CDN, no third-party request. */
  const want = ['gsap.min.js', 'ScrollTrigger.min.js', 'SplitText.min.js',
    'DrawSVGPlugin.min.js', 'CustomEase.min.js', 'Flip.min.js'];
  const from = path.join(ROOT, 'node_modules', 'gsap', 'dist');
  const to = path.join(OUT, 'assets', 'vendor', 'gsap');
  mk(to);
  let bytes = 0;
  for (const f of want) {
    const s = path.join(from, f);
    if (!fs.existsSync(s)) throw new Error('Missing GSAP file: ' + f + ' (run npm install)');
    fs.copyFileSync(s, path.join(to, f));
    bytes += fs.statSync(s).size;
  }
  fs.writeFileSync(path.join(to, 'LICENSE.txt'),
    'GSAP 3.15.0 — GreenSock. Used under the standard "no charge" licence: https://gsap.com/standard-license\n');

  /* Self-host the three variable fonts (latin subset). */
  const fonts = [
    ['@fontsource-variable/bodoni-moda', 'bodoni-moda-latin-wght-normal.woff2', 'bodoni-moda.woff2'],
    ['@fontsource-variable/public-sans', 'public-sans-latin-wght-normal.woff2', 'public-sans.woff2'],
    ['@fontsource-variable/geist-mono', 'geist-mono-latin-wght-normal.woff2', 'geist-mono.woff2']
  ];
  const fto = path.join(OUT, 'assets', 'fonts');
  mk(fto);
  let fbytes = 0;
  for (const [pkg, file, as] of fonts) {
    const s = path.join(ROOT, 'node_modules', pkg, 'files', file);
    if (!fs.existsSync(s)) throw new Error('Missing font: ' + s + ' (run npm install)');
    fs.copyFileSync(s, path.join(fto, as));
    fbytes += fs.statSync(s).size;
  }
  fs.writeFileSync(path.join(fto, 'LICENSE.txt'),
    'Bodoni Moda, Public Sans and Geist Mono are licensed under the SIL Open Font License 1.1.\nhttps://openfontlicense.org\n');

  /* Favicon: the mark, as a square-cropped beam. */
  fs.writeFileSync(path.join(OUT, 'assets', 'icon.svg'),
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44">
<rect width="44" height="44" fill="#0E1626"/>
<circle cx="22" cy="22" r="14" fill="none" stroke="#C09C60" stroke-width="1.2" opacity=".55"/>
<path d="M22 22 L37 16 A16 16 0 0 1 37 28 Z" fill="#C09C60" opacity=".9"/>
<circle cx="22" cy="22" r="3" fill="#C09C60"/>
</svg>`);
  return { gsap: bytes, fonts: fbytes };
}

/* ------------------------------------------------------------------ pages */
function buildAll() {
  rm(OUT); mk(OUT);
  const routes = [];
  const add = p => { routes.push(write(p.path, page(p))); };

  add(require('./src/pages/home')());
  require('./src/pages/register')().forEach(add);
  add(require('./src/pages/firm')());
  add(require('./src/pages/incorporate')());
  require('./src/pages/forms')().forEach(add);
  add(require('./src/pages/notices')());
  add(require('./src/pages/contact')());
  require('./src/pages/legal')().forEach(add);

  /* 404 — GitHub Pages serves /404.html for unknown paths. */
  const nf = require('./src/pages/notfound')();
  fs.writeFileSync(path.join(OUT, '404.html'), page(nf));
  routes.push('404.html');

  /* URL preservation: /newaboutus/ is the only existing URL that moves. */
  const redirects = [['/newaboutus/', '/firm/']];
  for (const [from, to] of redirects) {
    const target = url(to);
    write(from, `<!doctype html><html lang="en-IE"><head><meta charset="utf-8">
<title>Moved</title><meta name="robots" content="noindex">
<link rel="canonical" href="${target}">
<meta http-equiv="refresh" content="0; url=${target}">
<style>body{font:16px/1.6 system-ui;margin:3rem;max-width:36rem}</style></head>
<body><p>This page has moved to <a href="${target}">${target}</a>.</p>
<script>location.replace(${JSON.stringify(target)});</script></body></html>`);
    routes.push(from);
  }

  const a = assets();

  /* Preview hygiene: keep it out of search results. */
  fs.writeFileSync(path.join(OUT, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
  fs.writeFileSync(path.join(OUT, '.nojekyll'), '');

  return { routes, assets: a };
}

const r = buildAll();
const count = n => new Intl.NumberFormat('en-IE').format(n);
console.log(`built ${r.routes.length} routes into docs/${BASE ? '  (BASE=' + BASE + ')' : ''}`);
console.log(`  gsap vendored: ${count(Math.round(r.assets.gsap / 1024))} KB · fonts: ${count(Math.round(r.assets.fonts / 1024))} KB`);

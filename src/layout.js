'use strict';
const { data, url, esc, typo, attr } = require('./lib');
const site = data('site');

const NAV = [
  { href: '/services/', label: 'Obligations', desc: 'The register of what a company must do' },
  { href: '/incorporate/', label: 'Incorporate', desc: 'Four company types, four live forms' },
  { href: '/firm/', label: 'The firm', desc: 'Who does the work' },
  { href: '/news-and-events/', label: 'Notices', desc: 'What changed, and when' },
  { href: '/contact/', label: 'Contact', desc: 'Dublin and London' }
];

/* Retained as a no-op so page templates keep a single call signature. */
const character = () => '';

const previewBanner = () => !site.preview.isPreview ? '' : `
<div class="pv" role="region" aria-label="Preview notice">
  <p class="pv__t"><b>Concept preview.</b> <span class="pv__long">${esc(site.preview.bannerText)} </span>Live site:
  <a href="${site.domain}" rel="noopener">bcos.ie</a></p>
</div>`;

const header = (current) => `
<a class="skip" href="#main">Skip to content</a>
<header class="hd" data-hd>
  <div class="hd__in">
    <a class="hd__mark" href="${url('/')}"${current === '/' ? ' aria-current="page"' : ''}>
      <svg class="mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <rect width="32" height="32" rx="7" fill="currentColor"/>
        <circle cx="11.5" cy="16" r="3.4" fill="#fff"/>
        <path d="M17.5 11.2A6.6 6.6 0 0 1 17.5 20.8" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".95"/>
        <path d="M21.8 8.4A11 11 0 0 1 21.8 23.6" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".55"/>
      </svg>
      <span class="hd__name"><b>Beacon</b><span>Company Secretaries</span></span>
    </a>
    <nav class="hd__nav" aria-label="Primary">
      <ul>
        ${NAV.map(n => `<li><a href="${url(n.href)}"${current === n.href ? ' aria-current="page"' : ''}><span>${esc(n.label)}</span></a></li>`).join('')}
      </ul>
    </nav>
    <div class="hd__act">
      <a class="hd__tel" href="${site.phone.href}">${esc(site.phone.display)}</a>
      <a class="btn btn--primary" href="${url('/contact/')}">Talk to us</a>
    </div>
    <button class="hd__burger" type="button" aria-expanded="false" aria-controls="menu" data-menu-toggle>
      <span class="hd__burger-b" aria-hidden="true"></span>
      <span class="sr">Menu</span>
    </button>
  </div>
</header>
<div class="menu" id="menu" hidden data-menu>
  <nav aria-label="Primary, expanded">
    <ol class="menu__list">
      ${NAV.map(n => `<li class="menu__i"><a href="${url(n.href)}">
        <span class="menu__lab">${esc(n.label)}</span>
        <span class="menu__d">${esc(n.desc)}</span></a></li>`).join('')}
    </ol>
  </nav>
  <div class="menu__foot">
    <a class="btn btn--primary btn--lg" href="${url('/contact/')}">Talk to us</a>
    <a class="btn btn--secondary btn--lg" href="${site.phone.href}">${esc(site.phone.display)}</a>
  </div>
</div>`;

const footer = () => `
<section class="sec sec--s" aria-labelledby="cta-h">
  <div class="wrap">
    <div class="cta">
      <div>
        <h2 id="cta-h">Tell us what your company is, and we will tell you what it owes.</h2>
        <p>No obligation. If you are not sure which of these services you need, describe the company and what is coming up — that is usually enough for us to answer.</p>
      </div>
      <div class="cta__acts">
        <a class="btn btn--primary btn--lg" href="${url('/contact/')}">Talk to us</a>
        <a class="btn btn--secondary btn--lg" href="${site.phone.href}">${esc(site.phone.display)}</a>
      </div>
    </div>
  </div>
</section>

<footer class="ft">
  <div class="ft__in">
    <div class="ft__grid">
      <div class="ft__col">
        <div class="ft__brand">
          <svg class="mark" viewBox="0 0 32 32" aria-hidden="true" style="color:var(--blue)">
            <rect width="32" height="32" rx="7" fill="currentColor"/>
            <path d="M16 9.5 L24 16 L16 22.5 Z" fill="#fff" opacity=".95"/>
            <rect x="8" y="14.6" width="5.6" height="2.8" rx="1.4" fill="#fff" opacity=".6"/>
          </svg>
          <span class="hd__name"><b>Beacon</b><span>Company Secretaries</span></span>
        </div>
        <p class="ft__blurb">An independent firm of company secretaries, holding the statutory record for companies in Ireland and the UK since 2002.</p>
      </div>
      ${site.offices.map(o => `<div class="ft__col">
        <h2 class="ft__h">${esc(o.label)}</h2>
        <p class="ft__role">${esc(o.role)}</p>
        <address>${o.lines.map(l => esc(l)).join('<br>')}<br>${esc(o.postal)}<br>${esc(o.country)}</address>
      </div>`).join('')}
      <div class="ft__col">
        <h2 class="ft__h">Contact</h2>
        <ul class="ft__ul">
          <li><a href="${site.phone.href}">${esc(site.phone.display)}</a></li>
          <li><a href="mailto:${site.email}">${esc(site.email)}</a></li>
          <li class="ft__hours">${esc(site.hours.display)}</li>
        </ul>
        <h2 class="ft__h" style="margin-top:20px">Registries</h2>
        <ul class="ft__ul ft__ul--reg">
          ${site.registries.slice(0, 3).map(r => `<li><a href="${r.url}" rel="noopener">${esc(r.abbr)}<span>${esc(r.label)}</span></a></li>`).join('')}
        </ul>
      </div>
    </div>
    <div class="ft__base">
      <p class="ft__legal">
        ${esc(site.legalName)} &middot; Registered in Ireland no.&nbsp;${esc(site.cro)} &middot; Registered office: ${esc(site.offices[0].lines.join(', '))}, ${esc(site.offices[0].postal)}
      </p>
      <ul class="ft__mini">
        <li><a href="${url('/privacy/')}">Privacy</a></li>
        <li><a href="${url('/cookies/')}">Cookies</a></li>
        ${site.social.map(s => `<li><a href="${s.url}" rel="noopener me">${esc(s.label)}</a></li>`).join('')}
      </ul>
      <p class="ft__pv">Unofficial concept preview. Not affiliated with or authorised by ${esc(site.legalName)}.</p>
    </div>
  </div>
</footer>`;

/**
 * @param {object} o page descriptor
 */
function page(o) {
  const title = o.title;
  const canonical = site.domain + (o.path === '/' ? '/' : o.path);
  const jsonld = (o.jsonld || []).filter(Boolean);
  return `<!doctype html>
<html lang="en-IE"${o.theme ? ` data-section="${o.theme}"` : ''}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(o.description)}">
${site.preview.noindex ? '<meta name="robots" content="noindex, nofollow">' : `<link rel="canonical" href="${canonical}">`}
<meta name="theme-color" content="#FFFFFF">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(o.description)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_IE">
<meta property="og:site_name" content="${esc(site.name)}">
<link rel="preload" href="${url('/assets/fonts/inter.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${url('/assets/css/site.css')}">
<link rel="icon" href="${url('/assets/icon.svg')}" type="image/svg+xml">
${jsonld.map(j => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n')}
</head>
<body class="${o.bodyClass || ''}" data-page="${esc(o.id || '')}">
${previewBanner()}
${header(o.path)}
<main id="main" tabindex="-1">
${o.body}
</main>
${footer()}
<script src="${url('/assets/vendor/gsap/gsap.min.js')}" defer></script>
<script src="${url('/assets/vendor/gsap/ScrollTrigger.min.js')}" defer></script>
<script src="${url('/assets/vendor/gsap/SplitText.min.js')}" defer></script>
<script src="${url('/assets/vendor/gsap/DrawSVGPlugin.min.js')}" defer></script>
<script src="${url('/assets/vendor/gsap/CustomEase.min.js')}" defer></script>
${o.needsFlip ? `<script src="${url('/assets/vendor/gsap/Flip.min.js')}" defer></script>` : ''}
<script src="${url('/assets/js/beacon.js')}" defer></script>
${o.scripts || ''}
</body>
</html>`;
}

/* A compact figures card used on every inner-page opener, so the pages read as
   one product rather than a set of templates. */
const bearing = (rows, note) => `
<div class="card card--raised figs" data-anim>
  <dl class="figs__l">
    ${rows.map(r => `<div class="figs__r">
      <dt>${esc(r[0])}</dt>
      <dd${r[2] ? ' class="figs__hi"' : ''}>${esc(r[1])}</dd>
    </div>`).join('')}
  </dl>
  ${note ? `<p class="figs__n">${esc(note)}</p>` : ''}
</div>`;

module.exports = { page, header, footer, character, bearing, NAV, site };

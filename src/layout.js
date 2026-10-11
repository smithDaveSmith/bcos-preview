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

/* The firm's "light character": a flash pattern used as the section ornament.
   A beacon is identified by its interval, not its brightness. */
const character = (n = 2) =>
  `<span class="char" aria-hidden="true">${
    Array.from({ length: n }, (_, i) => `<i style="--i:${i}"></i>`).join('')
  }</span>`;

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
      <svg class="mark" viewBox="0 0 44 44" aria-hidden="true" focusable="false">
        <circle class="mark__ring" cx="22" cy="22" r="17" fill="none" stroke="currentColor" stroke-width="1"/>
        <path class="mark__beam" d="M22 22 L39 15 A18 18 0 0 1 39 29 Z" fill="currentColor" opacity=".85"/>
        <circle class="mark__core" cx="22" cy="22" r="3.2" fill="currentColor"/>
      </svg>
      <span class="hd__name"><b>Beacon</b><span>Company Secretaries</span></span>
    </a>
    <nav class="hd__nav" aria-label="Primary">
      <ul>
        ${NAV.map(n => `<li><a href="${url(n.href)}"${current === n.href ? ' aria-current="page"' : ''}><span>${esc(n.label)}</span></a></li>`).join('')}
      </ul>
    </nav>
    <a class="hd__call" href="${site.phone.href}"><span class="hd__call-l">Dublin</span> ${esc(site.phone.display)}</a>
    <button class="hd__burger" type="button" aria-expanded="false" aria-controls="menu" data-menu-toggle>
      <span class="hd__burger-b" aria-hidden="true"></span>
      <span class="sr">Menu</span>
    </button>
  </div>
</header>
<div class="menu" id="menu" hidden data-menu>
  <nav aria-label="Primary, expanded">
    <ol class="menu__list">
      ${NAV.map((n, i) => `<li class="menu__i"><a href="${url(n.href)}">
        <span class="menu__n">${String(i + 1).padStart(2, '0')}</span>
        <span class="menu__lab">${esc(n.label)}</span>
        <span class="menu__d">${esc(n.desc)}</span></a></li>`).join('')}
    </ol>
  </nav>
  <div class="menu__foot">
    <a href="${site.phone.href}">${esc(site.phone.display)}</a>
    <a href="mailto:${site.email}">${esc(site.email)}</a>
  </div>
</div>`;

const footer = () => `
<footer class="ft">
  <div class="ft__beam" aria-hidden="true"></div>
  <div class="ft__in">
    <div class="ft__lead">
      <p class="ft__cue">Talk to us</p>
      <p class="ft__big">Tell us what your company is,<br>and we will tell you what it owes.</p>
      <div class="ft__acts">
        <a class="btn btn--gold" href="${url('/contact/')}"><span>Start a conversation</span></a>
        <a class="btn btn--ghost" href="${site.phone.href}"><span>${esc(site.phone.display)}</span></a>
      </div>
    </div>
    <div class="ft__grid">
      ${site.offices.map(o => `<div class="ft__col">
        <h2 class="ft__h">${esc(o.label)}</h2>
        <p class="ft__role">${esc(o.role)}</p>
        <address>${o.lines.map(l => esc(l)).join('<br>')}<br>${esc(o.postal)}<br>${esc(o.country)}</address>
      </div>`).join('')}
      <div class="ft__col">
        <h2 class="ft__h">Direct</h2>
        <ul class="ft__ul">
          <li><a href="${site.phone.href}">${esc(site.phone.display)}</a></li>
          <li><a href="mailto:${site.email}">${esc(site.email)}</a></li>
          <li class="ft__hours">${esc(site.hours.display)}</li>
        </ul>
      </div>
      <div class="ft__col">
        <h2 class="ft__h">Registries</h2>
        <ul class="ft__ul ft__ul--reg">
          ${site.registries.map(r => `<li><a href="${r.url}" rel="noopener">${esc(r.abbr)}<span>${esc(r.label)}</span></a></li>`).join('')}
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
<meta name="theme-color" content="#0E1626" media="(prefers-color-scheme: dark)">
<meta name="theme-color" content="#F4F2EC" media="(prefers-color-scheme: light)">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(o.description)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_IE">
<meta property="og:site_name" content="${esc(site.name)}">
<link rel="preload" href="${url('/assets/fonts/bodoni-moda.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${url('/assets/fonts/public-sans.woff2')}" as="font" type="font/woff2" crossorigin>
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

/* The bearing panel: the instrument's language at the smallest scale. Every
   inner page opens with the same four-figure reading, so the pages feel like
   entries in one record rather than separate templates. */
const bearing = (rows, note) => `
<div class="bearing" data-anim="rise">
  <p class="lab">Bearing</p>
  <dl class="bearing__l">
    ${rows.map(r => `<div class="bearing__r">
      <dt>${esc(r[0])}</dt>
      <dd>${r[2] ? `<b>${esc(r[1])}</b>` : esc(r[1])}</dd>
    </div>`).join('')}
  </dl>
  ${note ? `<p class="bearing__n">${esc(note)}</p>` : ''}
</div>`;

module.exports = { page, header, footer, character, bearing, NAV, site };

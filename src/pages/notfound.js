'use strict';
const { data, url, esc, typo, headline } = require('../lib');
const { character } = require('../layout');
const ob = data('obligations');

module.exports = function notfound() {
  const body = `
<section class="sec sec--l" data-tone="mist">
  <div class="wrap">
    <p class="eyebrow">404</p>
    <h1 class="d1" style="margin-top:14px">${typo('No light at this bearing.')}</h1>
    <p class="lede" style="margin-top:24px;color:var(--body);max-width:48ch">${typo('The page you were looking for is not here. These are the ones that are.')}</p>
    <div class="hero__acts" style="margin-top:34px">
      <a class="btn btn--primary" href="${url('/')}">Home</a>
      <a class="btn btn--ghost" href="${url('/services/')}">The register</a>
      <a class="btn btn--ghost" href="${url('/contact/')}">Contact</a>
    </div>
  </div>
</section>
<section class="sec" >
  <div class="wrap">
    <h2 class="eyebrow">Standing obligations</h2>
    <div class="reg" style="margin-top:14px">
      ${ob.entries.filter(e => e.group === 'standing').map(e => `
      <a class="reg__e" href="${url('/services/' + e.slug + '/')}">
        <span class="reg__in"><span class="reg__folio fig">${esc(e.folio)}</span>
        <span class="reg__body"><span class="reg__t">${esc(e.title)}</span></span></span>
      </a>`).join('')}
    </div>
  </div>
</section>`;
  return { id: '404', path: '/404', title: 'Page not found | Beacon', description: 'The page could not be found.', body };
};

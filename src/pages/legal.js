'use strict';
const { data, url, esc, typo, headline } = require('../lib');
const site = data('site');

/* The live site has a privacy policy and a cookie page. Their text is the
   firm's own legal content and is not reproduced or rewritten here; these
   pages preserve the URLs and point at the authoritative versions. */
function legalStub(o) {
  const body = `
<section class="sec sec--s" data-tone="night">
  <div class="wrap">
    <h1 class="d2" data-split style="max-width:18ch">${headline(o.heading)}</h1>
    <p class="lede" style="margin-top:22px;color:#A9B2C6;max-width:56ch">${typo(o.lede)}</p>
  </div>
</section>
<section class="sec" data-tone="paper">
  <div class="wrap" style="max-width:760px">
    <div class="frm__demo">
      <p><b>Placeholder in this preview.</b> ${typo('This page exists so that the URL is preserved. The firm’s own ' + o.name + ' is legal text and has not been rewritten or reproduced here — it would have to be reviewed and carried across unchanged before any launch.')}</p>
    </div>
    <p style="margin-top:26px"><a class="btn btn--ink" href="${o.liveUrl}" rel="noopener"><span>Read the current ${esc(o.name)} on bcos.ie</span></a></p>
    <div class="prose" style="margin-top:var(--sp-s)">
      <p>${typo(o.extra)}</p>
      <p>${typo('This preview sets no cookies and runs no analytics. It loads no third-party resources: the fonts and the animation library are served from the same origin as the page.')}</p>
    </div>
  </div>
</section>`;
  return { id: 'legal', path: o.path, title: o.title, description: o.description, body };
}

module.exports = function legal() {
  return [
    legalStub({
      path: '/privacy/', name: 'privacy policy',
      heading: 'Privacy|policy',
      title: 'Privacy policy | Beacon',
      description: 'Privacy policy for Beacon Company Secretaries Limited.',
      lede: 'Beacon handles director and beneficial owner data in the course of its work, which makes this document more than a formality.',
      liveUrl: site.domain + '/privacy/',
      extra: 'Any launch version would need the policy reviewed against what the incorporation and RBO forms actually collect, and against the firm’s obligations as a trust and company service provider.'
    }),
    legalStub({
      path: '/cookies/', name: 'cookie policy',
      heading: 'Cookies',
      title: 'Cookies | Beacon',
      description: 'Cookie policy for Beacon Company Secretaries Limited.',
      lede: 'What the site stores on your device, and why.',
      liveUrl: site.domain + '/cookies/',
      extra: 'The live site runs Google Analytics and a consent manager. A rebuild is a good moment to decide whether analytics are needed at all — if they are dropped, the consent banner goes with them.'
    })
  ];
};

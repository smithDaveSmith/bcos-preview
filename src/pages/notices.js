'use strict';
const { data, url, esc, typo, headline } = require('../lib');
const { character, bearing } = require('../layout');
const site = data('site');
const nts = data('notices');
const statute = data('statute');

module.exports = function notices() {
  const body = `
<section class="sec sec--s" data-tone="night">
  <div class="sec__glow" aria-hidden="true"></div>
  <div class="wrap">
    <div class="open">
      <div>
        <div class="sec__no" style="border-top:0"><span class="lab">Notices</span>${character(2)}</div>
    <h1 class="d1" data-split style="margin-top:20px;max-width:14ch">${headline('What changed,|and when.')}</h1>
    <p class="lede" style="margin-top:24px;color:#A9B2C6;max-width:56ch">${typo('Company law moves, and a note written while something was still a Bill stops being true once it is an Act. Every item here carries the date it was last checked and the source it was checked against.')}</p>
      </div>
      ${bearing([
        ['Notices', String(nts.items.length), true],
        ['Last reviewed', '10 October 2026', true],
        ['Corrected since', String(nts.items.filter(n => n.corrected).length) + ' items'],
        ['Sources', 'CRO \u00b7 RBO \u00b7 DETE']
      ], 'Nothing here is an invented announcement. Each item names the source it was checked against.')}
    </div>
  </div>
</section>

<section class="sec" data-tone="paper">
  <div class="wrap">
    <div class="nts">
      ${nts.items.map(n => `
      <article class="nts__i" data-anim="rise" id="${esc(n.id)}">
        <div class="nts__hd">
          <span class="nts__date fig">${esc(n.dateLabel)}</span>
          <div>
            <span class="nts__kick">${esc(n.kicker)}</span>
            <h2 class="nts__t">${typo(esc(n.title))}${n.corrected ? '<span class="tag">Corrected</span>' : ''}</h2>
          </div>
          <p class="nts__s">${typo(esc(n.summary))}</p>
        </div>
        <div class="nts__body prose">
          ${n.body.map(p => `<p>${typo(esc(p))}</p>`).join('')}
          ${n.table === 'sizeThresholds' ? `
          <div class="scroll-x" style="margin-top:26px">
            <table class="tbl">
              <thead><tr><th scope="col">Size</th><th scope="col">Balance sheet</th><th scope="col">Net turnover</th><th scope="col">Employees</th></tr></thead>
              <tbody>${statute.sizeThresholds.rows.map(r => `<tr><th scope="row">${esc(r.size)}</th><td>${esc(r.balanceSheet)}</td><td>${esc(r.turnover)}</td><td>${esc(r.employees)}</td></tr>`).join('')}</tbody>
            </table>
          </div>
          <p class="tbl__note">${typo(statute.sizeThresholds.footnote)}</p>` : ''}
          <p class="nts__src">Source: <a href="${esc(n.source.url)}" rel="noopener">${esc(n.source.label)}</a></p>
        </div>
      </article>`).join('')}
    </div>

    <div class="frm__demo" style="margin-top:var(--sp-s)" data-anim="rise">
      <p><b>A note on this page.</b> ${typo('Every item above restates a rule and names the source it was verified against on ' + nts.reviewed + '. Nothing here is an invented announcement. Three items are marked “Corrected” because the equivalent note on the current site states a position that has since been superseded.')}</p>
    </div>
  </div>
</section>`;

  return {
    id: 'notices', path: '/news-and-events/',
    title: 'Notices — Irish company law updates | Beacon',
    description: 'Verified updates on Irish company law: the audit exemption rule under the 2024 Act, the two filing deadline calculations, size thresholds, beneficial ownership and voluntary strike-off.',
    jsonld: [{
      '@context': 'https://schema.org', '@type': 'Blog',
      name: 'Notices', publisher: { '@type': 'Organization', name: site.legalName },
      blogPost: nts.items.map(n => ({
        '@type': 'BlogPosting', headline: n.title, description: n.summary,
        datePublished: n.date, author: { '@type': 'Organization', name: site.legalName }
      }))
    }],
    body
  };
};

'use strict';
const { data, url, esc, typo, headline } = require('../lib');
const { character, bearing } = require('../layout');
const { entryRow } = require('./home');

const site = data('site');
const ob = data('obligations');
const statute = data('statute');

function indexPage() {
  const body = `
<section class="sec sec--open" data-tone="mist">
  <div class="wrap">
    <div class="open">
      <div>
        <p class="eyebrow">The register</p>
        <h1 class="d1" data-split style="margin-top:14px">${typo('What a company owes, and when.')}</h1>
        <p class="lede" style="margin-top:24px">${typo('Sixteen entries. Three of them have a statutory clock attached, and those are the ones that carry a penalty. Each entry says who it applies to, what sets it running, and what happens if it is missed.')}</p>
      </div>
      ${bearing([
        ['Entries', String(ob.entries.length), true],
        ['With a statutory clock', String(ob.entries.filter(e => e.clock).length), true],
        ['Maximum penalty per return', '\u20AC1,200', true],
        ['Audit exemption lost after', '2 late filings in 5 years']
      ], 'Figures from the Companies Registration Office, checked October 2026.')}
    </div>
  </div>
</section>

<section class="sec"  aria-labelledby="reg-h">
  <div class="wrap">
    <h2 id="reg-h" class="sr">All entries</h2>
    <div class="regbar" data-regbar>
      <div class="regbar__set" role="group" aria-label="Filter the register">
        <button type="button" class="regbar__b" data-filter="all" aria-pressed="true">All</button>
        ${ob.groups.map(g => `<button type="button" class="regbar__b" data-filter="${esc(g.id)}" aria-pressed="false">${esc(g.label)}</button>`).join('')}
      </div>
      <p class="regbar__c" data-regcount role="status">${ob.entries.length} of ${ob.entries.length} entries</p>
    </div>

    <div class="reg" data-reg>
      ${ob.groups.map(g => {
        const items = ob.entries.filter(e => e.group === g.id);
        return `
      <section class="reg__grp" data-group="${esc(g.id)}" aria-labelledby="g-${esc(g.id)}">
        <div class="reg__grphd">
          <span class="reg__grpn">${items.length} ${items.length === 1 ? 'entry' : 'entries'}</span>
          <h3 class="reg__grpt" id="g-${esc(g.id)}">${esc(g.label)}</h3>
          <p class="reg__grpl">${typo(esc(g.lede))}</p>
        </div>
        ${items.map(e => entryRow(e)).join('')}
      </section>`;
      }).join('')}
    </div>
  </div>
</section>

<section class="sec sec--l" data-tone="mist" aria-labelledby="sz">
  <div class="wrap">
    <div class="sec__head">
      <div><span class="eyebrow">Reference</span>
      <h2 id="sz" class="d2" style="margin-top:18px">${typo('Company size thresholds')}</h2></div>
      <div data-anim="rise"><p class="lede">${typo(statute.sizeThresholds.note)}</p></div>
    </div>
    <div class="scroll-x" data-anim="rise">
      <table class="tbl">
        <caption>Thresholds applying to financial years commencing on or after 1 January 2024</caption>
        <thead><tr><th scope="col">Size</th><th scope="col">Balance sheet</th><th scope="col">Net turnover</th><th scope="col">Employees</th></tr></thead>
        <tbody>
        ${statute.sizeThresholds.rows.map(r => `<tr><th scope="row">${esc(r.size)}</th><td>${esc(r.balanceSheet)}</td><td>${esc(r.turnover)}</td><td>${esc(r.employees)}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>
    <p class="tbl__note">${typo(statute.sizeThresholds.footnote)}</p>
  </div>
</section>`;

  return {
    id: 'register', path: '/services/', needsFlip: true,
    title: 'Obligations — the register | Beacon',
    description: 'Sixteen company secretarial obligations for Irish companies, each with who it applies to, what triggers it, the statutory deadline and the consequence of missing it.',
    jsonld: [{
      '@context': 'https://schema.org', '@type': 'ItemList',
      name: 'Company secretarial obligations',
      itemListElement: ob.entries.map((e, i) => ({
        '@type': 'ListItem', position: i + 1, name: e.title,
        url: site.domain + '/services/' + e.slug + '/'
      }))
    }],
    body
  };
}

/* Where this entry sits in the register. Gives the page its bearings and keeps
   the sixteen entries linked to one another. */
function siblings(e) {
  const grp = ob.groups.find(g => g.id === e.group);
  const items = ob.entries.filter(x => x.group === e.group);
  if (items.length < 2) return '';
  return `
  <div class="sib" data-anim="rise">
    <p class="eyebrow">Also in ${esc(grp.label.toLowerCase())}</p>
    <ul class="sib__l">
      ${items.map(x => x.slug === e.slug
        ? `<li class="sib__i sib__i--here"><span class="fig">${esc(x.folio)}</span><span>${esc(x.title)}</span><em>You are here</em></li>`
        : `<li class="sib__i"><a href="${url('/services/' + x.slug + '/')}"><span class="fig">${esc(x.folio)}</span><span>${esc(x.title)}</span></a></li>`
      ).join('')}
    </ul>
  </div>`;
}

/* Keep titles inside the ~60-character window search results actually show. */
function shortTitle(t) {
  const suffix = ' | Beacon';
  const max = 60 - suffix.length;
  const short = t.length > max ? t.replace(/^(Appointment, resignation and removal of|Creation and maintenance of) /i, '') : t;
  return (short.length > max ? short.slice(0, max - 1).replace(/[ ,]+$/, '') + '\u2026' : short) + suffix;
}

function entryPage(e, i, all) {
  const prev = all[i - 1], next = all[i + 1];
  const grp = ob.groups.find(g => g.id === e.group);
  const body = `
<section class="sec sec--s ent__hd" >
  <div class="wrap">
    <nav aria-label="Breadcrumb"><ol class="ent__crumb">
      <li><a href="${url('/')}">Home</a></li><li aria-hidden="true">/</li>
      <li><a href="${url('/services/')}">Register</a></li><li aria-hidden="true">/</li>
      <li>${esc(grp ? grp.label : '')}</li>
    </ol></nav>
    <div class="ent__grid">
      <div>
        <span class="ent__folio fig">Entry ${esc(e.folio)} of 16</span>
        <h1 class="d2" data-split>${headline(esc(e.title))}</h1>
        <p class="lede" style="margin-top:22px">${typo(esc(e.lede))}</p>
        ${siblings(e)}
      </div>
      <div data-anim="rise">
        <div class="ent__facts">
          <div class="ent__f"><span class="ent__fk">Applies to</span><span class="ent__fv">${typo(esc(e.applies))}</span></div>
          <div class="ent__f"><span class="ent__fk">Triggered by</span><span class="ent__fv">${typo(esc(e.trigger))}</span></div>
          ${e.clock ? `<div class="ent__f"><span class="ent__fk">Deadline</span><span class="ent__fv ent__fv--clock">${typo(esc(e.clock))}</span></div>` : ''}
          ${e.clockNote ? `<div class="ent__f"><span class="ent__fk">Note</span><span class="ent__fv">${typo(esc(e.clockNote))}</span></div>` : ''}
          ${e.consequence ? `<div class="ent__f"><span class="ent__fk">If missed</span><span class="ent__fv ent__fv--warn">${typo(esc(e.consequence))}</span></div>` : ''}
          <div class="ent__f"><span class="ent__fk">Authority</span><span class="ent__fv fig" style="font-size:13.5px">${esc(e.authority)}</span></div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="sec ent__body" >
  <div class="wrap">
    <div class="ent__grid">
      <div class="prose">${e.body.map(p => `<p>${typo(esc(p))}</p>`).join('')}</div>
      <aside data-anim="rise">
        ${e.instrument ? `<div style="border-top:1px solid var(--rule-strong);padding-top:20px">
          <p class="eyebrow">Work out your date</p>
          <p style="margin-top:12px;color:var(--fg-mute);font-size:15px;line-height:1.6">${typo('The dial on the home page takes your annual return date and your financial year end and tells you which of the two rules binds.')}</p>
          <p style="margin-top:16px"><a class="lnk" href="${url('/')}#main">Open the dial <em>&rarr;</em></a></p>
        </div>` : ''}
        ${e.action ? `<div style="border-top:1px solid var(--rule-strong);padding-top:20px;margin-top:${e.instrument ? '26px' : '0'}">
          <p class="eyebrow">${esc(e.action.label)}</p>
          <p style="margin-top:12px;color:var(--fg-mute);font-size:15px;line-height:1.6">${typo(esc(e.action.note))}</p>
          <p style="margin-top:16px"><a class="lnk" href="${url('/incorporate/')}">Company types and forms <em>&rarr;</em></a></p>
        </div>` : ''}
        <div style="border-top:1px solid var(--rule-strong);padding-top:20px;margin-top:26px">
          <p class="eyebrow">Ask about this</p>
          <p style="margin-top:14px"><a class="btn btn--primary" href="${url('/contact/')}?subject=${encodeURIComponent(e.title)}">Get in touch</a></p>
        </div>
      </aside>
    </div>

    <div class="ent__nav">
      ${prev ? `<a class="lnk" href="${url('/services/' + prev.slug + '/')}"><em>&larr;</em> ${esc(prev.title)}</a>` : '<span></span>'}
      ${next ? `<a class="lnk" href="${url('/services/' + next.slug + '/')}">${esc(next.title)} <em>&rarr;</em></a>` : '<span></span>'}
    </div>
  </div>
</section>`;

  const desc = (e.lede.length > 150 ? e.lede.slice(0, 147) + '…' : e.lede);
  return {
    id: 'entry', path: '/services/' + e.slug + '/',
    title: shortTitle(e.title),
    description: desc,
    jsonld: [{
      '@context': 'https://schema.org', '@type': 'Service',
      name: e.title, description: e.lede,
      serviceType: 'Company secretarial',
      provider: { '@type': 'ProfessionalService', name: site.legalName, url: site.domain },
      areaServed: { '@type': 'Country', name: 'Ireland' }
    }, {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: site.domain + '/' },
        { '@type': 'ListItem', position: 2, name: 'Register', item: site.domain + '/services/' },
        { '@type': 'ListItem', position: 3, name: e.title, item: site.domain + '/services/' + e.slug + '/' }
      ]
    }],
    body
  };
}

module.exports = function register() {
  const all = ob.entries;
  return [indexPage()].concat(all.map((e, i) => entryPage(e, i, all)));
};

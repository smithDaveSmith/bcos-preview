'use strict';
const { data, url, esc, typo, headline } = require('../lib');
const { character } = require('../layout');
const site = data('site');
const types = data('company-types');

/* These five URLs exist on the live WordPress site and carry long, working
   application forms. The preview preserves the URLs and sends people to the
   real form rather than imitating it. */
function stub(o) {
  const body = `
<section class="sec sec--open" data-tone="mist">
  <div class="wrap">
    <nav aria-label="Breadcrumb"><ol class="ent__crumb" style="margin-bottom:22px">
      <li><a href="${url('/')}">Home</a></li><li aria-hidden="true">/</li>
      <li><a href="${url('/incorporate/')}">Incorporate</a></li>
    </ol></nav>
    <h1 class="d2" data-split style="max-width:20ch">${headline(o.heading)}</h1>
    <p class="lede" style="margin-top:22px;color:var(--body);max-width:56ch">${typo(o.lede)}</p>
  </div>
</section>

<section class="sec" >
  <div class="wrap">
    <div class="cols cols--sb">
      <div>
        <div class="frm__demo">
          <p><b>This concept preview does not host the application form.</b></p>
          <p style="margin-top:.7em">${typo('The live form at ' + o.liveUrl.replace('https://www.', '') + ' collects director, secretary, member and identification details and is the firm’s own authorised destination. It is not reproduced here, because a form that collects personal data belongs on the real site and nowhere else.')}</p>
        </div>
        <p style="margin-top:26px">
          <a class="btn btn--primary btn--lg" href="${o.liveUrl}" rel="noopener">Open the live form on bcos.ie</a>
        </p>
        <p style="margin-top:18px;font-size:14.5px;color:var(--fg-mute)">
          ${typo('Prefer to talk it through first? ')}<a class="lnk" href="${url('/contact/')}">Contact the firm</a>
        </p>
      </div>
      <div data-anim="rise">
        <p class="eyebrow">What the form asks for</p>
        <div class="ent__facts" style="margin-top:16px">
          ${o.asks.map(a => `<div class="ent__f"><span class="ent__fk">${esc(a[0])}</span><span class="ent__fv">${typo(esc(a[1]))}</span></div>`).join('')}
        </div>
      </div>
    </div>
  </div>
</section>`;
  return { id: 'form', path: o.path, title: o.title, description: o.description, body };
}

const ASKS = [
  ['Part 1', 'Company name (three, in order of preference), business activity, registered office and place of business.'],
  ['Part 2', 'Director details — name, address, date of birth, occupation, nationality, EEA residency and other directorships.'],
  ['Part 3', 'Company secretary, individual or corporate, and the declaration signatory.'],
  ['Part 4', 'Members and the shares to be issued.'],
  ['Part 5', 'Client identification documents and confirmation of the order.']
];

module.exports = function forms() {
  const pages = types.types.map(t => stub({
    path: '/' + t.slug + 'form/',
    title: 'Incorporate a ' + t.code + ' company in Ireland | Beacon',
    description: 'Application to incorporate a ' + t.name + ' (' + t.code + ') in Ireland through Beacon Company Secretaries.',
    heading: 'Incorporate|a ' + t.code,
    lede: t.name + '. ' + t.summary + ' ' + t.directors + '; ' + t.secretary.toLowerCase() + '.',
    liveUrl: t.formUrl,
    asks: ASKS
  }));

  pages.push(stub({
    path: '/rboform/',
    title: 'Beneficial ownership filing | Beacon',
    description: 'Beneficial ownership details for filing on the Irish Register of Beneficial Ownership through Beacon Company Secretaries.',
    heading: 'Beneficial|ownership details',
    lede: 'Every Irish company must record its ultimate beneficial owners at the RBO — within five months of incorporation, and within 14 days of any change.',
    liveUrl: types.rboFormUrl,
    asks: [
      ['Company', 'Name and registration number of the company making the filing.'],
      ['Beneficial owners', 'Name, date of birth, nationality, residential address and the nature and extent of the interest held.'],
      ['Identification', 'PPS number or, where none is held, a declaration of verification of identity.'],
      ['Presenter', 'Details of the person making the filing on the company’s behalf.']
    ]
  }));

  return pages;
};

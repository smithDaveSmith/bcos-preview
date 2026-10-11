'use strict';
const { data, url, esc, typo, headline } = require('../lib');
const { character, bearing } = require('../layout');
const site = data('site');
const ppl = data('people');

module.exports = function firm() {
  const years = new Date().getFullYear() - new Date(site.incorporated).getFullYear();
  const body = `
<section class="sec sec--s" data-tone="night">
  <div class="sec__glow" aria-hidden="true"></div>
  <div class="wrap">
    <div class="open">
      <div>
        <div class="sec__no" style="border-top:0"><span class="lab">The firm</span>${character(2)}</div>
        <h1 class="d1" data-split style="margin-top:20px;max-width:17ch">${headline('Company secretarial|is not a sideline|here. It is the job.')}</h1>
        <p class="lede" style="margin-top:24px;color:#A9B2C6;max-width:46ch">${typo('Beacon has been registered in Ireland since 2002. We are independent — not a department inside a law firm or an accountancy practice — which means the compliance work does not get deprioritised when something louder arrives.')}</p>
      </div>
      ${bearing([
        ['Incorporated', '1 July 2002', true],
        ['Company number', site.cro],
        ['Offices', 'Dublin \u00b7 London'],
        ['People', String(ppl.people.length)]
      ], 'Registration details verified against the Irish companies register.')}
    </div>
  </div>
</section>

<section class="sec" data-tone="paper" aria-labelledby="f-what">
  <div class="wrap">
    <div class="cols cols--sb">
      <div>
        <span class="lab">What we do</span>
        <h2 id="f-what" class="d3" style="margin-top:16px;max-width:22ch">${typo('We hold the record, so you can run the business.')}</h2>
      </div>
      <div class="prose" data-anim="rise">
        <p>${typo('We provide a full range of services that let our clients get on with the day-to-day running of their businesses — corporate compliance, technical and advisory work, for clients based in Ireland, the UK, Europe, the US and Asia.')}</p>
        <p>${typo('We also provide a full company secretarial audit and review, establishing that the regulatory and procedural elements of an enterprise are both compliant with current legislation and operating to best practice. It is usually the right first step where a company has changed advisers, grown quickly, or simply gone some years without anyone looking at the register as a whole.')}</p>
        <p>${typo('In all of our relationships we bring a strong commitment to excellence of service, accountability, honesty and respect for the confidentiality of our clients.')}</p>
      </div>
    </div>

    <div class="stat" style="margin-top:var(--sp-m)" data-anim="rise">
      <div class="stat__i"><span class="stat__k">Registered</span><span class="stat__v"><b>1 July 2002</b> &middot; Company number ${esc(site.cro)} &middot; ${years} years</span></div>
      <div class="stat__i"><span class="stat__k">Offices</span><span class="stat__v">${site.offices.map(o => `<b>${esc(o.label)}</b> — ${esc(o.role.toLowerCase())}`).join('<br>')}</span></div>
      <div class="stat__i"><span class="stat__k">Clients include</span><span class="stat__v">${site.clientTypes.map(esc).join(' &middot; ')}</span></div>
      <div class="stat__i"><span class="stat__k">Markets</span><span class="stat__v">${site.markets.map(esc).join(', ')}</span></div>
      <div class="stat__i"><span class="stat__k">Recognition</span><span class="stat__v">${site.awards.map(a => `<b>${esc(a.title)}</b> — ${esc(a.body)}, ${a.year}`).join('<br>')}</span></div>
    </div>
  </div>
</section>

<section class="sec sec--l" data-tone="paper-2" id="team" aria-labelledby="f-ppl">
  <div class="wrap">
    <div class="sec__head">
      <div><div class="sec__no"><span class="lab">Our people</span>${character(2)}</div>
      <h2 id="f-ppl" class="d2" data-split style="margin-top:18px">${headline('Four people.|You will know|which one files.')}</h2></div>
      <div data-anim="rise"><p class="lede">${typo('A small team is the point. There is no account manager between you and the person who prepares the minutes and makes the filing.')}</p></div>
    </div>
    <div class="ppl">
      ${ppl.people.map((p, i) => `
      <article class="ppl__i" data-anim="rise" id="${esc(p.slug)}">
        <span class="ppl__n fig">${String(i + 1).padStart(2, '0')}</span>
        <div>
          <h3 class="ppl__name">${esc(p.name)}</h3>
          <p class="ppl__role">${esc(p.role)}</p>
          ${p.credential ? `<p class="ppl__cred">${typo(esc(p.credential))}</p>` : ''}
          <p class="ppl__mail"><a class="lnk" href="mailto:${esc(p.email)}"><span>${esc(p.email)}</span></a></p>
        </div>
        <div class="prose">
          ${p.body.map(b => `<p>${typo(esc(b))}</p>`).join('')}
          <p class="ppl__aside">${typo(esc(p.aside))}</p>
        </div>
      </article>`).join('')}
    </div>
  </div>
</section>`;

  return {
    id: 'firm', path: '/firm/',
    title: 'The firm | Beacon Company Secretaries',
    description: 'Beacon has been registered in Ireland since 2002. An independent firm of company secretaries in Dublin and London — and the four people who do the work.',
    jsonld: [{
      '@context': 'https://schema.org', '@type': 'AboutPage',
      name: 'The firm',
      mainEntity: {
        '@type': 'ProfessionalService', name: site.legalName, url: site.domain,
        foundingDate: site.incorporated,
        employee: ppl.people.map(p => ({ '@type': 'Person', name: p.name, jobTitle: p.role, email: p.email }))
      }
    }],
    body
  };
};

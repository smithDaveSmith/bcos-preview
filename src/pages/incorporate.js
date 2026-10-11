'use strict';
const { data, url, esc, typo, headline } = require('../lib');
const { character, bearing } = require('../layout');
const site = data('site');
const types = data('company-types');
const statute = data('statute');

module.exports = function incorporate() {
  const body = `
<section class="sec sec--open" data-tone="mist">
  <div class="wrap">
    <div class="open">
      <div>
        <p class="eyebrow">Incorporation</p>
    <h1 class="d1" data-split style="margin-top:14px">${typo('Start a company on the right footing.')}</h1>
    <p class="lede" style="margin-top:24px;color:var(--body);max-width:52ch">${typo('Four company types are available in the Republic of Ireland. The right one depends on what the business does and what structure sits around it — and it determines your directors, your secretary and your members’ exposure from day one.')}</p>
    <div class="stat" style="margin-top:var(--sp-s);--rule:rgba(192,156,96,.22)">
      <div class="stat__i"><span class="stat__k">First return</span><span class="stat__v" >Due <b style="color:var(--gold)">six months</b> after incorporation.</span></div>
      <div class="stat__i"><span class="stat__k">Beneficial ownership</span><span class="stat__v" >Due within <b style="color:var(--gold)">five months</b> of incorporation.</span></div>
    </div>
      </div>
      ${bearing([
        ['Company types', '4', true],
        ['First annual return', '6 months', true],
        ['Beneficial ownership filing', '5 months', true],
        ['Change of beneficial owner', '14 days']
      ], 'Both clocks start on the date of incorporation, not on the date trading begins.')}
    </div>
  </div>
</section>

<section class="sec"  aria-labelledby="ct">
  <div class="wrap">
    <h2 id="ct" class="d2" >${typo('The four types')}</h2>
    <div class="types" style="margin-top:var(--sp-s)">
      ${types.types.map((t, i) => `
      <div class="types__i" id="${esc(t.slug)}" data-anim data-lift="rise" data-delay="${(i * .06).toFixed(2)}">
        <span class="types__code">${esc(t.code)}</span>
        <h3 class="types__n">${esc(t.name)}</h3>
        <p class="types__s">${typo(esc(t.summary))}</p>
        <dl class="types__dl">
          <dt class="types__dt">Name must end</dt><dd class="types__dd">${typo(esc(t.suffix))}</dd>
          <dt class="types__dt">Directors</dt><dd class="types__dd">${esc(t.directors)}</dd>
          <dt class="types__dt">Secretary</dt><dd class="types__dd">${esc(t.secretary)}</dd>
          <dt class="types__dt">Members</dt><dd class="types__dd">${esc(t.members)}</dd>
          <dt class="types__dt">Liability</dt><dd class="types__dd">${esc(t.liability)}</dd>
          <dt class="types__dt">Accounts</dt><dd class="types__dd">${typo(esc(t.notes))}</dd>
        </dl>
        <p class="types__act"><a class="lnk" href="${url('/' + t.slug + 'form/')}">Application form <em>&rarr;</em></a></p>
      </div>`).join('')}
    </div>
  </div>
</section>

<section class="sec sec--l band" data-tone="mist" aria-labelledby="inc-how">
  <div class="wrap">
    <div class="sec__head">
      <div><span class="eyebrow">How it runs</span>
        <h2 id="inc-how" class="d2" style="margin-top:18px">${typo('What we need from you')}</h2></div>
      <div data-anim="rise"><p class="lede">${typo('Beacon is a regulated trust and company service provider, so client identification has to be completed before an incorporation can proceed. That is the part worth preparing early — the rest is ours.')}</p></div>
    </div>
    <div class="cons">
      ${[
        ['Company details', 'Three proposed names in order of preference, the precise business activity, the registered office address and the place of business — all within the Republic of Ireland for the registered office.'],
        ['Directors', 'Full name, any previous names, residential address, date of birth, occupation, nationality, EEA residency, and any other directorships held in the past five years.'],
        ['Company secretary', 'An individual or a corporate body. For a single-director LTD the secretary must be someone other than that director.'],
        ['Members and shares', 'The shareholders and the shares to be issued — at least one ordinary share of €1.00 unless you specify otherwise.'],
        ['Client identification', 'A certified copy of a recent utility bill or bank statement, plus certified photo identification, for each director and for anyone holding 25% or more of the equity or voting capital. Certification by a practising accountant, a solicitor or a member of a national police force.']
      ].map((r, i) => `
      <div class="cons__i" data-anim data-lift="rise" data-delay="${(i * .05).toFixed(2)}">
        <span class="cons__n">${String(i + 1).padStart(2, '0')}</span>
        <h3 class="cons__t">${esc(r[0])}</h3>
        <p class="cons__d">${typo(esc(r[1]))}</p>
      </div>`).join('')}
    </div>
    <p class="tbl__note" data-anim="rise" style="margin-top:28px">${typo('Mobile phone, car insurance and health insurance bills are not accepted as proof of address.')}</p>
  </div>
</section>

<section class="sec"  aria-labelledby="inc-rbo">
  <div class="wrap">
    <div class="cols cols--sb">
      <div><span class="eyebrow">And immediately after</span>
        <h2 id="inc-rbo" class="d3" style="margin-top:16px;max-width:20ch">${typo('Two clocks start on the day you incorporate.')}</h2></div>
      <div class="prose" data-anim="rise">
        <p>${typo(statute.rbo.rule)}</p>
        <p>${typo(statute.annualReturn.firstReturn.note + ' Neither of these waits for the company to begin trading.')}</p>
        <p><a class="lnk" href="${url('/services/beneficial-ownership/')}">Beneficial ownership, in full <em>&rarr;</em></a></p>
      </div>
    </div>
  </div>
</section>`;

  return {
    id: 'incorporate', path: '/incorporate/',
    title: 'Incorporate a company in Ireland | Beacon',
    description: 'The four Irish company types — LTD, DAC, CLG and Unlimited — their director, secretary and liability requirements, and what Beacon needs to incorporate for you.',
    jsonld: [{
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: types.types.map(t => ({
        '@type': 'Question', name: 'What is a ' + t.name + '?',
        acceptedAnswer: { '@type': 'Answer', text: t.summary + ' ' + t.directors + '. ' + t.secretary + '. ' + t.liability + '.' }
      }))
    }],
    body
  };
};

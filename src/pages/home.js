'use strict';
const { data, url, esc, typo, headline, money } = require('../lib');
const { character } = require('../layout');
const { instrumentSvg } = require('../instrument-svg');

const site = data('site');
const statute = data('statute');
const obligations = data('obligations');
const types = data('company-types');
const notices = data('notices');

/* ---- the penalty curve: 0 → €1,200, the shape of the consequence ---- */
function curveSvg() {
  const W = 520, H = 250, PADL = 52, PADB = 34, PADT = 18, PADR = 14;
  const maxDay = 368, maxEuro = 1200;
  const x = d => PADL + (W - PADL - PADR) * (d / maxDay);
  const y = v => H - PADB - (H - PADB - PADT) * (v / maxEuro);
  const pen = n => n < 1 ? 0 : Math.min(100 + 3 * (n - 1), 1200);
  let d = `M${x(0).toFixed(1)} ${y(0).toFixed(1)} L${x(1).toFixed(1)} ${y(100).toFixed(1)}`;
  for (let n = 2; n <= maxDay; n += 4) d += ` L${x(n).toFixed(1)} ${y(pen(n)).toFixed(1)}`;
  d += ` L${x(maxDay).toFixed(1)} ${y(1200).toFixed(1)}`;
  const gridY = [0, 300, 600, 900, 1200];
  const gridX = [0, 92, 184, 276, 368];
  return `
<svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="cv-t cv-d">
  <title id="cv-t">Late filing penalty over time</title>
  <desc id="cv-d">The penalty starts at €100 on the first day after the deadline and rises by €3 each day, reaching the €1,200 maximum after roughly 368 days.</desc>
  ${gridY.map(v => `<line class="cv-grid" x1="${PADL}" y1="${y(v)}" x2="${W - PADR}" y2="${y(v)}"/>
    <text class="cv-t" x="${PADL - 9}" y="${y(v) + 3.5}" text-anchor="end">€${v}</text>`).join('')}
  ${gridX.map(v => `<text class="cv-t" x="${x(v)}" y="${H - PADB + 17}" text-anchor="middle">${v === 0 ? 'deadline' : 'day ' + v}</text>`).join('')}
  <line class="cv-axis" x1="${PADL}" y1="${PADT}" x2="${PADL}" y2="${H - PADB}"/>
  <path class="cv-line" data-curve-line d="${d}"/>
</svg>`;
}

module.exports = function home() {
  const standing = obligations.entries.filter(e => e.group === 'standing');
  const yearsTrading = new Date().getFullYear() - new Date(site.incorporated).getFullYear();

  const jsonld = [
    {
      '@context': 'https://schema.org', '@type': 'ProfessionalService',
      '@id': site.domain + '/#org',
      name: site.legalName, url: site.domain,
      description: site.description,
      email: site.email, telephone: site.phone.display,
      foundingDate: site.incorporated,
      areaServed: site.markets.map(m => ({ '@type': 'AdministrativeArea', name: m })),
      address: site.offices.map(o => ({
        '@type': 'PostalAddress', streetAddress: o.lines.join(', '),
        addressLocality: o.label, postalCode: o.postal, addressCountry: o.countryCode
      })),
      openingHoursSpecification: [{
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: site.hours.days, opens: site.hours.opens, closes: site.hours.closes
      }],
      sameAs: site.social.map(s => s.url),
      identifier: { '@type': 'PropertyValue', name: 'CRO number', value: site.cro }
    }
  ];

  const body = `
<section class="hero" data-tone="night" aria-labelledby="h-title">
  <div class="hero__glow" aria-hidden="true"></div>
  <div class="hero__in">
    <div class="hero__kicker">
      <span class="lab">Dublin &amp; London</span><span class="sep" aria-hidden="true"></span>
      <span class="lab">Registered in Ireland since ${new Date(site.incorporated).getFullYear()}</span>
      ${character(2)}
    </div>

    <div class="hero__grid">
      <div class="hero__words">
      <div class="hero__copy">
        <h1 id="h-title" class="d1" data-split>${headline('Every company|keeps a light on.|We watch|the dates.')}</h1>
      </div>

      <div class="hero__tail">
        <p class="hero__lede">${typo('Beacon is an independent firm of company secretaries. We hold the statutory record for companies in Ireland, the UK, Europe, the US and Asia — and we file on the dates that carry a penalty when they are missed.')}</p>
        <div class="hero__acts">
          <a class="btn btn--gold btn--lg" href="${url('/services/')}"><span>See what your company owes</span></a>
          <a class="btn btn--ghost btn--lg" href="${url('/contact/')}"><span>Talk to us</span></a>
        </div>
      </div>
      </div>

      <div class="inst" data-instrument>
        <div class="inst__stage">
          <div class="hero__horizon" aria-hidden="true"></div>
          ${instrumentSvg()}
          <div class="inst__read">
            <div class="inst__num" data-out="num">—</div>
            <div class="inst__unit" data-out="unit">until the filing deadline</div>
            <div class="inst__date fig" data-out="date"></div>
          </div>
        </div>

        <div class="inst__ctl">
          <p class="lab" style="margin-bottom:14px">Set your two dates</p>
          <div class="inst__fields">
            <div class="fld">
              <label for="f-ard">Annual return date</label>
              <input type="date" id="f-ard" name="ard" autocomplete="off">
              <span class="fld__err" data-err="ard" role="status"></span>
            </div>
            <div class="fld">
              <label for="f-fye">Financial year end</label>
              <input type="date" id="f-fye" name="fye" autocomplete="off">
              <span class="fld__err" data-err="fye" role="status"></span>
            </div>
          </div>

          <div class="verdict">
            <p class="verdict__rule" data-out="rule">${typo('Where financial statements are attached, the deadline is the earlier of two dates: the annual return date plus 56 days, or the financial year end plus nine months plus 56 days.')}</p>
            <p class="verdict__cost fig" data-out="cost" hidden></p>
          </div>
          <p class="sr" role="status" aria-live="polite" data-out="live"></p>

          <p class="inst__note">
            Guidance, not advice — check your own annual return date on the
            <a href="https://cro.ie" rel="noopener">CRO</a> register.
            <button type="button" class="lnk" data-example="2026-11-30|2025-12-31" style="margin-left:6px">
              <span>Try a company whose ARD has drifted</span></button>
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- =========== THE ARGUMENT =========== -->
<section class="sec sec--l" data-tone="paper" aria-labelledby="s-rules">
  <div class="wrap">
    <div class="sec__head">
      <div>
        <div class="sec__no"><span class="lab">01 / The rule people miss</span>${character(2)}</div>
        <h2 id="s-rules" class="d2" data-split style="margin-top:18px">${headline('Two rules run|at the same time.|Only one binds.')}</h2>
      </div>
      <div data-anim="rise">
        <p class="lede">${typo('Most directors know the 56-day rule. Fewer know there is a second calculation running alongside it, and that for many companies it produces the earlier date — the one that actually binds.')}</p>
      </div>
    </div>

    <div class="cols cols--sb">
      <div data-anim="rise">
        <div class="stat">
          <div class="stat__i"><span class="stat__k">Rule one</span>
            <span class="stat__v"><b>Annual return date + 56 days.</b> The one everyone has in the diary.</span></div>
          <div class="stat__i"><span class="stat__k">Rule two</span>
            <span class="stat__v"><b>Financial year end + 9 months + 56 days.</b> Applies wherever financial statements are attached.</span></div>
          <div class="stat__i"><span class="stat__k">Which applies</span>
            <span class="stat__v">Whichever falls <b>earlier</b>. For a company whose year end sits well in front of its annual return date, rule two bites first.</span></div>
        </div>
      </div>
      <div data-anim="rise">
        <p class="prose" style="margin:0"><span style="display:block;color:var(--fg);font-size:clamp(17px,1.2vw,19px);line-height:1.55;max-width:46ch">${typo('The second rule is not an edge case. It applies to every company that attaches financial statements to its annual return — which is almost all of them.')}</span></p>
        <p style="margin-top:22px"><a class="lnk" href="${url('/services/annual-return/')}"><span>The annual return, in full</span><em>&rarr;</em></a></p>
        <p class="nts__src" style="margin-top:18px">Source: <a href="${statute.annualReturn.source.url}" rel="noopener">${esc(statute.annualReturn.source.label)}</a></p>
      </div>
    </div>
  </div>
</section>

<!-- =========== THE PENALTY: scrubbed, because the shape is the argument =========== -->
<section class="sec sec--l band" data-tone="paper-2" aria-labelledby="s-pen" data-curve>
  <div class="wrap">
    <div class="curve">
      <div>
        <span class="lab">What it costs to be late</span>
        <h2 id="s-pen" class="d2" data-split style="margin-top:16px">${headline('€100|the day after.|Then €3 a day,|to €1,200.')}</h2>
        <p style="margin-top:22px;color:var(--fg-mute);font-size:16.5px;line-height:1.62;max-width:40ch">
          ${typo('The penalty is mechanical. It does not care why the return was late, and it accrues every day until it is filed.')}
        </p>
        <p class="fig" style="margin-top:24px;font-size:15px;letter-spacing:.04em;color:var(--fg-faint)">
          At <span data-curve-day style="color:var(--warn)">day 1</span>
          the accrued penalty is <span data-curve-fig style="color:var(--warn);font-size:1.15em">${money(100)}</span>
        </p>
        <p style="margin-top:18px;font-size:13.5px;color:var(--fg-faint);line-height:1.6">${typo('The €20 filing fee is separate. Figures from the CRO.')}</p>
      </div>
      <div class="curve__fig">${curveSvg()}</div>
    </div>

    <h3 class="lab" style="margin-top:var(--sp-m)">And beyond the penalty</h3>
    <div class="cons">
      ${statute.consequences.map((c, i) => `
      <div class="cons__i" data-anim="rise" data-delay="${(i * .05).toFixed(2)}">
        <span class="cons__n">${String(i + 1).padStart(2, '0')}</span>
        <h4 class="cons__t">${esc(c.title)}</h4>
        <p class="cons__d">${typo(esc(c.detail))}</p>
      </div>`).join('')}
    </div>
    <p class="tbl__note" data-anim="rise" style="max-width:72ch">${typo(statute.auditExemption.rule + ' ' + statute.auditExemption.supersedes)}</p>
  </div>
</section>

<!-- =========== THE REGISTER (preview) =========== -->
<section class="sec sec--l" data-tone="night" aria-labelledby="s-reg">
  <div class="wrap">
    <div class="sec__head">
      <div>
        <div class="sec__no"><span class="lab">02 / The register</span>${character(3)}</div>
        <h2 id="s-reg" class="d2" data-split style="margin-top:18px">${headline('Sixteen entries.|Three with a clock.')}</h2>
      </div>
      <div data-anim="rise">
        <p class="lede">${typo('A company secretary’s work is a register, not a brochure. These are the standing obligations — the ones that recur, and the ones that carry a consequence.')}</p>
      </div>
    </div>

    <div class="reg">
      ${standing.map(e => entryRow(e)).join('')}
    </div>

    <p style="margin-top:var(--sp-s)" data-anim="rise">
      <a class="btn btn--gold" href="${url('/services/')}"><span>All sixteen entries</span></a>
    </p>
  </div>
</section>

<!-- =========== THE FIRM =========== -->
<section class="sec sec--l" data-tone="paper" aria-labelledby="s-firm">
  <div class="wrap">
    <div class="sec__head">
      <div>
        <div class="sec__no"><span class="lab">03 / The firm</span>${character(2)}</div>
        <h2 id="s-firm" class="d2" data-split style="margin-top:18px">${headline('Independent, and|small enough that|you know who files.')}</h2>
      </div>
      <div data-anim="rise">
        <p class="lede">${typo('Beacon is not a department inside a law firm or an accountancy practice. Company secretarial work is the whole of what we do, which is why it does not get deprioritised when something louder comes along.')}</p>
      </div>
    </div>

    <div class="stat" data-anim="rise">
      <div class="stat__i"><span class="stat__k">Incorporated</span><span class="stat__v"><b>1 July 2002</b> — ${yearsTrading} years. Registered in Ireland, company number ${esc(site.cro)}.</span></div>
      <div class="stat__i"><span class="stat__k">Offices</span><span class="stat__v">${site.offices.map(o => `<b>${esc(o.label)}</b>`).join(' and ')} — with registered office services available in both jurisdictions.</span></div>
      <div class="stat__i"><span class="stat__k">Clients</span><span class="stat__v">${site.clientTypes.map(c => esc(c)).join(' &middot; ')}</span></div>
      <div class="stat__i"><span class="stat__k">Recognition</span><span class="stat__v">${site.awards.map(a => `<b>${esc(a.title)}</b>, ${esc(a.body)} ${a.year}`).join('<br>')}</span></div>
    </div>
    <p style="margin-top:28px" data-anim="rise"><a class="lnk" href="${url('/firm/')}"><span>Who does the work</span><em>&rarr;</em></a></p>
  </div>
</section>

<!-- =========== INCORPORATE =========== -->
<section class="sec sec--l band" data-tone="paper-2" aria-labelledby="s-inc">
  <div class="wrap">
    <div class="sec__head">
      <div>
        <div class="sec__no"><span class="lab">04 / Starting one</span>${character(2)}</div>
        <h2 id="s-inc" class="d2" data-split style="margin-top:18px">${headline('Four company types.|Pick the one that|fits the structure.')}</h2>
      </div>
      <div data-anim="rise"><p class="lede">${typo('The type you incorporate determines how many directors you need, whether the secretary can also be a director, and what the members are exposed to. It is worth getting right at the start.')}</p></div>
    </div>
    <div class="types">
      ${types.types.map((t, i) => `
      <div class="types__i" data-anim="rise" data-delay="${(i * .06).toFixed(2)}">
        <span class="types__code">${esc(t.code)}</span>
        <h3 class="types__n">${esc(t.name)}</h3>
        <p class="types__s">${typo(esc(t.summary))}</p>
        <dl class="types__dl">
          <dt class="types__dt">Directors</dt><dd class="types__dd">${esc(t.directors)}</dd>
          <dt class="types__dt">Secretary</dt><dd class="types__dd">${esc(t.secretary)}</dd>
          <dt class="types__dt">Liability</dt><dd class="types__dd">${esc(t.liability)}</dd>
        </dl>
        <p class="types__act"><a class="lnk" href="${url('/incorporate/')}#${esc(t.slug)}"><span>Requirements</span><em>&rarr;</em></a></p>
      </div>`).join('')}
    </div>
  </div>
</section>

<!-- =========== NOTICES =========== -->
<section class="sec sec--l" data-tone="paper" aria-labelledby="s-notes">
  <div class="wrap">
    <div class="sec__head">
      <div>
        <div class="sec__no"><span class="lab">05 / Notices</span>${character(2)}</div>
        <h2 id="s-notes" class="d2" data-split style="margin-top:18px">${headline('What changed,|and when.')}</h2>
      </div>
      <div data-anim="rise"><p class="lede">${typo('Company law moves. A note written while something was still a Bill is worth re-reading once it is an Act.')}</p></div>
    </div>
    <div class="nts">
      ${notices.items.slice(0, 3).map(n => `
      <article class="nts__i" data-anim="rise">
        <div class="nts__hd">
          <span class="nts__date fig">${esc(n.dateLabel)}</span>
          <div>
            <span class="nts__kick">${esc(n.kicker)}</span>
            <h3 class="nts__t">${typo(esc(n.title))}</h3>
          </div>
          <p class="nts__s">${typo(esc(n.summary))}</p>
        </div>
      </article>`).join('')}
    </div>
    <p style="margin-top:var(--sp-s)" data-anim="rise"><a class="lnk" href="${url('/news-and-events/')}"><span>All notices</span><em>&rarr;</em></a></p>
  </div>
</section>`;

  return {
    id: 'home', path: '/', theme: 'home', needsFlip: false,
    title: 'Beacon Company Secretaries — Dublin & London',
    description: 'Independent company secretaries in Dublin and London. Annual returns, registered office, beneficial ownership and company formation. Check which filing deadline binds your company.',
    jsonld, body
  };
};

/* A register row, reused by the home page and the register index. */
function entryRow(e) {
  return `
<a class="reg__e" href="${url('/services/' + e.slug + '/')}">
  <span class="reg__rule" aria-hidden="true"></span>
  <span class="reg__in">
    <span class="reg__folio fig">${esc(e.folio)}</span>
    <span class="reg__body">
      <span class="reg__t">${typo(esc(e.title))}</span>
      <span class="reg__l">${typo(esc(e.lede))}</span>
    </span>
    <span class="reg__meta">
      ${e.clock ? `<span class="reg__row"><span class="reg__k">Clock</span><span class="reg__v reg__v--clock">${typo(esc(e.clock))}</span></span>` : `<span class="reg__row"><span class="reg__k">Applies</span><span class="reg__v">${typo(esc(e.applies))}</span></span>`}
      ${e.consequence ? `<span class="reg__row"><span class="reg__k">If missed</span><span class="reg__v">${typo(esc(e.consequence))}</span></span>` : ''}
    </span>
    <span class="reg__arrow" aria-hidden="true">&rarr;</span>
  </span>
</a>`;
}
module.exports.entryRow = entryRow;

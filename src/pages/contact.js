'use strict';
const { data, url, esc, typo, headline } = require('../lib');
const { character, bearing } = require('../layout');
const site = data('site');
const ob = data('obligations');

module.exports = function contact() {
  const body = `
<section class="sec sec--open" data-tone="mist">
  <div class="wrap">
    <div class="open">
      <div>
        <p class="eyebrow">Contact</p>
    <h1 class="d1" data-split style="margin-top:14px">${typo('Call in, telephone, or write.')}</h1>
    <p class="lede" style="margin-top:24px;color:var(--body);max-width:52ch">${typo('Communication is the key to a working business relationship. If you are not sure which of these services you need, say what the company is and what is coming up — that is usually enough for us to tell you.')}</p>
    <div class="hero__acts" style="margin-top:32px">
      <a class="btn btn--primary btn--lg" href="${site.phone.href}">${esc(site.phone.display)}</a>
      <a class="btn btn--secondary btn--lg" href="mailto:${site.email}">${esc(site.email)}</a>
    </div>
    <p class="eyebrow" style="margin-top:26px">${esc(site.hours.display)}</p>
      </div>
      ${bearing([
        ['Dublin', 'K78 X5W6', true],
        ['London', 'E2 8DD', true],
        ['Hours', 'Mon\u2013Fri 09:00\u201317:30'],
        ['Telephone', site.phone.display]
      ])}
    </div>
  </div>
</section>

<section class="sec" >
  <div class="wrap">
    <div class="cx">
      <div>
        <h2 class="eyebrow">Where we are</h2>
        ${site.offices.map(o => `
        <div class="cx__office" data-anim="rise">
          <h3>${esc(o.label)}</h3>
          <p class="cx__role">${esc(o.role)}</p>
          <address>${o.lines.map(esc).join('<br>')}<br>${esc(o.postal)}<br>${esc(o.country)}</address>
          <p class="cx__map"><a class="lnk" href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(o.mapQuery)}" rel="noopener">Open in Maps <em>&rarr;</em></a></p>
        </div>`).join('')}

        <div class="cx__office" data-anim="rise">
          <h3>Registry links</h3>
          <ul class="reglist">
            ${site.registries.map(r => `<li><a class="lnk" href="${r.url}" rel="noopener">${esc(r.label)}</a></li>`).join('')}
          </ul>
        </div>
      </div>

      <div data-anim="rise">
        <h2 class="eyebrow">Send a message</h2>
        <div class="frm__demo" style="margin-top:16px">
          <p><b>This form does not send.</b> ${typo('It is part of a concept preview with no mailbox behind it. It validates properly, and it will hand your message to your own email client — but it will never show you a success message for something that did not happen.')}</p>
        </div>

        <form class="frm" style="margin-top:26px" data-demo-form novalidate>
          <div class="frm__row frm__row--2">
            <div class="f">
              <label for="c-name">Your name <span class="req" aria-hidden="true">*</span></label>
              <input id="c-name" name="name" type="text" required autocomplete="name" data-label="Name">
              <span class="f__err" aria-live="polite"></span>
            </div>
            <div class="f">
              <label for="c-company">Company</label>
              <input id="c-company" name="company" type="text" autocomplete="organization" data-label="Company">
              <span class="f__err" aria-live="polite"></span>
            </div>
          </div>
          <div class="frm__row frm__row--2">
            <div class="f">
              <label for="c-email">Email <span class="req" aria-hidden="true">*</span></label>
              <input id="c-email" name="email" type="email" required autocomplete="email" data-label="Email">
              <span class="f__err" aria-live="polite"></span>
            </div>
            <div class="f">
              <label for="c-phone">Phone</label>
              <input id="c-phone" name="phone" type="tel" autocomplete="tel" data-label="Phone">
              <span class="f__err" aria-live="polite"></span>
            </div>
          </div>
          <div class="f">
            <label for="c-topic">What is it about?</label>
            <select id="c-topic" name="topic" data-label="Topic">
              <option value="">Not sure yet</option>
              ${ob.entries.map(e => `<option value="${esc(e.title)}">${esc(e.title)}</option>`).join('')}
            </select>
            <span class="f__err" aria-live="polite"></span>
          </div>
          <div class="f">
            <label for="c-msg">Message <span class="req" aria-hidden="true">*</span></label>
            <textarea id="c-msg" name="message" required data-label="Message"></textarea>
            <span class="f__err" aria-live="polite"></span>
          </div>
          <div>
            <button class="btn btn--primary btn--lg" type="submit">Prepare this message</button>
          </div>
          <div class="frm__out" data-form-out hidden></div>
        </form>
      </div>
    </div>
  </div>
</section>`;

  return {
    id: 'contact', path: '/contact/',
    title: 'Contact — Dublin & London | Beacon',
    description: 'Beacon Company Secretaries, Commercial House, Millbank Business Park, Lucan, Co. Dublin K78 X5W6, and 9 Perseverance Works, Kingsland Road, London E2 8DD. +353 1 627 6627.',
    jsonld: [{
      '@context': 'https://schema.org', '@type': 'ContactPage',
      mainEntity: {
        '@type': 'ProfessionalService', name: site.legalName,
        telephone: site.phone.display, email: site.email,
        address: site.offices.map(o => ({
          '@type': 'PostalAddress', streetAddress: o.lines.join(', '),
          addressLocality: o.label, postalCode: o.postal, addressCountry: o.countryCode
        })),
        openingHoursSpecification: [{
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: site.hours.days, opens: site.hours.opens, closes: site.hours.closes
        }]
      }
    }],
    body
  };
};

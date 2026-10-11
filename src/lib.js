'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BASE = (process.env.BASE || '').replace(/\/$/, '');

const data = name => JSON.parse(fs.readFileSync(path.join(__dirname, 'data', name + '.json'), 'utf8'));

/** Resolve a site-root path into a href that works under a GitHub Pages project base. */
const url = p => {
  if (!p) return BASE + '/';
  if (/^(https?:|mailto:|tel:|#)/.test(p)) return p;
  return BASE + (p.startsWith('/') ? p : '/' + p);
};

const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

/** Typographic polish for prose: curly quotes, en/em dashes, non-breaking space before €-figures. */
const typo = s => String(s)
  .replace(/(\w)'(\w)/g, '$1’$2')
  .replace(/"([^"]+)"/g, '“$1”')
  .replace(/ - /g, ' — ')
  .replace(/(\d)-(\d)/g, '$1–$2');

const attr = o => Object.entries(o)
  .filter(([, v]) => v !== null && v !== undefined && v !== false)
  .map(([k, v]) => v === true ? ` ${k}` : ` ${k}="${esc(v)}"`).join('');

/** Split a heading into lines at explicit | markers so line breaks are art-directed, not accidental. */
const lines = s => String(s).split('|').map(l => l.trim());

const headline = (s, cls = '') =>
  `<span class="hl ${cls}">${lines(s).map(l => `<span class="hl__l">${typo(esc(l))}</span>`).join('')}</span>`;

const money = n => '€' + Number(n).toLocaleString('en-IE');

const slugDate = d => {
  const dt = new Date(d + 'T00:00:00Z');
  return dt.toLocaleDateString('en-IE', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
};

module.exports = { ROOT, BASE, data, url, esc, typo, attr, lines, headline, money, slugDate };

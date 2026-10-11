'use strict';
/* "A company's first year" — the scroll scene.

   Every marker below is a real statutory date measured from incorporation, so
   the sequence teaches the obligation calendar while it plays. The geometry is
   generated at build time; ScrollTrigger only drives a playhead across it. */

const { data } = require('./lib');

const DAYS = 400;                 // axis runs a little past the year
const W = 1000, H = 340;
const PAD_L = 64, PAD_R = 64;
const AXIS_Y = 186;

/* day → x in viewBox units */
const X = d => PAD_L + (W - PAD_L - PAD_R) * (Math.min(d, DAYS) / DAYS);

const MARKS = [
  {
    day: 0, key: 'inc', lane: 0,
    label: 'Day 0', title: 'Incorporated',
    note: 'The certificate issues. Two statutory clocks start on this date — not on the day you begin trading.',
    tone: 'blue'
  },
  {
    day: 152, key: 'rbo', lane: 1,
    label: 'Month 5', title: 'Beneficial ownership due',
    note: 'A new company has five months to record its ultimate beneficial owners at the RBO. Any later change must be filed within 14 days.',
    tone: 'blue'
  },
  {
    day: 183, key: 'ar1', lane: 0,
    label: 'Month 6', title: 'First annual return due',
    note: 'The first annual return falls due six months after incorporation. No financial statements are required with it.',
    tone: 'blue'
  },
  {
    day: 274, key: 'ard', lane: 1,
    label: 'Month 9', title: 'Financial year end',
    note: 'From here the second rule starts running: year end plus nine months plus 56 days. For most companies this is the one that binds.',
    tone: 'slate'
  },
  {
    day: 330, key: 'dead', lane: 0,
    label: 'Deadline', title: 'The filing deadline',
    note: 'Whichever of the two rules falls earlier. Miss it and the penalty begins the following day.',
    tone: 'ink'
  },
  {
    day: 400, key: 'pen', lane: 1,
    label: 'And after', title: '€100, then €3 a day',
    note: 'The penalty is mechanical, running to a maximum of €1,200 per return. Audit exemption is lost on a second late filing within five years.',
    tone: 'danger'
  }
];

function monthTicks() {
  let out = '';
  for (let m = 0; m <= 13; m++) {
    const d = Math.round(m * 30.44);
    if (d > DAYS) break;
    const x = X(d).toFixed(1);
    const major = m % 3 === 0;
    out += `<line class="yr-tick${major ? ' yr-tick--maj' : ''}" x1="${x}" y1="${AXIS_Y - (major ? 7 : 4)}" x2="${x}" y2="${AXIS_Y + (major ? 7 : 4)}"/>`;
  }
  return out;
}

function markers() {
  return MARKS.map((m, i) => {
    const x = X(m.day);
    const up = m.lane === 0;
    const stemTop = up ? AXIS_Y - 40 : AXIS_Y - 14;
    const stemBot = up ? AXIS_Y - 14 : AXIS_Y + 40;
    const labelY = up ? AXIS_Y - 50 : AXIS_Y + 60;
    const anchor = i === 0 ? 'start' : (i === MARKS.length - 1 ? 'end' : 'middle');
    const dx = i === 0 ? -4 : (i === MARKS.length - 1 ? 4 : 0);
    return `
    <g class="yr-mk yr-mk--${m.tone}" data-mark="${m.key}" data-day="${m.day}">
      <line class="yr-stem" x1="${x.toFixed(1)}" y1="${up ? stemBot : stemTop}" x2="${x.toFixed(1)}" y2="${up ? stemTop : stemBot}"/>
      <circle class="yr-node" cx="${x.toFixed(1)}" cy="${AXIS_Y}" r="7"/>
      <circle class="yr-node-c" cx="${x.toFixed(1)}" cy="${AXIS_Y}" r="3"/>
      <text class="yr-lab" x="${(x + dx).toFixed(1)}" y="${labelY}" text-anchor="${anchor}">${m.label}</text>
    </g>`;
  }).join('');
}

function yearSvg() {
  return `
<svg class="yr-svg" viewBox="0 ${AXIS_Y - 86} ${W} 172" role="img" aria-labelledby="yr-t yr-d" preserveAspectRatio="xMidYMid meet">
  <title id="yr-t">A company's first year of statutory obligations</title>
  <desc id="yr-d">A timeline from incorporation to month thirteen. Markers fall at day zero (incorporation), month five (beneficial ownership filing), month six (first annual return), month nine (financial year end), the filing deadline, and the penalty period that follows. Each obligation is described in full in the list below this chart.</desc>
  <defs>
    <linearGradient id="yrTrack" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#1B4DB1"/>
      <stop offset="100%" stop-color="#1B4DB1"/>
    </linearGradient>
    <pattern id="yrPen" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="8" height="8" fill="#FEF3F2"/>
      <line x1="0" y1="0" x2="0" y2="8" stroke="#F3B5AF" stroke-width="3"/>
    </pattern>
  </defs>

  <rect class="yr-penband" x="${X(330).toFixed(1)}" y="${AXIS_Y - 26}" width="${(X(DAYS) - X(330)).toFixed(1)}" height="52" rx="4"/>
  <text class="yr-penlab" x="${((X(330) + X(DAYS)) / 2).toFixed(1)}" y="${AXIS_Y - 32}" text-anchor="middle">Penalty accrues</text>
  <line class="yr-axis" x1="${PAD_L}" y1="${AXIS_Y}" x2="${W - PAD_R}" y2="${AXIS_Y}"/>
  ${monthTicks()}
  <rect class="yr-fill" data-yr-fill x="${PAD_L}" y="${AXIS_Y - 5}" width="0" height="10" rx="5"/>
  ${markers()}

  <g data-playhead>
    <line class="yr-head" x1="0" y1="${AXIS_Y - 76}" x2="0" y2="${AXIS_Y + 74}"/>
    <circle class="yr-head-d" cx="0" cy="${AXIS_Y}" r="6.5"/>
  </g>
</svg>`;
}

module.exports = { yearSvg, MARKS, DAYS, X, W, H, AXIS_Y };

'use strict';
/* Static SVG for the instrument. Rendered at build time so the shape exists
   without JavaScript; the arcs, marks and readout are populated at runtime. */

const R = 150;
const pt = (deg, r = R) => {
  const a = deg * Math.PI / 180;
  return [ (r * Math.cos(a)).toFixed(2), (r * Math.sin(a)).toFixed(2) ];
};

function ticks() {
  let out = '';
  for (let i = 0; i < 48; i++) {
    const deg = i * 7.5;
    const major = i % 4 === 0;
    const [x1, y1] = pt(deg, R);
    const [x2, y2] = pt(deg, major ? R - 11 : R - 6);
    out += `<line class="tick${major ? ' tick--mo' : ''}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
  }
  return out;
}

const LAMP = 80;
/* The beam leaves the lamp housing, not the centre point: it clears the readout well. */
function wedge(spread, r, cls) {
  const [ix1, iy1] = pt(-spread * 0.55, LAMP);
  const [ix2, iy2] = pt(spread * 0.55, LAMP);
  const [x1, y1] = pt(-spread, r);
  const [x2, y2] = pt(spread, r);
  return `<path class="${cls}" d="M${ix1} ${iy1} L${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2} L${ix2} ${iy2} A${LAMP} ${LAMP} 0 0 0 ${ix1} ${iy1} Z"/>`;
}

const mark = (id, cls, dotCls) => `
  <g class="mk ${cls}" data-mk="${id}">
    <circle class="${dotCls}" r="4"/>
    <text class="mk__t${dotCls.includes('dim') ? ' mk__t--dim' : dotCls.includes('today') ? ' mk__t--today' : ''}" x="13" y="3.5">
      <tspan x="13"></tspan><tspan x="13" dy="13" opacity=".78"></tspan>
    </text>
  </g>`;

function instrumentSvg() {
  return `
<svg viewBox="-250 -205 500 410" role="img"
     aria-labelledby="inst-t inst-d" preserveAspectRatio="xMidYMid meet">
  <title id="inst-t">Compliance dial</title>
  <desc id="inst-d">A circular timeline. The horizontal line is the filing deadline. The arc above it is the time remaining; the arc below it is the period over which the late filing penalty accrues. The beam points at today. The figures are given in text beside the dial.</desc>
  <defs>
    <linearGradient id="beamGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#C09C60" stop-opacity=".40"/>
      <stop offset="55%" stop-color="#C09C60" stop-opacity=".13"/>
      <stop offset="100%" stop-color="#C09C60" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <circle class="ring" cx="0" cy="0" r="${R}"/>
  <circle class="ring ring--inner" cx="0" cy="0" r="${R - 30}"/>
  <circle class="ring ring--lamp" cx="0" cy="0" r="${LAMP}"/>
  ${ticks()}

  <!-- the penalty zone, dashed, always present: the shape of what happens after -->
  <path class="arc-pen" d="M${R - 17} 0 A${R - 17} ${R - 17} 0 0 1 ${-(R - 17)} 0"/>

  <!-- the deadline is the horizon -->
  <line class="horizon-l" x1="${-R}" y1="0" x2="${-LAMP}" y2="0"/>
  <line class="horizon-l" x1="${LAMP}" y1="0" x2="${R}" y2="0"/>

  <path class="arc-remain" data-arc="remain" d="M0 0"/>
  <path class="arc-late"   data-arc="late"   d="M0 0" style="display:none"/>

  <g class="beam" data-beam transform="rotate(-90)">
    ${wedge(11, R + 26, 'beam__wedge')}
    <line class="beam__line" x1="${LAMP}" y1="0" x2="${R + 6}" y2="0"/>
  </g>

  <circle class="hub__core" cx="0" cy="0" r="2.2"/>

  ${mark('deadline', '', 'mk__dot')}
  ${mark('alt', 'mk--dim', 'mk__dot--dim')}
  ${mark('today', '', 'mk__dot--today')}
</svg>`;
}

module.exports = { instrumentSvg, R, pt };

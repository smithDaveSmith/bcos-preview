'use strict';
/* The deadline timeline, rendered at build time so the panel exists without
   JavaScript. Track, markers and labels are positioned at runtime.

   A horizontal axis is the right form: the point is that two statutory rules
   produce two dates and only the earlier one binds. On a shared axis you can
   see which one, and by how much. */

const W = 640;
const PAD_L = 10, PAD_R = 10;
const TRACK_Y = 48, TRACK_H = 10;
const H_FULL = 112;          // with the second rule shown below the track
const H_SHORT = 72;          // when both rules agree, the lower band is dropped

function instrumentSvg() {
  const bot = TRACK_Y + TRACK_H;
  return `
<svg data-timeline viewBox="0 0 ${W} ${H_SHORT}" role="img" aria-labelledby="tl-t tl-d" preserveAspectRatio="xMidYMid meet">
  <title id="tl-t">Filing deadline timeline</title>
  <desc id="tl-d">A horizontal time axis. One marker shows today, one shows the binding filing deadline, and where the two statutory rules give different dates a third marker shows the later one. The hatched band after the deadline is the period over which the late filing penalty accrues. Every figure is also given as text beside the chart.</desc>
  <defs>
    <pattern id="penHatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="7" height="7" fill="#FEF3F2"/>
      <line x1="0" y1="0" x2="0" y2="7" stroke="#F3B5AF" stroke-width="2.5"/>
    </pattern>
  </defs>

  <rect class="tl-base"   data-el="base"   x="${PAD_L}" y="${TRACK_Y}" width="${W - PAD_L - PAD_R}" height="${TRACK_H}" rx="5"/>
  <rect class="tl-pen"    data-el="pen"    x="0" y="${TRACK_Y}" width="0" height="${TRACK_H}" rx="5"/>
  <rect class="tl-remain" data-el="remain" x="0" y="${TRACK_Y}" width="0" height="${TRACK_H}" rx="5"/>
  <rect class="tl-late"   data-el="late"   x="0" y="${TRACK_Y}" width="0" height="${TRACK_H}" rx="5"/>

  <g data-mk="alt">
    <line class="tl-mk tl-mk--alt" x1="0" y1="${TRACK_Y + 4}" x2="0" y2="${bot + 16}"/>
    <circle class="tl-dot tl-dot--alt" cx="0" cy="${TRACK_Y + TRACK_H / 2}" r="5"/>
    <text class="tl-t tl-t--muted" x="0" y="${bot + 32}">Other rule</text>
    <text class="tl-t--sub"        x="0" y="${bot + 46}">&#8212;</text>
  </g>
  <g data-mk="today">
    <line class="tl-mk tl-mk--today" x1="0" y1="${TRACK_Y - 10}" x2="0" y2="${bot + 3}"/>
    <circle class="tl-dot tl-dot--today" cx="0" cy="${TRACK_Y + TRACK_H / 2}" r="5"/>
    <text class="tl-t"      x="0" y="${TRACK_Y - 26}">Today</text>
    <text class="tl-t--sub" x="0" y="${TRACK_Y - 14}">&#8212;</text>
  </g>
  <g data-mk="deadline">
    <line class="tl-mk tl-mk--dead" x1="0" y1="${TRACK_Y - 10}" x2="0" y2="${bot + 3}"/>
    <circle class="tl-dot tl-dot--dead" cx="0" cy="${TRACK_Y + TRACK_H / 2}" r="5.5"/>
    <text class="tl-t"      x="0" y="${TRACK_Y - 26}">Deadline</text>
    <text class="tl-t--sub" x="0" y="${TRACK_Y - 14}">&#8212;</text>
  </g>
</svg>`;
}

module.exports = { instrumentSvg, W, H_FULL, H_SHORT, PAD_L, PAD_R, TRACK_Y, TRACK_H };

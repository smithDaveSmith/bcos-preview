# Beacon Company Secretaries — concept preview

An unofficial concept rebuild of [bcos.ie](https://www.bcos.ie/).
**Not affiliated with or authorised by Beacon Company Secretaries Limited.**
Every page carries a visible preview banner and `<meta name="robots" content="noindex, nofollow">`,
and `robots.txt` disallows everything.

## What this is

A static site: 31 routes, no framework, no runtime dependencies, no third-party requests.
Fonts and GSAP are self-hosted from `assets/`.

**Visual direction** follows how this category actually presents itself. Three comparable sites
were measured directly — Vistra, Diligent (the governance/entity-management SaaS) and Company
Bureau (the direct Irish competitor) — and all three share: a white-dominant ground, one humanist
sans, headings at 40–50px, a single saturated action colour, soft radii, and visible trust
signals. This site adopts that register: white and cool-grey surfaces, Inter throughout, Geist
Mono for every figure so data always reads as data, 8px radii, and one blue — `#1B4DB1`, the
firm's own logo hue saturated to carry action.

**What makes it specific to this firm** is not the styling but the content model: an annual
return deadline checker that computes which of the two statutory rules actually binds, and a
register of sixteen obligations, each individually addressable, each stating who it applies to,
what triggers it, the deadline, and the consequence of missing it. No competitor has either.

## The motion system

One easing (`sweep`, a CustomEase) and one principle: motion carries information or it does
not ship. GSAP 3.15 is self-hosted; only ScrollTrigger, SplitText, DrawSVG, CustomEase and Flip
are vendored. No smooth-scroll library, no scroll hijacking, no custom cursor.

| Scene | Trigger | Purpose | Mobile | Reduced motion |
|---|---|---|---|---|
| Panel assembles | Load | Shows the tool is live | Same | Static |
| Headline lines | Load / 86% | One reveal, not a fade | Same | None |
| **A company's first year** | **Pinned, scrubbed over 2.1vh** | **The statutory calendar plays: day counter runs 0→400, milestones light in order, cards swap** | Unpinned stacked list | Fully laid out, all cards shown |
| Timeline sweep | Date change | Shows the answer moving | Same | Instant |
| Penalty curve | Scrub | The shape is the argument | Shorter | Fully drawn |
| Figures count up | On entry | Draws the eye to the number | Same | Final value |
| Register rows | Batch | Rows arrive in sequence | Same | Static |
| Card lift | Pointer | Depth on hover only | Disabled (touch) | Disabled |
| Header progress | Scroll | Reading position | Same | Hidden |
| Hero day-field | Load | 365 cells, one per day of a compliance year | Hidden under 1400px | Static |

Every scene is built inside `gsap.matchMedia()`, so crossing the 1000px pin breakpoint tears the
pin down and rebuilds it with no duplicate triggers and no leaked pin-spacers — verified in
`tools/pincheck.mjs`.

## Build

```sh
npm install          # gsap + Inter + Geist Mono + playwright (dev only)
node build.js        # writes docs/ for a user or organisation site
BASE=/bcos-preview node build.js   # writes docs/ for a GitHub Pages *project* site
```

`BASE` prefixes every internal link, asset path and redirect. Set it to the repository name when
the site is served from `https://<user>.github.io/<repo>/`. Leave it unset for a root domain.

## Deploy (GitHub Pages)

1. Push this repository to GitHub.
2. Settings → Pages → Source: **Deploy from a branch**, Branch: **main**, Folder: **/docs**.
3. No CI is required — `docs/` is committed. `.nojekyll` is included so `_`-prefixed paths work.

## Checks

```sh
node tools/serve.mjs docs 8099    # static server
node tools/verify.mjs             # 30 routes x 5 viewports: overflow, console errors,
                                  # broken links, headings, alt text, labels, titles, meta
node tools/audit2.mjs             # WCAG AA contrast in light and dark, Flip filter, form behaviour
node tools/states.mjs             # reduced motion, no-JS, keyboard order, signature states
node tools/pincheck.mjs           # pin lifecycle across the breakpoint, mobile, reduced motion
node tools/scene.mjs              # samples the pinned scene at six scrub positions
```

`tools/` requires Playwright and a Chromium binary; it is not needed to build or serve the site.

## Layout

```
src/data/        nine JSON files — all site content and the statutory rules
src/pages/       one module per page type
src/assets/      css, js, fonts (copied to docs/assets at build)
src/layout.js    page shell, header, footer, bearing panel
src/instrument-svg.js   the deadline timeline, rendered at build time so it exists without JS
src/year-scene.js       the pinned "first year" scene: axis geometry and milestone data
build.js         generator
docs/            build output, served by GitHub Pages
```

## Before this could ever go live

See `LAUNCH.md`.

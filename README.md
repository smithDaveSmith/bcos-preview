# Beacon Company Secretaries — concept preview

An unofficial concept rebuild of [bcos.ie](https://www.bcos.ie/).
**Not affiliated with or authorised by Beacon Company Secretaries Limited.**
Every page carries a visible preview banner and `<meta name="robots" content="noindex, nofollow">`,
and `robots.txt` disallows everything.

## What this is

A static site: 31 routes, no framework, no runtime dependencies, no third-party requests.
Fonts and GSAP are self-hosted from `assets/`.

The concept is **"Bearing & Interval"**: a beacon is identified by a fixed position and a timed
interval, and so is a company's compliance position. The home page opens on a working instrument —
a dial where the horizontal line *is* the filing deadline, the arc above it is the time remaining,
the arc below it is the period over which the late-filing penalty accrues, and the beam points at
today. It takes the visitor's annual return date and financial year end and works out which of the
two statutory rules actually binds.

## Build

```sh
npm install          # gsap + the three variable fonts + playwright (dev only)
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
```

`tools/` requires Playwright and a Chromium binary; it is not needed to build or serve the site.

## Layout

```
src/data/        nine JSON files — all site content and the statutory rules
src/pages/       one module per page type
src/assets/      css, js, fonts (copied to docs/assets at build)
src/layout.js    page shell, header, footer, bearing panel
src/instrument-svg.js   the dial, rendered at build time so it exists without JS
build.js         generator
docs/            build output, served by GitHub Pages
```

## Before this could ever go live

See `LAUNCH.md`.

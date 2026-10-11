# What the client would need to confirm before launch

This is a concept preview. Nothing below is a defect in the build; these are the items that
need a decision or a source from Beacon.

## Must be confirmed

1. **Awards.** The 2022 and 2024 Irish Enterprise Awards titles are taken from the firm's own
   news page. They could not be verified against an independent source. Confirm the exact award
   names and years, or remove them.
2. **Regulated status.** The live incorporation forms state that Beacon is a regulated trust and
   company service provider. Confirm the authorising body and registration number so it can be
   displayed properly — it is a strong trust signal and is currently invisible on the site.
3. **Team bios.** Condensed from the current site, with personal detail reduced to one line each.
   Confirm each person is happy with the shortened version. Johnathon Pearl's course with the
   Corporate Governance Institute is described as "currently undertaking" — check whether it is
   now complete.
4. **Emma Doyle** appears in the team biographies embedded in the current news page but not on the
   current team page. Confirm whether she is still with the firm.
5. **Legal pages.** `/privacy/` and `/cookies/` are URL-preserving placeholders. The firm's own
   legal text must be reviewed and carried across unchanged. The privacy policy in particular
   needs to match what the incorporation and RBO forms actually collect.

## Must be supplied

6. **Photography** — there is none on this site, deliberately (see below). If the firm wants
   photography, it needs: the Dublin office exterior and interior, and four headshots shot
   consistently. The current headshots are 150×150px and inconsistent in crop and lighting.
7. **A form destination.** The contact form validates but sends nothing and says so. A real
   endpoint (or a `mailto:` handoff) must be wired up before launch.
8. **Fee information.** Nothing on fees appears anywhere on the current site or here. Even a
   "from" figure for incorporation and for the annual return would answer the question most
   visitors arrive with.

## Decisions

9. **`/newaboutus/` → `/firm/`.** This is the only existing URL that moves. A redirect stub is in
   the build; on a real host this should be a 301.
10. **WooCommerce.** `/cart/` and `/checkout/` exist on the live site and are empty. If the firm
    does not sell online, the plugin should be removed — it is loading on every page.
11. **Analytics.** The live site runs Google Analytics with a consent manager. A rebuild is the
    moment to decide whether it is needed. This preview sets no cookies and has no banner.
12. **The incorporation forms** stay on WordPress in this preview. They are long, collect
    identification documents, and work. Moving them is a separate project.

## Why there is no photography

The firm's only images are four 150×150px headshots, a logo, and a stock cityscape. Rather than
fill the design with stock photography that misrepresents the premises or the team, the design
treats drawn data as the image material: the deadline timeline, the penalty chart, the register.
This is a deliberate choice, not an omission, and it means the site is honest about what it shows.

That said, this category does use photography — Company Bureau leads with a photo of real staff
and a 4.8/5 rating. Item 6 above is the highest-value thing the client could supply.

## Corrections made to existing content

Three statements on the current site were out of date and have been corrected here. Each is
marked "Corrected" on the notices page and carries its source.

1. **Audit exemption.** The current site states that filing late loses the audit exemption for the
   following two years. Since section 22 of the Companies (Corporate Governance, Enforcement and
   Regulatory Provisions) Act 2024, the exemption is lost only where a company files late **more
   than once in a five-year period**.
   Source: https://cro.ie/annual-return/missed-deadlines
2. **The filing deadline.** The current site gives only "56 days from the ARD". Where financial
   statements are attached the deadline is the **earlier** of the ARD + 56 days or the financial
   year end + 9 months + 56 days. Same source.
3. **Size thresholds.** The current site's table gives the "large company" row the same figures as
   "medium". Corrected here to "above the medium thresholds".

Additionally, the current site's news page cites section 865 for prosecution; the CRO describes
the offence under section 871. The CRO's framing is used here.

# Content To Confirm Before Launch

Every item below is a fabricated placeholder generated during development. Nothing here is a
real client, a real statistic, or a real quote. This is the single list — do not go hunting
through the content files for `TODO(client)` comments; everything is inventoried here with its
file location.

## Impact metrics

File: `src/infrastructure/content/static/social-proof.content.ts` (`impactMetrics`)

| Figure | Label | Status |
|---|---|---|
| 3x | Faster turnaround than a traditional agency retainer | Fabricated — needs a real number or removal |
| 40% | Lower cost per finished minute at volume | Fabricated — needs a real number or removal |
| 98% | On-time delivery across active engagements | Fabricated — needs a real number or removal |
| 12 days | Average brief-to-delivery for a 60-second cut | Fabricated — needs a real number or removal |

## Featured story cards (§4.8)

File: `src/infrastructure/content/static/portfolio.content.ts` (`featuredStories`)

| Client | Pull-quote headline | Status |
|---|---|---|
| Marchfield Logistics | "Forty deliverables in six weeks, one point of contact the whole way." | Fabricated client and outcome — confirm or remove |
| Hearth & Loom | "The brief changed twice. The deadline didn't move." | Fabricated client and outcome — confirm or remove |

## Case studies (§4.10)

File: `src/infrastructure/content/static/portfolio.content.ts` (`caseStudies`)

| Slug | Client | Title | Status |
|---|---|---|---|
| series-a-launch-film | Solenne Health | A funding announcement in four days, not four weeks | Fabricated client and timeline — confirm or remove |
| warehouse-safety-series | Marchfield Logistics | Forty safety briefings, one visual system | Fabricated client and scope — confirm or remove |
| product-launch-suite | Pallidor Systems | One shoot day, eleven deliverables | Fabricated client and scope — confirm or remove |
| brand-anthem-film | Hearth & Loom | A brand film that outlasted the rebrand | Fabricated client and claim — confirm or remove |
| founder-interview-series | Underline Financial | Eight founders, one interview format, no reshoots | Fabricated client and claim — confirm or remove |
| conference-recap-package | Kessler Outdoor | Three days of footage, same-day recap cuts | Fabricated client and turnaround — confirm or remove |

## Client logo marquee (§4.3)

File: `src/infrastructure/content/static/social-proof.content.ts` (`clientLogos`, backing `LOGO_NAMES`)

All 10 names are fabricated and must be replaced with real, permissioned client names (or the
marquee removed) before launch: Marchfield Logistics, Hearth & Loom, Solenne Health, Pallidor
Systems, Underline Financial, Kessler Outdoor, Voss & Tern, Bellcastle Group, Amaranth Retail,
Thistlewood Partners.

## Testimonial wall (§4.12)

File: `src/infrastructure/content/static/social-proof.content.ts` (`testimonials`)

All 9 testimonials — quote, name, role, and company — are entirely fabricated placeholder
copy. **Do not publish these as written.** Every one needs a real customer, a real quote, and
written permission to use it before it appears on the live site:

1. Priya Nandakumar, Head of Brand, Marchfield Logistics
2. Tomas Reyes, VP Marketing, Pallidor Systems
3. Elin Voss, Founder, Hearth & Loom
4. Rana Whitfield, Communications Director, Solenne Health
5. Marcus Holt, CMO, Underline Financial
6. Josephine Baird, Marketing Lead, Kessler Outdoor
7. Devon Achebe, Operations Director, Amaranth Retail
8. Lucia Ferraro, Brand Manager, Bellcastle Group
9. Callum Reyes, Creative Director, Thistlewood Partners

## Not fabricated, but worth a second look

- **Comparison matrix** (`src/infrastructure/content/static/comparison.content.ts`): the 30 cells
  describing Famysys Studio vs. in-house/agency/freelance/AI alternatives are original analysis,
  not fabricated data — no client confirmation needed, but the client should sanity-check that
  each limitation attributed to a competing option still reads as fair, not as a strawman, once
  it's live next to real pricing.
- **Mega menu and services grid** (`navigation.content.ts`, `services.content.ts`): the 19
  service offerings (4 categories, one with 4 items rather than 5 — "Casting" was cut, see below)
  and their one-line descriptors are original copy describing real service categories from the
  build brief, not fabricated claims — no TODO markers, but worth a terminology pass with the
  studio's own team before launch. Counts in tests are asserted as a `>= 15` floor rather than an
  exact number for exactly this reason: a round number in code breaks the day the client adds or
  removes a service.

## Corrections made during review

- **"Casting" removed** from Creative & strategy (was added to force a round "20", then cut on
  review — casting is a production-services function, not creative strategy, and listing it
  implied the studio staffs talent directly). Creative & strategy now has 4 offerings, not 5;
  total is 19, not 20.
- **Sound design descriptor corrected**: originally read "finished before the picture lock, not
  after," which has the sequence backwards — sound is finished *against* locked picture, not
  before it. Now reads "Mix, score, and sound effects, finished against locked picture."

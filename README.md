# Famysys Studio

Marketing homepage for Famysys Studio, built on Next.js 15 (App Router) with a DDD-layered
`src/` tree (`domain/` → `application/` → `infrastructure/` → `presentation/`/`app/`). See
`docs/superpowers/specs/2026-08-28-famysys-studio-homepage-design.md` for the full design spec
(tokens, contrast rationale) and `docs/content-todo.md` for every placeholder that needs client
confirmation before launch.

The page runs on the client's V1 Homepage Content Brief — all copy is theirs, verbatim. It has
nine sections in this order:

1. **Hero** — heading, body, two CTAs, supporting line, and an eight-tile drifting media mosaic
2. **What We Do** — six capabilities in a light bento (`services.content.ts`)
3. **The Differentiator** — four elements, closing with the page's thesis line set large and centred
4. **How We Work** — five numbered steps, 2 + 3 across a six-column grid, on ink
5. **Ways to Work With Us** — three engagement tiers plus a full-width Custom Partnership card
6. **Selected Work** — the eight planned pieces (`portfolio.content.ts`)
7. **Why Famysys** — five reasons, same 2 + 3 split as How We Work
8. **FAQ** — seven questions, accordion, one open at a time
9. **Final CTA** — closing heading, body, CTA, closing line, and the contact form

Only the homepage exists. The header, mega menu and footer link the real 7-page site, so those
routes 404 until their pages are built — see `docs/content-todo.md`.

## Setup

```bash
pnpm install
pnpm dev
```

Requires Node 20+ and pnpm. No other tooling — placeholder media is generated from plain SVG
strings (see below).

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Local dev server |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build (`pnpm build` first) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint, including the layer-boundary rules in `eslint.config.mjs` |
| `pnpm test` | Vitest unit tests |
| `pnpm generate:media` | Regenerates every file in `public/media/` — see below |

## Architecture: the layer dependency rule

`src/` is split into five layers, enforced at lint time by `eslint-plugin-boundaries`
(`eslint.config.mjs`) — a build fails if a file imports across the rule, not just at review time:

```
domain/          — entities, value objects, repository interfaces. Imports only domain/.
shared/          — design tokens, cross-cutting value objects used by multiple domains.
application/     — use cases (one class per operation, e.g. GetHomepageContent). Imports
                   domain/, application/, shared/.
infrastructure/  — concrete repository implementations (Static*, Http*, Stub*) and the DI
                   container. Imports domain/, infrastructure/, shared/.
presentation/    — React components, hooks, view-model mappers. Imports presentation/,
                   application/, domain/, shared/.
app/             — Next.js routes (page.tsx, route.ts, layout.tsx). Imports app/,
                   presentation/, application/, infrastructure/, shared/ — deliberately
                   NOT domain/. A route that needs to translate a domain error (e.g.
                   demo-request's field-validation errors) does it through a small
                   application-layer helper instead of importing the domain error class
                   directly — see src/application/lead/DemoRequestFieldErrors.ts.
```

The one-way flow (`app` → `presentation` → `application` → `domain`, with `infrastructure`
sitting beside `application` as the only place that constructs real repositories) means the
domain layer has zero framework dependencies and the presentation layer never talks to a
repository directly — it always goes through a use case.

**RSC serialization seam:** domain value objects (`Url`, `CtaLabel`, `MediaRef`,
`ComparisonCriterion`, `Slug`) are class instances, which React Server Components cannot pass to
a `"use client"` component as props. `src/presentation/lib/viewModels.ts` is the single mapping
layer that flattens every domain entity into a plain-object "view" before it reaches a client
component. It's constrained by an ESLint override in the same config file to contain no
branching (`if`/`switch`/ternary) — it can only rename fields and call `.value`/`.toString()`.
Any real decision (formatting, truncation, conditional display) belongs in a use case, not here.

## How to add a new homepage section

Content first: the strings live in `src/infrastructure/content/static/*.content.ts` and come from
the client's brief verbatim. Don't write marketing copy in a component, and don't paraphrase the
brief — if something is missing, record it in `docs/content-todo.md` rather than inventing a
substitute.

1. **Domain**: add an entity (or extend `MarketingContentRepository`) in `src/domain/marketing/`
   describing the section's content shape.
2. **Infrastructure**: add the fixture data to `src/infrastructure/content/static/*.content.ts`
   and return it from `StaticMarketingContentRepository`.
3. **Application**: add the new field to `GetHomepageContent` (or a dedicated use case if the
   section has its own data source), and update `FakeMarketingContentRepository` +
   `GetHomepageContent.test.ts` to cover it.
4. **Presentation**: build the section component under `src/presentation/sections/`, composed
   from the shared primitives in `src/presentation/components/` (`Section`, `Container`,
   `Eyebrow`, `Button`, `Reveal`). Use `<Section dark>` for a dark-surface section — see the
   token table below for which text/border colors are safe on `bg-ink` vs `bg-canvas`. If the
   section needs a domain value object (media, a CTA) in a client component, add the matching
   mapper to `viewModels.ts` rather than passing the domain object through directly.
5. **Wire it up**: import and render the section in `src/app/page.tsx`, in scroll order.
6. **Verify**: `pnpm typecheck && pnpm lint && pnpm test`, plus a manual check against a
   production build (`pnpm build && pnpm start`) for reduced motion, keyboard reachability, and
   no horizontal overflow at 360–1920px.

## Swapping static content for a CMS

Every `Static*Repository` in `src/infrastructure/content/repositories/` implements a domain
repository interface (e.g. `StaticMarketingContentRepository implements MarketingContentRepository`).
Nothing outside `infrastructure/` and the composition root knows or cares that the data is
hard-coded — use cases and components depend on the interface, not the implementation.

To switch to a CMS: write a new class (e.g. `ContentfulMarketingContentRepository`) implementing
the same interface, fetching from the CMS's API instead of `static/*.content.ts`, then change one
line in `src/infrastructure/di/container.ts` — the sole composition root — to construct the new
class instead of the `Static*` one. No use case, component, or test needs to change, because they
were all written against the interface. `container.ts` documents this pattern in its own header
comment.

## Design tokens

`src/shared/design/tokens.ts` is the source of truth (mirrored into CSS custom properties in
`src/app/globals.css` — the file's header comment is the reminder to keep both in sync).

The four base colors are the client's **official brand palette**. They replaced the values
originally measured off famysys.com's compiled CSS, so "measured" no longer applies to any color:
every color is either a brand base, an opacity step off a brand base, or a value derived from one
and justified by a contrast ratio.

| Token | Value | Kind | Note |
|---|---|---|---|
| `color.ink` | `#0B2C4D` | Brand | Deep Enterprise Blue. Headings and dark surfaces — never body copy |
| `color.graphite` | `#24282C` | Brand | Graphite Charcoal. Used through its opacity ramp, not flat |
| `color.canvas` | `#F4F1E8` | Brand | Warm White. Page background, and light-surface text on dark |
| `color.accent` | `#1C50FF` | Brand | Electric Blue |
| `colorDerived.eyebrowOnLight` | `#1C50FF` (accent) | Derived | 5.107:1 on canvas |
| `colorDerived.eyebrowOnDark` | `#F4F1E8` (full canvas) | Derived | 12.549:1 on ink; asymmetric on purpose (§2.1c) |
| `colorDerived.accentOnDark` | `#7995F5` | Derived | Accent mixed 43% toward canvas — 5.015:1 on ink |
| `colorDerived.bodyOnLight` (`graphite-70`) | `#24282CB3` | Derived | Running body/lead color, 5.273:1 on canvas |
| `colorDerived.bodyOnDark` (`canvas-80`) | `#F4F1E8CC` | Derived | Running body/lead color on dark, 8.548:1 on ink |
| `colorDerived.primaryButtonHover` | `#1A4BE6` | Derived | Accent 14% toward ink; canvas text holds 5.823:1 |
| `colorDerived.primaryButtonHoverOnDark` | `#E4E3DD` | Derived | Deepened cream, matching the previous palette's hover delta |
| `type.sans` | Jost | Brand | Unchanged by the palette reissue; loaded via `next/font/google` |
| `radius` | `0.25rem` | Measured | famysys.com's `--radius-sm`, applied site-wide |

The `ink-*` and `canvas-*` ramps keep the same alpha steps as before — only the base color moved.

### Contrast audit (brand palette)

Measured with the WCAG 2.x relative-luminance formula; translucent values are composited over
their real backdrop first. Regenerate with the script in the design spec if a token changes.

| Pair | Ratio | Floor | |
|---|---|---|---|
| accent on canvas | 5.107:1 | 4.5 | pass |
| graphite on canvas | 13.142:1 | 4.5 | pass |
| ink on canvas | 12.549:1 | 4.5 | pass |
| canvas on ink | 12.549:1 | 4.5 | pass |
| white on accent | 5.768:1 | 4.5 | pass |
| canvas on accent | 5.107:1 | 4.5 | pass |
| ink-70 on canvas | 5.212:1 | 4.5 | pass |
| graphite-70 on canvas | 5.273:1 | 4.5 | pass |
| canvas-80 on ink | 8.548:1 | 4.5 | pass |
| accent border on ink-04 | 4.748:1 | 3 | pass |
| `accentOnDark` on ink | 5.015:1 | 4.5 | pass |
| **accent on ink** | **2.457:1** | 3 | **fail — never used; see below** |

Two hairline values sit below 3:1 (`ink-8` on canvas at 1.152:1, `canvas-10` on ink at 1.325:1).
That is unchanged from the previous palette and intended: these are decorative dividers and card
edges, not the boundary of any control, so WCAG 1.4.11 does not apply to them. Every border that
*does* carry meaning — hover state, focus ring, selected state — uses accent or `accentOnDark`.

**The accent is never placed on ink.** It reads 2.457:1 there, below even the 3:1 non-text floor,
and an opacity ramp cannot help — accent over ink only moves toward ink. Dark surfaces therefore
use `accentOnDark` for every accent role: text, hover borders, and focus rings. The focus ring
switches automatically through a `--color-focus-ring` custom property, set by the `.surface-dark`
class that every ink surface carries; `.surface-light` puts it back for the light panels (mega
menu, mobile drawer) that hang off the dark header.

## Documented deviations

1. **`.label` (eyebrow) color is asymmetric between surfaces.** Light surfaces use accent; dark
   surfaces use full `canvas` rather than `accentOnDark`, which would also pass at 5.015:1. The
   dark treatment is a locked, render-confirmed decision — see design spec §2.1c.
2. **`meta theme-color` is `#0B2C4D` (ink), not `#F4F1E8` (canvas) like the live site.** The
   page opens on a dark hero that forms one continuous ink block with the header, so the mobile
   browser chrome color was changed to match rather than clash with it. Set via Next's `viewport`
   export in `src/app/layout.tsx`.
3. **`display-xl` and `display-l` run roughly 30% larger than famysys.com's measured values**
   (mobile floors unchanged). famysys.com is a quieter site; the studio page wants the bigger
   display type. Recorded in `tokens.ts` and `globals.css` at the point of definition.
4. **`accentOnDark` is a fifth hex, outside the strict four-color brand palette.** It is a
   derivation of the brand accent, not a new color, and it exists only because no opacity ramp of
   `#1C50FF` can be made legible on `#0B2C4D`. Removing it would mean dropping accent from every
   dark surface in favour of cream.
5. **A second typeface — Instrument Serif Italic — is used as a display accent. PENDING MANAGER
   APPROVAL.** The brand rules specify Jost with a fallback stack and nothing else. The serif
   appears in exactly four places, all display-size: the last three words of the hero headline,
   one word in The Differentiator's heading, two words in the thesis line, and two in the final CTA
   heading. It is reachable only through `RevealHeading`'s `accent` prop and is banned from body
   copy, card titles, eyebrows, nav and buttons — a check in the verification pass fails if more
   than five accent phrases appear or if one lands anywhere it shouldn't. Set 5% up on the
   surrounding Jost, because serif italic reads optically smaller at the same px.

The first two are called out again, with full context, in design spec §2.8.3.

## Layout conventions worth knowing

- **Everything is flush left, with exactly two exceptions.** Section headings sit at the
  container's left edge with the eyebrow above them; body copy, card content and section intros
  are all left-aligned. The only centred elements on the page are the thesis line in The
  Differentiator and the final CTA heading — both display-size statements standing alone. That
  scarcity is the point: centring reads as a decision only when it is not the default.
  `SectionHeader` is the shared component; a section that does not use it is a bug.
- **No two sections repeat the same block shape.** Nine sections all reading heading-then-even-grid
  is what made the page feel uniform even where the content differed, so each section now takes the
  shape its content actually has:

  | Section | Block below the header |
  |---|---|
  | What We Do | Even 3 × 2 grid of equal cards |
  | The Differentiator | Asymmetric split — header in 5 of 12 columns, elements stacked in 6, offset one |
  | How We Work | Horizontal sequence: five numerals on one hairline, copy beneath; the rule runs down the left below `lg` |
  | Ways to Work | 3 + 1 bento — three tiers, then a wider custom card |
  | Selected Work | Two media tiles a row with cycling aspect ratios; the first breaks the container to the viewport edge |
  | Why Famysys | Five alternating full-width rows on hairlines, label and description swapping sides |
  | FAQ | Accordion at a 72ch measure |

  Uneven spans are reserved for tiles that genuinely differ in weight or carry media. Even grids
  use `auto-rows-fr` and fill their last row exactly, so none of them leaves a hole.
- **Card fill is `ink-06`, not `ink-08`.** The limiting factor is not body copy — graphite-70
  stays above 4.5:1 as far as ink-12 — but the accent `text-small` on the engagement-tier cards,
  which reads 4.570:1 on ink-06 and fails at ink-07 (4.485:1). Border is `ink-12`.
- **The inline nav needs `xl`, not `lg`.** The real page names ("Ways to Work With Us", "Creative
  Services") are long enough that the header collapses to the mobile drawer below 1280px.
- **Vertical rhythm is deliberately uneven** — `spacing.section` for light sections,
  `spacing.sectionDark` for dark ones, `spacing.statement` for the final CTA.

## Motion

Every effect below is gated on `prefers-reduced-motion` and re-verified after each change.

| Effect | Where | Mechanism |
|---|---|---|
| Continuous mosaic drift | Hero | Three CSS-animated columns, 11–19s, alternating direction — never at rest. Each loop copy repeats until it is taller than the column, or a gap scrolls into view at the bottom |
| Line-by-line heading reveal | Every display heading | `RevealHeading` measures which rendered line each word landed on and gives that line an 80ms-stepped delay; words clip up from their own baseline. Tops are clustered with a tolerance rather than compared exactly, because an accented word is 5% larger and so sits in a taller box on the same baseline |
| Staggered grid entry | Every card grid | `Reveal` at 60ms per tile |
| Step numerals | How We Work | `ClipNumber` — each numeral clips up on its own observer as its step enters |
| Card hover | All cards | Accent border, 6px lift, no shadow; media tiles add a 1.05 scale |
| Background settle | Dark sections | `Section` fades ink-90 → ink on entry; the start state still holds canvas text at 9.616:1 |

## Placeholder media

`scripts/generate-media.mjs` regenerates every placeholder image referenced by
`src/infrastructure/content/static/*.content.ts`, entirely locally — nothing is downloaded and no
external tooling is needed. Images are hand-built SVG strings using only the locked design tokens.

```bash
pnpm generate:media
```

It writes 16 files: eight 4:3 tiles for Selected Work and eight mixed-ratio tiles for the hero
mosaic. The script is deterministic — no randomness, no timestamps — so re-running against a
non-empty `public/media/` overwrites every file with byte-identical content. Regenerate any time
the content files' media filenames change.

**Every placeholder is inventoried in `docs/content-todo.md`**, with its file location and what
needs to happen before launch. That file is the single source for "is this real or a
placeholder"; don't go hunting for `TODO(client)` comments in the content files themselves.

## Testing and quality gates

- **Unit tests**: Vitest, `pnpm test`. Domain value objects, application use cases, and
  infrastructure repositories all have dedicated test files alongside the code they test.
- **Boundary enforcement**: `pnpm lint` fails the build on any cross-layer import that violates
  the rule above — this is not just a review checklist, it's load-bearing CI.
- **Structure**: exactly one `<h1>`, no skipped heading levels, nine `<section>` elements in
  `<main>`, and no price-shaped string anywhere in the rendered page (the brief forbids public
  pricing, so it is asserted rather than assumed).
- **Reduced motion**: every animation is built to collapse to an instant, opacity-only 120ms
  transition when `prefers-reduced-motion: reduce` is set — verified by actually setting the
  browser preference and re-checking, not by reading the code. The FAQ still opens and closes
  with motion reduced.
- **Keyboard**: full tab pass over the page. All four "Talk to us" links in Ways to Work With Us
  are reachable; all seven FAQ triggers are reachable and operate on Enter and Space; a collapsed
  answer's inline link is kept out of the tab order by `inert` and enters it when the answer
  opens; every focused element shows a visible focus ring.
- **FAQ disclosure ARIA**: every trigger has an id, `aria-expanded`, and an `aria-controls` that
  resolves to a real element which points back via `aria-labelledby`. Asserted, because both
  earlier accordions in this project shipped with this wrong.
- **Responsive**: no horizontal overflow at 360, 390, 430, 768, 1024, 1280, 1440, or 1920px.

**Not re-measured since the content rebuild:** the Lighthouse and axe-core numbers previously
recorded here were measured against the earlier version of this page, which no longer exists.
They have been removed rather than carried forward. Re-run both against the current build before
treating either as known.

## What's left

- **The eight Selected Work pieces do not exist yet.** The section presents eight planned pieces
  with placeholder artwork — the largest gap between this page and a publishable one. See
  `docs/content-todo.md`.
- **Real hero stills.** The mosaic holds eight slots at fixed aspect ratios so real stills drop in
  one-for-one; it currently shows generated geometric placeholders.
- **Re-run Lighthouse and axe-core** against the rebuilt page, per the note above.
- **The six inner pages.** Every nav and CTA route except `/` 404s today; `/contact` is the most
  urgent, since it is the destination of nearly every CTA on the page.
- **Copy the brief doesn't supply** — FAQ section heading, footer tagline, contact address, social
  handles, and confirmation of the contact form's fields. All listed in `docs/content-todo.md`.

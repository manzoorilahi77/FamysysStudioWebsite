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
`src/app/globals.css` — the file's header comment is the reminder to keep both in sync). Every
color is one of two kinds:

| Kind | Meaning |
|---|---|
| **Measured** | Read directly off famysys.com's live, compiled CSS — not a guess, not "close enough." |
| **Derived** | famysys.com has no real precedent for this exact use (e.g. a dark-surface eyebrow, a hover fill), so the value was computed and confirmed by render against the project's own contrast rules (§2.2 of the design spec). |

| Token | Value | Kind | Note |
|---|---|---|---|
| `color.canvas` | `#F7F5F2` | Measured | Page background, light-surface text on dark |
| `color.ink` | `#0F2A4A` | Measured | Headings only, dark-surface background — never body copy |
| `color.graphite` | `#2C2E33` | Measured | Reserved for the opacity ramp behind body copy, not used flat |
| `color.accent` | `#1E6FFF` | Measured | Never a solid fill — underlines, borders, focus rings, active states |
| `colorDerived.eyebrowOnLight` (`ink-70`) | `#0F2A4AB3` | Measured | Real `.label` color on famysys.com, 5.343:1 on canvas |
| `colorDerived.eyebrowOnDark` | `#F7F5F2` (full canvas) | Derived | No real dark-eyebrow precedent; confirmed by render (§2.1c) |
| `colorDerived.accentOnDark` | `#5C96FF` | Derived | Accent lightened for 5.007:1 text contrast on ink |
| `colorDerived.bodyOnLight` (`graphite-70`) | `#2C2E33B3` | Measured | Real running body/lead color, 4.991:1 on canvas |
| `colorDerived.bodyOnDark` (`canvas-80`) | `#F7F5F2CC` | Measured | Real running body/lead color on dark surfaces, 9.006:1 |
| `colorDerived.primaryButtonHover` | `#1A65F0` | Locked decision | Chosen at checkpoint 5 review, no live-site precedent |
| `colorDerived.primaryButtonHoverOnDark` | `#EAE6E0` | Derived | Deepened cream; hover states aren't visible in a static capture |
| `type.sans` | Jost | Measured | famysys.com's `--font-jost`, loaded via `next/font/google` |
| `radius` | `0.25rem` | Measured | famysys.com's `--radius-sm`, applied site-wide |

See the design spec §2 for the full token list (type scale, spacing, motion durations) and the
contrast-ratio table backing every color decision above.

## Documented deviations from famysys.com

The build intentionally departs from the live site in three places:

1. **`.label` (eyebrow) color is asymmetric between surfaces.** Light surfaces use the real,
   measured `ink-70`. Dark surfaces use full `canvas` rather than the closest real precedent
   (`canvas-60`), because `canvas-60` measures below this project's own dark-surface body-copy
   color and would make eyebrows recede under the text they're supposed to introduce — confirmed
   by render, not just computed. See design spec §2.1c for the full reasoning.
2. **`meta theme-color` is `#0F2A4A` (ink), not `#F7F5F2` (canvas) like the live site.** The
   page opens on a dark hero that forms one continuous ink block with the header, so the mobile
   browser chrome color was changed to match rather than clash with it. Set via Next's `viewport`
   export in `src/app/layout.tsx`.
3. **`display-xl` and `display-l` run roughly 30% larger than famysys.com's measured values**
   (mobile floors unchanged). famysys.com is a quieter site; the studio page wants the bigger
   display type. Recorded in `tokens.ts` and `globals.css` at the point of definition.

The first two are called out again, with full context, in design spec §2.8.3.

## Layout conventions worth knowing

- **Odd-numbered card rows resolve as 2 + 3** over a six-column grid — the first two cards take
  three columns, the last three take two. How We Work (5 steps) and Why Famysys (5 reasons) both
  use it, so the two odd sections resolve the same way instead of each inventing something.
- **What We Do's bento fills both rows exactly**: six tiles over four columns, with the tile that
  opens each row spanning two. Asymmetric without leaving a hole.
- **The inline nav needs `xl`, not `lg`.** The real page names ("Ways to Work With Us", "Creative
  Services") are long enough that the header collapses to the mobile drawer below 1280px.

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

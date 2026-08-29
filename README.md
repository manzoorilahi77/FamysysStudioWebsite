# Famysys Studio

Marketing homepage for Famysys Studio, built on Next.js 15 (App Router) with a DDD-layered
`src/` tree (`domain/` → `application/` → `infrastructure/` → `presentation/`/`app/`). See
`docs/superpowers/specs/2026-08-28-famysys-studio-homepage-design.md` for the full design spec
(tokens, contrast rationale, section-by-section brief) and `docs/content-todo.md` for every
placeholder that needs client confirmation before launch.

## Setup

```bash
pnpm install
pnpm dev
```

Requires Node 20+ and pnpm. Regenerating placeholder media (see below) additionally requires
`ffmpeg` on `PATH`.

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
   contrast table below for which text/border colors are safe on `bg-ink` vs `bg-canvas`. If the
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

The build intentionally departs from the live site in two places:

1. **`.label` (eyebrow) color is asymmetric between surfaces.** Light surfaces use the real,
   measured `ink-70`. Dark surfaces use full `canvas` rather than the closest real precedent
   (`canvas-60`), because `canvas-60` measures below this project's own dark-surface body-copy
   color and would make eyebrows recede under the text they're supposed to introduce — confirmed
   by render, not just computed. See design spec §2.1c for the full reasoning.
2. **`meta theme-color` is `#0F2A4A` (ink), not `#F7F5F2` (canvas) like the live site.** The
   homepage's light/dark section rhythm was reworked to open on a dark hero (header, hero, and
   logo marquee form one continuous ink block), so the mobile browser chrome color was changed to
   match rather than clash with it. Set via Next's `viewport` export in `src/app/layout.tsx`.

Both are called out again, with full context, in design spec §2.8.3.

## Placeholder media

`scripts/generate-media.mjs` regenerates every placeholder image and video referenced by
`src/infrastructure/content/static/*.content.ts`, entirely locally — nothing is downloaded.
Images are hand-built SVGs; videos are synthesized with ffmpeg's `gradients` source filter (no
source footage). Client-logo marks and the hero/story-card video gradients are tinted for
whichever section background they now sit on (light or dark) — see the script's own comments for
which videos use which field color.

**Requires `ffmpeg` on `PATH`.** Install it via your platform's package manager (e.g.
`winget install Gyan.FFmpeg`, `brew install ffmpeg`, `apt install ffmpeg`) and confirm with
`ffmpeg -version` before running the script.

```bash
pnpm generate:media
```

The script is deterministic — no randomness, no timestamps in its own logic — so re-running
against a non-empty `public/media/` overwrites every file with the same content. Regenerate it
any time the content files' media filenames change.

**Every placeholder is inventoried in `docs/content-todo.md`** — client logos, testimonials, case
studies, impact-metric figures, talent-tile portraits, footer contact/social links — with its
exact file location and what needs to happen before launch. That file is the single source for
"is this real or a placeholder"; don't go hunting for `TODO(client)` comments in the content
files themselves.

## Testing and quality gates

- **Unit tests**: Vitest, `pnpm test`. Domain value objects, application use cases, and
  infrastructure repositories all have dedicated test files alongside the code they test.
- **Boundary enforcement**: `pnpm lint` fails the build on any cross-layer import that violates
  the rule above — this is not just a review checklist, it's load-bearing CI.
- **Accessibility**: axe-core (`@axe-core/playwright`) reports zero violations against
  `wcag2a`/`wcag2aa`/`wcag22aa` on a full page sweep (all `Reveal`-gated content scrolled into
  view first). Lighthouse accessibility scores 100/100 on both mobile and desktop emulation.
- **Performance**: Lighthouse desktop scores 100/100 (LCP 0.6s, TBT 0ms, CLS 0). Mobile
  (throttled 4x CPU) fluctuated 79–100 across repeated runs on this development machine due to
  shared local CPU contention with other tooling running at the same time — LCP held steady at
  1.9s and CLS at 0 across every run, which are the numbers that don't depend on machine load.
  Re-run `pnpm build && pnpm start` plus a Lighthouse pass on a quiet machine (or in CI) before
  treating the mobile performance score as final.
- **Reduced motion**: every animation (marquee, testimonial drift, counters, card hover lift,
  parallax, Lenis) is built to collapse to an instant, opacity-only 120ms transition when
  `prefers-reduced-motion: reduce` is set — verified by actually setting the OS/browser
  preference and re-checking each section, not by reading the code.
- **Responsive**: no horizontal overflow at 360, 390, 430, 768, 1024 (portrait and landscape),
  1280, 1440, or 1920px, nor at 200% browser zoom. Breakpoint collapses (mega menu → drawer,
  comparison table → swipe cards, services grid 4/3/2/1 columns) all land exactly at `lg`
  (1024px).

## What's left

- Every fabricated placeholder in `docs/content-todo.md` needs a real client-supplied
  replacement (or explicit removal) before launch — this is the biggest remaining gap.
- Mobile Lighthouse performance should be re-measured on a dedicated/CI machine rather than a
  shared dev machine, per the note above.
- `TestimonialCard.tsx` uses a semantic `<footer>` for the attribution line inside each
  `<blockquote>`, which is valid HTML but means the page has many `<footer>` elements alongside
  the real site footer — worth a second look at whether `<cite>`/`<figcaption>` reads better,
  though it doesn't trip any of the WCAG rules checked here.
- The demo-request success message's "within one business day" reply commitment (flagged in
  `docs/content-todo.md`) needs the studio's sign-off before launch, since it's an operational
  promise, not placeholder copy.

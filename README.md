# Famysys Studio

Marketing homepage for Famysys Studio, built on Next.js 15 (App Router) with a DDD-layered
`src/` tree (`domain/` → `application/` → `infrastructure/` → `presentation/`/`app/`). See
`docs/spec/2026-08-28-famysys-studio-homepage-design.md` for the full design spec
(tokens, contrast rationale) and `docs/content-todo.md` for every placeholder that needs client
confirmation before launch.

The page runs on the client's V1 Homepage Content Brief — all copy is theirs, verbatim. It has
nine sections in this order:

1. **Hero** — one viewport tall: heading, body, two CTAs, supporting line, and an eight-tile media mosaic drifting full-bleed down the right
2. **What We Do** — six capabilities in a light bento (`services.content.ts`)
3. **The Differentiator** — asymmetric split, closing with the page's thesis line set large and centred
4. **How We Work** — five numbered steps along one hairline, as a sequence, on ink
5. **Ways to Work With Us** — three engagement tiers plus a full-width Custom Partnership card
6. **Selected Work** — the eight planned pieces (`portfolio.content.ts`)
7. **Why Famysys** — five cards in a 3 + 2 grid, each with a numeral, a drawn mark and a one-line claim
8. **FAQ** — seven questions, accordion, one open at a time
9. **Final CTA** — closing heading, body, CTA, closing line, and the contact form

**All seven pages of the site now exist** — the homepage plus Creative Services, How We Work,
Ways to Work With Us, Selected Work, About and Contact — and every navigation and footer
destination resolves. `/privacy` and `/terms` do not exist and are no longer linked; see
`docs/content-todo.md`, which also opens with the one launch blocker: **the contact forms deliver
nowhere until `container.demoRequestIntake` is wired to something real.**

## Setup

```bash
pnpm install
cp .env.example .env.local     # fill it in — the notes in that file say how
pnpm db:migrate                # create the tables
pnpm db:seed                   # populate them from the content modules
pnpm dev
```

Requires Node 20+, pnpm, and a MySQL 8 database. Placeholder media is committed under
`public/media/` — see `docs/content-todo.md` for every file's source.

**Without a database**, set `CONTENT_SOURCE=static` and skip the two `db:` commands: the
site reads the TypeScript modules under `src/infrastructure/content/static/` instead and
runs exactly as it did before Phase 3. The admin panel still opens, but it cannot save —
see `db/README.md`. The site also falls back to those files on its own when the database
is unreachable, so an outage costs the panel rather than the site.

**Deployment needs a Node runtime.** The site used to ship as a static export; it stopped
being one when the panel gained a login, the save endpoint, and a contact form that stores
what it receives — none of which a folder of HTML can do. The seven public pages are still
prerendered to HTML at build time, from the database; only `/admin` and the two endpoints
render per request. On cPanel that means "Setup Node.js App" rather than dropping a folder
into `public_html`, and the build machine needs to reach the database.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Local dev server |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build (`pnpm build` first) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint, including the layer-boundary rules in `eslint.config.mjs` |
| `pnpm test` | Vitest unit tests |
| `pnpm docs:content-todo` | Regenerates the How We Work drafted-copy inventory in `docs/content-todo.md` from the content module |
| `pnpm db:migrate` | Applies pending database migrations. `-- --dry` to list them |
| `pnpm db:seed` | Populates the database from the content modules. Idempotent; `-- --force` overwrites edited values |
| `pnpm db:status` | Says whether this machine can reach the database and whether it holds content. Run it before a build |
| `pnpm check-secrets` | Fails if a credential-shaped literal appears in a tracked file. Part of `pnpm lint` |
| `pnpm deploy` | Uploads the built site to the server and switches it on. `-- --dry` to see what it would do |

## Deployment

The site runs as a Node process on cPanel — `docs/deployment.md` has the whole of it, and
you want it before your first deploy rather than after. The two facts that surprise people:

**The build reads the database.** The seven public pages are prerendered from MySQL at
build time, so the machine running `pnpm build` needs to reach it. If it cannot, the build
does not fail — it falls back to the content modules and ships a site that looks almost
right and has none of the client's edits on it. `pnpm db:status` is the check.

**Rolling back is a symlink move, not a rebuild.** Releases are timestamped directories on
the server and the last five are kept, so undoing a bad deploy is two seconds and no
upload. It rolls back code only: content lives in the database, and a content mistake is
fixed in the panel.

## Architecture: the layer dependency rule

`src/` is split into five layers, enforced at lint time by `eslint-plugin-boundaries`
(`eslint.config.mjs`) — a build fails if a file imports across the rule, not just at review time:

```
domain/          — entities, value objects, repository interfaces. Imports only domain/.
shared/          — design tokens, cross-cutting value objects used by multiple domains.
application/     — use cases (one class per operation, e.g. GetHomepageContent). Imports
                   domain/, application/, shared/.
infrastructure/  — concrete repository implementations (Db*, Static*, Http*), the MySQL
                   pool and the DI container. Imports domain/, infrastructure/, shared/.
                   Every domain interface has two implementations — one reading the
                   database, one reading the TypeScript content modules — selected by
                   CONTENT_SOURCE in the composition root and nowhere else.
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
4. **Presentation**: build the section component under `src/presentation/sections/<page>/` —
   the folders are one per page (`home/`, `about/`, `contact/`, `services/`, `process/`,
   `work/`, `engagement/`), plus `shared/` for the three sections more than one page renders
   (`Faq`, `FinalCta`, `HowWeWork`) — composed
   from the shared primitives in `src/presentation/components/` (`Section`, `Container`,
   `SectionHeader`, `Button`, `Reveal`). Use `<Section dark>` for a dark-surface section — see the
   token table below for which text/border colors are safe on `bg-ink` vs `bg-canvas`. If the
   section needs a domain value object (media, a CTA) in a client component, add the matching
   mapper to `viewModels.ts` rather than passing the domain object through directly.
5. **Wire it up**: import and render the section in `src/app/page.tsx`, in scroll order.
6. **Verify**: `pnpm typecheck && pnpm lint && pnpm test`, plus a manual check against a
   production build (`pnpm build && pnpm start`) for reduced motion, keyboard reachability, and
   no horizontal overflow at 360–1920px.

## Creative Services (`/creative-services`)

The first inner page. It follows the same layers as the homepage, with its own repository
method (`ServiceCatalogRepository.getCreativeServicesPage`), use case
(`GetCreativeServicesPage`) and content file, wired through the same container.

**`CapabilityDetail` extends `ServiceOffering` rather than replacing it.** The page needs an
expanded paragraph, a deliverables list, an image and a CTA per capability, but the six
**names and descriptors are approved client copy** and must not be retyped beside drafted
text. The content file therefore spreads each catalog entry — `{ ...offering, slug, ... }` —
so those two strings keep exactly one definition, and a test fails if the page's copy ever
diverges from the catalog's. The same applies to the five process steps, the four tier names
and three of the four FAQ entries: all imported, none restated.

Everything else on the page is **drafted, not supplied**. Every drafted string is marked
`TODO(client): expanded copy — draft, pending approval` at its definition and listed in full
in `docs/content-todo.md` for review.

Block shapes, following the homepage's rule that no two sections repeat one:

| Section | Shape |
|---|---|
| Page hero | ~60svh, not a full viewport. Eyebrow, two-line heading, intro, one CTA, then a short wide image band |
| Capability index | Six anchors, sticky under the header from `md`; a horizontally scrolling strip below it |
| Six capability blocks | Asymmetric 5/12 image against 6/12 copy with a column of gap, the image dropped a step. Side **and** surface alternate — the left/right flip alone still left six panels of one tone |
| How this works | The homepage's `HowWeWork`, reused with a page-specific heading and a trailing link |
| Ways to engage | Four hairline rows, name and one line each — a pointer, not a second copy of the tier content |
| FAQ | The homepage accordion, with a real heading rather than its `TODO(client)` placeholder |
| Closing CTA | The homepage's `FinalCta`, with page copy and its own accent phrase |

Two things worth knowing before editing it:

- **Anchor offsets are measured, not written down.** `CapabilityIndex` measures the header and
  itself, sets its own sticky `top`, and publishes the sum as `--services-anchor-offset` for
  `scroll-margin-top`. The header changes height at `xl`, and a stale constant here shows up as
  an anchor jump landing with the heading hidden behind the bar — a bug nobody would attribute
  to this file.
- **`scroll-behavior: smooth` is global**, added for these anchors and already covered by the
  reduced-motion block. It also means any programmatic `window.scrollTo` animates: automation
  that scrolls a page in steps must pass `behavior: "instant"` or it will crawl a few hundred
  pixels and leave everything below unrevealed.

## How We Work (`/how-we-work`)

The second inner page, and the one the Creative Services process pointer links out to. Its
own bounded context — `src/domain/process/` — with `ProcessRepository`,
`GetHowWeWorkPage`, `how-we-work.content.ts` and a `container.process` entry.

**Why a separate repository rather than an eleventh method on `MarketingContentRepository`.**
That interface is the homepage's aggregate and `GetHomepageContent` awaits every method on
it; hanging an inner page off it would make the homepage's test fixture grow a field it
never reads. The entities still extend the marketing ones, which is where the guarantee
actually lives.

**`ProcessStepDetail` extends `ProcessStep` rather than replacing it**, exactly as
`CapabilityDetail` extends `ServiceOffering`. The page needs an expanded paragraph, two
lists and an image per step, but the five **names and one-line descriptions are approved
client copy**. The content file spreads each entry from `processBlock.steps` — the same
array the homepage renders — so those strings keep one definition and a test fails if they
diverge. The hero heading is `processBlock.heading` for the same reason; two FAQ entries
come from the brief's FAQ block, and the worked example's subject from the portfolio.

Everything else is **drafted, not supplied**, marked
`TODO(client): expanded copy — draft, pending approval`, and listed in
`docs/content-todo.md` — where the table is **generated from the content module**
(`pnpm docs:content-todo`) rather than kept by hand. A string counts as drafted when it
does not appear verbatim in the client's own content modules, so inlining an approved
string removes it from the review list automatically and inventing one adds it.

Block shapes, following the rule that no two sections repeat one:

| Section | Shape |
|---|---|
| Page hero | ~60svh, dark, no image. Eyebrow, heading, intro, one CTA. Takes the `hero` type step, not `display-l` — sibling to the Creative Services hero |
| Step overview | Five numerals on one drawn hairline, sticky under the header from `md`; a horizontally scrolling strip below it. Summary and jump-link index in one bar |
| Five step blocks | The Creative Services split — 5/12 image against 6/12 copy — plus a display-size numeral as the structural anchor. Side **and** surface alternate |
| In practice | A worked example on a vertical rail: step name in a fixed left column, narrative beside it. Labelled illustrative **in rendered copy**, because the piece has not been produced |
| Scope and revisions | Four topics in a 2×2 grid on hairlines, not cards |
| FAQ | The shared accordion, with a real heading |
| Closing CTA | The shared `FinalCta`, with page copy and its own accent phrase |

Three things worth knowing before editing it:

- **The overview's offsets are measured, not written down** — same arrangement as
  `CapabilityIndex`, but publishing `--process-anchor-offset`, its own variable. Sharing
  the services one would leak one page's measurement into the other's fallback.
- **Every dark step block sets `fade={false}`.** The approved description under each step
  name is accent-on-dark, which fails against the entry fade's start value. The worked
  example keeps the fade, because it carries no accent text.
- **The "What we need from you" list is the most useful thing on the page** and is not in
  the brief. So are the durations, the two included revision rounds and the file-retention
  windows — all invented, all commitments a prospect could hold the studio to, and all
  called out separately at the top of the drafted-copy section in `docs/content-todo.md`.

## Ways to Work With Us (`/ways-to-work-with-us`)

The third inner page, and the destination of both inner pages' engagement pointers. Its own
bounded context — `src/domain/engagement/` — with `EngagementRepository`,
`GetWaysToWorkPage`, `ways-to-work.content.ts` and a `container.engagement` entry, for the
same reason `src/domain/process/` is separate: `MarketingContentRepository` is the
homepage's aggregate and `GetHomepageContent` awaits every method on it.

`EngagementTierDetail extends EngagementTier` and `CustomPartnershipDetail extends
CustomPartnership`, so the four tier **names, labels, summaries and both of the brief's
per-tier lists** keep one definition. The content file spreads each tier from
`waysToWorkBlock`; the hero takes that block's heading and intro; the two list labels come
from the new `TIER_FIELD_LABELS` export; two of four FAQ entries are imported. Tests fail
if any of them diverges.

**The two lists are split, not rewritten.** The brief gives "Ideal for" and "Typical work
includes" as sentences — "A, B, C and D." — and the page renders them as lists.
`splitListSentence` breaks the approved sentence up, `joinListSentence` puts it back, and a
test round-trips every list and asserts the client's string returns character for
character. A splitter that ever reflowed the client's words fails the build.

Block shapes:

| Section | Shape |
|---|---|
| Page hero | ~60svh, dark, no image. A plain `<section>`, so no entry fade to reason about |
| Tier comparison | A real `<table>` at `lg`+ — `<caption>`, `<th scope="col">` on tiers, `<th scope="row">` on the four criteria. Below `lg`, a scroll-snap swipe of column cards with a dot indicator |
| Three tier blocks | The shared asymmetric split, 5/12 image against 6/12 copy. Side and surface alternate. The brief's label takes the eyebrow slot; its summary sits under the name in accent |
| Custom partnership | Full width, accent border at rest, a wide 16:9 band, and the brief's invitation set at display size. Enters at 520ms against the tiers' 320ms |
| How to choose | Four self-selection questions on hairlines, each resolving to one tier and linking to its anchor |
| Scoping | Four steps in a 2x2 grid on hairlines. Dark, no accent text, so it keeps the entry fade |
| FAQ | The shared accordion |
| Closing CTA | The shared `FinalCta` |

Three things worth knowing before editing it:

- **The comparison is one DOM tree, not two.** The breakpoint is a `matchMedia` gate
  driving a conditional render — recovered from the homepage's old `ComparisonMatrix`
  (commit `39705d5`). Two trees hidden from each other with CSS would put every cell in
  the accessibility tree twice. `rowsFor` is the single definition both renderings read,
  and the verification asserts exactly one table and zero swipe tracks at `lg`+, and the
  inverse below it.
- **It is a fit-finder, not a pricing table.** No ticks, no crosses, no withheld rows:
  every cell says what a tier is, none says what it lacks. A feature-gated grid implies a
  cost ladder even with no figures on it, and the brief forbids public pricing. Three
  tests hold the line — no drafted string may mention price, pricing or cost; the page may
  carry no figure, range or rate; and the scoping block may state no duration or minimum
  term.
- **Nothing on this page is an operational commitment**, deliberately. The brief supplies
  no turnaround, revision count, minimum term or capacity guarantee, and this is the page
  a prospect would quote back. What was *not* promised is listed in `docs/content-todo.md`
  so the omissions are visible rather than accidental.

## Selected Work (`/selected-work`)

The fourth inner page, and the only one that did **not** get a new bounded context —
`src/domain/portfolio/` already existed and this page is its natural home. It adds
`CaseStudyDetail extends CaseStudy`, a second method on `PortfolioRepository`, a
`GetSelectedWorkPage` use case and `selected-work.content.ts`. The two reads stay separate
methods on purpose: the homepage wants the eight summaries and nothing else, and folding
them together would make it await copy it never renders.

**Read this before editing anything on the page.** The brief lists eight planned portfolio
pieces and **none of them has been produced.** A grid of stock covers under real titles is
defensible as a homepage summary; at page scale, with a filter and a detail view over it,
the same grid reads as a body of finished work. So the page is written as a deliberate
"what we are building" page, and the block immediately under the hero says so in visible
copy before a reader has seen a single cover. That block is not decorative — it is what
makes the rest of the page honest. Do not move it below the grid and do not cut it.

`CaseStudyDetail extends CaseStudy`, so the eight **titles**, their one-line **intents**
and their **references** keep one definition and cannot drift from the homepage. The hero
reads `workIntro`; every capability reference is looked up in `capabilities` and throws if
the name has changed. Tests fail if any of them diverges.

Block shapes:

| Section | Shape |
|---|---|
| Page hero | ~60svh, dark, no image. The framing block below it is what has to be on the fold, not a hero band |
| The honest framing | Light. Heading left, one two-sentence paragraph right. Sits on the same continuous light surface as the grid — a dark band between them would separate the statement from the work it is a statement about |
| Filter + grid | One section, not two. The chips are real `<button>`s with `aria-pressed` and `aria-controls`, at a 44px target and an `ink-60` border, which is the lightest step on the ramp that clears 1.4.11's 3:1 for a control boundary; the grid is `.work-grid`, shared with the homepage — equal columns in multi-column flow, both starting at the container, nothing bleeding out of it |
| Piece detail | A native `<dialog>` opened by the tile, bound to the URL fragment |
| The order | Dark, three cards, each resolving its pieces by slug and linking back to their tiles. **Drops the entry fade** — its numerals and marks are accent-on-dark |
| Capabilities | Light, one row per capability on hairlines, each linking to its `/creative-services` anchor |
| Closing CTA | The shared `FinalCta` |

Five things worth knowing before editing it:

- **Nothing is invented.** No client name, no brand, no outcome, no metric, no view count,
  no testimonial, no date, no duration, no budget, no team credit and no award appears
  anywhere. Two checks hold it: a unit test asserts no drafted string contains a digit at
  all, or any results, attribution or audience vocabulary; and the browser verification
  asserts the same against the **rendered** page, walking text nodes rather than one
  `innerText` blob so a failure names the offending string. Four things are excluded from
  that sweep and only four — the piece references, the filter counts, the shared demo
  form's company-size options, and `.work-intent`, which is the client's own approved
  brief for each piece (one of the eight reads "B2B/corporate credibility.").
- **The status marker is "Planned — not yet produced".** One wording, defined once as
  `statusLabel`, rendered on every tile and again in the detail view — a chip on the media
  rather than a hover state or a footnote. Because it is text on a photograph, which axe
  cannot evaluate, it carries its own opaque fill and its contrast is measured against
  that fill: canvas on accent at rest (5.107:1), canvas on ink on hover (12.549:1), and
  the verification measures it explicitly rather than trusting axe to. The category chips
  sit BELOW the media on the section's own background for the same reason.
- **The detail is a panel, not eight routes** — and it is still linkable. Eight routes
  would be eight indexable pages whose entire content is one approved intent line and two
  drafted paragraphs about work that does not exist. The panel is bound to the URL
  fragment instead, so `/selected-work#ugc-transformation` scrolls to the tile and opens
  its detail — which is exactly what the navigation's work menu has been linking at since
  before this page existed. When the pieces are produced, routes become the right answer
  and these fragments can redirect into them.
- **Filtering changes the rendered set**, it does not hide tiles with CSS. A screen reader
  and a crawler see the same three that a sighted reader does. `activeCategory` is what
  the controls report immediately; `renderedCategory` is what the DOM holds and lags it by
  one 180ms fade, which is what makes the swap a transition rather than a snap. Under
  reduced motion the two are the same value and the change is instant. The verification
  presses every chip and asserts the grid rendered exactly the count the chip claims.
- **The taxonomy is not invented.** The filter chips ARE the six capability names, looked
  up in `capabilities`, and their counts are derived from which pieces exercise them. A
  category with nothing behind it cannot exist. `slugifyTitle` is now shared
  (`static/slugify.ts`) by the navigation, Creative Services and this page, because the
  three are two ends of the same link and three private copies were three chances for one
  to drift.

## About (`/about`)

The fifth and **shortest** page on the site. Six sections where the other inner pages
have eight or ten, less copy in each, a hero at ~50svh rather than ~60, no call to action
in that hero, and a stylesheet of two rules. All of that is deliberate: the brief asks
for About to stay relatively short initially, and the page is built to read as quiet by
design rather than thin by accident. **If it looks short, that is the specification.**

Its own bounded context — `src/domain/about/` with `AboutRepository`, `GetAboutPage`,
`about.content.ts` and `container.about` — for the same reason `process` and `engagement`
are separate: `GetHomepageContent` awaits every method on `MarketingContentRepository`.

The client's own About copy lives in **`aboutBlock` in `marketing.content.ts`**, not in
the page module. That file is the one place the client's words live, and `about.content.ts`
reads from it. Two of those six strings are verbatim from the brief; the other four are
the brief's own phrases completed into sentences, and `docs/content-todo.md` says which is
which so the client can replace each with their full version.

Block shapes:

| Section | Shape |
|---|---|
| Page hero | ~50svh, dark, no image, **no CTA**. Every other hero carries one; this page's argument is "here is who this is", and the ask belongs at the foot |
| The belief | The client's central sentence, centred at display size, standing completely alone with the `statement` measure of space around it |
| What we do, and why | The shared asymmetric split, 5/12 image against 6/12 copy. Dark, and it keeps the entry fade — every colour in it is canvas or canvas-80 |
| Part of Famysys | Light. Three short paragraphs and one external link |
| Where we're going | Light. The ambition and the current position, side by side on a hairline |
| Closing CTA | The shared `FinalCta` |

Five things worth knowing before editing it:

- **The belief statement is the site's third and last centred moment.** The homepage has
  the other two — the thesis line in The Differentiator and the closing CTA heading — and
  everything else on every page is flush left. That rarity is the entire effect. The
  statement therefore carries no eyebrow, no rule and no supporting line: its section
  label is an accessible name, not rendered copy, because a centred eyebrow above it
  would have been a second centred element. The verification counts them and asserts the
  page authors exactly one.
- **Nothing is invented.** No team member, name, headcount, founding date, office
  location, client count, revenue figure, award, partnership or certification appears
  anywhere. The studio is, in the brief's own words, still starting — a page implying an
  established agency would contradict its own copy two sections further down. A unit test
  asserts the content module contains no digit at all and no founding, premises, award or
  scale vocabulary; the browser check asserts the same against the rendered page.
  **"India" is the one deliberate exception**: it is in the client's own ambition
  sentence describing a market, so the location check targets premises language
  ("headquartered", "based in", "our offices") rather than the word.
- **The ambition and the present tense are one block and never separate.** The client
  supplies both — what the studio intends to become, and that it is starting
  deliberately. Rendering the first alone would turn a plan into a claim about today,
  which is the single easiest way for this page to become false. A test asserts both are
  present.
- **The motion is the site's existing vocabulary and nothing else** — standard scroll
  reveals plus the heading clip reveal. No cursor tracking, no draw-on, no staggered
  grids, no parallax, and no image settle, which is why `AboutApproach` is a plain server
  component where its siblings on the other pages are client components. The one
  deviation is the belief statement's entry at 520ms rather than 320ms: a different
  duration is emphasis, a different effect would have been a new effect.
- **One image, with no people in it.** The brief allowed two. The second was left out
  because the "Where we're going" block is two sentences whose whole effect is the
  pairing, and a photograph beside them would compete with it. The one that ships shows a
  grading interface rather than a person, because on an About page a stranger's face
  reads as *our team* — see `docs/content-todo.md` for the three candidates rejected at
  crop check.

## Contact (`/contact`)

The seventh and last page, and **the only one whose reference is famysys.com's own contact page**
rather than the design language the other six share. The client asked for it, and that page
already solves this problem.

> ### Submissions are kept, then emailed.
>
> Both forms — the closing "Start a Conversation" form on every page and the eight-field form
> here — POST to `/api/demo-request`, which validates through `SubmitDemoRequest` and writes a
> row to `inquiries`. The admin panel's **Inquiries** screen lists them newest first, with
> mark-as-read and archive.
>
> Until Phase 3 this route was backed by `StubLeadRepository`, which validated a request and
> discarded it — and worse, the route lived in a private `_api` folder that a static export
> never emitted, so in production the form POSTed to a URL that did not exist.
>
> **Notification goes through Microsoft Graph.** Once the row is stored and the form has its
> `201`, the route schedules two emails with `after()`: a notification to the studio with
> Reply-To set to the sender, and an acknowledgement to the sender. The row lands first and
> mail happens after, so an outage can never cost a lead; `notified_at` and `ack_sent_at`
> record what Graph accepted. Off by default (`MAIL_ENABLED=false`) — see "Outbound mail" in
> `docs/deployment.md`, and `npm run mail:check`.

**Two sections**, where the other inner pages have six to ten. Someone arriving here has already
decided to get in touch; making them read four more blocks before reaching the form would be
arguing a case that has already been won. There is no `FinalCta` either — the closing CTA on
every other page points *at* this one, and the form is the ask.

| Section | Shape |
|---|---|
| Page hero | **Light** — the only light hero on the site. Square accent bullet, `CONTACT` eyebrow, a two-line display heading, an intro at a 52ch measure. Left-aligned, and nothing at all on the right half |
| Form | Dark, two columns: the form in 7 of 12, a raised panel in 5. `fade={false}` |

It extends the existing **`lead`** context rather than adding one — `DemoRequest`, `BusinessEmail`,
`FullName` and `CompanySize` were already there and this is their natural home. Three value objects
are new (`ContactRole`, `ProjectBrief`, `CompanyWebsite`), the entity's three extra fields are
optional so the four-field closing form still validates through the same use case, and the page's
own copy lives in its own bounded context (`src/domain/contact/`, `GetContactPage`,
`contact.content.ts`, `container.contact`) for the same reason `about` and `process` do.

### What was deliberately not carried over from the parent's page

Four things, and the first is not a copy decision:

- **The trust badges.** "SOC2 Type II Compliant", "Strict Commercial NDA" and "Zero Lock-In
  Guarantee" are the parent company's certification and commitments. The Studio is a new arm, the
  brief says nothing about any of them, and a certification claimed by a business that does not
  hold it is a false statement about an audit rather than unapproved copy. The space is empty.
  A unit test fails if `soc2`, `iso`, `certifi`, `compliant`, `nda`, `guarantee` or `lock-in`
  appears anywhere in the page's content.
- **The contact details.** `hello@famysys.com` and the phone number on that page are the
  *parent's*. `panel.direct` is `{}`, and while both fields are absent the "Or reach us directly"
  block does not render at all, so the page never shows a heading with nothing under it. The
  footer still carries the parent's address from before this page existed — same decision, listed
  in `docs/content-todo.md`.
- **The QR business card.** A digital business card belongs to a person. Whose it would be here
  is a question, not an asset to copy.
- **The hero copy and the role options.** Both are engineering-shaped on the parent's page. See
  below, and `ContactRole`'s own header comment.

### The role options are not the parent's

famysys.com asks CEO / COO / CFO / CIO-CTO / VP / Other — shaped for an enterprise IT buyer
approving an engineering engagement. The Studio sells creative production to marketing, brand and
content owners, often at companies with no C-suite to route through, so reusing that list would
have made two thirds of it unanswerable and pushed most real senders into "Other", which is the
same as not asking. The six are Founder / Owner · Marketing Lead · Brand or Creative Lead ·
Content or Social Lead · Agency or Partner · Other.

**`CompanySize`'s bands changed for the whole site**, from a five-band set the previous build
invented to famysys.com's four (1–50 · 50–200 · 200–1,000 · 1,000+). Both forms read
`CompanySize.options()`, so the closing form's dropdown changed with it. Keeping two overlapping
vocabularies, where "1-10" and "1–50" were each valid, would have made the answers un-comparable
between the two forms for the sake of a set nobody had confirmed. Nothing persists a submitted
band, so there was no stored data to migrate.

### Validation

Two passes over the same value objects, and they agree on wording where they overlap:

- **`validateContactRequest`** (application layer) runs in the browser and collects **all eight
  fields at once**. `SubmitDemoRequest` builds its value objects one after another and throws on
  the first failure, which is right for a use case and wrong for a form: someone who submits an
  empty one has to see seven errors, not discover them one submit at a time.
- **The route** still runs `SubmitDemoRequest` and stays the authority. The client pass exists so
  the reader gets their errors without a round trip, not so the server can trust the browser.

| Case | Message |
|---|---|
| Empty required field | `Required` |
| Malformed email | `Enter a valid email address, like name@company.com` — the address is not repeated back |
| Likely typo (`shaf@gmai.com`) | `Check the address — did you mean shaf@gmail.com?` |
| Free-mail address | `BusinessEmail`'s own actionable message, naming the domain |
| Malformed website | `That does not look like a website address`. Empty passes; the field is optional |

**Validate on submit, then re-validate on change once a field has errored.** Not on blur: telling
someone their email is malformed while they are still typing the domain is the form arguing with
them mid-sentence.

Accessibility, each verified in the browser rather than assumed: `aria-invalid` on every failed
field, `aria-describedby` pointing at the error element, focus moved to the **first invalid field
in page order** (which is why `CONTACT_FIELD_ORDER` exists — object key order is not page order),
and a summary announcing the count. The warning triangle is `aria-hidden`; the message carries the
meaning.

**`role="alert"` sits on the summary region, not on the eight field messages.** Eight assertive
live regions firing for one keypress is eight interruptions; the field messages are reached
through `aria-describedby` when focus lands on the field, which is the moment they are needed —
and focus is moved there immediately after the summary is read.

### Contrast: the numbers this page turns on

The form section is dark and does not fade, so ink is the real backdrop from the first frame.

| Role | Token | On ink |
|---|---|---|
| Input value | `canvas` | 12.549:1 |
| Label | `canvas-80` | 8.530:1 |
| Placeholder / muted | `canvas-60` | 5.450:1 |
| **Input underline** | **`canvas-40`** | **3.231:1** |
| Error message and errored underline | `accentOnDark` | 5.015:1 |
| Panel numerals (on the panel's canvas-4 ground) | `accentOnDark` | 4.515:1 |

**The underline is `canvas-40`, not the `canvas-10` the boxed form used.** When a rule *is* the
field — the only thing telling a reader where to type — it is a user-interface component boundary
and WCAG 1.4.11 puts a 3:1 floor on it. `canvas-10` reads 1.325:1 and `canvas-16` reads 1.582:1;
`canvas-40` is the first step on the ramp that clears it. The same fix was applied to `DemoForm`,
whose transparent-filled inputs had the same problem on six pages.

There is **no dedicated error colour in the palette**, and none was invented — a sixth hex outside
the brand set, derived and audited for one state, is a bigger change than this page should make.
The errored underline is `accentOnDark`, agreeing with the message beside it; the message, the
triangle and `aria-invalid` carry the meaning.

### `solidAtTop` — why the header needed a prop

`Header` is **transparent while the page is unscrolled**, because on all six other pages it sits
over an ink hero and the mosaic behind it is the point. This page opens on canvas, where that
treatment would put canvas nav links on a canvas ground at 1:1. `Header` takes `solidAtTop`, and
`/contact` is the one route that passes it: the bar starts filled with ink instead of transparent.
Everything from the scroll threshold down is unchanged, since the scrolled state was already ink.

The prop has been removed and restored once. It went away when the bar was made permanently ink
and there was no transparent state left to except; it is back because the transparent state is.
The underlying fact is the one that has never changed — this page's first section is canvas, and
canvas nav links need something behind them.

### Motion: as little as the page can have

The form's rows arrive on a 50ms stagger and **nothing else moves**. Errors appear with no
transition at all — an error that fades in is slower to read and slower to act on than one that is
simply there.

The rows use a local `RevealOnLoad`, not the shared `Reveal`, and the difference matters: `Reveal`
fires from an IntersectionObserver, and at 1440×900 the lower half of this form starts below the
fold, so those fields would sit at `opacity: 0` — invisible, and still in the tab order. Someone
tabbing down from the hero would land on a field they could not see. Triggering from mount paints
every field within about 500ms of load however the page is entered. The effect itself is the
site's existing `revealStyle`, including its collapse to opacity-only under reduced motion.

## Two content sources, one set of interfaces

Every domain repository interface has two implementations. `Static*Repository` in
`src/infrastructure/content/repositories/` reads the TypeScript modules; `Db*Repository` in
`src/infrastructure/db/repositories/` reads MySQL. `CONTENT_SOURCE` picks, in
`src/infrastructure/di/container.ts` — the sole composition root — and nothing else in the
codebase moved when the database arrived. **No interface changed**, no use case changed, no
component changed, no test of either changed. That was the point of the layering, and this
is the receipt.

On top of the switch, every database repository is wrapped so that a database which cannot
be **reached** hands over to its static counterpart. That fallback is deliberately narrow —
see `src/infrastructure/db/fallback.ts`. A missing row is a bug and propagates; only a
connection or credential failure falls back. A site that quietly renders last week's file
because a query was wrong is a site where nobody finds out.

`src/infrastructure/db/repositories/parity.test.ts` reads all twenty repository methods
from both sources and asserts they are equal field for field, which is what says the
migration was faithful.

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
   APPROVAL.** The brand rules specify Jost with a fallback stack and nothing else. On the homepage
   the serif appears in five phrases across eight words, all display-size: the last three words of
   the hero headline, one word in The Differentiator's heading, two separate words in the thesis
   line, and two in the final CTA heading. That is **exactly at the five-phrase cap** — every other
   page renders two phrases, `/contact` one — so anything added to a homepage heading breaks it. It
   is reachable only through `RevealHeading`'s `accent` prop and is banned from body copy, card
   titles, eyebrows, nav and buttons; a check in the verification pass fails if more than five
   accent phrases appear on a page or if one lands anywhere it shouldn't. Set 5% up on the
   surrounding Jost, because serif italic reads optically smaller at the same px.

   **These words now carry the accent COLOUR as well as the face** — `accent` on light surfaces
   (5.107:1 on canvas) and `accentOnDark` on dark ones (5.015:1 on ink), rather than inheriting the
   heading's colour. The consequence is that a `<Section dark>` carrying an accented heading can no
   longer run the entry fade, since `accentOnDark` falls to 3.79:1 against the fade's start value.
   The Differentiator is the only such section on the site and takes `fade={false}`; every other
   accented heading sits on canvas or in a hero that never faded.

6. **`/contact` opens on a LIGHT hero — the only page that does.** Every other hero is ink, and
   `Header` is transparent while the page is unscrolled because it assumes one underneath. The
   `solidAtTop` prop exists for this single route and starts the bar filled; without it the nav
   would be canvas text on a canvas ground at 1:1. See the Contact section above.
7. **`FinalCta` no longer fades its background.** It carries a form, and by this project's own
   rule any colour derived against full ink is wrong for the first 900ms of a fading section: the
   form's error messages are `accentOnDark` (5.015:1 on ink, 3.792:1 at the fade's start) and its
   input borders are `canvas-40` (3.231:1 on ink, 2.887:1 at the start, against a 3:1
   UI-boundary floor). Both were true before `/contact` existed; the measured contrast pass built
   for that page is what surfaced them. The section keeps its `statement` rhythm and loses only
   the settle. `/contact`'s own form section is `fade={false}` for the same reason.

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
  | Selected Work | Two columns of media tiles with cycling aspect ratios, flowed down the columns so every vertical gap is identical; both columns start at the container |
  | Why Famysys | 3 + 2 on a six-track grid — three cards spanning two tracks, then two spanning three, so the bottom row fills its width |
  | FAQ | Accordion at a 72ch measure |

  Uneven spans are reserved for tiles that genuinely differ in weight or carry media. Even grids
  use `auto-rows-fr` and fill their last row exactly, so none of them leaves a hole.
- **Card fill is `ink-06`, not `ink-08`.** The limiting factor is not body copy — graphite-70
  stays above 4.5:1 as far as ink-12 — but the accent `text-small` on the engagement-tier cards,
  which reads 4.570:1 on ink-06 and fails at ink-07 (4.485:1). Border is `ink-12`.
- **The hero is exactly one viewport tall**, header included — `height: 100svh` with the fixed
  header overlaying it. The headline takes its own `text-hero` step rather than `display-xl`,
  which broke the client's 48-character headline onto five lines in a 46%-wide column; at 1440 it
  resolves to ~40px and holds two lines. The subhead is capped at 52ch and lands on three lines,
  not the two-and-a-half the brief asked for — see the note below.
- **The hero mosaic is positioned against the section, not placed in the container grid.** That is
  what lets it start at the very top (tiles pass behind the transparent header) and finish flush
  with both the section's bottom edge and the viewport's right edge. A gradient of the section's
  own ink holds the top back far enough for the nav to read over whatever photograph is passing;
  the bottom 15% dissolves into the ink.
- **The inline nav needs `xl`, not `lg`.** The real page names ("Ways to Work With Us", "Creative
  Services") are long enough that the header collapses to the mobile drawer below 1280px.
- **The three panelled nav items are links, not buttons.** They are pages as well as menus, so
  hover opens the panel and click goes to the page; ArrowDown is what opens it from the keyboard,
  since Enter navigates. They were buttons that only toggled, which made every one of them a dead
  end — the page behind it was reachable only through "View all services" inside the panel.
  ARIA 1.2 supports `aria-expanded` on `role="link"`, so the disclosure survives being a link. In
  the mobile drawer the same row is split: the name is a link, and a separate chevron button
  carries the disclosure ARIA and its own accessible name.
- **Vertical rhythm is deliberately uneven** — `spacing.section` for light sections,
  `spacing.sectionDark` for dark ones, `spacing.statement` for the final CTA.

## Motion

Every effect below is gated on `prefers-reduced-motion` and re-verified after each change.

| Effect | Where | Mechanism |
|---|---|---|
| Continuous mosaic drift | Hero | Three JS-driven columns at 22–30px/s — outer up, middle down, never at rest. Driven from `requestAnimationFrame` rather than CSS keyframes because it has to **reverse** on scroll direction and **accelerate** with scroll velocity, neither of which a keyframe animation can do. Both eased exponentially, so the reversal passes through zero rather than snapping. Each loop copy repeats until it is taller than the column, or a gap scrolls into view at the bottom |
| Hero lightbox | Hero | Tiles are buttons: a scrim and corner-arrow icon fade in, the tile scales 1.03, and a click opens a portalled dialog with focus trap, Escape, backdrop click, arrow-key navigation and focus return |
| Nav panels | Header | Three items open a panel on a 120ms hover intent, fading and sliding 8px over 220ms with columns staggered 40ms; a 160ms grace period on the way out keeps the diagonal from trigger to panel alive |
| Nav link underline | Header | `scaleX` on a pseudo-element with a left origin — a compositor wipe, not a growing box — over 200ms, with the resting colour lifting from 80% to full |
| Line-by-line heading reveal | Every display heading | `RevealHeading` measures which rendered line each word landed on and gives that line an 80ms-stepped delay; words clip up from their own baseline. Tops are clustered with a tolerance rather than compared exactly, because an accented word is 5% larger and so sits in a taller box on the same baseline |
| Staggered grid entry | Every card grid | `Reveal` at 60ms per tile |
| Step numerals | Homepage §4 | `ClipNumber` — each numeral clips up on its own observer as its step enters |
| Card hover | All cards | Accent border, 6px lift, no shadow; media tiles add a 1.05 scale |
| Background settle | Dark sections | `Section` fades ink-90 → ink on entry; the start state still holds canvas text at 9.616:1. Opt out with `fade={false}` where the section carries **accent-on-dark** text or a form — that colour is derived against full ink (5.015:1) and measures 3.79:1 against the fade's start value, ink-90 over canvas (#22405D). The failure is intermittent, since it depends on how far the section has entered when anything looks. **The general rule: any colour whose ratio was derived against `ink` is wrong for the first 900ms of a fading section.** Canvas and canvas-80 are the only text colours safe throughout. Two sections opt out: `/contact`'s form section, and `FinalCta` on every page (deviation 7). The remaining live instance is §3's accent panel on the homepage — a *fill*, not text or a UI boundary, so no criterion applies, but its already-soft 2.458:1 edge against the ground gets softer mid-entry before settling |
| Split-block entry | Creative Services | Image then copy, 120ms apart; the image is the half that establishes which side of the split the block is on |
| Image settle | Creative Services | The block image scales 1.0 → 1.03 as it arrives and stops. It settles; it does not loop |
| Deliverable stagger | Creative Services | 50ms per row, fired from the list's own observer rather than one per row — the rows are close enough together that per-row observers would fire at once and collapse the stagger |
| Belief statement entry | About | The standard reveal at 520ms rather than 320ms, and it is the page's only motion beyond the shared reveals. The rest of About deliberately adds nothing — no settle, no stagger, no draw-on |
| Filter transition | Selected Work | The grid fades to zero over 180ms, the set is swapped, and the new tiles stagger in at 60ms. The controls report the new state immediately; only the DOM lags |
| Tile hover | Selected Work | The locked treatment, fired from the WHOLE card rather than from the media: accent border, 6px lift, media 1.05, chip colour shift. `:focus-within` gets the same escalation, and the focus ring moves onto the media so a keyboard user sees the tile take focus rather than four words of a title |
| Tile image settle | Selected Work | 1.03 → 1.0 on entry, then hover takes it to 1.05. The settled selector carries the `data-settled` attribute on both sides so it does not out-specify the hover rule and freeze the media under the cursor |
| Detail panel | Selected Work | Backdrop fade and a 0.96 → 1 panel scale, driven by a `data-visible` attribute set a frame after `showModal()` and cleared before `close()` — which animates the exit too, without needing `@starting-style`. `cancel` is intercepted so Escape animates out rather than vanishing |
| Comparison row entry | Ways to Work | Four rows top to bottom at 60ms from one observer on the table, not one per row |
| Tier block entry | Ways to Work | Image then copy, 120ms apart, as on Creative Services |
| Custom block entry | Ways to Work | The same reveal at 520ms rather than 320ms. A different effect would have been a new effect; a different duration is emphasis |
| Swipe dots | Ways to Work | Real `<button>`s at a 44px target with `aria-current`, so the track is operable from the keyboard and not only by dragging |
| Overview rule draw | How We Work | The bar's hairline draws left to right across the 900ms budget, a segment per step, with the numerals clipping in 140ms apart as the line reaches each |
| Step block entry | How We Work | Numeral, then heading, then the rest of the copy, 100ms apart — tighter than the Creative Services split step, because these are three parts of one column and a 120ms gap between a numeral and the heading under it reads as a stall |
| Overview active step | How We Work | Colour and underline over 200ms as each detail block passes the reading line — `useActiveAnchor`, the same hook and the same reason as the services index |
| List stagger | How We Work | Both per-step lists reuse `DeliverableList` at 50ms per row |
| Image settle | How We Work | `.step-media`, the same 3% settle as `.capability-media` |
| Form row entry | Contact | A 50ms stagger on the five field rows and the submit button, fired from MOUNT rather than an observer. `Reveal`'s IntersectionObserver would leave the rows below the fold at `opacity: 0` — invisible and still tabbable — so this one is a local `RevealOnLoad` using the same `revealStyle`. It is the only motion on the page |
| Error entry | Contact | None, deliberately. Errors are rendered with no transition: an error that fades in is slower to read and slower to act on than one that is simply there |
| Sticky index active state | Creative Services | Colour and underline transition over 200ms as sections pass. The active section is the last one whose top has crossed the reading line, not whichever is intersecting — the sections are taller than the viewport, so "is intersecting" is true for two of them at a time |

## Placeholder media

Every image referenced by `src/infrastructure/content/static/*.content.ts` is a real photograph
committed to `public/media/`, and every one of them is a stand-in for work the studio has not
produced yet. There is no generator: the SVG placeholder script this section used to describe was
removed when the photography replaced it.

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
- **axe, sampled settled — plus a separate, timing-free fade check.** Dark sections fade
  their background over 900ms, so a colour can pass once the page has settled and fail
  while a section is entering. The obvious check — run axe a moment after each scroll —
  turns out to be **unsound**, and the note that used to sit here recommending it was
  wrong. Sampling mid-scroll also catches every element part-way through its own
  `opacity` 0→1 entry reveal, which axe correctly reports as low-contrast and which no
  colour choice can fix. Whether it fires depends on where the sample lands in the
  transition: `/ways-to-work-with-us` reported 1, 2, 2 violations across three identical
  runs, and `/how-we-work` — which had "passed" this check — produces 8 under a slightly
  different rhythm. That was luck, not a result.

  The two hazards are now separated:

  1. **axe at seven scroll fractions, sampled after transitions settle**, at 390 and 1440,
     in both motion modes, three runs each. Deterministic; the run-to-run counts are part
     of the assertion.
  2. **The fade-start rule, measured rather than sampled.** Every text colour inside a
     `.section-fade` section is composited over `#22405D` — the background that section
     shows for its first 900ms — and checked there. It reads colours, not timing, so it
     cannot be lucky. It skips text painted on its own opaque fill (the canvas-filled
     primary button, a card), which is what every real contrast tool does.

  Both pages pass both, on three consecutive runs.

- **The contact form, checked as behaviour rather than markup.** Submit empty and confirm an
  inline error under every required field and none under the optional one; submit a malformed
  email and a malformed website and confirm each gets its own message, and confirm a personal
  address such as gmail.com is accepted;
  confirm focus lands on the first invalid field *in page order*; confirm the summary announces
  the count; confirm the error sits the same distance under all eight fields; confirm a
  half-typed email is NOT errored on blur before the first submit, and that an errored field
  clears as it is corrected; tab from the first field through to the submit button; operate both
  selects from the keyboard and read their options' computed colours, because a select popup
  inherits the control's colours and canvas-on-white is the failure that looks fine in a
  screenshot. 53 assertions, all passing.
- **Site-wide link resolution.** Every `<a href>` on all seven pages — 468 of them, mega-menu
  panels and mobile drawer included, since a link that only appears on hover is still a link —
  collected and requested against the running build. Seven distinct internal targets, all 200.
  `internalLinks.test.ts` asserts the same thing in the unit suite by reading the routes off
  disk, so a page deleted later fails the build rather than the browser.

**Before verifying anything against a production build, stop every other node process.**
`next dev` and `next start` share this directory's `.next`, and dev mode rewrites it. A dev
server left running on port 3000 — hand-started in a VS Code terminal, which has happened
repeatedly — means `pnpm build && next start` serves a build dev mode has clobbered: the HTML
asks for `main-app.js` and `app-pages-internals.js`, both 404, and nothing hydrates. The page
then looks broken in ways that read as real regressions. It has produced motion checks
measuring zero, `aria-expanded` that never flips, and a phantom CSS regression, in two separate
sessions on one day.

So: check with `Get-CimInstance Win32_Process -Filter "Name='node.exe'"`, stop what you find,
confirm the port is actually free rather than trusting the kill, and only then build.

**A dev server can also appear *after* you build.** It happened again while verifying
`/ways-to-work-with-us`: `npm run dev` started five minutes into a verification run, from
outside the session, and rewrote `.next` underneath a live `next start`. The run reported a
wall of contrast failures in which every colour was a UA default — `rgb(0, 0, 0)` text and
`rgb(0, 0, 238)` links — because the stylesheet 400s once the production CSS is gone.

It has now happened six times, and it is **always a hand-started `pnpm dev` / `npm run dev`
in a VS Code terminal** rather than anything this repo's own scripts do. The most recent was
`pnpm dev --port 1234`, which the port number makes obvious in the process list — check the
full command line, not just whether something called `node` is running. Its three processes
(the pnpm wrapper, the `next dev` bin, and `start-server.js`) have to be stopped together,
and the last of them can survive one `Stop-Process` sweep, so re-check before building.

That signature is worth knowing, because it is decisive and takes two seconds to check:

```bash
cat .next/BUILD_ID     # empty  -> dev mode has clobbered the build
ls .next/static/       # a `development/` directory here means the same
```

A production build has a non-empty `BUILD_ID` and `static/{chunks,css,media}` with no
`development/`.

**It also happens in the other direction, and that one has its own symptom.** Leaving a
production build in `.next` and then starting `pnpm dev` on top of it makes dev mode
rewrite part of the directory, so webpack's manifest names chunk modules that are no
longer there. The browser throws:

```
Runtime TypeError: Cannot read properties of undefined (reading 'call')
```

That is `__webpack_require__` calling `.call` on a module that resolved to `undefined`.
It reads like a code bug in whatever component happens to be rendering, and it is not one
— run the same two checks. The fix is `rm -rf .next` and restart; nothing in `src/` needs
touching. A verification session that ends by leaving a production build behind sets this
trap for the next `pnpm dev`. If a verification result looks catastrophic rather than wrong, check these
two before believing any of it. Cheapest
insurance is a gate at the top of any verification script that asserts the page hydrates —
click something with `aria-expanded` and check it flips. If it does not, every later result is
meaningless and the script should say so and stop rather than report a page full of failures.

Related: `scroll-behavior: smooth` is set globally, so any automation that scrolls a page in
steps must pass `behavior: "instant"`. Without it each step restarts an unfinished smooth
scroll, the page crawls a few hundred pixels, and everything below stays unrevealed — which
looks like broken sections in a full-page screenshot.

**Not re-measured since the content rebuild:** the Lighthouse and axe-core numbers previously
recorded here were measured against the earlier version of this page, which no longer exists.
They have been removed rather than carried forward. Re-run both against the current build before
treating either as known.

## What's left

- **The eight Selected Work pieces do not exist yet.** This is still the largest gap between the
  site and a publishable one, but it is now a stated position rather than an unmarked one:
  `/selected-work` is written as a "what we are building" page, every tile carries "Planned — not
  yet produced", and the block under its hero says so in visible copy. See `docs/content-todo.md`.
  When the pieces are produced, the covers, the alt text and the panel-versus-route decision all
  want revisiting together.
- **Real hero stills.** The mosaic holds eight slots at fixed aspect ratios so real stills drop in
  one-for-one; it currently shows generated geometric placeholders.
- **Re-run Lighthouse and axe-core** against the rebuilt page, per the note above.
- **Wiring the contact forms to something real.** This is the one launch blocker. Both forms
  validate and then discard the submission — see the box in the Contact section above and the top
  of `docs/content-todo.md`. Everything else on this list is content or polish; this one loses
  inquiries.
- **`/privacy` and `/terms`.** Neither page nor its text exists. Both links have been removed
  from the footer rather than left pointing at a 404 — a broken "Privacy policy" is the wrong
  thing to be broken on a site whose form asks for a name, a company and an email. Supply the
  documents and the links go back. **All seven content pages are now built and every navigation
  destination resolves**, including the work menu's `/selected-work#<slug>` fragments.
- **What Famysys Studio can genuinely claim.** The parent's contact page carries a SOC2 Type II
  badge, an NDA commitment and a lock-in guarantee. None were reproduced, because a certification
  claimed by a business that does not hold it is a false statement about an audit rather than
  unapproved copy. The manager needs to say what is true in the Studio's own name.
- **The Studio's own contact details.** `hello@famysys.com` and the phone number on the parent's
  page are the parent's. `/contact` publishes neither, so the form is currently the only way to
  reach the Studio from that page. The footer still shows the parent's address.
- **Approval on the five inner pages' draft copy.** Everything on them except the client's own
  names, descriptors, process steps, tier content, piece titles and reused FAQ entries was
  written to fill them, and is listed for review in `docs/content-todo.md`. How We Work's
  **operational commitments** — revision rounds, turnaround times, file-retention windows — are
  the highest-risk of these and are called out separately. Ways to Work With Us and Selected
  Work deliberately make none, and each lists what it declined to promise for the same reason.
- **The capability mapping on Selected Work is a judgement, not a fact.** The brief says what
  each piece is for but not which of the six services it exercises, and that mapping drives the
  filter chips and their counts, so it is visible on the page. It needs confirming.
- **Copy the brief doesn't supply** — FAQ section heading, footer tagline, contact address, social
  handles, and confirmation of the contact form's fields. All listed in `docs/content-todo.md`.

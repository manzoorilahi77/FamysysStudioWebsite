# Content To Confirm Before Launch

The homepage now runs on the client's real V1 Homepage Content Brief. Every heading, body
paragraph, capability, process step, tier, reason and FAQ answer on the page is the client's own
copy, used verbatim. This file lists only what the brief did **not** supply, plus the placeholder
media still standing in for work that has not been produced.

The long inventory of fabricated clients, metrics, testimonials and team portraits is gone — those
sections were deleted along with the invented content behind them.

## Placeholder media

Every image on the page is **stock photography from Unsplash**, standing in until Famysys Studio's
own production stills and finished pieces exist. All files are downloaded into `public/media/` and
served locally — nothing is hotlinked. The [Unsplash License](https://unsplash.com/license) grants
free commercial use with no attribution required, so none of these need a credit line to ship; they
need *replacing*, because they are not the studio's work and the Selected Work section presents
them as if they were.

Source URL for any id below: `https://unsplash.com/photos/<id>`.

### Hero mosaic (§1)

File: `src/infrastructure/content/static/marketing.content.ts` (`MOSAIC_TILES`)

Eight slots at mixed aspect ratios (3:4, 1:1, 4:3), split 3 / 3 / 2 across the three drifting
columns. **Real production stills drop in one-for-one** without touching the layout — replace the
file and rewrite the `alt`, which currently describes the stock frame.

| Slot | Ratio | Shows | Unsplash id |
|---|---|---|---|
| `mosaic-01.jpg` | 3:4 | Clapperboard at the start of a take | `photo-1485846234645-a62644f84728` |
| `mosaic-02.jpg` | 1:1 | Video edit timeline filling a monitor | `photo-1574717024653-61fd2cf4d44d` |
| `mosaic-03.jpg` | 4:3 | Camera body and lenses on a dark surface | `photo-1516035069371-29a1b244cc32` |
| `mosaic-04.jpg` | 1:1 | Footage open in an editing application | `photo-1492619375914-88005aa9e8fb` |
| `mosaic-05.jpg` | 3:4 | Camera rig filming under coloured light | `photo-1601506521937-0121a7fc2a6b` |
| `mosaic-06.jpg` | 4:3 | Designer's desk, creative-suite icons on a tablet | `photo-1626785774573-4b799315345d` |
| `mosaic-07.jpg` | 1:1 | Mirrorless camera beside a laptop | `photo-1621600411688-4be93cd68504` |
| `mosaic-08.jpg` | 3:4 | Compact camera lit in blue and magenta | `photo-1516724562728-afc824a36e84` |

### The Differentiator (§3)

File: `src/infrastructure/content/static/marketing.content.ts` (`differentiatorImage`)

The four elements now render as a card row with an image filling the upper part of each card, so
every element needs a frame. Each stock photograph was chosen against its specific element and
checked against it before wiring — a replacement has to carry the same subject or the card stops
matching its own title. Rewrite the `alt` alongside the file.

| Element | Frame shows | Unsplash id |
|---|---|---|
| Human Creativity | Hand with a stylus over a tablet, on printed digital-painting artwork | `photo-1558655146-9f40138edfeb` |
| Intelligent AI Workflows | Ultrawide monitor on a studio desk, design tool full of artboards | `photo-1621111848501-8d3634f82336` |
| Professional Production | Overhead of an editor at a three-screen workstation, darkened room | `photo-1550439062-609e1531270e` |
| Efficient Delivery | Tidy daylit desk, laptop and monitor showing content dashboards | `photo-1499951360447-b19be8fe80f5` |

Two of these carry incidental third-party marks at full size — a monitor bezel logo on
`element-02`, another studio's page design on the `element-04` screens. Both are small enough to be
unreadable at the rendered card size, but they are one more reason these are placeholders.

### Selected Work (§6)

File: `src/infrastructure/content/static/portfolio.content.ts`

All eight pieces come from the brief's numbered list, and **none of them have been produced yet**.
The titles and one-line descriptions are the client's own planned briefs; every cover is a stock
photograph chosen to suggest the subject.

| # | Title | Cover shows | Unsplash id |
|---|---|---|---|
| 01 | Famysys Studio Capability Film | Cinema lens, close up | `photo-1512790182412-b19e6d62bc39` |
| 02 | Famysys IT Services Portfolio Film | Small team working at laptops | `photo-1521737711867-e3b97375f902` |
| 03 | Food / Restaurant Creative Campaign | Plated dish being served | `photo-1414235077428-338989a2e8c0` |
| 04 | UGC Transformation | Social apps on a phone screen | `photo-1611926653458-09294b3142bf` |
| 05 | Synthesia Business Explainer | Business portrait of a presenter | `photo-1573497019940-1c28c88b4f3e` |
| 06 | Training Video Series | Speaker addressing a training group | `photo-1524178232363-1fb2b075b655` |
| 07 | Product Visual Campaign | White smartwatch on a plain ground | `photo-1523275335684-37898b6baf30` |
| 08 | Motion Graphics Showcase | Multi-monitor rig with graphics on screen | `photo-1598550476439-6847785fcea6` |

This remains the single largest gap: the section presents eight pieces of work that do not exist,
now illustrated with photography that is not the studio's. Either the pieces get produced, or the
section ships with fewer entries, or it waits.

### Creative Services page (§/creative-services)

File: `src/infrastructure/content/static/creative-services.content.ts`

Seven slots. The six capability images are 4:3; the hero band is a wide 12:5 strip. Same
terms as everything above — Unsplash License, downloaded into `public/media/`, served
locally, no attribution required to ship and no hotlinking.

| Slot | Shows | Unsplash id |
|---|---|---|
| `service-hero-band.jpg` | Hands drawing on a technical plan, low light | `photo-1503387762-592deb58ef4e` |
| `service-creative-design.jpg` | Colour swatch books and a tablet of layout diagrams | `photo-1561070791-2526d30994b5` |
| `service-video-production.jpg` | Interview set: chair, lit backdrop, boom microphone | `photo-1554941829-202a0b2403b8` |
| `service-ai-video.jpg` | Presenter standing to camera against an orange wall | `photo-1573496359142-b8d87734a5a2` |
| `service-explainer-training.jpg` | People taking notes around a table | `photo-1517048676732-d65bc937f952` |
| `service-motion-graphics.jpg` | Corridor of brightly coloured panels | `photo-1502691876148-a84978e59af8` |
| `service-product-visuals.jpg` | Teal suede shoe styled on a pale pink set | `photo-1560343090-f0409e92791a` |

Alt text as written, to be rewritten alongside the images:

| Slot | Alt |
|---|---|
| Hero band | Hands drawing on a technical plan at a dark desk. |
| Creative Design | Printed colour swatch books beside a tablet showing layout diagrams. |
| Video Production & Editing | An interview set: a single chair on a lit backdrop, with a boom microphone overhead. |
| AI Video & Virtual Presenters | A presenter in a grey jacket, standing to camera in front of an orange wall. |
| Explainer & Training Videos | People seated around a table taking notes during a training session. |
| Motion Graphics & Advanced Creative | A corridor of brightly coloured panels receding into the distance. |
| Product & Brand Visuals | A teal suede shoe styled on a pale pink set, propped up on bread rolls. |

### How We Work page (§/how-we-work)

File: `src/infrastructure/content/static/how-we-work.content.ts`

Five 4:3 slots, one per process step, at 1600x1200 — the same size the capability images
use, since they sit in the same asymmetric split. Same terms as everything above:
Unsplash License, downloaded into `public/media/`, served locally, no attribution required
to ship and no hotlinking.

| Slot | Step | Shows | Unsplash id |
|---|---|---|---|
| `process-understand.jpg` | Understand | Two people talking across a table with open notebooks | `photo-1573496267526-08a69e46a409` |
| `process-create.jpg` | Create | A hand-drawn storyboard in a notebook | `photo-1681372751506-1586b0542195` |
| `process-produce.jpg` | Produce | A film crew on a lit soundstage | `photo-1612544409025-e1f6a56c1152` |
| `process-refine.jpg` | Refine | A hand pointing a pen at a monitor of thumbnails | `photo-1709281724580-43a03a73b93e` |
| `process-deliver.jpg` | Deliver | A laptop of finished frames with downloaded media files | `photo-1549098473-5cc4347b3eb3` |

Each was checked at its final 4:3 crop before being wired, and the alt text describes what
the frame actually shows — so both have to be rewritten when real work replaces them.

Three carry things worth knowing before this ships as-is:

- **`process-create`** has legible handwriting in it, about a band hiring a keyboard
  player. It is unreadable at the rendered card size and the storyboard structure is what
  reads, but the words are somebody else's notebook.
- **`process-produce`** shows a soundstage and a crew of fifteen. That is a larger
  production than the studio runs, so the frame promises a scale the page does not claim.
- **`process-deliver`** shows third-party application icons in a dock and a photographer's
  name on one thumbnail. Small at the rendered size, and the same objection as the marks
  on `element-02` and `element-04`.

### Ways to Work With Us page (§/ways-to-work-with-us)

File: `src/infrastructure/content/static/ways-to-work.content.ts`

Four slots. The three named tiers take 4:3 at 1600x1200, matching the capability and step
images they share a layout with; the Custom Creative Partnership takes a wide 16:9 band at
2400x1350, because that block is full width rather than a split. Same terms as everything
above — Unsplash License, downloaded into `public/media/`, served locally, no attribution
required to ship and no hotlinking.

| Slot | Tier | Shows | Unsplash id |
|---|---|---|---|
| `tier-launch.jpg` | Launch | A single studio light on a stand in a small room | `photo-1641499303047-5f1c5cd5b305` |
| `tier-grow.jpg` | Grow | A phone on a tripod recording, timer running | `photo-1744135995171-4e874fbab21e` |
| `tier-scale.jpg` | Scale | Hands drawing on a tablet with a stylus | `photo-1611241893603-3c359704e0ee` |
| `tier-custom.jpg` | Custom Creative Partnership | Two people comparing printed frames and colour swatches | `photo-1752650736242-d06f95024793` |

**Every one was picked for scale as much as subject.** One light, one phone, one pair of
hands, two people at a table — nothing here shows a crew, a soundstage or a floor of
staff. That is a correction: the How We Work page shipped a fifteen-person soundstage for
its Produce step, which promises an operation this studio does not run. A replacement for
any of these has to keep the scale as well as the subject.

Each was checked at its final crop before being wired, and the alt text describes what the
frame actually shows, so both have to be rewritten when real work replaces them. None
carries a legible third-party brand mark — two stronger candidates were rejected for
exactly that, one with a Coca-Cola bottle in shot and one with a Samsung wordmark.

### Selected Work page (§/selected-work)

File: `src/infrastructure/content/static/selected-work.content.ts`

Eight slots, one per planned piece, and **separate from the homepage's `case-01`…`case-08`
covers** — the same eight pieces, but framed for a page-scale grid rather than a summary
tile, and matched to the subject each title names. The ratio travels on the piece rather
than on its position in the grid, so the rhythm survives filtering. Same terms as
everything above: Unsplash License, downloaded into `public/media/`, served locally, no
attribution required to ship and no hotlinking.

| Slot | Piece | Ratio | Shows | Unsplash id |
|---|---|---|---|---|
| `work-capability-film.jpg` | Famysys Studio Capability Film | 4:3 | An empty studio: one softbox, a mirror, a director's chair | `photo-1786325492063-8967ed6ad88d` |
| `work-it-services.jpg` | Famysys IT Services Portfolio Film | 3:4 | A man talking in an office, a colleague's hands and a laptop in front of him | `photo-1758691737278-3af15b37af48` |
| `work-food-campaign.jpg` | Food / Restaurant Creative Campaign | 1:1 | A pastry on a plate being photographed, camera and reflector in frame | `photo-1758634553706-662cb7e38de4` |
| `work-ugc.jpg` | UGC Transformation | 4:3 | A hand holding a phone that is recording | `photo-1727334291061-fd29582ef9dc` |
| `work-synthesia.jpg` | Synthesia Business Explainer | 3:4 | A seated presenter under one light, framed by a camera in the foreground | `photo-1632821624074-5454c9e0b2a7` |
| `work-training.jpg` | Training Video Series | 4:3 | A camera, a microphone and a laptop on a low table, one person seated | `photo-1764664035154-379971f0e936` |
| `work-product-visual.jpg` | Product Visual Campaign | 1:1 | A green glass bottle shot from above on a plain surface, throwing a lit shadow | `photo-1758796540080-ace3379f958c` |
| `work-motion-graphics.jpg` | Motion Graphics Showcase | 3:4 | A video editing timeline on screen, clips in green, pink and blue | `photo-1574717024653-61fd2cf4d44d` |

**Scale, again.** One light, one camera, one or two people, one object on a table —
nothing here shows a crew, a soundstage or a floor of staff, for the same reason the tier
images do not. Any replacement has to keep the scale as well as the subject.

Every one was downloaded **at its final crop** — the exact pixel dimensions its tile
renders — and checked there rather than as a landscape original that `object-cover` would
later cut somewhere else. Five candidates were rejected during that check:

- a Sony camera body with the wordmark legible on the screen bezel;
- a pair of Jordan sneakers on a plinth, Jumpman logo in the centre of the frame;
- a perfume bottle whose label read "24 · LIVE ANOTHER DAY · EAU DE TOILETTE";
- a studio with a lighting-brand case in shot;
- a desk shot with a Canon lens cap face-up on the mat.

The alt text describes what each stock frame actually shows — not what the finished piece
will show — so it has to be rewritten the day the real cover lands.

### Hero subhead runs three lines, not two-and-a-half

The hero detail brief asked for a subhead of two to two-and-a-half lines **and** a measure capped
at 46–52ch. Those cannot both hold: the client's body copy is 180 characters, so at 52ch it is
3.5 lines by arithmetic, and reaching 2.5 lines would need a ~72ch measure. The measure cap was
followed (52ch, landing on three lines at 1440). Shortening the copy would need the client, since
every string on the page is theirs verbatim.

### Video — not delivered, and why

The brief asked for 2–3 short **Unsplash** videos so some hero tiles move. **Unsplash does not host
video.** It is a photo library: there is no videos endpoint on its API, and `unsplash.com/videos`
is a marketing page, not a library. There is no way to satisfy "source only from Unsplash" and
"add video" at the same time.

Nothing was substituted, and no video machinery was added that would sit unused. To unblock this,
pick one:

1. **Famysys Studio's own footage** — the right answer, and the point of the exercise.
2. **A free-license video library** (Pexels or Coverr; both grant commercial use without
   attribution, on the same terms as Unsplash). This needs an API key — their search endpoints
   reject unauthenticated requests, so clips cannot be selected without one.

Once a source is settled, the work is: restore an `AutoplayVideo` component (muted, looping,
`playsInline`, `IntersectionObserver`-paused off-screen, poster on each, and not autoplaying under
reduced motion), and widen `MediaRef` handling in the hero mosaic so a tile can be `kind: "video"`.

### Logo and favicon

File: `public/brand/`, `src/app/icon.png`, `src/app/apple-icon.png`

Generated from the client's `Famystudio.png`. The source is a single-colour wordmark on
transparency, so two pre-tinted variants are derived from it rather than a CSS filter: an ink one
for light surfaces and a canvas one for dark. The favicon and apple icon are the square mark alone,
canvas on ink.

**Note:** the supplied PNG is drawn in `#0F2A4A` — the *previous* ink, not the brand's `#0B2C4D`.
The variants are re-tinted to the brand colours, so the page is correct, but the master file the
client holds is off-palette and should be reissued.

## Drafted copy pending approval — Creative Services (`/creative-services`)

**Nothing in this section is the client's copy.** The brief supplies homepage-length
content only: six capability names with a one-line descriptor each. A page-length treatment
needs more, so the strings below were written to fill it, in the established voice — plain
declaratives, concrete nouns, sentence case, named deliverables and formats rather than
adjectives. Every one is a draft for review and every one is marked
`TODO(client): expanded copy — draft, pending approval` at its definition in
`src/infrastructure/content/static/creative-services.content.ts`.

**What is NOT drafted, and must not be edited here:**

- The six capability **names** and their **one-line descriptors**. The content file spreads
  each entry from `services.content.ts` rather than retyping it, so those two strings have
  exactly one definition. A test (`StaticServiceCatalogRepository.test.ts`) fails if they
  ever diverge from the catalog.
- The **five process steps**, reused verbatim from the homepage. Only the heading above them
  is new.
- The **four engagement tier names**, read from `marketing.content.ts`.
- **Three of the four FAQ entries** — the AI-generated content question, the raw footage
  question and the existing documents question — reused verbatim, question and answer. Only
  the fourth is new.
- The CTA labels **"Start a Conversation"** and the closing line **"Project today. Creative
  partner tomorrow."**, both the client's own.

| Where | Drafted string |
|---|---|
| Hero eyebrow | Creative Services |
| Hero heading | Six creative services, produced by one team. |
| Hero body | Design, video, AI-assisted production, motion and product visuals. Each service below sets out what the work involves, who it suits and what you actually receive at the end of it. |
| Index label (accessible name) | Jump to a service |
| Deliverables label | What's included |
| Capability CTA (all six) | Talk to us about this |
| Creative Design — paragraph | Design work that carries a brand across everything a business publishes — a social post, a sales deck, a printed brochure, a display banner. We work from existing brand guidelines where they exist, and settle a consistent set of layouts, type and colour where they do not. Everything is handed over as editable source files alongside exports sized for each placement. |
| Creative Design — deliverable 1 | Social creatives sized for Instagram, LinkedIn and Facebook |
| Creative Design — deliverable 2 | Marketing collateral — one-pagers, sales sheets and case study layouts |
| Creative Design — deliverable 3 | Presentation decks built on a reusable master template |
| Creative Design — deliverable 4 | Brochures and printed documents, supplied print-ready |
| Creative Design — deliverable 5 | Display and web banners across the standard ad sizes |
| Creative Design — deliverable 6 | Digital assets — email headers, profile art and event graphics |
| Creative Design — deliverable 7 | Editable source files and an export set for every placement |
| Video Production & Editing — paragraph | Editing and finishing for short-form and business video. Send raw footage — creator clips, phone recordings, event coverage — and we cut, grade, caption and package it for the platform it is going to. Where a piece needs shooting rather than editing, the production is scoped around the requirement rather than sold as a fixed package. |
| Video Production & Editing — deliverable 1 | UGC editing from creator or customer-supplied footage |
| Video Production & Editing — deliverable 2 | Reels and Shorts cut to 9:16 with burned-in captions |
| Video Production & Editing — deliverable 3 | Promotional videos for launches, offers and campaigns |
| Video Production & Editing — deliverable 4 | Business videos — company profiles, service overviews and event recaps |
| Video Production & Editing — deliverable 5 | Content repurposing — one long-form piece cut into a set of short clips |
| Video Production & Editing — deliverable 6 | Colour grading, music, sound levelling and intro/outro treatment |
| Video Production & Editing — deliverable 7 | Delivery in platform-ready aspect ratios, with separate caption files |
| AI Video & Virtual Presenters — paragraph | Video built around a generated presenter rather than a filmed one, for content that would otherwise need a studio, a crew and a booked day. You supply the script or the source document; we choose the presenter, voice and language, then assemble the piece with the same editing, motion and brand treatment as any other video. AI is the production method here, not the product. |
| AI Video & Virtual Presenters — deliverable 1 | AI-generated videos built from a script or an existing document |
| AI Video & Virtual Presenters — deliverable 2 | Virtual presenters, with a choice of voice, language and delivery style |
| AI Video & Virtual Presenters — deliverable 3 | AI UGC — creator-style clips produced without a shoot |
| AI Video & Virtual Presenters — deliverable 4 | Visual storytelling assembled from stills, stock and generated footage |
| AI Video & Virtual Presenters — deliverable 5 | Multi-language versions cut from a single approved script |
| AI Video & Virtual Presenters — deliverable 6 | Brand treatment, captions and motion applied over the generated base |
| Explainer & Training Videos — paragraph | Video for material people have to understand rather than simply watch — how a product works, how a process runs, what a new hire needs in their first week. We start from whatever already exists: a deck, a manual, a recorded session. The output is structured into modules with a consistent opening, on-screen labels and a closing summary. |
| Explainer & Training Videos — deliverable 1 | Business explainers, typically 60 to 180 seconds |
| Explainer & Training Videos — deliverable 2 | Training content built as a numbered module series |
| Explainer & Training Videos — deliverable 3 | Course videos with chapter markers and consistent section titles |
| Explainer & Training Videos — deliverable 4 | Onboarding videos for new staff, customers or partners |
| Explainer & Training Videos — deliverable 5 | Instructional content — screen recordings with annotated callouts |
| Explainer & Training Videos — deliverable 6 | Conversion of existing decks, manuals and recorded sessions |
| Explainer & Training Videos — deliverable 7 | Captions, transcripts and a summary sheet for each module |
| Motion Graphics & Advanced Creative — paragraph | The layer that sits on top of finished footage, or stands on its own where there is no footage at all. Animated titles, moving diagrams, logo builds and effects work. This is the service that turns a static explanation into something that arrives in the order the viewer needs to read it. |
| Motion Graphics & Advanced Creative — deliverable 1 | Motion graphics — animated charts, diagrams and process sequences |
| Motion Graphics & Advanced Creative — deliverable 2 | Animated typography and kinetic title sequences |
| Motion Graphics & Advanced Creative — deliverable 3 | Logo stings for video openings and endings |
| Motion Graphics & Advanced Creative — deliverable 4 | Visual effects — cleanup, object removal and screen replacement |
| Motion Graphics & Advanced Creative — deliverable 5 | Compositing of live footage with generated and graphic elements |
| Motion Graphics & Advanced Creative — deliverable 6 | Lower thirds, transitions and a reusable motion kit for later edits |
| Product & Brand Visuals — paragraph | Still imagery for products and brands, produced without booking a studio for every set of shots. We build the product scene, place it in a lifestyle context, and generate the variations a campaign needs — different backgrounds, formats and seasonal treatments — from one approved base. |
| Product & Brand Visuals — deliverable 1 | Product visuals on plain, coloured and textured backgrounds |
| Product & Brand Visuals — deliverable 2 | Lifestyle imagery placing a product in a real-world setting |
| Product & Brand Visuals — deliverable 3 | Promotional assets for launches, offers and seasonal campaigns |
| Product & Brand Visuals — deliverable 4 | Campaign visuals as a matched set across every placement size |
| Product & Brand Visuals — deliverable 5 | AI-assisted brand content generated from an approved base image |
| Product & Brand Visuals — deliverable 6 | Retouching, background replacement and format variants |
| How this works — eyebrow | How we work |
| How this works — heading | Five steps, the same on every service. |
| How this works — link | See how we work |
| Ways to engage — eyebrow | Ways to engage |
| Ways to engage — heading | Pick the engagement that fits the volume. |
| Ways to engage — body | The same six services, bought four different ways — from a single project to an ongoing production partnership. Full details, including what each one typically covers, are on the Ways to Work With Us page. |
| Ways to engage — Launch | One project at a time, or a small first batch of assets. |
| Ways to engage — Grow | A steady monthly flow of short-form and social content. |
| Ways to engage — Scale | Larger, multi-format production running across several services. |
| Ways to engage — Custom Creative Partnership | A production model structured around your own requirement. |
| Ways to engage — link | Compare every engagement |
| FAQ eyebrow | Questions |
| FAQ heading | Questions about these services. |
| FAQ question (new) | Can you work across more than one service at a time? |
| FAQ answer (new) | Yes. Most engagements combine two or three — a video edit that also needs motion graphics, or a product campaign that needs both stills and short-form video. We scope across the whole requirement rather than one service at a time. |
| Closing CTA heading | Not sure which service you need? |
| Closing CTA body | Describe what you are trying to produce. We will tell you which of these services it needs, and how we would scope it. |


## Drafted copy pending approval — How We Work (`/how-we-work`)

**Almost nothing in this section is the client's copy.** The brief supplies five process
step names with one line each, and the section heading above them. A page-length treatment
needs more, so the strings below were written to fill it, in the established voice — plain
declaratives, concrete nouns, sentence case, what actually happens rather than adjectives.
Every one is a draft for review and every one is marked
`TODO(client): expanded copy — draft, pending approval` at its definition in
`src/infrastructure/content/static/how-we-work.content.ts`.

**What is NOT drafted, and must not be edited here:**

- The five step **names** and their **one-line descriptions**. The content file spreads
  each entry from `processBlock.steps` in `marketing.content.ts` rather than retyping it,
  so those two strings have exactly one definition and cannot drift from the homepage or
  from the Creative Services pointer. A test
  (`StaticProcessRepository.test.ts`) fails if they ever diverge.
- The **hero heading**, "From idea to finished creative." — the client's own line for the
  process, read from `processBlock.heading` rather than restated. The same test asserts it.
- **Two of the four FAQ entries** — the sample question and the ongoing-support question —
  reused verbatim, question and answer, from the brief's FAQ block.
- The **worked example's subject**, "UGC Transformation", and its one-line description,
  both read from `portfolio.content.ts`.
- The CTA label **"Start a Conversation"** and the closing line **"Project today. Creative
  partner tomorrow."**, both the client's own.

### Operational commitments, not copy — confirm these first

The expanded copy commits the studio to specifics, because a page about how you work is
useless when it is vague. **Every one of these is invented and has to be confirmed or
changed before launch**; they are the highest-risk strings on the page, because a prospect
can hold the studio to them:

| Commitment | Where |
|---|---|
| First call is 30–45 minutes; written brief back within 2–3 working days | Understand |
| Create step takes 3–5 working days, with one round of changes included | Create |
| Production runs 3 days to 3 weeks depending on the piece | Produce |
| **Two revision rounds included** in a standard scope, 1–2 working days each | Refine, Scope and revisions |
| Fixing our own mistakes never counts against a revision round | Scope and revisions |
| Download link stays live **90 days**; project files archived **twelve months** | Deliver |
| One named contact for the whole project | FAQ |
| Social cuts inside a week; a training series in four to six | FAQ |

The worked example carries invented specifics of its own — 40 clips, three creators,
twelve Reels — and is labelled illustrative in visible copy on the page, not just in a
comment, because the piece has not been produced and the client in it does not exist.

### Every drafted string

<!-- generated: how-we-work drafted copy — do not edit by hand, run `pnpm docs:content-todo` -->

**68 drafted strings**, against 25 read from the client's own
content modules and therefore not up for review here. Regenerate with
`pnpm docs:content-todo` after any edit to `how-we-work.content.ts`.

| Where | Drafted string |
|---|---|
| hero › eyebrow | How We Work |
| hero › body | Five steps, the same on every project. This page sets out what happens at each one — who does what, what we send you, and what we need back before the next step can start. |
| overviewLabel | Jump to a step |
| steps › Understand › expandedCopy | A first call, usually 30 to 45 minutes, and a short written brief back to you afterwards. We ask what the content is for, where it will be published, who signs it off and what the deadline is fixed by. If you already have a brief, a deck or a campaign plan, we work from that rather than starting a new one. Two to three working days from the call to the written brief, and nothing goes into production until you confirm it reads correctly. |
| steps › Understand › whatWeNeed › 0 | One call with whoever will sign the work off |
| steps › Understand › whatWeNeed › 1 | Any brand guidelines, logos and fonts you already hold |
| steps › Understand › whatWeNeed › 2 | The deadline, and what it is fixed by |
| steps › Understand › whatYouGet › 0 | A written brief: what we are making, for which platform, and by when |
| steps › Understand › whatYouGet › 1 | A scope list naming every asset, its format and its length |
| steps › Understand › media › alt | Two people talking across a table, each with an open notebook and a pen. |
| steps › Create › expandedCopy | We turn the brief into something you can react to before production starts — a script, a design direction, a storyboard or a shot list, depending on what is being made. You see it as a document or a set of sample frames, not as a finished piece, because changing direction here costs an email and changing it after production costs a re-edit. Three to five working days. One round of changes at this stage is included and expected. |
| steps › Create › whatWeNeed › 0 | Feedback on the direction as one consolidated response |
| steps › Create › whatWeNeed › 1 | Product details, copy points or source material the script has to carry |
| steps › Create › whatWeNeed › 2 | A named approver for the script or design direction |
| steps › Create › whatYouGet › 0 | A script, storyboard or design direction document |
| steps › Create › whatYouGet › 1 | Sample frames or layouts for anything visual |
| steps › Create › whatYouGet › 2 | A production schedule with the delivery date on it |
| steps › Create › media › alt | A hand-drawn storyboard in a notebook: boxed frames of stick figures with handwritten captions beneath them. |
| steps › Produce › expandedCopy | The build. Filming or footage assembly, design, AI generation where it is the right tool, editing, grading, voice and sound. You are not in this step day to day — it runs to the schedule agreed at the end of Create, and it takes anywhere from three days for a set of social cuts to three weeks for a training series. If something in the brief turns out not to work in production, we tell you during this step rather than at the review. |
| steps › Produce › whatWeNeed › 0 | Raw footage, product samples or file access, where the work uses yours |
| steps › Produce › whatWeNeed › 1 | Sign-off on the script, so production is not rebuilt half way through |
| steps › Produce › whatWeNeed › 2 | A named contact we can reach for a same-day answer |
| steps › Produce › whatYouGet › 0 | A first cut or first draft, watermarked, for review |
| steps › Produce › whatYouGet › 1 | A note of anything in the brief we changed, and why |
| steps › Produce › media › alt | A film crew on a lit soundstage, with an overhead lighting rig, a camera crane and monitors at floor level. |
| steps › Refine › expandedCopy | You review the first cut and send comments. We work through them and send a revised version. Two rounds are included in a standard scope, and a round means one consolidated set of comments from you answered by one revised version from us — one to two working days each. Comments that add an asset, a language or a format are not revisions. They are new scope, and we say so and quote for them rather than absorbing them quietly. |
| steps › Refine › whatWeNeed › 0 | Comments consolidated into one list, with timecodes for video |
| steps › Refine › whatWeNeed › 1 | Every reviewer's input gathered before you send it, not one after another |
| steps › Refine › whatWeNeed › 2 | A decision from you where two reviewers disagree |
| steps › Refine › whatYouGet › 0 | A revised version per round, with a note of what changed |
| steps › Refine › whatYouGet › 1 | A straight answer on anything we think falls outside the agreed scope |
| steps › Refine › media › alt | A hand pointing a pen at a monitor filled with image thumbnails, on a studio desk beside a laptop. |
| steps › Deliver › expandedCopy | Final files, in every format the brief named, with no watermark. Video goes out as platform-ready exports at the agreed aspect ratios with separate caption files; design goes out as editable source files alongside flattened exports. You get a download link that stays live for 90 days, and we keep the project files for twelve months, so a later edit does not start from nothing. |
| steps › Deliver › whatWeNeed › 0 | Confirmation that the final version is approved |
| steps › Deliver › whatWeNeed › 1 | Where to deliver: a link, a shared drive, or your own asset library |
| steps › Deliver › whatYouGet › 0 | Final assets in every format and aspect ratio the brief listed |
| steps › Deliver › whatYouGet › 1 | Editable source files, and separate caption files for video |
| steps › Deliver › whatYouGet › 2 | A download link live for 90 days, and project files archived for twelve months |
| steps › Deliver › media › alt | A laptop showing a grid of finished frames, with downloaded audio and video files listed along the bottom of the screen. |
| whatWeNeedLabel | What we need from you |
| whatYouGetLabel | What you get |
| workedExample › eyebrow | In practice |
| workedExample › heading | One project, through all five steps. |
| workedExample › illustrativeNote | Illustrative. This walks a planned piece through the five steps to show what each one produces. The piece has not been made and the client described is not a real one. |
| workedExample › stages › Understand › text | A skincare brand has 40 clips filmed by three creators on their phones, and wants a month of Instagram Reels out of them. The call settles the platform, the posting cadence and who approves — one marketing lead, not a committee. The written brief names twelve Reels at 9:16, captioned, set in the brand's own fonts. |
| workedExample › stages › Create › text | We watch all 40 clips and come back with a cut plan: which clip carries which message, three opening variants to test, and a caption and end-card treatment. The brand changes two of the openings. That is the whole Create round. |
| workedExample › stages › Produce › text | Twelve cuts assembled from the approved plan — trimmed, colour-matched across three different phone cameras, captioned, with music and an end card. Two clips turn out to be unusable at 9:16, so we say so during production and substitute from the same shoot. |
| workedExample › stages › Refine › text | One consolidated comment list: caption timing on four clips, a music swap on two, and a request for a fifteen-second version of the best performer. The first two are revisions. The fifteen-second version is a new asset, so it is quoted rather than absorbed. |
| workedExample › stages › Deliver › text | Twelve Reels at 9:16 plus the extra fifteen-second cut, as MP4s with separate caption files, and a set of stills pulled from the same footage for static posts. |
| scope › eyebrow | Scope and revisions |
| scope › heading | What “within the agreed scope” actually means. |
| scope › body | The Refine step says feedback is incorporated within the agreed scope. That sentence does a lot of work, so here is what sits behind it. |
| scope › topics › How scope is set › title | How scope is set |
| scope › topics › How scope is set › body | Scope is written down at the end of Understand, as a list of assets: how many, in what format, at what aspect ratio, at what length, in which languages. Nothing is scoped by hours. If an asset is not on that list it is not in the scope, and both of us can check that in one place rather than remembering the call differently. |
| scope › topics › What a revision round covers › title | What a revision round covers |
| scope › topics › What a revision round covers › body | A round is one consolidated set of comments from you, answered by one revised version from us. A standard scope includes two. Changes to timing, wording, music, colour, ordering and captions are revisions. So is fixing anything we got wrong — that never counts against a round, however many passes it takes. |
| scope › topics › What counts as new scope › title | What counts as new scope |
| scope › topics › What counts as new scope › body | A new asset, a new format or aspect ratio, a new language, a different length, or a change of direction after the script was signed off. None of these are refused. They are quoted, and you decide before we start. The point of naming them is that you find out at the moment it happens rather than on the invoice. |
| scope › topics › When requirements change mid-project › title | When requirements change mid-project |
| scope › topics › When requirements change mid-project › body | Tell us as early as you can. If production has not started, a change usually costs nothing. If it has, we say what is already built, what has to be rebuilt and what that costs, and you choose. We do not carry on quietly against a brief you have moved past. |
| faq › eyebrow | Questions |
| faq › heading | Questions about the process. |
| faq › block › items › How long does a project usually take? › question | How long does a project usually take? |
| faq › block › items › How long does a project usually take? › answer | It depends on what is being made, and the range is wide: a set of social cuts from footage you already have can be finished inside a week, while a training series with a script and motion graphics takes four to six. You get a date at the end of the Create step, once the scope is a list rather than a description. |
| faq › block › items › Who do we deal with day to day? › question | Who do we deal with day to day? |
| faq › block › items › Who do we deal with day to day? › answer | One contact for the whole project, from the first call to delivery. Specialists join for their own part — editor, designer, motion — but you are not managing them and you are not re-explaining the brief to each one. |
| closingCta › heading | Ready to start at step one? |
| closingCta › body | Tell us what you are trying to produce and who it is for. The first call is the Understand step — it costs nothing, and you leave it with a written brief. |

<!-- /generated -->

## Drafted copy pending approval — Ways to Work With Us (`/ways-to-work-with-us`)

**Almost nothing in this section is the client's copy.** The brief supplies four tiers,
each with a name, a label, a one-line summary, an "Ideal for" and a "Typical work
includes" — and the section heading and intro above them. A page-length treatment needs
more, so the strings below were written to fill it, in the established voice. Every one is
a draft for review and every one is marked
`TODO(client): expanded copy — draft, pending approval` at its definition in
`src/infrastructure/content/static/ways-to-work.content.ts`.

**What is NOT drafted, and must not be edited here:**

- The four tier **names**, their **labels** (Essential Content, Growth Content, Advanced
  Creative, and the custom partnership's own line), their **summaries**, and both of the
  brief's per-tier **lists**. The content file spreads each tier from `waysToWorkBlock` in
  `marketing.content.ts` rather than retyping it, so every one of those strings has
  exactly one definition and cannot drift from the homepage. Tests in
  `StaticEngagementRepository.test.ts` fail if any of them diverges.
- The **hero heading and intro paragraph**, read from that same block.
- The **custom partnership's invitation** — the client's own, and the line the page is
  arranged to arrive at.
- The two **list row labels**, "Ideal for" and "Typical work includes", now exported from
  `marketing.content.ts` as `TIER_FIELD_LABELS` and read from there.
- **Two of the four FAQ entries** — the cost question and the ongoing-support question —
  reused verbatim, question and answer.
- The CTA labels and the closing line, all reused from the homepage.

### The two lists are split, not rewritten

The brief gives "Ideal for" and "Typical work includes" as single sentences — "A, B, C and
D." — and the page renders them as lists. That split is derived, not retyped:
`splitListSentence` breaks the approved sentence up and `joinListSentence` puts it back,
and a test round-trips every list through both and asserts the client's string returns
character for character. If the brief ever supplies a sentence the splitter cannot
reproduce, that test fails rather than the page quietly reflowing the client's words.

### Commitments — confirm these first

**There are none, and that is deliberate.** The brief supplies no turnaround, revision
count, minimum term, notice period or capacity guarantee, and this is the page a prospect
would quote back, so nothing of that kind was invented for it. Specifically:

| Commitment that is NOT made | Where it would have gone |
|---|---|
| How long scoping takes, or when a quotation arrives | Scoping — states a sequence, never a duration |
| Revision rounds included | Nowhere; the two rounds named on `/how-we-work` are not repeated or generalised here |
| Minimum term or notice period on an ongoing engagement | Grow, and the Custom Creative Partnership |
| Volume — assets per month, capacity reserved | Grow's "Engagement shape", and what the partnership covers |
| Response or availability commitments | Custom Creative Partnership |

Three tests hold this in place: one asserts no drafted string mentions price, pricing or
cost; one asserts the whole page carries no figure, range, day rate or "starting from";
one asserts the scoping block states no duration or minimum term. **If the studio does
want to commit to any of the above, it should be added deliberately and listed here — not
inherited from a draft.**

### No pricing, and no implied pricing

The comparison is a fit-finder, not a pricing table. Every cell says what a tier **is**;
no cell says what a tier lacks. There are no ticks, no crosses and no withheld rows,
because a feature-gated grid implies a cost ladder even with no figures on it — and the
brief is explicit that there is no public pricing. A test asserts no comparison cell
contains "not included", "unavailable", "excluded" or "upgrade to".

### Every drafted string

<!-- generated: ways-to-work drafted copy — do not edit by hand, run `pnpm docs:content-todo` -->

**55 drafted strings**, against 39 read from the client's own
content modules and therefore not up for review here. Regenerate with
`pnpm docs:content-todo` after any edit to `ways-to-work.content.ts`.

| Where | Drafted string |
|---|---|
| hero › eyebrow | Ways to Work With Us |
| comparison › eyebrow | Compare |
| comparison › heading | The three named tiers, side by side. |
| comparison › body | The fourth — a Custom Creative Partnership — is deliberately not on this table. It is not a larger version of these three, so putting it in a column would misrepresent it. It has its own section below. |
| comparison › caption | The three named engagement tiers compared across who they suit, what they typically produce, when they fit and how the engagement runs. |
| comparison › rowLabels › bestWhen | Best when |
| comparison › rowLabels › engagementShape | Engagement shape |
| tiers › Launch › expandedCopy | The entry point, and not a lesser version of what follows. A local business that needs one promotional video, a startup that needs a first set of social creatives, a company that wants to see what the work looks like before committing to anything ongoing — all of that is Launch. It is scoped as a single project, delivered, and finished. If it turns into something continuing, it becomes Grow, and nothing produced here has to be redone for that to happen. |
| tiers › Launch › bestWhen | You have one piece that has to exist, or you want to see the work before deciding anything about what comes after it. |
| tiers › Launch › engagementShape | A single project, or one small batch, scoped and delivered on its own terms. |
| tiers › Launch › media › alt | A single studio light on a stand in a small room, with a desk and monitor out of focus behind it. |
| tiers › Grow › expandedCopy | For businesses where the constraint has stopped being ideas and started being output. You know what you want to publish and roughly how often; what you do not have is the team or the hours to produce it at that rate. Grow is a continuing flow of short-form and social work — creator footage edited into finished pieces, long-form cut down into clips, social creatives produced against a plan rather than one request at a time. |
| tiers › Grow › bestWhen | Publishing has become the bottleneck. The ideas exist and the finished pieces do not. |
| tiers › Grow › engagementShape | A recurring flow of short-form and social work, planned as batches rather than requested piece by piece. |
| tiers › Grow › media › alt | A phone mounted on a tripod recording video in a shop, its timer running on screen. |
| tiers › Scale › expandedCopy | For requirements that are not simply larger but more involved: an explainer that needs a script, a voice and motion graphics before it is anything; a training series that has to hold together across a dozen modules; a product campaign that has to arrive as stills, video and animation at once. Scale is where several of the six services run against the same brief at the same time — which is the part that is genuinely hard to assemble from freelancers hired separately. |
| tiers › Scale › bestWhen | One idea has to appear in several formats at once, and holding them consistent matters as much as producing them. |
| tiers › Scale › engagementShape | Multi-format production running across several services against a single brief. |
| tiers › Scale › media › alt | Hands drawing an illustration on a tablet with a stylus, a laptop open behind them. |
| custom › expandedCopy | Everything above assumes you already know what you need made. This does not. A Custom Creative Partnership is for businesses whose requirement moves — a changing mix of services, volumes that are not the same twice, work that arrives without much warning. Rather than fitting that into a tier, we build the production model around it: which services are in scope, how work reaches us, and how it comes back. It is the closest thing we offer to having a creative team, without hiring one. |
| custom › coversLabel | What a partnership usually covers |
| custom › covers › 0 | Several of the six services running at once, rather than one at a time |
| custom › covers › 1 | A requirement that changes shape month to month, rather than a fixed list of deliverables |
| custom › covers › 2 | A production model agreed with you at the start, and revisited when the work moves |
| custom › media › alt | Two people at a studio table comparing printed frames and colour swatches. |
| howToChoose › eyebrow | How to choose |
| howToChoose › heading | Four questions that settle it. |
| howToChoose › body | Answer these about your own situation rather than reading the tiers again. Each one points at a single engagement. |
| howToChoose › questions › Do you need one asset, or a steady stream? › question | Do you need one asset, or a steady stream? |
| howToChoose › questions › Do you need one asset, or a steady stream? › answer | If it is one piece, or a small first batch to see how the work lands, start here. Nothing about starting here makes moving up harder later. |
| howToChoose › questions › Is this a launch, or an ongoing programme? › question | Is this a launch, or an ongoing programme? |
| howToChoose › questions › Is this a launch, or an ongoing programme? › answer | A campaign with an end date is a project. Content that has to keep appearing belongs here instead — the point of it is the cadence, not any individual piece. |
| howToChoose › questions › How many formats does one idea have to appear in? › question | How many formats does one idea have to appear in? |
| howToChoose › questions › How many formats does one idea have to appear in? › answer | One or two, and any of the tiers covers it. An idea that has to become a video, a set of stills, a motion sequence and a deck at once needs this one. |
| howToChoose › questions › Are you buying finished work, or creative capacity? › question | Are you buying finished work, or creative capacity? |
| howToChoose › questions › Are you buying finished work, or creative capacity? › answer | If you know what needs making, one of the three named tiers covers it. If what you actually want is a creative team available across whatever comes up, that is this. |
| scoping › eyebrow | Scoping |
| scoping › heading | What happens before a quotation. |
| scoping › body | Every engagement is scoped around the actual requirement, so there is no figure to publish and nothing to configure. This is what sits between the first conversation and a number. |
| scoping › steps › The first conversation › title | The first conversation |
| scoping › steps › The first conversation › body | You describe what you are trying to produce and who it is for. We ask what already exists, where the work will be published and who has to approve it. Nothing is quoted at this point, because nothing is scoped yet. |
| scoping › steps › What we need from you › title | What we need from you |
| scoping › steps › What we need from you › body | The requirement in whatever form it exists — a brief, a deck, a list of assets, or a description over a call. Brand guidelines, footage or source material you already hold. And the deadline, if there is one that is genuinely fixed. |
| scoping › steps › What you get back › title | What you get back |
| scoping › steps › What you get back › body | A written scope: every asset named, with its format, aspect ratio and length, and the engagement it sits inside. A quotation against that scope. And a note of anything we think is missing, unclear or likely to change. |
| scoping › steps › If the scope is wrong › title | If the scope is wrong |
| scoping › steps › If the scope is wrong › body | Say so, and we revise it and re-quote. It is a document at that stage, not an agreement. Agreeing the wrong scope quickly is a worse outcome than taking another pass to get it right. |
| faq › eyebrow | Questions |
| faq › heading | Questions about engagements. |
| faq › block › items › Can we move between these as we grow? › question | Can we move between these as we grow? |
| faq › block › items › Can we move between these as we grow? › answer | Yes, and it is the intended path. Launch exists partly so that a first project does not require deciding anything about what comes after it. Moving up does not restart anything: the brand work, the source files and the production setup all carry across. |
| faq › block › items › What if none of the three named tiers fits? › question | What if none of the three named tiers fits? |
| faq › block › items › What if none of the three named tiers fits? › answer | Then it is a Custom Creative Partnership, which is not a fallback — it is where most ongoing work ends up. Describe the requirement and we will structure something around it rather than fitting it to a tier that was not built for it. |
| closingCta › heading | Not sure which of these you are? |
| closingCta › body | Describe the requirement in whatever detail you have. We will tell you which engagement it fits, or say plainly that it needs one of its own. |

<!-- /generated -->

## Drafted copy pending approval — Selected Work (`/selected-work`)

**Read the first paragraph of this section before anything else on the page.**

The brief lists eight planned portfolio pieces. **None of them has been produced.** The
homepage already shows them with stock covers under real titles, which is defensible as a
summary; at page scale, with a filter and a detail view over it, the same grid reads as a
body of finished work. So the page is written as a deliberate "what we are building" page,
and the block immediately under the hero says so in visible copy before a reader has seen
a single cover.

**Nothing is invented.** No client name, no brand, no outcome, no metric, no view count,
no testimonial, no date, no duration, no budget, no team credit and no award appears
anywhere on the page. Two checks hold that: a unit test asserts that no drafted string
contains a digit at all, or any results, attribution or audience vocabulary; and the
browser verification asserts the same against the **rendered** page, with only the piece
references and the filter counts excluded as the numerals they are.

**What is NOT drafted, and must not be edited here:**

- The eight **titles**, their one-line **intents** and their two-digit **references**. The
  content file spreads each piece from `caseStudies` in `portfolio.content.ts` rather than
  retyping it, so those strings have exactly one definition and cannot drift from the
  homepage. `StaticPortfolioRepository.test.ts` fails if any of them diverges.
- The **hero heading and intro**, read from `workIntro` in `marketing.content.ts`.
- The **six capability names**, which are also the filter taxonomy. Every reference is
  looked up in `capabilities` and throws if the name has changed, so a chip can never name
  a service the client does not offer, and every cross-link fragment resolves to a section
  that exists on `/creative-services`.
- The CTA label and the closing line, reused from the homepage.

### Status wording

**"Planned — not yet produced".** One wording, defined once as `statusLabel`, rendered on
every tile and again in the detail view. It is a chip on the media rather than a hover
state or a footnote, and it carries its own opaque fill so its contrast is measured
against the fill rather than against the photograph — canvas on accent at rest (5.107:1),
canvas on ink on hover (12.549:1).

The longer form, in the detail view, is: *"This piece is planned. Nothing has been shot,
and the frame above is stock photography standing in for work that does not exist yet."*

"Coming soon" is not used anywhere, and a test asserts it never appears.

### Detail view: a panel, not eight routes

The detail is a modal panel bound to the URL fragment, not `/selected-work/[slug]`.

Eight routes would be eight indexable pages whose entire content is one approved intent
line and two drafted paragraphs about work that does not exist — the weakest thing a small
site can put in a search index, and eight shareable links that each promise a case study
and deliver a placeholder. The usual cost of a panel is that it cannot be linked to, and
that cost is not paid here: `/selected-work#ugc-transformation` scrolls to the tile and
opens its detail, which is exactly what the navigation's work menu has been linking at
since before this page existed.

**When the pieces are produced**, routes become the right answer — there will be a real
case study to publish — and these fragments can redirect into them.

### Commitments — confirm these first

**There are none.** A test asserts no drafted string mentions a turnaround, a minimum
term, a notice period, a revision round, a guarantee or same-day anything.

One sentence is worth reading as a plan rather than a promise, and is listed here so it is
a decision rather than an oversight:

| Sentence | Why it is not a commitment |
|---|---|
| "each is being produced to show that capability properly" | States intent, not a schedule. No date, no order of delivery, no completion claim. |
| "every cover here is a stock frame standing in until the real one exists" | The condition for replacing a cover, not a date by which it happens. |

### Every drafted string

<!-- generated: selected-work drafted copy — do not edit by hand, run `pnpm docs:content-todo` -->

**54 drafted strings**, against 57 read from the client's own
content modules and therefore not up for review here. Regenerate with
`pnpm docs:content-todo` after any edit to `selected-work.content.ts`.

| Where | Drafted string |
|---|---|
| hero › eyebrow | What we are building |
| framing › eyebrow | Where this stands |
| framing › heading | We decided not to put weak work online. |
| framing › paragraphs › 0 | The alternative was to fill this page with whatever footage already existed, made to other people's briefs, and leave a reader to work out which parts were ours. |
| framing › paragraphs › 1 | So the eight pieces below were chosen instead. Each one exists to demonstrate a specific capability, and each is being produced to show that capability properly rather than to fill a slot in a grid. |
| framing › paragraphs › 2 | None of them is finished. The titles and the intent are settled and are the studio's own; every cover here is a stock frame standing in until the real one exists. |
| filter › label | Filter by capability |
| filter › allLabel | All pieces |
| gridLabel | The eight pieces |
| statusLabel | Planned — not yet produced |
| statusExplanation | This piece is planned. Nothing has been shot, and the frame above is stock photography standing in for work that does not exist yet. |
| pieces › Famysys Studio Capability Film › media › alt | An empty photography studio: one softbox on a stand, a leaning mirror and a folding director's chair against a plain backdrop. |
| pieces › Famysys Studio Capability Film › demonstrates | That the studio can carry a piece from script to grade without borrowing a crew. Framing, lighting, sound, edit and finish, in one film, with the studio itself as the subject. |
| pieces › Famysys Studio Capability Film › whyThisPiece | It is first because everything after it is easier to judge once a reader has seen the studio shoot itself. A studio unwilling to put its own name on a film has no standing to ask for yours. |
| pieces › Famysys IT Services Portfolio Film › media › alt | A man in an office talking and gesturing, with a colleague's hands and an open laptop in front of him. |
| pieces › Famysys IT Services Portfolio Film › demonstrates | A corporate film that stays watchable. One interview setup, cut against screen capture and titles, with the argument carried by the edit rather than by music. |
| pieces › Famysys IT Services Portfolio Film › whyThisPiece | Business buyers do not judge a studio on a showreel. They judge it on whether a film about a service they already understand is still worth finishing. |
| pieces › Food / Restaurant Creative Campaign › media › alt | A pastry on a plate lit for a photograph, with a camera and a small reflector board set up beside it. |
| pieces › Food / Restaurant Creative Campaign › demonstrates | One shoot turned into a campaign. Motion cuts for social, still frames for design, and AI-assisted variants for the placements a single shoot cannot cover on its own. |
| pieces › Food / Restaurant Creative Campaign › whyThisPiece | Food is where a campaign is judged fastest — the appetite is there or it is not — and where the distance between a shoot and a campaign is easiest to see. |
| pieces › UGC Transformation › media › alt | A hand holding a phone that is recording video, a street scene on its screen. |
| pieces › UGC Transformation › demonstrates | The distance between phone footage and a finished cut. The same clips before and after: colour matched across cameras, paced, captioned and finished. |
| pieces › UGC Transformation › whyThisPiece | It is the request that arrives most often and the hardest to settle in words. Two versions of the same footage answer it without an argument. |
| pieces › Synthesia Business Explainer › media › alt | A seated presenter under a single light in front of a black backdrop, framed by a camera in the foreground. |
| pieces › Synthesia Business Explainer › demonstrates | A presenter-led explainer built without a shoot day. A virtual presenter carries the script while graphics carry the detail. |
| pieces › Synthesia Business Explainer › whyThisPiece | It puts a fair test on AI production. If the presenter holds attention through a full explainer, the tool has earned its place; if it does not, that is worth knowing before a project leans on it. |
| pieces › Training Video Series › media › alt | A camera on a small tripod, a microphone and a laptop on a low table, with a seated person holding a second microphone. |
| pieces › Training Video Series › demonstrates | A series rather than a video. One template, one voice and one visual system, applied across modules so the last one looks like the first. |
| pieces › Training Video Series › whyThisPiece | Training is where volume breaks a production. A studio that can make one good module has proved nothing; a studio that can hold a set of them together has. |
| pieces › Product Visual Campaign › media › alt | A green glass bottle photographed from above on a plain surface, throwing a long lit shadow. |
| pieces › Product Visual Campaign › demonstrates | One product photographed three ways — on seamless, in use, and cut into promotional layouts — so a single shoot supplies a catalogue, a campaign and a feed. |
| pieces › Product Visual Campaign › whyThisPiece | Most product briefs arrive asking for photographs and end up needing assets. This piece is the argument for scoping the second thing first. |
| pieces › Motion Graphics Showcase › media › alt | A video editing timeline on a screen, its clips in bands of green, pink and blue. |
| pieces › Motion Graphics Showcase › demonstrates | Motion as a finishing craft. Animated typography, transitions built for the cut they sit in, and compositing that is meant to go unnoticed. |
| pieces › Motion Graphics Showcase › whyThisPiece | It is last because it is the level the other seven are climbing toward. Motion is what separates competent from premium, and it is the hardest of the eight to fake. |
| detail › demonstratesLabel | What it demonstrates |
| detail › whyLabel | Why this piece |
| detail › capabilitiesLabel | Capabilities it exercises |
| detail › mediaSlotLabel | Where the finished piece will sit |
| detail › closeLabel | Close |
| progression › eyebrow | The order |
| progression › heading | Why these eight, and why in this order. |
| progression › body | The list is not a menu. It runs from proving the studio can shoot at all to proving it can finish at a level worth commissioning, and each group answers the question the group before it raises. |
| progression › stages › Prove the studio › title | Prove the studio |
| progression › stages › Prove the studio › body | The first two films put the studio's own name on the work. One shows what it can build for itself; the other shows the same craft applied to a business that has to be taken seriously. |
| progression › stages › Prove the range › title | Prove the range |
| progression › stages › Prove the range › body | The middle three take one production standard to a campaign, to footage somebody else shot, and to a presenter who does not exist. Different inputs, the same finish. |
| progression › stages › Prove it scales › title | Prove it scales |
| progression › stages › Prove it scales › body | The last three move from a single piece to a system: a series that holds its template, a shoot that supplies a whole campaign, and motion work that lifts everything before it. |
| capabilityCrossLink › eyebrow | Capabilities |
| capabilityCrossLink › heading | Every piece here is one of six capabilities, shown working. |
| capabilityCrossLink › body | The pieces are what the work looks like. The capability pages are what is actually on offer, and what each one includes. |
| closingCta › heading | Bring us the piece you actually need. |
| closingCta › body | The work above is what the studio is building for itself. What we build for you starts with a conversation about what it is for and who has to approve it. |

<!-- /generated -->

## Copy the brief does not supply

| Item | Where | What is needed |
|---|---|---|
| FAQ section heading | `src/presentation/sections/Faq.tsx` | The brief gives seven Q&As but no heading for the section. It now renders a deliberately conspicuous placeholder — eyebrow "Questions", heading `TODO(client)` — so the section has the same shape as every other one and the gap cannot ship unnoticed. **This string is visible on the page.** |
| The Differentiator eyebrow | `marketing.content.ts` (`differentiatorBlock`) | Every other section opens eyebrow-heading-body; this one has no eyebrow string in the brief, so it opens on the heading instead. `leadIn` is not a substitute — it is a sentence ending in a colon that introduces the four cards, and it is set as one above them. Supply an eyebrow or confirm the section opens without one. |
| Footer tagline | `marketing.content.ts` (`footerContent.tagline`) | Currently reuses the brief's own central-idea sentence. Not new copy, but not written for the footer either — confirm or replace. |
| Contact email | `marketing.content.ts` (`footerContent.contactEmail`) | `hello@famysys.com` is a placeholder. Confirm the real address. |
| Social links | `marketing.content.ts` (`footerContent.socialLinks`) | The brief supplies no handles, so the list is empty and no social row renders. Supply handles or confirm there are none. |
| Legal pages | `marketing.content.ts` (`footerContent.legalLinks`) | Privacy policy and Terms of use are linked but neither page nor its text exists. |
| Tier field labels duplicated | `WaysToWork.tsx` (homepage) | "Ideal for" and "Typical work includes" are now exported from `marketing.content.ts` as `TIER_FIELD_LABELS`, and `/ways-to-work-with-us` reads them from there. The homepage section still carries them as component literals: `presentation/` may not import `infrastructure/` under the boundary rules, so removing that duplication means threading them through as props from `app/page.tsx`. A homepage change, deliberately not made while building an inner page. |
| Demo form fields | `src/presentation/components/DemoForm.tsx` | The form still asks for full name, business email, company name and company size — carried over from the previous build, not specified in the brief. Confirm these are the right fields for "Start a Conversation". |
| Demo form reply commitment | `DemoForm.tsx` (success message) | "Someone from Famysys Studio will reply **within one business day**" is an operational promise, not placeholder copy. Confirm the studio can hold that turnaround, or loosen the wording. |

## Routes that do not exist yet

The header, mega menu and footer link the real 7-page site from the brief. The homepage,
Creative Services, How We Work, Ways to Work With Us and Selected Work are built; every
other route 404s until its page lands:

`/about` · `/contact` · `/privacy` · `/terms`

**`/contact` is the only 404 any call to action points at**, and it is the destination of
nearly every one: the primary CTA in all five heroes, the What We Do CTA, all four "Talk
to us" links in Ways to Work With Us, all six "Talk to us about this" links on Creative
Services, the FAQ's pricing answer, and every closing CTA.

The navigation's work menu — which has linked `/selected-work#<slug>` at four of the eight
pieces since the homepage was built — now resolves, and each of those fragments opens that
piece's detail.

## Deliberately absent

- **No pricing anywhere.** The brief is explicit: "No public pricing anywhere. Every engagement is
  scoped around the actual requirement." A test in
  `StaticMarketingContentRepository.test.ts` fails the build if a price-shaped string appears in the
  Ways to Work content, and the rendered page is checked for the same.

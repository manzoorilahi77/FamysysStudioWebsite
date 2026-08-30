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


## Copy the brief does not supply

| Item | Where | What is needed |
|---|---|---|
| FAQ section heading | `src/presentation/sections/Faq.tsx` | The brief gives seven Q&As but no heading for the section. It now renders a deliberately conspicuous placeholder — eyebrow "Questions", heading `TODO(client)` — so the section has the same shape as every other one and the gap cannot ship unnoticed. **This string is visible on the page.** |
| The Differentiator eyebrow | `marketing.content.ts` (`differentiatorBlock`) | Every other section opens eyebrow-heading-body; this one has no eyebrow string in the brief, so it opens on the heading instead. `leadIn` is not a substitute — it is a sentence ending in a colon that introduces the four cards, and it is set as one above them. Supply an eyebrow or confirm the section opens without one. |
| Footer tagline | `marketing.content.ts` (`footerContent.tagline`) | Currently reuses the brief's own central-idea sentence. Not new copy, but not written for the footer either — confirm or replace. |
| Contact email | `marketing.content.ts` (`footerContent.contactEmail`) | `hello@famysys.com` is a placeholder. Confirm the real address. |
| Social links | `marketing.content.ts` (`footerContent.socialLinks`) | The brief supplies no handles, so the list is empty and no social row renders. Supply handles or confirm there are none. |
| Legal pages | `marketing.content.ts` (`footerContent.legalLinks`) | Privacy policy and Terms of use are linked but neither page nor its text exists. |
| Demo form fields | `src/presentation/components/DemoForm.tsx` | The form still asks for full name, business email, company name and company size — carried over from the previous build, not specified in the brief. Confirm these are the right fields for "Start a Conversation". |
| Demo form reply commitment | `DemoForm.tsx` (success message) | "Someone from Famysys Studio will reply **within one business day**" is an operational promise, not placeholder copy. Confirm the studio can hold that turnaround, or loosen the wording. |

## Routes that do not exist yet

The header, mega menu and footer link the real 7-page site from the brief. The homepage and
Creative Services are built; every other route 404s until its page lands:

`/how-we-work` · `/ways-to-work-with-us` · `/selected-work` · `/about` · `/contact` ·
`/privacy` · `/terms`

`/contact` is the most urgent — it is the destination of the primary CTA in both heroes, the What
We Do CTA, all four "Talk to us" links in Ways to Work With Us, all six "Talk to us about this"
links on Creative Services, the FAQ's pricing answer, and both closing CTAs.

`/creative-services` (built) links out to `/how-we-work` and `/ways-to-work-with-us` from its two
pointer blocks, so those two are the next most load-bearing.

## Deliberately absent

- **No pricing anywhere.** The brief is explicit: "No public pricing anywhere. Every engagement is
  scoped around the actual requirement." A test in
  `StaticMarketingContentRepository.test.ts` fails the build if a price-shaped string appears in the
  Ways to Work content, and the rendered page is checked for the same.

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

The header, mega menu and footer link the real 7-page site from the brief. Only the homepage is
built; every other route 404s until its page lands:

`/creative-services` · `/how-we-work` · `/ways-to-work-with-us` · `/selected-work` · `/about` ·
`/contact` · `/privacy` · `/terms`

`/contact` is the most urgent — it is the destination of the primary CTA in the hero, the What We
Do CTA, all four "Talk to us" links in Ways to Work With Us, the FAQ's pricing answer, and the
final CTA.

## Deliberately absent

- **No pricing anywhere.** The brief is explicit: "No public pricing anywhere. Every engagement is
  scoped around the actual requirement." A test in
  `StaticMarketingContentRepository.test.ts` fails the build if a price-shaped string appears in the
  Ways to Work content, and the rendered page is checked for the same.

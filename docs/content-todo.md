# Content To Confirm Before Launch

> ## Shortened, pending approval: the homepage hero's sub-heading
>
> This is the only string in `marketing.content.ts` that is **not** the client's verbatim copy, and
> it is recorded here because that file's rule is that content changes come from the brief, not from
> the codebase. It was changed at the client's spoken request — the sentence was setting four lines
> under the headline and they asked for two.
>
> **The brief's sentence** (183 characters):
>
> > Design, video, AI-powered content, motion and product visuals — produced by a flexible creative
> > team that helps businesses create high-quality content efficiently and at better value.
>
> **On the page now** (111 characters):
>
> > Design, video, AI-powered content, motion and product visuals — from a flexible creative team, at
> > better value.
>
> **What was kept, and what went.** The five deliverables are verbatim. So are "a flexible creative
> team" and "at better value". Two things changed: "produced by" became "from", and the clause "that
> helps businesses create high-quality content efficiently and" was dropped, because it restates the
> list immediately before it — the five items ARE the high-quality content, and the headline above
> already carries the efficiency claim as "without the agency overhead".
>
> **Why 111 and not more.** The hero's copy column is capped at 44ch, and 111 characters is the
> longest string that holds two lines at every width from 390 to 2560. 112 breaks to three lines at
> 390. Measured in a browser across nine widths, not estimated — so a longer replacement needs
> re-measuring, and a shorter one is always safe.
>
> Either approve this wording or supply a replacement of about 110 characters.


> ## Drafted, pending approval: the homepage FAQ heading
>
> The brief supplies seven questions and answers for the homepage and **no heading for the section
> that holds them**, where every other section on the site opens with one.
>
> This was held open with the literal string **`TODO(client)`**, rendered as the `<h2>` at display
> size, on the theory that a conspicuous placeholder could not ship unnoticed. It reached review
> looking like a bug, which is the answer to that theory: a placeholder loud enough to be caught is
> also loud enough to be read as broken by anyone who sees the page before the client does.
>
> The heading now reads **"The questions that come up first."** — drafted, and marked as drafted,
> the same as the roughly two hundred other strings on this site that are pending approval.
>
> It deliberately does NOT take the shape the two inner pages use — _"Questions about these
> services."_ (`/creative-services`) and _"Questions about the process."_ (`/how-we-work`), both
> also drafted. Those name their own page and work there, but three variations on "Questions about
> X" across one site reads as a template rather than a voice, and the homepage is the one that has
> to sound like somebody wrote it. All three still share the "Questions" eyebrow, which is what
> keeps them a family.
>
> **The client still owns this line.** It is the default in `src/presentation/sections/shared/Faq.tsx`
> (`heading`); inner pages pass their own and never inherit it. Approve it, replace it, or drop it
> — but it is no longer a blocker, because what is on the page is now a sentence rather than a
> ticket number.

> ## Enquiries are stored, and nobody is told
>
> This was worse: both forms POSTed to `/api/demo-request`, backed by a stub repository
> that validated the request, resolved, and **did nothing with it** — and the endpoint
> itself sat in a private folder the static export never emitted, so the POST 404ed. A
> submission showed the sender a confirmation and vanished.
>
> Both halves are fixed. Submissions are written to the `inquiries` table and appear in the
> admin panel's inbox, newest first, with mark-as-read and archive.
>
> **What is still missing is the notification.** An enquiry exists only in the panel until
> somebody opens the panel, so the site now loses enquiries slowly rather than instantly —
> which is an improvement and not a solution. Somebody has to be in the habit of checking,
> or a send has to be wired in. The `inquiries` table already carries `forwarded_at` and
> `forward_error` for exactly that, so adding it is a hook rather than a rewrite.

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
need _replacing_, because they are not the studio's work and the Selected Work section presents
them as if they were.

Source URL for any id below: `https://unsplash.com/photos/<id>`.

### Hero accordion (§1)

File: `src/infrastructure/content/static/marketing.content.ts` (`HERO_BANDS`)

Five bands, one open at a time, each standing for one of the studio's disciplines. Every band
carries a LABEL as well as a picture, and the label is copy — it is the only word on the band and
it names a service, so it wants the client's own vocabulary rather than these placeholders. The
numeral beside it is the band's position and is not editable. **Real production stills drop in
one-for-one**: the accordion sizes every band itself (`object-fit: cover`), so a replacement needs
no particular ratio. Rewrite the `alt` alongside the file.

| Slot                    | Label        | Shows                                               |
| ----------------------- | ------------ | --------------------------------------------------- |
| `hero-band-camera.jpg`  | Camera & rig | Camera rig filming a performer under coloured light |
| `hero-band-colour.jpg`  | Colour       | Colourist's desk, a grade open across two displays  |
| `hero-band-content.jpg` | Content      | Clapperboard held up at the start of a take         |
| `hero-band-design.jpg`  | Design       | Designer's desk, creative-suite icons on a tablet   |
| `hero-band-motion.jpg`  | Motion       | Motion graphic of a wave form in long light trails  |

> **Provenance not recorded.** These five came from `docs/explorations/01-heroes/media-4/`, which the
> approved hero design referenced, and that folder carries no source manifest — so unlike every
> other stock image on this page there is no Unsplash id to cite. They are stand-ins either way and
> are meant to be replaced, but if the site ships before the studio's own stills exist, the licence
> for each of these five has to be established first.

The eight `mosaic-0*.jpg` files remain in `public/media/` and are no longer referenced by anything:
they belonged to the drifting three-column hero this accordion replaced. Delete them once nobody
wants them back.

### The Differentiator (§3)

File: `src/infrastructure/content/static/marketing.content.ts` (`differentiatorImage`)

The four elements now render as a card row with an image filling the upper part of each card, so
every element needs a frame. Each stock photograph was chosen against its specific element and
checked against it before wiring — a replacement has to carry the same subject or the card stops
matching its own title. Rewrite the `alt` alongside the file.

| Element                  | Frame shows                                                           | Unsplash id                        |
| ------------------------ | --------------------------------------------------------------------- | ---------------------------------- |
| Human Creativity         | Hand with a stylus over a tablet, on printed digital-painting artwork | `photo-1558655146-9f40138edfeb`    |
| Intelligent AI Workflows | Ultrawide monitor on a studio desk, design tool full of artboards     | `photo-1621111848501-8d3634f82336` |
| Professional Production  | Overhead of an editor at a three-screen workstation, darkened room    | `photo-1550439062-609e1531270e`    |
| Efficient Delivery       | Tidy daylit desk, laptop and monitor showing content dashboards       | `photo-1499951360447-b19be8fe80f5` |

Two of these carry incidental third-party marks at full size — a monitor bezel logo on
`element-02`, another studio's page design on the `element-04` screens. Both are small enough to be
unreadable at the rendered card size, but they are one more reason these are placeholders.

### Selected Work (§6)

File: `src/infrastructure/content/static/portfolio.content.ts`

All eight pieces come from the brief's numbered list, and **none of them have been produced yet**.
The titles and one-line descriptions are the client's own planned briefs; every cover is a stock
photograph chosen to suggest the subject.

| #   | Title                               | Cover shows                               | Unsplash id                        |
| --- | ----------------------------------- | ----------------------------------------- | ---------------------------------- |
| 01  | Famysys Studio Capability Film      | Cinema lens, close up                     | `photo-1512790182412-b19e6d62bc39` |
| 02  | Famysys IT Services Portfolio Film  | Small team working at laptops             | `photo-1521737711867-e3b97375f902` |
| 03  | Food / Restaurant Creative Campaign | Plated dish being served                  | `photo-1414235077428-338989a2e8c0` |
| 04  | UGC Transformation                  | Social apps on a phone screen             | `photo-1611926653458-09294b3142bf` |
| 05  | Synthesia Business Explainer        | Business portrait of a presenter          | `photo-1573497019940-1c28c88b4f3e` |
| 06  | Training Video Series               | Speaker addressing a training group       | `photo-1524178232363-1fb2b075b655` |
| 07  | Product Visual Campaign             | White smartwatch on a plain ground        | `photo-1523275335684-37898b6baf30` |
| 08  | Motion Graphics Showcase            | Multi-monitor rig with graphics on screen | `photo-1598550476439-6847785fcea6` |

This remains the single largest gap: the section presents eight pieces of work that do not exist,
now illustrated with photography that is not the studio's. Either the pieces get produced, or the
section ships with fewer entries, or it waits.

### Three interface words on the homepage (§4, §5)

File: `src/infrastructure/content/static/marketing.content.ts`

The three imagery-led sections need three words the brief does not supply, because the brief
describes copy and these are affordances: the button that opens a process step's sentence where
there is no pointer to hover with, and the two words on the engagement tiles.

| Where             | String            |
| ----------------- | ----------------- |
| `processBlock`    | What happens here |
| `waysToWorkBlock` | Open              |
| `waysToWorkBlock` | Close             |

**They are drafted, and they live in the approved module.** That combination matters for the
generated inventories below: `scripts/generate-content-todo.mjs` treats any string that appears
verbatim in `marketing.content.ts` as the client's own, so these three are counted as approved
there and will not appear in any generated table — including the `/selected-work` detail panel's
own "Close", which stopped being listed the moment this one existed. They belong in the same
review pass as everything else on this page. Each carries a `TODO(client)` comment at its
definition.

### Creative Services page (§/creative-services)

File: `src/infrastructure/content/static/creative-services.content.ts`

Seven slots. The six capability images are 4:3; the hero band is a wide 12:5 strip. Same
terms as everything above — Unsplash License, downloaded into `public/media/`, served
locally, no attribution required to ship and no hotlinking.

| Slot                             | Shows                                               | Unsplash id                        |
| -------------------------------- | --------------------------------------------------- | ---------------------------------- |
| `service-hero-band.jpg`          | Hands drawing on a technical plan, low light        | `photo-1503387762-592deb58ef4e`    |
| `service-creative-design.jpg`    | Colour swatch books and a tablet of layout diagrams | `photo-1561070791-2526d30994b5`    |
| `service-video-production.jpg`   | Interview set: chair, lit backdrop, boom microphone | `photo-1554941829-202a0b2403b8`    |
| `service-ai-video.jpg`           | Presenter standing to camera against an orange wall | `photo-1573496359142-b8d87734a5a2` |
| `service-explainer-training.jpg` | People taking notes around a table                  | `photo-1517048676732-d65bc937f952` |
| `service-motion-graphics.jpg`    | Corridor of brightly coloured panels                | `photo-1502691876148-a84978e59af8` |
| `service-product-visuals.jpg`    | Teal suede shoe styled on a pale pink set           | `photo-1560343090-f0409e92791a`    |

Alt text as written, to be rewritten alongside the images:

| Slot                                | Alt                                                                                  |
| ----------------------------------- | ------------------------------------------------------------------------------------ |
| Hero band                           | Hands drawing on a technical plan at a dark desk.                                    |
| Creative Design                     | Printed colour swatch books beside a tablet showing layout diagrams.                 |
| Video Production & Editing          | An interview set: a single chair on a lit backdrop, with a boom microphone overhead. |
| AI Video & Virtual Presenters       | A presenter in a grey jacket, standing to camera in front of an orange wall.         |
| Explainer & Training Videos         | People seated around a table taking notes during a training session.                 |
| Motion Graphics & Advanced Creative | A corridor of brightly coloured panels receding into the distance.                   |
| Product & Brand Visuals             | A teal suede shoe styled on a pale pink set, propped up on bread rolls.              |

### How We Work page (§/how-we-work)

File: `src/infrastructure/content/static/how-we-work.content.ts`

Five 4:3 slots, one per process step, at 1600x1200 — the same size the capability images
use, since they sit in the same asymmetric split. Same terms as everything above:
Unsplash License, downloaded into `public/media/`, served locally, no attribution required
to ship and no hotlinking.

| Slot                     | Step       | Shows                                                   | Unsplash id                        |
| ------------------------ | ---------- | ------------------------------------------------------- | ---------------------------------- |
| `process-understand.jpg` | Understand | Two people talking across a table with open notebooks   | `photo-1573496267526-08a69e46a409` |
| `process-create.jpg`     | Create     | A hand-drawn storyboard in a notebook                   | `photo-1681372751506-1586b0542195` |
| `process-produce.jpg`    | Produce    | A film crew on a lit soundstage                         | `photo-1612544409025-e1f6a56c1152` |
| `process-refine.jpg`     | Refine     | A hand pointing a pen at a monitor of thumbnails        | `photo-1709281724580-43a03a73b93e` |
| `process-deliver.jpg`    | Deliver    | A laptop of finished frames with downloaded media files | `photo-1549098473-5cc4347b3eb3`    |

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

| Slot              | Tier                        | Shows                                                   | Unsplash id                        |
| ----------------- | --------------------------- | ------------------------------------------------------- | ---------------------------------- |
| `tier-launch.jpg` | Launch                      | A single studio light on a stand in a small room        | `photo-1641499303047-5f1c5cd5b305` |
| `tier-grow.jpg`   | Grow                        | A phone on a tripod recording, timer running            | `photo-1744135995171-4e874fbab21e` |
| `tier-scale.jpg`  | Scale                       | Hands drawing on a tablet with a stylus                 | `photo-1611241893603-3c359704e0ee` |
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

| Slot                       | Piece                               | Ratio | Shows                                                                          | Unsplash id                        |
| -------------------------- | ----------------------------------- | ----- | ------------------------------------------------------------------------------ | ---------------------------------- |
| `work-capability-film.jpg` | Famysys Studio Capability Film      | 4:3   | An empty studio: one softbox, a mirror, a director's chair                     | `photo-1786325492063-8967ed6ad88d` |
| `work-it-services.jpg`     | Famysys IT Services Portfolio Film  | 3:4   | A man talking in an office, a colleague's hands and a laptop in front of him   | `photo-1758691737278-3af15b37af48` |
| `work-food-campaign.jpg`   | Food / Restaurant Creative Campaign | 1:1   | A pastry on a plate being photographed, camera and reflector in frame          | `photo-1758634553706-662cb7e38de4` |
| `work-ugc.jpg`             | UGC Transformation                  | 4:3   | A hand holding a phone that is recording                                       | `photo-1727334291061-fd29582ef9dc` |
| `work-synthesia.jpg`       | Synthesia Business Explainer        | 4:3   | A man on the floor talking to a camera on a tripod, his face on its screen     | `photo-1758874574136-6506197be737` |
| `work-training.jpg`        | Training Video Series               | 4:3   | A camera, a microphone and a laptop on a low table, one person seated          | `photo-1764664035154-379971f0e936` |
| `work-product-visual.jpg`  | Product Visual Campaign             | 1:1   | A green glass bottle shot from above on a plain surface, throwing a lit shadow | `photo-1758796540080-ace3379f958c` |
| `work-motion-graphics.jpg` | Motion Graphics Showcase            | 3:4   | A video editing timeline on screen, clips in green, pink and blue              | `photo-1574717024653-61fd2cf4d44d` |

**Scale, again.** One light, one camera, one or two people, one object on a table —
nothing here shows a crew, a soundstage or a floor of staff, for the same reason the tier
images do not. Any replacement has to keep the scale as well as the subject.

**`work-synthesia.jpg` was replaced.** The previous frame
(`photo-1632821624074-5454c9e0b2a7`) put its presenter small and far right in an empty
warehouse, so at tile size it read as a shed rather than as a person on camera. The
replacement is `photo-1758874574136-6506197be737`: one man on the floor mid-sentence to a
camera on a tripod, his face visible on its screen. It is checked at final crop, and its
ratio moved from 3:4 to 4:3 for that reason — the source is landscape, and a portrait tile
would have cropped the camera out and left a man talking to nothing.

**Still open on this piece:** the homepage Selected Work summary carries a DIFFERENT
photograph for the same piece — `case-05.jpg`, `photo-1573497019940-1c28c88b4f3e`, a
corporate headshot — because the homepage grid draws from `portfolio.content.ts` and the
`case-NN.jpg` set, not from this table. It is not broken the way the warehouse frame was,
but one piece showing two unrelated photographs across two pages is a gap in its own right.

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

### About page (§/about)

File: `src/infrastructure/content/static/about.content.ts`

**Six images across eight sections**, chosen under one rule: production, not people.

| Slot                       | Section                    | Ratio | Shows                                                                                                             | Unsplash id                        |
| -------------------------- | -------------------------- | ----- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `about-hero.jpg`           | Hero                       | 16:9  | An empty photographic studio: white cyclorama, two softboxes, an overhead lighting rig, a camera bag on the floor | `photo-1471341971476-ae15ff5dd4ea` |
| `about-claim-creative.jpg` | Claim 1 — direction        | 4:3   | An open sketchbook of thumbnail layouts in blue ink, a pencil across the page                                     | `photo-1523726491678-bf852e717f6a` |
| `about-claim-workflow.jpg` | Claim 2 — workflow         | 3:4   | A laptop showing a video edit: a clip timeline under a preview frame, colour wheels beside it                     | `photo-1574717025058-2f8737d2e2b7` |
| `about-approach.jpg`       | Claim 3 — AI               | 4:3   | A colour-grading interface: two colour wheels beside a hue curve over a spectrum                                  | `photo-1741517389370-740b5bdf0d96` |
| `about-ecosystem.jpg`      | Where the Studio sits      | 4:3   | A camera operator seen from below, adjusting a rig by hand under a small lamp                                     | `photo-1558618666-fcd25c85cd64`    |
| `about-direction.jpg`      | What we're building toward | 4:3   | A projector throwing a beam through haze in a red-lit room                                                        | `photo-1535016120720-40c646be5580` |

**The rule, and why this page needs one.** At most one person in any frame, no crews, no
faces presented as staff, no premises, and no legible brand marks at the rendered crop. On
an About page a stranger's face reads as _our team_ and a photographed office reads as
_our office_ — both false. Five of the six frames have no person in them at all; the sixth
(`about-ecosystem`) is a single pair of hands on a camera rig with the operator's face
soft and partly behind the equipment, which reads as the work rather than as a portrait.

**What was rejected at the crop check.** A three-person workshop table (a crew, and it
read as a team photo); a designer at an Apple desk setup with a legible logo on the
display; an open-plan office interior (premises); a clapperboard close-up with another
studio's production name printed on it; and a monitor wall carrying third-party
application chrome along the bottom edge.

The page previously carried one image, on the theory that a single frame was the safest
answer to the "no stock strangers" warning. That was right about faces and wrong about
quantity: two images across what became eight sections read as an unfinished page. The
rule above solves the same problem without the emptiness.

Same terms as everything above: Unsplash License, downloaded into `public/media/`, served
locally, no attribution required to ship, no hotlinking. Every `alt` describes the stock
frame rather than anything the studio made, so each has to be rewritten the day a real
image replaces it.

## Hero subhead runs three lines, not two-and-a-half

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
reduced motion), and widen `MediaRef` handling in the hero accordion so a band can be
`kind: "video"`.

### Logo and favicon

File: `public/brand/`, `src/app/icon.png`, `src/app/apple-icon.png`

Generated from the client's `White Famy - Logo.png`, which superseded the earlier
`Famystudio.png`. The source is a single-colour knockout lockup on transparency, so two pre-tinted
variants are derived from it rather than a CSS filter: an ink one for light surfaces and a canvas
one for dark. The favicon and apple icon are the square mark alone, canvas on ink.

The supplied file is pure white on a 9500x9500 canvas that is mostly empty — the artwork occupies
a 6370x1990 box. Everything in `public/brand/` and both app icons are cropped to that box and
re-tinted to the brand colours, so the off-palette `#0F2A4A` master noted here previously is no
longer in play.

**The mark changed shape, not just colour.** The previous artwork drew the square as an outline
with a filled step inside it; this one draws it as a solid plate with the step knocked out of it.
The two are not recolours of each other, so nothing derived from the old master can be mixed with
the new one.

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

| Where                                               | Drafted string                                                                                                                                                                                                                                                                                                                                                                          |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero eyebrow                                        | Creative Services                                                                                                                                                                                                                                                                                                                                                                       |
| Hero heading                                        | Six creative services, produced by one team.                                                                                                                                                                                                                                                                                                                                            |
| Hero body                                           | Design, video, AI-assisted production, motion and product visuals. Each service below sets out what the work involves, who it suits and what you actually receive at the end of it.                                                                                                                                                                                                     |
| Index label (accessible name)                       | Jump to a service                                                                                                                                                                                                                                                                                                                                                                       |
| Deliverables label                                  | What's included                                                                                                                                                                                                                                                                                                                                                                         |
| Capability CTA (all six)                            | Talk to us about this                                                                                                                                                                                                                                                                                                                                                                   |
| Creative Design — paragraph                         | Design work that carries a brand across everything a business publishes — a social post, a sales deck, a printed brochure, a display banner. We work from existing brand guidelines where they exist, and settle a consistent set of layouts, type and colour where they do not. Everything is handed over as editable source files alongside exports sized for each placement.         |
| Creative Design — deliverable 1                     | Social creatives sized for Instagram, LinkedIn and Facebook                                                                                                                                                                                                                                                                                                                             |
| Creative Design — deliverable 2                     | Marketing collateral — one-pagers, sales sheets and case study layouts                                                                                                                                                                                                                                                                                                                  |
| Creative Design — deliverable 3                     | Presentation decks built on a reusable master template                                                                                                                                                                                                                                                                                                                                  |
| Creative Design — deliverable 4                     | Brochures and printed documents, supplied print-ready                                                                                                                                                                                                                                                                                                                                   |
| Creative Design — deliverable 5                     | Display and web banners across the standard ad sizes                                                                                                                                                                                                                                                                                                                                    |
| Creative Design — deliverable 6                     | Digital assets — email headers, profile art and event graphics                                                                                                                                                                                                                                                                                                                          |
| Creative Design — deliverable 7                     | Editable source files and an export set for every placement                                                                                                                                                                                                                                                                                                                             |
| Video Production & Editing — paragraph              | Editing and finishing for short-form and business video. Send raw footage — creator clips, phone recordings, event coverage — and we cut, grade, caption and package it for the platform it is going to. Where a piece needs shooting rather than editing, the production is scoped around the requirement rather than sold as a fixed package.                                         |
| Video Production & Editing — deliverable 1          | UGC editing from creator or customer-supplied footage                                                                                                                                                                                                                                                                                                                                   |
| Video Production & Editing — deliverable 2          | Reels and Shorts cut to 9:16 with burned-in captions                                                                                                                                                                                                                                                                                                                                    |
| Video Production & Editing — deliverable 3          | Promotional videos for launches, offers and campaigns                                                                                                                                                                                                                                                                                                                                   |
| Video Production & Editing — deliverable 4          | Business videos — company profiles, service overviews and event recaps                                                                                                                                                                                                                                                                                                                  |
| Video Production & Editing — deliverable 5          | Content repurposing — one long-form piece cut into a set of short clips                                                                                                                                                                                                                                                                                                                 |
| Video Production & Editing — deliverable 6          | Colour grading, music, sound levelling and intro/outro treatment                                                                                                                                                                                                                                                                                                                        |
| Video Production & Editing — deliverable 7          | Delivery in platform-ready aspect ratios, with separate caption files                                                                                                                                                                                                                                                                                                                   |
| AI Video & Virtual Presenters — paragraph           | Video built around a generated presenter rather than a filmed one, for content that would otherwise need a studio, a crew and a booked day. You supply the script or the source document; we choose the presenter, voice and language, then assemble the piece with the same editing, motion and brand treatment as any other video. AI is the production method here, not the product. |
| AI Video & Virtual Presenters — deliverable 1       | AI-generated videos built from a script or an existing document                                                                                                                                                                                                                                                                                                                         |
| AI Video & Virtual Presenters — deliverable 2       | Virtual presenters, with a choice of voice, language and delivery style                                                                                                                                                                                                                                                                                                                 |
| AI Video & Virtual Presenters — deliverable 3       | AI UGC — creator-style clips produced without a shoot                                                                                                                                                                                                                                                                                                                                   |
| AI Video & Virtual Presenters — deliverable 4       | Visual storytelling assembled from stills, stock and generated footage                                                                                                                                                                                                                                                                                                                  |
| AI Video & Virtual Presenters — deliverable 5       | Multi-language versions cut from a single approved script                                                                                                                                                                                                                                                                                                                               |
| AI Video & Virtual Presenters — deliverable 6       | Brand treatment, captions and motion applied over the generated base                                                                                                                                                                                                                                                                                                                    |
| Explainer & Training Videos — paragraph             | Video for material people have to understand rather than simply watch — how a product works, how a process runs, what a new hire needs in their first week. We start from whatever already exists: a deck, a manual, a recorded session. The output is structured into modules with a consistent opening, on-screen labels and a closing summary.                                       |
| Explainer & Training Videos — deliverable 1         | Business explainers, typically 60 to 180 seconds                                                                                                                                                                                                                                                                                                                                        |
| Explainer & Training Videos — deliverable 2         | Training content built as a numbered module series                                                                                                                                                                                                                                                                                                                                      |
| Explainer & Training Videos — deliverable 3         | Course videos with chapter markers and consistent section titles                                                                                                                                                                                                                                                                                                                        |
| Explainer & Training Videos — deliverable 4         | Onboarding videos for new staff, customers or partners                                                                                                                                                                                                                                                                                                                                  |
| Explainer & Training Videos — deliverable 5         | Instructional content — screen recordings with annotated callouts                                                                                                                                                                                                                                                                                                                       |
| Explainer & Training Videos — deliverable 6         | Conversion of existing decks, manuals and recorded sessions                                                                                                                                                                                                                                                                                                                             |
| Explainer & Training Videos — deliverable 7         | Captions, transcripts and a summary sheet for each module                                                                                                                                                                                                                                                                                                                               |
| Motion Graphics & Advanced Creative — paragraph     | The layer that sits on top of finished footage, or stands on its own where there is no footage at all. Animated titles, moving diagrams, logo builds and effects work. This is the service that turns a static explanation into something that arrives in the order the viewer needs to read it.                                                                                        |
| Motion Graphics & Advanced Creative — deliverable 1 | Motion graphics — animated charts, diagrams and process sequences                                                                                                                                                                                                                                                                                                                       |
| Motion Graphics & Advanced Creative — deliverable 2 | Animated typography and kinetic title sequences                                                                                                                                                                                                                                                                                                                                         |
| Motion Graphics & Advanced Creative — deliverable 3 | Logo stings for video openings and endings                                                                                                                                                                                                                                                                                                                                              |
| Motion Graphics & Advanced Creative — deliverable 4 | Visual effects — cleanup, object removal and screen replacement                                                                                                                                                                                                                                                                                                                         |
| Motion Graphics & Advanced Creative — deliverable 5 | Compositing of live footage with generated and graphic elements                                                                                                                                                                                                                                                                                                                         |
| Motion Graphics & Advanced Creative — deliverable 6 | Lower thirds, transitions and a reusable motion kit for later edits                                                                                                                                                                                                                                                                                                                     |
| Product & Brand Visuals — paragraph                 | Still imagery for products and brands, produced without booking a studio for every set of shots. We build the product scene, place it in a lifestyle context, and generate the variations a campaign needs — different backgrounds, formats and seasonal treatments — from one approved base.                                                                                           |
| Product & Brand Visuals — deliverable 1             | Product visuals on plain, coloured and textured backgrounds                                                                                                                                                                                                                                                                                                                             |
| Product & Brand Visuals — deliverable 2             | Lifestyle imagery placing a product in a real-world setting                                                                                                                                                                                                                                                                                                                             |
| Product & Brand Visuals — deliverable 3             | Promotional assets for launches, offers and seasonal campaigns                                                                                                                                                                                                                                                                                                                          |
| Product & Brand Visuals — deliverable 4             | Campaign visuals as a matched set across every placement size                                                                                                                                                                                                                                                                                                                           |
| Product & Brand Visuals — deliverable 5             | AI-assisted brand content generated from an approved base image                                                                                                                                                                                                                                                                                                                         |
| Product & Brand Visuals — deliverable 6             | Retouching, background replacement and format variants                                                                                                                                                                                                                                                                                                                                  |
| How this works — eyebrow                            | How we work                                                                                                                                                                                                                                                                                                                                                                             |
| How this works — heading                            | Five steps, the same on every service.                                                                                                                                                                                                                                                                                                                                                  |
| How this works — link                               | See how we work                                                                                                                                                                                                                                                                                                                                                                         |
| Ways to engage — eyebrow                            | Ways to engage                                                                                                                                                                                                                                                                                                                                                                          |
| Ways to engage — heading                            | Pick the engagement that fits the volume.                                                                                                                                                                                                                                                                                                                                               |
| Ways to engage — body                               | The same six services, bought four different ways — from a single project to an ongoing production partnership. Full details, including what each one typically covers, are on the Ways to Work With Us page.                                                                                                                                                                           |
| Ways to engage — Launch                             | One project at a time, or a small first batch of assets.                                                                                                                                                                                                                                                                                                                                |
| Ways to engage — Grow                               | A steady monthly flow of short-form and social content.                                                                                                                                                                                                                                                                                                                                 |
| Ways to engage — Scale                              | Larger, multi-format production running across several services.                                                                                                                                                                                                                                                                                                                        |
| Ways to engage — Custom Creative Partnership        | A production model structured around your own requirement.                                                                                                                                                                                                                                                                                                                              |
| Ways to engage — link                               | Compare every engagement                                                                                                                                                                                                                                                                                                                                                                |
| FAQ eyebrow                                         | Questions                                                                                                                                                                                                                                                                                                                                                                               |
| FAQ heading                                         | Questions about these services.                                                                                                                                                                                                                                                                                                                                                         |
| FAQ question (new)                                  | Can you work across more than one service at a time?                                                                                                                                                                                                                                                                                                                                    |
| FAQ answer (new)                                    | Yes. Most engagements combine two or three — a video edit that also needs motion graphics, or a product campaign that needs both stills and short-form video. We scope across the whole requirement rather than one service at a time.                                                                                                                                                  |
| Closing CTA heading                                 | Not sure which service you need?                                                                                                                                                                                                                                                                                                                                                        |
| Closing CTA body                                    | Describe what you are trying to produce. We will tell you which of these services it needs, and how we would scope it.                                                                                                                                                                                                                                                                  |

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

| Commitment                                                                     | Where                       |
| ------------------------------------------------------------------------------ | --------------------------- |
| First call is 30–45 minutes; written brief back within 2–3 working days        | Understand                  |
| Create step takes 3–5 working days, with one round of changes included         | Create                      |
| Production runs 3 days to 3 weeks depending on the piece                       | Produce                     |
| **Two revision rounds included** in a standard scope, 1–2 working days each    | Refine, Scope and revisions |
| Fixing our own mistakes never counts against a revision round                  | Scope and revisions         |
| Download link stays live **90 days**; project files archived **twelve months** | Deliver                     |
| One named contact for the whole project                                        | FAQ                         |
| Social cuts inside a week; a training series in four to six                    | FAQ                         |

The worked example carries invented specifics of its own — 40 clips, three creators,
twelve Reels — and is labelled illustrative in visible copy on the page, not just in a
comment, because the piece has not been produced and the client in it does not exist.

### Every drafted string

<!-- generated: how-we-work drafted copy — do not edit by hand, run `pnpm docs:content-todo` -->

**68 drafted strings**, against 25 read from the client's own
content modules and therefore not up for review here. Regenerate with
`pnpm docs:content-todo` after any edit to `how-we-work.content.ts`.

| Where                                                                  | Drafted string                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| hero › eyebrow                                                         | How We Work                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| hero › body                                                            | Five steps, the same on every project. This page sets out what happens at each one — who does what, what we send you, and what we need back before the next step can start.                                                                                                                                                                                                                                                                              |
| overviewLabel                                                          | Jump to a step                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| steps › Understand › expandedCopy                                      | A first call, usually 30 to 45 minutes, and a short written brief back to you afterwards. We ask what the content is for, where it will be published, who signs it off and what the deadline is fixed by. If you already have a brief, a deck or a campaign plan, we work from that rather than starting a new one. Two to three working days from the call to the written brief, and nothing goes into production until you confirm it reads correctly. |
| steps › Understand › whatWeNeed › 0                                    | One call with whoever will sign the work off                                                                                                                                                                                                                                                                                                                                                                                                             |
| steps › Understand › whatWeNeed › 1                                    | Any brand guidelines, logos and fonts you already hold                                                                                                                                                                                                                                                                                                                                                                                                   |
| steps › Understand › whatWeNeed › 2                                    | The deadline, and what it is fixed by                                                                                                                                                                                                                                                                                                                                                                                                                    |
| steps › Understand › whatYouGet › 0                                    | A written brief: what we are making, for which platform, and by when                                                                                                                                                                                                                                                                                                                                                                                     |
| steps › Understand › whatYouGet › 1                                    | A scope list naming every asset, its format and its length                                                                                                                                                                                                                                                                                                                                                                                               |
| steps › Understand › media › alt                                       | Two people talking across a table, each with an open notebook and a pen.                                                                                                                                                                                                                                                                                                                                                                                 |
| steps › Create › expandedCopy                                          | We turn the brief into something you can react to before production starts — a script, a design direction, a storyboard or a shot list, depending on what is being made. You see it as a document or a set of sample frames, not as a finished piece, because changing direction here costs an email and changing it after production costs a re-edit. Three to five working days. One round of changes at this stage is included and expected.          |
| steps › Create › whatWeNeed › 0                                        | Feedback on the direction as one consolidated response                                                                                                                                                                                                                                                                                                                                                                                                   |
| steps › Create › whatWeNeed › 1                                        | Product details, copy points or source material the script has to carry                                                                                                                                                                                                                                                                                                                                                                                  |
| steps › Create › whatWeNeed › 2                                        | A named approver for the script or design direction                                                                                                                                                                                                                                                                                                                                                                                                      |
| steps › Create › whatYouGet › 0                                        | A script, storyboard or design direction document                                                                                                                                                                                                                                                                                                                                                                                                        |
| steps › Create › whatYouGet › 1                                        | Sample frames or layouts for anything visual                                                                                                                                                                                                                                                                                                                                                                                                             |
| steps › Create › whatYouGet › 2                                        | A production schedule with the delivery date on it                                                                                                                                                                                                                                                                                                                                                                                                       |
| steps › Create › media › alt                                           | A hand-drawn storyboard in a notebook: boxed frames of stick figures with handwritten captions beneath them.                                                                                                                                                                                                                                                                                                                                             |
| steps › Produce › expandedCopy                                         | The build. Filming or footage assembly, design, AI generation where it is the right tool, editing, grading, voice and sound. You are not in this step day to day — it runs to the schedule agreed at the end of Create, and it takes anywhere from three days for a set of social cuts to three weeks for a training series. If something in the brief turns out not to work in production, we tell you during this step rather than at the review.      |
| steps › Produce › whatWeNeed › 0                                       | Raw footage, product samples or file access, where the work uses yours                                                                                                                                                                                                                                                                                                                                                                                   |
| steps › Produce › whatWeNeed › 1                                       | Sign-off on the script, so production is not rebuilt half way through                                                                                                                                                                                                                                                                                                                                                                                    |
| steps › Produce › whatWeNeed › 2                                       | A named contact we can reach for a same-day answer                                                                                                                                                                                                                                                                                                                                                                                                       |
| steps › Produce › whatYouGet › 0                                       | A first cut or first draft, watermarked, for review                                                                                                                                                                                                                                                                                                                                                                                                      |
| steps › Produce › whatYouGet › 1                                       | A note of anything in the brief we changed, and why                                                                                                                                                                                                                                                                                                                                                                                                      |
| steps › Produce › media › alt                                          | A film crew on a lit soundstage, with an overhead lighting rig, a camera crane and monitors at floor level.                                                                                                                                                                                                                                                                                                                                              |
| steps › Refine › expandedCopy                                          | You review the first cut and send comments. We work through them and send a revised version. Two rounds are included in a standard scope, and a round means one consolidated set of comments from you answered by one revised version from us — one to two working days each. Comments that add an asset, a language or a format are not revisions. They are new scope, and we say so and quote for them rather than absorbing them quietly.             |
| steps › Refine › whatWeNeed › 0                                        | Comments consolidated into one list, with timecodes for video                                                                                                                                                                                                                                                                                                                                                                                            |
| steps › Refine › whatWeNeed › 1                                        | Every reviewer's input gathered before you send it, not one after another                                                                                                                                                                                                                                                                                                                                                                                |
| steps › Refine › whatWeNeed › 2                                        | A decision from you where two reviewers disagree                                                                                                                                                                                                                                                                                                                                                                                                         |
| steps › Refine › whatYouGet › 0                                        | A revised version per round, with a note of what changed                                                                                                                                                                                                                                                                                                                                                                                                 |
| steps › Refine › whatYouGet › 1                                        | A straight answer on anything we think falls outside the agreed scope                                                                                                                                                                                                                                                                                                                                                                                    |
| steps › Refine › media › alt                                           | A hand pointing a pen at a monitor filled with image thumbnails, on a studio desk beside a laptop.                                                                                                                                                                                                                                                                                                                                                       |
| steps › Deliver › expandedCopy                                         | Final files, in every format the brief named, with no watermark. Video goes out as platform-ready exports at the agreed aspect ratios with separate caption files; design goes out as editable source files alongside flattened exports. You get a download link that stays live for 90 days, and we keep the project files for twelve months, so a later edit does not start from nothing.                                                              |
| steps › Deliver › whatWeNeed › 0                                       | Confirmation that the final version is approved                                                                                                                                                                                                                                                                                                                                                                                                          |
| steps › Deliver › whatWeNeed › 1                                       | Where to deliver: a link, a shared drive, or your own asset library                                                                                                                                                                                                                                                                                                                                                                                      |
| steps › Deliver › whatYouGet › 0                                       | Final assets in every format and aspect ratio the brief listed                                                                                                                                                                                                                                                                                                                                                                                           |
| steps › Deliver › whatYouGet › 1                                       | Editable source files, and separate caption files for video                                                                                                                                                                                                                                                                                                                                                                                              |
| steps › Deliver › whatYouGet › 2                                       | A download link live for 90 days, and project files archived for twelve months                                                                                                                                                                                                                                                                                                                                                                           |
| steps › Deliver › media › alt                                          | A laptop showing a grid of finished frames, with downloaded audio and video files listed along the bottom of the screen.                                                                                                                                                                                                                                                                                                                                 |
| whatWeNeedLabel                                                        | What we need from you                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| whatYouGetLabel                                                        | What you get                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| workedExample › eyebrow                                                | In practice                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| workedExample › heading                                                | One project, through all five steps.                                                                                                                                                                                                                                                                                                                                                                                                                     |
| workedExample › illustrativeNote                                       | Illustrative. This walks a planned piece through the five steps to show what each one produces. The piece has not been made and the client described is not a real one.                                                                                                                                                                                                                                                                                  |
| workedExample › stages › Understand › text                             | A skincare brand has 40 clips filmed by three creators on their phones, and wants a month of Instagram Reels out of them. The call settles the platform, the posting cadence and who approves — one marketing lead, not a committee. The written brief names twelve Reels at 9:16, captioned, set in the brand's own fonts.                                                                                                                              |
| workedExample › stages › Create › text                                 | We watch all 40 clips and come back with a cut plan: which clip carries which message, three opening variants to test, and a caption and end-card treatment. The brand changes two of the openings. That is the whole Create round.                                                                                                                                                                                                                      |
| workedExample › stages › Produce › text                                | Twelve cuts assembled from the approved plan — trimmed, colour-matched across three different phone cameras, captioned, with music and an end card. Two clips turn out to be unusable at 9:16, so we say so during production and substitute from the same shoot.                                                                                                                                                                                        |
| workedExample › stages › Refine › text                                 | One consolidated comment list: caption timing on four clips, a music swap on two, and a request for a fifteen-second version of the best performer. The first two are revisions. The fifteen-second version is a new asset, so it is quoted rather than absorbed.                                                                                                                                                                                        |
| workedExample › stages › Deliver › text                                | Twelve Reels at 9:16 plus the extra fifteen-second cut, as MP4s with separate caption files, and a set of stills pulled from the same footage for static posts.                                                                                                                                                                                                                                                                                          |
| scope › eyebrow                                                        | Scope and revisions                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| scope › heading                                                        | What “within the agreed scope” actually means.                                                                                                                                                                                                                                                                                                                                                                                                           |
| scope › body                                                           | The Refine step says feedback is incorporated within the agreed scope. That sentence does a lot of work, so here is what sits behind it.                                                                                                                                                                                                                                                                                                                 |
| scope › topics › How scope is set › title                              | How scope is set                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| scope › topics › How scope is set › body                               | Scope is written down at the end of Understand, as a list of assets: how many, in what format, at what aspect ratio, at what length, in which languages. Nothing is scoped by hours. If an asset is not on that list it is not in the scope, and both of us can check that in one place rather than remembering the call differently.                                                                                                                    |
| scope › topics › What a revision round covers › title                  | What a revision round covers                                                                                                                                                                                                                                                                                                                                                                                                                             |
| scope › topics › What a revision round covers › body                   | A round is one consolidated set of comments from you, answered by one revised version from us. A standard scope includes two. Changes to timing, wording, music, colour, ordering and captions are revisions. So is fixing anything we got wrong — that never counts against a round, however many passes it takes.                                                                                                                                      |
| scope › topics › What counts as new scope › title                      | What counts as new scope                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| scope › topics › What counts as new scope › body                       | A new asset, a new format or aspect ratio, a new language, a different length, or a change of direction after the script was signed off. None of these are refused. They are quoted, and you decide before we start. The point of naming them is that you find out at the moment it happens rather than on the invoice.                                                                                                                                  |
| scope › topics › When requirements change mid-project › title          | When requirements change mid-project                                                                                                                                                                                                                                                                                                                                                                                                                     |
| scope › topics › When requirements change mid-project › body           | Tell us as early as you can. If production has not started, a change usually costs nothing. If it has, we say what is already built, what has to be rebuilt and what that costs, and you choose. We do not carry on quietly against a brief you have moved past.                                                                                                                                                                                         |
| faq › eyebrow                                                          | Questions                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| faq › heading                                                          | Questions about the process.                                                                                                                                                                                                                                                                                                                                                                                                                             |
| faq › block › items › How long does a project usually take? › question | How long does a project usually take?                                                                                                                                                                                                                                                                                                                                                                                                                    |
| faq › block › items › How long does a project usually take? › answer   | It depends on what is being made, and the range is wide: a set of social cuts from footage you already have can be finished inside a week, while a training series with a script and motion graphics takes four to six. You get a date at the end of the Create step, once the scope is a list rather than a description.                                                                                                                                |
| faq › block › items › Who do we deal with day to day? › question       | Who do we deal with day to day?                                                                                                                                                                                                                                                                                                                                                                                                                          |
| faq › block › items › Who do we deal with day to day? › answer         | One contact for the whole project, from the first call to delivery. Specialists join for their own part — editor, designer, motion — but you are not managing them and you are not re-explaining the brief to each one.                                                                                                                                                                                                                                  |
| closingCta › heading                                                   | Ready to start at step one?                                                                                                                                                                                                                                                                                                                                                                                                                              |
| closingCta › body                                                      | Tell us what you are trying to produce and who it is for. The first call is the Understand step — it costs nothing, and you leave it with a written brief.                                                                                                                                                                                                                                                                                               |

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

| Commitment that is NOT made                            | Where it would have gone                                                             |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| How long scoping takes, or when a quotation arrives    | Scoping — states a sequence, never a duration                                        |
| Revision rounds included                               | Nowhere; the two rounds named on `/how-we-work` are not repeated or generalised here |
| Minimum term or notice period on an ongoing engagement | Grow, and the Custom Creative Partnership                                            |
| Volume — assets per month, capacity reserved           | Grow's "Engagement shape", and what the partnership covers                           |
| Response or availability commitments                   | Custom Creative Partnership                                                          |

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

| Where                                                                                    | Drafted string                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| hero › eyebrow                                                                           | Ways to Work With Us                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| comparison › eyebrow                                                                     | Compare                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| comparison › heading                                                                     | The three named tiers, side by side.                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| comparison › body                                                                        | The fourth — a Custom Creative Partnership — is deliberately not on this table. It is not a larger version of these three, so putting it in a column would misrepresent it. It has its own section below.                                                                                                                                                                                                                                                                                               |
| comparison › caption                                                                     | The three named engagement tiers compared across who they suit, what they typically produce, when they fit and how the engagement runs.                                                                                                                                                                                                                                                                                                                                                                 |
| comparison › rowLabels › bestWhen                                                        | Best when                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| comparison › rowLabels › engagementShape                                                 | Engagement shape                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| tiers › Launch › expandedCopy                                                            | The entry point, and not a lesser version of what follows. A local business that needs one promotional video, a startup that needs a first set of social creatives, a company that wants to see what the work looks like before committing to anything ongoing — all of that is Launch. It is scoped as a single project, delivered, and finished. If it turns into something continuing, it becomes Grow, and nothing produced here has to be redone for that to happen.                               |
| tiers › Launch › bestWhen                                                                | You have one piece that has to exist, or you want to see the work before deciding anything about what comes after it.                                                                                                                                                                                                                                                                                                                                                                                   |
| tiers › Launch › engagementShape                                                         | A single project, or one small batch, scoped and delivered on its own terms.                                                                                                                                                                                                                                                                                                                                                                                                                            |
| tiers › Launch › media › alt                                                             | A single studio light on a stand in a small room, with a desk and monitor out of focus behind it.                                                                                                                                                                                                                                                                                                                                                                                                       |
| tiers › Grow › expandedCopy                                                              | For businesses where the constraint has stopped being ideas and started being output. You know what you want to publish and roughly how often; what you do not have is the team or the hours to produce it at that rate. Grow is a continuing flow of short-form and social work — creator footage edited into finished pieces, long-form cut down into clips, social creatives produced against a plan rather than one request at a time.                                                              |
| tiers › Grow › bestWhen                                                                  | Publishing has become the bottleneck. The ideas exist and the finished pieces do not.                                                                                                                                                                                                                                                                                                                                                                                                                   |
| tiers › Grow › engagementShape                                                           | A recurring flow of short-form and social work, planned as batches rather than requested piece by piece.                                                                                                                                                                                                                                                                                                                                                                                                |
| tiers › Grow › media › alt                                                               | A phone mounted on a tripod recording video in a shop, its timer running on screen.                                                                                                                                                                                                                                                                                                                                                                                                                     |
| tiers › Scale › expandedCopy                                                             | For requirements that are not simply larger but more involved: an explainer that needs a script, a voice and motion graphics before it is anything; a training series that has to hold together across a dozen modules; a product campaign that has to arrive as stills, video and animation at once. Scale is where several of the six services run against the same brief at the same time — which is the part that is genuinely hard to assemble from freelancers hired separately.                  |
| tiers › Scale › bestWhen                                                                 | One idea has to appear in several formats at once, and holding them consistent matters as much as producing them.                                                                                                                                                                                                                                                                                                                                                                                       |
| tiers › Scale › engagementShape                                                          | Multi-format production running across several services against a single brief.                                                                                                                                                                                                                                                                                                                                                                                                                         |
| tiers › Scale › media › alt                                                              | Hands drawing an illustration on a tablet with a stylus, a laptop open behind them.                                                                                                                                                                                                                                                                                                                                                                                                                     |
| custom › expandedCopy                                                                    | Everything above assumes you already know what you need made. This does not. A Custom Creative Partnership is for businesses whose requirement moves — a changing mix of services, volumes that are not the same twice, work that arrives without much warning. Rather than fitting that into a tier, we build the production model around it: which services are in scope, how work reaches us, and how it comes back. It is the closest thing we offer to having a creative team, without hiring one. |
| custom › coversLabel                                                                     | What a partnership usually covers                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| custom › covers › 0                                                                      | Several of the six services running at once, rather than one at a time                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| custom › covers › 1                                                                      | A requirement that changes shape month to month, rather than a fixed list of deliverables                                                                                                                                                                                                                                                                                                                                                                                                               |
| custom › covers › 2                                                                      | A production model agreed with you at the start, and revisited when the work moves                                                                                                                                                                                                                                                                                                                                                                                                                      |
| custom › media › alt                                                                     | Two people at a studio table comparing printed frames and colour swatches.                                                                                                                                                                                                                                                                                                                                                                                                                              |
| howToChoose › eyebrow                                                                    | How to choose                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| howToChoose › heading                                                                    | Four questions that settle it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| howToChoose › body                                                                       | Answer these about your own situation rather than reading the tiers again. Each one points at a single engagement.                                                                                                                                                                                                                                                                                                                                                                                      |
| howToChoose › questions › Do you need one asset, or a steady stream? › question          | Do you need one asset, or a steady stream?                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| howToChoose › questions › Do you need one asset, or a steady stream? › answer            | If it is one piece, or a small first batch to see how the work lands, start here. Nothing about starting here makes moving up harder later.                                                                                                                                                                                                                                                                                                                                                             |
| howToChoose › questions › Is this a launch, or an ongoing programme? › question          | Is this a launch, or an ongoing programme?                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| howToChoose › questions › Is this a launch, or an ongoing programme? › answer            | A campaign with an end date is a project. Content that has to keep appearing belongs here instead — the point of it is the cadence, not any individual piece.                                                                                                                                                                                                                                                                                                                                           |
| howToChoose › questions › How many formats does one idea have to appear in? › question   | How many formats does one idea have to appear in?                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| howToChoose › questions › How many formats does one idea have to appear in? › answer     | One or two, and any of the tiers covers it. An idea that has to become a video, a set of stills, a motion sequence and a deck at once needs this one.                                                                                                                                                                                                                                                                                                                                                   |
| howToChoose › questions › Are you buying finished work, or creative capacity? › question | Are you buying finished work, or creative capacity?                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| howToChoose › questions › Are you buying finished work, or creative capacity? › answer   | If you know what needs making, one of the three named tiers covers it. If what you actually want is a creative team available across whatever comes up, that is this.                                                                                                                                                                                                                                                                                                                                   |
| scoping › eyebrow                                                                        | Scoping                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| scoping › heading                                                                        | What happens before a quotation.                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| scoping › body                                                                           | Every engagement is scoped around the actual requirement, so there is no figure to publish and nothing to configure. This is what sits between the first conversation and a number.                                                                                                                                                                                                                                                                                                                     |
| scoping › steps › The first conversation › title                                         | The first conversation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| scoping › steps › The first conversation › body                                          | You describe what you are trying to produce and who it is for. We ask what already exists, where the work will be published and who has to approve it. Nothing is quoted at this point, because nothing is scoped yet.                                                                                                                                                                                                                                                                                  |
| scoping › steps › What we need from you › title                                          | What we need from you                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| scoping › steps › What we need from you › body                                           | The requirement in whatever form it exists — a brief, a deck, a list of assets, or a description over a call. Brand guidelines, footage or source material you already hold. And the deadline, if there is one that is genuinely fixed.                                                                                                                                                                                                                                                                 |
| scoping › steps › What you get back › title                                              | What you get back                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| scoping › steps › What you get back › body                                               | A written scope: every asset named, with its format, aspect ratio and length, and the engagement it sits inside. A quotation against that scope. And a note of anything we think is missing, unclear or likely to change.                                                                                                                                                                                                                                                                               |
| scoping › steps › If the scope is wrong › title                                          | If the scope is wrong                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| scoping › steps › If the scope is wrong › body                                           | Say so, and we revise it and re-quote. It is a document at that stage, not an agreement. Agreeing the wrong scope quickly is a worse outcome than taking another pass to get it right.                                                                                                                                                                                                                                                                                                                  |
| faq › eyebrow                                                                            | Questions                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| faq › heading                                                                            | Questions about engagements.                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| faq › block › items › Can we move between these as we grow? › question                   | Can we move between these as we grow?                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| faq › block › items › Can we move between these as we grow? › answer                     | Yes, and it is the intended path. Launch exists partly so that a first project does not require deciding anything about what comes after it. Moving up does not restart anything: the brand work, the source files and the production setup all carry across.                                                                                                                                                                                                                                           |
| faq › block › items › What if none of the three named tiers fits? › question             | What if none of the three named tiers fits?                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| faq › block › items › What if none of the three named tiers fits? › answer               | Then it is a Custom Creative Partnership, which is not a fallback — it is where most ongoing work ends up. Describe the requirement and we will structure something around it rather than fitting it to a tier that was not built for it.                                                                                                                                                                                                                                                               |
| closingCta › heading                                                                     | Not sure which of these you are?                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| closingCta › body                                                                        | Describe the requirement in whatever detail you have. We will tell you which engagement it fits, or say plainly that it needs one of its own.                                                                                                                                                                                                                                                                                                                                                           |

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

The longer form, in the detail view, is: _"This piece is planned. Nothing has been shot,
and the frame above is stock photography standing in for work that does not exist yet."_

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

| Sentence                                                                  | Why it is not a commitment                                                         |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| "each is being produced to show that capability properly"                 | States intent, not a schedule. No date, no order of delivery, no completion claim. |
| "every cover here is a stock frame standing in until the real one exists" | The condition for replacing a cover, not a date by which it happens.               |

### Copy cut in the polish pass — kept here, not deleted

The manager's direction for the whole site is **fewer words, more visual weight**. This page
carried the most words of any, because there is no finished work on it to carry anything else, so
it took the first pass. **140 words came off the rendered page**, 222 down to 82 — a 63% cut.
Nothing below was rejected on its merits; it was cut for length, and some of it may belong on
another page, so it is recorded verbatim rather than dropped.

All of it was drafted copy. No approved string was touched: the eight titles, their intent lines,
their references, the hero heading and intro, the six capability names and the CTA label all still
read from the client's own content modules.

#### "Where this stands" — two of three paragraphs

The block is one paragraph now. The single idea it has to carry is that the studio chose not to
fill the page with weak work; the rest was elaborating it. Two facts had to survive the cut and
did — that nothing here is finished, and that every cover is a stand-in — because the framing
paragraph is the only place the page states either in its own running copy, rather than in a tile
chip or behind the detail dialog. A test now asserts both, and asserts the block stays at two
sentences.

| Cut                                                                                                                                                                                                      | Words |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| "The alternative was to fill this page with whatever footage already existed, made to other people's briefs, and leave a reader to work out which parts were ours."                                      | 28    |
| "So the eight pieces below were chosen instead. Each one exists to demonstrate a specific capability, and each is being produced to show that capability properly rather than to fill a slot in a grid." | 35    |
| "None of them is finished. The titles and the intent are settled and are the studio's own; every cover here is a stock frame standing in until the real one exists."                                     | 31    |

Replaced by, at 33 words: _"We could have filled this page with footage made to other people's
briefs. We chose eight of our own instead — none of them is finished, and every cover below is a
stock frame."_

Net for the block: **94 words down to 33, so 61 removed.**

Worth noting for the client: _"each is being produced to show that capability properly"_ was the
sentence listed above under **Commitments** as intent-not-schedule. It is gone from the page, so
that row is now moot; the remaining commitment row — the stock-frame condition — is still on the
page in the new sentence.

#### "The order" — the long form of each stage description

Each stage is a card now, carrying a numeral, a drawn mark, its title and the piece names as
chips. With four other things saying what the stage is, the description came down to one sentence.

| Stage            | Cut from                                                                                                                                                                                  | Words | Now                                                                                                                       | Words |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------- | ----- |
| Prove the studio | "The first two films put the studio's own name on the work. One shows what it can build for itself; the other shows the same craft applied to a business that has to be taken seriously." | 36    | "The first two films put the studio's own name on the work."                                                              | 12    |
| Prove the range  | "The middle three take one production standard to a campaign, to footage somebody else shot, and to a presenter who does not exist. Different inputs, the same finish."                   | 28    | "The middle three take one standard to a campaign, to footage somebody else shot, and to a presenter who does not exist." | 22    |
| Prove it scales  | "The last three move from a single piece to a system: a series that holds its template, a shoot that supplies a whole campaign, and motion work that lifts everything before it."         | 32    | "The last three move from a single piece to a system."                                                                    | 11    |

Net for the section: **96 words down to 45, so 51 removed.** The section's own heading and
introduction were left alone — _"The list is not a menu"_ is the section's thesis and the only
place the page says the eight are an argument rather than a catalogue.

#### "Capabilities" — the heading shortened and the introduction dropped entirely

It is a navigation block: an eyebrow, a heading and six named rows that link to the six capability
pages. Two sentences telling a reader that links lead somewhere were doing work the rows already
do. The interaction replaces the copy and costs nothing — the row background sweeps in from the
left, the name shifts right, the arrow slides and goes accent.

| Cut                                                                                                                                                                 | Words  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Heading: "Every piece here is one of six capabilities, shown working." — now "Six capabilities, shown working."                                                     | 10 → 4 |
| Body, removed with nothing in its place: "The pieces are what the work looks like. The capability pages are what is actually on offer, and what each one includes." | 22     |

Net for the section: **32 words down to 4, so 28 removed.** The `body` field is gone from the
`CapabilityCrossLink` type rather than left empty, so a future edit cannot quietly put it back.

#### Where each cut could go instead

If the manager wants any of it kept somewhere, these are the honest homes:

- _"leave a reader to work out which parts were ours"_ — the About page's account of the studio's
  position, which is the page that argues rather than shows.
- _"each is being produced to show that capability properly rather than to fill a slot in a grid"_
  — the How We Work page, where it is a statement about method rather than a promise about this
  page's contents.
- _"The capability pages are what is actually on offer, and what each one includes"_ — the
  /creative-services hero, where it describes the page a reader has arrived on rather than one
  they are being sent to.

### Every drafted string

<!-- generated: selected-work drafted copy — do not edit by hand, run `pnpm docs:content-todo` -->

**50 drafted strings**, against 58 read from the client's own
content modules and therefore not up for review here. Regenerate with
`pnpm docs:content-todo` after any edit to `selected-work.content.ts`.

| Where                                                       | Drafted string                                                                                                                                                                                      |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| hero › eyebrow                                              | What we are building                                                                                                                                                                                |
| framing › eyebrow                                           | Where this stands                                                                                                                                                                                   |
| framing › heading                                           | We decided not to put weak work online.                                                                                                                                                             |
| framing › body                                              | We could have filled this page with footage made to other people's briefs. We chose eight of our own instead — none of them is finished, and every cover below is a stock frame.                    |
| filter › label                                              | Filter by capability                                                                                                                                                                                |
| filter › allLabel                                           | All pieces                                                                                                                                                                                          |
| gridLabel                                                   | The eight pieces                                                                                                                                                                                    |
| statusLabel                                                 | Planned — not yet produced                                                                                                                                                                          |
| statusExplanation                                           | This piece is planned. Nothing has been shot, and the frame above is stock photography standing in for work that does not exist yet.                                                                |
| pieces › Famysys Studio Capability Film › media › alt       | An empty photography studio: one softbox on a stand, a leaning mirror and a folding director's chair against a plain backdrop.                                                                      |
| pieces › Famysys Studio Capability Film › demonstrates      | That the studio can carry a piece from script to grade without borrowing a crew. Framing, lighting, sound, edit and finish, in one film, with the studio itself as the subject.                     |
| pieces › Famysys Studio Capability Film › whyThisPiece      | It is first because everything after it is easier to judge once a reader has seen the studio shoot itself. A studio unwilling to put its own name on a film has no standing to ask for yours.       |
| pieces › Famysys IT Services Portfolio Film › media › alt   | A man in an office talking and gesturing, with a colleague's hands and an open laptop in front of him.                                                                                              |
| pieces › Famysys IT Services Portfolio Film › demonstrates  | A corporate film that stays watchable. One interview setup, cut against screen capture and titles, with the argument carried by the edit rather than by music.                                      |
| pieces › Famysys IT Services Portfolio Film › whyThisPiece  | Business buyers do not judge a studio on a showreel. They judge it on whether a film about a service they already understand is still worth finishing.                                              |
| pieces › Food / Restaurant Creative Campaign › media › alt  | A pastry on a plate lit for a photograph, with a camera and a small reflector board set up beside it.                                                                                               |
| pieces › Food / Restaurant Creative Campaign › demonstrates | One shoot turned into a campaign. Motion cuts for social, still frames for design, and AI-assisted variants for the placements a single shoot cannot cover on its own.                              |
| pieces › Food / Restaurant Creative Campaign › whyThisPiece | Food is where a campaign is judged fastest — the appetite is there or it is not — and where the distance between a shoot and a campaign is easiest to see.                                          |
| pieces › UGC Transformation › media › alt                   | A hand holding a phone that is recording video, a street scene on its screen.                                                                                                                       |
| pieces › UGC Transformation › demonstrates                  | The distance between phone footage and a finished cut. The same clips before and after: colour matched across cameras, paced, captioned and finished.                                               |
| pieces › UGC Transformation › whyThisPiece                  | It is the request that arrives most often and the hardest to settle in words. Two versions of the same footage answer it without an argument.                                                       |
| pieces › Synthesia Business Explainer › media › alt         | A man sitting on the floor talking to a camera on a tripod, his face on its screen as he speaks.                                                                                                    |
| pieces › Synthesia Business Explainer › demonstrates        | A presenter-led explainer built without a shoot day. A virtual presenter carries the script while graphics carry the detail.                                                                        |
| pieces › Synthesia Business Explainer › whyThisPiece        | It puts a fair test on AI production. If the presenter holds attention through a full explainer, the tool has earned its place; if it does not, that is worth knowing before a project leans on it. |
| pieces › Training Video Series › media › alt                | A camera on a small tripod, a microphone and a laptop on a low table, with a seated person holding a second microphone.                                                                             |
| pieces › Training Video Series › demonstrates               | A series rather than a video. One template, one voice and one visual system, applied across modules so the last one looks like the first.                                                           |
| pieces › Training Video Series › whyThisPiece               | Training is where volume breaks a production. A studio that can make one good module has proved nothing; a studio that can hold a set of them together has.                                         |
| pieces › Product Visual Campaign › media › alt              | A green glass bottle photographed from above on a plain surface, throwing a long lit shadow.                                                                                                        |
| pieces › Product Visual Campaign › demonstrates             | One product photographed three ways — on seamless, in use, and cut into promotional layouts — so a single shoot supplies a catalogue, a campaign and a feed.                                        |
| pieces › Product Visual Campaign › whyThisPiece             | Most product briefs arrive asking for photographs and end up needing assets. This piece is the argument for scoping the second thing first.                                                         |
| pieces › Motion Graphics Showcase › media › alt             | A video editing timeline on a screen, its clips in bands of green, pink and blue.                                                                                                                   |
| pieces › Motion Graphics Showcase › demonstrates            | Motion as a finishing craft. Animated typography, transitions built for the cut they sit in, and compositing that is meant to go unnoticed.                                                         |
| pieces › Motion Graphics Showcase › whyThisPiece            | It is last because it is the level the other seven are climbing toward. Motion is what separates competent from premium, and it is the hardest of the eight to fake.                                |
| detail › demonstratesLabel                                  | What it demonstrates                                                                                                                                                                                |
| detail › whyLabel                                           | Why this piece                                                                                                                                                                                      |
| detail › capabilitiesLabel                                  | Capabilities it exercises                                                                                                                                                                           |
| detail › mediaSlotLabel                                     | Where the finished piece will sit                                                                                                                                                                   |
| progression › eyebrow                                       | The order                                                                                                                                                                                           |
| progression › heading                                       | Why these eight, and why in this order.                                                                                                                                                             |
| progression › body                                          | The list is not a menu. It runs from proving the studio can shoot at all to proving it can finish at a level worth commissioning, and each group answers the question the group before it raises.   |
| progression › stages › Prove the studio › title             | Prove the studio                                                                                                                                                                                    |
| progression › stages › Prove the studio › body              | The first two films put the studio's own name on the work.                                                                                                                                          |
| progression › stages › Prove the range › title              | Prove the range                                                                                                                                                                                     |
| progression › stages › Prove the range › body               | The middle three take one standard to a campaign, to footage somebody else shot, and to a presenter who does not exist.                                                                             |
| progression › stages › Prove it scales › title              | Prove it scales                                                                                                                                                                                     |
| progression › stages › Prove it scales › body               | The last three move from a single piece to a system.                                                                                                                                                |
| capabilityCrossLink › eyebrow                               | Capabilities                                                                                                                                                                                        |
| capabilityCrossLink › heading                               | Six capabilities, shown working.                                                                                                                                                                    |
| closingCta › heading                                        | Bring us the piece you actually need.                                                                                                                                                               |
| closingCta › body                                           | The work above is what the studio is building for itself. What we build for you starts with a conversation about what it is for and who has to approve it.                                          |

<!-- /generated -->

## Drafted copy pending approval — About (`/about`)

**Short by design, not thin by accident.** The brief says to keep About relatively short
because the studio is new. That still holds — but "short" had become "empty": five sparse
sections, two images, and copy that read as a placeholder for a page rather than a page.
It now has eight sections, and every added one says something a new studio can stand
behind rather than something an established one would claim.

The three new blocks are the substance:

- **The three inputs** — human creativity, AI and structured production, each stated as
  what it contributes AND where it stops. The second half is the point. A page that only
  lists what each input gives is a page claiming AI does everything.
- **How we're building** — capabilities, then process, then scale, with the studio's own
  word for where each stands ("Now", "Next", "After that") and a closing sentence naming
  what is _not_ ready yet: volume, and a large programme of work on a fixed calendar.
- **What we do, and why**, expanded from one block to three claims, each paired with the
  observable consequence a client could hold the studio to.

**What is NOT drafted, and must not be edited here.** Six strings are the client's own,
and they live in `aboutBlock` in `marketing.content.ts` — the one module that holds the
client's words — with the page reading them from there rather than retyping them:

| String                                                                                                                                       | Status                                                |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| "Building the next generation of creative production."                                                                                       | **Verbatim** from the brief                           |
| "Modern creative production should be more flexible, efficient and accessible without compromising professional quality."                    | **Verbatim** from the brief. The page's thesis        |
| "Famysys Studio combines creative talent, emerging AI technologies and structured production workflows."                                     | The brief's own phrase, **completed into a sentence** |
| "Famysys Studio is part of the Famysys ecosystem."                                                                                           | The brief's own phrase, **completed into a sentence** |
| "Our ambition is to build a scalable professional creative production company serving businesses in India and global markets."               | The brief's own phrase, **completed into a sentence** |
| "We are starting deliberately — building our capabilities, refining our processes and investing heavily in our team and production systems." | The brief's own phrase, **completed into a sentence** |

**The four "completed" rows want checking against the brief's full sentences.** In each
case the phrase inside is the client's; only the words joining it into a sentence are
ours. If the brief has a fuller version of any of them, replace the whole string with it
— the page reads them from one place, so a single edit updates every use.

The closing CTA's label and closing line are also the client's own, reused from the
homepage.

### Nothing is invented

No team member, name, headcount, founding date, office location, client count, revenue
figure, award, partnership or certification appears anywhere on the page. That is not
restraint for its own sake: the brief says the studio is _starting deliberately_, so a
page implying an established agency would contradict the studio's own sentence two
sections further down and be visibly false to anyone who checks.

Two checks hold it. A unit test asserts the whole content module contains no digit at all
and no founding, premises, award, certification or scale vocabulary. The browser
verification asserts the same against the **rendered** page — including that the stage
numerals contribute no digits, because they are generated content and therefore not in
the page's text.

One deliberate exception is worth naming: **"India" stays.** It appears in the client's
own ambition sentence, describing the market the studio intends to serve. It is not an
office or headquarters claim, and the location check targets premises language
("headquartered", "based in", "our offices") rather than the word itself.

### Commitments — read these two carefully

The expanded copy is more specific than the old page, and specificity is what makes a
page worth reading. Two drafted sentences describe how the studio works and should be
confirmed as true before launch rather than assumed:

| Where                         | Sentence to confirm                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------- |
| approach › claim 1 › practice | "Every piece starts with a written creative direction that you see and agree before production begins." |
| approach › claim 3 › practice | "It does not set the direction, and nothing generated goes out without a person having judged it."      |

Both are process commitments, not capacity or turnaround claims, and both match the
process described on `/how-we-work`. Neither promises a timescale, a volume or a
guarantee — the drafted copy contains none of those words, and a unit test asserts it.

The **caveat** in "How we're building" is the opposite kind of statement and is the most
important sentence on the page: it says the studio is small, that you deal directly with
the people doing the work, and that a large programme of work on a fixed calendar is the
stage after this one. It exists so the page cannot be read as over-promising. If the
client wants it softened, the honest move is to change what it says, not to remove it.

### Sections that were deliberately not built

The brief rules these out and the content supports none of them. Listed so the absence
reads as a decision:

no team grid · no stats or numbers block · no timeline or milestones · no values grid ·
no office photo · no founder's letter · no client logo strip

### The page's one centred moment

The belief statement is centred at display size with the statement measure of space
around it. It is the **site's third and last** centred moment — the homepage has the
thesis line and the closing CTA heading, and everything else on every page is flush left.
Nothing else on this page is centred, including the statement's own section label, which
is why that label is an accessible name rather than a rendered eyebrow. It also gets the
page's slowest entry (760ms from 28px, against 320ms from 24px everywhere else), which is
what keeps it the emphasis now that every other section moves too.

### Every drafted string

<!-- generated: about drafted copy — do not edit by hand, run `pnpm docs:content-todo` -->

**64 drafted strings**, against 8 read from the client's own
content modules and therefore not up for review here. Regenerate with
`pnpm docs:content-todo` after any edit to `about.content.ts`.

| Where                                                                                                             | Drafted string                                                                                                                                                                                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| hero › eyebrow                                                                                                    | About Famysys Studio                                                                                                                                                                                                                                                               |
| hero › body                                                                                                       | A creative production studio, built to make professional creative work easier to commission and easier to keep producing.                                                                                                                                                          |
| hero › media › alt                                                                                                | An empty photographic studio: a white cyclorama lit by two softboxes and an overhead rig, a camera bag and lenses on the floor.                                                                                                                                                    |
| belief › label                                                                                                    | What we believe                                                                                                                                                                                                                                                                    |
| approach › eyebrow                                                                                                | What we do, and why                                                                                                                                                                                                                                                                |
| approach › heading                                                                                                | Creative judgment, with production built around it.                                                                                                                                                                                                                                |
| approach › practiceLabel                                                                                          | In practice                                                                                                                                                                                                                                                                        |
| approach › claims › Creative direction decides what a piece should be. › title                                    | Creative direction decides what a piece should be.                                                                                                                                                                                                                                 |
| approach › claims › Creative direction decides what a piece should be. › claim                                    | Nothing else on this page matters if the idea is wrong. Before anything is produced, someone with taste decides what the work is for, who it is speaking to and what it should feel like — and that decision is made by a person.                                                  |
| approach › claims › Creative direction decides what a piece should be. › practice                                 | Every piece starts with a written creative direction that you see and agree before production begins. If the direction is unclear, we stop and fix that first, because production cannot rescue it later.                                                                          |
| approach › claims › Creative direction decides what a piece should be. › media › alt                              | An open sketchbook filled with thumbnail layouts and notes in blue ink, a pencil resting across the page.                                                                                                                                                                          |
| approach › claims › The workflow decides whether it can be made again. › title                                    | The workflow decides whether it can be made again.                                                                                                                                                                                                                                 |
| approach › claims › The workflow decides whether it can be made again. › claim                                    | A good piece made once is luck. The same standard reached the second and the tenth time is a method, and it only happens when the steps are written down, in order, with a check at each one.                                                                                      |
| approach › claims › The workflow decides whether it can be made again. › practice                                 | The same stages every time — understand, create, produce, refine, deliver — with the same review at the same point in each. Your second piece with us should feel like a continuation, not a restart.                                                                              |
| approach › claims › The workflow decides whether it can be made again. › media › alt                              | A laptop screen showing a video edit in progress: a timeline of clips below a preview frame, colour wheels to one side.                                                                                                                                                            |
| approach › claims › AI is used where it removes overhead, and left out where it would cost quality. › title       | AI is used where it removes overhead, and left out where it would cost quality.                                                                                                                                                                                                    |
| approach › claims › AI is used where it removes overhead, and left out where it would cost quality. › claim       | Emerging tools are genuinely useful for the slow, repetitive parts of production. They are not a substitute for the decisions above, and pretending otherwise produces work that looks like everyone else's.                                                                       |
| approach › claims › AI is used where it removes overhead, and left out where it would cost quality. › practice    | AI helps with drafts, variations, transcripts, rough assemblies and the versions a piece needs for different channels. It does not set the direction, and nothing generated goes out without a person having judged it.                                                            |
| approach › claims › AI is used where it removes overhead, and left out where it would cost quality. › media › alt | A colour-grading interface on a monitor, photographed at an angle: two colour wheels beside a hue curve drawn over a spectrum.                                                                                                                                                     |
| inputs › eyebrow                                                                                                  | The three inputs                                                                                                                                                                                                                                                                   |
| inputs › heading                                                                                                  | What each input contributes, and where it stops.                                                                                                                                                                                                                                   |
| inputs › body                                                                                                     | The studio is built on three things, and each is only useful because the other two are there. Naming where each one stops is the honest half of the description.                                                                                                                   |
| inputs › inputs › Human creativity › name                                                                         | Human creativity                                                                                                                                                                                                                                                                   |
| inputs › inputs › Human creativity › contributesLabel                                                             | Contributes                                                                                                                                                                                                                                                                        |
| inputs › inputs › Human creativity › contributes                                                                  | Taste, judgment and the idea itself. Deciding what a piece is for, what it should say and what it should feel like — and recognising when a draft is not there yet.                                                                                                                |
| inputs › inputs › Human creativity › stopsLabel                                                                   | Stops at                                                                                                                                                                                                                                                                           |
| inputs › inputs › Human creativity › stops                                                                        | Volume. One person's judgment does not multiply by itself, and a studio that relied on it alone would be slow, expensive and inconsistent from one piece to the next.                                                                                                              |
| inputs › inputs › AI › name                                                                                       | AI                                                                                                                                                                                                                                                                                 |
| inputs › inputs › AI › contributesLabel                                                                           | Contributes                                                                                                                                                                                                                                                                        |
| inputs › inputs › AI › contributes                                                                                | Speed on the repetitive parts: first drafts, variations, transcripts, rough assemblies and the many versions one piece needs across channels.                                                                                                                                      |
| inputs › inputs › AI › stopsLabel                                                                                 | Stops at                                                                                                                                                                                                                                                                           |
| inputs › inputs › AI › stops                                                                                      | Direction and sign-off. It does not decide what the work is for, and nothing it produces goes out without a person having judged it.                                                                                                                                               |
| inputs › inputs › Structured production › name                                                                    | Structured production                                                                                                                                                                                                                                                              |
| inputs › inputs › Structured production › contributesLabel                                                        | Contributes                                                                                                                                                                                                                                                                        |
| inputs › inputs › Structured production › contributes                                                             | Repeatability. The same stages in the same order, with a review at the same point each time, so the second piece is as considered as the first.                                                                                                                                    |
| inputs › inputs › Structured production › stopsLabel                                                              | Stops at                                                                                                                                                                                                                                                                           |
| inputs › inputs › Structured production › stops                                                                   | Ideas. A process can make a good idea reliably; it cannot supply one. That is why it sits underneath the other two rather than in front of them.                                                                                                                                   |
| building › eyebrow                                                                                                | How we're building                                                                                                                                                                                                                                                                 |
| building › heading                                                                                                | Starting deliberately, in a set order.                                                                                                                                                                                                                                             |
| building › body                                                                                                   | The studio is new, and saying so is easier than being caught out by it. This is the order things are being built in, and where each stage stands.                                                                                                                                  |
| building › stages › Capabilities first › title                                                                    | Capabilities first                                                                                                                                                                                                                                                                 |
| building › stages › Capabilities first › status                                                                   | Now                                                                                                                                                                                                                                                                                |
| building › stages › Capabilities first › body                                                                     | Building the creative and production capability itself: the people, the tools and the working method for each service we offer. A studio that cannot yet make the work well has nothing to organise.                                                                               |
| building › stages › Then process › title                                                                          | Then process                                                                                                                                                                                                                                                                       |
| building › stages › Then process › status                                                                         | Next                                                                                                                                                                                                                                                                               |
| building › stages › Then process › body                                                                           | Writing down how each kind of piece gets made, and running enough work through it to find where it needs tightening. The process described on this site is the one in use; refining it is the current work.                                                                        |
| building › stages › Then scale › title                                                                            | Then scale                                                                                                                                                                                                                                                                         |
| building › stages › Then scale › status                                                                           | After that                                                                                                                                                                                                                                                                         |
| building › stages › Then scale › body                                                                             | Taking on more work, and more kinds of work, once the first two hold without effort. Growth that arrives before the method is ready is exactly what the word deliberately is there to prevent.                                                                                     |
| building › caveat                                                                                                 | What that means for a client today: the work is made carefully and reviewed properly, and the studio is small enough that you deal directly with the people doing it. What is not ready yet is volume — a large programme of work on a fixed calendar is the stage after this one. |
| ecosystem › eyebrow                                                                                               | Part of Famysys                                                                                                                                                                                                                                                                    |
| ecosystem › heading                                                                                               | Where the Studio sits.                                                                                                                                                                                                                                                             |
| ecosystem › paragraphs › 1                                                                                        | That is what makes starting deliberately possible. A standalone studio has to sell before it has built; this one can build first, because the business around it already runs.                                                                                                     |
| ecosystem › paragraphs › 2                                                                                        | So the Studio is not finding its feet alone. It is being built inside an existing business, with creative production as its own focus rather than a side of something else.                                                                                                        |
| ecosystem › paragraphs › 3                                                                                        | What the wider group does is its own work, and this page does not claim it as the Studio's. The link below goes to Famysys itself.                                                                                                                                                 |
| ecosystem › media › alt                                                                                           | A camera operator seen from below, adjusting a rig by hand under a small lamp, the background out of focus.                                                                                                                                                                        |
| ecosystem › link › label                                                                                          | Visit famysys.com                                                                                                                                                                                                                                                                  |
| direction › eyebrow                                                                                               | Where we're going                                                                                                                                                                                                                                                                  |
| direction › heading                                                                                               | What we are building toward.                                                                                                                                                                                                                                                       |
| direction › ambitionLabel                                                                                         | The ambition                                                                                                                                                                                                                                                                       |
| direction › presentLabel                                                                                          | Where we are today                                                                                                                                                                                                                                                                 |
| direction › media › alt                                                                                           | A projector throwing a beam of light through haze in a red-lit room.                                                                                                                                                                                                               |
| closingCta › heading                                                                                              | Bring us something to make.                                                                                                                                                                                                                                                        |
| closingCta › body                                                                                                 | Tell us what you are trying to produce and who it is for. We will tell you plainly whether it is something we can make well.                                                                                                                                                       |

<!-- /generated -->

## Drafted copy pending approval — Contact (`/contact`)

**The one page whose reference is the parent site.** Every other page here is shaped
against the design language the six share; this one follows famysys.com's own contact page
— light hero, dark two-column form section, "What happens next" panel on the right —
because the client asked for it and that page already solves this problem.

Which makes what was _not_ carried over from it the most important thing in this section.

### Not carried over: the trust badges. Read this one first

famysys.com's contact panel carries three badges:

- **SOC2 Type II Compliant**
- **Strict Commercial NDA**
- **Zero Lock-In Guarantee**

**None of them appear on this page, and none should be added without a decision from the
manager.** The first is a certification an external auditor issues to a specific named
legal entity after an observation period. The other two are contractual commitments. The
Studio is a new arm of the business, the brief says nothing about any of them, and a
certification claimed by a business that does not hold it is a different order of problem
from unapproved copy — it is a false statement about an audit.

The space where they would sit is simply empty. A unit test asserts that no string on the
page matches `soc2`, `iso`, `certifi`, `compliant`, `nda`, `guarantee` or `lock-in`.

**What is needed:** the manager to say what Famysys Studio can _genuinely_ claim in its own
name. If the Studio is covered by the parent entity's SOC2 report, that is a real answer
and the badge can go back with the right wording. If it is not, it cannot.

### Not carried over: the contact details

famysys.com publishes `hello@famysys.com` and a phone number on that page. **Both are the
parent's.** The Studio may share them, may have its own, or may not want a phone number on
a page at all — the brief says nothing.

`contactPage.panel.direct` is therefore `{}`, and while both fields are absent the "Or
reach us directly" block does not render at all, so the page never shows a heading with
nothing beneath it. **The only way to reach the Studio from this page right now is the
form** — which, per the warning at the top of this file, delivers nowhere.

Note the inconsistency this leaves: the **footer** still shows `hello@famysys.com` on every
page, including this one, and the rebuilt footer now sets it at display size in its lower
band — so the parent's address is the most prominent contact detail on the site while this
page's own "reach us directly" block stays empty. Whatever is decided should be applied to
both.

**What is needed:** the Studio's own email address, and a phone number or a decision not to
publish one.

### Not carried over: the QR business card

The parent's panel ends with a QR code labelled "Scan to Connect — Instant digital business
card". A digital business card belongs to a **person**, not a company, and whose it would
be on the Studio's page is a question rather than an asset to reproduce.

**What is needed:** a decision — whose card, or none.

### The hero copy is new, and here is the reasoning

The parent's hero is:

> **Start with the problem, not the pitch.**
> Tell us what is not working and what it is costing you. If it is work we should take, you
> will hear back from the engineer who would scope it — not a sales sequence.

That is written for someone buying engineering, and neither sentence survives the move to a
creative production studio: a client with a film to make does not have something that is
not working and costing them money, they have something they want made. What was kept is
the _shape_ — a short declarative heading built on a contrast, and an intro that says what
to send and who reads it.

| Version               | Copy                                                                                                                                                                                                                                                     |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **On the page**       | **Start with what you want made, not how to make it.** / Tell us what you are trying to create, who it is for and roughly when you need it. If it is work we should take, you will hear back from the person who would direct it — not a sales sequence. |
| **Approved fallback** | Have a creative requirement? Let's talk. / Tell us what you're trying to create. We'll help you determine the right approach, scope and production model.                                                                                                |

The fallback is the brief's own final-CTA copy and is already approved — but it is also
already on the homepage and on five other pages as the closing CTA, which is the argument
against making it this page's headline too. Either is fine; the second needs no approval.

A unit test asserts none of the parent's engineering framing (`engineer`, "what it is
costing", "what is not working", "not the pitch") appears anywhere on the page.

### Commitments — confirm these first

Everything below promises the sender something the studio then has to do. These are not
copy preferences.

| Commitment                                                                                                                          | Where                                     | Note                                                                                                                                                                                                                                                                       |
| ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "you will hear back from **the person who would direct it** — not a sales sequence"                                                 | Hero body                                 | A commitment about _who_ replies, exactly as the parent's "the engineer who would scope it" is. It implies a named person reads inbound work and that no automated nurture sequence runs.                                                                                  |
| **01 — "Your brief goes to the person who would direct it, not a routing queue."**                                                  | Panel step 01                             | Same commitment restated. If briefs will in fact go to a shared inbox first, this is wrong.                                                                                                                                                                                |
| **02 — "A short call."**                                                                                                            | Panel step 02                             | The studio will get on a call before deciding. **No duration is stated** — the parent says "Thirty minutes" and the brief gives the Studio no number, so one is not invented here. If a length should be stated, supply it.                                                |
| **03 — "you get the approach we would take, the scope it implies and the production model that suits it — before any commitment."** | Panel step 03                             | The strongest of the three: a written document, unpaid, before anything is agreed. Confirm the studio will actually produce one for every fitting inquiry.                                                                                                                 |
| Confirmation message                                                                                                                | `contact.content.ts` (`confirmationBody`) | "We read every one. If it is work we should take, you will hear back from the person who would direct it." Deliberately carries **no turnaround** — unlike the closing form's own confirmation, which still says "within one business day" and is listed separately below. |

**No timing appears anywhere on this page.** A test asserts the content module contains no
`minutes`, `hours`, `business day`, `within <n>`, `twenty`/`thirty`/`forty`/`sixty` or
`24 hours`. The parent's thirty minutes was not inherited.

### The form's fields

Eight fields, in famysys.com's own order, with its labels — except the last, which asks
what you are trying to **create** where the parent asks what you are trying to **fix**.

| Field                          | Required | Note                                                                                             |
| ------------------------------ | -------- | ------------------------------------------------------------------------------------------------ |
| First name                     | yes      |                                                                                                  |
| Last name                      | yes      |                                                                                                  |
| Work email                     | yes      | Free-mail addresses (gmail, outlook, …) are refused with an actionable message naming the domain |
| Company                        | yes      |                                                                                                  |
| Company website                | **no**   | Labelled "(optional)". A scheme is optional — "acme.com" is accepted                             |
| Your role                      | yes      | Options are NOT the parent's — see the row in "Copy the brief does not supply"                   |
| Company size                   | yes      | The parent's four bands — see the same table                                                     |
| What are you trying to create? | yes      |                                                                                                  |

Submit button reads **"Send inquiry"**, as the parent's does.

### Every drafted string

<!-- generated: contact drafted copy — do not edit by hand, run `pnpm docs:content-todo` -->

**26 drafted strings**, against 6 read from the client's own
content modules and therefore not up for review here. Regenerate with
`pnpm docs:content-todo` after any edit to `contact.content.ts`.

| Where                          | Drafted string                                                                                                                                                                                  |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| hero › heading                 | Start with what you want made, not how to make it.                                                                                                                                              |
| hero › body                    | Tell us what you are trying to create, who it is for and roughly when you need it. If it is work we should take, you will hear back from the person who would direct it — not a sales sequence. |
| form › heading                 | Tell us about the work                                                                                                                                                                          |
| form › labels › firstName      | First name                                                                                                                                                                                      |
| form › labels › lastName       | Last name                                                                                                                                                                                       |
| form › labels › email          | Work email                                                                                                                                                                                      |
| form › labels › companyName    | Company                                                                                                                                                                                         |
| form › labels › companyWebsite | Company website                                                                                                                                                                                 |
| form › labels › role           | Your role                                                                                                                                                                                       |
| form › labels › companySize    | Company size                                                                                                                                                                                    |
| form › labels › brief          | What are you trying to create?                                                                                                                                                                  |
| form › optionalSuffix          | (optional)                                                                                                                                                                                      |
| form › selectPlaceholder       | Select one                                                                                                                                                                                      |
| form › submitLabel             | Send inquiry                                                                                                                                                                                    |
| form › submittingLabel         | Sending…                                                                                                                                                                                        |
| form › confirmationHeading     | Thanks — your brief is with us.                                                                                                                                                                 |
| form › confirmationBody        | We read every one. If it is work we should take, you will hear back from the person who would direct it.                                                                                        |
| form › submitErrorMessage      | Something went wrong sending that. Please try again.                                                                                                                                            |
| panel › heading                | What happens next                                                                                                                                                                               |
| panel › steps › 0 › heading    | Someone who makes the work reads it                                                                                                                                                             |
| panel › steps › 0 › body       | Your brief goes to the person who would direct it, not a routing queue.                                                                                                                         |
| panel › steps › 1 › heading    | A short call                                                                                                                                                                                    |
| panel › steps › 1 › body       | Enough to establish what you are making, who it is for, and whether this is work we should be taking on at all.                                                                                 |
| panel › steps › 2 › heading    | A written approach                                                                                                                                                                              |
| panel › steps › 2 › body       | If it fits, you get the approach we would take, the scope it implies and the production model that suits it — before any commitment.                                                            |
| panel › directEyebrow          | Or reach us directly                                                                                                                                                                            |

<!-- /generated -->

## Copy the brief does not supply

| Item                         | Where                                                 | What is needed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FAQ section heading          | `src/presentation/sections/shared/Faq.tsx`            | The brief gives seven Q&As but no heading for the section. It now renders a deliberately conspicuous placeholder — eyebrow "Questions", heading `TODO(client)` — so the section has the same shape as every other one and the gap cannot ship unnoticed. **This string is visible on the page.**                                                                                                                                                                                                                                                                                                                                                                                          |
| The Differentiator eyebrow   | `marketing.content.ts` (`differentiatorBlock`)        | Every other section opens eyebrow-heading-body; this one has no eyebrow string in the brief, so it opens on the heading instead. `leadIn` is not a substitute — it is a sentence ending in a colon that introduces the four cards, and it is set as one above them. Supply an eyebrow or confirm the section opens without one.                                                                                                                                                                                                                                                                                                                                                           |
| Footer tagline               | `marketing.content.ts` (`footerContent.tagline`)      | Currently reuses the brief's own central-idea sentence. Not new copy, but not written for the footer either — confirm or replace.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Contact email                | `marketing.content.ts` (`footerContent.contactEmail`) | `hello@famysys.com` is **the parent's address**, taken from famysys.com's own contact page. The footer now sets it at display size in the lower band, so it is the most prominent single string on the page after the wordmark. Confirm the Studio's own address, or confirm it shares this mailbox.                                                                                                                                                                                                                                                                                                                                                                                      |     |
| Postal address               | `marketing.content.ts` (`footerContent.addressLines`) | famysys.com's footer prints **10193 W Grand Parkway S., Ste. 103-229, Richmond, TX 77407, United States**. Whether the Studio operates from that address is not stated anywhere in the brief, and an address is the one piece of footer content a reader may act on physically — post, couriers, a visit. `addressLines` is `null` and **no address block renders**; the footer's lower band is the email alone until one is confirmed.                                                                                                                                                                                                                                                   |
| Footer descriptor line       | `marketing.content.ts` (`footerContent.descriptor`)   | **"AI-Enabled Creative Production Partner"** — drafted, pending approval. It sits under the copyright, and it is the Studio's answer to the parent's "AI-Native Digital Engineering Partner". Built from the brief's own three terms (human creativity, AI, efficient production) and from "creative production partner", which is the client's phrase, but the arrangement is ours. **Visible on every page.**                                                                                                                                                                                                                                                                           |
| Social handles               | `marketing.content.ts` (`footerContent.socialLinks`)  | The footer's CONNECT column now lists **LinkedIn, X and GitHub**, matching famysys.com's, but **none of the three links anywhere** — each renders as a name with no destination. The only accounts that exist belong to the parent company, and pointing the Studio's footer at them would send a reader to a different business. Supply the Studio's handles, or confirm the column should come out. **Visible on every page.**                                                                                                                                                                                                                                                          |     |
| Legal pages                  | `marketing.content.ts` (`footerContent.legalLinks`)   | **BROKEN LINKS, ON PURPOSE, ON ALL SEVEN PAGES.** The rebuilt footer matches famysys.com's structure, which has a LEGAL column linking Terms & Conditions and Privacy Policy — so both links are now in place and both 404, because `/terms` and `/privacy` do not exist here. This reverses an earlier decision to carry no legal row at all rather than ship dead links, and it is the highest-cost item on this list after the contact form: a site whose forms ask for a name, a company and an email is linking a privacy policy that is not there. Supply the two documents (or say the column comes out) — `internalLinks.test.ts` holds the exemption open and names both routes. |     |
| Tier field labels duplicated | `WaysToWork.tsx` (homepage)                           | "Ideal for" and "Typical work includes" are now exported from `marketing.content.ts` as `TIER_FIELD_LABELS`, and `/ways-to-work-with-us` reads them from there. The homepage section still carries them as component literals: `presentation/` may not import `infrastructure/` under the boundary rules, so removing that duplication means threading them through as props from `app/page.tsx`. A homepage change, deliberately not made while building an inner page.                                                                                                                                                                                                                  |
| Two forms, two field sets    | `DemoForm.tsx` and `ContactForm.tsx`                  | The closing form on every page asks four questions (full name, work email, company, company size); `/contact` asks eight, matching famysys.com's own contact form. Both were drafted, neither is in the brief. Confirm both, or decide the short form should ask the same eight.                                                                                                                                                                                                                                                                                                                                                                                                          |
| Company-size bands           | `CompanySize.ts`                                      | Now the four famysys.com uses — **1–50 · 50–200 · 200–1,000 · 1,000+**. They REPLACED a five-band set (1-10 / 11-50 / 51-200 / 201-500 / 500+) that the previous build invented, so the closing form's dropdown changed too. Two overlapping vocabularies would have made the answers un-comparable between the two forms, and neither set was ever confirmed. Confirm the four.                                                                                                                                                                                                                                                                                                          |
| "Your role" options          | `ContactRole.ts`                                      | **Founder / Owner · Marketing Lead · Brand or Creative Lead · Content or Social Lead · Agency or Partner · Other.** NOT the parent's list, which is CEO / COO / CFO / CIO-CTO / VP / Other and is shaped for an enterprise IT buyer approving an engineering engagement. The Studio sells creative production to marketing and brand owners, often at companies with no C-suite to route through; reusing the parent's would have pushed most real senders into "Other". This is a read of who the Studio expects to hear from, and needs confirming.                                                                                                                                     |
| Demo form reply commitment   | `DemoForm.tsx` (success message)                      | "Someone from Famysys Studio will reply **within one business day**" is an operational promise, not placeholder copy. Confirm the studio can hold that turnaround, or loosen the wording.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

## Routes — all seven content pages now exist

`/` · `/creative-services` · `/how-we-work` · `/ways-to-work-with-us` · `/selected-work` ·
`/about` · `/contact`

**Every navigation destination on the site now resolves.** `/contact` was the last one, and
it was the destination of nearly every call to action: the header's "Contact" and "Start a
Conversation" buttons, the primary CTA in four of the five section-page heroes, the What We
Do CTA, all four "Talk to us" links in Ways to Work With Us, all six "Talk to us about
this" links on Creative Services, the FAQ's pricing answer, and every closing CTA.

`internalLinks.test.ts` reads the routes off disk and checks every internal href in every
content module against them, so the next dead link fails the test suite rather than waiting
to be clicked. The browser pass re-checks the same thing against the running build: 468
links across the seven pages, every internal target resolving 200.

`/privacy` and `/terms` still do not exist, and as of the footer rebuild they **are linked
again** from every page — see the legal-pages row above. They are the only two internal
links on the site that do not resolve, and `internalLinks.test.ts` names both in a
`PENDING_ROUTES` exemption so the gap is stated rather than silent.

## Deliberately absent

- **No pricing anywhere.** The brief is explicit: "No public pricing anywhere. Every engagement is
  scoped around the actual requirement." A test in
  `StaticMarketingContentRepository.test.ts` fails the build if a price-shaped string appears in the
  Ways to Work content, and the rendered page is checked for the same.

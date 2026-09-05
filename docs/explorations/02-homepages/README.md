# Homepage explorations

Three alternative homepage directions for Famysys Studio, each a single self-contained HTML file
that opens straight from disk with no build step. All three carry the same copy (the client's own
words, read from `src/infrastructure/content/static/`) and the same fixed colour set. What differs
is everything else: layout, typography, imagery and motion.

| Direction | File | Status |
|-----------|------|--------|
| **A — Editorial** | `a-editorial.html` | **built** (images inlined; one file) |
| **B — Kinetic** | `b-kinetic.html` | **built** (needs `media-b/` alongside) |
| **B — Showcase** | `b-showcase.html` | **built** (needs `media-showcase/` alongside) |
| C — Brutalist Grid | `c-brutalist.html` | separate deliverable |

Open a file in a browser to review it. Photography for B lives in `media-b/` next to the file and
photography for Showcase in `media-showcase/`, so keep those folders alongside the HTML.

---

## B — Showcase

**The technically ambitious one.** Same nine sections and the same client copy as the live site, but
every section is built around a technique rather than a layout: a shader hero that distorts under
the cursor and under scroll, a pinned sequence scrubbed frame by frame on a canvas, a process that
travels sideways in three layers at three speeds, type that stretches with scroll velocity,
photography poured into letterforms, a gallery dragged by the pointer with per-card lag, and a
custom cursor that changes shape by context. Nothing on the page is inert on hover.

Dark-dominant: forest ground throughout, lifted forest for What We Do and the FAQ, one warm sand
break for Ways to Work With Us. Type is **Bricolage Grotesque** (display, 700/800) with
**Instrument Sans** for body copy — deliberately different from A (Jost / Instrument Serif) and B
Kinetic (Syne / Manrope).

### Section by section — layout, technique, motion

| # | Section | Layout | Technique | Motion |
|---|---------|--------|-----------|--------|
| — | Header | Fixed bar, wordmark left, nav right, pill CTA | Magnetic CTA | Hides on scroll down and returns on scroll up; jade progress rule along the bottom edge tracks page position; nav labels roll over to a jade duplicate on hover; the CTA leans toward the cursor. |
| 1 | Hero | Full-bleed shader canvas, headline bottom-left at up to 8.4rem, copy and two buttons beneath | **WebGL** (hand-written GLSL, no library) + **text that behaves physically** | Two studio photographs are sampled through a moving fbm noise field. The pointer drags a fluid smear across the frame — the ripple is measured against the *segment* between the live pointer and a lagged one, so fast movement leaves a comet rather than a dot, with a jade heat bloom and a small chromatic split along it. Scrolling displaces the field, pushes the image in and re-grades it toward forest. The headline is split to 49 characters that scatter on load and spring into place on a stagger, then repel from the cursor within 165px and ease home. |
| 2 | What We Do | Six 4:5 capability tiles, 3×2, heading and lede above | **Masked reveals** + magnetic tiles | Nothing fades. Each tile is uncovered by two moving shapes: a full-bleed curtain that slides up out of the frame and a jade blade rotated −14° that sweeps through behind it, staggered 85ms per tile. On hover the tile leans toward the cursor, its photograph scales to 1.15 and desaturates to full colour, the descriptor slides up from below, an apricot rule draws along the bottom edge, and the cursor becomes a 112px cream disc reading "VIEW". |
| 3 | The Differentiator | Pinned split screen: copy and a four-row rail left, canvas right | **Pinned sequence** + **scroll-scrubbed image sequence** | The stage pins for ~5.2 screens. Scroll maps to a 120-frame index and each new integer frame is *redrawn* on a 2D canvas — not cross-faded by CSS. Within a frame the held photograph zooms and pans; at each cut the incoming frame is composited in four horizontal bands that slide against each other, so the transition reads as a physical splice. The frame counter is on screen. The four elements advance in step, the rail highlights the live row and opens its description, four apricot segments fill, and "AI is our production advantage — not our identity." lands on the last frame. |
| 4 | How We Work | Pinned stage, five step cards in a row travelling sideways | **Horizontal scroll with internal parallax** | The stage pins and 1,720px of sideways travel is driven by vertical scroll. Three layers move at three speeds off the same progress value: giant background numerals at 1.38×, the step cards at 1.0×, a strip of production photographs at 0.62×. Cards rise into place as their own x-position crosses 94% of the viewport. A jade meter fills across the top right. |
| 5 | Ways to Work With Us | Sand ground; a marquee of the tier names over four full-width rails; the Custom row is a terracotta band | **Text that behaves physically** | The marquee runs continuously, but its speed, horizontal stretch (up to 1.085×) and skew (up to ±5.5°) are a direct function of scroll velocity — it shears when you throw the page and settles when you stop. Hovering a rail wipes ink across it left to right, scatters the tier name character by character into apricot with per-letter delays, opens "Ideal for" and "Typical work includes", and swings its photograph in from rotate(7°) scale(.72). |
| 6 | Selected Work | Eight 4:5 covers and an end card in one row beside a rolling 01/08 counter | **Custom cursor dragging elements with easing** | The row is not scrolled — it is dragged. Pointer-down grabs it, release throws it with inertia (0.93 friction), and each card chases the drag position with its own easing constant (0.185 falling to 0.075), so the row stretches and snaps back like a chain. The cursor becomes a 104px jade disc reading "DRAG". Prev/next buttons and shift+wheel do the same thing for anyone not dragging. |
| 7 | Why Famysys | Five reasons as giant words up to 7.4rem, copy and a tilted thumbnail beside each | **Photography masked into letterforms** + velocity shear | Each word is filled with its own photograph through `background-clip: text`, zoomed to 380% so real texture lands inside the strokes and lifted by a 56% cream wash so the fill always clears its ground. The whole ledger shears with scroll velocity (up to 1.7°) and decays back to zero after input stops. Rows slide in from the left; thumbnails straighten on hover. |
| 8 | FAQ | Seven numbered rows on lifted forest | Spring disclosure | Rows enter on a stagger. Opening one scales its numeral to 1.55 and turns it brass, rotates the plus into a minus, and springs the answer in on a transform. Answers are `hidden` until opened, so no height is ever animated. A jade wash grows up from the bottom edge on hover. |
| 9 | Final CTA | Full-bleed photograph, heading at up to 7.6rem, magnetic button and a rotating badge | **Canvas dot field** + **page transition** | A grid of ~1,300 dots ripples on a slow sine wave and parts around the cursor within 210px, turning jade as it goes. The background photograph scales 1.22 → 1.04 as the section arrives. The button leans toward the cursor and springs back with overshoot. **Every internal link on the page** — nav, footer, tiles, CTAs — is intercepted: five panels sweep down to cover the page, the destination route is announced, and they sweep away again. The same panels are the boot curtain with the 00–100 counter. |
| — | Footer | Wordmark, tagline, email and three link columns from the navigation content | — | Links slide right and turn jade on hover. |

### How it is built

- **One `requestAnimationFrame` loop.** Every module registers a `frame()` and is called from a
  single loop. The scroll listener does nothing but store `window.pageYOffset`.
- **Nothing reads layout during scroll.** Every rectangle is cached by a measurement pass that runs
  on boot, on load, when fonts land, on a debounced resize and after an FAQ row opens.
- **The measurement pass runs twice.** Two modules set their own spacer height (the pinned sections
  size their own scroll distance), which moves everything below them; a single pass left every
  rectangle after How We Work stale by 820px, which broke the magnets in the lower half of the page.
- **Transform and opacity only.** Pins are `position: sticky`; the horizontal track, the numeral
  layer, the photo strip, the drag gallery, the marquee and the reveal curtains are all
  `translate3d`. Width, height, top and left are never animated.
- **Writes are guarded.** Modules compare against their last written value and skip the write when
  it has not changed; the drag gallery skips its whole body once every card has caught up.
- **Off-screen work sleeps.** The shader, the sequence canvas, the dot field and the marquee are
  each gated on an IntersectionObserver. The Why shear deliberately is not — it has to be allowed
  to decay to zero after the section has left, or it freezes mid-shear.
- **The two shader textures are also inlined as data URIs.** A page opened from `file://` cannot
  upload a local JPEG into a WebGL texture — the browser treats it as cross-origin and throws — so
  the loader tries `media-showcase/hero-beam.jpg` and `hero-set.jpg` first and falls back to the
  inline copies when that throws. Both frames are in the folder as well. Every other image on the
  page is a normal file reference. If WebGL is unavailable altogether, the hero shows a still.

### Reduced motion

With `prefers-reduced-motion: reduce`, verified in a browser configured that way: the boot curtain
and the custom cursor are removed, the shader renders a single static frame (no pointer response,
no timer), the Differentiator pin releases and its canvas is replaced by the four photographs in a
2×2 grid with all four elements expanded and the closing line shown, How We Work releases its pin
and lays the five steps out as a grid, Selected Work becomes a native scroll container, the marquee
and the badge stop, the velocity shear is off, every reveal renders at its final state, hidden
descriptors are visible, and page transitions become a plain label. The page loses no content.

### Mobile

At 390px the shader still runs (device pixel ratio capped at 1.4), the custom cursor and every
cursor-tracking effect is off for coarse pointers, How We Work releases its pin and stacks, Selected
Work becomes a native swipe with `scroll-snap`, the rails collapse to one column, the marquee stops,
and the nav folds into a full-screen menu.

### Frame rate

Measured in real Google Chrome (not headless) at 1512×900, driving a full top-to-bottom scroll from
inside the page at 26px per frame so no automation round-trip distorts the timing — 664 frames.
Numbers are from a warm second pass; the first pass through the page dips while images decode.

| | Result |
|---|---|
| Mean | **59 fps** |
| p50 | **60 fps** |
| p95 | **59 fps** |
| p99 | **58 fps** |
| Frames over 20ms | **3 of 664** |
| Per section | hero 61 · What We Do 56 · Differentiator 59 · How We Work 60 · Ways 60 · Selected Work 59 · Why 60 · FAQ 60 · CTA 60 |

**Cut or changed to get there:**

- `backdrop-filter` on the header bar and on the five process cards. A blurred strip across the full
  width re-composites on every scroll frame; removing it took How We Work from 44fps to 57fps and
  lifted the whole page. Both now use flat translucency.
- `will-change: transform` on the five transition panels, which kept five full-viewport composited
  layers alive for the life of the page.
- Per-frame `disabled` and progress writes in Selected Work. Assigning the same boolean to
  `button.disabled` every frame still invalidates style — that section was running at 36fps.
- The sequence is 120 frames, its canvas backing is capped at 1400px wide at 1.6× DPR, and the
  four-band splice only draws during a cut, not on held frames.
- Shader device pixel ratio capped at 2 (1.4 on phones).

Nothing was cut from the brief's technique list.

### Verified

Checked in real Google Chrome, driven with the pointer, the wheel and clicks, reading live computed
style and element geometry mid-interaction rather than from a full-page capture. No console errors
at any width; 20 photographs, none broken.

| Check | Observed |
|-------|----------|
| Shader renders and reacts | Context created, both textures uploaded. Canvas pixels differ between two captures taken as the cursor crosses the frame, and again between two captures 1.4s apart with the cursor still — so it responds to the pointer *and* runs on its own. |
| Headline physics | 49 characters split; mid-interaction transforms read `translate3d(−4.72px, −3.38px, 0)`, `translate3d(7.6px, −10.06px, 0)` etc. as the cursor passes; the accented characters carry apricot. |
| Custom cursor | Ring tracks at `translate(760.2, 430.11)` against a pointer at (760, 430) — it lags by design. Mode switches read `is-media`/"VIEW" over a tile, `is-drag`/"DRAG" over the gallery, hidden over buttons. |
| Masked reveal | Before entry the six curtains sit at `translateY(0)`; after entry all six read −559px, staggered. |
| Tile hover | Descriptor `opacity 0 → 0.95`, photograph `scale(1.06) → scale(1.15)`, bottom rule `scaleX(0) → scaleX(1)`, tile leaning `translate3d(1.21px, 10.72px, 0)` toward the cursor. |
| Differentiator pin | Sticky stage held at `top: 0` across seven sampled offsets spanning the section, then released to `top: −1100` after it. |
| Frame scrub | FRAME 003 → 022 → 044 → 065 → 087 → 108 → 119 of 120 across those offsets; active row stepped 0 → 1 → 2 → 3; segment fills 0.08 / 0.72 / 1.00+0.44 / … / 1.00×3+0.96; `is-end` fired at the close. |
| Horizontal travel | Stage pinned at `top: 0` while the cards translated 0 → −344 → −688.8 → −1032.8 → −1376.8 → −1720.8px, the numerals 0 → −2374.7px and the photo strip 0 → −1066.9px — three speeds off one progress value. Meter filled 0 → 0.9999. Steps revealed 3 → 5 as they arrived. |
| Velocity stretch | Under wheel input the marquee read `scaleX(1.085) skewX(−0.104rad)` and relaxed to `scaleX(1.028)` between bursts. |
| Rail hover | Wipe `scaleX(0) → scaleX(1)`; tier name scattered (`rotate(−7.6°) translate(3.3px, −9.3px)`, apricot); facts `opacity 0 → 1`; photograph `opacity 0 → 0.5`, untilting from `rotate(7°) scale(.72)`. |
| Drag with lag | Mid-drag the first five cards read −350.69, −344.58, −337.73, −330.03, −321.35px — each trailing the one before. Release carried on under inertia; counter reached 03 and the Next button advanced it to 05. |
| Velocity shear | Rose to 0.0266 (matrix b, ≈1.5°) during wheel input, then decayed 0.0247 → 0.0208 → 0.0095 → 0.0040 → 0.0014 → 0.0005 → 0.0002 → 0 over ~1s after input stopped. |
| FAQ | All seven panels `hidden` on load; clicking one set `aria-expanded="true"` on that row only, sprang the answer in at `opacity 0.92` and scaled its numeral to 1.55. |
| Dot field | Two captures differ as the cursor moves and again over time. |
| Magnets | CTA button `translate3d(18.97px, 4.91px, 0)` toward a cursor 75px away; header CTA `translate3d(9.32px, 14.88px, 0)`. |
| Header | Hid on scroll down (`translateY(−72.8px)`), returned on scroll up (`translateY(0)`); progress rule read `scaleX(0.271)` at that position. |
| Page transition | Clicking a nav link covered the page with five staggered panels, showed `/creative-services`, then swept them away; the page itself never navigated. |
| Contrast (measured off rendered pixels) | hero body 13.0:1 · hero headline 11.3:1 · hero support line 13.45:1 · tile title over photography 13.91:1 · Differentiator body 13.49:1 · step card copy over the moving layers 10.52:1 · rail copy on sand 10.73:1. The image-filled words in Why measure 5.16:1 at the median of their fill and 4.57:1 at the tenth percentile, against a 3:1 requirement at that size. |
| 390px | Fresh load at 390×844: every section, the header and the footer measured `scrollWidth 390 = clientWidth 390`, and an attempted `scrollTo(500, y)` moved the page 0px sideways. |
| Reduced motion | Every item in the section above confirmed by reading computed style in a browser set to reduce. |

### Imagery

Twenty Unsplash photographs in `media-showcase/`, all different from the live site, from
`a-editorial.html` and from `media-b/`. Production and post: a camera operator silhouetted in a
shaft of light and a blue-lit set (the two shader frames), six capability tiles, four sequence
frames (a camera in a field, a colour-grading interface, a rig in low light, a mixing desk), five
process frames, two abstract light frames for Selected Work, and stage lighting for the Final CTA.
One or two people at most in any frame, no crews, no legible brand marks. 2.4MB in total; the two
inlined shader copies add a further 234KB to the HTML.

Source ids (Unsplash `photo-…`): 1580746353679, 1727451139462, 1702126952856, 1775559052522,
1632477829576, 1552396909, 1566507482566, 1619850015956, 1662237593784, 1574717024757,
1741774836064, 1696872733080, 1558905933, 1602783574181, 1702126952818, 1746169801256,
1643432316620, 1536759808958, 1558620013, 1761925116230.

### What Showcase deliberately does not share with the other directions

- The hero is neither a mosaic (live), nor type-led (A), nor cross-fading frames (B Kinetic): it is
  a shader.
- The Differentiator is a canvas sequence scrubbed frame by frame, not a card row (live), a lettered
  list (A) or a cross-fading photograph (B Kinetic).
- How We Work travels sideways in three parallax layers; the live site pins it, A sets it as text
  columns, B Kinetic scrubs a numeral rail.
- Selected Work is dragged, not scrolled sideways (B Kinetic), listed (A) or tiled (live).
- Why Famysys pours photography into the letterforms rather than setting them in ink and terracotta.

---

## B — Kinetic

**Motion is the medium.** This is the direction that reads like a video studio's own site: deep
forest as the default ground, full-bleed photography carrying most of the colour, apricot, brass and
jade pushed hard as fills and moving elements rather than small marks, and a different motion device
in every section. The working rule was the reverse of A's: a static section is a wasted one.

Type is Syne (extra-bold display) with Manrope for body copy. Two sand grounds break the dark run
(the Differentiator and Why Famysys); everything else sits on forest or lifted forest.

### Motion, section by section

| # | Section | Layout | Motion device |
|---|---------|--------|---------------|
| — | Header | Fixed translucent bar over the page | Hides on scroll down, returns on scroll up; jade progress bar along its bottom edge tracks page position. |
| 1 | Hero | Full-bleed photograph, headline bottom-left at up to 9.6rem | **Headline assembles from moving parts** (each word slides in from alternating directions on load) over **full-bleed media transitions** (three studio frames cross-fade with a slow push-in on a timer). As the page scrolls the whole image **scrubs**: it shrinks and clips into a rounded frame while the copy drifts up and fades. No mosaic. |
| 2 | What We Do | Six tall image tiles in a 3×2 grid on lifted forest, heading and body above | **Cursor tracking**: a jade/apricot spotlight follows the pointer across the grid, and the tile under the cursor tilts in 3D toward it while its photograph scales. Descriptions slide up on hover. |
| 3 | The Differentiator | Sand ground, split screen: copy and a numbered rail on the left, full-height photograph on the right | **Pinned panel**: the section holds for ~4.6 screens while the four elements cycle. Each state swaps the photograph (cross-fade and settle), the giant numeral, title and description; the rail highlights the active row and four segmented bars fill with scroll. The closing line "AI is our production advantage — not our identity." lands on the final state. |
| 4 | How We Work | Giant numeral rail across the full width, five step cards descending as a staircase below | **Scroll-scrubbed transform**: the rail of numerals 01–05 (up to 30rem) translates sideways as a direct function of scroll, with the active numeral filling apricot as its step arrives. A brass line draws down the left edge in step with progress; cards rotate and slide in as they enter. |
| 5 | Ways to Work With Us | Four full-width tier rails on lifted forest, tier name huge on the left, details and CTA to the right; the Custom row is a solid apricot band | **Text on the move**: a marquee of the tier names runs above the rails and a second, reversed marquee of the supporting lines runs below. Hovering a rail wipes a dark fill across it, lifts the tier name letter by letter, and swings its photograph in from the right. |
| 6 | Selected Work | One viewport-high stage; heading, eight tall 4:5 cards and an end card laid out in a single row | **Horizontal scroll**: the stage pins while the row travels sideways with vertical scroll, cards alternating above and below the centre line. A rolling counter reads 01–08 as each piece arrives. On phones this becomes a native swipe with snap points. |
| 7 | Why Famysys | Sand ground, five reasons as a ledger of giant words (up to 7.2rem) alternating ink and terracotta, description and a small photograph per row | **Scroll-velocity skew**: the whole ledger shears with how fast you scroll and settles back when you stop. Rows slide in from the left as they enter; thumbnails straighten and scale on hover. |
| 8 | FAQ | Seven numbered rows on forest, question set in display type | Rows enter from alternate sides; opening a question scales its numeral to jade, rotates the plus into a cross, and springs the answer in. Answers use `hidden` plus a transform entrance, so nothing animates height. |
| 9 | Final CTA | Full-bleed lens photograph, centred heading with "Let's talk." in jade | **Full-bleed media scrub** (the image scales down as the section arrives) plus a **rotating text badge** ("Project today · Creative partner tomorrow") and a **magnetic button** that leans toward the cursor within 160px. |
| — | Footer | Wordmark, tagline and contact address, plus three link columns derived from the navigation panels | Static. |

### Implementation notes

- **One scroll loop.** Every scroll-driven effect (hero scrub, pinned panel, numeral rail, horizontal
  travel, velocity skew, CTA scale, header state) is computed in a single `requestAnimationFrame`
  loop from one cached set of measurements. Nothing reads layout inside the scroll listener, and
  each module writes only when its value changes. Section positions are re-measured on resize,
  after fonts load and when an FAQ opens.
- **Transform and opacity only.** Pins are `position: sticky`; the horizontal section and the
  numeral rail are `translate3d`; the hero uses `transform` and `clip-path`; the FAQ toggles
  `hidden` and animates the answer in with a transform. Width, height, top and left never animate.
- **Looping animations sleep off-screen.** Marquees, the spinning badge, the hero frame cycle and
  the small indicator loops pause while their section is out of view (an `is-off` class set by an
  IntersectionObserver pauses their `animation-play-state`).
- **The velocity skew has no visibility guard.** Every other scroll module is gated on its section
  being on screen; the Why ledger is deliberately not, because the shear has to be allowed to decay
  back to zero after the section has left the viewport. Gating it froze the ledger mid-shear, so it
  showed a stale skew on the way back. The write stops on its own once the value reaches zero.
- **Reduced motion.** With `prefers-reduced-motion: reduce`: the hero shows its first frame and
  the assembled headline; the Differentiator releases its pin and renders the four elements
  stacked; Selected Work becomes a vertical list; the numeral rail, ledger, CTA image and every
  reveal render at their final state; marquees and the badge stop; nothing tracks the cursor.
- **Mobile (≤899px).** The Differentiator stacks, Selected Work becomes a horizontal swipe with
  `scroll-snap`, the cursor spotlight is removed and tiles reveal on scroll instead, tier rails
  collapse to one column, and the header nav folds into a full-screen menu. Verified at 390px
  with no horizontal overflow.
- **Contrast.** Body copy on dark grounds is `textOnDark` (#F1EBDD), never `textMuted`; on the
  two sand grounds it is `textMuted` or `textOnLight`.

### Imagery

Thirty-one files in `media-b/` (twenty-nine distinct Unsplash photographs), all different from the live site and from A, all
small-scale (one or two people at most, no crews, no legible brand marks). Hero: an empty lit
studio, eyes seen through a clapperboard, a night-time recording desk. What We Do: one frame per
capability. Differentiator: a woman in a materials studio, a robotic hand, a camera operator
filming an interview, hands on a laptop. Ways to Work: a hand-held camcorder, a camera against the
sun, a lens lit blue and red, film reels. Selected Work: eight stand-in covers, one per planned
piece. Why Famysys: five small thumbnails. Final CTA: the lens frame at full bleed.

Source ids (Unsplash `photo-…`): 1471341971476, 1585951237318, 1598488035139, 1561070791-36c1,
1515634928627, 1590650153855, 1589903308904, 1568952433726, 1618761714954, 1520333789090,
1531746790731, 1497015289639, 1544006659, 1493804714600, 1554048612, 1626379953822, 1542204165,
1594909122845, 1525182008055, 1523207911345, 1545235617, 1522075469751, 1527689368864,
1612817159949, 1626544827763, 1520697830682, 1542038784456, 1478737270239, 1492724441997.

### What B deliberately does not share with A or the live site

- No hairline-divided service grid (live) and no restrained typographic list (A): capabilities are
  cursor-lit image tiles.
- No card row for the Differentiator (live): it is a pinned split-screen sequence.
- The live site pins How We Work; B does not. Its process is a scrubbed numeral rail with a
  staircase of cards.
- Selected Work is neither a two-up tile grid (live) nor a vertical list (A): it travels sideways.
- Why Famysys is not a ledger with a side image panel (live): it is giant type that shears with
  scroll velocity.
- The hero is not a mosaic (live) and not type-led (A): it is full-bleed frames with an assembling
  headline that scrubs into a frame.

### Verified

Checked in real Google Chrome (not headless), driven with wheel events and the pointer, reading
live computed style and element geometry mid-scroll rather than from a full-page capture. Nine
sections, header and footer present; 35 images, none broken; no console errors at either width.

| Check | Observed |
|-------|----------|
| Hidden before reveal | Below the fold and before any scrolling: all 5 `.step`, 5 `.why-row` and 7 `.faq-row` at `opacity: 0` and translated (−60px / −50px / −80px), none carrying `.in`. On a phone-width pass mid-page the counts were partial (steps 1/5, FAQ 3/7, caps 1/6) — genuinely revealing as they enter, not pre-shown. |
| Hero media cycle | Active frame index moved 0 → 1 on its own timer. |
| Hero scrub | At 45% of the section: `scale(0.942)`, `clip-path: inset(4.3vh 2.9vw 5.8vh round 17.4px)`, copy at `opacity 0.275` and `translateY(−67.6px)`. Screenshot caught it mid-transition. |
| What We Do cursor tracking | Spotlight follows the pointer (`opacity 1`, `translate3d(884px, 403px, 0)`); the tile under it tilts `rotateX(−0.19deg) rotateY(0.23deg) scale(1.03)`; its photograph scales to 1.14 and the corner tag rotates in. |
| Hover reveal | Idle descriptor `opacity 0`, `translateY(14px)`; hovered descriptor `opacity 0.9`, `translateY(0)`. |
| Differentiator pin | Sticky stage held at `top: 0` across all five sampled offsets spanning the section; active panel and rail stepped 0 → 1 → 2 → 3; segment fills read 0.079 / 0.364 / 0.500 / 0.637 / 1.000; `is-end` fired at the close. After the section, the stage released to `top: −1103`. |
| How We Work rail | Rail translated −1489px → −2812px → −3121px with scroll; active numeral advanced 2 → 4; the brass line's `--p` ran 0.474 → 0.978 → 1.000. |
| Ways to Work hover | Wipe `::before` scaled from `scaleX(0)` to `scaleX(1)`; the tier photograph went `opacity 0 → 0.55` and untilted from `rotate(8deg) scale(0.69)` to `rotate(−4deg) scale(1)`; letters lifted `translateY(−10.4px)` and turned apricot. |
| Selected Work horizontal | Stage pinned at `top: 0` while the track travelled `−67px → −833px → −1718px → −2495px → −3227px`; the first card moved from x=666 to x=−2494 while the eighth came from x=3828 to x=668; counter announced "Piece 1 of 8" through "Piece 8 of 8". A capture caught the counter mid-roll between digits. |
| Why velocity skew | Peaked at 4.6° during wheel input, then decayed 4.601 → 2.962 → 1.480 → 0.672 → 0.291 → 0.085 → 0.013 → 0° over ~1.2s after input stopped, sampled every 120ms. |
| FAQ | All 7 panels `hidden` initially; clicking a question set `aria-expanded="true"`, unhid the panel and sprang the answer in (`opacity 0.92`, transform settled), leaving the other 6 closed. |
| Final CTA | Background scaled `1.235 → 1.152` as the section arrived; the button leaned `translate3d(12px, 7.1px, 0)` toward a cursor 90px away; badge animation running. |
| Header | Hid on scroll down (`top: −76`), returned on scroll up (`top: 0`); progress bar tracked position (`scaleX(0.60)`). |
| Reduced motion | Pin heights released, all four Differentiator panels at `opacity 1`, Selected Work track untransformed and vertical, hero media untransformed, marquee `animation: none`, every step / why-row / FAQ row at `opacity 1`, all hidden descriptors visible. |
| 390px | Fresh load at 390×844 (not a resize): every one of the nine sections measured `scrollWidth 390 = clientWidth 390`, and an attempted `scrollTo(500, y)` moved the page 0px sideways. Selected Work becomes a native horizontal swipe container; the Differentiator pin releases and stacks. |

One defect was found and fixed during this pass: the Why ledger's skew was gated on the section
being visible, so scrolling quickly past it left the ledger frozen mid-shear at ~3.9° instead of
settling. The guard was removed; the trace above is from the fixed file.

---

## A — Editorial

**A magazine, not a website.** Asymmetric columns, wide margins, hairlines instead of cards, and
type doing almost all of the work. Light grounds throughout; the page goes dark exactly twice (The
Differentiator and the Final CTA). Accent colour appears only as rules, drop caps, numerals and
italic phrases, never as fills. Five photographs in total, none shared with the live site.
Jost throughout, Instrument Serif Italic for accents, matching the live site.

### The running devices

- **Margin folios.** Every section carries its number (02 to 09) in a dedicated margin column to the
  left of the content, set in Instrument Serif Italic in terracotta with a short vertical rule that
  draws in. The folio is sticky, so it rides down the margin while the section is read. On phones
  it becomes a small running head above the section.
- **Hairline text links.** No buttons anywhere. Every call to action is a text link on a hairline
  with an italic arrow; on hover the hairline shortens and the arrow slides.
- **Drop caps** open the body copy of What We Do and Why Famysys.
- **Small caps labels** for eyebrows, table headers and run-in heads.

### Section by section

1. **Hero — an opening spread.** Headline at cover size across the full width, with "the agency
   overhead." in italic terracotta. Beneath it the layout splits unevenly: subhead and the two
   text-link CTAs in a narrow left column, a single tall 4:5 photograph (a film projector in haze)
   in the right five columns. The supporting line runs vertically up the left margin like a spine.
   The photograph hangs down past the section edge into What We Do. Not full-height, not dark, no
   mosaic.
2. **What We Do — an index.** Eyebrow, heading and a drop-cap paragraph in the left column with the
   "Explore All Services" link; the six capabilities on the right as a hairline-ruled index with
   lower-case roman numerals (i to vi) in the margin, title and one-line descriptor. No bordered
   plane, no watermark numerals, no hover curtain.
3. **The Differentiator — dark page one.** Heading with "creativity," in italic apricot. Body copy
   and the "At Famysys Studio, we combine:" lead-in in the left column, then the four elements as a
   lettered list (a to d, brass letters) with hanging descriptions. A 4:5 portrait (a person in red
   and blue light with a camera) fills the right columns. **The pull quote treatment:** the closing
   line "AI is our production advantage — not our identity." is set in large Instrument Serif
   Italic, indented one column, with a short apricot rule beside it; it arrives from the left
   margin as the reader reaches it.
4. **How We Work — run-in heads.** Heading top left, a small film-reel still top right. The five
   steps are set as two newspaper-style text columns: the step name is a small-caps run-in head
   followed by a short accent dash and the description in the same line, with the numeral (01 to
   05) hanging in the left margin. No pinning, no rail, no watermark.
5. **Ways to Work With Us — tabular matter.** The three tiers are rows in a hairline-ruled table:
   tier name large with the italic descriptor beneath, then summary, "Ideal for", "Typical work
   includes", and a "Talk to us" link, all as columns of type. Custom Creative Partnership follows
   as a footnote marked with a brass asterisk, its copy in two short columns. On phones the rows
   stack with small-caps labels. No cards, no bento.
6. **Selected Work — a spread, then a contents page.** A full-bleed 2:1 photograph (a hand holding a
   clapperboard on a white set) opens the section. Heading left, body right, then the eight pieces
   as a contents list: numeral, title in light display type, and the description right-aligned in
   italic. Rules draw in one after another. No image grid, no per-piece covers.
7. **Why Famysys — a glossary.** On the deeper-sand ground. Heading with "Without unnecessary
   overhead." in italic; a drop-cap paragraph and a small portrait photograph (a studio microphone)
   in the left column; the five reasons on the right as a definition list, each term in italic
   terracotta beside its description. No pinned stage, no cross-fading image panel.
8. **FAQ — an open Q&A.** "Questions" eyebrow and heading, then all seven questions and answers
   printed in two text columns, numbered 1 to 7 in italic, ruled between items. Nothing is
   collapsed; the sixth answer carries its "Talk to us about your project" link. No accordion, no
   sticky aside.
9. **Final CTA — dark page two.** On the lifted-forest ground. Heading at cover size with "Let's
   talk." in italic apricot, body copy left, and a single large italic "Start a Conversation" link
   on an apricot hairline to the right. The closing line sits at the foot in small caps with a
   jade square, the only use of the highlight colour on the page. No form panel.

**Masthead and colophon.** The header is a static masthead, not a fixed bar: wordmark left, nav in
small caps centred, "Start a Conversation" as a text link right, all between a heavy rule and a
double hairline. The footer is a colophon: wordmark, nav on one line, email, tagline and copyright
between two rules.

### Motion

Restrained and typographic. Every animation runs from an IntersectionObserver as the block enters.

- **Headings reveal line by line.** Text is split into lines at runtime (re-split on resize), each
  line clipped and rising into view 90 ms after the previous one.
- **Body copy fades in** with a 7 px rise, staggered 110 ms per block.
- **Hairlines draw left to right** — the masthead rules, every table row, index row, contents row,
  glossary row and FAQ item, staggered 70 to 80 ms per row. The folio's vertical rule draws
  downward.
- **Images fade in and settle** from scale 1.02 to 1.
- **The pull quote** in The Differentiator arrives from the left margin as the page's one
  editorial device.
- **One parallax:** the hero photograph moves a maximum of 24 px against scroll. Nothing else on
  the page tracks the cursor, lifts or floats.
- `prefers-reduced-motion: reduce` renders everything in its final state; nothing animates and the
  line splitting is skipped.

### Imagery

Five Unsplash photographs, inlined as data URIs (about 520 KB together), none used by the live site
(the clapperboard frame also appears in B): `photo-1478720568477` (projector, hero), `photo-1552168324` (person with camera in red and
blue light, Differentiator), `photo-1542204165` (film reels, How We Work), `photo-1515634928627`
(clapperboard on set, Selected Work), `photo-1478737270239` (studio microphone, Why Famysys).

### Verified

Opens from disk with no console errors; nine sections present; all reveals fire on scroll at
1440 px and 390 px; no horizontal overflow at 390 px; reduced-motion mode renders complete.

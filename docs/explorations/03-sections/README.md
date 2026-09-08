# 03-sections — the same three homepage sections, one set per direction

Each set redesigns How We Work, Ways to Work With Us and Selected Creative Work with one
strong idea per section. Copy is verbatim from the live content files; only the design
changes.

## set A — pinned & sequential

Set A of five. `set-A.html` opens straight from disk and reads the site's own images from
`public/media/` by relative path. Copy is verbatim from
`src/infrastructure/content/static/marketing.content.ts` and `portfolio.content.ts`; only the
design changes. Nothing here is built or served.

- **How We Work** — one dark full-height stage, pinned for five viewport-heights: a numeral at
  roughly a fifth of the screen with the step title and copy beneath it, a step index down the
  right and a progress rule along the bottom. Scroll advances the five steps as states rather
  than scrolling past them — panels cross-fade and lift by 2.75rem, the numeral drifts 26px
  across its own step, the rule fills by `scaleX` and the index marker steps down the list.
- **Ways to Work With Us** — the four tiers sit on one row instead of a grid: Launch, Grow and
  Scale at 36rem, then the Custom Creative Partnership at 54rem on the dark ground. The stage
  pins and the row translates sideways as the page scrolls down, one pixel of travel per pixel
  of scroll, so Custom arrives last and reads as the wider one.
- **Selected Creative Work** — the eight pieces in a two-column grid with the even column
  dropped by up to 7rem so the reveals stagger. Each cover is uncovered by a panel of the
  section's own ground sliding down off it, scrubbed by that piece's own position between 92%
  and 40% of the viewport height; the image counter-moves 6% behind it and the caption rises
  12px with the same value.

**Motion.** One shared `requestAnimationFrame` loop drives all three sections; scroll and resize
only mark the frame dirty. Every frame reads its rects before it writes any style, and only
`transform` and `opacity` are animated.

**Reduced motion.** The stylesheet's base state is the final, readable state — the pin, the
horizontal row and the masks live behind an `html.motion` class the script adds only when
`prefers-reduced-motion: no-preference` matches. Without it the five steps stack as a rule-
separated list, the tiers stack vertically at full width, and the eight covers are simply
uncovered. A `prefers-reduced-motion: reduce` block stands the motion layer down as well, in
case the preference changes after load.

**Verified** 2026-09-07, Chromium 1440×900, `file://`: motion layer active, all three sections
scrubbing (step 03 at mid-pin, rail at −784px of 1426px travel, masks mid-wipe on piece 06), no
console errors. One screenshot per section, mid-scroll.

---

## set B — depth & physical motion

Set B of five, and the counterpart to set A: where set A pinned and sequenced, this one is
spatial. `set-B.html` opens straight from disk and reads the site's own images from
`public/media/` by relative path — the five `process-*.jpg` frames, the four `tier-*.jpg` and
the eight `case-*.jpg` covers. Copy is verbatim from
`src/infrastructure/content/static/marketing.content.ts` and `portfolio.content.ts`, and the
`alt` text from `how-we-work.content.ts` and `ways-to-work.content.ts`. Nothing here is built or
served. None of set A's three devices reappears: no pin, no horizontal rail, no scroll mask.

- **How We Work** — a corridor. The five steps are cards at 420px intervals along the Z axis,
  each on its own lane across the frame, and the scroll flies the reader down it rather than
  stepping between states: a step swells and fades out as it passes the eye, and the next
  arrives out of the vanishing point. The nearest step holds full opacity for its whole turn and
  takes the highlight colour on its numeral; the section heading is held at the top of the stage
  so the corridor is never an unlabelled set of cards moving on their own.
- **Ways to Work With Us** — a deck. The four tiers are laid out for real — Launch, Grow and
  Scale across the top, then the Custom Creative Partnership at full width beneath them — and
  the motion only ever pulls that layout *back* into an overlapping stack and releases it. At
  rest the three tiers sit rotated and scaled down onto Custom, which never scales and stays the
  largest card at every point in the fan; scroll fans them out to their real positions, and so
  does the cursor entering the deck while it is still stacked.
- **Selected Creative Work** — a field. The eight pieces sit on springs in a four-column grid:
  the cursor draws the piece under it forward 74px on the Z axis and pushes its neighbours away
  from it, falling off over twice the grid's own pitch, and letting go lets everything drift home
  with its own momentum rather than snapping back. Nothing here is driven by scroll.

**Motion.** One shared `requestAnimationFrame` loop drives all three sections. Scroll and resize
only mark the frame dirty; the deck's fan and the field's springs keep the loop working until
they have settled, and then it idles. Every frame reads its rects before it writes any style,
and only `transform` and `opacity` are ever written — the depth cue is opacity, not a blur.

**Reduced motion.** The stylesheet's base state is the final, readable state: the corridor is a
list of five cards, the deck is its own grid, and the field is a plain grid of eight. The
corridor's sticky stage lives behind an `html.motion` class the script adds only when
`prefers-reduced-motion: no-preference` matches, and sections 2 and 3 need no motion CSS at all
because their motion is transforms written onto that layout. A `prefers-reduced-motion: reduce`
block stands the motion layer down as well, in case the preference changes after load.

**Verified** 2026-09-07, Chromium, `file://`. At 1440×900: motion layer active, all three
running (corridor mid-flight with step 03 at +126px and step 05 at 0.36 opacity, deck mid-fan
with the tiers at 0.69 and Custom at 1.0, field with piece 02 drawn 72px forward and its
neighbours pushed 26–30px), no console errors, no horizontal overflow. At 1440×900 with
`prefers-reduced-motion: reduce`: motion layer absent, corridor static, all five steps visible,
no overflow. At 390×844: no console errors, no horizontal overflow. One screenshot per section,
mid-scroll.

---

## set C — imagery leads, text recedes

Set C of five. Where sets A and B kept every sentence on screen, this one hands each section to
its pictures and holds the copy back until it is asked for. `set-C.html` opens straight from disk
and reads the site's own images from `public/media/` by relative path — the five `process-*.jpg`
frames, the four `tier-*.jpg` and the eight `case-*.jpg` covers. Copy is verbatim from
`src/infrastructure/content/static/marketing.content.ts` and `portfolio.content.ts`, with the
`alt` text from `how-we-work.content.ts` and `ways-to-work.content.ts`. None of set A's devices
(a pinned step sequence, a horizontal tier rail, a scroll-scrubbed mask) and none of set B's (a
Z-axis corridor, a fanning deck, a cursor-repelled field) reappears. Nothing here is built or
served.

- **How We Work** — five full-bleed frames, each taking the whole screen in turn. The frames are
  sticky siblings, so the next one climbs over the last rather than replacing it: the covered
  frame settles back 5.5% and darkens toward the ground under an opaque overlay, and the arriving
  picture rises 7% inside its own frame. On the picture there is only a numeral and the step name,
  in an opaque plate at the top of the frame where the incoming frame cannot reach it; the
  sentence is a second plate that opens out of it on hover, focus, or the button beneath the name
  for anyone without a pointer.
- **Ways to Work With Us** — four pictures on one row, three equal and the Custom Creative
  Partnership a little over half again as wide, each 80vh tall with nothing on it but its name in
  an opaque plate. Opening a tile slides its detail panel up over the lower 84% of the picture —
  descriptor, summary, both labelled rows and the CTA on the ivory ground — and the panel repeats
  the tier name, because it covers the plate it was opened from. One tile is open at a time; Esc
  and the panel's own Close both shut it.
- **Selected Creative Work** — the eight covers at full width, two to a row with no gutter between
  them, each in a window it is 24% taller than. Scroll moves each picture inside its own window,
  the left column downward and the right column upward, so the grid is never still while the page
  is moving. The reference and the title are a small plate under each cover; the intent line
  appears on hover or focus.

**Motion.** One shared `requestAnimationFrame` loop drives both scroll-linked sections; scroll and
resize only mark the frame dirty, and opening a tile is a class, not a frame. Every frame reads
its rects before it writes any style, and only `transform` and `opacity` are written.

**Reduced motion.** The stylesheet's base state is the final, readable state, and it is the one
that matters most in this set: every step sentence is on the page, every tile is open with its
detail below its picture, every intent line is visible, and no picture moves. The frames, the
tiles and the windows live behind an `html.motion` class the script adds only when
`prefers-reduced-motion: no-preference` matches, and a `prefers-reduced-motion: reduce` block
stands that layer down as well in case the preference changes after load.

**Text on photographs.** No copy sits directly on an image anywhere in the set. Every caption,
name, tag and revealed sentence is inside a fully opaque plate — `#12251F` with `#F1EBDD` text, or
the ivory detail panel — so contrast does not depend on what the photograph happens to be doing
behind it.

**Verified** 2026-09-07, Chromium 1440×900, `file://`: motion layer active, the stack mid-flight
(frames 01–02 settled to 0.945, frame 03 holding the screen), a tile opened by click with
`aria-expanded="true"`, the covers panning ±9% in opposite directions by column, the hidden copy
appearing on hover in both sections, no console errors and no horizontal overflow. With
`prefers-reduced-motion: reduce`: motion layer absent, every sentence, detail panel and intent
line visible, no overflow, no errors. One screenshot per section, mid-scroll.

---

## set D — generative and reactive

The last of these, and the only one where each section's main visual is *drawn at runtime* rather
than laid out. Where A was sequential, B spatial and C image-led, this one is alive: two canvases
generate what you see and both respond continuously to the cursor. `set-D.html` opens straight
from disk and reads the site's own images from `public/media/` by relative path — the five
`process-*.jpg` frames and the eight `case-*.jpg` covers; this set's tiers are typographic, so it
does not use `tier-*.jpg`. Copy is verbatim from
`src/infrastructure/content/static/marketing.content.ts` and `portfolio.content.ts`, with the
`alt` text from `how-we-work.content.ts`. None of set A's devices (a pinned step sequence, a
horizontal tier rail, a scroll-scrubbed mask), set B's (a Z-axis corridor, a fanning deck, a
cursor-repelled field) or set C's (full-bleed sticky frames, image tiles with opening panels, a
maximum-scale parallax grid) reappears. Nothing here is built or served.

- **How We Work** — the five steps stagger left and right down a 74rem measure, and a filament is
  drawn between them: a Catmull-Rom run through a port on each card, resampled to 260 points every
  frame, swaying on a pair of sines and pushed aside by up to 54px wherever the cursor comes
  within 260px of it. A signal rides the line — a lit window of samples, rose behind the head and
  jade ahead of it — positioned not at a fraction of the section but at whichever sample sits on
  the reader's eye line, so the node that lights is always the step being read.
- **Ways to Work With Us** — the four tiers on one row, Launch, Grow and Scale at 1fr and the
  Custom Creative Partnership at 1.45fr, as typographic cards rather than pictures. Behind them a
  flow field of ~1,400 short strokes points along the sum of a rolling base flow and four
  attractors sitting on the four cards. Considering a tier raises its attractor from 0.18 to 1, so
  the whole field turns to face that card and takes its colour — brass, claret, forest or jade —
  before anything has been clicked. The field stops below the heading and the cards are opaque, so
  no line of copy is ever read against it.
- **Selected Creative Work** — the eight pieces on a golden-angle spread relaxed until nothing
  overlaps, not a grid. Each drifts on its own slow cycle; the spread closes ranks (1.16× to
  0.92×) and turns about 10° as the section is scrolled; and the cursor *gathers* the pieces
  toward it rather than pushing them away, which is the inverse of set B's field. Five separation
  passes and a bounds clamp run after the gather every frame, so pieces never stack or leave the
  sheet.

**Motion.** One `requestAnimationFrame` loop for the file, and a section only computes while its
own box overlaps the viewport, so at most two of the three are ever working. Both canvases are one
viewport tall and stuck there, so a section three screens long still costs one screen of pixels a
frame; the flow field is bucketed by colour and weight into thirteen paths rather than one stroke
per segment. Everything that is not drawn is `transform` and `opacity`.

**Reduced motion.** Each canvas becomes one section-tall canvas drawn once, at 1× rather than 2×,
so the single static frame stays glued to the cards it connects instead of a frozen viewport-stuck
frame sliding against them; the filament's sway is dropped from that frame so it is the clean
spline through the ports. The chain stops staggering, and the contact sheet is its own four-column
grid — the layout the spread is applied on top of. Nothing is hidden, scrubbed or cursor-tracked.
A `prefers-reduced-motion: reduce` block stands the motion layer down as well, in case the
preference changes after load.

**Verified** 2026-09-07, Chromium, `file://`. At 1440×900: both canvases painting, filament
tracking the eye line (node 04 lit and the cursor bend visible at mid-section), the field turned
claret with Grow under the cursor, the sheet gathered with 0 overlapping pieces, no console
errors, no horizontal overflow. **Frame rate on a full scroll-through — 4,657px of page in 7.0s
with the pointer moving throughout — 60.0fps (420 frames / 7.00s).** At 1440×900 with
`prefers-reduced-motion: reduce`: motion layer absent, both canvases holding one static frame, all
eight pieces in the grid with 0 overlaps, every sentence visible, no overflow. At 390×844: no
errors, no overflow, the sheet falling back to its grid. One screenshot per section, mid-scroll.

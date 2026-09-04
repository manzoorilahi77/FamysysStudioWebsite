# Hero explorations — ten directions

`hero-designs.html` holds ten complete redesigns of the homepage hero, one after another,
each a full viewport tall with scroll room beneath it so its scroll behaviour has somewhere
to happen. Open the file directly — no build step, no server. Photography lives in `media/`
alongside it.

The copy is identical in all ten, word for word:

- **Headline** — Creative production, without the agency overhead.
- **Subhead** — Design, video, AI-powered content, motion and product visuals — produced by a
  flexible creative team that helps businesses create high-quality content efficiently and at
  better value.
- **Calls to action** — Start a Conversation · Explore Our Services
- **Supporting line** — Project-based when you need it. Ongoing when you need more.

Only the twelve palette colours appear anywhere in the file, and only Jost and Instrument
Serif Italic. What changes between the ten is everything else: composition, the scale and
weight of the type, which words take the serif italic, where the logo sits, how the
navigation behaves, and above all how the thing moves.

None of the ten repeats the current three-column drifting mosaic. Nothing here touches the
live site — `colors.ts`, the components and the pages are untouched.

---

## The ten

**01 · Aperture**
A single full-bleed plate with the headline centred over it; the wordmark sits in the middle
of a navigation split to either side of it.
*Six iris blades sweep open on load, rotating slightly as they clear. Scrolling pushes the
plate in and lifts the type away; a soft warm light tracks the cursor and the plate drifts
against it.*

**02 · Meridian**
An unequal split — paper and type across 64%, one tall dark plate down the remaining 36%,
with the navigation turned on its side along the left edge.
*The plate is uncovered by a panel wiping down over it while the headline rises line by line
and a hairline rule draws out. On scroll the plate travels against the type.*

**03 · Colossus**
Type at maximum size: four lines running edge to edge, imagery reduced to one small chip of
film reels tucked into the space beside them.
*Each line clips up from below with an overshoot, staggered. Scrolling drifts the lines apart
horizontally at four different rates, and they lean toward the cursor as it passes.*

**04 · Reel**
The type is pinned for three screens while a perforated filmstrip of seven production frames
runs behind it.
*Entry brings the frames up in sequence. Scroll scrubs the strip right to left across the
full pin, filling a progress rule and stepping a frame counter; hovering a frame brings it
forward and returns its colour.*

**05 · Stencil**
No photograph on the page — only the part of one that falls inside the letterforms. Three
SVG lines clip a single continuous plate.
*The lines unclip upward in sequence. Scroll and cursor both move the plate behind the type,
so the words act as a window onto the footage rather than a caption for it.*

**06 · Strata**
Six planes at six depths, from a full-bleed base through a colour band and two floating
cards to a hairline frame in front of everything.
*The planes arrive back to front. Cursor and scroll each drive every plane at its own rate,
so the hero has real depth; the cards take a highlight border and push in on hover.*

**07 · Scatter**
Kinetic type on cream — no photography at all, the headline is the image. The wordmark is
parked large at the bottom left, the navigation stacked at the top right.
*Six words fly in from off-screen with rotation and settle. The cursor pushes them aside and
they spring back; scrolling past throws them apart again along their own vectors.*

**08 · Ledger**
The structure is the design — a twelve by six grid drawn in hairlines with every element
locked to cells, three of which hold pictures.
*The verticals draw down and the horizontals across, then the cells load. On scroll the
picture cells step against the grid at different rates; hovering one floods it with ink and
brings up its label.*

**09 · Flux**
A live WebGL field behind the type: a hand-written fragment shader of layered flow noise in
the ink greens, with an ember of the primary accent and filaments of the highlight.
*Amplitude eases up from flat on load. Scroll drifts and compresses the field and lifts the
copy block; the cursor warps the flow toward the pointer.*

**10 · Margin**
Asymmetric editorial — the column starts a quarter of the way across, there is more air than
content, and a single tall plate bleeds off the top edge as the only focal point.
*A long stagger on load with the plate dropping in from above and an accent rule drawing out.
On scroll the plate keeps falling, the column rises against it, and the serif word slides out
of the left margin.*

---

## How the motion is built

One `requestAnimationFrame` loop drives all ten, not one per design. Section geometry is
measured on load, on resize, when images settle and when a `ResizeObserver` sees the document
change — never inside the frame, so no frame reads layout. Heroes outside the viewport are
skipped entirely. Every per-frame write is a `transform` or an `opacity`; entry animations are
CSS transitions with real easing curves, which keeps them off the main thread.

Scroll anchoring is disabled on `body`: with ten full-viewport sections all running entry
transitions, Chrome will otherwise nudge the scroll position mid-animation.

**`prefers-reduced-motion: reduce`** — the loop is never started, so there is no scrubbing and
no cursor tracking; every hero is put straight into its finished state; the shader draws one
frame and stops. Every design stays fully readable.

## Photography

Fourteen frames from Unsplash in `media/` — projection gear, a beam through smoke, a studio
microphone, cinema seats, a figure in coloured smoke, set lighting, a mic under a key light,
film reels, an ink bloom, an empty stage, a slate, stage lighting, an edit suite and a
scan-line plate. One or two people at most, no crews, no legible brand marks, and none of them appears on the live site.
All are graded in CSS towards the palette rather than used raw.

## Verified

Checked in Chrome, not headless-only, at 1440 × 900 and at 390 × 844.

| Check | Result |
|---|---|
| Entry animation fires | all ten. Hero 01 is in view on load and its iris was captured opening at 0.3 / 0.5 / 0.9 / 1.6 s; for the other nine a mid-entry frame differs from the settled frame by 8.7–38.3% of pixels |
| Scroll behaviour visible | all ten — 20.6–78.9% of pixels change over half a viewport of scroll (hero 04 is lowest at 20.6%, as intended: its type is pinned and only the strip moves) |
| Hover responds | all ten — 20.0–86.5% of pixels change in the button region |
| Frame rate, full nine-second scroll-through | **60.0 fps** with zero frames over 20 ms once warm. The first run after a cold load drops one to three frames while the browser uploads plate textures (56.7–59.4 fps); every run after that is 60.0–60.1 fps, worst frame 17.3 ms |
| Frame rate, parked on each hero and scrubbed | 60.0–60.3 fps on all ten, worst frame 17.2 ms |
| Frame rate at 390 px | 60.0–60.1 fps across three runs, zero frames over 20 ms |
| Console errors | none, at either width, with or without reduced motion |
| Copy identical across the ten | yes — headline, subhead, both CTAs and the supporting line all match |
| Colours outside the palette | none. Every hex, `rgb()` and shader `vec3` in the file resolves to one of the twelve (`#d10` in the report is the CSS id selector for hero 10, not a colour) |
| Reduced motion | no animation loop started, every hero in final state, shader drawn once, no errors |
| 390 px | all ten legible and unbroken; nothing clipped, nothing overlapping |

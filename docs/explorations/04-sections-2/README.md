# 04-sections-2 — set A

Two homepage sections redesigned, one strong idea each. Self-contained: open `set-A.html`
straight from disk. Images are referenced from `public/media/` by relative path, so the file
only works from inside this folder. Copy is verbatim from `src/infrastructure/content/static/`
(`services.content.ts` and `marketing.content.ts`); only the design differs.

## The two sections

**1 · What We Do** — A two-column split whose left column is a sticky rail carrying one
enormous numeral (up to 23rem), the active capability's name beneath it and a six-tick spine;
the six capabilities run down the right column as full-height rows on staggered indents rather
than equal grid cells. Scrolling moves the row nearest the 46% viewport line into the active
state — its descriptor rises into view, its title and numeral come to full strength, the row
slides left toward the rail — while the numeral it belongs to swaps in vertically (the outgoing
one leaves upward if it is earlier, downward if later) and the numeral stack drifts on a slow
scroll parallax; hovering a row overrides the scroll position.

**2 · The Differentiator** — A split on the dark ground: a sticky 4:3 stage on the left holding
all four element photographs stacked, each with its title and descriptor on an opaque coloured
panel (rose, mint, gold, claret) at the bottom-left, and the four element names as a tall list
on the right. Scroll or hover on the list changes the selection: the outgoing image cross-fades
while scaling from 1.06 to 1, its panel rises into place a beat later, and a coloured bar in the
selection's own tint wipes across the stage so the change reads as a transition rather than a
cut. The closing statement then arrives on its own full-bleed `sectionAlt` ground below the
split, four coloured rules opening outward above it and the sentence rising word by word, with
"not our identity" set in Instrument Serif italic.

## Verification

Chromium 1440×900, scrolled through once: both sections' motion runs, the hidden descriptors
appear on scroll and on hover, all four element images load, and the console is clean (no errors,
no page errors). One shared `requestAnimationFrame` loop drives both sections; every animated
property is a transform or an opacity. Under `prefers-reduced-motion: reduce` the rail is
dropped and each capability sits beside its own large numeral with the descriptor visible, the
stage becomes a static grid of all four element cards with their panels open, and the closing
statement and its rules are drawn in their final state.

---

# 04-sections-2 — set B

The same two sections, redesigned around continuous motion and a generated ground rather than
set A's structural numerals and moving split. Self-contained: open `set-B.html` straight from
disk. Copy is verbatim from `src/infrastructure/content/static/` (`services.content.ts` and
`marketing.content.ts`), images from `public/media/` by relative path.

## The two sections

**1 · What We Do** — The six capabilities are held in a drift field rather than a layout: two
counter-moving tracks of image cards on a `sectionWarm` band, each card carrying its numeral,
title and a descriptor waiting just below the frame. Nothing settles — the tracks run
continuously, every card bobs on its own sine phase, and a warm lens trails the cursor across
the band. Scroll velocity feeds the drift's speed and scrolling up reverses its direction;
cards within 300px of the cursor are pulled toward it, and pointing at one slows the whole
field to 8% while its caption slides up, its rule wipes out in claret and its frame scales.

**2 · The Differentiator** — A canvas particle ground is generated behind the four elements: up
to 430 points orbiting four anchors, one per element, tinted rose, mint, gold and ink and webbed
to their near neighbours. The field is pushed clear of the opaque cards so it wraps each one, and
it heats by cursor proximity — the nearest element's points brighten, tighten and gather around
it before anything is clicked, while its own card lifts, its rule draws and its descriptor slides
up. The closing statement is the resolution: its characters start scattered, rotated and scaled
down and spring into place one by one, and as they land the entire field abandons its four
anchors and collapses into a single mint rule beneath the sentence.

## Verification

Chromium 1440×900, scrolled through once: both sections animate, both respond to the cursor,
hidden copy appears on hover in both, and the console is clean — no errors, no failed requests.
A full scroll-through held **60fps** (59.8–60.1 measured across two passes). One shared
`requestAnimationFrame` loop drives both sections; only the section in view computes; everything
not drawn on the canvas is a transform or an opacity, and geometry is cached rather than read
per frame. Under `prefers-reduced-motion: reduce` the drift stops and becomes a static grid of
the six with every descriptor open, the ground draws one static frame, the closing statement is
already assembled, and no cursor tracking or scrubbing runs.

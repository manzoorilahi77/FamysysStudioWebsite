# Exploration 05 — Logo behaviour

`set-A.html` — six full-viewport heroes, stacked. Open it in a browser; there is no build step.

Everything in the hero is held constant across all six: the same headline, subhead, calls to
action, supporting line, navigation, right-hand accordion and bar-meter background. The only
thing that changes from one to the next is what the logo does, so the comparison is between
behaviours rather than between hero designs.

## The six

1. **Draw** — the mark is an outline in the hero and a solid lockup in the header. Its three
   closed paths are stroked with a dash offset; the wordmark, which cannot be dash-drawn because
   `pathLength` is undefined for text, resolves behind a hard-edged wipe. Driven by scroll: the
   ink of the same geometry floods left to right behind a second wipe, and the outline then
   retracts along its own length in the back half of the travel, so the header gets a solid mark
   and scrolling back re-opens the drawing along exactly the same lengths. The load-in is a
   one-shot that only gates the drawing and never moves anything. (An opacity crossfade between
   outline and fill was tried first and read as grey mud through the middle of the travel.)
2. **Disassemble** — the lockup is four parts with four different weights that separate, travel
   independently and re-lock at header size. Driven by scroll: each part's separation is
   `sin(π · p^weight)`, which is zero at both ends of the travel and widest in the middle, so the
   lockup is whole in the hero, whole in the header, and only ever apart in between. The exponent
   is the part's weight — the heavy ground square peaks late and barely moves, the light STUDIO
   line peaks early and throws itself furthest. The two inner squares are `darkBackground` cut
   into a light ground, so they vanish the instant they leave it; they carry an outline whose
   opacity is the same separation value, present only while they are detached.
3. **Mask** — the mark and the letterforms are a hole cut in one image, so the logo is a view onto
   the work rather than a shape on top of it. Driven by scroll: the travel is the usual progress,
   but the pan and zoom of the image behind the mask are taken from the block's raw scroll offset
   over its whole height, so the picture is still moving after the logo has finished docking. A
   hairline in `accentHighlight` keeps the shapes legible where the photograph goes dark.
4. **Trail** — the logo sheds echoes as it travels. Driven by scroll: a ghost is stamped whenever
   the scroll has moved the logo more than a set distance since the last stamp, so the spacing
   between ghosts is the distance the reader covered between frames — a fast flick lays them far
   apart and the trail reads long, a slow drag lays them almost on top of each other and it reads
   short. Each ghost then decays on its own clock.
5. **Type collapse** — the transition is typographic rather than a uniform scale. Every letter is
   its own element, placed at the x it occupies in the finished header lockup and centred on its
   own advance. Driven by scroll: tracking opens rightward from the word's stem — opening it
   symmetrically walks the first letters back into the mark, the one place with no room — alternate
   letters lift and rotate out of the line, and the weight thins from 560 to 250 — all of which
   resolve to nothing at the dock, where the letters are already at their final positions. STUDIO
   tracks the other way and closes up.
6. **Magnetic** — the logo leans toward the cursor throughout, and keeps doing so after it has
   docked. Driven by scroll for position and scale; the lean is a separate underdamped spring per
   axis whose target is the pointer's offset from the lockup's centre, so it overshoots and
   settles rather than following. The travel sets the lean's amplitude — 30px and 11° of tilt in
   the hero, 9px and 5° in the header — and both transforms compose into one transform string on
   one element.

## How the travel works in all six

The logo lives inside the masthead's brand slot and is displaced into the hero by a transform.
The docked state is therefore the *identity* transform rather than a computed position: it cannot
arrive short, arrive late, or drift. The hero's copy column holds a permanently-sized parking
space for the logo, so nothing moves when the logo leaves.

Position and scale are read from the scroll offset every frame, never from a threshold, so the
motion reverses exactly on the way back up. Only `transform` and `opacity` are written.

One `requestAnimationFrame` loop drives the whole page, including the bar-meter canvases, and only
the hero currently on screen computes anything.

Under `prefers-reduced-motion: reduce` there is no travel, no scale, no cursor tracking and no
trail: the hero has no large logo at all and each header logo renders in place at its normal size.

## Notes

- Imagery is the site's existing `public/media/` set, referenced in place. Nothing was added.
- Fonts are Jost and Instrument Serif Italic.
- Palette is the fixed set. `textMuted` (#212B25) is 1.07:1 on dark and appears only on light.

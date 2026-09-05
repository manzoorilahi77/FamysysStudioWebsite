# hero-final.html — the one hero

`hero-final.html` combines two designs from `hero-designs-4.html`: **10 Claret** supplies the
colour, the navbar and the type treatment; **11 Cinder** supplies the composition, the background
and the way the work is shown. Nothing was redesigned — both halves are lifted from that file.

**Final** — accent `#F0A8B8` serif italic at 8.39:1 on `#12251F`, button `#7E1B33` with a `#FCF8EE`
label at 9.47:1 (complementary, taken to both ends) · background: sixty-four bars on canvas whose
heights are the sum of three sines, with a bulge that swells at the cursor and a lift driven by
scroll speed · navbar: centred wordmark with links split either side and a bracket marker before
each (`cnav--brk`) · showcase: an accordion of five bands down the right, one open at a time, the
scroll stepping which one and the pointer taking it over · motion: masked line entry with a
staggered subhead, CTA and supporting line; the body block parallaxes and the navbar lifts and
fades on scroll; the meter answers the cursor with a playhead; the accent button rolls its label
and fills with a dark wash on hover, and both buttons are magnetic.

## The layout choice

Claret centres its type; Cinder puts the accordion down the right. **Type went left, Cinder's own
layout, with the accordion kept on the right.**

Centred type with the accordion pushed further right was the alternative and it was worse: the
accordion is 28vw of solid imagery, so centring the type inside the remaining 72vw puts the
headline's optical centre off the page's centre — it reads as a mistake rather than a decision.
Left-aligned type gives the headline a real edge to hang off, and the veil is a left-heavy
gradient that already carries the ground on that side. Claret's centred proportions do survive in
the type block: the same headline line-splits and stagger, the same button pair, the same
supporting line, with the body widened to `min(72ch, 48vw)` so the two CTAs sit on one line as
they do in Claret rather than stacking.

## What is in the file

- One `requestAnimationFrame` loop. One 2d context, one canvas element in the document, no WebGL.
- Geometry is measured on load, on resize, on image settle and on `document.fonts.ready` only, so
  no frame reads layout. Every per-frame write is a transform, an opacity, or a fill into the
  canvas.
- `prefers-reduced-motion`: the loop never starts, the hero is put in its final state and the
  meter is painted once. The accordion carries its own opacity entry rather than the shared
  `.fade`, because `.fade` is cleared with `transform: none` under reduced motion and that would
  take the accordion's vertical centring with it.
- Images are the five already used by Cinder, referenced from `media-4/`.
- Copy, fonts and palette are unchanged. `--muted` is not used on the dark ground.
- A `.runway` div gives the page the scroll room the hero needs to be seen responding on its own.
  Delete it and its rule when the hero is placed on a page that already has content beneath it.

## Verified in Chromium

| Check | Result |
|---|---|
| Entry | hero takes `.in` on load; headline lines at `matrix(1,0,0,1,0,0)` |
| Background alone | 22.1% of sampled pixels change over 700ms |
| Background under cursor | 32.4% change as the pointer crosses the frame; playhead follows |
| Accordion on scroll | steps 0 → 4 down the page and 4 → 0 back up |
| Accordion on hover | pointing at band 4 opens it: 264px against 59px for the closed bands |
| Button hover | label rolls (`translateY(-21.2px)`), wash arrives at `translateY(0)`, magnetic transform live |
| Frame rate | 60.0fps over a full scroll down and back, 326 frames, 0 over 20ms |
| 390px | document width 390 against a 390 viewport, no overflow, three bands in a row, 60.0fps |
| Reduced motion | 0 loop frames, hero in final state, 0.0% pixel change over 1.5s |
| Console | no errors at either width, in either motion mode |

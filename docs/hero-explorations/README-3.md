# Hero explorations, third set — ten live backgrounds

`hero-designs-3.html` holds ten more homepage heroes, following **09 Flux** from the first
set. Each one has a background that is drawn rather than placed, and every one of them
answers to both the scroll and the cursor. Open the file directly — no build step, no
server. Photography lives in `media-3/`.

**One thing to flag:** the brief asks me to open `hero-designs-2.html` and repeat nothing
from it. That file does not exist — the request to build it was interrupted before any work
started, so there is no second set on disk. This set was checked against `hero-designs.html`
only. If the second set gets built later it will need a pass against these ten.

The copy is identical in all ten, word for word:

- **Headline** — Creative production, without the agency overhead.
- **Subhead** — Design, video, AI-powered content, motion and product visuals — produced by a
  flexible creative team that helps businesses create high-quality content efficiently and at
  better value.
- **Calls to action** — Start a Conversation · Explore Our Services
- **Supporting line** — Project-based when you need it. Ongoing when you need more.

Only the twelve palette colours, only Jost and Instrument Serif Italic. Five navigations vary
the centred wordmark with split links; five do something else. All ten sit at the top of the
viewport. Nothing here touches the live site.

---

## The ten

### 01 · Lattice
- **Background** — canvas particle field: ~90 points drifting, linked to every neighbour
  inside a radius and to the pointer itself, so the web reorganises around the cursor.
- **Navbar** — centred wordmark, links split either side, small square markers.
- **The work** — four plates orbit the cursor at four different lags, trailing behind it on
  an ellipse.
- **Motion** — the link radius opens with scroll speed and the field drifts upward; the copy
  lifts and fades as the hero leaves; points push away from the pointer.
- **Balance** — background leads. The plates are small and kept behind a centre scrim,
  because a linked particle field is already a lot of movement.

### 02 · Cellwork
- **Background** — GLSL cellular field. Jittered cell seeds drift on their own clocks and
  lean toward the pointer; the cell edges pick up the highlight and the interiors carry an
  ember of the primary accent.
- **Navbar** — a rail turned on its side down the left edge, wordmark at its head.
- **The work** — one plate, cross-fading between three on a 3.2-second interval, with a
  counter beneath it.
- **Motion** — cell scale and drift speed rise with scroll velocity; the copy and the plate
  part company on scroll; the seeds pull toward the cursor.
- **Balance** — background leads. One plate on a timer, deliberately, so the field is the
  thing you watch.

### 03 · Refract
- **Background** — GLSL glass distortion, and the plate is the background. A flow field warps
  the sampled image and a lens follows the pointer with a stronger local displacement.
- **Navbar** — centred wordmark, diamond markers, a hairline beneath, and the whole bar rides
  up out of frame as you scroll.
- **The work** — three plates behind the glass, swapped at scroll thirds, with a marked index
  down the right.
- **Motion** — refraction strength and vertical drift track the scroll; the lens tracks the
  pointer; the copy lifts and fades out.
- **Balance** — fused. The imagery and the background are the same object.

### 04 · Beacon
- **Background** — canvas projector sweeps: four soft beams pivoting from a common origin,
  with a drifting dust field in front of them. The origin follows the pointer horizontally.
- **Navbar** — wordmark left, a Menu trigger right that opens the links in place on hover or
  focus rather than a full bar.
- **The work** — five plates squared into a deck that fans out under the cursor, staggered.
- **Motion** — beam angle and spread open with scroll speed, dust rises faster with it, the
  deck parallaxes against the copy.
- **Balance** — shared. The beams are broad and slow, so the deck can hold its own.

### 05 · Broadcast
- **Background** — canvas scanlines, grain and a ghosting offset over a single still: the
  frame is drawn three times, the two ghosts separating further the further the pointer is
  from centre, then striped and grained, with a slow bright band running down it.
- **Navbar** — centred wordmark, round markers, hairline separators between links.
- **The work** — half the frame is imagery, permanently, with a five-line shot list on the
  right that steps as the hero passes.
- **Motion** — scanline phase and the head-switch band run continuously; grain strength and
  plate offset ride the scroll; the ghost separation is pure cursor.
- **Balance** — imagery leads. The treatment sits on the photograph rather than behind it.

### 06 · Meshwork
- **Background** — GLSL wireframe surface displaced in three dimensions: fractal noise plus a
  ripple that radiates from the pointer, drawn in perspective as line geometry.
- **Navbar** — a full-width bar that collapses into a centred pill as you scroll, the two
  states cross-fading.
- **The work** — a nine-frame contact sheet at a tenth of its opacity everywhere, at full
  strength only inside a circle that follows the cursor.
- **Motion** — mesh amplitude and tilt track the scroll; the ripple origin is the pointer;
  the sheet parallaxes against the copy.
- **Balance** — shared, with a scrim between them. The lens is the only place the imagery is
  loud.

### 07 · Prism
- **Background** — three screens of ruled bands on canvas, each turning at its own rate; where
  two cross at a shallow angle they beat against one another, and two soft bodies sit behind
  them. No shader — plain rectangles, which is why it holds 60 with three full-frame screens.
- **Navbar** — centred wordmark, hairline markers, no divider.
- **The work** — a carousel driven by scroll *velocity* rather than position: it accelerates
  as you scroll and coasts to a stop when you do, with a meter showing the speed.
- **Motion** — screen angles turn continuously and swing further with scroll; the bodies
  follow the pointer; the carousel is pure inertia.
- **Balance** — imagery leads. The screens are a texture, not an event.

### 08 · Assembly
- **Background** — canvas long-exposure light trails: two dozen emitters running curved paths
  over a slowly fading plate, bending toward the pointer inside 520px, with the exposure
  blooming where the pointer is.
- **Navbar** — two tiers. The wordmark row holds; the links row slides up and away on scroll.
- **The work** — twelve tiles of one frame, scattered and rotated, converging into register
  as the hero centres and coming apart again as it leaves.
- **Motion** — trail speed rises with scroll velocity; the tiles are the scroll indicator;
  the trails curve toward the cursor.
- **Balance** — imagery leads. The trails are the quietest background of the ten by design —
  they accumulate rather than flicker.

### 09 · Diffusion
- **Background** — canvas ink into paper. Each blot is six hard-edged discs laid down again
  every frame around a drifting centre, so the edge creeps outward the way ink does. The
  cursor injects; the scroll sets the rate and the direction of the drift.
- **Navbar** — centred wordmark, bracket markers, the widest letter-spacing of the ten.
- **The work** — nothing is shown until you point at it: four labelled zones, each holding
  one plate that exists only on hover.
- **Motion** — injection rate rises with scroll speed and the ink drifts against it; the copy
  floats on the pointer.
- **Balance** — background leads. The imagery is deliberately absent until asked for.

### 10 · Signal
- **Background** — GLSL signed-distance field: a circle, a rounded box and a hexagon folded
  into one another with a smooth minimum, the blend radius breathing, contoured in rings and
  centred wherever the pointer is.
- **Navbar** — wordmark left, links right, and a hairline beneath the bar that fills as the
  hero is scrolled.
- **The work** — a column of plates in perpetual transit; the scroll changes its speed and
  reverses it, and an arrow says which way it is running.
- **Motion** — the SDF morph rate and the ring phase track the scroll; the field centres on
  the cursor; the column never stops.
- **Balance** — background leads, with the column as a steady counterweight rather than a
  focal point.

---

## Ten backgrounds, one WebGL context

Four designs draw in GLSL — 02, 03, 06 and 10. They share **one** `WebGLRenderingContext`,
total, for the life of the page:

- a single `<canvas>` is created once and re-parented into whichever of the four is on screen;
- each design keeps its own compiled program in that context, and all four are compiled at
  load rather than the first time they scroll into view, because a shader compiled mid-scroll
  is a 200ms frame;
- nothing is ever destroyed and re-created, so there is no context loss and no thrash.

Five designs use a cheap 2d context each (01, 04, 05, 08, 09) and are stepped only while they
are the hero in front. 07 needs no shader at all. The count is asserted in the verification
below by wrapping `HTMLCanvasElement.prototype.getContext` before the page loads: **1 WebGL
context created, 7 2d contexts** (six backgrounds plus one 128px noise tile).

**Reduced motion** needs each of the four GLSL heroes to show a frame at once, which a single
shared canvas cannot do. So under `prefers-reduced-motion` each one is drawn once into the
shared context and the pixels are copied into a still canvas of its own, and the shared canvas
is then removed from the document. The loop never starts, nothing scrubs, nothing tracks.

The rest of the engine follows the first set: one `requestAnimationFrame` loop for the whole
file, geometry measured on load / resize / image-settle only so no frame reads layout, every
per-frame write a transform or an opacity, heroes outside the viewport skipped, and
`overflow-anchor: none` on the body so Chrome does not nudge the scroll mid-animation.

## Photography

Eleven frames in `media-3/` — a white cyc stage, colour bars, a projector lens, a grading rig,
a selects desk, a black-backdrop set, a fresnel, an edit timeline, colour wheels, a camera on
set and an edit monitor. One or two people at most, no crews, no legible brand marks, and
**none of them appears in the first set** (asserted below). Each is sized to the largest place
it is actually drawn — most of them are shown at 250–470px — and all are graded in CSS toward
the palette rather than used raw.

Three of them are additionally embedded as small data URIs, because a `file://` image taints
a WebGL context and `texImage2D` refuses it — design 03 would go blank the moment the file is
opened by double-clicking. The shader is distorting them anyway.

## Verified

Checked in Chrome, headed, at 1440 × 900 and 390 × 844.

| Check | Result |
|---|---|
| Entry animation fires | all ten — a frame 260ms in differs from the settled frame by **3.4–50.7%** of pixels |
| Background is alive with nothing else touched | all ten — over 2.4s parked and still, **1.0–62.9%** of pixels change. 08 is the floor at 1.0%: long-exposure trails accumulate rather than flicker, which is the point; its cursor response below is what proves it running |
| Scroll changes the frame | all ten — **59.5–86.6%** of pixels change over half a viewport |
| Cursor changes the frame | all ten — moving the pointer corner to corner changes **4.7–41.1%** of pixels with nothing else touched |
| Hover responds | all ten — **17.6–64.2%** of pixels change in the button region |
| Frame rate, parked on a hero and scrubbed ±30% | **59.2–60.2 fps**, worst frame 17.2ms on eight of the ten |
| Frame rate, 9-second flick through the whole page | **59.0–59.5 fps** warm, 3–4 frames over 20ms, all at hero boundaries where the shared canvas is re-parented. The first pass after a cold load is 54.7 while plate textures upload |
| Frame rate at 390px | **60.0 fps**, worst frame 33.3ms |
| Live WebGL contexts | **1**, counted by wrapping `getContext` before load. 11 canvas elements, 7 2d contexts |
| Console errors | none — at either width, with or without reduced motion |
| Copy identical across the ten | yes — headline, subhead, both CTAs and the supporting line all match |
| Colours outside the palette | none. Every hex and `rgb()` resolves to one of the twelve. Two reported hits are not colours: `#e10` is the CSS id selector for hero 10, and `vec3(0.299,0.587,0.114)` is the luma coefficient in 03's shader. Shader colours are palette constants combined by `mix` and scaling, which is tinting, not a new hue |
| Images shared with the first set | none |
| Reduced motion | loop never started, every hero in final state, all four GLSL stills painted at full size, no errors |
| 390px | all ten legible and unbroken, document width 375 against a 390 viewport — no horizontal overflow |

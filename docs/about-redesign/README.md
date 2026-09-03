# /about — redesign proof

Evidence for the About redesign: eight sections, six images, motion on every section, and
the two-pass contrast check. Everything here was measured against the **static export**
(`npm run build`, then `node vr-serve.mjs 3100`), which is the artifact the site ships —
not against the dev server.

`verify-about.mjs` is the script that produced it. Run it from this directory with the
export being served on port 3100:

```
npm run build
node vr-serve.mjs 3100          # from the repo root, in its own shell
node docs/about-redesign/verify-about.mjs docs/about-redesign
```

It exits non-zero on any failure and prints one line per check.

## What it checks, and what the last run said

| Check                                                                                    | Result                                                                     |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Every section hidden **before** it enters and resolved after (per section, not per page) | 7 of 7 scroll sections pass; the belief statement passes on its load probe |
| axe (WCAG 2.0/2.1/2.2 A + AA) at 390 and 1440, sampled at three scroll positions each    | 0 violations                                                               |
| Horizontal overflow, 360–1920, after scrolling the whole page                            | none at any width                                                          |
| Reduced motion: every reveal target at its final state before any scrolling              | 170 targets, 0 not final, 0 carrying a delay                               |
| Rendered copy: no digits, no premises/award/scale vocabulary                             | clean                                                                      |
| Console and page errors                                                                  | none                                                                       |

**Why the belief statement is probed differently.** It is the one section that is inside
the first screen at every viewport — the hero holds 60svh and the statement's own padding
puts it about 700px down at a 900px viewport. A scroll reveal there would never play, so
it arrives on load through a keyframe instead, and the script proves it by reloading and
sampling its opacity at document commit (0) against its settled value (1).

**A full-page screenshot is not motion evidence.** `full-1440.png` and `full-390.png` are
here for layout and colour only. The motion evidence is the per-section before/after
measurement above, plus the three mid-scroll frames below, each taken ~260ms after a jump
so the frame catches reveals in flight.

## The images

| File                      | What it shows                                                                    |
| ------------------------- | -------------------------------------------------------------------------------- |
| `mid-1-approach.png`      | Mid-scroll, the claims section arriving                                          |
| `mid-2-inputs.png`        | Mid-scroll, the three-inputs row arriving                                        |
| `mid-3-building.png`      | Mid-scroll, the build-order ledger arriving                                      |
| `crop-hero.png`           | Hero and the belief statement below it                                           |
| `crop-claim-workflow.png` | The second claim, after the ratio and alignment fix below                        |
| `crop-inputs.png`         | The three inputs, settled                                                        |
| `crop-input-hover.png`    | The locked card hover — accent border, 6px lift, no shadow                       |
| `crop-building.png`       | The build-order ledger with its sticky header column                             |
| `crop-ecosystem.png`      | The one section that breaks the container: the image bleeds to the viewport edge |
| `crop-direction.png`      | Ambition and present position as offset columns                                  |
| `full-1440.png`           | The whole page, settled, at 1440                                                 |
| `full-390.png`            | The whole page, settled, at 390                                                  |
| `reduced-motion-top.png`  | The page with `prefers-reduced-motion: reduce`                                   |

## The claim rows, after review

The second claim's frame started as a 3:4 portrait, for variety against the two landscape
ones. In a five-column slot that is a 660px image beside roughly 300px of copy, so the
words ended a third of the way down the row and the rest of the column was empty — the
picture stopped being an image beside a claim and became a column of blank space under
one. Two changes: every claim frame is 4:3 now, and the copy is centred against the image
instead of top-aligned, so the leftover height is split above and below the words. The
image keeps its drop, which is what makes the split asymmetric in the first place.

Mixed ratios are worth having where the images are a set the eye compares, as in the
homepage mosaic. Here each image is alone in its own row, and the only thing a taller one
changes is how much emptiness sits under the text beside it.

## Two things the verification caught

**A horizontal scrollbar on a phone, from motion that had not played yet.** The three
input panels arrive from three directions; below `md` they are a single stacked column, so
a panel waiting 32px to the left or right of a full-width column was 32px wider than the
viewport — +8px of document scroll at 390, present only until the panels arrived. Below
`md` all three now rise instead.

**Headings resolving on scroll under reduced motion.** `RevealHeading` dropped its clip and
its per-line delays under the preference, but the heading as a whole still arrived at
opacity 0 and resolved as it entered — a scroll-triggered change of appearance, which is
what the preference asks a page not to do. It now renders resolved under the preference.
That fix is site-wide, not About-only, and changes nothing on the default path.

# Hero colour variants — client preview

`hero-variants.html` is a single self-contained file (images inlined, no build step —
double-click to open). It reproduces the homepage hero as it currently renders — layout,
copy, type, mosaic imagery, and all motion: the logo scroll travel (0–180px, reversible),
the mosaic drift, the line-by-line headline reveal, the fade-up subhead/CTAs, the button
label roll, and the nav underline/chevron hovers.

**Nothing overlays the hero.** The switcher (swatches + hex readout + one row per set)
sits below it; clicking recolours the hero above. The logo lockup follows the geometry of
`public/brand/famysys-studio-logo-canvas.png`: sharp-cornered square mark with two stepped
square cutouts, and "STUDIO" right-aligned so its final letter ends flush with the
wordmark's right edge. It is drawn in HTML/CSS (not the PNG) because a gradient can only
clip to live text.

Three values change per set — the shared hero/navbar ground, the three-stop gradient (on
"STUDIO" and the serif italic headline words), and the solid button fill. The gradient is
applied inline per element on every switch: Chromium does not reliably repaint
`background-clip: text` when only an inherited custom property changes.

Contrast floors, all verified programmatically: button label ≥ 4.5:1 against its fill, and
**every** gradient stop ≥ 4.5:1 against its ground (STUDIO renders small).

| # | Background | BG | Gradient | Button | btn ratio | weakest stop |
|---|-----------|----|----|----|----|----|
| 01 | Deep plum | `#351437` | apricot→rose→lilac `#FFAF87 #FF8FAE #D9A8FF` | gold `#EFB43C` | 8.62 | 7.49 |
| 02 | Warm chocolate | `#2E1B10` | cream→caramel→rose `#FFD9A0 #F5A26B #E895B5` | mint `#8FD9C6` | 9.22 | 7.34 |
| 03 | Saturated indigo | `#1E1B63` | cyan→periwinkle→pink `#7FD4FF #A3A8FF #FF9BE0` | yellow `#FFC933` | 9.81 | 6.90 |
| 04 | True black | `#000000` | hot pink→violet→ice `#FF6FD8 #A57BFF #4DD8FF` | white `#FFFFFF` | 21.00 | 6.88 |
| 05 | Oxblood | `#470E1B` | peach→coral→orchid `#FFC9A3 #FF9E9E #F2B8DE` | antique gold `#D9A441` | 6.93 | 7.90 |
| 06 | Charcoal teal | `#12333A` | sea-glass→aqua→periwinkle `#9BE8C8 #7FD9E8 #C9C3FF` | coral `#FF8A5C` | 7.30 | 8.16 |
| 07 | Blush | `#F9E8E7` | berry→plum→cobalt `#9F1239 #86198F #1D4ED8` | berry `#9F1239` | 7.26 | 5.66 |
| 08 | Sand | `#EAE0CC` | rust→wine→pine `#9A3412 #8E1B4F #14665A` | rust `#7A2E0E` | 8.56 | 5.21 |
| 09 | Cool paper | `#E9EEF2` | petrol→iris→magenta `#0E7490 #4F46C9 #B01E68` | petrol `#16597B` | 7.00 | 4.59 |
| 10 | Pale lilac | `#EFE9F9` | magenta→violet→cobalt `#B41777 #6822C9 #1D4FD8` | violet `#5B21B6` | 7.85 | 5.31 |

Six dark grounds in genuinely different territories (plum, chocolate, indigo, black,
oxblood, charcoal-teal) and four light (blush, sand, cool paper, lilac). Each gradient is
designed for its own ground: warm sunsets over plum and oxblood, caramel over chocolate,
sea-glass over teal, jewel tones deepened over the light papers.

This file changes nothing on the site — `colors.ts`, the pages, and the components are
untouched.

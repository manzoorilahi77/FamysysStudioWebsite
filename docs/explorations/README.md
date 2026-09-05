# Design explorations — index

Everything in this folder is a **design exploration**: a self-contained HTML artifact you open
straight from disk. None of it is built, none of it is served, and none of it is shipped. The
live site is `src/` and only `src/`.

This index exists so nobody has to open eleven files to find out which one is current. Each
artifact below is marked with what it is, when it was made, and what happened to it.

**Read this first, if you read nothing else:**

| Question | Answer |
| --- | --- |
| Which hero did the client choose? | **`01-heroes/hero-final.html`** — Claret's colours, navbar and type treatment combined with Cinder's background, composition and accordion, both taken from `hero-designs-4.html`. It is **in production**: see `src/presentation/sections/Hero.tsx`. |
| Which palette is live? | **Kiln** (`03-colour/palette-b/`) for the nine grounds and neutrals, with the **Claret accent pair** from the chosen hero replacing Kiln's own terracotta accents. The live values are in `src/shared/design/colors.ts`, block 2. |
| Which homepage direction was chosen? | **None.** All four are unadopted alternatives. The live homepage keeps its own section order (`src/app/page.tsx`); the hero is the only exploration that reached production. |

Opening an artifact: double-click it. No build step and no server. Where a folder of
photography sits beside an HTML file, the file references it with a plain relative path, so
**the media folder has to stay next to its artifact** — move one without the other and the
images vanish.

---

## 01-heroes

Four rounds of hero design, then the one that was built.

| Artifact | Media | Made | What it is | Outcome |
| --- | --- | --- | --- | --- |
| `hero-designs.html` | `media/` | 2026-09-04 | Ten complete hero redirections — Aperture, Meridian, Colossus, Reel, Stencil, Strata, Scatter, Ledger, Flux, Margin. Identical copy in all ten; everything else varies. | Superseded. Flux (09) prompted the third set. |
| `hero-designs-3.html` | `media-3/` | 2026-09-04 | Ten heroes whose backgrounds are **drawn rather than placed** — particle fields, GLSL cellular and glass and SDF, projector sweeps, scanlines, light trails, ink diffusion. Four shaders share one WebGL context. | Superseded. (There is no set 2 — that round was interrupted before any work started.) |
| `hero-designs-4.html` | `media-4/` | 2026-09-05 | Twelve accent-and-background pairings. **The set the client chose from.** Two of the twelve — 10 Claret and 11 Cinder — were combined into the final. | **Source of the approved design.** No README of its own; the two chosen designs are described in `README-hero-final.md`. |
| **`hero-final.html`** | `media-4/` | 2026-09-05 | **THE APPROVED HERO.** See below. | **Built.** |
| `hero-variants.html` | inlined | 2026-09-02 | Ten colour treatments — six dark grounds, four light — of the *previous* hero (the three-column drifting mosaic). Client preview, images inlined, one file. | Superseded twice over: both the hero and the palette moved on. Kept as the record of the colour conversation. |

Their write-ups are `README-hero-designs.md`, `README-hero-designs-3.md`,
`README-hero-final.md` and `README-hero-variants.md`. Each one carries its own verification
table — frame rates, contrast ratios, reduced-motion behaviour, what was checked in which
browser at which width.

### What "the client chose" means, precisely

From `hero-designs-4.html`:

- **10 Claret** supplied the **colour** — accent `#F0A8B8` for the serif italic on the dark
  ground, button `#7E1B33` with a `#FCF8EE` label — the **navbar** (centred wordmark, links
  split either side, a bracket marker before each) and the **type treatment**.
- **11 Cinder** supplied the **background** (sixty-four canvas bars whose heights are the sum
  of three sines, bulging at the cursor, lifting with scroll speed), the **composition**, and
  the **accordion** (five bands down the right, one open at a time, stepped by scroll and
  taken over by the pointer).

Nothing was redesigned in the combining. The one decision that was neither design's was the
type alignment: Claret centres its type, and centring inside the 72vw the accordion leaves
puts the headline's optical centre off the page's — so the type went **left**, Cinder's own
layout, with the accordion kept on the right. `README-hero-final.md` has the reasoning.

Both accent values were then adopted **site-wide**, not just in the hero, which is why
`colors.ts` carries the Claret pair on top of Kiln's grounds.

**Where it lives now:** `src/presentation/sections/Hero.tsx` (the `.hero-final-*` classes),
`src/presentation/hooks/useHeroMotion.ts`, styles in `src/app/globals.css`, and the five band
images at `public/media/hero-band-*.jpg` — which came from `01-heroes/media-4/` and are
stand-ins with no recorded licence. That is an open item in `docs/content-todo.md`.

---

## 02-homepages

Four full-page alternatives to the homepage. All carry the same client copy, read from
`src/infrastructure/content/static/`. **None was adopted.**

| Artifact | Media | Made | Direction |
| --- | --- | --- | --- |
| `a-editorial.html` | inlined | 2026-09-02 | Editorial. Jost / Instrument Serif. |
| `b-kinetic.html` | `media-b/` | 2026-09-03 | Kinetic. Syne / Manrope. |
| `b-showcase.html` | `media-showcase/` | 2026-09-03 | Showcase — the technically ambitious one: shader hero, pinned canvas sequence, drag gallery, contextual cursor. Bricolage Grotesque / Instrument Sans. Dark-dominant. |
| `c-brutalist.html` | inlined | 2026-09-02 | Brutalist grid. |

`README.md` in that folder is the full section-by-section write-up of all four.

---

## 03-colour

Palette evidence, all captured at 1440 against the static export in `out/`.

| Folder | Palette | Outcome |
| --- | --- | --- |
| `palette-a/` | **Voltage** — aubergine and electric magenta | Rejected |
| `palette-b/` | **Kiln** — deep forest-petrol and warm sand, originally with burnt terracotta accents | **Adopted, grounds and neutrals only.** The terracotta accent pair (`#A6381D` / `#E5906A`) was rejected and later replaced by the hero's Claret pair. |
| `palette-c/` | **Ultraviolet** — warm near-black and electric violet | Rejected |
| `palette-d/` | **Glacier** — neutral graphite, ice blue, silver | Rejected |

All four dated 2026-09-02. A and B carry a README with the full twelve-value table; C and D
are screenshot sets only — seven routes at four scroll offsets each, plus close-ups.

The four loose screenshots at the top of the folder are a different proof: they show that
`colors.ts` **actually drives the built site**. One line was changed (`accentPrimary` to a
red), `pnpm build` was run, nothing else was touched, and the accent moved everywhere
including the derived hover fill. The change was reverted after the capture.

Regenerate any of it with `node scripts/verify/vr-colour-shots.mjs` and
`node scripts/verify/vr-colour-detail.mjs` against `node scripts/verify/vr-serve.mjs 3100`.

For how to change a colour — the plain-English version — see `docs/changing-colours.md`.

---

## What is *not* here

- **`docs/spec/`** — the design spec and the historical decision records, including the
  `/about` redesign proof. Those describe what shipped; this folder describes what did not.
- **`docs/content-todo.md`** — the live list of what the client still owes.
- **`docs/deployment.md`** — how the site reaches the host.

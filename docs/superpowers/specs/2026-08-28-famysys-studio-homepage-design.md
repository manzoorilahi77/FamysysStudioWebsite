# Famysys Studio — Homepage Build Spec

Status: approved pending final user sign-off on this document.
Scope: homepage only (`/`), Next.js 15 App Router marketing site for Famysys Studio.

## 1. Objective

Build the homepage for Famysys Studio (video design / creative production arm of Famysys)
following Superside's layout, section order, density, and motion as the structural reference,
and famysys.com's real design tokens for all visual identity. Superside decides **where things
go and how they move**. Famysys decides **what it looks like**. No Superside copy, imagery,
client names, testimonials, or stats are reused — all content is original and placeholder media
is generated locally.

## 2. Design Tokens

All values below were pulled from the live famysys.com compiled CSS bundle
(`/_next/static/css/*.css`) and the rendered DOM, not guessed. Each is tagged **measured** or
**derived**. Fallback placeholder values from the original brief are discarded in favor of these.

All ratios in this section were computed programmatically (Node, standard WCAG relative-luminance
formula) against real measured hex/opacity values pulled from the bundle — not hand-calculated,
and not re-guessed. Values are exact to 3 decimals; treat ±0.01 as rounding noise, not signal.

### 2.0 SUPERSEDED — the client's official brand palette replaced the measured colors

> **Read this before anything else in §2.** On 2026-08-30 the manager issued the official brand
> palette. It supersedes every hex value recorded in §2 below.
>
> | Role | Brand value | Was (measured) |
> |---|---|---|
> | ink | `#0B2C4D` Deep Enterprise Blue | `#0F2A4A` |
> | graphite | `#24282C` Graphite Charcoal | `#2C2E33` |
> | canvas | `#F4F1E8` Warm White | `#F7F5F2` |
> | accent | `#1C50FF` Electric Blue | `#1E6FFF` |
>
> Jost is unchanged. The `ink-*` and `canvas-*` opacity ramps keep the same alpha steps; only the
> base color moved. **`src/shared/design/tokens.ts` is the live source of truth**, and the current
> contrast audit lives in `README.md` under "Design tokens". The rest of §2 is kept as the record
> of how the original palette was derived and why each rule exists — the *reasoning* still stands,
> the *numbers* do not.
>
> Three findings from the re-audit against the brand palette, because they reverse decisions
> §2.1b and §2.1c argue for:
>
> - **Accent now works as text on canvas** (5.107:1, up from 4.043:1). §2.1c moved eyebrows off
>   accent because of that failure; they are accent again.
> - **Accent now works as a solid fill** (canvas text on accent, 5.107:1; white on accent,
>   5.768:1 — both were failing). §2.1b's "never a solid fill" rule is lifted for the light-surface
>   primary button, which is accent-filled. It still holds on dark, where an accent fill separates
>   from its ink ground by only 2.457:1.
> - **Accent got *worse* on ink**, not better: 2.457:1, down from 3.291:1, now failing even the
>   3:1 non-text floor. The lightened `accentOnDark` variant §2.1c introduced is therefore still
>   required — re-derived from the new accent as `#7995F5` (5.015:1) — and its scope widened from
>   text to every accent role on a dark surface, focus rings and hover borders included.
>
> **Deviation 5 — a second typeface. PENDING MANAGER APPROVAL.** The brand rules specify Jost with
> a fallback stack and no second face. **Instrument Serif Italic** (Google Fonts, free for
> commercial use) is loaded via `next/font` as `--font-instrument-serif` and exposed to the token
> layer as `type.displayAccent` / `--font-display-accent`. It is a display accent only, scoped to
> `RevealHeading`'s `accent` prop, and appears in exactly four places on the page — the close of the
> hero headline, one word in The Differentiator's heading, two in the thesis line, two in the final
> CTA heading. It is set 5% up on the surrounding Jost (`type.displayAccentScale`), because serif
> italic reads optically smaller at the same px; line-height stays the heading's. It must never
> reach body copy, card titles, eyebrows, nav or buttons, and the verification pass fails the build
> if more than five accent phrases appear or if one lands in a banned context. **If the manager
> declines this, delete the `Instrument_Serif` import in `src/app/layout.tsx`, the
> `.text-display-accent` rule, and every `accent={[...]}` prop — nothing else depends on it.**

### 2.1 Measured — colors (HISTORICAL — see 2.0)

```ts
// src/shared/design/tokens.ts
export const color = {
  canvas:   '#F7F5F2', // measured — famysys.com --color-canvas, matches meta theme-color
  ink:      '#0F2A4A', // measured — famysys.com --color-ink. HEADINGS ONLY (h1–h3 use text-ink
                        // directly on the live DOM). Not the body-copy color — see 2.1a.
  graphite: '#2C2E33', // measured — famysys.com --color-graphite. Full-opacity graphite is NOT
                        // the running body-text color either (see 2.1a) — reserved for eyebrows.
  accent:   '#1E6FFF', // measured — famysys.com --color-accent (blue, not red-orange). Never used
                        // as a solid fill anywhere on the live page — buttons are bg-ink (2.1b).
  hairline: '#0F2A4A14', // measured — famysys.com --color-ink-08 (8% opacity navy). Real border-color
                          // value on light surfaces.
  hairlineOnDark: '#F7F5F21A', // measured — famysys.com --color-canvas-10 (10% opacity canvas).
                                 // Real border-color value present in the bundle, same "faintest
                                 // default rule" tier as ink-08 is on light. NOT derived.
} as const;

// Opacity ramp on ink, measured, available for scrims/overlays/muted states:
// ink-04 #0F2A4A0A · ink-08 #0F2A4A14 · ink-12 #0F2A4A1F · ink-20 #0F2A4A33
// ink-40 #0F2A4A66 · ink-60 #0F2A4A99 · ink-70 #0F2A4AB3 · ink-90 #0F2A4AE6
// Opacity ramp on canvas, measured: canvas-10 #F7F5F21A · canvas-16 #F7F5F229
// canvas-40 #F7F5F266 · canvas-60 #F7F5F299 · canvas-80 #F7F5F2CC
```

#### 2.1a Real running-text colors (corrects an assumption, not a guess)

The live DOM never sets running body/lead copy to plain `ink` or plain `graphite`. Every
`text-body` and `text-lead` element on famysys.com is paired with an **opacity variant**:

- Light surfaces: **`graphite-70`** (70%-opacity graphite composited over canvas) → **4.991:1**
  on canvas. Passes the 4.5:1 text floor, with headroom of 0.49 — use as-is, do not lighten further.
- Dark surfaces: **`canvas-80`** (80%-opacity canvas composited over ink) → **9.006:1** on ink.
  Comfortable margin.

Confirmed against real running paragraphs, not captions or meta text — the four `graphite-70`
instances checked are all multi-sentence case-study/FAQ/philosophy copy. **4.991:1 is a genuine
brand characteristic, not an accident to "fix" later**: famysys.com deliberately runs its primary
reading copy at a lighter weight than the 12.485:1 a full-strength graphite would give. Keep it —
do not round up to plain graphite for "safety margin," that would contradict the measured source.

Plain `ink` is reserved for headings (h1–h3 use `text-ink` directly, confirmed on the live DOM).
Eyebrow color is `ink-70` on light surfaces (5.343:1) — see 2.1c for why plain `graphite` (12.485:1)
was rejected: it would have made eyebrows read as dark as headings, inverting the normal
lighter-label relationship rather than just asserting slightly over body copy.

#### 2.1b Primary button — measured, already compliant

Every real CTA on famysys.com (`<a href="/contact/">`) is `bg-ink text-canvas` — confirmed in the
live DOM, not one instance of an accent-filled button exists anywhere on the page. That pairing is
**13.305:1**. No `accentSolid` token is needed; accent is reserved for outline/ghost/underline
treatments only, never a solid fill. Build the primary button as `bg-ink text-canvas`, ghost/inverse
variant as `bg-canvas text-ink` (also real, used for the header's inverse state).

#### 2.1c Eyebrow color — corrected twice: first to derived, now back to measured

First pass searched for a `text-label` utility and found none, so the color was called derived.
That was searching for the wrong class. The real class is `.label` (`font-size:var(--text-label);
...text-transform:uppercase;font-weight:600`), and it's used constantly on the live page —
`class="label mt-2.5 block text-accent"` on short stat-style callouts ("3x Velocity", "Zero Tech
Debt", "We Engineer Clarity"), and `class="label ... text-ink-70"` / `text-ink-90` / `text-canvas-60`
on neutral inline markers. Two real, measured findings follow from this:

1. **famysys.com's own accent-colored labels fail contrast** — `.label text-accent` on canvas is
   **4.043:1**, under the 4.5:1 text floor, at 11px, live on their homepage today. This is the
   exact failure mode flagged at the start of this doc, now confirmed as a real, existing gap in
   the source rather than a hypothetical.
2. There is a second, better-fitting real precedent for *our* use case. Our eyebrows introduce a
   heading in every one of §4.1–§4.17 (high-frequency, structural), closer to famysys.com's neutral
   inline-marker labels than to its occasional accent-colored stat tags. `.label text-ink-70` is
   real, measured, and lands at **5.343:1** — comfortably past the 4.5 floor, and critically, only
   slightly darker than the `graphite-70` body-copy color it sits next to (**5.343 vs 4.991**),
   not the **12.485** that plain `graphite` would have produced. That first draft would have made
   eyebrows read as dark as headings — heavier than intended on top of the uppercase/weight-600/
   wide-tracking treatment already doing the work. `ink-70` fixes the inversion with a real value
   instead of an invented one.

```ts
export const color = {
  // ...as 2.1, plus:
  eyebrowOnLight: '#0F2A4AB3', // measured — famysys.com --color-ink-70, a real `.label` color
                                 // variant. 5.343:1 on canvas — just above graphite-70 body text
                                 // (4.991:1), not heading-dark.
} as const;
```

**Dark-surface eyebrow — settled by specimen review: full canvas.** The only real `.label`-on-dark
precedent found is `text-canvas-60` (**5.717:1** on ink), but rendered against real dark-section
body copy it visibly recedes below `canvas-80` (**9.006:1**) — the exact failure this whole
exercise exists to avoid. Full `canvas` (**13.305:1**) asserts correctly and holds the same
"clearly above body" role that `ink-70` holds on light surfaces. Confirmed by rendered comparison,
not just computed ratios — see the specimen linked in §6.

**Named consequence — this makes the eyebrow/heading relationship asymmetric across surfaces, on
purpose.** On light surfaces, eyebrow (`ink-70`, 5.343:1) sits just above body (`graphite-70`,
4.991:1) and well below headings (`ink`, 13.305:1) — three clearly separated tiers. On dark
surfaces, eyebrow (`canvas`, 13.305:1) lands at the *same* contrast as headings (`canvas`,
13.305:1) — two tiers, not three, with the eyebrow reading as heading-weight in raw contrast
terms. It holds visually because the eyebrow is 11px against a 30–63px heading, so size still
carries the hierarchy that color no longer does — but this is a real, deliberate asymmetry
between the two surfaces, not an oversight. It also runs contrary to the one real dark-side
precedent (`canvas-60`) found on the page. **Do not "fix" this into matching the light-surface
three-tier pattern later** — the light and dark cases have different real constraints (a receding
real precedent vs. a viable but heavier one) and were resolved independently on purpose.

```ts
export const colorDerived = {
  eyebrowOnDark: '#F7F5F2', // derived — real canvas-60 (5.717:1) recedes below dark body copy
                             // (canvas-80, 9.006:1); confirmed by render, not just computed.
                             // Full canvas asserts but has no real `.label` pairing on the page,
                             // and lands at heading-level contrast (13.305:1 = same as headings),
                             // inverting the three-tier separation the light surface keeps. Kept
                             // anyway: size (11px vs 30–63px) still carries the hierarchy. See note above.
  accentOnDark:  '#5C96FF', // derived — accent lightened for TEXT use on ink backgrounds only.
                             // Raw accent (#1E6FFF) on ink is 3.291:1, fails the 4.5:1 text floor.
                             // This tint measures 5.007:1 against ink. Borders, underlines, and
                             // focus rings on dark sections keep raw accent (non-text UI only
                             // needs 3:1, and 3.291:1 clears that).
} as const;
```

`accent` itself remains available as an optional high-emphasis callout-label treatment (matching
famysys.com's own "3x Velocity" stat-tag pattern) for any future standalone stat callouts — just
not the default section eyebrow, since ours run at far higher frequency than their occasional tags
and can't absorb the contrast failure at that frequency.

#### 2.1d Card fill vs. hover affordance (§4.9, §4.14) — redone on hue, not luminance

First pass measured luminance delta only (white vs canvas: 1.088:1; ink-04 vs canvas: 1.076:1)
and concluded fill color "can't carry" the affordance. That conclusion used the wrong tool — WCAG
contrast is luminance-only and blind to hue, and canvas is a genuinely warm cream (HSL `36°, 24%,
96%`) while an ink-tinted fill is cool navy at the hue level even when luminance barely moves.
Checked properly (HSL, not just contrast ratio):

| Fill | Hue | Saturation | vs. canvas |
|---|---|---|---|
| white `#FFFFFF` | 0° | **0%** | Achromatic — literally no hue to separate from canvas's 24% saturation. This is why it reads as a smudge, not a surface. |
| `ink-04` | 39° | 6.6% | Same hue family as canvas (36°) but real, non-zero desaturation — a thin but genuine cool-neutral shift, not an illusion. |
| `ink-08` | ~unstable | 0.6% | Saturation this low makes HSL hue numerically unstable (near the gray axis) — not a reliable cooling cue, and see below, it also fails text contrast. |

**`surfaceRaised` (#FFFFFF) is removed entirely** — it was the only untagged/unjustified derived
token in the doc, white exists nowhere in the bundle, and it's now shown to be the objectively
worse choice on the axis that actually matters (chroma, not luminance).

**But the originally proposed hover fill (`ink-08`) breaks text contrast**, which the hue argument
doesn't change: §4.9 and §4.14 cards carry `graphite-70` body copy, and `graphite-70` on `ink-08`
measures **4.299:1** — under the 4.5:1 floor. `ink-12` (3.976:1) and `ink-20` (3.378:1) fail worse.
Only `ink-04` keeps body copy compliant on a tinted fill (`graphite-70` on `ink-04` = **4.637:1**,
passes) — which means `ink-04` is also the *only* available resting fill, not just the hover fill.

**First correction (rest = flush canvas) just moved the separation problem, not solved it.**
Rest at `fill canvas, border ink-08` makes the card the same color as the page it sits on,
separated only by an 8%-opacity hairline — the identical "cards barely exist" complaint that
started this, now at rest instead of at hover. Since `ink-08`+ fails body-copy contrast and can't
be used as a fill at all, both states are pinned to the same fill. **Confirmed by render: rest at
`ink-04` alone reads as a distinct surface against canvas** — the hue argument in the table above
held up in practice, not just in the numbers. That part is closed.

**Second correction — the first hover fix (`border ink-08`→`ink-20`) failed by render too.**
Darkening a 1px line by 12 percentage points of opacity is below the threshold anyone notices
without being told to look for it, and the 4px lift is invisible in a static frame with nothing
beneath the card to signal elevation against. **Fill is genuinely locked** — confirmed above,
`ink-08`+ fails body-copy contrast — so the hover signal has to come from a channel other than
fill or a barely-perceptible border darkening. Corrected scheme:

```
rest:  fill ink-04 · border ink-08 · no shadow
hover: fill ink-04 (unchanged) · border ACCENT · translateY(-6px), 180ms
```

`accent` on `ink-04` measures **3.756:1** — clears the 3:1 non-text-UI floor comfortably (border is
decorative, not text). The border change is now a **hue** shift, not a darkness shift, which
registers at 1px where a luminance-only change didn't. It also gives `accent` one more of its four
assigned recurring jobs (2.8.4), reinforcing that the blue is intentional brand color rather than
an occasional appearance. Lift raised 4px → 6px alongside the border change.

**Optional — hover-only shadow.** If the accent border alone still reads thin, add a hover-only
`0 8px 24px` shadow at `ink-08`. The original brief's §4.14 "no shadows" rule governs rest only;
it's confirmed spec-preference, not a measured famysys.com trait — the bundle's only `box-shadow`
is a reset default (`box-shadow:none` on form elements), and no card component exists on the live
page to have a shadow either way. Adding one on hover doesn't contradict anything measured. Do
not thicken the border as an alternative to a shadow — it reads as a weight change rather than a
state change, and risks layout shift unless done via inset box-shadow instead of border-width.

**Scope — this only needs solving fully for §4.14.** Border and lift are the entire hover
vocabulary there. §4.9 tiles have an independent arrow-reveal hover signal and §4.10 cards have
media-scale-on-hover; both inherit the accent border for consistency but don't depend on it the
way §4.14 does.

### 2.2 Contrast rules (measured, computed against WCAG relative luminance)

| Pair | Ratio | Verdict | Rule |
|---|---|---|---|
| accent on canvas | 4.043:1 | fails 4.5 (text), clears 3:1 (UI/large) | Accent stays for underlines, borders, focus rings, active states, display-size text, and optional high-emphasis callout labels (matching famysys.com's own stat-tag pattern) — never the default section eyebrow. |
| graphite on canvas | 12.485:1 | passes, but rejected for eyebrows | Would read as dark as headings — see 2.1c. |
| ink-70 on canvas | 5.343:1 | passes | Real, measured eyebrow color on light surfaces (2.1c) — just above body, not heading-dark. |
| graphite-70 on canvas | 4.991:1 | passes (barely, deliberately) | Real, measured running body/lead text color on light surfaces (2.1a). Confirmed a genuine brand trait, not a gap. |
| graphite-70 on ink-04 | 4.637:1 | passes | Body copy on §4.9/§4.14 card fill — same value at rest and hover (2.1d). |
| accent on ink-04 | 3.756:1 | passes (non-text UI) | §4.14 hover border — a hue change, not a darkness change, so it registers at 1px where ink-08→ink-20 didn't (2.1d). |
| graphite-70 on ink-08 | 4.299:1 | fails | Why hover fill is capped at `ink-04`, not `ink-08` (2.1d). |
| accent on ink | 3.291:1 | fails 4.5 (any text), clears 3:1 (non-text UI) | Borders/underlines/focus rings on dark sections keep raw accent. Any accent-colored **text** on a dark section uses `accentOnDark` (#5C96FF, 5.007:1) instead. |
| accentOnDark on ink | 5.007:1 | passes | Use for accent-colored text/links inside §4.4, §4.13, §4.16 (dark sections). |
| graphite on ink | 1.066:1 | fails everything | **Never use graphite for anything on dark sections**, eyebrow or body. |
| canvas-60 on ink | 5.717:1 | passes, but recedes | Real `.label`-on-dark precedent, sits below dark body copy (below) — open question in 2.1c. |
| canvas-80 on ink | 9.006:1 | passes | Real, measured running body/lead text color on dark surfaces (2.1a). |
| canvas on ink | 13.305:1 | passes | Headings on dark surfaces; eyebrow-on-dark default pending specimen review (2.1c). |
| ink on canvas | 13.305:1 | passes | Headings on light surfaces. |

### 2.3 Measured — type

Single face sitewide: **Jost** (Google Font — real famysys.com value, no substitution needed).
No separate display/mono face exists; hierarchy rests on size, weight, and tracking alone —
the weight ramp below is as load-bearing as the size ramp.

```ts
export const type = {
  sans: 'var(--font-jost)', // measured — famysys.com --font-jost, loaded via next/font/google
} as const;

export const typeScale = {
  displayXl: { size: 'clamp(clamp(1.875rem, 9.4vw, 2.125rem), min(4.4vw, 9svh), 4.75rem)', lineHeight: 1.04, letterSpacing: '-0.028em' }, // measured off the live h1 (`text-display-xl`), confirmed NOT inherited from a lower level. Exact nested formula, not a flattened approximation — see reachability note below.
  displayL:  { size: 'clamp(1.75rem, 2.95vw, 3.25rem)',  lineHeight: 1.08, letterSpacing: '-0.024em' }, // 28px→52px
  displayM:  { size: 'clamp(1.5rem, 2.25vw, 2.5rem)',    lineHeight: 1.18, letterSpacing: '-0.019em' }, // 24px→40px
  displayS:  { size: 'clamp(1.1875rem, 1.45vw, 1.5rem)', lineHeight: 1.34, letterSpacing: '-0.013em' }, // 19px→24px
  lead:      { size: 'clamp(1.0625rem, 1.35vw, 1.3125rem)', lineHeight: 1.62, letterSpacing: '-0.008em' }, // 17px→21px — floor raised (see note below) AND ceiling raised 19→21px (2.8.1, presence pass)
  body:      { size: '1.0625rem', lineHeight: 1.62, letterSpacing: '-0.006em' }, // 17px fixed
  small:     { size: '0.9375rem', lineHeight: 1.6 },  // 15px fixed
  eyebrow:   { size: '0.6875rem', lineHeight: 1, letterSpacing: '0.2em', transform: 'uppercase' }, // 11px, color per 2.1c
} as const;
```

**Display-xl ceiling reachability — confirmed intended, not a bug.** The 76px cap is real
(measured off the live h1), but the formula's nested `min(4.4vw, 9svh)` term means it only
resolves to 76px on wide *and* tall viewports. Computed across common resolutions (specimen
section 2 used 1440×900, the most common laptop size):

| Resolution | Effective h1 |
|---|---|
| 1280×720 | 56.3px |
| 1366×768 | 60.1px |
| 1440×900 | 63.4px |
| 1536×864 | 67.6px |
| 1728×1000+ | 76.0px (ceiling reached) |

Most desktop visitors — anything under ~1700px wide — will never see the 76px ceiling; 63–68px is
the size the client actually judges the hero at on a typical laptop. This is a faithful
reproduction of famysys.com's own real formula, not a deviation introduced here — their hero
behaves identically. Noting it explicitly so "the headline looks smaller than the 76px in the
spec" doesn't read as a bug later; it's the intended, measured behavior at typical viewport sizes.

**Lead floor correction:** measured `text-lead` clamps from 16px, one pixel under `text-body`'s
fixed 17px. On famysys.com the two don't currently sit adjacent, so it doesn't collide there — but
nothing in this build guarantees that stays true, and there's no cost to closing the gap. Floor
raised to 17px so lead (used for hero subheads and section intros) can never render smaller than
the running body copy that follows it, at any viewport.

**Weight ramp** (specified as tightly as size, since there is no second face to lean on):
- Eyebrow: 600 (semibold) — real, measured (`.label` is `font-weight:600` in the bundle)
- Hero h1 only: 600 (semibold) — the one deliberately heavier moment on the page, see 2.8.2
- Display (all other sizes, h2/h3): 500 (medium) — famysys.com does not use heavy/black weights on display type
- Lead / body: 400 (regular)
- Emphasis within body copy: 500 (medium), never bold/700+

### 2.4 Measured — radius, spacing, container

```ts
export const radius = '0.25rem'; // measured — famysys.com --radius-sm, applied site-wide. Near-square.
                                  // Do NOT import Superside's pill buttons — translate to this radius.

export const spacing = {
  section: 'clamp(4.5rem, 10vh, 8.5rem)', // measured — famysys.com --spacing-act, ~72px→136px
  gutter:  'clamp(1.25rem, 5vw, 5.5rem)', // measured — famysys.com --spacing-gutter, ~20px→88px
} as const;

export const container = { maxWidth: '80rem' }; // measured — 1280px, literally present in the famysys.com bundle
```

### 2.5 Measured — focus ring

```css
:focus-visible {
  outline: 2px solid var(--color-accent); /* measured, light surfaces */
  outline-offset: 3px;
  border-radius: 2px;
}
```
On dark sections (§4.4, §4.13, §4.16), keep the same outline but the accent stays raw
(non-text UI, 3.291:1 clears the 3:1 floor) — do not swap to `accentOnDark` for the ring itself.

### 2.6 Mobile h1/h2 hierarchy — inherited fragility, deliberate fix

famysys.com's own real values put h1's floor at ~30–34px (nested clamp) against h2's floor of
28px — a 2–6px gap that's already tight on their live site at small viewports. Replicating this
verbatim would inherit a real weakness, not measured fidelity worth keeping. Fix: **eyebrows must
never be hidden or hidden-on-mobile.** Every h2 in this build's section pattern sits under an
eyebrow (§4.1–§4.17 all follow "eyebrow, then heading"); h1 in the hero does not. Once the raw
font-size gap narrows on small viewports, the eyebrow's presence above h2 is what keeps it reading
as subordinate to h1 — so persisting eyebrows at every breakpoint is the actual mechanism, not a
new weight or tracking token.

### 2.7 Named deviations from the original brief (now corrected)

- Accent is blue `#1E6FFF`, not red-orange `#B4472E` as originally guessed.
- Ink is navy `#0F2A4A`, reserved for headings — not near-black, and not the body-copy color (2.1a).
- Type scale caps at 76px (display-xl), not 104px. **This makes the page read structurally
  quieter/calmer than Superside** — Superside's section count rendered at Famysys's actual type
  and spacing proportions produces a longer, denser, calmer page than the reference. This is
  intentional fidelity to the brand, not a build error — do not "fix" it by inflating type sizes
  to chase Superside's visual weight.
- Section rhythm is ~72–136px, not 96–160px.
- §4.5 parallax offset drops from 40px to **24px** to stay proportional to the smaller scale.
- Dark full-bleed sections (`bg-ink` at full opacity) are a confirmed real pattern on
  famysys.com, not an extrapolation — verified present in the compiled CSS as a utility class.
- Running body/lead text is `graphite-70`/`canvas-80`, not plain `ink`/`graphite` (2.1a).
- Primary button is confirmed `bg-ink text-canvas` sitewide — accent is never a solid fill (2.1b).
- Eyebrow color is `ink-70` (light) / `canvas` (dark) — real `.label` usage on light; on dark,
  a confirmed-by-render derived choice that deliberately inverts the light-surface pattern (2.1c).
- `surfaceRaised` (#FFFFFF) is removed. Card fill is `ink-04` at rest AND hover (no fill change
  between states — `ink-08`+ fails body-copy contrast, so only one fill value is usable at all);
  hover separates via border escalation and lift instead. No white token exists anywhere in this
  build (2.1d).

## 2.8 Presence pass — closing the "accurate but flat" gap

Everything to this point has been correctness (measured vs. derived, contrast pass/fail). None of
it addresses render risk: a page can satisfy every rule above and still read as inert. Four
adjustments, all still inside measured tokens or their direct extensions:

### 2.8.1 Lead ceiling raised 19px → 21px

`clamp(1.0625rem, 1.35vw, 1.3125rem)`. The floor fix (16→17px, above) closed the inversion risk;
left alone, the ceiling still capped the hero subhead at only 2px over fixed body copy — no weight
under the headline at exactly the spot Superside's momentum usually comes from. Costs nothing
against any measured value; `lead` is fluid on famysys.com already, this only extends its own range.

### 2.8.2 Hero h1 at weight 600, everything else stays 500

With one typeface and no size/weight pairing to borrow from Superside, weight is the only lever
left that reads as emphasis at display size. One heavier moment at the very top of the page; every
other display size (h2/h3, all of §4.1–§4.17) stays at the measured 500. See weight ramp in 2.3.

### 2.8.3 Light/dark rhythm — flagging, not deciding

`bg-ink` full-bleed is confirmed real (2.7). The original brief already assigns exactly three dark
sections — §4.4 (Manifesto), §4.13 (Platform/Process), §4.16 (Closing CTA) — everything else is
explicitly light, including an unbroken 8-section light run from §4.5 through §4.12. That run
length is baked into the brief's own section list, not something introduced by the token work in
this document.

Spacing the three dark beats *within their fixed positions* (§4.4 early, §4.13 mid-late, §4.16
final — roughly 24%/76%/94% through the 17-section scroll) is already reasonably distributed and
needs no change. Adding a **fourth** dark beat inside the §4.5–§4.12 run to shorten it would be a
real structural change to section content, which §4 of this document (and the brainstorming
approval before it) fixed as unchanged from the original brief. That's a bigger call than a token
correction — not deciding it here. If a fourth beat is wanted, name which section (a candidate:
§4.8 Featured Story Cards, which already has natural visual weight from its video thumbnails) and
it goes through the same approval as any other section-order change.

**Resolved (post-launch-review rework):** the flag above was acted on. §4.8 — the exact candidate
named here — is now the fourth dark beat, and the rhythm was rebuilt rather than just having a beat
inserted into the existing run:

```
DARK    Header + §4.2 Hero + §4.3 Logo marquee   <- one continuous ink block, no seam
LIGHT   §4.4 Manifesto → §4.7 Metrics
DARK    §4.8 Featured story cards
LIGHT   §4.9 Services → §4.12 Testimonials
DARK    §4.13 Process
LIGHT   §4.14 Differentiators, §4.15 Talent
DARK    §4.16 Closing CTA + §4.17 Footer
```

§4.4 flips from the original brief's dark to light — cream was never going to carry a hero, so the
page now opens dark instead and Manifesto trades places with it. This is the structural change
2.8.3 deferred; it went through the same review gate as any other section-order change. Knock-on
consequences, all applied together as one pass:

- **Primary button gets a dark-surface variant.** `bg-ink text-canvas` is invisible on ink itself.
  Dark surfaces use `bg-canvas text-ink` (13.305:1) with a deepened-cream hover fill,
  `primaryButtonHoverOnDark: '#EAE6E0'` — derived, no live-site precedent (hover states aren't
  visible in a static capture). Ghost buttons on dark: canvas text, canvas-40 border.
- **Card mechanics get a dark counterpart** (`.card-surface-dark`): canvas-4 fill, canvas-10
  border, same accent-border-plus-6px-lift hover as the light version. `canvas-4` is a new opacity
  step, following the existing `ink-4`/`ink-8` pattern rather than reusing `canvas-10` (already
  the border color) for the fill.
- **Header text color tracks scroll state**, not just its background. Canvas over the transparent
  hero state, ink once the canvas background appears past the 80px threshold — animated together
  over the same 240ms so neither state leaves unreadable links mid-transition.
- **Client-logo and hero/story-card placeholders regenerated** for their new dark context: logo
  marks moved from two-tone plates (which baked a canvas-field rect that would have boxed against
  ink) to flat canvas-60 marks with no background; the hero and §4.8 video gradients swap their
  outer stop from ink to canvas so the glow doesn't blend into the now-dark page.
- **`meta theme-color` deviates from famysys.com.** The live site's theme-color matches its canvas
  background (`#F7F5F2`); this page now opens on a dark hero, so mobile browser chrome is set to
  `#0F2A4A` (ink) instead — a deliberate deviation, not an oversight, set via Next's `viewport`
  export in `src/app/layout.tsx`.
- **`color-scheme: light` is unchanged.** These are background colors within one light-themed page,
  not a dark theme — nothing here resolves through `prefers-color-scheme`.

### 2.8.4 Accent gets one consistent, visible job

Locked out of solid fills (2.1b) and out of the default eyebrow (2.1c), accent currently has no
guaranteed appearance on the page at all. Assigning it a fixed set of recurring roles so the blue
reads as intentional brand color rather than an occasional accident:
- Inline link underlines in running body copy
- The active/selected tab state in §4.9's services filter
- The numeral in front of each of §4.13's four numbered process steps (Brief/Build/Review/Deliver)
- Focus rings (already specified, 2.5)
- §4.14's card hover border (2.1d) — the fifth job, and the one that made the hover state
  perceptible at all once fill was ruled out
- Optional high-emphasis callout labels, matching famysys.com's own accent-`.label` stat-tag
  pattern (2.1c) — available, not mandatory, for any standalone stat/number callout

## 3. Odometer (§4.7) — Jost tabular-numeral handling

Jost's `tnum` OpenType feature coverage cannot be verified from the CSS bundle alone (requires
font-file inspection), but famysys.com's own bundle confirms the mitigation directly: a real
`.tabular` utility class exists (`font-variant-numeric:tabular-nums;font-feature-settings:"tnum" 1`),
already applied to numeral content on the live page. Use it as-is:

- Apply the measured `.tabular` treatment (`tabular-nums` + `"tnum" 1`) on every digit column.
- Additionally give each digit column a **fixed `ch`-based width** (not just tabular-nums) so
  that even if Jost's tnum set is incomplete for some digit, it cannot jitter horizontally as it rolls.
- Digit-roll animation still translates a stacked column of 0–9, one column per digit — never
  interpolates a number directly.

## 4. Everything else — unchanged from the original brief

Architecture (DDD + SOLID, folder structure, dependency rule), section order (§4.1–§4.17),
motion system, responsiveness breakpoints and collapse rules, placeholder media generation
approach, quality floor (Lighthouse/a11y/contrast/testing), git workflow and commit sequence,
and the phase order in §11 of the original brief are all retained as specified. Only §2 (tokens)
is replaced by this document's §2, and this document's §3 supersedes the odometer assumption in
the original §4.7.

## 5. Build cadence

Checkpoint after each phase for review, per user decision:
1. Domain layer (entities, value objects, repository interfaces) + unit tests
2. Application layer (use cases) + unit tests
3. Infrastructure (content files, static repositories, DI container)
4. Placeholder media generation (`scripts/generate-media.mjs` + committed output)
5. Sections §4.1–§4.8 (header through featured story cards)
6. Sections §4.9–§4.17 (services grid through footer)
7. Reduced-motion pass, responsive audit, Lighthouse/a11y pass, README

Each checkpoint is a natural git commit boundary per the original brief's conventional-commit
sequence; no separate implementation-plan document duplicates that sequence.

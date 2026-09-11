# Creative Services page redesign

Date: 2026-09-11
Branch: shafwan_prototype1
Status: approved by user, proceeding to implementation

## Problem

`/creative-services` has not kept pace with the homepage. Six near-identical blocks
(paragraph + 7-item "what's included" list, alternating image side) read as a template,
are too dense to read at a glance, and the page is too long — particularly the
`HowWeWork` scroll-pinned sequence, which spends significant height on five short steps
for a page that already links to `/how-we-work`.

Goal: rebuild to the homepage's current standard (lighter copy, stronger visuals, real
motion on entry/scroll/hover) and make the page **shorter**, not longer, especially on
mobile.

## Non-goals

- No new content-layer pattern. `creative-services.content.ts` spreading titles/
  descriptors from `services.content.ts` stays as-is; only the page-specific fields
  (paragraphs, lists, headings, pointer copy) are rewritten.
- No new design tokens system — tokens only, no hex literals, use what exists in
  `src/shared/design/tokens.ts`.
- Not touching `docs/explorations/` (other sessions may be using it).
- Not touching the six capability *titles* — those are fixed.
- No modal/overlay component — detail reveal stays inline (see Interaction below).

## Design

### Compositions (six capability blocks, one component, six variants)

Fixed titles, deliberately varied shape instead of the current alternating-image
template:

1. **Creative Design** — image-led: large visual right, one-line + expand trigger left
2. **Video Production & Editing** — type-led: text-first, small looping thumbnail chip
3. **AI Video & Virtual Presenters** — full-bleed: visual fills width, text on scrim
   bottom-left
4. **Explainer & Training Videos** — paired/diptych: two stacked visuals beside stacked
   text
5. **Motion Graphics & Advanced Creative** — type-led mirrored: text right, small motion
   loop left
6. **Product & Brand Visuals** — image-led grid: 2×2 small-image grid + text

Each block always shows: title, one-line descriptor, expand affordance. Expanded state
(paragraph + **3** differentiating deliverables, down from 6-8) lives in an inline
disclosure, not a modal.

**Composition 3 contrast requirement:** text-over-photography contrast must be verified
against the actual rendered image (not the scrim colour in isolation) — axe has missed
this class of failure elsewhere on this project. Verify visually in-browser at build
time, not just via automated contrast checkers.

### Interaction

Inline disclosure per block: hover-reveals on fine pointer (`useFinePointer`), tap-
toggles everywhere else — same split already established by `ServiceGrid`'s hover-
curtain/spotlight pattern. Measured-height expand/collapse, transform/opacity only.

**Disclosure hook:** reuse vs. new — decide during implementation by first checking
whether an existing hook (e.g. a generalized version of what powers `ServiceGrid`'s
curtain, or `useScrollProgress`/`useInView` composed directly) covers "measured-height
expand toggle, hover on fine pointer / tap otherwise." If nothing existing fits without
distortion, add one small shared hook (e.g. `useDisclosure`) under
`src/presentation/hooks/`. Report which path was taken and why in the final report —
this is being tracked explicitly, not left implicit.

### Capability index

Keep the sticky row and `useActiveAnchor` scroll-tracking as-is functionally; restyle
for a stronger, unmistakable active state. Mobile fallback (horizontal strip / drop
below threshold) already exists in `CapabilityIndex.tsx` — keep that mechanism, restyle
only.

### How We Work → cut to a single link block

Replace the `HowWeWork` scroll-pinned five-step sequence with a compact pointer block
in the same shared minimal-pointer shape already used for `FaqPointer` on this page —
eyebrow, one heading/link, no restated steps. Decision: **cut**, not condense — the
section is process detail for a page that isn't about process and already links out.
This removes the single largest height cost on the page.

### Ways to engage

Compact 4-item row (Launch / Grow / Scale / Custom Creative Partnership), one line
each. Restyle `EngagementPointer`, do not rebuild its structure.

### FAQ

Already a pointer to `/faq#services-and-capability` via `FaqPointer` — keep the
pointer pattern, restyle to match the new visual language only.

### Motion

- Entry: `useInView` + stagger constants from `tokens.ts` (`motion.stagger.*`); add a
  new stagger group if the varied compositions need one, following the existing
  per-component `transitionDelay: order * stepMs` convention (no animation library).
- Scroll: `useScrollFrame`/`useScrollProgress` where a section calls for continuous
  response (e.g. the full-bleed block's scrim/parallax).
- Hover: `useFinePointer` split, matching `ServiceGrid`'s established pattern.
- All motion: transform/opacity only. Geometry measured on load/resize/image-settle,
  never inside a frame (per existing `useScrollFrame` convention).
- `prefers-reduced-motion`: final-state, all hidden copy visible, fully readable — same
  guarantee `useInView`/`useHeroMotion` already provide elsewhere.

### Copy

Full rewrite: hero tightened, all six paragraphs, all six deliverable lists (cut to 3
each), section headings, pointer copy. Voice: plain declaratives, concrete nouns,
sentence case, no superlatives, no agency language ("unleash"/"elevate"/"transform").
Specificity over adjectives.

All new/changed strings marked `TODO(client): drafted copy, pending approval` at their
definition site in `creative-services.content.ts`, logged in `docs/content-todo.md`
under the existing Creative Services table, following the file's current convention
(the file already documents this page's pending strings — extend, don't restructure).

No literals in components — copy stays sourced through the existing content/use-case
layer (`GetCreativeServicesPage` → `creative-services.content.ts`). Images stay
placeholder Unsplash (unchanged scope, listed in `docs/content-todo.md`).

### Mobile

- Nothing depends on hover — pointer media query (`useFinePointer`), not width.
- No horizontal overflow at 320/360/390/430 — assert directly, not assumed.
- Tap targets ≥44px with real spacing.
- Capability index: keep existing mobile strip/threshold behaviour, restyled.
- Type clamps hold at 320, not just 390.
- Page must be substantially shorter on mobile than current — this is the primary
  success signal alongside the height numbers.

## Files touched

- `src/presentation/sections/services/CapabilityBlock.tsx` — largest change: six
  composition variants + inline disclosure
- `src/infrastructure/content/static/creative-services.content.ts` — copy rewrite
- `docs/content-todo.md` — log new draft strings
- `src/app/creative-services/page.tsx` — swap `HowWeWork` for a pointer block
- `src/presentation/components/CapabilityIndex.tsx` — restyle only
- `src/presentation/sections/services/EngagementPointer.tsx` — restyle only
- `src/presentation/sections/shared/FaqPointer.tsx` — restyle only (shared with other
  pages — verify restyle doesn't regress `/how-we-work` or `/ways-to-work-with-us`)
- Possible new: `src/presentation/hooks/useDisclosure.ts` — only if no existing hook
  covers the inline-disclosure interaction without distortion (see above)

## Verification

- Production build, no other node process running, hydration gate in script.
- Every section's entry/scroll/hover behaviour confirmed in a real browser, not
  headless.
- Composition 3 text-over-image contrast checked against the rendered image at the
  breakpoints it's shown at, not just the scrim colour.
- All hidden (disclosure) copy reachable without a mouse (tap/keyboard).
- No overflow at 320, 360, 390, 430, 768, 1024, 1440.
- Reduced motion shows everything, final-state.
- No console errors.
- Report page height before/after at 390 and 1440.
- Screenshots at 390 and 1440, mid-scroll.

## Report deliverable

Full rewritten copy (for review before ship), composition rationale per block,
How-We-Work cut rationale (already decided above), disclosure hook decision (reused vs.
new, and why), before/after page heights.

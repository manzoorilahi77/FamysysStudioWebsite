# The Capability Deck, and what changed when it was ported

The footer's "Capability Deck" link points at `/capability-deck`. That page is not work
that started in this repository. It was built by **Imran Ifraz** as a separate application
— <https://github.com/imranifraz/famysys-web-dec>, `main`, at commit `d8ec7b7` — and ported
here. The slides, the copy, the layout, the coverflow galleries and the whole transition
system are his. This file records what the port changed and, more usefully, what it
deliberately did not.

## What his repo was

A standalone **Vite 5 + React 18** single-page application: `famysys-studio-deck`, ~5,700
lines across 40 source files, plus 15 MB of portfolio assets. It has no router — a fixed
1920×1080 stage scales to fill the viewport and `PresentationShell` swaps six slides
through framer-motion's `AnimatePresence`, driven by keyboard, wheel, swipe and an
on-screen control bar. A seventh slide, How We Work, is commented out in his `App.jsx`;
that comment is preserved verbatim in `CapabilityDeck.tsx`.

## Where it lives now

| His repo | Here |
|---|---|
| `src/App.jsx` | `src/presentation/capability-deck/CapabilityDeck.tsx` |
| `src/components/*.jsx` | `src/presentation/capability-deck/components/*.tsx` |
| `src/hooks/*.js` | `src/presentation/capability-deck/hooks/*.ts` |
| `src/slides/*.jsx` | `src/presentation/capability-deck/slides/*.tsx` |
| `src/data/content.js` | `src/presentation/capability-deck/data/content.ts` |
| `src/styles/global.css` | `src/app/capability-deck/deck.css` |
| `src/assets/**` | `public/capability-deck/**` |
| `index.html` | `src/app/capability-deck/page.tsx` |

The deck is one `presentation/` element under the repo's layering rules and imports nothing
from `application/`, `domain/` or `infrastructure/`. Nothing outside `capability-deck/`
imports anything inside it, except the route.

## The five changes that were not purely mechanical

### 1. It is rendered in the browser only

His build had no server. Several of his hooks guard on `typeof window === "undefined"` and
return a placeholder — `useStageScale` returns `scale: 1`, `usePrefersReducedMotion`
returns `false`. In his repo those branches were never reached. Under Next's prerender they
are reached on every build, and the failure that produces is not a wrong first frame that
corrects itself:

> React does not patch a hydration mismatch on an inline style. It adopts the server's DOM
> and records the *client's* first-render value as what it believes is on screen. The
> prerender wrote `transform: scale(1)`; the client's first render computed `0.8333` and
> recorded that. `useStageScale`'s effect then measured the viewport, got `0.8333` again,
> and React diffed `0.8333` against `0.8333`, found no change, and wrote nothing. The deck
> rendered at scale 1 inside a 1440px window — cropped on all four sides — and no resize
> could fix it, because every recomputation produced the value React already believed was
> applied.

`CapabilityDeckMount.tsx` loads the deck through `next/dynamic` with `ssr: false`, which
removes the class of problem rather than the one instance. The `.capability-deck` wrapper
in `page.tsx` is still server-rendered so the dark ground is painted before the bundle
arrives.

### 2. His colours point at this project's tokens

His `global.css` header says the palette was read off the live site's computed custom
properties, and every value checks out byte-identical against `colors.generated.css`. He
built the deck on this project's design system; he just froze it as literals, because his
repo had no access to `colors.ts`. `deck.css` points the same names at the same tokens, so
the deck renders identically today **and** follows a palette switch instead of being
stranded on the old one. Verified in the browser: `--color-cream` `#f1ebdd`, `--color-ink`
`#1e3a31`, `--color-ink-raised` `#12251f`, `--color-bg-outer` `#0b1613`, `--color-accent`
`#7e1b33`, `--color-accent-on-dark` `#f0a8b8` — the same computed values his build
produces.

Two of his variable names collide with the site's and mean different things (his
`--color-ink` is the section-alt green; the site's is the dark background), which is why
his set is declared on `.capability-deck` rather than `:root`. See the header comment in
`deck.css`.

**Four colours are genuinely his and are not the site's**, and they were kept at his exact
values rather than mapped to the nearest token — mapping them would have changed what he
shipped:

| Value | Where | Why it is not a token |
|---|---|---|
| `#0a1628` | `--deck-embed-backdrop` | A navy behind the embedded deck. No palette green is close. |
| `#1a3229` | `--deck-video-gradient-top` | Lighter than `section-alt`; no token equivalent. |
| `#ffffff` | `--deck-preview-paper` | Behind an external site's iframe. The site's `#FCF8EE` card colour would tint it. |
| `rgba(0,0,0,0.35)` | `VideoGallery` drop shadow | Black is not a palette colour. Left inline. |

### 3. Tailwind's preflight is undone inside his subtree

His build has no Tailwind. This site's `globals.css` loads preflight, which normalises
margins, list styling and form-control fonts everywhere — including, once his deck became
part of this app, into elements he had deliberately left to the browser's defaults. Three
of those mattered, and none of them was cosmetic:

| Element | His (UA default) | Preflight | Effect |
|---|---|---|---|
| `SectionHeadline`'s `<h2>`, one per slide | `margin: 73.04px 0` | `0` | Every slide's content rose 61px; the bottom row of Services and Ways to Work fell off the stage |
| CTA slide's body `<p>` | `margin: 23px 0` | `0` | Paragraph and button moved up ~20px |
| Buttons with no inline font-size | `13.3333px`, `padding: 1px 6px` | inherit `16px`, `padding: 0` | Gallery controls rendered larger and tighter |
| Anything with no line-height of its own | inherits `normal` | inherits `1.5` from `html` | 0.5px taller per line at 15–16px: most slides' content sat 1px lower on screen, and the Ways to Work cards grew 5px |

`deck.css` restores the first three with `revert`, which rolls each property back to the
user-agent value rather than restating it. An inline style still wins, so every element his
components DO style is untouched. Line-height cannot be restored that way — the UA sets none
on these elements, so `revert` just inherits preflight's `1.5` again — so `normal` is stated
on `.capability-deck` and on `body`, because both galleries portal their expand modal there.

This was found by walking all twelve slides in both builds and diffing the computed margin,
padding, list-style, font-size, font-weight and border-width of every element — 296 elements
in his, 288 in the port. That diff went from 18 differing element signatures to 4, and then
to 1 once line-height was restored: the three `margin: auto` values that still differed were
card rows absorbing the taller text, not rounding. The one that remains is an extra SVG
`<path>` from lucide-react's newer icon set. Line-height itself never appears in that diff,
which does not record it; it showed up in screenshots as a uniform 1px drop and was traced by
comparing element positions between the two builds.

### 4. His scrims became `color-mix`

His component style objects carried scrims as frozen `rgba()` of the same two grounds —
`rgba(11,22,19,a)` is `--color-header-ground`, `rgba(18,37,31,a)` is `--color-section-alt`.
`color-mix(in srgb, <token> N%, transparent)` is exactly that colour at that alpha, so they
render identically and follow a palette change like everything else.

### 5. It is TypeScript now

`allowJs` is false here and `strict`, `noUncheckedIndexedAccess` and
`exactOptionalPropertyTypes` are all on. Every file was converted. The rule followed
throughout was *add types, do not change behaviour*: prop interfaces, `satisfies` on his
style objects so `position: "absolute"` narrows, and named casts at the handful of places
where his runtime guards are correct but not visible to the compiler (they carry a comment
naming the guard). The shared shapes live in `types.ts`, which explains why the seven
portfolio categories are one wide interface rather than a discriminated union.

## What was deliberately preserved

- **framer-motion**, at `11.18.2` — the nearest release to his `11.11.17` that declares a
  React 19 peer. Same major, same API. The rest of the site animates through hand-written
  CSS and CSSOM writes; the deck does not, and was not rewritten to.
- His `react-hooks/exhaustive-deps` warnings, in `VideoGallery` and `WebsiteGallery`. Both
  are deliberate in his code (the wheel handlers read refs). Adding the deps would change
  when listeners rebind.
- His raw `<img>` elements. `next/image` would trip the same `no-img-element` warning off,
  but the site sets `images: { unoptimized: true }`, so it would add a wrapper for nothing.
- His logo file. It differs from `public/brand/famysys-studio-logo-canvas.png`; his is the
  one the deck was designed against.

## What was left behind

Seven website screenshots in his `src/assets/portfolio/websites/` (~5 MB, including
`basha.jpg` at 2 MB and `tnhss.webp` at 2.4 MB) are imported nowhere in his repo — those
cards frame the live site instead. They were not carried over. Nor was
`assests/famysys-studio-logo-canvas.png`, a byte-identical duplicate of
`src/assets/famysys-logo.png` in a misspelled directory.

## The thing most likely to break

`Selected Work` frames live third-party content: 23 Google Drive clips and seven client
sites. `src/middleware.ts` carries a second CSP for this route alone, naming each origin.
**Adding a project with a new `previewUrl` needs its origin added there**, or the card
renders an empty frame with only a console message to say why. The site-wide policy is
untouched, so `/admin` and the contact form keep the strict one.

Those sites are also outside our control. Any of them can add
`X-Frame-Options: DENY` and its card will go blank without anything here changing — which
already happened to `hajj-umrah` in his repo, and is why that entry carries a screenshot
and a `liveUrl` instead of a `previewUrl`.

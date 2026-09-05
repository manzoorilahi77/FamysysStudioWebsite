# Colour system — evidence

Four screenshots from the review of `feature/colour-system`. All at 1440, against the
static export in `out/`.

## The palette file actually drives the site

`src/shared/design/colors.ts`, one line changed:

```diff
-  accentPrimary: "#1C50FF", // main brand blue — buttons, links
+  accentPrimary: "#D5202A", // main brand blue — buttons, links
```

Then `pnpm build`. Nothing else was edited.

- [accent-changed-to-red-home.png](accent-changed-to-red-home.png) — the header's primary
  call to action, red.
- [accent-changed-to-red-cards.png](accent-changed-to-red-cards.png) — the Differentiator
  row's accent panel, red, with the other three fills unchanged.

The derived values moved with it without being touched: `--color-primary-button-hover`
went from `#1a4be6` to `#b9222f`, the same 14% shift toward the navy applied to the new
base. The change was reverted after the capture; `--color-accent` is `#1c50ff` on `main`
and on the branch.

## The expanded palette in place

- [differentiator-cards.png](differentiator-cards.png) — the four Differentiator cards,
  accent / card / warm / card, on the alternate navy ground.
- [closing-cta-hovered.png](closing-cta-hovered.png) — the page's one use of
  `accentHighlight`: the closing call to action, hovered.

Regenerate any of these with `node scripts/verify/vr-colour-shots.mjs` and `node scripts/verify/vr-colour-detail.mjs`
against `node scripts/verify/vr-serve.mjs 3100`.

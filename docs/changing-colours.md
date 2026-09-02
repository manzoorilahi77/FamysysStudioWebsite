# Changing colours

Everything coloured on this site — page backgrounds, headings, buttons, chips, hover
states, borders — comes from **one file**:

```
src/shared/design/colors.ts
```

Change a value there, save, and it updates everywhere. You do not need to touch anything
else, and you should not: no other file in the project is allowed to contain a colour.

---

## How to change a colour

1. Open `src/shared/design/colors.ts`.
2. Find the colour you want and replace its hex value. It must look like `#0B2C4D` — a
   hash followed by six characters, in quotes, with a comma after it.
3. Save the file.
4. In a terminal at the project folder, run:

   ```
   pnpm check-colours
   ```

   This prints a table of every colour pairing on the site and tells you whether the text
   is still readable. Read the [Checking contrast](#checking-contrast) section below.

5. Run `pnpm dev` and open <http://localhost:3000> to see it.

If the site is already running, stop it (Ctrl+C) and start it again — the colour file is
read once when the site starts.

---

## What each colour does

### Backgrounds

| Name             | What it is                                                                              |
| ---------------- | --------------------------------------------------------------------------------------- |
| `pageBackground` | The warm cream most of the site sits on. Change this and the whole site's mood changes. |
| `darkBackground` | The deep navy used for the hero and the other dark sections.                            |
| `cardBackground` | White. The fill of a raised card sitting on a cream section.                            |

### Text

| Name          | What it is                                                                                                                                                            |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `textOnLight` | Headings and strong copy on the cream sections.                                                                                                                       |
| `textOnDark`  | Headings and strong copy on the navy sections.                                                                                                                        |
| `textMuted`   | The grey that running body copy is mixed from. It is never used at full strength — the site uses it at 70%, which is what makes body copy sit quieter than a heading. |

### Brand accents

| Name              | What it is                                                                                                                                                                                |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `accentPrimary`   | The main brand blue. Buttons, links, eyebrow labels, focus rings. The most visible colour on the site after the two backgrounds.                                                          |
| `accentOnDark`    | A lighter version of the same blue. The main blue is too dark to read on navy, so anything blue on a dark section uses this instead.                                                      |
| `accentWarm`      | The warm orange. Secondary emphasis: category chips, status markers, process numerals. **Use it as a fill with dark text on it, not as coloured words on cream** — see the warning below. |
| `accentHighlight` | The bright lime. Loud on purpose. **One use per page, maximum**, and only on a dark section.                                                                                              |

### Section grounds

| Name          | What it is                                                                                                                                      |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `sectionAlt`  | A lighter navy. When two dark sections sit next to each other, the second one uses this so the page does not read as one endless block of navy. |
| `sectionWarm` | A deeper cream. Same idea for consecutive light sections.                                                                                       |

You do not have to do anything to make the alternation happen — the site works out which
sections are next to each other on its own.

---

## Checking contrast

Contrast is how far apart a text colour and its background are. Too close and the words
are hard to read, especially for anyone with low vision or on a phone in sunlight. It is
measured as a ratio: **4.5:1 is the minimum for normal text**, 3:1 for large headings and
for lines and borders that carry meaning.

`pnpm check-colours` measures every pairing for you:

```
ground                       on          role   ratio     floor          what it is
page background (cream)      #0B2C4D     text   12.549:1  4.5:1   PASS   headings and full-ink copy
page background (cream)      #1C50FF     text   5.107:1   4.5:1   PASS   links and eyebrows
...
All 31 enforced pairings pass.
```

- **PASS** — fine, nothing to do.
- **FAIL** — the words will be hard to read. Make the text darker or the background
  lighter (or the other way round) until it passes.
- **info** — a wash, watermark or hairline. No text sits on it, so there is no floor to
  clear; the number is shown so you can tell whether it is still visible at all.

The command's second table, **AVOIDED**, lists pairings the site deliberately does not
use, with the number that explains why. It never fails the check — it is there so you can
see, for example, that the bright lime on cream measures 1.141:1 and is effectively
invisible.

---

## What to watch for

**The bright lime (`accentHighlight`) only works on navy.** On cream it measures 1.141:1
— which is to say, you cannot see it. If you want it on a light section, it has to be a
_fill_ with dark text on it, not coloured text.

**The warm orange (`accentWarm`) is a fill, not a line or a word.** Against cream it
measures 2.495:1, under the floor even for a border. Filled, with the navy on top of it,
it measures 5.031:1 and is fine. The site already uses it this way; keep it that way.

**Making the cream darker eats into everything.** Every text colour on the site is
measured against it. `pnpm check-colours` will tell you immediately if you have gone too
far.

**The two blues have to stay a pair.** `accentPrimary` is for light sections and
`accentOnDark` is for dark ones. If you change one, change the other to match, or the
dark sections will stop looking like the same brand.

**Do not put a colour anywhere else.** If you find yourself wanting to write a hex value
into a component or a stylesheet, add it to `colors.ts` instead and ask a developer to
give it a name. `pnpm lint` fails on any hex value outside `colors.ts`, so this is caught
before it ships rather than after.

---

## If something goes wrong

**The site looks unchanged after an edit.** Stop the dev server and start it again.

**`pnpm lint` fails with "colors.generated.css is out of date".** Run
`pnpm colours` and try again. (`pnpm dev` and `pnpm build` do this for you; the
message only appears if you ran lint on its own after an edit.)

**The site will not start and mentions a colour file.** The most likely cause is a typo —
a missing quote, a missing comma, or a hex value that is not six characters. Compare the
line you changed with the ones around it.

---

## For developers

- `src/shared/design/colors.ts` — the fourteen bases. The only file allowed to contain a
  hex literal, enforced by a `no-restricted-syntax` rule in `eslint.config.mjs`.
- `src/shared/design/colorMath.ts` — `withAlpha`, `mix`, `flatten`, `contrastRatio`. No
  colour is named here; these only transform.
- `src/shared/design/tokens.ts` — every derived value: the two opacity ramps, the hover
  fills, the card tints, the hairlines. All produced by `colorMath` from a base.
- `scripts/generate-color-css.mjs` — writes `src/app/colors.generated.css` from
  `tokens.ts`. Runs on `predev` and `prebuild`; `--check` mode runs as part of `lint` and
  fails on drift, and also rejects a hex written by hand into `globals.css`.
- `scripts/check-colours.mjs` — the contrast table. Add a row to `IN_USE` whenever the
  markup starts rendering a pairing that is not already listed.
- `docs/colour-proof/` — screenshots showing a palette change reaching the built site, and
  the expanded palette in place.

### Where the five new colours are used

| Colour            | Where                                                                                                                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cardBackground`  | Differentiator cards 2 and 4 (`.element-panel--card`).                                                                                                                                   |
| `accentWarm`      | Differentiator card 3; the work tiles' status marker (`.media-tile-chip`); the category chips' wash (`.work-chip`); the process numeral on dark grounds (`.surface-dark .step-numeral`). |
| `accentHighlight` | The closing CTA's primary button on hover (`.cta-highlight`), once per page and nowhere else.                                                                                            |
| `sectionAlt`      | Every second dark section of a page, via `main > section.bg-ink ~ section.bg-ink` in globals.css.                                                                                        |
| `sectionWarm`     | Every second light section of a run, via `main > section.bg-canvas + section.bg-canvas`.                                                                                                 |

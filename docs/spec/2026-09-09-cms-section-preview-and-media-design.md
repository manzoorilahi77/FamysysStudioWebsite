# Section-scoped preview, and media an editor can actually change

_2026-09-09_

Three projects, shipped in order. Each is useful on its own; each is a prerequisite for the
next only in the sense that the one after it is dead weight without it.

- **A — Section-scoped preview.** Preview shows the block being edited, not the whole page.
- **B — Replace the file.** A media slot's file becomes editable, through the same
  save/draft/publish rails every other field already uses.
- **C — Video-capable slots.** Every place the site renders a picture can render a video
  instead, decided by the content rather than by the component.

---

## Why any of this

Two complaints, one screenshot each, and they turned out to have different causes.

**"Preview shows the whole page."** `PreviewFrame` locates the section by matching its
heading TEXT against the `h1/h2/h3` elements in the rendered page. That works only when the
panel's name for a block happens to be the words on it. It is not: the homepage's Hero is
called "Hero" and the word appears nowhere on the page; "Ways to Work With Us" is the
panel's name for a block whose rendered heading is `homepage.waysToWork.heading`, which is
different copy. Both fall through to "Showing the whole page." The DOM carries no section
identifier at all, so there is nothing better to aim at yet.

**"I can't see the images for this section."** Not a bug in the field UI. The homepage's
Ways to Work section is mapped as copy only — heading, body, two button labels, a read-only
list of tier names. The pictures on those tiles belong to the engagement tier records, which
ARE mapped, with an "Image" group, on the Ways to Work With Us page. The images are in the
panel; they are one screen away, and nothing on this screen says so.

And when you find them, only the alt text is editable. The panel says so plainly
(`MediaField`) rather than offering a control that does nothing — which was the right call
when there was no upload, and is the thing project B removes.

---

## A — Section-scoped preview

### The frame stays at the real route

`PreviewFrame`'s existing header argues this at length and it is not being overturned: the
preview is the page, rendered by the same server components through the same repositories
with draft mode on. Re-rendering a section into a fragment would be a second rendering that
agrees with the page until the day it does not, and would be trusted. What changes is not
WHAT is rendered but what the frame is AIMED at and how much of it is shown.

### Sections get a real anchor

Every mapped section renders `data-cms-section="<sectionId>"` on the element that IS that
section.

The mapping already exists. `SECTION_OF` in `composition.ts` is the one hand-written table
in this codebase that ties a React component to the section an editor calls it — it is what
builds the sidebar — and every component in it maps to exactly one section id across every
page that renders it (`Faq` is always `faq`, `FinalCta` is always `closing-cta`). So the
attribute is a property of the component, not of the page, and no page file has to pass it
down.

Two components render more than one section — `WorkGallery` is `filters`, `gallery` and
`piece-detail`; `ContactFormSection` is `form` and `next-steps`. Those carry an anchor per
section, inside.

**This is checked, not hoped for.** A test walks `SECTION_OF` against the rendered pages and
fails when a declared section has no anchor. A section added tomorrow and mapped without an
anchor fails the build rather than silently going back to whole-page preview.

### The frame is sized to the block

On load: find the anchor, measure it, set the iframe's height to the block's height (floored
so a short block is not a slit, capped at the current `70svh`/`80svh` so a tall one still
fits the screen), then scroll the frame so the block is at the top. Scroll rather than
transform, because the site's reveals are driven by `IntersectionObserver` against the
frame's viewport — a block scrolled into a frame that is its own height is genuinely in
view, and animates the way a visitor sees it. A transform would show it un-revealed.

The site's header is sticky, so the scroll target is offset by the header's measured height
and the frame is that much taller. The header floats over blank space above the block, which
is what it does on the real page.

A **"Show whole page"** toggle sits in the frame's header. Whole-page becomes the deliberate
choice rather than the failure mode.

### Failure stays honest

No anchor found — an unmapped block, a parse that failed, a page that could not be read —
falls back to the whole page and says which happened. It does not silently show the top of
the page and let it read as the section.

---

## B — Replace the file

### First, where a media path actually lives

Corrected after reading the store. A file path has TWO homes, not one, and the difference
decides how much of this is new work.

**Collection records** — the six capabilities, the five process steps, the four engagement
tiers, the case studies — keep their file in a STRUCTURAL COLUMN: `capabilities.media_path`,
`media_kind`, `media_ratio`, and the case studies carry two of each because the homepage
tile and the /selected-work cover are different pictures. These are real database columns,
already populated, already read.

**Page sections** — the About hero, the ecosystem and direction frames, the Services hero,
the Differentiator's four elements, the homepage's five hero bands — keep only their ALT
TEXT in the database. The path still comes from the TypeScript module even when
`CONTENT_SOURCE=database`. `DbMarketingContentRepository` is explicit about it: the band
labels and alt strings are read from the store and "zipped against the image paths the
content module still owns".

And in the TypeScript modules the path is not even a path. Six helpers — `servicesImage`,
`processImage`, `differentiatorImage`, `reasonImage`, `workImage`, `tierImage` — take a bare
FILE STEM and build `/media/${file}.jpg` with `kind: "image"` hardcoded. The extension and
the kind are in the helper, not in the content. So a stem can be swapped for another stem
and stay a JPEG forever; nothing in those files can express a video at all.

### The path becomes a value

The path becomes a `CmsValue` with a new `CmsValueKind` of `mediaSrc`, alongside
`mediaPoster` for a video's still. Once it is a value it saves to `content_drafts`, shows
the published path beside the drafted one, previews under draft mode, publishes with the
same optimistic-concurrency check, discards, and counts toward "this section has unpublished
edits" — all of that for free.

Two things do NOT come for free, and pretending otherwise is how the sidebar ends up
disagreeing with the site:

- **Publishing a collection record's path writes a column, not a string row.** The draft
  lives in `content_drafts` like any other, but the publish step routes it to
  `capabilities.media_path` rather than to `content_strings`. One explicit, named special
  case in the publish path — not a second write path, but not nothing either.
- **Page-section paths have no database home yet.** They get one: `content_strings` rows of
  kind `mediaSrc`, seeded from the values the TypeScript modules hold today. After that the
  module is the fallback store's copy, exactly as it already is for every other string.

`validateContentValue` gains the two kinds, validated by `MediaRef`/`Url` — the site's own
rules, not a second set — plus the constraint that a path must be site-root and under
`/media/`.

### The static store refuses, and says so

Under `CONTENT_SOURCE=static` a media path could only be changed by rewriting a call in a
content file, and a VIDEO could not be expressed at all without adding a poster argument
that is not there — the file writer replaces literals, it does not add arguments.

So the static store refuses a media-file change with the message it already uses for the
things it cannot do: "Set CONTENT_SOURCE=database." That is an existing, tested pattern in
`StaticCmsRepository`, not a new kind of failure, and production runs on the database.

### Upload

`POST /admin/api/media`, session-guarded like every other admin route.

- Accepts a file. Extension allow-list AND a magic-byte sniff, because an extension is a
  claim the uploader makes.
- Size cap, enforced before the bytes are read into memory.
- Written to `public/media` under a **content-hashed filename**. An upload therefore never
  overwrites a file another record still points at, and re-uploading identical bytes is
  idempotent rather than a second copy.
- Inserts the `media_assets` row that `005_media_assets.sql` already schemas — the table was
  built for this and has been waiting for it.
- Returns the site-root path.

The path lands in the field as an **unsaved change**. It is not on the site until Save and
then Publish, exactly like a word. The upload writes a file; it does not publish one.

### The panel says where images live

The gap that produced the second complaint is closed directly: a section that renders media
it does not own says so, and links to the record that does. "The pictures on these tiles are
edited on Ways to Work With Us →" is one line and it is the difference between "there are no
images here" and "the images are over there".

---

## C — Video-capable slots

Today every media slot renders `next/image` directly — fifteen call sites, none of which
branches on `media.kind`. `MediaView` already carries `kind` and `poster`; nothing reads
them. So a video uploaded through B would be handed to an `<img>`.

### One component decides

A single `<Media>` component replaces those fifteen call sites and branches on `kind`. The
slots keep their own sizing, ratio and classes — `Media` decides only what element renders
inside them.

Video renders as a moving image: `autoPlay muted loop playsInline`, no controls, `poster`
always set. `prefers-reduced-motion` renders the poster still instead — the codebase already
threads that preference through these sections and it is not being dropped here.

### The poster is not optional

`MediaRef.create` throws `"video media requires a poster image."` That invariant is kept
rather than relaxed: a slot with no still has a flash of black on a slow connection, and the
rule exists to prevent it.

The still is produced at upload time, in the browser: the chosen video is loaded into a
`<video>`, seeked about a second in, drawn to a canvas and uploaded as a second asset. The
designer picks one file. The grabbed frame is shown, and can be re-picked if that second of
the video is a bad one.

The still is taken BEFORE anything is uploaded. A browser that cannot decode the video
refuses the whole replacement rather than leaving an uploaded video with no poster — which
would be an orphaned file and a save that cannot succeed.

And because the two are one decision, they are validated as one: `validateContentValue`
judges a file against the poster THIS SAVE will leave beside it, not against what is stored.
Judging against storage would reject the only save that can ever be legal — the one that
sets both at once.

No `ffmpeg`, no server-side decoding — this deploys to shared hosting behind PM2, and a
native binary dependency is not something to introduce for a poster frame.

---

## Order, and what depends on what

**A, then B, then C.** A is independent and fixes what was on screen. C without B is a
capability nothing can reach: no video can enter the content, so no slot would ever render
one. B without C is still useful on its own — swapping a JPEG is the thing that gets done
this month — and it is the piece that makes C worth building.

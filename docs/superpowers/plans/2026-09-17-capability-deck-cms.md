# Capability Deck CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the admin CMS to fully manage Capability Deck — all copy, images, Google Drive video embeds and CSP-restricted website embeds across its slides — with add/remove/reorder for slides and for repeatable gallery content, reusing the site's existing CMS architecture end to end.

**Architecture:** Capability Deck is not one of the site's 7 fixed pages and stays that way. It gets its own parallel domain/application/infrastructure stack that reuses the existing `CmsRecord`/`CmsFieldGroup`/`CmsValue`/`CmsMedia`/`CmsItemGroup` vocabulary, the existing `ContentStore` (`content_strings`/`content_drafts`) draft/publish/version machinery, the existing `MediaField`/`ValueField`/`RecordFields` UI, `ValidateContentValue`, `UploadMedia`, the session gate and the preview (`draftMode()`) mechanism — verbatim, not reimplemented. Two new structural tables (`deck_slides`, `deck_items`) hold identity/order/media-path the same way `capabilities`/`process_steps`/`engagement_tiers` already do. The public `/capability-deck` route is converted from a static `content.ts` import into a server-rendered read of the published deck, with `content.ts` demoted to seed/fallback source — the exact static/database duality every other page already has.

**Tech Stack:** Next.js App Router, TypeScript strict, MySQL 8 (mysql2), Vitest, React 19 (client-only deck renderer via `next/dynamic`).

**Spec:** This conversation's brief (CMS for Capability Deck and its slides) plus the Step 1 investigation report above, and the user's three decisions: (a) restrict new website-gallery entries to the current CSP-allowed origins with a named-origins error; Drive video entries stay a validated ID/URL field; slides support add/remove/reorder.

## Global Constraints

- Do not touch the 7 fixed pages, their `CmsPage`/`CmsRepository`/`buildPages()` code, or their CMS entries. Capability Deck is additive and parallel.
- Do not deploy. No migration or seed runs against the real remote database in this plan — every DB step ends with "verify locally / dry-run," not "apply to production."
- Reuse existing components (`MediaField`, `ValueField`, `RecordFields`, `ValidateContentValue`, `UploadMedia`, session gate, `ContentStore`, `revalidatePath` pattern) — do not fork logic that already exists generically.
- CSP: new website-gallery entries (`previewUrl`/`liveUrl`/`embedUrl`) are restricted to the exact origins already allowlisted in `middleware.ts`'s deck CSP. A URL outside that list is refused at Save with a message naming every allowed origin. `middleware.ts` itself is never CMS-writable.
- Keyboard operable throughout; every action gives feedback; nothing silently discards work; concurrency uses the existing optimistic-version/conflict mechanism.
- Coverage target and TDD workflow per the project's testing rules: write the failing test first for every application-layer and domain-layer unit.
- `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test` must stay green after every task that touches shipped code.

---

## File Structure

```
src/domain/shared/value-objects/DriveVideoUrl.ts          new
src/domain/shared/value-objects/AllowedWebsiteUrl.ts       new
src/shared/site/deckPreviewOrigins.ts                      new (single source of truth for allowlisted origins)
src/domain/cms/entities/ContentAddress.ts                  modify (widen `kind` union)
src/domain/cms/entities/CmsRecord.ts                        modify (widen `CmsValueKind` union)
src/application/cms/ValidateContentValue.ts                 modify (2 new switch cases)
src/middleware.ts                                            modify (import shared origin list)

src/domain/capability-deck/entities/DeckSlideCatalog.ts     new
src/domain/capability-deck/entities/CapabilityDeckDocument.ts new
src/domain/capability-deck/repositories/CapabilityDeckRepository.ts new

db/migrations/015_capability_deck.sql                        new

src/infrastructure/capability-deck/deckRecords.ts            new (pure CmsRecord[] builders, shared by both repos)
src/infrastructure/capability-deck/StaticCapabilityDeckRepository.ts new
src/infrastructure/capability-deck/DbCapabilityDeckRepository.ts new
src/infrastructure/di/adminContainer.ts                      modify (add `capabilityDeck`)
src/infrastructure/di/container.ts                           modify (add published-read-only accessor for the public route)
scripts/db-seed.ts                                            modify (seed deck_slides/deck_items/content_strings for the deck)

src/application/capability-deck/EditDeckSlide.ts             new
src/application/capability-deck/ManageDeckRecords.ts         new
src/application/capability-deck/GetCapabilityDeckNavigation.ts new
src/application/capability-deck/__fakes__/FakeCapabilityDeckRepository.ts new

src/app/admin/api/capability-deck/save/route.ts              new
src/app/admin/api/capability-deck/publish/route.ts            new
src/app/admin/api/capability-deck/discard/route.ts            new
src/app/admin/api/capability-deck/slides/route.ts             new
src/app/admin/api/capability-deck/items/route.ts              new
src/app/admin/api/shared.ts                                   modify (generalize target parsing for deck target shape)

src/presentation/admin/lib/useDeckSlideEditor.ts              new (parallel to useSectionEditor.ts — not a modification of it)
src/presentation/admin/components/DeckRecordFields.tsx        new (adds ↑/↓ reorder controls RecordFields.tsx has no need of)
src/presentation/admin/components/DeckSlideEditor.tsx         new (parallel to SectionEditor.tsx — not a modification of it)
src/presentation/admin/components/AdminSidebar.tsx            modify (new Capability Deck nav group)
src/presentation/admin/views/CapabilityDeckScreen.tsx         new (slide list, add/remove/reorder)
src/presentation/admin/views/CapabilityDeckSlideScreen.tsx    new (one slide's editor)
src/app/admin/(panel)/capability-deck/page.tsx                new
src/app/admin/(panel)/capability-deck/[slide]/page.tsx        new

src/presentation/capability-deck/data/content.ts              modify (add `coverContent`, `ctaContent` exports; everything else unchanged, stays the seed source)
src/presentation/capability-deck/CapabilityDeck.tsx            modify (slides driven by published order/catalog, content via props)
src/presentation/capability-deck/CapabilityDeckMount.tsx       modify (thread `content` prop through)
src/presentation/capability-deck/slides/*.tsx                  modify (read content via props, not static import)
src/presentation/capability-deck/slides/ServicesSlide.tsx      modify (grid: fixed 3-col → auto-fit, for variable count)
src/presentation/capability-deck/slides/WaysToWorkSlide.tsx    modify (grid: fixed 4-col → auto-fit, for variable count)
src/presentation/capability-deck/slides/HowWeWorkSlide.tsx     modify (same content-via-props treatment; re-enabled)
src/app/capability-deck/page.tsx                                modify (server-read published deck, pass down)
```

---

## Task 1: Domain value objects for the two special field kinds

**Files:**
- Create: `src/domain/shared/value-objects/DriveVideoUrl.ts`
- Create: `src/domain/shared/value-objects/DriveVideoUrl.test.ts`
- Create: `src/domain/shared/value-objects/AllowedWebsiteUrl.ts`
- Create: `src/domain/shared/value-objects/AllowedWebsiteUrl.test.ts`
- Create: `src/shared/site/deckPreviewOrigins.ts`
- Modify: `src/middleware.ts:121-136`

**Interfaces:**
- Produces: `DriveVideoUrl.create(value: string): DriveVideoUrl` (throws `InvalidDriveVideoUrlError`), `.toString()` returns canonical `https://drive.google.com/file/d/<ID>/preview`.
- Produces: `AllowedWebsiteUrl.create(value: string): AllowedWebsiteUrl` (throws `InvalidWebsiteOriginError`, message lists every allowed origin), `.toString()` returns the input trimmed.
- Produces: `DECK_PREVIEW_ORIGINS: ReadonlyArray<string>` — the 8 non-Drive, non-`'self'` origins.
- Consumes (Task 5 onward): both classes and the constant.

- [ ] **Step 1: Write the failing tests**

```typescript
// src/domain/shared/value-objects/DriveVideoUrl.test.ts
import { describe, expect, it } from "vitest";
import { DriveVideoUrl } from "./DriveVideoUrl";

describe("DriveVideoUrl", () => {
  it("normalizes a /view URL to the canonical /preview form", () => {
    const url = DriveVideoUrl.create("https://drive.google.com/file/d/1RnvYjZq6x727HBbUsALsJwxuKrLvePXS/view");
    expect(url.toString()).toBe("https://drive.google.com/file/d/1RnvYjZq6x727HBbUsALsJwxuKrLvePXS/preview");
  });

  it("normalizes an open?id= URL", () => {
    const url = DriveVideoUrl.create("https://drive.google.com/open?id=1RnvYjZq6x727HBbUsALsJwxuKrLvePXS");
    expect(url.toString()).toBe("https://drive.google.com/file/d/1RnvYjZq6x727HBbUsALsJwxuKrLvePXS/preview");
  });

  it("accepts an already-canonical /preview URL unchanged", () => {
    const url = DriveVideoUrl.create("https://drive.google.com/file/d/1RnvYjZq6x727HBbUsALsJwxuKrLvePXS/preview");
    expect(url.toString()).toBe("https://drive.google.com/file/d/1RnvYjZq6x727HBbUsALsJwxuKrLvePXS/preview");
  });

  it("rejects a URL with no recognisable Drive file id", () => {
    expect(() => DriveVideoUrl.create("https://example.com/video.mp4")).toThrow(
      /Google Drive/,
    );
  });

  it("rejects an empty string", () => {
    expect(() => DriveVideoUrl.create("   ")).toThrow();
  });
});
```

```typescript
// src/domain/shared/value-objects/AllowedWebsiteUrl.test.ts
import { describe, expect, it } from "vitest";
import { AllowedWebsiteUrl } from "./AllowedWebsiteUrl";
import { DECK_PREVIEW_ORIGINS } from "../../../shared/site/deckPreviewOrigins";

describe("AllowedWebsiteUrl", () => {
  it("accepts a URL whose origin is on the allowlist", () => {
    const url = AllowedWebsiteUrl.create("https://www.bashafood.in/");
    expect(url.toString()).toBe("https://www.bashafood.in/");
  });

  it("accepts a path under an allowed origin", () => {
    const url = AllowedWebsiteUrl.create("https://ferrobid.aspirasys.in/#/home");
    expect(url.toString()).toBe("https://ferrobid.aspirasys.in/#/home");
  });

  it("rejects a URL whose origin is not on the allowlist, naming every allowed origin", () => {
    expect(() => AllowedWebsiteUrl.create("https://not-allowed.example/")).toThrowError(
      new RegExp(DECK_PREVIEW_ORIGINS.map((o) => o.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")),
    );
  });

  it("rejects a malformed URL", () => {
    expect(() => AllowedWebsiteUrl.create("not a url")).toThrow();
  });

  it("rejects javascript: and data: schemes even if the host string matches", () => {
    expect(() => AllowedWebsiteUrl.create("javascript:alert(1)")).toThrow();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/domain/shared/value-objects/DriveVideoUrl.test.ts src/domain/shared/value-objects/AllowedWebsiteUrl.test.ts`
Expected: FAIL — modules do not exist yet.

- [ ] **Step 3: Write `deckPreviewOrigins.ts`**

```typescript
// src/shared/site/deckPreviewOrigins.ts

/**
 * THE SINGLE SOURCE FOR "WHICH LIVE SITES MAY BE FRAMED ON THE CAPABILITY DECK."
 *
 * `middleware.ts`'s deck CSP and the CMS's `AllowedWebsiteUrl` value object both read this
 * list rather than keeping their own copies. That is the fix for the exact failure mode
 * flagged during the CMS's design: a website-gallery entry that validates in the panel but
 * is not in the CSP's `frame-src` renders as a silent empty iframe on the live page. One
 * list, imported twice, makes that drift structurally impossible instead of merely
 * documented against.
 *
 * Adding a new origin here immediately does two things: the CMS accepts it as a
 * `previewUrl`/`liveUrl`/`embedUrl`, and the CSP allows it to be framed. Nothing else needs
 * to change. Removing one does the reverse — any content still pointing at it fails
 * validation on its next save, which is the intended way to notice.
 */
export const DECK_PREVIEW_ORIGINS: ReadonlyArray<string> = [
  // The Presentation category's embed — the parent company's own corporate deck.
  "https://famysys.com",
  // The Websites gallery, in the same order as `websiteProjects` in the deck's content.
  "https://www.bashafood.in",
  "https://ferrobid.aspirasys.in",
  "https://royal.aspirasys.in",
  "https://studiominiminds.com",
  "https://kkmkeychains.in",
  "https://tnhajsociety.org",
  "https://bvaglobal.ai",
];
```

- [ ] **Step 4: Write `DriveVideoUrl.ts`**

```typescript
// src/domain/shared/value-objects/DriveVideoUrl.ts
import { DomainError } from "../errors/DomainError";

export class InvalidDriveVideoUrlError extends DomainError {
  constructor(value: string) {
    super(
      `"${value}" is not a Google Drive file link. Paste the share link for a Drive video ` +
        `— it looks like https://drive.google.com/file/d/<id>/view or .../open?id=<id>.`,
    );
    this.name = "InvalidDriveVideoUrlError";
  }
}

/** Mirrors VideoGallery.tsx's own `driveFileId()` — same two shapes, same precedence. */
function driveFileId(value: string): string | null {
  const fileMatch = value.match(/\/file\/d\/([^/?#]+)/);
  if (fileMatch?.[1]) return fileMatch[1];
  const openMatch = value.match(/[?&]id=([^&]+)/);
  return openMatch?.[1] ?? null;
}

export class DriveVideoUrl {
  private constructor(private readonly fileId: string) {}

  static create(value: string): DriveVideoUrl {
    const trimmed = value.trim();
    const fileId = trimmed ? driveFileId(trimmed) : null;
    if (!fileId) {
      throw new InvalidDriveVideoUrlError(value);
    }
    return new DriveVideoUrl(fileId);
  }

  toString(): string {
    return `https://drive.google.com/file/d/${this.fileId}/preview`;
  }
}
```

- [ ] **Step 5: Write `AllowedWebsiteUrl.ts`**

```typescript
// src/domain/shared/value-objects/AllowedWebsiteUrl.ts
import { DomainError } from "../errors/DomainError";
import { DECK_PREVIEW_ORIGINS } from "../../../shared/site/deckPreviewOrigins";

export class InvalidWebsiteOriginError extends DomainError {
  constructor(value: string) {
    super(
      `"${value}" is not on the list of sites this deck is allowed to display live. It has ` +
        `to be the exact address of one of: ${DECK_PREVIEW_ORIGINS.join(", ")}. Anything else ` +
        "would save here but show as a blank frame on the live page, so it is refused now " +
        "instead — use a screenshot image for a site that isn't on this list, or ask a " +
        "developer to add its origin to the allowlist.",
    );
    this.name = "InvalidWebsiteOriginError";
  }
}

export class AllowedWebsiteUrl {
  private constructor(private readonly value: string) {}

  static create(value: string): AllowedWebsiteUrl {
    const trimmed = value.trim();
    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      throw new InvalidWebsiteOriginError(value);
    }
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      throw new InvalidWebsiteOriginError(value);
    }
    if (!DECK_PREVIEW_ORIGINS.includes(parsed.origin)) {
      throw new InvalidWebsiteOriginError(value);
    }
    return new AllowedWebsiteUrl(trimmed);
  }

  toString(): string {
    return this.value;
  }
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run src/domain/shared/value-objects/DriveVideoUrl.test.ts src/domain/shared/value-objects/AllowedWebsiteUrl.test.ts`
Expected: PASS, all 10 cases.

- [ ] **Step 7: Point `middleware.ts` at the shared constant**

Replace lines 121-136 of `src/middleware.ts`:

```typescript
import { DECK_PREVIEW_ORIGINS } from "./shared/site/deckPreviewOrigins";

const DECK_FRAME_SOURCES = [
  "'self'",
  // The 23 Selected Work clips, as Drive's own /preview player.
  "https://drive.google.com",
  // The parent company's corporate deck, the Websites gallery's live-framed sites, and any
  // other origin the Capability Deck CMS is allowed to display live — see
  // deckPreviewOrigins.ts for why this is imported rather than repeated here.
  ...DECK_PREVIEW_ORIGINS,
];
```

(The `import` line goes with the file's other top-of-file imports, not inline where shown above — place it under the existing `NextResponse`/`NextRequest` imports at the top of the file.)

- [ ] **Step 8: Run the full test suite and typecheck**

Run: `npx vitest run && npm run typecheck`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/domain/shared/value-objects/DriveVideoUrl.ts src/domain/shared/value-objects/DriveVideoUrl.test.ts src/domain/shared/value-objects/AllowedWebsiteUrl.ts src/domain/shared/value-objects/AllowedWebsiteUrl.test.ts src/shared/site/deckPreviewOrigins.ts src/middleware.ts
git commit -m "feat: add Drive-video and allowlisted-website value objects for the deck CMS"
```

---

## Task 2: Widen the shared CMS domain types and validator

**Files:**
- Modify: `src/domain/cms/entities/ContentAddress.ts:17`
- Modify: `src/domain/cms/entities/CmsRecord.ts:49-58`
- Modify: `src/application/cms/ValidateContentValue.ts:1-6,100-176`
- Modify: `src/application/cms/ValidateContentValue.test.ts` (add cases)

**Interfaces:**
- Consumes: `DriveVideoUrl`, `AllowedWebsiteUrl` from Task 1.
- Produces: `ContentAddress["kind"]` now includes `"deck_slide" | "deck_item"`. `CmsValueKind` now includes `"driveVideoId" | "websiteOrigin"`. Both are additive union widenings — every existing call site that matches on the old members keeps compiling unchanged.

- [ ] **Step 1: Write the failing validator tests**

Add to `src/application/cms/ValidateContentValue.test.ts` (existing file — append these `describe` blocks, following the file's existing style of one `describe` per kind):

```typescript
describe("driveVideoId", () => {
  const field = { id: "src", label: "Video", value: "", kind: "driveVideoId" as const, multiline: false, approval: "drafted" as const, usedElsewhere: [] };

  it("accepts a Drive share link", () => {
    expect(validateContentValue(field, "https://drive.google.com/file/d/abc123/view")).toBeNull();
  });

  it("rejects a non-Drive URL", () => {
    expect(validateContentValue(field, "https://example.com/video.mp4")).toMatch(/Google Drive/);
  });

  it("rejects empty", () => {
    expect(validateContentValue(field, "")).toBe("This cannot be empty.");
  });
});

describe("websiteOrigin", () => {
  const field = { id: "previewUrl", label: "Live preview", value: "", kind: "websiteOrigin" as const, multiline: false, approval: "drafted" as const, usedElsewhere: [] };

  it("accepts an allowlisted origin", () => {
    expect(validateContentValue(field, "https://www.bashafood.in/")).toBeNull();
  });

  it("rejects an origin that is not allowlisted, naming the allowed ones", () => {
    const message = validateContentValue(field, "https://not-allowed.example/");
    expect(message).toMatch(/bashafood\.in/);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/application/cms/ValidateContentValue.test.ts`
Expected: FAIL — `"driveVideoId"`/`"websiteOrigin"` are not valid `CmsValueKind` values yet (TypeScript error) and the switch has no case for them.

- [ ] **Step 3: Widen `ContentAddress.kind`**

In `src/domain/cms/entities/ContentAddress.ts`, change line 17:

```typescript
// Before
readonly kind: "page_section" | "collection_record";

// After
/**
 * "deck_slide" and "deck_item" address the Capability Deck's own parallel structure — a
 * slide, or a repeatable card inside one (a video, a website entry, a print image). The
 * deck is not one of the seven fixed pages, so it does not use "page_section", but its
 * writes go through this same address/edit/conflict machinery rather than a second one.
 */
readonly kind: "page_section" | "collection_record" | "deck_slide" | "deck_item";
```

- [ ] **Step 4: Widen `CmsValueKind`**

In `src/domain/cms/entities/CmsRecord.ts`, change the `CmsValueKind` union (lines 49-58):

```typescript
export type CmsValueKind =
  | "text"
  | "ctaLabel"
  | "url"
  | "mediaAlt"
  | "mediaSrc"
  | "mediaPoster"
  | "seoTitle"
  | "seoDescription"
  | "seoCanonical"
  /** A Google Drive share link/id, normalized to its `/preview` embed form — see DriveVideoUrl. */
  | "driveVideoId"
  /** A URL whose origin must be on the deck's CSP allowlist — see AllowedWebsiteUrl. */
  | "websiteOrigin";
```

- [ ] **Step 5: Add the two switch cases to `ValidateContentValue.ts`**

Add the import (with the file's other value-object imports, line ~5):

```typescript
import { AllowedWebsiteUrl } from "../../domain/shared/value-objects/AllowedWebsiteUrl";
import { DriveVideoUrl } from "../../domain/shared/value-objects/DriveVideoUrl";
```

Add two cases to the `switch (target.kind)` block, alongside the existing `case "url":` (order does not matter, placed after `"url"` for readability):

```typescript
      case "driveVideoId":
        DriveVideoUrl.create(candidate);
        return null;
      case "websiteOrigin":
        AllowedWebsiteUrl.create(candidate);
        return null;
```

- [ ] **Step 6: Run tests, typecheck, and the full suite**

Run: `npx vitest run && npm run typecheck`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/domain/cms/entities/ContentAddress.ts src/domain/cms/entities/CmsRecord.ts src/application/cms/ValidateContentValue.ts src/application/cms/ValidateContentValue.test.ts
git commit -m "feat: widen CMS address/value kinds for deck slides, Drive video ids and restricted website URLs"
```

---

## Task 3: Capability Deck domain entities and repository interface

**Files:**
- Create: `src/domain/capability-deck/entities/DeckSlideCatalog.ts`
- Create: `src/domain/capability-deck/entities/CapabilityDeckDocument.ts`
- Create: `src/domain/capability-deck/repositories/CapabilityDeckRepository.ts`

**Interfaces:**
- Consumes: `CmsRecord`, `CmsItemGroup`, `canChangeItems` from `domain/cms/entities/CmsRecord.ts`; `ContentAddress`, `ContentFieldAddress` from `domain/cms/entities/ContentAddress.ts`; `ContentEdit`, `ContentConflictError`, `NewCmsRecord` from `domain/cms/repositories/CmsRepository.ts` (imported, not redeclared).
- Produces: `DECK_SLIDE_CATALOG`, `DeckSlideCatalogEntry`, `CapabilityDeckDocument`, `DeckSlideSummary`, `CapabilityDeckRepository` — consumed by every later task.

This task has no test of its own (it is pure type/constant declarations); it is verified by every later task's tests compiling against it.

- [ ] **Step 1: Write `DeckSlideCatalog.ts`**

```typescript
// src/domain/capability-deck/entities/DeckSlideCatalog.ts

/**
 * THE SEVEN SLIDE TYPES THAT EXIST IN CODE, AND THAT IS A DIFFERENT FACT FROM WHICH ONES
 * ARE CURRENTLY IN THE DECK.
 *
 * A slide is a bespoke React component (CoverSlide, WhoWeAreSlide, ...), not a generic
 * template — so "add a slide" cannot mean inventing an arbitrary new layout from a form the
 * way adding a capability card can. What it safely means, and what this catalog exists to
 * support, is: an editor may bring any of these seven known slide types into the deck, take
 * one out, and reorder the ones that are in. A slide type not in this list does not exist
 * yet and needs a developer to build its component first, exactly the way How We Work
 * already exists in code today but is not currently placed in the deck.
 *
 * `slideKey` matches `SlideEntry.id` in CapabilityDeck.tsx and is the `deck_slides.slide_key`
 * / `content_strings.owner_key` this whole feature addresses a slide by.
 */
export interface DeckSlideCatalogEntry {
  readonly slideKey: string;
  readonly label: string;
}

export const DECK_SLIDE_CATALOG: ReadonlyArray<DeckSlideCatalogEntry> = [
  { slideKey: "cover", label: "Cover" },
  { slideKey: "who-we-are", label: "Who We Are" },
  { slideKey: "how-we-work", label: "How We Work" },
  { slideKey: "services", label: "Services" },
  { slideKey: "selected-work", label: "Selected Work" },
  { slideKey: "ways-to-work", label: "Ways to Work" },
  { slideKey: "lets-talk", label: "Let's Talk" },
];

export function catalogLabel(slideKey: string): string {
  return DECK_SLIDE_CATALOG.find((entry) => entry.slideKey === slideKey)?.label ?? slideKey;
}
```

- [ ] **Step 2: Write `CapabilityDeckDocument.ts`**

```typescript
// src/domain/capability-deck/entities/CapabilityDeckDocument.ts
import type { CmsRecord } from "../../cms/entities/CmsRecord";
import type { DeckSlideCatalogEntry } from "./DeckSlideCatalog";

/**
 * THE WHOLE DECK, AS THE PANEL SEES IT — the parallel to `CmsPage`, but for the one screen
 * that is not a fixed page.
 *
 * `slides` is ordered and IS the deck: what is in it, and in what order, is exactly what
 * renders at /capability-deck. `availableSlides` is the rest of `DECK_SLIDE_CATALOG` — the
 * slide types that exist in code but are not currently placed, and so are what "Add a
 * slide" offers a choice from.
 */
export interface CapabilityDeckDocument {
  readonly slides: ReadonlyArray<CmsRecord>;
  readonly availableSlides: ReadonlyArray<DeckSlideCatalogEntry>;
  readonly updatedAt: Date | null;
}
```

- [ ] **Step 3: Write `CapabilityDeckRepository.ts`**

```typescript
// src/domain/capability-deck/repositories/CapabilityDeckRepository.ts
import type { ContentAddress, ContentFieldAddress } from "../../cms/entities/ContentAddress";
import type { ContentEdit, NewCmsRecord } from "../../cms/repositories/CmsRepository";
import type { CapabilityDeckDocument } from "../entities/CapabilityDeckDocument";

export { ContentConflictError } from "../../cms/repositories/CmsRepository";
export type { ContentEdit, NewCmsRecord };

/**
 * THE DECK'S OWN REPOSITORY — the parallel to `CmsRepository`, scoped to the one screen
 * that is not a fixed page.
 *
 * It shares `ContentEdit`/`ContentAddress`/`ContentFieldAddress`/`ContentConflictError`
 * with the seven pages' repository rather than declaring its own: a save, a publish, a
 * conflict and a version mean the same thing here as they do everywhere else in the panel,
 * and reusing the types is what keeps that true by construction.
 *
 * SLIDES AND ITEMS ARE BOTH "RECORDS THAT COME AND GO", but they are two different runs —
 * a slide is a top-level entry in `slides`; an item is a repeatable card inside one slide's
 * `CmsItemGroup` (a video, a website entry, a print image, a service, an engagement tier).
 * That is why there are two add/remove/reorder trios rather than one generic pair: a slide
 * add needs a slide TYPE (from `DECK_SLIDE_CATALOG`) and a position; an item add needs a
 * `collectionId` (which `CmsItemGroup` it belongs to) the same way `CmsRepository.createRecord`
 * already does for the seven pages' open collections.
 */
export interface CapabilityDeckRepository {
  getDeck(): Promise<CapabilityDeckDocument>;

  saveDrafts(edits: ReadonlyArray<ContentEdit>): Promise<void>;
  publishDrafts(owners: ReadonlyArray<ContentAddress>): Promise<ReadonlyArray<ContentFieldAddress>>;
  discardDrafts(owners: ReadonlyArray<ContentAddress>): Promise<void>;

  /** False for the static-file fallback — writing there would desync it from the database. */
  readonly supportsDraftPreview: boolean;
  readonly supportsRecordChanges: boolean;

  /** Brings a known-but-not-placed slide type into the deck, after `afterSlideId` (or first, if null). */
  addSlide(slideKey: string, afterSlideId: string | null): Promise<void>;
  /** Removes a slide from the deck. Its saved content is not deleted, only its placement. */
  removeSlide(slideId: string): Promise<void>;
  reorderSlides(orderedSlideIds: ReadonlyArray<string>): Promise<void>;

  createItem(collectionId: string, record: NewCmsRecord): Promise<string>;
  deleteItem(collectionId: string, itemId: string): Promise<void>;
  reorderItems(collectionId: string, orderedItemIds: ReadonlyArray<string>): Promise<void>;

  logActivity(entry: { readonly action: "saved" | "published" | "previewed"; readonly sectionLabel?: string }): Promise<void>;
}
```

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: PASS (no consumers yet, so this only checks the files above parse and their imports resolve).

- [ ] **Step 5: Commit**

```bash
git add src/domain/capability-deck
git commit -m "feat: add Capability Deck domain entities and repository interface"
```

---

## Task 4: Database schema — `deck_slides`, `deck_items`, and the widened ENUMs

**Files:**
- Create: `db/migrations/015_capability_deck.sql`
- Modify: `db/README.md` (add one row to the migrations table)

**Interfaces:**
- Produces: tables `deck_slides(id, slide_key, sort_order, created_at, updated_at)` and `deck_items(id, item_key, collection_id, sort_order, media_path, media_kind, created_at, updated_at)`; widened `content_strings.owner_kind`/`content_drafts.owner_kind` ENUMs (add `'deck_slide'`, `'deck_item'`); widened `content_strings.value_kind` ENUM (add `'driveVideoId'`, `'websiteOrigin'`).
- Consumes: nothing — this is the base of the DB-side stack Tasks 7-8 build on.

This is schema, not application code, so there is no red/green unit cycle — verification is running the migration against a local/dev database and checking it applied cleanly, never against the production database.

- [ ] **Step 1: Write the migration**

```sql
-- db/migrations/015_capability_deck.sql
--
-- THE CAPABILITY DECK'S OWN STRUCTURE, alongside the seven pages' rather than inside it.
--
-- deck_slides is which of the seven known slide types (see DeckSlideCatalog.ts) is
-- currently placed in the deck, and in what order -- a slide_key present here is "in the
-- deck"; one from the catalog absent here is "known in code, not currently shown", which is
-- exactly what the panel's "Add a slide" offers a choice from.
--
-- deck_items is every repeatable card inside a slide's item groups -- a Selected Work
-- video, a Selected Work website entry, a print-gallery image, a Services category, a Ways
-- to Work engagement tier -- one row each, ordered by sort_order the same way
-- capabilities/process_steps/engagement_tiers already are. `collection_id` is the same
-- kind of closed, code-only key CREATABLE_COLLECTIONS already uses
-- ("selected-work:ugc", "selected-work:websites", "selected-work:print-design:banners",
-- "services:categories", "ways-to-work:engagements", "how-we-work:steps") -- never a
-- string a request supplies verbatim into a query.
--
-- media_path/media_kind are populated only for image-kind items (the print gallery); a
-- video item's Drive link and a website item's URL are plain copy, validated by
-- 'driveVideoId'/'websiteOrigin' and stored in content_strings like any other field --
-- exactly the split capabilities.media_path already draws between a structural file and
-- copy that describes it.
--
-- Every editable STRING on a slide or an item -- its title, its Drive link, its website
-- URL, an alt text -- lives in content_strings, addressed
-- ('deck_slide', '<slideKey>', '<field>') or ('deck_item', '<collectionId>:<slug>', '<field>'),
-- which is why those two owner_kind values are added to the existing ENUM rather than a
-- parallel strings table being created for them.

CREATE TABLE IF NOT EXISTS deck_slides (
  id         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  slide_key  VARCHAR(64)   NOT NULL COMMENT 'Matches DeckSlideCatalogEntry.slideKey and SlideEntry.id.',
  sort_order INT           NOT NULL DEFAULT 0,
  created_at DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_deck_slides_key (slide_key)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS deck_items (
  id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  item_key      VARCHAR(160)  NOT NULL COMMENT '"<collectionId>:<slug>" -- the owner_key content_strings addresses this item by.',
  collection_id VARCHAR(96)   NOT NULL COMMENT 'Which item group this card belongs to -- a closed, code-only key.',
  media_path    VARCHAR(191)  NULL COMMENT 'Set only for image-kind collections (the print gallery).',
  media_kind    ENUM('image','video') NULL,
  sort_order    INT           NOT NULL DEFAULT 0,
  created_at    DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at    DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_deck_items_key (item_key),
  KEY ix_deck_items_collection (collection_id, sort_order)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Widen the two owner_kind ENUMs (previously 'page_section','collection_record','media_asset',
-- set in 003 and 008) to admit the deck's two owner kinds.
ALTER TABLE content_strings
  MODIFY COLUMN owner_kind ENUM(
    'page_section', 'collection_record', 'media_asset', 'deck_slide', 'deck_item'
  ) NOT NULL;

ALTER TABLE content_drafts
  MODIFY COLUMN owner_kind ENUM(
    'page_section', 'collection_record', 'media_asset', 'deck_slide', 'deck_item'
  ) NOT NULL;

-- Widen value_kind (previously widened in 012 and 014) to admit the deck's two field kinds.
ALTER TABLE content_strings
  MODIFY COLUMN value_kind ENUM(
    'text', 'ctaLabel', 'url', 'mediaAlt', 'mediaSrc', 'mediaPoster',
    'seoTitle', 'seoDescription', 'seoCanonical', 'driveVideoId', 'websiteOrigin'
  )
    NOT NULL DEFAULT 'text'
    COMMENT 'Which domain value object validates a write. Mirrors CmsValueKind.';
```

- [ ] **Step 2: Add the row to `db/README.md`'s migrations table**

Append to the table (after the `008_content_drafts.sql` row, or after whatever the last row is by the time this runs):

```markdown
| `015_capability_deck.sql`   | `deck_slides`/`deck_items`, and the deck's owner/value kinds.      |
```

- [ ] **Step 3: Verify against a local/dev database only — never production**

Run: `npm run db:migrate -- --dry`
Expected: lists `015_capability_deck.sql` as pending, applies nothing.

Run: `npm run db:migrate` (against your local `.env.local` database, not the remote one)
Expected: reports the migration applied; `npm run db:status` shows it recorded in `schema_migrations`.

- [ ] **Step 4: Commit**

```bash
git add db/migrations/015_capability_deck.sql db/README.md
git commit -m "feat(db): add deck_slides/deck_items and widen owner_kind/value_kind for the deck CMS"
```

---

## Task 5: `content.ts` additions + the read-model builders (`deckRecords.ts`)

**Design note — why there is no nested "category card inside a slide inside an item":**
`RecordFields.tsx`'s `Card` component renders a nested record's own `RecordFields` **without**
forwarding `onAdd`/`onRemove`, so today exactly one level of add/remove nesting is wired end to
end. Rather than extend that component for a need nothing else has, Selected Work's seven
portfolio categories are **flattened**: each category's fixed copy (its label, its process
input/output, its singleton fields) becomes a `FieldGroup` directly on the `selected-work`
slide record, and each category's repeatable content (videos, website entries, print images)
becomes its own top-level `CmsItemGroup` directly on that same slide record — never nested
inside a category "card". This uses `RecordFields.tsx` exactly as it stands, no component
change required, and keeps the categories themselves (which portfolio tabs exist, in what
order) fixed in code, matching how nothing in Step 1's investigation found them treated as
addable.

**Files:**
- Modify: `src/presentation/capability-deck/data/content.ts` (append `coverContent`, `ctaContent` — additive, nothing existing changes)
- Create: `src/infrastructure/capability-deck/deckRecords.ts`
- Create: `src/infrastructure/capability-deck/deckRecords.test.ts`

**Interfaces:**
- Consumes: `toRecord`, `media` from `infrastructure/cms/records.ts` (reused unchanged); `MediaRef` from `domain/shared/value-objects/MediaRef.ts`; `DECK_SLIDE_CATALOG` from Task 3.
- Produces: `CapabilityDeckSource` (the plain-object shape both the static and database repositories populate), `buildDeckSlideRecords(source: CapabilityDeckSource, updatedAt: Date | null): ReadonlyMap<string, CmsRecord>` — one entry per `DeckSlideCatalogEntry.slideKey`, consumed by Tasks 6-7 to assemble `CapabilityDeckDocument.slides` in whatever order+subset `deck_slides` says.

- [ ] **Step 1: Add `coverContent` and `ctaContent` to `content.ts`**

Append to `src/presentation/capability-deck/data/content.ts` (after the existing `portfolioCategories` export — purely additive, every existing export is untouched):

```typescript
// Promoted out of CoverSlide.tsx's inline JSX literals so the cover has a real content
// home the same way every other slide does — see docs/capability-deck-port.md for why
// these two slides originally had none.
export const coverContent = {
  brand: 'Famysys Studio',
  headlineLine1: 'Where creativity',
  headlineAccent: 'meets speed.',
  supporting: 'Design • Video • AI Content • Motion • Product Visuals',
  decorativeLabel: 'Corporate Deck',
  logoMark: '/capability-deck/famysys-logo.png',
}

// Promoted out of CTASlide.tsx's inline JSX literals — copy sourced from the live
// studio.famysys.com contact/CTA section, unchanged from what was already there.
export const ctaContent = {
  headline: "Have a creative requirement? Let's talk.",
  body: "Tell us what you're trying to create. We'll help you determine the right approach, scope and production model.",
  ctaLabel: 'Start a Conversation',
  ctaHref: 'https://studio.famysys.com/',
  caption: 'Project-based when you need it. Ongoing when you need more.',
}
```

- [ ] **Step 2: Write the failing test for the builder**

```typescript
// src/infrastructure/capability-deck/deckRecords.test.ts
import { describe, expect, it } from "vitest";
import { buildDeckSlideRecords } from "./deckRecords";
import * as content from "../../presentation/capability-deck/data/content";
import type { CapabilityDeckSource } from "./deckRecords";

function fixtureSource(): CapabilityDeckSource {
  return {
    cover: content.coverContent,
    whoWeAre: content.whoWeAre,
    processSteps: content.processSteps,
    serviceCategories: content.serviceCategories,
    engagementModels: content.engagementModels,
    portfolioCategories: content.portfolioCategories,
    cta: content.ctaContent,
  };
}

describe("buildDeckSlideRecords", () => {
  it("builds one record per catalog slide key", () => {
    const records = buildDeckSlideRecords(fixtureSource(), null);
    expect([...records.keys()]).toEqual([
      "cover", "who-we-are", "how-we-work", "services", "selected-work", "ways-to-work", "lets-talk",
    ]);
  });

  it("who-we-are exposes the headline as an editable text field", () => {
    const record = buildDeckSlideRecords(fixtureSource(), null).get("who-we-are")!;
    const group = record.groups.find((g) => g.label === "Headline & copy")!;
    const headline = group.values.find((v) => v.label === "Headline")!;
    expect(headline.value).toBe(content.whoWeAre.headline);
    expect(headline.kind).toBe("text");
  });

  it("who-we-are's highlights are not an open item group (fixed at two)", () => {
    const record = buildDeckSlideRecords(fixtureSource(), null).get("who-we-are")!;
    expect(record.items.some((g) => g.label === "Highlights")).toBe(false);
  });

  it("services exposes an open item group of category cards", () => {
    const record = buildDeckSlideRecords(fixtureSource(), null).get("services")!;
    const group = record.items.find((g) => g.collectionId === "services:categories")!;
    expect(group.canChange).toBe(true);
    expect(group.records).toHaveLength(content.serviceCategories.length);
  });

  it("selected-work exposes one item group per video-bearing category, each keyed by a driveVideoId field", () => {
    const record = buildDeckSlideRecords(fixtureSource(), null).get("selected-work")!;
    const ugc = record.items.find((g) => g.collectionId === "selected-work:ugc")!;
    expect(ugc.records.length).toBeGreaterThan(0);
    const firstVideo = ugc.records[0]!;
    const srcField = firstVideo.groups[0]!.values.find((v) => v.kind === "driveVideoId")!;
    expect(srcField.value).toMatch(/drive\.google\.com/);
  });

  it("selected-work's website entries expose previewUrl/liveUrl as websiteOrigin fields", () => {
    const record = buildDeckSlideRecords(fixtureSource(), null).get("selected-work")!;
    const websites = record.items.find((g) => g.collectionId === "selected-work:websites")!;
    const basha = websites.records.find((r) => r.id === "basha")!;
    const previewUrl = basha.groups[0]!.values.find((v) => v.label === "Live preview URL")!;
    expect(previewUrl.kind).toBe("websiteOrigin");
    expect(previewUrl.value).toBe("https://www.bashafood.in/");
  });

  it("selected-work's print galleries expose an image media block per subcategory", () => {
    const record = buildDeckSlideRecords(fixtureSource(), null).get("selected-work")!;
    const banners = record.items.find((g) => g.collectionId === "selected-work:print:banners")!;
    expect(banners.records[0]!.groups[0]!.media).toHaveLength(1);
  });

  it("cover and lets-talk read their copy from the new content.ts exports", () => {
    const records = buildDeckSlideRecords(fixtureSource(), null);
    const cover = records.get("cover")!;
    expect(cover.groups[0]!.values.some((v) => v.value === content.coverContent.headlineLine1)).toBe(true);
    const cta = records.get("lets-talk")!;
    expect(cta.groups[0]!.values.some((v) => v.value === content.ctaContent.headline)).toBe(true);
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `npx vitest run src/infrastructure/capability-deck/deckRecords.test.ts`
Expected: FAIL — `./deckRecords` does not exist.

- [ ] **Step 4: Write `deckRecords.ts`**

```typescript
// src/infrastructure/capability-deck/deckRecords.ts
import type { CmsFieldGroup, CmsItemGroup, CmsRecord, CmsValueKind } from "../../domain/cms/entities/CmsRecord";
import { MediaRef } from "../../domain/shared/value-objects/MediaRef";
import { media, toRecord } from "../cms/records";
import type { GroupInput, ItemGroupInput, ListInput, ValueInput } from "../cms/records";

/**
 * THE DECK'S OWN SOURCE SHAPE — the same plain objects `data/content.ts` already exports,
 * named here so both repositories (Task 6: static, Task 7: database) can produce one and
 * this file does not need to know which produced it.
 *
 * `portfolioCategories` keeps content.ts's own shape (see types.ts's `PortfolioCategory`)
 * rather than a deck-specific reshaping: the seven categories are structurally fixed (see
 * the design note above this task), so there is nothing to gain from inventing a second
 * shape for data that is read exactly once, here.
 */
export interface CapabilityDeckSource {
  readonly cover: {
    readonly brand: string;
    readonly headlineLine1: string;
    readonly headlineAccent: string;
    readonly supporting: string;
    readonly decorativeLabel: string;
    readonly logoMark: string;
  };
  readonly whoWeAre: {
    readonly headline: string;
    readonly copy: string;
    readonly highlights: ReadonlyArray<{ readonly title: string; readonly copy: string }>;
    readonly established: string;
    readonly locations: string;
    readonly visionMission: ReadonlyArray<{ readonly title: string; readonly copy: string }>;
  };
  readonly processSteps: ReadonlyArray<{ readonly index: string; readonly title: string; readonly copy: string }>;
  readonly serviceCategories: ReadonlyArray<{
    readonly title: string;
    readonly tagline: string;
    readonly examples: ReadonlyArray<string>;
  }>;
  readonly engagementModels: ReadonlyArray<{
    readonly tag: string;
    readonly title: string;
    readonly audience: string;
    readonly examples: ReadonlyArray<string>;
  }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- content.ts's own type, imported by the two repositories that populate this field
  readonly portfolioCategories: ReadonlyArray<any>;
  readonly cta: {
    readonly headline: string;
    readonly body: string;
    readonly ctaLabel: string;
    readonly ctaHref: string;
    readonly caption: string;
  };
}

/** A plain editable line, with no static-file pointer — see Task 5's design note on why. */
function textField(label: string, value: string, kind: CmsValueKind = "text"): ValueInput {
  return { label, value, kind, multiline: false };
}

function paragraphField(label: string, value: string): ValueInput {
  return { label, value, kind: "text", multiline: true };
}

/** A list with no per-item pointer — items are still fully writable; see Task 5's design note. */
function textList(label: string, items: ReadonlyArray<string>): ListInput {
  return { label, items };
}

const PLACEHOLDER_ASPECT_RATIO = "16:9";

function imageMedia(label: string, path: string, alt: string): ReturnType<typeof media> {
  return media(
    label,
    MediaRef.create({ kind: "image", src: path, alt, aspectRatio: PLACEHOLDER_ASPECT_RATIO }),
    undefined,
  );
}

// ---------------------------------------------------------------------------
// Cover
// ---------------------------------------------------------------------------

function coverRecord(source: CapabilityDeckSource, updatedAt: Date | null): CmsRecord {
  const { cover } = source;
  return toRecord({
    id: "cover",
    title: "Cover",
    summary: "The opening slide — brand, headline and the deck's own background mark.",
    updatedAt,
    groups: [
      {
        label: "Headline & copy",
        values: [
          textField("Eyebrow", cover.brand),
          textField("Headline, first line", cover.headlineLine1),
          textField("Headline, accent", cover.headlineAccent),
          textField("Supporting line", cover.supporting),
          textField("Corner label", cover.decorativeLabel),
        ],
        media: [imageMedia("Background mark", cover.logoMark, "")],
      },
    ],
  });
}

// ---------------------------------------------------------------------------
// Who We Are — highlights and vision/mission are fixed at two: the layout is a 2-column
// grid built for exactly that count, so neither is an open item group.
// ---------------------------------------------------------------------------

function whoWeAreRecord(source: CapabilityDeckSource, updatedAt: Date | null): CmsRecord {
  const { whoWeAre } = source;
  const groups: GroupInput[] = [
    {
      label: "Headline & copy",
      values: [
        textField("Headline", whoWeAre.headline),
        paragraphField("Copy", whoWeAre.copy),
        textField("Established", whoWeAre.established),
        textField("Locations", whoWeAre.locations),
      ],
    },
    ...whoWeAre.highlights.map((h, i): GroupInput => ({
      label: `Highlight ${i + 1}`,
      description: "Fixed at two — the layout is a two-column grid built for this count.",
      values: [textField("Title", h.title), paragraphField("Copy", h.copy)],
    })),
    ...whoWeAre.visionMission.map((v, i): GroupInput => ({
      label: `Vision/Mission ${i + 1}`,
      description: "Fixed at two — the layout is a two-column grid built for this count.",
      values: [textField("Title", v.title), paragraphField("Copy", v.copy)],
    })),
  ];

  return toRecord({
    id: "who-we-are",
    title: "Who We Are",
    summary: "Headline, the two highlights and the two vision/mission statements.",
    updatedAt,
    groups,
  });
}

// ---------------------------------------------------------------------------
// How We Work and Services share one shape — an ordered set of {title, copy} cards.
// Services' grid was fixed at 3 columns / 2 rows for exactly 6 cards (see Task 16, which
// switches it to `repeat(auto-fit, minmax(...))` so this open item group is safe to add to).
// ---------------------------------------------------------------------------

function stepLikeRecord(
  slideId: string,
  title: string,
  summary: string,
  collectionId: string,
  cards: ReadonlyArray<{ readonly title: string; readonly copy: string }>,
  updatedAt: Date | null,
): CmsRecord {
  return toRecord({
    id: slideId,
    title,
    summary,
    updatedAt,
    items: [
      {
        label: title,
        collectionId,
        canChange: true,
        records: cards.map((card, index) =>
          toRecord({
            id: `${collectionId}-${index}`,
            title: card.title,
            summary: card.copy,
            updatedAt,
            groups: [{ label: "Copy", values: [textField("Title", card.title), paragraphField("Copy", card.copy)] }],
          }),
        ),
      },
    ],
  });
}

function howWeWorkRecord(source: CapabilityDeckSource, updatedAt: Date | null): CmsRecord {
  return stepLikeRecord(
    "how-we-work",
    "How We Work",
    "The five (or however many) stages of a project.",
    "how-we-work:steps",
    source.processSteps.map((s) => ({ title: s.title, copy: s.copy })),
    updatedAt,
  );
}

function servicesRecord(source: CapabilityDeckSource, updatedAt: Date | null): CmsRecord {
  const record = toRecord({
    id: "services",
    title: "Services",
    summary: "The service categories shown as cards.",
    updatedAt,
    items: [
      {
        label: "Services",
        collectionId: "services:categories",
        canChange: true,
        records: source.serviceCategories.map((category, index) =>
          toRecord({
            id: `services-categories-${index}`,
            title: category.title,
            summary: category.tagline,
            updatedAt,
            groups: [
              {
                label: "Copy",
                values: [textField("Title", category.title), textField("Tagline", category.tagline)],
                lists: [textList("Examples", category.examples)],
              },
            ],
          }),
        ),
      },
    ],
  });
  return record;
}

// ---------------------------------------------------------------------------
// Ways to Work — engagement tiers. The grid is fixed at 4 columns for exactly 4 cards (see
// Task 16), and each card's example list only shows its first 5 entries on the slide.
// ---------------------------------------------------------------------------

function waysToWorkRecord(source: CapabilityDeckSource, updatedAt: Date | null): CmsRecord {
  return toRecord({
    id: "ways-to-work",
    title: "Ways to Work",
    summary: "The engagement models shown as cards.",
    updatedAt,
    items: [
      {
        label: "Engagement models",
        collectionId: "ways-to-work:engagements",
        canChange: true,
        records: source.engagementModels.map((tier, index) =>
          toRecord({
            id: `ways-to-work-engagements-${index}`,
            title: tier.title,
            summary: tier.audience,
            updatedAt,
            groups: [
              {
                label: "Copy",
                values: [
                  textField("Tag", tier.tag),
                  textField("Title", tier.title),
                  paragraphField("Audience", tier.audience),
                ],
                lists: [
                  {
                    label: "Examples",
                    items: tier.examples,
                    readOnlyReason: undefined,
                  } as ListInput,
                ],
              },
            ],
          }),
        ),
      },
    ],
  });
}

// ---------------------------------------------------------------------------
// Let's Talk (CTA)
// ---------------------------------------------------------------------------

function ctaRecord(source: CapabilityDeckSource, updatedAt: Date | null): CmsRecord {
  const { cta } = source;
  return toRecord({
    id: "lets-talk",
    title: "Let's Talk",
    summary: "The closing call to action.",
    updatedAt,
    groups: [
      {
        label: "Copy",
        values: [
          textField("Headline", cta.headline),
          paragraphField("Body", cta.body),
          textField("Button label", cta.ctaLabel, "ctaLabel"),
          textField("Button link", cta.ctaHref, "url"),
          textField("Caption", cta.caption),
        ],
      },
    ],
  });
}

// ---------------------------------------------------------------------------
// Selected Work — flattened per the design note: one field group per category for its
// fixed copy, one top-level item group per category's repeatable content.
// ---------------------------------------------------------------------------

interface DeckVideoLike { readonly title: string; readonly src: string; }
interface DeckProjectLike {
  readonly key: string; readonly title: string; readonly category: string; readonly summary: string;
  readonly bullets: ReadonlyArray<string>; readonly url: string;
  readonly previewUrl?: string; readonly liveUrl?: string; readonly image?: string;
}
interface DeckImageLike { readonly key?: string; readonly title?: string; readonly image?: string; }

function videoItemGroup(label: string, collectionId: string, videos: ReadonlyArray<DeckVideoLike>, updatedAt: Date | null): ItemGroupInput {
  return {
    label,
    collectionId,
    canChange: true,
    records: videos.map((video, index) =>
      toRecord({
        id: `${collectionId}-${index}`,
        title: video.title,
        summary: video.src,
        updatedAt,
        groups: [
          {
            label: "Copy",
            values: [textField("Title", video.title), textField("Google Drive link", video.src, "driveVideoId")],
          },
        ],
      }),
    ),
  };
}

function websiteItemGroup(projects: ReadonlyArray<DeckProjectLike>, updatedAt: Date | null): ItemGroupInput {
  return {
    label: "Websites",
    collectionId: "selected-work:websites",
    canChange: true,
    records: projects.map((project) =>
      toRecord({
        id: project.key,
        title: project.title,
        summary: project.summary,
        updatedAt,
        groups: [
          {
            label: "Copy",
            values: [
              textField("Title", project.title),
              textField("Category", project.category),
              paragraphField("Summary", project.summary),
              textField("Full-deck link", project.url, "url"),
              ...(project.previewUrl !== undefined
                ? [textField("Live preview URL", project.previewUrl, "websiteOrigin")]
                : []),
              ...(project.liveUrl !== undefined
                ? [textField("Opens instead of framing (live URL)", project.liveUrl, "url")]
                : []),
            ],
            lists: [textList("Bullets", project.bullets)],
            ...(project.image !== undefined
              ? { media: [imageMedia("Fallback screenshot", project.image, `${project.title} screenshot`)] }
              : {}),
          },
        ],
      }),
    ),
  };
}

function printItemGroup(label: string, collectionId: string, images: ReadonlyArray<DeckImageLike>, updatedAt: Date | null): ItemGroupInput {
  return {
    label,
    collectionId,
    canChange: true,
    records: images.map((image, index) => {
      const title = image.title ?? `${label} ${index + 1}`;
      return toRecord({
        id: image.key ?? `${collectionId}-${index}`,
        title,
        summary: label,
        updatedAt,
        groups: [
          {
            label: "Image",
            values: [textField("Title", title)],
            media: [imageMedia("File", image.image ?? "", `${title}`)],
          },
        ],
      });
    }),
  };
}

function selectedWorkRecord(source: CapabilityDeckSource, updatedAt: Date | null): CmsRecord {
  const byKey = new Map(source.portfolioCategories.map((c) => [c.key as string, c]));
  const groups: GroupInput[] = [];
  const items: ItemGroupInput[] = [];

  for (const key of ["ugc", "motion-graphics", "synthesia", "ai-video"] as const) {
    const category = byKey.get(key);
    if (!category) continue;
    groups.push({
      label: `${category.label} — copy`,
      values: [
        textField("Tab label", category.label),
        ...(category.process
          ? [paragraphField("What you send (input)", category.process.input), paragraphField("What comes back (output)", category.process.output)]
          : []),
      ],
    });
    items.push(videoItemGroup(`${category.label} videos`, `selected-work:${key}`, category.videos ?? [], updatedAt));
  }

  const websites = byKey.get("websites");
  if (websites) {
    groups.push({ label: "Websites — copy", values: [textField("Tab label", websites.label)] });
    items.push(websiteItemGroup(websites.projects ?? [], updatedAt));
  }

  const print = byKey.get("print-design");
  if (print) {
    groups.push({
      label: "Digital Print & Design — copy",
      values: [
        textField("Tab label", print.label),
        ...(print.copy ? [paragraphField("Tab intro", print.copy)] : []),
        ...(print.process
          ? [paragraphField("What you send (input)", print.process.input), paragraphField("What comes back (output)", print.process.output)]
          : []),
      ],
    });
    for (const sub of print.subcategories ?? []) {
      items.push(printItemGroup(`${sub.label}`, `selected-work:print:${sub.key}`, sub.images ?? [], updatedAt));
    }
  }

  const presentation = byKey.get("presentation");
  if (presentation) {
    groups.push({
      label: "Presentation — copy",
      values: [
        textField("Tab label", presentation.label),
        textField("Title", presentation.title ?? ""),
        textField("Category", presentation.category ?? ""),
        paragraphField("Summary", presentation.summary ?? ""),
        textField("Full-deck link", presentation.url ?? "", "url"),
        textField("Embed URL", presentation.embedUrl ?? "", "websiteOrigin"),
      ],
      lists: [textList("Bullets", presentation.bullets ?? [])],
    });
  }

  return toRecord({
    id: "selected-work",
    title: "Selected Work",
    summary: "The seven portfolio categories: their copy, and every video, website entry and print image inside them.",
    updatedAt,
    groups,
    items,
  });
}

// ---------------------------------------------------------------------------

const BUILDERS: ReadonlyArray<[string, (source: CapabilityDeckSource, updatedAt: Date | null) => CmsRecord]> = [
  ["cover", coverRecord],
  ["who-we-are", whoWeAreRecord],
  ["how-we-work", howWeWorkRecord],
  ["services", servicesRecord],
  ["selected-work", selectedWorkRecord],
  ["ways-to-work", waysToWorkRecord],
  ["lets-talk", ctaRecord],
];

/** One `CmsRecord` per catalog slide key, in `DECK_SLIDE_CATALOG` order — never filtered here. */
export function buildDeckSlideRecords(
  source: CapabilityDeckSource,
  updatedAt: Date | null,
): ReadonlyMap<string, CmsRecord> {
  return new Map(BUILDERS.map(([slideKey, build]) => [slideKey, build(source, updatedAt)]));
}
```

- [ ] **Step 5: Run tests, then typecheck**

Run: `npx vitest run src/infrastructure/capability-deck/deckRecords.test.ts && npm run typecheck`
Expected: PASS. If a field group label or item id in a test does not match — fix the test or the builder to agree, whichever is wrong; do not loosen an assertion to paper over a real mismatch.

- [ ] **Step 6: Commit**

```bash
git add src/presentation/capability-deck/data/content.ts src/infrastructure/capability-deck/deckRecords.ts src/infrastructure/capability-deck/deckRecords.test.ts
git commit -m "feat: build Capability Deck slide records from a shared source shape"
```

---

## Task 6: `StaticCapabilityDeckRepository` (read from `content.ts`, refuse every write)

**Files:**
- Create: `src/infrastructure/capability-deck/StaticCapabilityDeckRepository.ts`
- Create: `src/infrastructure/capability-deck/StaticCapabilityDeckRepository.test.ts`

**Interfaces:**
- Consumes: `CapabilityDeckRepository` (Task 3), `buildDeckSlideRecords`/`CapabilityDeckSource` (Task 5), `DECK_SLIDE_CATALOG` (Task 3), `* as content` from `presentation/capability-deck/data/content.ts`.
- Produces: `StaticCapabilityDeckRepository` — used directly when `contentSource() === "static"`, and reused by Task 8's seed script to get the exact `CmsRecord[]` it seeds from.

- [ ] **Step 1: Write the failing tests**

```typescript
// src/infrastructure/capability-deck/StaticCapabilityDeckRepository.test.ts
import { describe, expect, it } from "vitest";
import { StaticCapabilityDeckRepository } from "./StaticCapabilityDeckRepository";

describe("StaticCapabilityDeckRepository", () => {
  it("returns every catalog slide, in catalog order, none marked available", async () => {
    const repo = new StaticCapabilityDeckRepository();
    const deck = await repo.getDeck();
    expect(deck.slides.map((s) => s.id)).toEqual([
      "cover", "who-we-are", "how-we-work", "services", "selected-work", "ways-to-work", "lets-talk",
    ]);
    expect(deck.availableSlides).toEqual([]);
  });

  it("refuses to save a draft, naming the switch to make", async () => {
    const repo = new StaticCapabilityDeckRepository();
    await expect(
      repo.saveDrafts([{ address: { kind: "deck_slide", key: "cover", field: "eyebrow" }, value: "x", baseValue: "y" }]),
    ).rejects.toThrow(/CONTENT_SOURCE=database/);
  });

  it("refuses to add a slide, a website entry, or a reorder", async () => {
    const repo = new StaticCapabilityDeckRepository();
    await expect(repo.addSlide("how-we-work", null)).rejects.toThrow(/CONTENT_SOURCE=database/);
    await expect(repo.createItem("selected-work:websites", { slug: "x", title: "x", summary: "x" })).rejects.toThrow(/CONTENT_SOURCE=database/);
    await expect(repo.reorderSlides(["cover"])).rejects.toThrow(/CONTENT_SOURCE=database/);
  });

  it("reports it cannot preview drafts or change records", () => {
    const repo = new StaticCapabilityDeckRepository();
    expect(repo.supportsDraftPreview).toBe(false);
    expect(repo.supportsRecordChanges).toBe(false);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/infrastructure/capability-deck/StaticCapabilityDeckRepository.test.ts`
Expected: FAIL — file does not exist.

- [ ] **Step 3: Write the repository**

```typescript
// src/infrastructure/capability-deck/StaticCapabilityDeckRepository.ts
import { DECK_SLIDE_CATALOG } from "../../domain/capability-deck/entities/DeckSlideCatalog";
import type { CapabilityDeckDocument } from "../../domain/capability-deck/entities/CapabilityDeckDocument";
import type { CapabilityDeckRepository } from "../../domain/capability-deck/repositories/CapabilityDeckRepository";
import * as content from "../../presentation/capability-deck/data/content";
import { buildDeckSlideRecords } from "./deckRecords";
import type { CapabilityDeckSource } from "./deckRecords";

const NO_STORE =
  "The Capability Deck cannot be edited while the site reads its content from the TypeScript " +
  "files: there is nowhere to hold a draft, a version, or a slide's position. Set CONTENT_SOURCE=database.";

/** The exact object every method below reads content.ts's exports into — see deckRecords.ts. */
export function staticDeckSource(): CapabilityDeckSource {
  return {
    cover: content.coverContent,
    whoWeAre: content.whoWeAre,
    processSteps: content.processSteps,
    serviceCategories: content.serviceCategories,
    engagementModels: content.engagementModels,
    portfolioCategories: content.portfolioCategories,
    cta: content.ctaContent,
  };
}

/**
 * THE FILE-BACKED FALLBACK — read-only in the same sense the seven pages' file-backed
 * store is read-only for structural changes. Every slide is always present, in catalog
 * order, because there is no `deck_slides` table here to say otherwise: the TypeScript
 * files have exactly the slides CapabilityDeck.tsx's own array names, always all of them.
 *
 * Reused by `scripts/db-seed.ts`, which is the ONE caller that needs this class's read
 * side and never its writes — see Task 8.
 */
export class StaticCapabilityDeckRepository implements CapabilityDeckRepository {
  readonly supportsDraftPreview = false;
  readonly supportsRecordChanges = false;

  async getDeck(): Promise<CapabilityDeckDocument> {
    const records = buildDeckSlideRecords(staticDeckSource(), null);
    return {
      slides: DECK_SLIDE_CATALOG.map((entry) => records.get(entry.slideKey)).filter(
        (record): record is NonNullable<typeof record> => record !== undefined,
      ),
      availableSlides: [],
      updatedAt: null,
    };
  }

  async saveDrafts(): Promise<void> {
    throw new Error(NO_STORE);
  }
  async publishDrafts(): Promise<never> {
    throw new Error(NO_STORE);
  }
  async discardDrafts(): Promise<void> {
    throw new Error(NO_STORE);
  }
  async addSlide(): Promise<void> {
    throw new Error(NO_STORE);
  }
  async removeSlide(): Promise<void> {
    throw new Error(NO_STORE);
  }
  async reorderSlides(): Promise<void> {
    throw new Error(NO_STORE);
  }
  async createItem(): Promise<string> {
    throw new Error(NO_STORE);
  }
  async deleteItem(): Promise<void> {
    throw new Error(NO_STORE);
  }
  async reorderItems(): Promise<void> {
    throw new Error(NO_STORE);
  }
  async logActivity(): Promise<void> {
    // No store to log against — a no-op, the same shape StaticCmsRepository's own
    // activity log takes (see its `supportsActivityLog = false`).
  }
}
```

- [ ] **Step 4: Run tests and typecheck**

Run: `npx vitest run src/infrastructure/capability-deck/StaticCapabilityDeckRepository.test.ts && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/infrastructure/capability-deck/StaticCapabilityDeckRepository.ts src/infrastructure/capability-deck/StaticCapabilityDeckRepository.test.ts
git commit -m "feat: add the file-backed (read-only) Capability Deck repository"
```

---

## Task 7: `DbCapabilityDeckRepository` (the real read/write store)

**Files:**
- Create: `src/infrastructure/capability-deck/DbCapabilityDeckRepository.ts`
- Create: `src/infrastructure/capability-deck/DbCapabilityDeckRepository.test.ts` (structure/logic covered with a mocked pool the way the project's other DB repository tests do — see `infrastructure/db/repositories/parity.test.ts` for the existing convention to follow)

**Interfaces:**
- Consumes: everything Task 6 does, plus `transaction`/`write` from `infrastructure/db/pool.ts`, `cachedRows` from `infrastructure/db/content/cache.ts`, `ContentStore`/`ContentOwnerKind` from `infrastructure/db/content/ContentStore.ts`, `derivedId` from `infrastructure/cms/records.ts`, `ContentConflictError` (re-exported from Task 3's repository module).
- Produces: `DbCapabilityDeckRepository`, used by `adminContainer` (Task 9) whenever `CONTENT_SOURCE=database` and by the public route's published-only read (also Task 9).

**Design note — how a value's `field_key` is found without hand-duplicating every label:**
`buildDeckSlideRecords` derives every field's id from its label via `derivedId()` (see `records.ts`) —
`"Google Drive link"` always becomes `google-drive-link`, deterministically. `content_strings` is
seeded with exactly those `field_key`s (Task 8 seeds by walking the same builder's output). So a
read never needs a second, hand-maintained map from label to key: it derives the same key the
builder already derives, from the same label, via the same function. One generic accessor
(`resolveText` below) is used everywhere a field's live value is needed, for every slide and every
item kind alike.

- [ ] **Step 1: Write the failing tests**

```typescript
// src/infrastructure/capability-deck/DbCapabilityDeckRepository.test.ts
import { describe, expect, it, vi, beforeEach } from "vitest";

const rows = vi.hoisted(() => ({ deckSlides: [] as any[], deckItems: [] as any[], contentStrings: [] as any[] }));

vi.mock("../db/content/cache", () => ({
  cachedRows: vi.fn(async (sql: string) => {
    if (sql.includes("FROM deck_slides")) return rows.deckSlides;
    if (sql.includes("FROM deck_items")) return rows.deckItems;
    if (sql.includes("FROM content_strings")) return rows.contentStrings;
    return [];
  }),
}));
vi.mock("../db/pool", () => ({
  transaction: vi.fn(async (fn: any) => fn({ execute: vi.fn(async () => [[], {}]) })),
  write: vi.fn(async () => ({ affectedRows: 1 })),
}));

import { DbCapabilityDeckRepository } from "./DbCapabilityDeckRepository";

beforeEach(() => {
  rows.deckSlides = [
    { slide_key: "cover", sort_order: 0, updated_at: "2026-01-01 00:00:00.000" },
    { slide_key: "who-we-are", sort_order: 1, updated_at: "2026-01-01 00:00:00.000" },
  ];
  rows.deckItems = [];
  rows.contentStrings = [];
});

describe("DbCapabilityDeckRepository.getDeck", () => {
  it("orders slides by deck_slides.sort_order and lists the rest as available", async () => {
    const repo = new DbCapabilityDeckRepository();
    const deck = await repo.getDeck();
    expect(deck.slides.map((s) => s.id)).toEqual(["cover", "who-we-are"]);
    expect(deck.availableSlides.map((s) => s.slideKey)).toEqual([
      "how-we-work", "services", "selected-work", "ways-to-work", "lets-talk",
    ]);
  });

  it("overlays a published content_strings value onto the static-shaped field it matches by field_key", async () => {
    rows.contentStrings = [
      { owner_kind: "deck_slide", owner_key: "cover", field_key: "eyebrow", value: "Edited Brand" },
    ];
    const repo = new DbCapabilityDeckRepository();
    const deck = await repo.getDeck();
    const cover = deck.slides.find((s) => s.id === "cover")!;
    const eyebrow = cover.groups[0]!.values.find((v) => v.label === "Eyebrow")!;
    expect(eyebrow.value).toBe("Edited Brand");
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/infrastructure/capability-deck/DbCapabilityDeckRepository.test.ts`
Expected: FAIL — file does not exist.

- [ ] **Step 3: Write the repository**

```typescript
// src/infrastructure/capability-deck/DbCapabilityDeckRepository.ts
import type { RowDataPacket } from "mysql2/promise";
import { DECK_SLIDE_CATALOG } from "../../domain/capability-deck/entities/DeckSlideCatalog";
import type { CapabilityDeckDocument } from "../../domain/capability-deck/entities/CapabilityDeckDocument";
import type {
  CapabilityDeckRepository,
  ContentEdit,
  NewCmsRecord,
} from "../../domain/capability-deck/repositories/CapabilityDeckRepository";
import { ContentConflictError } from "../../domain/capability-deck/repositories/CapabilityDeckRepository";
import type { ContentAddress, ContentFieldAddress } from "../../domain/cms/entities/ContentAddress";
import type { CmsRecord } from "../../domain/cms/entities/CmsRecord";
import { hasUnpublishedEdits, recordTree, recordValues } from "../../domain/cms/entities/CmsRecord";
import { derivedId } from "../cms/records";
import { buildDeckSlideRecords } from "./deckRecords";
import { staticDeckSource } from "./StaticCapabilityDeckRepository";
import { cachedRows } from "../db/content/cache";
import { transaction, write } from "../db/pool";
import { toDate } from "../db/content/rows";

interface DeckSlideRow extends RowDataPacket {
  slide_key: string;
  sort_order: number;
  updated_at: string;
}
interface DeckItemRow extends RowDataPacket {
  item_key: string;
  collection_id: string;
  media_path: string | null;
  media_kind: "image" | "video" | null;
  sort_order: number;
}
interface ContentStringRow extends RowDataPacket {
  owner_kind: string;
  owner_key: string;
  field_key: string;
  value: string;
  version: number;
}
interface ContentDraftRow extends RowDataPacket {
  owner_kind: string;
  owner_key: string;
  field_key: string;
  value: string;
}

/** Every current content_strings/content_drafts row for the deck's two owner kinds, indexed for O(1) lookup. */
async function loadStrings(): Promise<{
  published: Map<string, { value: string; version: number }>;
  drafts: Map<string, string>;
}> {
  const [publishedRows, draftRows] = await Promise.all([
    cachedRows<ContentStringRow>(
      "SELECT owner_kind, owner_key, field_key, value, version FROM content_strings WHERE owner_kind IN ('deck_slide','deck_item')",
    ),
    cachedRows<ContentDraftRow>(
      "SELECT owner_kind, owner_key, field_key, value FROM content_drafts WHERE owner_kind IN ('deck_slide','deck_item')",
    ),
  ]);
  const published = new Map(
    publishedRows.map((r) => [`${r.owner_kind}:${r.owner_key}:${r.field_key}`, { value: r.value, version: r.version }]),
  );
  const drafts = new Map(draftRows.map((r) => [`${r.owner_kind}:${r.owner_key}:${r.field_key}`, r.value]));
  return { published, drafts };
}

/**
 * THE ONE PLACE A LABEL BECOMES A LOOKUP. `derivedId(label)` is the exact function
 * `buildDeckSlideRecords` used to allocate this field's id — see the design note above.
 * Falls back to `fallback` (the static/seed value) when nothing has been published for
 * this field yet, the same way `ContentStore.optional()` behaves for a field with no row.
 */
function resolveText(
  published: Map<string, { value: string; version: number }>,
  ownerKind: "deck_slide" | "deck_item",
  ownerKey: string,
  label: string,
  fallback: string,
): string {
  const key = `${ownerKind}:${ownerKey}:${derivedId(label)}`;
  return published.get(key)?.value ?? fallback;
}

export class DbCapabilityDeckRepository implements CapabilityDeckRepository {
  readonly supportsDraftPreview = true;
  readonly supportsRecordChanges = true;

  async getDeck(): Promise<CapabilityDeckDocument> {
    const [slideRows, { published }] = await Promise.all([
      cachedRows<DeckSlideRow>("SELECT slide_key, sort_order, updated_at FROM deck_slides ORDER BY sort_order"),
      loadStrings(),
    ]);

    // The static-shaped build gives every field its id, label, kind and order; this pass
    // only asks "does content_strings have anything newer than the seed for this exact
    // field", by the id the static build already produced — never by re-deriving order.
    const staticRecords = buildDeckSlideRecords(staticDeckSource(), null);

    function overlayPublished(record: CmsRecord, ownerKind: "deck_slide" | "deck_item", ownerKey: string): CmsRecord {
      const groups = record.groups.map((group) => ({
        ...group,
        values: group.values.map((v) => ({ ...v, value: resolveText(published, ownerKind, ownerKey, v.label, v.value) })),
        lists: group.lists.map((list) => ({
          ...list,
          items: list.items.map((v) => ({ ...v, value: resolveText(published, ownerKind, ownerKey, v.label, v.value) })),
        })),
        media: group.media.map((m) => ({
          ...m,
          alt: { ...m.alt, value: resolveText(published, ownerKind, ownerKey, m.alt.label, m.alt.value) },
        })),
      }));
      return { ...record, groups };
    }

    const orderedSlideKeys = slideRows.map((r) => r.slide_key);
    const slides = orderedSlideKeys
      .map((slideKey) => {
        const built = staticRecords.get(slideKey);
        return built ? overlayPublished(built, "deck_slide", slideKey) : undefined;
      })
      .filter((r): r is CmsRecord => r !== undefined);

    const availableSlides = DECK_SLIDE_CATALOG.filter(
      (entry) => !orderedSlideKeys.includes(entry.slideKey),
    );

    const latest = slideRows.reduce<Date | null>((max, r) => {
      const d = toDate(r.updated_at);
      return d && (!max || d > max) ? d : max;
    }, null);

    return { slides, availableSlides, updatedAt: latest };
  }

  async saveDrafts(edits: ReadonlyArray<ContentEdit>): Promise<void> {
    if (edits.length === 0) return;
    await transaction(async (connection) => {
      for (const edit of edits) {
        const [rows] = await connection.execute(
          "SELECT version FROM content_strings WHERE owner_kind = ? AND owner_key = ? AND field_key = ? LIMIT 1",
          [edit.address.kind, edit.address.key, edit.address.field],
        );
        const current = (rows as unknown as ReadonlyArray<{ version: number }>)[0];
        if (edit.expectedVersion !== undefined && current && current.version !== edit.expectedVersion) {
          throw new ContentConflictError(
            "This field was changed by someone else since this screen was loaded. Reload the panel and make the change again.",
          );
        }
        await connection.execute(
          `INSERT INTO content_drafts (owner_kind, owner_key, field_key, value, base_version)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE value = VALUES(value), base_version = VALUES(base_version)`,
          [edit.address.kind, edit.address.key, edit.address.field, edit.value, current?.version ?? 1],
        );
        // A field with no content_strings row yet (nothing was ever seeded for it — a
        // brand-new item just created) still needs one to publish against.
        if (!current) {
          await connection.execute(
            `INSERT IGNORE INTO content_strings (owner_kind, owner_key, field_key, label, value, value_kind, version)
             VALUES (?, ?, ?, ?, '', 'text', 1)`,
            [edit.address.kind, edit.address.key, edit.address.field, edit.address.field],
          );
        }
      }
    });
  }

  async publishDrafts(owners: ReadonlyArray<ContentAddress>): Promise<ReadonlyArray<ContentFieldAddress>> {
    if (owners.length === 0) return [];
    return transaction(async (connection) => {
      const clause = owners.map(() => "(owner_kind = ? AND owner_key = ?)").join(" OR ");
      const parameters = owners.flatMap((o) => [o.kind, o.key]);
      const [rows] = await connection.execute(
        `SELECT owner_kind, owner_key, field_key, value, base_version FROM content_drafts WHERE ${clause} FOR UPDATE`,
        parameters,
      );
      const held = rows as unknown as ReadonlyArray<{ owner_kind: string; owner_key: string; field_key: string; value: string; base_version: number }>;
      if (held.length === 0) return [];

      for (const draft of held) {
        const [result] = await connection.execute(
          `UPDATE content_strings SET value = ?, version = version + 1
             WHERE owner_kind = ? AND owner_key = ? AND field_key = ? AND version = ?`,
          [draft.value, draft.owner_kind, draft.owner_key, draft.field_key, draft.base_version],
        );
        if ((result as { affectedRows: number }).affectedRows === 0) {
          throw new ContentConflictError(
            "One of these fields changed after this edit was saved, so nothing was published. Reload the panel and make the change again.",
          );
        }
      }
      await connection.execute(`DELETE FROM content_drafts WHERE ${clause}`, parameters);
      return held.map((d) => ({ kind: d.owner_kind as "deck_slide" | "deck_item", key: d.owner_key, field: d.field_key }));
    });
  }

  async discardDrafts(owners: ReadonlyArray<ContentAddress>): Promise<void> {
    if (owners.length === 0) return;
    const clause = owners.map(() => "(owner_kind = ? AND owner_key = ?)").join(" OR ");
    await write(`DELETE FROM content_drafts WHERE ${clause}`, owners.flatMap((o) => [o.kind, o.key]));
  }

  async addSlide(slideKey: string, afterSlideId: string | null): Promise<void> {
    if (!DECK_SLIDE_CATALOG.some((e) => e.slideKey === slideKey)) {
      throw new Error(`"${slideKey}" is not a known slide type.`);
    }
    await transaction(async (connection) => {
      const [rows] = await connection.execute("SELECT slide_key, sort_order FROM deck_slides ORDER BY sort_order");
      const existing = rows as unknown as ReadonlyArray<{ slide_key: string; sort_order: number }>;
      if (existing.some((r) => r.slide_key === slideKey)) {
        throw new Error("That slide is already in the deck.");
      }
      const afterIndex = afterSlideId ? existing.findIndex((r) => r.slide_key === afterSlideId) : -1;
      const insertAt = afterIndex === -1 ? existing.length : afterIndex + 1;
      const reordered = [...existing.map((r) => r.slide_key)];
      reordered.splice(insertAt, 0, slideKey);
      for (const [index, key] of reordered.entries()) {
        await connection.execute(
          `INSERT INTO deck_slides (slide_key, sort_order) VALUES (?, ?)
           ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order)`,
          [key, index],
        );
      }
    });
  }

  async removeSlide(slideId: string): Promise<void> {
    const result = await write("DELETE FROM deck_slides WHERE slide_key = ?", [slideId]);
    if (result.affectedRows === 0) {
      throw new Error("That slide is not currently in the deck.");
    }
  }

  async reorderSlides(orderedSlideIds: ReadonlyArray<string>): Promise<void> {
    await transaction(async (connection) => {
      for (const [index, slideKey] of orderedSlideIds.entries()) {
        await connection.execute("UPDATE deck_slides SET sort_order = ? WHERE slide_key = ?", [index, slideKey]);
      }
    });
  }

  async createItem(collectionId: string, record: NewCmsRecord): Promise<string> {
    const slug = derivedId(record.slug || record.title);
    if (!slug) throw new Error("A new entry needs a title it can make a stable key from.");
    const itemKey = `${collectionId}:${slug}`;
    const isImageCollection = collectionId.startsWith("selected-work:print:");
    return transaction(async (connection) => {
      const [existing] = await connection.execute("SELECT 1 FROM deck_items WHERE item_key = ? LIMIT 1", [itemKey]);
      if ((existing as unknown[]).length > 0) {
        throw new Error(`"${slug}" already exists here.`);
      }
      const [countRows] = await connection.execute(
        "SELECT COALESCE(MAX(sort_order), -1) AS maxOrder FROM deck_items WHERE collection_id = ?",
        [collectionId],
      );
      const nextOrder = ((countRows as unknown as ReadonlyArray<{ maxOrder: number }>)[0]?.maxOrder ?? -1) + 1;
      await connection.execute(
        `INSERT INTO deck_items (item_key, collection_id, media_path, media_kind, sort_order)
         VALUES (?, ?, ?, ?, ?)`,
        [itemKey, collectionId, isImageCollection ? "/media/placeholder.jpg" : null, isImageCollection ? "image" : null, nextOrder],
      );
      await connection.execute(
        `INSERT INTO content_strings (owner_kind, owner_key, field_key, label, value, value_kind, version)
         VALUES ('deck_item', ?, 'title', 'Title', ?, 'text', 1)`,
        [itemKey, record.title],
      );
      return slug;
    });
  }

  async deleteItem(collectionId: string, itemId: string): Promise<void> {
    const itemKey = `${collectionId}:${itemId}`;
    await transaction(async (connection) => {
      const [result] = await connection.execute("DELETE FROM deck_items WHERE item_key = ?", [itemKey]);
      if ((result as { affectedRows: number }).affectedRows === 0) {
        throw new Error("That entry is no longer there.");
      }
      await connection.execute("DELETE FROM content_strings WHERE owner_kind = 'deck_item' AND owner_key = ?", [itemKey]);
      await connection.execute("DELETE FROM content_drafts WHERE owner_kind = 'deck_item' AND owner_key = ?", [itemKey]);
    });
  }

  async reorderItems(collectionId: string, orderedItemIds: ReadonlyArray<string>): Promise<void> {
    await transaction(async (connection) => {
      for (const [index, itemId] of orderedItemIds.entries()) {
        await connection.execute("UPDATE deck_items SET sort_order = ? WHERE item_key = ?", [`${collectionId}:${itemId}`, index]);
      }
    });
  }

  async logActivity(entry: { readonly action: "saved" | "published" | "previewed"; readonly sectionLabel?: string }): Promise<void> {
    try {
      await write("INSERT INTO activity_log (action, page_label, section_label) VALUES (?, 'Capability Deck', ?)", [
        entry.action,
        entry.sectionLabel ?? null,
      ]);
    } catch (error: unknown) {
      console.error("[admin] Deck activity could not be logged:", (error as Error)?.name);
    }
  }
}
```

*Note for the implementer:* `deleteItem`'s parameter naming mirrors `CmsRepository.deleteRecord(collectionId, recordId)` where `recordId` is the bare slug — confirm against Task 11's use case that callers pass the bare slug (not the full `item_key`) so this matches.

- [ ] **Step 4: Run tests and typecheck**

Run: `npx vitest run src/infrastructure/capability-deck/DbCapabilityDeckRepository.test.ts && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/infrastructure/capability-deck/DbCapabilityDeckRepository.ts src/infrastructure/capability-deck/DbCapabilityDeckRepository.test.ts
git commit -m "feat: add the database-backed Capability Deck repository"
```

---

## Task 8: Extend `scripts/db-seed.ts` to seed the deck

**Files:**
- Modify: `scripts/db-seed.ts` (append a new section; nothing existing is restructured)

**Interfaces:**
- Consumes: `StaticCapabilityDeckRepository`/`staticDeckSource` (Task 6), `buildDeckSlideRecords` (Task 5), `recordTree`/`recordValues` from `domain/cms/entities/CmsRecord.ts`, `DECK_SLIDE_CATALOG` (Task 3).
- Produces: rows in `deck_slides`, `deck_items`, and `content_strings` (owner_kind `deck_slide`/`deck_item`) — every slide enabled in catalog order, every repeatable item present in `content.ts`'s current order.

This is a script, not a unit, so it is verified by running it against a local database and
inspecting the counts it prints — never against the production database.

- [ ] **Step 1: Add the deck-seeding section**

Add near the other per-domain seeding functions in `scripts/db-seed.ts` (following the file's
existing `upsert`/`count`/`force`/`dryRun` conventions already used for the seven pages — read
the surrounding 40-60 lines around wherever `content_strings` rows are inserted today and match
that exact helper's signature; the sketch below assumes a helper `upsertContentString(connection,
{ownerKind, ownerKey, fieldKey, label, value, valueKind, listKey, sortOrder})` of the same shape
the file already has for the seven pages' strings — reuse it, do not write a second one):

```typescript
import { StaticCapabilityDeckRepository, staticDeckSource } from "../src/infrastructure/capability-deck/StaticCapabilityDeckRepository";
import { buildDeckSlideRecords } from "../src/infrastructure/capability-deck/deckRecords";
import { DECK_SLIDE_CATALOG } from "../src/domain/capability-deck/entities/DeckSlideCatalog";
import { recordTree, recordValues } from "../src/domain/cms/entities/CmsRecord";

async function seedCapabilityDeck(connection: Connection): Promise<void> {
  const records = buildDeckSlideRecords(staticDeckSource(), null);

  for (const [index, entry] of DECK_SLIDE_CATALOG.entries()) {
    await connection.execute(
      `INSERT INTO deck_slides (slide_key, sort_order) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE sort_order = ${force ? "VALUES(sort_order)" : "sort_order"}`,
      [entry.slideKey, index],
    );
    count("deck_slides");

    const slide = records.get(entry.slideKey);
    if (!slide) continue;

    // The slide's own top-level fields — owner_key is the bare slide key.
    for (const value of recordValues(slide)) {
      await upsertContentString(connection, {
        ownerKind: "deck_slide",
        ownerKey: entry.slideKey,
        fieldKey: value.id,
        label: value.label,
        value: value.value,
        valueKind: value.kind,
        sortOrder: 0,
      });
      count("content_strings");
    }

    // Every repeatable item inside every one of this slide's item groups.
    for (const group of slide.items) {
      for (const [itemIndex, item] of group.records.entries()) {
        const itemKey = `${group.collectionId}:${item.id}`;
        const isImageCollection = group.collectionId.startsWith("selected-work:print:");
        const mediaBlock = item.groups.flatMap((g) => g.media)[0];

        await connection.execute(
          `INSERT INTO deck_items (item_key, collection_id, media_path, media_kind, sort_order)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             media_path = ${force ? "VALUES(media_path)" : "media_path"},
             sort_order = ${force ? "VALUES(sort_order)" : "sort_order"}`,
          [
            itemKey,
            group.collectionId,
            isImageCollection ? (mediaBlock?.path ?? null) : null,
            isImageCollection ? "image" : null,
            itemIndex,
          ],
        );
        count("deck_items");

        for (const record of recordTree(item)) {
          for (const value of recordValues(record)) {
            await upsertContentString(connection, {
              ownerKind: "deck_item",
              ownerKey: itemKey,
              fieldKey: value.id,
              label: value.label,
              value: value.value,
              valueKind: value.kind,
              sortOrder: 0,
            });
            count("content_strings");
          }
        }
      }
    }
  }
}
```

- [ ] **Step 2: Call it from the script's main sequence**

Add `await seedCapabilityDeck(connection);` alongside the existing calls that seed the seven
pages (same transaction/connection the rest of the run already uses).

- [ ] **Step 3: Verify against a local database — never production**

Run: `npm run db:seed -- --dry` (against `.env.local` pointed at your local/dev database)
Expected: reports rows it would write for `deck_slides`, `deck_items` and `content_strings`,
writes nothing (rolled back).

Run: `npm run db:seed`
Expected: the counts are non-zero; `SELECT COUNT(*) FROM deck_slides` returns 7; `SELECT
COUNT(*) FROM deck_items` matches the number of videos + website entries + print images
currently in `content.ts`.

- [ ] **Step 4: Commit**

```bash
git add scripts/db-seed.ts
git commit -m "feat(db): seed Capability Deck slides and items from content.ts"
```

---

## Task 9: Wire the repository into both composition roots

**Files:**
- Modify: `src/infrastructure/di/adminContainer.ts` (add `capabilityDeck`)
- Create: `src/infrastructure/di/capabilityDeckContainer.ts` (the public route's published-only accessor, kept out of `container.ts` for the same reason `adminContainer.ts` is kept separate — see its own header comment)

**Interfaces:**
- Consumes: `StaticCapabilityDeckRepository` (Task 6), `DbCapabilityDeckRepository` (Task 7), `contentSource` (`infrastructure/db/env.ts`).
- Produces: `adminContainer.capabilityDeck: CapabilityDeckRepository` (used by Tasks 10-13); `getPublishedCapabilityDeck(): Promise<PublishedDeck>` (used by Task 16's public route — a thin wrapper that calls `getDeck()` and drops everything the public render does not need).

- [ ] **Step 1: Extend `adminContainer.ts`**

```typescript
// Add these imports:
import { StaticCapabilityDeckRepository } from "../capability-deck/StaticCapabilityDeckRepository";
import { DbCapabilityDeckRepository } from "../capability-deck/DbCapabilityDeckRepository";

// Extend the exported object:
export const adminContainer = {
  cms:
    contentSource() === "database"
      ? new DbCmsRepository(repositories)
      : new StaticCmsRepository(repositories),
  capabilityDeck:
    contentSource() === "database"
      ? new DbCapabilityDeckRepository()
      : new StaticCapabilityDeckRepository(),
} as const;
```

- [ ] **Step 2: Write `capabilityDeckContainer.ts`**

```typescript
// src/infrastructure/di/capabilityDeckContainer.ts
import { contentSource } from "../db/env";
import { DbCapabilityDeckRepository } from "../capability-deck/DbCapabilityDeckRepository";
import { StaticCapabilityDeckRepository } from "../capability-deck/StaticCapabilityDeckRepository";

/**
 * THE PUBLIC ROUTE'S OWN READ, kept apart from `adminContainer` for the same reason that
 * file is kept apart from `container`: this one is imported by `app/capability-deck/page.tsx`,
 * which every visitor's request runs, so it must not pull in anything the admin screens need
 * but a visitor's request should not pay for.
 *
 * It is also, deliberately, a SEPARATE instance from `adminContainer.capabilityDeck` rather
 * than a shared one — the two call sites have nothing to hand each other and constructing a
 * repository is cheap; sharing one would be a reason for the public route to import from
 * `infrastructure/di/adminContainer.ts`, which is reserved for `src/app/admin` by convention.
 */
const repository =
  contentSource() === "database" ? new DbCapabilityDeckRepository() : new StaticCapabilityDeckRepository();

/** What the public render needs: published-only content, in deck order, nothing about drafts. */
export async function getPublishedCapabilityDeck() {
  return repository.getDeck();
}
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/infrastructure/di/adminContainer.ts src/infrastructure/di/capabilityDeckContainer.ts
git commit -m "feat: wire the Capability Deck repository into the admin and public composition roots"
```

---

## Task 10: `EditDeckSlide.ts` — Save / Publish / Discard for one slide, and its fake repository

**Files:**
- Create: `src/application/capability-deck/__fakes__/FakeCapabilityDeckRepository.ts`
- Create: `src/application/capability-deck/EditDeckSlide.ts`
- Create: `src/application/capability-deck/EditDeckSlide.test.ts`

**Interfaces:**
- Consumes: `CapabilityDeckRepository`, `ContentEdit`, `ContentConflictError` (Task 3); `validateContentValue` (existing, unchanged — Task 2 already taught it the two new kinds); `recordTree`, `recordValues`, `currentValue` from `domain/cms/entities/CmsRecord.ts`.
- Produces: `DeckSlideTarget`, `CmsValueEdit` (deck's own, structurally identical to the pages' `CmsValueEdit` but not importing it, to keep the two features decoupled), `SaveDeckSlide`, `PublishDeckSlide`, `DiscardDeckDrafts` — consumed by Task 13's API routes.

- [ ] **Step 1: Write the fake repository**

```typescript
// src/application/capability-deck/__fakes__/FakeCapabilityDeckRepository.ts
import type { CapabilityDeckDocument } from "../../../domain/capability-deck/entities/CapabilityDeckDocument";
import type {
  CapabilityDeckRepository,
  ContentEdit,
  NewCmsRecord,
} from "../../../domain/capability-deck/repositories/CapabilityDeckRepository";
import type { ContentAddress, ContentFieldAddress } from "../../../domain/cms/entities/ContentAddress";

/** An in-memory stand-in, mirroring `application/cms/__fakes__/FakeCmsRepository.ts`'s shape. */
export class FakeCapabilityDeckRepository implements CapabilityDeckRepository {
  supportsDraftPreview = true;
  supportsRecordChanges = true;

  private drafts = new Map<string, string>();
  public publishCalls: ReadonlyArray<ContentAddress>[] = [];

  constructor(private document: CapabilityDeckDocument) {}

  async getDeck(): Promise<CapabilityDeckDocument> {
    return this.document;
  }

  async saveDrafts(edits: ReadonlyArray<ContentEdit>): Promise<void> {
    for (const edit of edits) {
      this.drafts.set(`${edit.address.kind}:${edit.address.key}:${edit.address.field}`, edit.value);
    }
  }

  async publishDrafts(owners: ReadonlyArray<ContentAddress>): Promise<ReadonlyArray<ContentFieldAddress>> {
    this.publishCalls = [...this.publishCalls, owners];
    const written: ContentFieldAddress[] = [];
    for (const [key, value] of this.drafts) {
      const [kind, ownerKey, field] = key.split(":") as [ContentAddress["kind"], string, string];
      if (!owners.some((o) => o.kind === kind && o.key === ownerKey)) continue;
      written.push({ kind, key: ownerKey, field });
      this.drafts.delete(key);
      // Reflect the write onto the in-memory document so a second read sees it published.
      this.document = {
        ...this.document,
        slides: this.document.slides.map((slide) => applyPublish(slide, ownerKey, field, value)),
      };
    }
    return written;
  }

  async discardDrafts(owners: ReadonlyArray<ContentAddress>): Promise<void> {
    for (const key of [...this.drafts.keys()]) {
      const [kind, ownerKey] = key.split(":");
      if (owners.some((o) => o.kind === kind && o.key === ownerKey)) this.drafts.delete(key);
    }
  }

  async addSlide(): Promise<void> {
    throw new Error("not used by this task's tests");
  }
  async removeSlide(): Promise<void> {
    throw new Error("not used by this task's tests");
  }
  async reorderSlides(): Promise<void> {
    throw new Error("not used by this task's tests");
  }
  async createItem(_collectionId: string, _record: NewCmsRecord): Promise<string> {
    throw new Error("not used by this task's tests");
  }
  async deleteItem(): Promise<void> {
    throw new Error("not used by this task's tests");
  }
  async reorderItems(): Promise<void> {
    throw new Error("not used by this task's tests");
  }
  async logActivity(): Promise<void> {}
}

function applyPublish(record: any, ownerKey: string, field: string, value: string): any {
  if (record.id === ownerKey || (record.address && record.address.key === ownerKey)) {
    return {
      ...record,
      groups: record.groups.map((g: any) => ({
        ...g,
        values: g.values.map((v: any) => (v.id === field ? { ...v, value } : v)),
      })),
    };
  }
  return { ...record, items: record.items.map((g: any) => ({ ...g, records: g.records.map((r: any) => applyPublish(r, ownerKey, field, value)) })) };
}
```

- [ ] **Step 2: Write the failing tests**

```typescript
// src/application/capability-deck/EditDeckSlide.test.ts
import { describe, expect, it } from "vitest";
import { FakeCapabilityDeckRepository } from "./__fakes__/FakeCapabilityDeckRepository";
import { SaveDeckSlide, PublishDeckSlide, DiscardDeckDrafts } from "./EditDeckSlide";
import { buildDeckSlideRecords } from "../../infrastructure/capability-deck/deckRecords";
import { staticDeckSource } from "../../infrastructure/capability-deck/StaticCapabilityDeckRepository";

function fakeDeck() {
  const records = buildDeckSlideRecords(staticDeckSource(), null);
  return new FakeCapabilityDeckRepository({
    slides: [...records.values()],
    availableSlides: [],
    updatedAt: null,
  });
}

describe("SaveDeckSlide", () => {
  it("rejects a value that fails validation and writes nothing", async () => {
    const repo = fakeDeck();
    const result = await new SaveDeckSlide(repo).execute(
      { slideId: "selected-work" },
      [{ recordId: "selected-work-print:banners-0", valueId: "google-drive-link", value: "not-a-drive-link" }],
    );
    expect(result.ok).toBe(false);
  });

  it("saves a valid edit as a draft, changing nothing published", async () => {
    const repo = fakeDeck();
    const before = await repo.getDeck();
    const ugcVideoId = before.slides.find((s) => s.id === "selected-work")!.items
      .find((g) => g.collectionId === "selected-work:ugc")!.records[0]!.id;
    const result = await new SaveDeckSlide(repo).execute(
      { slideId: "selected-work" },
      [{ recordId: ugcVideoId, valueId: "google-drive-link", value: "https://drive.google.com/file/d/newId000000000000000/view" }],
    );
    expect(result.ok).toBe(true);
  });
});

describe("PublishDeckSlide", () => {
  it("moves a saved draft onto the slide and reports it published", async () => {
    const repo = fakeDeck();
    await new SaveDeckSlide(repo).execute({ slideId: "lets-talk" }, [{ valueId: "headline", value: "New headline" }]);
    const result = await new PublishDeckSlide(repo).execute({ slideId: "lets-talk" });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.published).toBe(1);
  });
});

describe("DiscardDeckDrafts", () => {
  it("throws away a saved draft without publishing it", async () => {
    const repo = fakeDeck();
    await new SaveDeckSlide(repo).execute({ slideId: "lets-talk" }, [{ valueId: "headline", value: "Discarded" }]);
    const discard = await new DiscardDeckDrafts(repo).execute({ slideId: "lets-talk" });
    expect(discard.ok).toBe(true);
    const publish = await new PublishDeckSlide(repo).execute({ slideId: "lets-talk" });
    expect(publish.ok).toBe(true);
    if (publish.ok) expect(publish.published).toBe(0);
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `npx vitest run src/application/capability-deck/EditDeckSlide.test.ts`
Expected: FAIL — `./EditDeckSlide` does not exist.

- [ ] **Step 4: Write `EditDeckSlide.ts`**

```typescript
// src/application/capability-deck/EditDeckSlide.ts
import { currentValue, recordTree, recordValues } from "../../domain/cms/entities/CmsRecord";
import type { CmsRecord, CmsValue } from "../../domain/cms/entities/CmsRecord";
import type { ContentAddress } from "../../domain/cms/entities/ContentAddress";
import {
  ContentConflictError,
  type CapabilityDeckRepository,
  type ContentEdit,
} from "../../domain/capability-deck/repositories/CapabilityDeckRepository";
import { validateContentValue } from "../cms/ValidateContentValue";
import type { MediaContext } from "../cms/ValidateContentValue";

/**
 * ONE SLIDE, THE SAME THREE ACTIONS `EditCmsSection.ts` GIVES THE SEVEN PAGES' SECTIONS.
 *
 * There is no `pageId` half the way `CmsSectionTarget` has one: the deck is not inside a
 * page, a slide IS the top-level unit here, so `{ slideId }` alone locates it. Everything
 * else — validate-then-write-all-or-nothing, conflict as 409 versus rejection as 422,
 * "publish is blocked while the form is dirty" enforced client-side — is the identical
 * shape, because it is the identical problem.
 */
export interface DeckSlideTarget {
  readonly slideId: string;
}

export interface CmsValueEdit {
  readonly recordId?: string;
  readonly valueId: string;
  readonly value: string;
  readonly version?: number;
}

export type SaveResult =
  | { readonly ok: true; readonly saved: number; readonly message: string }
  | { readonly ok: false; readonly valueId: string | null; readonly message: string; readonly conflict?: boolean };

export type PublishResult =
  | { readonly ok: true; readonly published: number; readonly message: string }
  | { readonly ok: false; readonly message: string; readonly conflict?: boolean };

export type DiscardResult =
  | { readonly ok: true; readonly message: string }
  | { readonly ok: false; readonly message: string };

const NOT_FOUND = "That slide is no longer in the deck. Reload the panel.";

interface Located {
  readonly slide: CmsRecord;
  readonly records: ReadonlyMap<string, CmsRecord>;
}

async function locate(repository: CapabilityDeckRepository, target: DeckSlideTarget): Promise<Located | null> {
  const deck = await repository.getDeck();
  const slide = deck.slides.find((s) => s.id === target.slideId);
  if (!slide) return null;
  return { slide, records: new Map(recordTree(slide).map((r) => [r.id, r])) };
}

export function ownersOfSlide(slide: CmsRecord): ReadonlyArray<ContentAddress> {
  return recordTree(slide).flatMap((r) => (r.address ? [r.address] : []));
}

function mediaContextFor(record: CmsRecord, value: CmsValue, pending: ReadonlyMap<string, string>): MediaContext {
  const found = record.groups
    .flatMap((g) => g.media)
    .find((m) => m.alt.id === value.id || m.src?.id === value.id || m.posterValue?.id === value.id);
  if (!found) return {};
  const settled = (field: CmsValue) => pending.get(field.id) ?? currentValue(field);
  return {
    path: found.path,
    ...(found.src ? { src: settled(found.src) } : {}),
    ...(found.posterValue ? { poster: settled(found.posterValue) } : {}),
  };
}

export class SaveDeckSlide {
  constructor(private readonly repository: CapabilityDeckRepository) {}

  async execute(target: DeckSlideTarget, edits: ReadonlyArray<CmsValueEdit>): Promise<SaveResult> {
    const found = await locate(this.repository, target);
    if (!found) return { ok: false, valueId: null, message: NOT_FOUND };
    if (edits.length === 0) return { ok: true, saved: 0, message: "Nothing had changed, so nothing was saved." };

    const prepared: ContentEdit[] = [];
    const pending = new Map(edits.map((e) => [e.valueId, e.value]));

    for (const edit of edits) {
      const record = found.records.get(edit.recordId ?? found.slide.id);
      const value = record ? recordValues(record).find((v) => v.id === edit.valueId) : null;
      if (!record || !value) {
        return { ok: false, valueId: edit.valueId, message: "That field is no longer on this slide. Reload the panel." };
      }
      if (!record.address) {
        return { ok: false, valueId: edit.valueId, message: "This block has nothing the panel can write to." };
      }
      const rejection = validateContentValue(value, edit.value, mediaContextFor(record, value, pending));
      if (rejection) return { ok: false, valueId: edit.valueId, message: rejection };
      if (edit.value === currentValue(value)) continue;

      prepared.push({
        address: { ...record.address, field: value.id },
        value: edit.value,
        baseValue: value.value,
        ...(edit.version === undefined ? {} : { expectedVersion: edit.version }),
      });
    }

    if (prepared.length === 0) return { ok: true, saved: 0, message: "Nothing had changed, so nothing was saved." };

    try {
      await this.repository.saveDrafts(prepared);
    } catch (error: unknown) {
      return { ok: false, valueId: null, message: failureMessage(error, "saved"), conflict: error instanceof ContentConflictError };
    }
    return {
      ok: true,
      saved: prepared.length,
      message: `Saved as a draft. ${countOf(prepared.length, "change")} not on the site yet — press Publish when you are ready.`,
    };
  }
}

export class PublishDeckSlide {
  constructor(private readonly repository: CapabilityDeckRepository) {}

  async execute(target: DeckSlideTarget): Promise<PublishResult> {
    const found = await locate(this.repository, target);
    if (!found) return { ok: false, message: NOT_FOUND };

    let written;
    try {
      written = await this.repository.publishDrafts(ownersOfSlide(found.slide));
    } catch (error: unknown) {
      return { ok: false, message: failureMessage(error, "published"), conflict: error instanceof ContentConflictError };
    }
    if (written.length === 0) {
      return { ok: true, published: 0, message: "There was nothing unpublished on this slide." };
    }
    return {
      ok: true,
      published: written.length,
      message: `Published. ${countOf(written.length, "change")} now live on /capability-deck.`,
    };
  }
}

export class DiscardDeckDrafts {
  constructor(private readonly repository: CapabilityDeckRepository) {}

  async execute(target: DeckSlideTarget): Promise<DiscardResult> {
    const found = await locate(this.repository, target);
    if (!found) return { ok: false, message: NOT_FOUND };
    try {
      await this.repository.discardDrafts(ownersOfSlide(found.slide));
    } catch (error: unknown) {
      return { ok: false, message: failureMessage(error, "discarded") };
    }
    return { ok: true, message: "The unpublished edits on this slide were thrown away." };
  }
}

function countOf(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? " is" : "s are"}`;
}

function failureMessage(error: unknown, verb: string): string {
  if (error instanceof ContentConflictError) return error.message;
  console.error(`[admin] Deck content could not be ${verb}:`, (error as Error)?.name);
  return `The change could not be ${verb}. Nothing was written — try again, and check the server logs if it keeps failing.`;
}
```

- [ ] **Step 5: Run tests and typecheck**

Run: `npx vitest run src/application/capability-deck/EditDeckSlide.test.ts && npm run typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/application/capability-deck/EditDeckSlide.ts src/application/capability-deck/EditDeckSlide.test.ts src/application/capability-deck/__fakes__/FakeCapabilityDeckRepository.ts
git commit -m "feat: add save/publish/discard use cases for a Capability Deck slide"
```

---

## Task 11: `ManageDeckRecords.ts` — add/remove/reorder for slides and for items

**Files:**
- Create: `src/application/capability-deck/ManageDeckRecords.ts`
- Create: `src/application/capability-deck/ManageDeckRecords.test.ts`

**Interfaces:**
- Consumes: `CapabilityDeckRepository`, `NewCmsRecord` (Task 3); `DECK_SLIDE_CATALOG`, `catalogLabel` (Task 3); `FakeCapabilityDeckRepository` (Task 10).
- Produces: `AddDeckSlide`, `RemoveDeckSlide`, `ReorderDeckSlides`, `CreateDeckItem`, `DeleteDeckItem`, `ReorderDeckItems` — consumed by Task 13's API routes.

- [ ] **Step 1: Write the failing tests**

```typescript
// src/application/capability-deck/ManageDeckRecords.test.ts
import { describe, expect, it } from "vitest";
import { FakeCapabilityDeckRepository } from "./__fakes__/FakeCapabilityDeckRepository";
import { AddDeckSlide, RemoveDeckSlide, ReorderDeckSlides, CreateDeckItem, DeleteDeckItem, ReorderDeckItems } from "./ManageDeckRecords";
import { buildDeckSlideRecords } from "../../infrastructure/capability-deck/deckRecords";
import { staticDeckSource } from "../../infrastructure/capability-deck/StaticCapabilityDeckRepository";

function fakeDeck(slideKeys: ReadonlyArray<string>) {
  const records = buildDeckSlideRecords(staticDeckSource(), null);
  const all = [...records.entries()];
  return new FakeCapabilityDeckRepository({
    slides: slideKeys.map((key) => records.get(key)!),
    availableSlides: all.filter(([key]) => !slideKeys.includes(key)).map(([slideKey, r]) => ({ slideKey, label: r.title })),
    updatedAt: null,
  });
}

describe("AddDeckSlide", () => {
  it("refuses an unknown slide key", async () => {
    const result = await new AddDeckSlide(fakeDeck(["cover"])).execute("not-a-real-slide", null);
    expect(result.ok).toBe(false);
  });

  it("refuses a slide already in the deck", async () => {
    const result = await new AddDeckSlide(fakeDeck(["cover", "who-we-are"])).execute("cover", null);
    expect(result.ok).toBe(false);
  });
});

describe("RemoveDeckSlide", () => {
  it("refuses to remove a slide that is not currently in the deck", async () => {
    const result = await new RemoveDeckSlide(fakeDeck(["cover"])).execute("services");
    expect(result.ok).toBe(false);
  });
});

describe("ReorderDeckSlides", () => {
  it("refuses a reorder that does not name exactly the slides currently in the deck", async () => {
    const result = await new ReorderDeckSlides(fakeDeck(["cover", "who-we-are"])).execute(["cover"]);
    expect(result.ok).toBe(false);
  });
});

describe("CreateDeckItem", () => {
  it("refuses a blank title", async () => {
    const result = await new CreateDeckItem(fakeDeck(["selected-work"])).execute("selected-work:ugc", {
      slug: "", title: "  ", summary: "x",
    });
    expect(result.ok).toBe(false);
  });
});

describe("DeleteDeckItem", () => {
  it("refuses an item id that is not on the named collection", async () => {
    const result = await new DeleteDeckItem(fakeDeck(["selected-work"])).execute("selected-work:ugc", "not-a-real-item");
    expect(result.ok).toBe(false);
  });
});

describe("ReorderDeckItems", () => {
  it("refuses a reorder that does not name exactly the items currently in the collection", async () => {
    const result = await new ReorderDeckItems(fakeDeck(["selected-work"])).execute("selected-work:ugc", []);
    expect(result.ok).toBe(false);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/application/capability-deck/ManageDeckRecords.test.ts`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Write `ManageDeckRecords.ts`**

```typescript
// src/application/capability-deck/ManageDeckRecords.ts
import { DECK_SLIDE_CATALOG } from "../../domain/capability-deck/entities/DeckSlideCatalog";
import type { CapabilityDeckRepository, NewCmsRecord } from "../../domain/capability-deck/repositories/CapabilityDeckRepository";

export type ChangeResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly message: string };

function failure(message: string): ChangeResult {
  return { ok: false, message };
}

const NO_STORE = "This cannot change while the site reads its content from the TypeScript files. Set CONTENT_SOURCE=database.";

/** Brings a known slide type into the deck, after `afterSlideId` (or first, when null). */
export class AddDeckSlide {
  constructor(private readonly repository: CapabilityDeckRepository) {}

  async execute(slideKey: string, afterSlideId: string | null): Promise<ChangeResult> {
    if (!this.repository.supportsRecordChanges) return failure(NO_STORE);
    if (!DECK_SLIDE_CATALOG.some((entry) => entry.slideKey === slideKey)) {
      return failure(`"${slideKey}" is not a known slide type.`);
    }
    const deck = await this.repository.getDeck();
    if (deck.slides.some((s) => s.id === slideKey)) {
      return failure("That slide is already in the deck.");
    }
    if (afterSlideId && !deck.slides.some((s) => s.id === afterSlideId)) {
      return failure("That is not a valid position to insert after. Reload the panel.");
    }
    try {
      await this.repository.addSlide(slideKey, afterSlideId);
      return { ok: true };
    } catch (error: unknown) {
      return failure(error instanceof Error ? error.message : "The slide could not be added.");
    }
  }
}

export class RemoveDeckSlide {
  constructor(private readonly repository: CapabilityDeckRepository) {}

  async execute(slideId: string): Promise<ChangeResult> {
    if (!this.repository.supportsRecordChanges) return failure(NO_STORE);
    const deck = await this.repository.getDeck();
    if (!deck.slides.some((s) => s.id === slideId)) {
      return failure("That slide is no longer in the deck. Reload the panel.");
    }
    try {
      await this.repository.removeSlide(slideId);
      return { ok: true };
    } catch (error: unknown) {
      return failure(error instanceof Error ? error.message : "The slide could not be removed.");
    }
  }
}

/** `orderedSlideIds` must be exactly the current slide set, reordered — never a subset or a superset. */
export class ReorderDeckSlides {
  constructor(private readonly repository: CapabilityDeckRepository) {}

  async execute(orderedSlideIds: ReadonlyArray<string>): Promise<ChangeResult> {
    if (!this.repository.supportsRecordChanges) return failure(NO_STORE);
    const deck = await this.repository.getDeck();
    const current = new Set(deck.slides.map((s) => s.id));
    const proposed = new Set(orderedSlideIds);
    const sameSet = current.size === proposed.size && [...current].every((id) => proposed.has(id));
    if (!sameSet) {
      return failure("That is not a reordering of the deck's current slides. Reload the panel and try again.");
    }
    try {
      await this.repository.reorderSlides(orderedSlideIds);
      return { ok: true };
    } catch (error: unknown) {
      return failure(error instanceof Error ? error.message : "The slides could not be reordered.");
    }
  }
}

async function itemGroup(repository: CapabilityDeckRepository, collectionId: string) {
  const deck = await repository.getDeck();
  for (const slide of deck.slides) {
    const found = slide.items.find((g) => g.collectionId === collectionId);
    if (found) return found;
  }
  return undefined;
}

export class CreateDeckItem {
  constructor(private readonly repository: CapabilityDeckRepository) {}

  async execute(collectionId: string, record: NewCmsRecord): Promise<ChangeResult & { readonly recordId?: string }> {
    if (!this.repository.supportsRecordChanges) return failure(NO_STORE);
    const title = record.title.trim();
    if (!title) return failure("A new entry needs a title.");
    const summary = record.summary.trim();
    if (!summary) return failure("A new entry needs the one line that appears under its title.");

    const group = await itemGroup(this.repository, collectionId);
    if (!group || group.canChange === false) {
      return failure("Entries cannot be added to this part of the deck.");
    }
    try {
      const recordId = await this.repository.createItem(collectionId, { slug: record.slug.trim() || title, title, summary });
      return { ok: true, recordId };
    } catch (error: unknown) {
      return failure(error instanceof Error ? error.message : "The entry could not be added.");
    }
  }
}

export class DeleteDeckItem {
  constructor(private readonly repository: CapabilityDeckRepository) {}

  async execute(collectionId: string, itemId: string): Promise<ChangeResult> {
    if (!this.repository.supportsRecordChanges) return failure(NO_STORE);
    const group = await itemGroup(this.repository, collectionId);
    if (!group || group.canChange === false || !group.records.some((r) => r.id === itemId)) {
      return failure("That entry is no longer there. Reload the panel.");
    }
    try {
      await this.repository.deleteItem(collectionId, itemId);
      return { ok: true };
    } catch (error: unknown) {
      return failure(error instanceof Error ? error.message : "The entry could not be removed.");
    }
  }
}

export class ReorderDeckItems {
  constructor(private readonly repository: CapabilityDeckRepository) {}

  async execute(collectionId: string, orderedItemIds: ReadonlyArray<string>): Promise<ChangeResult> {
    if (!this.repository.supportsRecordChanges) return failure(NO_STORE);
    const group = await itemGroup(this.repository, collectionId);
    if (!group) return failure("That part of the deck is no longer there. Reload the panel.");
    const current = new Set(group.records.map((r) => r.id));
    const proposed = new Set(orderedItemIds);
    const sameSet = current.size === proposed.size && [...current].every((id) => proposed.has(id));
    if (!sameSet) {
      return failure("That is not a reordering of this collection's current entries. Reload the panel and try again.");
    }
    try {
      await this.repository.reorderItems(collectionId, orderedItemIds);
      return { ok: true };
    } catch (error: unknown) {
      return failure(error instanceof Error ? error.message : "The entries could not be reordered.");
    }
  }
}
```

- [ ] **Step 4: Run tests and typecheck**

Run: `npx vitest run src/application/capability-deck/ManageDeckRecords.test.ts && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/application/capability-deck/ManageDeckRecords.ts src/application/capability-deck/ManageDeckRecords.test.ts
git commit -m "feat: add add/remove/reorder use cases for deck slides and deck items"
```

---

## Task 12: `GetCapabilityDeckNavigation.ts` — the sidebar's data

**Files:**
- Create: `src/application/capability-deck/GetCapabilityDeckNavigation.ts`
- Create: `src/application/capability-deck/GetCapabilityDeckNavigation.test.ts`

**Interfaces:**
- Consumes: `CapabilityDeckRepository` (Task 3).
- Produces: `CapabilityDeckNavigation`, `GetCapabilityDeckNavigation` — consumed by Task 15's sidebar wiring.

- [ ] **Step 1: Write the failing test**

```typescript
// src/application/capability-deck/GetCapabilityDeckNavigation.test.ts
import { describe, expect, it } from "vitest";
import { FakeCapabilityDeckRepository } from "./__fakes__/FakeCapabilityDeckRepository";
import { GetCapabilityDeckNavigation } from "./GetCapabilityDeckNavigation";
import { buildDeckSlideRecords } from "../../infrastructure/capability-deck/deckRecords";
import { staticDeckSource } from "../../infrastructure/capability-deck/StaticCapabilityDeckRepository";

describe("GetCapabilityDeckNavigation", () => {
  it("lists every current slide with its edit href, and every available slide type", async () => {
    const records = buildDeckSlideRecords(staticDeckSource(), null);
    const repo = new FakeCapabilityDeckRepository({
      slides: [records.get("cover")!, records.get("who-we-are")!],
      availableSlides: [{ slideKey: "services", label: "Services" }],
      updatedAt: null,
    });
    const nav = await new GetCapabilityDeckNavigation(repo).execute();
    expect(nav.slides.map((s) => s.href)).toEqual([
      "/admin/capability-deck/cover",
      "/admin/capability-deck/who-we-are",
    ]);
    expect(nav.availableSlides).toEqual([{ slideKey: "services", label: "Services" }]);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/application/capability-deck/GetCapabilityDeckNavigation.test.ts`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Write `GetCapabilityDeckNavigation.ts`**

```typescript
// src/application/capability-deck/GetCapabilityDeckNavigation.ts
import type { CmsStatus } from "../../domain/cms/entities/CmsRecord";
import type { CapabilityDeckRepository } from "../../domain/capability-deck/repositories/CapabilityDeckRepository";
import type { DeckSlideCatalogEntry } from "../../domain/capability-deck/entities/DeckSlideCatalog";

export interface DeckNavSlide {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly status: CmsStatus;
}

export interface CapabilityDeckNavigation {
  readonly href: string;
  readonly slides: ReadonlyArray<DeckNavSlide>;
  readonly availableSlides: ReadonlyArray<DeckSlideCatalogEntry>;
  readonly status: CmsStatus;
}

export class GetCapabilityDeckNavigation {
  constructor(private readonly repository: CapabilityDeckRepository) {}

  async execute(): Promise<CapabilityDeckNavigation> {
    const deck = await this.repository.getDeck();
    const slides = deck.slides.map((slide): DeckNavSlide => ({
      id: slide.id,
      label: slide.title,
      href: `/admin/capability-deck/${slide.id}`,
      status: slide.status,
    }));
    return {
      href: "/admin/capability-deck",
      slides,
      availableSlides: deck.availableSlides,
      status: slides.some((s) => s.status === "draft") ? "draft" : "published",
    };
  }
}
```

- [ ] **Step 4: Run tests and typecheck**

Run: `npx vitest run src/application/capability-deck/GetCapabilityDeckNavigation.test.ts && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/application/capability-deck/GetCapabilityDeckNavigation.ts src/application/capability-deck/GetCapabilityDeckNavigation.test.ts
git commit -m "feat: add Capability Deck's own admin navigation read model"
```

---

## Task 13: Admin API routes for the deck

**Files:**
- Create: `src/app/admin/api/capability-deck/shared.ts`
- Create: `src/app/admin/api/capability-deck/save/route.ts`
- Create: `src/app/admin/api/capability-deck/publish/route.ts`
- Create: `src/app/admin/api/capability-deck/discard/route.ts`
- Create: `src/app/admin/api/capability-deck/slides/route.ts`
- Create: `src/app/admin/api/capability-deck/items/route.ts`

**Interfaces:**
- Consumes: `SaveDeckSlide`/`PublishDeckSlide`/`DiscardDeckDrafts` (Task 10), `AddDeckSlide`/`RemoveDeckSlide`/`ReorderDeckSlides`/`CreateDeckItem`/`DeleteDeckItem`/`ReorderDeckItems` (Task 11), `adminContainer.capabilityDeck` (Task 9), `hasAdminSession`/`unauthorised` (`app/admin/session.ts`, unchanged), `json` (`app/admin/api/shared.ts`, unchanged).
- Produces: `POST /admin/api/capability-deck/save`, `POST /admin/api/capability-deck/publish`, `POST /admin/api/capability-deck/discard`, `POST`/`DELETE`/`PATCH /admin/api/capability-deck/slides`, `POST`/`DELETE`/`PATCH /admin/api/capability-deck/items` — consumed by Task 14's new `useDeckSlideEditor`/`DeckSlideEditor` (parallel to, not a modification of, the pages' `useSectionEditor`/`SectionEditor`) and Task 15's `CapabilityDeckScreen`.

There is no dedicated test file for these — Next.js route handlers in this codebase are
verified through the use cases' own unit tests (Tasks 10-11) plus the manual browser pass in
the final verification task, matching how `app/admin/api/save/route.ts` etc. have no test
file of their own today either.

- [ ] **Step 1: Write `capability-deck/shared.ts`**

```typescript
// src/app/admin/api/capability-deck/shared.ts
import type { DeckSlideTarget, CmsValueEdit } from "../../../../application/capability-deck/EditDeckSlide";

export function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

export function parseDeckTarget(value: unknown): DeckSlideTarget | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.slideId === "string" ? { slideId: candidate.slideId } : null;
}

export function parseDeckEdits(value: unknown): ReadonlyArray<CmsValueEdit> | null {
  if (!Array.isArray(value)) return null;
  const parsed: CmsValueEdit[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") return null;
    const candidate = entry as Record<string, unknown>;
    if (typeof candidate.valueId !== "string" || typeof candidate.value !== "string") return null;
    if (candidate.recordId !== undefined && typeof candidate.recordId !== "string") return null;
    if (candidate.version !== undefined && !(typeof candidate.version === "number" && Number.isInteger(candidate.version))) {
      return null;
    }
    parsed.push({
      valueId: candidate.valueId,
      value: candidate.value,
      ...(candidate.recordId === undefined ? {} : { recordId: candidate.recordId as string }),
      ...(candidate.version === undefined ? {} : { version: candidate.version as number }),
    });
  }
  return parsed;
}

export function text(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

export function stringArray(value: unknown): ReadonlyArray<string> | null {
  return Array.isArray(value) && value.every((v) => typeof v === "string") ? value : null;
}
```

- [ ] **Step 2: Write `save/route.ts`, `publish/route.ts`, `discard/route.ts`**

```typescript
// src/app/admin/api/capability-deck/save/route.ts
import { SaveDeckSlide } from "../../../../../application/capability-deck/EditDeckSlide";
import { adminContainer } from "../../../../../infrastructure/di/adminContainer";
import { hasAdminSession, unauthorised } from "../../../session";
import { json, parseDeckEdits, parseDeckTarget } from "../shared";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  if (!(await hasAdminSession())) return unauthorised();

  const body: unknown = await request.json().catch(() => null);
  const candidate = (body ?? {}) as Record<string, unknown>;
  const target = parseDeckTarget(candidate.target);
  const edits = parseDeckEdits(candidate.edits);
  if (!target || !edits) return json({ ok: false, valueId: null, message: "Malformed request." }, 400);

  const result = await new SaveDeckSlide(adminContainer.capabilityDeck).execute(target, edits);
  if (result.ok && result.saved > 0) {
    await adminContainer.capabilityDeck.logActivity({ action: "saved", sectionLabel: target.slideId });
  }
  return json(result, result.ok ? 200 : result.conflict ? 409 : 422);
}
```

```typescript
// src/app/admin/api/capability-deck/publish/route.ts
import { PublishDeckSlide } from "../../../../../application/capability-deck/EditDeckSlide";
import { adminContainer } from "../../../../../infrastructure/di/adminContainer";
import { hasAdminSession, unauthorised } from "../../../session";
import { json, parseDeckTarget } from "../shared";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  if (!(await hasAdminSession())) return unauthorised();

  const body: unknown = await request.json().catch(() => null);
  const target = parseDeckTarget((body as Record<string, unknown> | null)?.target);
  if (!target) return json({ ok: false, message: "Malformed request." }, 400);

  const result = await new PublishDeckSlide(adminContainer.capabilityDeck).execute(target);
  if (!result.ok) return json(result, result.conflict ? 409 : 422);

  // The deck is one route, unlike the seven pages' many-route fan-out — no routesFor needed.
  revalidatePath("/capability-deck");
  if (result.published > 0) {
    await adminContainer.capabilityDeck.logActivity({ action: "published", sectionLabel: target.slideId });
  }
  return json(result, 200);
}
```

```typescript
// src/app/admin/api/capability-deck/discard/route.ts
import { DiscardDeckDrafts } from "../../../../../application/capability-deck/EditDeckSlide";
import { adminContainer } from "../../../../../infrastructure/di/adminContainer";
import { hasAdminSession, unauthorised } from "../../../session";
import { json, parseDeckTarget } from "../shared";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  if (!(await hasAdminSession())) return unauthorised();

  const body: unknown = await request.json().catch(() => null);
  const target = parseDeckTarget((body as Record<string, unknown> | null)?.target);
  if (!target) return json({ ok: false, message: "Malformed request." }, 400);

  const result = await new DiscardDeckDrafts(adminContainer.capabilityDeck).execute(target);
  return json(result, result.ok ? 200 : 422);
}
```

- [ ] **Step 3: Write `slides/route.ts`**

```typescript
// src/app/admin/api/capability-deck/slides/route.ts
import { revalidatePath } from "next/cache";
import { AddDeckSlide, RemoveDeckSlide, ReorderDeckSlides } from "../../../../../application/capability-deck/ManageDeckRecords";
import { adminContainer } from "../../../../../infrastructure/di/adminContainer";
import { hasAdminSession, unauthorised } from "../../../session";
import { json, stringArray, text } from "../shared";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  if (!(await hasAdminSession())) return unauthorised();
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const slideKey = text(body?.slideKey);
  if (slideKey === null) return json({ ok: false, message: "Malformed request." }, 400);
  const afterSlideId = body?.afterSlideId === null ? null : text(body?.afterSlideId);

  const result = await new AddDeckSlide(adminContainer.capabilityDeck).execute(slideKey, afterSlideId);
  if (result.ok) revalidatePath("/capability-deck");
  return json(result, result.ok ? 200 : 422);
}

export async function DELETE(request: Request): Promise<Response> {
  if (!(await hasAdminSession())) return unauthorised();
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const slideId = text(body?.slideId);
  if (slideId === null) return json({ ok: false, message: "Malformed request." }, 400);

  const result = await new RemoveDeckSlide(adminContainer.capabilityDeck).execute(slideId);
  if (result.ok) revalidatePath("/capability-deck");
  return json(result, result.ok ? 200 : 422);
}

export async function PATCH(request: Request): Promise<Response> {
  if (!(await hasAdminSession())) return unauthorised();
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const orderedSlideIds = stringArray(body?.orderedSlideIds);
  if (orderedSlideIds === null) return json({ ok: false, message: "Malformed request." }, 400);

  const result = await new ReorderDeckSlides(adminContainer.capabilityDeck).execute(orderedSlideIds);
  if (result.ok) revalidatePath("/capability-deck");
  return json(result, result.ok ? 200 : 422);
}
```

- [ ] **Step 4: Write `items/route.ts`**

```typescript
// src/app/admin/api/capability-deck/items/route.ts
import { revalidatePath } from "next/cache";
import { CreateDeckItem, DeleteDeckItem, ReorderDeckItems } from "../../../../../application/capability-deck/ManageDeckRecords";
import { adminContainer } from "../../../../../infrastructure/di/adminContainer";
import { hasAdminSession, unauthorised } from "../../../session";
import { json, stringArray, text } from "../shared";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  if (!(await hasAdminSession())) return unauthorised();
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const collectionId = text(body?.collectionId);
  const title = text(body?.title);
  const summary = text(body?.summary);
  if (collectionId === null || title === null || summary === null) {
    return json({ ok: false, message: "Malformed request." }, 400);
  }

  const result = await new CreateDeckItem(adminContainer.capabilityDeck).execute(collectionId, {
    slug: text(body?.slug) ?? "",
    title,
    summary,
  });
  if (result.ok) revalidatePath("/capability-deck");
  return json(result, result.ok ? 200 : 422);
}

export async function DELETE(request: Request): Promise<Response> {
  if (!(await hasAdminSession())) return unauthorised();
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const collectionId = text(body?.collectionId);
  const itemId = text(body?.itemId);
  if (collectionId === null || itemId === null) return json({ ok: false, message: "Malformed request." }, 400);

  const result = await new DeleteDeckItem(adminContainer.capabilityDeck).execute(collectionId, itemId);
  if (result.ok) revalidatePath("/capability-deck");
  return json(result, result.ok ? 200 : 422);
}

export async function PATCH(request: Request): Promise<Response> {
  if (!(await hasAdminSession())) return unauthorised();
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const collectionId = text(body?.collectionId);
  const orderedItemIds = stringArray(body?.orderedItemIds);
  if (collectionId === null || orderedItemIds === null) return json({ ok: false, message: "Malformed request." }, 400);

  const result = await new ReorderDeckItems(adminContainer.capabilityDeck).execute(collectionId, orderedItemIds);
  if (result.ok) revalidatePath("/capability-deck");
  return json(result, result.ok ? 200 : 422);
}
```

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app/admin/api/capability-deck
git commit -m "feat: add admin API routes for editing, adding, removing and reordering deck content"
```

---

## Task 14: Deck-specific editor UI — `useDeckSlideEditor`, `DeckRecordFields`, `DeckSlideEditor`

**Design note — why these are new files rather than changes to `useSectionEditor`/`SectionEditor`/`RecordFields`:**
The brief is explicit that the seven pages' CMS entries are not to be touched, and those three
files are exactly the load-bearing, already-tested machinery the seven pages depend on every
day. Parametrizing them for a second target shape (`{slideId}` vs `{pageId, sectionId}`) and a
second set of endpoints is possible, but it is risk taken against working code for a feature
that has exactly one other caller. Three adapted files — genuinely small ones, since the
pattern is fully proven by Tasks 10-13 — cost far less than a regression in the page editor
would. `ValueField.tsx` and `MediaField.tsx` (the actual field-level inputs) need no
adaptation at all and are imported unchanged.

**Files:**
- Create: `src/presentation/admin/lib/useDeckSlideEditor.ts`
- Create: `src/presentation/admin/components/DeckRecordFields.tsx`
- Create: `src/presentation/admin/components/DeckSlideEditor.tsx`

**Interfaces:**
- Consumes: `ValueField`, `MediaField` (unchanged, existing); `DeckSlideTarget`, `CmsValueEdit` (Task 10); `CmsRecord`, `CmsFieldGroup`, `canChangeItems`, `hasUnpublishedEdits` (existing domain types, unchanged).
- Produces: `useDeckSlideEditor(slide, target)` (the same shape `useSectionEditor` returns, plus a `reorderItems`/`reorderSlides` helper the pages' hook has no need of), `DeckRecordFields`, `DeckSlideEditor` — consumed by Task 15's screens.

- [ ] **Step 1: Write `useDeckSlideEditor.ts`**

Adapted from `presentation/admin/lib/useSectionEditor.ts`. Identical `fieldsOf`/`valueOf`/`set`/
`isDirty`/beforeunload-guard/click-intercept logic (copy those blocks verbatim — they are
target-shape-agnostic already, operating only on `CmsRecord`), with these differences: the
`target` type is `DeckSlideTarget`; `save`/`publish`/`discard` POST to `/admin/api/capability-deck/*`
instead of `/admin/api/*`; and one new method, `reorderItems`, for item-group reordering that the
pages have no equivalent of.

```typescript
// src/presentation/admin/lib/useDeckSlideEditor.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { DeckSlideTarget, CmsValueEdit } from "../../../application/capability-deck/EditDeckSlide";
import { validateContentValue } from "../../../application/cms/ValidateContentValue";
import { currentValue, recordTree, recordValues } from "../../../domain/cms/entities/CmsRecord";
import type { CmsRecord, CmsValue } from "../../../domain/cms/entities/CmsRecord";

export function fieldPath(recordId: string, valueId: string): string {
  return `${recordId}/${valueId}`;
}

interface EditorField {
  readonly recordId: string;
  readonly value: CmsValue;
  readonly path: string;
  readonly media?: { readonly path: string; readonly srcField?: string; readonly posterField?: string };
}

type EditorStatus =
  | { readonly kind: "idle" }
  | { readonly kind: "busy"; readonly message: string }
  | { readonly kind: "done"; readonly message: string }
  | { readonly kind: "failed"; readonly message: string };

function fieldsOf(slide: CmsRecord): ReadonlyArray<EditorField> {
  return recordTree(slide).flatMap((record) => {
    const blockOf = new Map<string, EditorField["media"]>();
    for (const entry of record.groups.flatMap((g) => g.media)) {
      const block = {
        path: entry.path,
        ...(entry.src ? { srcField: fieldPath(record.id, entry.src.id) } : {}),
        ...(entry.posterValue ? { posterField: fieldPath(record.id, entry.posterValue.id) } : {}),
      };
      for (const owned of [entry.alt, entry.src, entry.posterValue]) if (owned) blockOf.set(owned.id, block);
    }
    return recordValues(record).map((value): EditorField => ({
      recordId: record.id,
      value,
      path: fieldPath(record.id, value.id),
      ...(blockOf.get(value.id) === undefined ? {} : { media: blockOf.get(value.id) }),
    }));
  });
}

interface ApiResult {
  readonly ok?: boolean;
  readonly message?: string;
  readonly valueId?: string | null;
}

export function useDeckSlideEditor(slide: CmsRecord, target: DeckSlideTarget) {
  const router = useRouter();
  const fields = useMemo(() => fieldsOf(slide), [slide]);
  const byPath = useMemo(() => new Map(fields.map((f) => [f.path, f])), [fields]);

  const [boxes, setBoxes] = useState<Readonly<Record<string, string>>>({});
  const [errors, setErrors] = useState<Readonly<Record<string, string>>>({});
  const [status, setStatus] = useState<EditorStatus>({ kind: "idle" });

  const valueOf = useCallback(
    (path: string) => boxes[path] ?? currentValue(byPath.get(path)?.value ?? BLANK),
    [boxes, byPath],
  );

  const changed = useMemo(
    () => fields.filter((f) => boxes[f.path] !== undefined && boxes[f.path] !== currentValue(f.value)),
    [boxes, fields],
  );
  const isDirty = changed.length > 0;

  const set = useCallback((path: string, next: string) => {
    setBoxes((current) => ({ ...current, [path]: next }));
    setErrors((current) => (current[path] === undefined ? current : Object.fromEntries(Object.entries(current).filter(([k]) => k !== path))));
    setStatus({ kind: "idle" });
  }, []);

  useEffect(() => {
    if (!isDirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty) return;
    const intercept = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;
      const anchor = (event.target as HTMLElement | null)?.closest?.("a");
      const href = anchor?.getAttribute("href");
      if (!anchor || !href || anchor.target === "_blank" || !href.startsWith("/")) return;
      if (!window.confirm("This slide has changes that have not been saved. Leave the page and lose them?")) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    document.addEventListener("click", intercept, true);
    return () => document.removeEventListener("click", intercept, true);
  }, [isDirty]);

  const post = useCallback(async (url: string, body: unknown): Promise<ApiResult> => {
    try {
      const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const result = (await response.json()) as ApiResult;
      return { ...result, ok: result.ok ?? response.ok };
    } catch {
      return { ok: false, message: "The server did not answer. Check that it is running." };
    }
  }, []);

  const save = useCallback(async (): Promise<boolean> => {
    const found: Record<string, string> = {};
    for (const field of changed) {
      const rejection = validateContentValue(field.value, boxes[field.path] ?? "", {
        ...(field.media ? { path: field.media.path } : {}),
        ...(field.media?.srcField ? { src: valueOf(field.media.srcField) } : {}),
        ...(field.media?.posterField ? { poster: valueOf(field.media.posterField) } : {}),
      });
      if (rejection) found[field.path] = rejection;
    }
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setStatus({ kind: "failed", message: `Nothing was saved. ${Object.keys(found).length === 1 ? "One field needs" : `${Object.keys(found).length} fields need`} fixing first.` });
      return false;
    }

    setStatus({ kind: "busy", message: "Saving…" });
    const edits: ReadonlyArray<CmsValueEdit> = changed.map((f) => ({
      recordId: f.recordId,
      valueId: f.value.id,
      value: boxes[f.path] ?? "",
      ...(f.value.version === undefined ? {} : { version: f.value.version }),
    }));

    const result = await post("/admin/api/capability-deck/save", { target, edits });
    if (!result.ok) {
      if (result.valueId) {
        const field = changed.find((f) => f.value.id === result.valueId);
        if (field) setErrors({ [field.path]: result.message ?? "This value was rejected." });
      }
      setStatus({ kind: "failed", message: result.message ?? "Nothing was saved." });
      return false;
    }
    setBoxes({});
    setErrors({});
    setStatus({ kind: "done", message: result.message ?? "Saved as a draft." });
    router.refresh();
    return true;
  }, [boxes, changed, post, router, target, valueOf]);

  const run = useCallback(async (url: string, busy: string) => {
    setStatus({ kind: "busy", message: busy });
    const result = await post(url, { target });
    setStatus({ kind: result.ok ? "done" : "failed", message: result.message ?? (result.ok ? "Done." : "That did not work.") });
    if (result.ok) { setBoxes({}); router.refresh(); }
  }, [post, router, target]);

  return {
    fields,
    valueOf,
    errorOf: (path: string) => errors[path],
    isChanged: (path: string) => changed.some((f) => f.path === path),
    set,
    isDirty,
    changedCount: changed.length,
    status,
    save,
    publish: () => run("/admin/api/capability-deck/publish", "Publishing…"),
    discard: () => run("/admin/api/capability-deck/discard", "Discarding…"),
  };
}

const BLANK: CmsValue = { id: "", label: "", value: "", kind: "text", multiline: false, approval: "drafted", usedElsewhere: [] };
```

- [ ] **Step 2: Write `DeckRecordFields.tsx`**

Adapted from `RecordFields.tsx`, adding one thing it does not have: `Move up`/`Move down`
buttons per card, alongside the existing `Remove`. Reuses that file's `Group`/`Card` structure
verbatim except for this addition — copy `Group` unchanged, and give `Card`/the top-level
export the extra props below.

```typescript
// src/presentation/admin/components/DeckRecordFields.tsx
"use client";

import { useState } from "react";
import { canChangeItems, hasUnpublishedEdits } from "../../../domain/cms/entities/CmsRecord";
import type { CmsFieldGroup, CmsRecord } from "../../../domain/cms/entities/CmsRecord";
import { fieldPath } from "../lib/useDeckSlideEditor";
import type { useDeckSlideEditor } from "../lib/useDeckSlideEditor";
import { MediaField } from "./MediaField";
import { ValueField } from "./ValueField";

type Editor = ReturnType<typeof useDeckSlideEditor>;

// `Group` is byte-for-byte the same rendering as RecordFields.tsx's own `Group` — copy it
// unchanged rather than importing it, since RecordFields.tsx does not export it.
function Group({ recordId, group, editor }: { readonly recordId: string; readonly group: CmsFieldGroup; readonly editor: Editor }) {
  const field = (valueId: string) => fieldPath(recordId, valueId);
  return (
    <section className="border-t border-hairline pt-6">
      <h3 className="label text-ink">{group.label}</h3>
      {group.description ? <p className="text-small mt-2 max-w-[70ch] text-graphite-70">{group.description}</p> : null}
      <div className="mt-5 flex flex-col gap-6">
        {group.values.map((value) => (
          <ValueField key={value.id} value={value} draft={editor.valueOf(field(value.id))} error={editor.errorOf(field(value.id))} isChanged={editor.isChanged(field(value.id))} onChange={(next) => editor.set(field(value.id), next)} />
        ))}
        {group.lists.map((list) => (
          <fieldset key={list.id} className="m-0 border-0 p-0">
            <legend className="label text-ink-60">{list.label}</legend>
            {list.items.length === 0 ? (
              <p className="text-small mt-3 text-graphite-70">This list is empty.</p>
            ) : (
              <ol className="mt-3 flex flex-col gap-5">
                {list.items.map((item) => (
                  <li key={item.id}>
                    <ValueField value={item} draft={editor.valueOf(field(item.id))} error={editor.errorOf(field(item.id))} isChanged={editor.isChanged(field(item.id))} onChange={(next) => editor.set(field(item.id), next)} />
                  </li>
                ))}
              </ol>
            )}
          </fieldset>
        ))}
        {group.media.map((entry) => {
          const src = entry.src?.id;
          const poster = entry.posterValue?.id;
          return (
            <MediaField key={entry.id} media={entry}
              altDraft={editor.valueOf(field(entry.alt.id))} altError={editor.errorOf(field(entry.alt.id))} isAltChanged={editor.isChanged(field(entry.alt.id))} onAltChange={(next) => editor.set(field(entry.alt.id), next)}
              srcDraft={src ? editor.valueOf(field(src)) : entry.path} srcError={src ? editor.errorOf(field(src)) : undefined} isSrcChanged={src ? editor.isChanged(field(src)) : false} onSrcChange={(next) => { if (src) editor.set(field(src), next); }}
              posterDraft={poster ? editor.valueOf(field(poster)) : (entry.poster ?? "")} posterError={poster ? editor.errorOf(field(poster)) : undefined} onPosterChange={(next) => { if (poster) editor.set(field(poster), next); }}
            />
          );
        })}
      </div>
    </section>
  );
}

function Card({
  record, editor, onRemove, onMoveUp, onMoveDown,
}: {
  readonly record: CmsRecord; readonly editor: Editor;
  readonly onRemove: (() => void) | null;
  readonly onMoveUp: (() => void) | null;
  readonly onMoveDown: (() => void) | null;
}) {
  const [open, setOpen] = useState(false);
  const panelId = `card-${record.id}`;
  const drafted = hasUnpublishedEdits(record);

  return (
    <li className="rounded-sm border border-ink-12 bg-card">
      <div className="flex items-center gap-2 px-4 py-3">
        <button type="button" onClick={() => setOpen((c) => !c)} aria-expanded={open} aria-controls={panelId} className="min-w-0 flex-1 text-left">
          <span className="text-small flex items-center gap-2 text-ink">
            <span aria-hidden="true" className="text-ink-40">{open ? "−" : "+"}</span>
            {record.title}
            {drafted ? <span className="label rounded-sm border border-accent px-2 py-0.5 text-accent">Unpublished</span> : null}
          </span>
          <span className="text-small mt-1 block truncate text-graphite-70">{record.summary}</span>
        </button>

        {onMoveUp ? (
          <button type="button" onClick={onMoveUp} aria-label={`Move ${record.title} earlier`} className="text-small shrink-0 px-1 text-graphite-70 hover:text-ink">↑</button>
        ) : null}
        {onMoveDown ? (
          <button type="button" onClick={onMoveDown} aria-label={`Move ${record.title} later`} className="text-small shrink-0 px-1 text-graphite-70 hover:text-ink">↓</button>
        ) : null}
        {onRemove ? (
          <button type="button" onClick={onRemove} className="text-small shrink-0 text-graphite-70 transition-colors duration-[180ms] hover:text-accent">Remove</button>
        ) : null}
      </div>
      <div id={panelId} hidden={!open} className="px-4 pb-6">
        <DeckRecordFields record={record} editor={editor} />
      </div>
    </li>
  );
}

export function DeckRecordFields({
  record, editor, onAdd, onRemove, onReorder,
}: {
  readonly record: CmsRecord; readonly editor: Editor;
  readonly onAdd?: (collectionId: string, noun: string) => void;
  readonly onRemove?: (collectionId: string, target: CmsRecord) => void;
  /** Present only for a group whose order the panel may change — every open item group. */
  readonly onReorder?: (collectionId: string, orderedIds: ReadonlyArray<string>) => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      {record.groups.map((group) => <Group key={group.id} recordId={record.id} group={group} editor={editor} />)}

      {record.items.map((group) => (
        <section key={group.id} className="border-t border-hairline pt-6">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h3 className="label text-ink">{group.label} <span className="text-ink-40">({group.records.length})</span></h3>
            {onAdd && canChangeItems(group) ? (
              <button type="button" onClick={() => onAdd(group.collectionId, group.addNoun)} className="text-small text-graphite-70 transition-colors duration-[180ms] hover:text-ink">
                Add {group.addNoun}
              </button>
            ) : null}
          </div>
          {group.description ? <p className="text-small mt-2 max-w-[70ch] text-graphite-70">{group.description}</p> : null}

          {group.records.length === 0 ? (
            <p className="text-small mt-4 text-graphite-70">Nothing here yet. This block renders nothing until something is added to it.</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {group.records.map((nested, index) => (
                <Card
                  key={nested.id}
                  record={nested}
                  editor={editor}
                  onRemove={onRemove && canChangeItems(group) ? () => onRemove(group.collectionId, nested) : null}
                  onMoveUp={
                    onReorder && canChangeItems(group) && index > 0
                      ? () => {
                          const ids = group.records.map((r) => r.id);
                          [ids[index - 1], ids[index]] = [ids[index]!, ids[index - 1]!];
                          onReorder(group.collectionId, ids);
                        }
                      : null
                  }
                  onMoveDown={
                    onReorder && canChangeItems(group) && index < group.records.length - 1
                      ? () => {
                          const ids = group.records.map((r) => r.id);
                          [ids[index], ids[index + 1]] = [ids[index + 1]!, ids[index]!];
                          onReorder(group.collectionId, ids);
                        }
                      : null
                  }
                />
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Write `DeckSlideEditor.tsx`**

Adapted from `SectionEditor.tsx`: same sticky Save/Preview/Publish/Discard bar and the same
"publish blocked while dirty" rule, targeting `/admin/api/capability-deck/preview` — see
Task 15, which extends the *existing* `/admin/api/preview` route to accept a deck target
rather than adding a second preview endpoint (previewing is a single generic mechanism —
`draftMode()` — with nothing deck-specific about it).

```typescript
// src/presentation/admin/components/DeckSlideEditor.tsx
"use client";

import { useCallback, useRef, useState } from "react";
import type { DeckSlideTarget } from "../../../application/capability-deck/EditDeckSlide";
import type { CmsRecord } from "../../../domain/cms/entities/CmsRecord";
import { useDeckSlideEditor } from "../lib/useDeckSlideEditor";
import { DeckRecordFields } from "./DeckRecordFields";
import { PreviewFrame } from "./PreviewFrame";

interface DeckSlideEditorProps {
  readonly slide: CmsRecord;
  readonly target: DeckSlideTarget;
  readonly canPreviewDrafts: boolean;
  readonly canChangeBlocks: boolean;
}

const BUTTON = "text-small inline-flex min-h-11 items-center justify-center rounded-sm px-4 py-2 transition-colors duration-[180ms] disabled:cursor-default";
const PRIMARY = `${BUTTON} bg-ink text-canvas disabled:bg-ink-40`;
const SECONDARY = `${BUTTON} border border-ink-12 text-ink hover:bg-ink-4 disabled:text-ink-40`;

export function DeckSlideEditor({ slide, target, canPreviewDrafts, canChangeBlocks }: DeckSlideEditorProps) {
  const editor = useDeckSlideEditor(slide, target);
  const [previewing, setPreviewing] = useState(false);
  const previewButton = useRef<HTMLButtonElement>(null);

  const hasDrafts = slide.status === "draft";
  const busy = editor.status.kind === "busy";
  const saving = busy && editor.status.message === "Saving…";
  const publishBlocked = editor.isDirty;

  const setPreview = useCallback(async (enable: boolean) => {
    await fetch("/admin/api/preview", {
      method: "POST",
      headers: { "content-type": "application/json" },
      // No pageId/sectionId to give — this route only uses `target` for activity logging,
      // and logs nothing when it is absent (see app/admin/api/preview/route.ts). Draft
      // mode itself is not scoped to any one owner.
      body: JSON.stringify({ enable }),
    }).catch(() => undefined);
  }, []);

  const openPreview = useCallback(async () => { await setPreview(true); setPreviewing(true); }, [setPreview]);
  const closePreview = useCallback(async () => { setPreviewing(false); await setPreview(false); previewButton.current?.focus(); }, [setPreview]);
  const publish = useCallback(async () => { if (previewing) await closePreview(); await editor.publish(); }, [closePreview, editor, previewing]);
  const discard = useCallback(async () => {
    if (window.confirm("Throw away every unpublished edit on this slide? The site does not change — it has not seen them — but the edits themselves are gone.")) {
      await editor.discard();
    }
  }, [editor]);

  const addBlock = useCallback(async (collectionId: string, noun: string) => {
    const title = window.prompt(`Title for ${noun}:`)?.trim();
    if (!title) return;
    const summary = window.prompt("The one line that appears under the title:")?.trim();
    if (!summary) return;
    const response = await fetch("/admin/api/capability-deck/items", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ collectionId, title, summary }),
    }).catch(() => null);
    const result = (await response?.json().catch(() => null)) as { message?: string } | null;
    if (!response?.ok) { window.alert(result?.message ?? "That entry could not be added."); return; }
    window.location.reload();
  }, []);

  const removeBlock = useCallback(async (collectionId: string, block: CmsRecord) => {
    const typed = window.prompt(`Removing "${block.title}" cannot be undone. Type its title to confirm:`);
    if (typed?.trim() !== block.title.trim()) return;
    const response = await fetch("/admin/api/capability-deck/items", {
      method: "DELETE", headers: { "content-type": "application/json" },
      body: JSON.stringify({ collectionId, itemId: block.id }),
    }).catch(() => null);
    const result = (await response?.json().catch(() => null)) as { message?: string } | null;
    if (!response?.ok) { window.alert(result?.message ?? "That entry could not be removed."); return; }
    window.location.reload();
  }, []);

  const reorderBlocks = useCallback(async (collectionId: string, orderedItemIds: ReadonlyArray<string>) => {
    const response = await fetch("/admin/api/capability-deck/items", {
      method: "PATCH", headers: { "content-type": "application/json" },
      body: JSON.stringify({ collectionId, orderedItemIds }),
    }).catch(() => null);
    const result = (await response?.json().catch(() => null)) as { message?: string } | null;
    if (!response?.ok) { window.alert(result?.message ?? "That could not be reordered."); return; }
    window.location.reload();
  }, []);

  return (
    <div>
      <div className="sticky top-0 z-10 -mx-4 mb-2 border-b border-hairline bg-canvas px-4 py-4 sm:-mx-10 sm:px-10">
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => void editor.save()} disabled={busy || !editor.isDirty} className={PRIMARY}>
            {saving ? "Saving…" : "Save draft"}
          </button>
          <button ref={previewButton} type="button" onClick={() => void (previewing ? closePreview() : openPreview())} disabled={busy} className={SECONDARY} aria-expanded={previewing}>
            {previewing ? "Close preview" : "Preview"}
          </button>
          <button type="button" onClick={() => void publish()} disabled={busy || !hasDrafts || publishBlocked} aria-describedby={publishBlocked ? "deck-publish-blocked" : undefined} className={SECONDARY}>
            Publish
          </button>
          {hasDrafts ? (
            <button type="button" onClick={() => void discard()} disabled={busy} className="text-small inline-flex min-h-11 items-center px-2 py-2 text-graphite-70 transition-colors duration-[180ms] hover:text-accent">
              Discard drafts
            </button>
          ) : null}
          <p className="text-small ml-auto text-ink-40">
            {editor.isDirty ? `${editor.changedCount} unsaved ${editor.changedCount === 1 ? "change" : "changes"}` : hasDrafts ? "Saved, not published" : "Everything here is live"}
          </p>
        </div>
        <p role="status" aria-live="polite" className={`text-small mt-3 ${editor.status.kind === "failed" ? "text-accent" : "text-graphite-70"}`}>
          {editor.status.kind === "idle" ? " " : editor.status.message}
        </p>
        {publishBlocked ? (
          <p id="deck-publish-blocked" className="text-small mt-2 max-w-[70ch] text-graphite-70">
            {hasDrafts
              ? "Publish is unavailable while there are unsaved changes. Save first, or discard the drafts."
              : "Publish is unavailable while there are unsaved changes. Nothing has been saved yet, so there is nothing for it to put live. Save first."}
          </p>
        ) : null}
      </div>

      {previewing ? (
        <PreviewFrame route="/capability-deck" sectionId={slide.id} canPreviewDrafts={canPreviewDrafts} onClose={() => void closePreview()} />
      ) : null}

      <div className="mt-8">
        <DeckRecordFields
          record={slide}
          editor={editor}
          {...(canChangeBlocks ? { onAdd: addBlock, onRemove: removeBlock, onReorder: reorderBlocks } : {})}
        />
      </div>
    </div>
  );
}
```

*Note for the implementer:* `addBlock`/`removeBlock`/`reorderBlocks` above use
`window.location.reload()` rather than `router.refresh()` (which `SectionEditor.tsx` uses)
only because this component has no `useRouter()` import yet — switch to `router.refresh()`
for consistency with the rest of the panel (softer, no full reload) once `useRouter` is
imported; either works correctly, but `router.refresh()` matches the existing convention
and should be preferred.

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/presentation/admin/lib/useDeckSlideEditor.ts src/presentation/admin/components/DeckRecordFields.tsx src/presentation/admin/components/DeckSlideEditor.tsx
git commit -m "feat: add the deck's own slide editor, reusing ValueField/MediaField unchanged"
```

---

## Task 15: Screens, routes, and the sidebar entry

**Files:**
- Create: `src/presentation/admin/views/CapabilityDeckScreen.tsx` (slide list: add/remove/reorder slides)
- Create: `src/presentation/admin/views/CapabilityDeckSlideScreen.tsx` (one slide's editor, wraps `DeckSlideEditor`)
- Create: `src/app/admin/(panel)/capability-deck/page.tsx`
- Create: `src/app/admin/(panel)/capability-deck/[slide]/page.tsx`
- Modify: `src/presentation/admin/components/AdminSidebar.tsx` (new group between Pages and SEO)
- Modify: `src/app/admin/(panel)/layout.tsx` (confirm — see Step 4 — that whatever builds the sidebar's `AdminNavigation` prop also fetches and merges `GetCapabilityDeckNavigation`'s result; read the layout file first, since the plan cannot see its current body)

**Interfaces:**
- Consumes: `GetCapabilityDeckNavigation` (Task 12), `adminContainer.capabilityDeck` (Task 9), `AddDeckSlide`/`RemoveDeckSlide`/`ReorderDeckSlides` (Task 11), `DeckSlideEditor` (Task 14), `AdminScreen` (existing, unchanged).
- Produces: `/admin/capability-deck` and `/admin/capability-deck/[slide]` screens; a new "Capability Deck" group in the sidebar between "Pages" and "SEO".

- [ ] **Step 1: Write `CapabilityDeckScreen.tsx`**

```typescript
// src/presentation/admin/views/CapabilityDeckScreen.tsx
"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { CapabilityDeckDocument } from "../../../domain/capability-deck/entities/CapabilityDeckDocument";
import { AdminScreen } from "../components/AdminScreen";

interface CapabilityDeckScreenProps {
  readonly deck: CapabilityDeckDocument;
  readonly canChangeSlides: boolean;
}

export function CapabilityDeckScreen({ deck, canChangeSlides }: CapabilityDeckScreenProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const call = useCallback(
    async (url: string, method: string, body: unknown) => {
      setBusy(true);
      setMessage(null);
      const response = await fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
      const result = (await response?.json().catch(() => null)) as { ok?: boolean; message?: string } | null;
      setBusy(false);
      if (!response?.ok) {
        setMessage(result?.message ?? "That did not work.");
        return;
      }
      router.refresh();
    },
    [router],
  );

  const addSlide = useCallback(
    (slideKey: string) => call("/admin/api/capability-deck/slides", "POST", { slideKey, afterSlideId: deck.slides.at(-1)?.id ?? null }),
    [call, deck.slides],
  );
  const removeSlide = useCallback(
    (slideId: string, label: string) => {
      const typed = window.prompt(`Removing "${label}" from the deck cannot be undone from here without re-adding it. Type its name to confirm:`);
      if (typed?.trim() !== label.trim()) return;
      return call("/admin/api/capability-deck/slides", "DELETE", { slideId });
    },
    [call],
  );
  const reorder = useCallback(
    (orderedSlideIds: ReadonlyArray<string>) => call("/admin/api/capability-deck/slides", "PATCH", { orderedSlideIds }),
    [call],
  );

  return (
    <AdminScreen
      breadcrumb={[{ label: "Capability Deck" }]}
      heading="Capability Deck"
      description="The slides shown at /capability-deck, in the order they play. A slide's own text, images, videos and website embeds are edited on its own screen — this list is only what is in the deck, and in what order."
    >
      {message ? <p role="status" className="text-small mb-4 text-accent">{message}</p> : null}

      <ul className="flex flex-col gap-3">
        {deck.slides.map((slide, index) => (
          <li key={slide.id} className="flex items-center gap-3 rounded-sm border border-ink-12 bg-card px-4 py-3">
            <a href={`/admin/capability-deck/${slide.id}`} className="min-w-0 flex-1 text-small text-ink hover:underline">
              {slide.title}
              {slide.status === "draft" ? <span className="label ml-2 rounded-sm border border-accent px-2 py-0.5 text-accent">Unpublished</span> : null}
            </a>
            {canChangeSlides && index > 0 ? (
              <button type="button" disabled={busy} aria-label={`Move ${slide.title} earlier`} className="text-small px-1 text-graphite-70 hover:text-ink"
                onClick={() => {
                  const ids = deck.slides.map((s) => s.id);
                  [ids[index - 1], ids[index]] = [ids[index]!, ids[index - 1]!];
                  void reorder(ids);
                }}>↑</button>
            ) : null}
            {canChangeSlides && index < deck.slides.length - 1 ? (
              <button type="button" disabled={busy} aria-label={`Move ${slide.title} later`} className="text-small px-1 text-graphite-70 hover:text-ink"
                onClick={() => {
                  const ids = deck.slides.map((s) => s.id);
                  [ids[index], ids[index + 1]] = [ids[index + 1]!, ids[index]!];
                  void reorder(ids);
                }}>↓</button>
            ) : null}
            {canChangeSlides ? (
              <button type="button" disabled={busy} className="text-small text-graphite-70 hover:text-accent" onClick={() => void removeSlide(slide.id, slide.title)}>
                Remove
              </button>
            ) : null}
          </li>
        ))}
      </ul>

      {canChangeSlides && deck.availableSlides.length > 0 ? (
        <div className="mt-8 border-t border-hairline pt-6">
          <h2 className="label text-ink">Add a slide</h2>
          <p className="text-small mt-2 max-w-[70ch] text-graphite-70">
            These slide types exist in the code but are not currently in the deck.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {deck.availableSlides.map((entry) => (
              <button key={entry.slideKey} type="button" disabled={busy} onClick={() => void addSlide(entry.slideKey)} className="text-small rounded-sm border border-ink-12 px-4 py-2 text-ink hover:bg-ink-4">
                Add {entry.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </AdminScreen>
  );
}
```

- [ ] **Step 2: Write `CapabilityDeckSlideScreen.tsx`**

```typescript
// src/presentation/admin/views/CapabilityDeckSlideScreen.tsx
import type { CmsRecord } from "../../../domain/cms/entities/CmsRecord";
import { AdminScreen } from "../components/AdminScreen";
import { DeckSlideEditor } from "../components/DeckSlideEditor";

interface CapabilityDeckSlideScreenProps {
  readonly slide: CmsRecord;
  readonly canPreviewDrafts: boolean;
  readonly canChangeBlocks: boolean;
}

export function CapabilityDeckSlideScreen({ slide, canPreviewDrafts, canChangeBlocks }: CapabilityDeckSlideScreenProps) {
  return (
    <AdminScreen
      breadcrumb={[{ label: "Capability Deck", href: "/admin/capability-deck" }, { label: slide.title }]}
      heading={slide.title}
      description="A slide of the Capability Deck, rendered at /capability-deck. Save writes a draft and changes nothing on the site; Preview shows the real deck with the draft applied; Publish puts it live."
    >
      <DeckSlideEditor
        key={String(slide.updatedAt?.getTime() ?? 0)}
        slide={slide}
        target={{ slideId: slide.id }}
        canPreviewDrafts={canPreviewDrafts}
        canChangeBlocks={canChangeBlocks}
      />
    </AdminScreen>
  );
}
```

- [ ] **Step 3: Write the two route files**

```typescript
// src/app/admin/(panel)/capability-deck/page.tsx
import { CapabilityDeckScreen } from "../../../../presentation/admin/views/CapabilityDeckScreen";
import { adminContainer } from "../../../../infrastructure/di/adminContainer";

export default async function CapabilityDeckPage() {
  const deck = await adminContainer.capabilityDeck.getDeck();
  return <CapabilityDeckScreen deck={deck} canChangeSlides={adminContainer.capabilityDeck.supportsRecordChanges} />;
}
```

```typescript
// src/app/admin/(panel)/capability-deck/[slide]/page.tsx
import { notFound } from "next/navigation";
import { CapabilityDeckSlideScreen } from "../../../../../presentation/admin/views/CapabilityDeckSlideScreen";
import { adminContainer } from "../../../../../infrastructure/di/adminContainer";

export default async function CapabilityDeckSlidePage({ params }: { readonly params: Promise<{ readonly slide: string }> }) {
  const { slide: slideId } = await params;
  const deck = await adminContainer.capabilityDeck.getDeck();
  const slide = deck.slides.find((s) => s.id === slideId);
  if (!slide) notFound();

  return (
    <CapabilityDeckSlideScreen
      slide={slide}
      canPreviewDrafts={adminContainer.capabilityDeck.supportsDraftPreview}
      canChangeBlocks={adminContainer.capabilityDeck.supportsRecordChanges}
    />
  );
}
```

*Note for the implementer:* confirm the `params` shape (`Promise<{...}>` vs a plain object)
against `src/app/admin/(panel)/pages/[page]/page.tsx` in this same checkout — Next's
convention changed between major versions and that sibling file is the ground truth for
which one this project is on; match it exactly.

- [ ] **Step 4: Read the panel layout and the sidebar's data source before wiring the sidebar**

Read `src/app/admin/(panel)/layout.tsx` — it is what currently constructs the `navigation`
prop `AdminSidebar` receives (almost certainly `new GetAdminNavigation(adminContainer.cms).execute()`,
per that use case's own file). Add, alongside it:

```typescript
import { GetCapabilityDeckNavigation } from "../../../application/capability-deck/GetCapabilityDeckNavigation";
// ...
const capabilityDeckNav = await new GetCapabilityDeckNavigation(adminContainer.capabilityDeck).execute();
```

and pass it to `AdminSidebar` as a new `capabilityDeck` prop, alongside the existing
`navigation` prop.

- [ ] **Step 5: Add the sidebar group**

In `AdminSidebar.tsx`, add a `capabilityDeck: CapabilityDeckNavigation` prop and, between the
existing "Pages" `<div>` block and the "SEO" `<div>` block, insert:

```tsx
<div>
  <p className="label px-6 pb-3 text-canvas-40">Capability Deck</p>
  <ul>
    <li>
      <div className="flex items-stretch">
        <Link
          href={capabilityDeck.href}
          className={`text-small flex min-h-11 min-w-0 flex-1 items-center truncate py-2 pl-6 pr-2 transition-colors duration-[180ms] ${
            pathname === capabilityDeck.href ? "bg-canvas-10 text-canvas" : "text-canvas-60 hover:bg-canvas-4 hover:text-canvas"
          }`}
          aria-current={pathname === capabilityDeck.href ? "page" : undefined}
        >
          Capability Deck
          {capabilityDeck.status === "draft" ? <DraftDot what="Capability Deck" /> : null}
        </Link>
        <button
          type="button"
          onClick={() => setDeckOpen((c) => !c)}
          aria-expanded={deckOpen}
          aria-controls="admin-nav-capability-deck"
          aria-label={`${deckOpen ? "Collapse" : "Expand"} Capability Deck`}
          className="flex min-h-11 min-w-11 items-center justify-center px-4 text-canvas-40 transition-colors duration-[180ms] hover:text-canvas"
        >
          <span aria-hidden="true" className="text-small">{deckOpen ? "−" : "+"}</span>
        </button>
      </div>
      <ul id="admin-nav-capability-deck" hidden={!(deckOpen || isActive(pathname, capabilityDeck.href))}>
        {capabilityDeck.slides.map((slide) => (
          <li key={slide.id}>
            <Link
              href={slide.href}
              className={`text-small flex min-h-11 items-center py-1.5 pl-10 pr-4 transition-colors duration-[180ms] ${
                pathname === slide.href ? "bg-canvas-10 text-canvas" : "text-canvas-60 hover:bg-canvas-4 hover:text-canvas"
              }`}
              aria-current={pathname === slide.href ? "page" : undefined}
            >
              {slide.label}
              {slide.status === "draft" ? <DraftDot what={slide.label} /> : null}
            </Link>
          </li>
        ))}
      </ul>
    </li>
  </ul>
</div>
```

Add the matching state alongside the existing `opened` state: `const [deckOpen, setDeckOpen] =
useState(false);` and update the function signature to `AdminSidebar({ navigation,
capabilityDeck }: { readonly navigation: AdminNavigation; readonly capabilityDeck:
CapabilityDeckNavigation })`, importing `CapabilityDeckNavigation`'s type from
`application/capability-deck/GetCapabilityDeckNavigation`.

- [ ] **Step 6: Typecheck and lint**

Run: `npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/presentation/admin/views/CapabilityDeckScreen.tsx src/presentation/admin/views/CapabilityDeckSlideScreen.tsx "src/app/admin/(panel)/capability-deck" src/presentation/admin/components/AdminSidebar.tsx "src/app/admin/(panel)/layout.tsx"
git commit -m "feat: add Capability Deck admin screens and its sidebar entry"
```

---

## Task 16: Wire the public `/capability-deck` route to published content

**Design note:** the CMS read model (`CmsRecord[]`, Task 5-7) is for the admin panel. The public
page needs the plain shapes the slide components already consume (`whoWeAre.headline`, not
`slide.groups[0].values[0].value`) — exactly the split the seven pages already keep between
their `Db*Repository` entities (site-facing) and `items.ts`'s `CmsRecord` builders (panel-facing).
This task adds the site-facing half for the deck: `getCapabilityDeckContent()`, which reuses
`ContentStore` directly (so Next's `draftMode()` preview overlay applies automatically, with
zero extra plumbing — see `ContentStore.load()`'s own note on this) rather than going through
`CmsRecord` at all.

**Files:**
- Create: `src/infrastructure/capability-deck/getCapabilityDeckContent.ts`
- Modify: `src/infrastructure/di/capabilityDeckContainer.ts` (replace the Task 9 sketch's body with this)
- Modify: `src/app/capability-deck/page.tsx`
- Modify: `src/presentation/capability-deck/CapabilityDeckMount.tsx`
- Modify: `src/presentation/capability-deck/CapabilityDeck.tsx`
- Modify: `src/presentation/capability-deck/slides/CoverSlide.tsx`, `WhoWeAreSlide.tsx`, `ServicesSlide.tsx`, `SelectedWorkSlide.tsx`, `WaysToWorkSlide.tsx`, `CTASlide.tsx`, `HowWeWorkSlide.tsx` (each: read its slice via a new prop instead of importing `../data/content` directly)
- Modify: `src/presentation/capability-deck/slides/ServicesSlide.tsx` (grid: `repeat(3, 1fr)` → `repeat(auto-fit, minmax(260px, 1fr))`)
- Modify: `src/presentation/capability-deck/slides/WaysToWorkSlide.tsx` (grid: `repeat(4, 1fr)` → `repeat(auto-fit, minmax(240px, 1fr))`)

**Interfaces:**
- Consumes: `CapabilityDeckSource` shape (Task 5); `ContentStore`, `mediaFrom` (`infrastructure/db/content/ContentStore.ts`, unchanged); `derivedId` (`infrastructure/cms/records.ts`).
- Produces: `DeckContent` (the plain props shape every slide component now takes), consumed only within `presentation/capability-deck/`.

- [ ] **Step 1: Write `getCapabilityDeckContent.ts`**

```typescript
// src/infrastructure/capability-deck/getCapabilityDeckContent.ts
import { ContentStore } from "../db/content/ContentStore";
import { derivedId } from "../cms/records";
import { cachedRows } from "../db/content/cache";
import { DECK_SLIDE_CATALOG } from "../../domain/capability-deck/entities/DeckSlideCatalog";
import * as staticContent from "../../presentation/capability-deck/data/content";
import type { CapabilityDeckSource } from "./deckRecords";
import type { RowDataPacket } from "mysql2/promise";

export interface PublishedCapabilityDeck {
  readonly enabledSlideKeys: ReadonlyArray<string>;
  readonly source: CapabilityDeckSource;
}

interface DeckItemRow extends RowDataPacket {
  item_key: string;
  collection_id: string;
  media_path: string | null;
  sort_order: number;
}

/** `text(store, "deck_slide", "cover", "Eyebrow", fallback)` — one accessor, every field. */
function text(store: ContentStore, ownerKind: "deck_slide" | "deck_item", ownerKey: string, label: string, fallback: string): string {
  return store.optional(ownerKey, derivedId(label)) ?? fallback;
}

/**
 * THE DATABASE READING — used only when `CONTENT_SOURCE=database`. Structure (which items
 * exist, in what order, which have an uploaded image) comes from `deck_slides`/`deck_items`;
 * every string comes from `ContentStore`, which is what makes the preview iframe show
 * unpublished words with no extra plumbing here — see `ContentStore.load()`.
 *
 * Built against `content.ts`'s STATIC shapes as the structural template for the parts that
 * are not repeatable (the seven portfolio categories' ratios, which subcategories the print
 * gallery has) — those are fixed in code either way, so there is nothing to read from the
 * database for them.
 */
export async function readDeckContentFromDatabase(): Promise<PublishedCapabilityDeck> {
  const [slideRows, itemRows] = await Promise.all([
    cachedRows<{ slide_key: string } & RowDataPacket>("SELECT slide_key FROM deck_slides ORDER BY sort_order"),
    cachedRows<DeckItemRow>("SELECT item_key, collection_id, media_path, sort_order FROM deck_items ORDER BY collection_id, sort_order"),
  ]);
  const enabledSlideKeys = slideRows.map((r) => r.slide_key);

  const slideStore = await ContentStore.load("deck_slide" as never, DECK_SLIDE_CATALOG.map((e) => e.slideKey));
  const itemStore = await ContentStore.load("deck_item" as never, itemRows.map((r) => r.item_key));

  const itemsFor = (collectionId: string) => itemRows.filter((r) => r.collection_id === collectionId);

  const cover = {
    brand: text(slideStore, "deck_slide", "cover", "Eyebrow", staticContent.coverContent.brand),
    headlineLine1: text(slideStore, "deck_slide", "cover", "Headline, first line", staticContent.coverContent.headlineLine1),
    headlineAccent: text(slideStore, "deck_slide", "cover", "Headline, accent", staticContent.coverContent.headlineAccent),
    supporting: text(slideStore, "deck_slide", "cover", "Supporting line", staticContent.coverContent.supporting),
    decorativeLabel: text(slideStore, "deck_slide", "cover", "Corner label", staticContent.coverContent.decorativeLabel),
    logoMark: slideStore.optional("cover", "media-src") ?? staticContent.coverContent.logoMark,
  };

  const whoWeAre = {
    headline: text(slideStore, "deck_slide", "who-we-are", "Headline", staticContent.whoWeAre.headline),
    copy: text(slideStore, "deck_slide", "who-we-are", "Copy", staticContent.whoWeAre.copy),
    established: text(slideStore, "deck_slide", "who-we-are", "Established", staticContent.whoWeAre.established),
    locations: text(slideStore, "deck_slide", "who-we-are", "Locations", staticContent.whoWeAre.locations),
    // Fixed at two — see deckRecords.ts's design note. Read by position, matching the
    // field labels `whoWeAreRecord` gave each of the two.
    highlights: staticContent.whoWeAre.highlights.map((fallback, i) => ({
      title: text(slideStore, "deck_slide", "who-we-are", "Title", fallback.title),
      copy: text(slideStore, "deck_slide", "who-we-are", "Copy", fallback.copy),
    })),
    visionMission: staticContent.whoWeAre.visionMission,
  };

  const serviceCategories = itemsFor("services:categories").map((row, i) => {
    const fallback = staticContent.serviceCategories[i];
    return {
      title: text(itemStore, "deck_item", row.item_key, "Title", fallback?.title ?? ""),
      tagline: text(itemStore, "deck_item", row.item_key, "Tagline", fallback?.tagline ?? ""),
      examples: fallback?.examples ?? [],
    };
  });

  const engagementModels = itemsFor("ways-to-work:engagements").map((row, i) => {
    const fallback = staticContent.engagementModels[i];
    return {
      tag: text(itemStore, "deck_item", row.item_key, "Tag", fallback?.tag ?? ""),
      title: text(itemStore, "deck_item", row.item_key, "Title", fallback?.title ?? ""),
      audience: text(itemStore, "deck_item", row.item_key, "Audience", fallback?.audience ?? ""),
      examples: fallback?.examples ?? [],
    };
  });

  const processSteps = itemsFor("how-we-work:steps").map((row, i) => {
    const fallback = staticContent.processSteps[i];
    return {
      index: fallback?.index ?? String(i + 1).padStart(2, "0"),
      title: text(itemStore, "deck_item", row.item_key, "Title", fallback?.title ?? ""),
      copy: text(itemStore, "deck_item", row.item_key, "Copy", fallback?.copy ?? ""),
    };
  });

  // Selected Work's videos/website entries/print images: same one-accessor pattern, applied
  // per category. Shown for one video category and the print gallery; the rest of the six
  // repeat this identically against their own collectionId — see deckRecords.ts's builders
  // for the exact collectionId each one uses.
  function videosFor(collectionId: string, fallback: ReadonlyArray<{ title: string; src: string }>) {
    return itemsFor(collectionId).map((row, i) => ({
      title: text(itemStore, "deck_item", row.item_key, "Title", fallback[i]?.title ?? ""),
      src: text(itemStore, "deck_item", row.item_key, "Google Drive link", fallback[i]?.src ?? ""),
    }));
  }

  const byKey = new Map(staticContent.portfolioCategories.map((c) => [c.key, c]));
  const portfolioCategories = staticContent.portfolioCategories.map((category) => {
    if (["ugc", "motion-graphics", "synthesia", "ai-video"].includes(category.key)) {
      return { ...category, videos: videosFor(`selected-work:${category.key}`, category.videos ?? []) };
    }
    if (category.key === "websites") {
      const rows = itemsFor("selected-work:websites");
      return {
        ...category,
        projects: rows.map((row, i) => {
          const fallback = category.projects?.[i];
          return {
            ...fallback,
            title: text(itemStore, "deck_item", row.item_key, "Title", fallback?.title ?? ""),
            summary: text(itemStore, "deck_item", row.item_key, "Summary", fallback?.summary ?? ""),
            url: text(itemStore, "deck_item", row.item_key, "Full-deck link", fallback?.url ?? ""),
            ...(fallback?.previewUrl !== undefined
              ? { previewUrl: text(itemStore, "deck_item", row.item_key, "Live preview URL", fallback.previewUrl) }
              : {}),
          };
        }),
      };
    }
    if (category.key === "print-design") {
      return {
        ...category,
        subcategories: (category.subcategories ?? []).map((sub) => ({
          ...sub,
          images: itemsFor(`selected-work:print:${sub.key}`).map((row) => ({
            key: row.item_key,
            title: text(itemStore, "deck_item", row.item_key, "Title", ""),
            image: row.media_path ?? "",
          })),
        })),
      };
    }
    if (category.key === "presentation") {
      return {
        ...category,
        title: text(slideStore, "deck_slide", "selected-work", "Title", category.title ?? ""),
        embedUrl: text(slideStore, "deck_slide", "selected-work", "Embed URL", category.embedUrl ?? ""),
      };
    }
    return category;
  });

  const cta = {
    headline: text(slideStore, "deck_slide", "lets-talk", "Headline", staticContent.ctaContent.headline),
    body: text(slideStore, "deck_slide", "lets-talk", "Body", staticContent.ctaContent.body),
    ctaLabel: text(slideStore, "deck_slide", "lets-talk", "Button label", staticContent.ctaContent.ctaLabel),
    ctaHref: text(slideStore, "deck_slide", "lets-talk", "Button link", staticContent.ctaContent.ctaHref),
    caption: text(slideStore, "deck_slide", "lets-talk", "Caption", staticContent.ctaContent.caption),
  };

  return {
    enabledSlideKeys,
    source: { cover, whoWeAre, processSteps, serviceCategories, engagementModels, portfolioCategories, cta },
  };
}

/** Every slide, unmodified content.ts values — used when `CONTENT_SOURCE=static`. */
export function readDeckContentFromFiles(): PublishedCapabilityDeck {
  return {
    enabledSlideKeys: DECK_SLIDE_CATALOG.map((e) => e.slideKey),
    source: {
      cover: staticContent.coverContent,
      whoWeAre: staticContent.whoWeAre,
      processSteps: staticContent.processSteps,
      serviceCategories: staticContent.serviceCategories,
      engagementModels: staticContent.engagementModels,
      portfolioCategories: staticContent.portfolioCategories,
      cta: staticContent.ctaContent,
    },
  };
}
```

*Note for the implementer:* `ContentStore.load()`'s first parameter is typed
`ContentOwnerKind = "page_section" | "collection_record" | "media_asset"` (see
`infrastructure/db/content/ContentStore.ts:43`) — widen that union to also include
`"deck_slide" | "deck_item"` as part of this task (it is the same kind of additive change
Task 2 made to `CmsValueKind`/`ContentAddress`), and remove the `as never` casts above once
it is widened; they are shown only to mark exactly where that type currently disagrees with
this task's usage.

- [ ] **Step 2: Replace `capabilityDeckContainer.ts`'s body**

```typescript
// src/infrastructure/di/capabilityDeckContainer.ts
import { contentSource } from "../db/env";
import { readDeckContentFromDatabase, readDeckContentFromFiles } from "../capability-deck/getCapabilityDeckContent";

export async function getPublishedCapabilityDeck() {
  return contentSource() === "database" ? readDeckContentFromDatabase() : readDeckContentFromFiles();
}
```

- [ ] **Step 3: Thread the content down from `page.tsx`**

```typescript
// src/app/capability-deck/page.tsx — add near the top, keep everything else (the metadata
// export, the surrounding comment, the noindex) exactly as it is:
import { getPublishedCapabilityDeck } from "../../infrastructure/di/capabilityDeckContainer";

export default async function CapabilityDeckRoute() {
  const deck = await getPublishedCapabilityDeck();
  return (
    <div className="capability-deck">
      <CapabilityDeckMount deck={deck} />
    </div>
  );
}
```

```typescript
// src/presentation/capability-deck/CapabilityDeckMount.tsx — thread the prop through the
// dynamic import boundary:
import type { PublishedCapabilityDeck } from "../../infrastructure/capability-deck/getCapabilityDeckContent";

export function CapabilityDeckMount({ deck }: { readonly deck: PublishedCapabilityDeck }) {
  return <Deck deck={deck} />;
}
```

- [ ] **Step 4: Make `CapabilityDeck.tsx` build its slide list from `enabledSlideKeys`**

```typescript
// src/presentation/capability-deck/CapabilityDeck.tsx
"use client";

import type { PublishedCapabilityDeck } from "../../infrastructure/capability-deck/getCapabilityDeckContent";
import type { SlideEntry } from "./types";
import { PresentationShell } from "./components/PresentationShell";
import CoverSlide from "./slides/CoverSlide";
import WhoWeAreSlide from "./slides/WhoWeAreSlide";
import HowWeWorkSlide from "./slides/HowWeWorkSlide";
import WaysToWorkSlide from "./slides/WaysToWorkSlide";
import ServicesSlide from "./slides/ServicesSlide";
import SelectedWorkSlide from "./slides/SelectedWorkSlide";
import CTASlide from "./slides/CTASlide";

/** Every slide type that exists in code — see domain/capability-deck/entities/DeckSlideCatalog.ts, which this mirrors. */
const SLIDE_COMPONENTS: Readonly<Record<string, { readonly title: string; readonly Component: SlideEntry["Component"] }>> = {
  cover: { title: "Cover", Component: CoverSlide },
  "who-we-are": { title: "Who We Are", Component: WhoWeAreSlide },
  "how-we-work": { title: "How We Work", Component: HowWeWorkSlide },
  services: { title: "Services", Component: ServicesSlide },
  "selected-work": { title: "Selected Work", Component: SelectedWorkSlide },
  "ways-to-work": { title: "Ways to Work", Component: WaysToWorkSlide },
  "lets-talk": { title: "Let's Talk", Component: CTASlide },
};

export function CapabilityDeck({ deck }: { readonly deck: PublishedCapabilityDeck }) {
  const slides: ReadonlyArray<SlideEntry> = deck.enabledSlideKeys
    .map((slideKey) => {
      const entry = SLIDE_COMPONENTS[slideKey];
      return entry ? { id: slideKey, title: entry.title, Component: entry.Component } : undefined;
    })
    .filter((entry): entry is SlideEntry => entry !== undefined);

  return <PresentationShell slides={slides} content={deck.source} />;
}
```

*Note for the implementer:* `PresentationShell` currently receives only `slides` and renders
each `Component` with `SlideProps` (`meta`, `active`, `activeTab`, `onActiveTabChange` — see
`types.ts`). Add `content: CapabilityDeckSource` to `SlideProps` (widen the interface) and
have `PresentationShell` pass it straight through to every slide it renders — read
`components/PresentationShell.tsx` first, since its exact render call is not shown in this
plan, and add the one prop without touching its animation/navigation logic.

- [ ] **Step 5: Convert each slide component to read `content` instead of importing `../data/content`**

The pattern is identical for all seven; shown here for `CoverSlide.tsx` and `WhoWeAreSlide.tsx`
in full, since between them they cover both cases (no existing props today; existing props
already destructured):

```typescript
// src/presentation/capability-deck/slides/CoverSlide.tsx — remove the `data/content` import
// (there was none; it read from local literals) and the module-scope `logoMark` constant.
// Change the signature and every reference to the five literals and `logoMark`:
import type { SlideProps } from '../types'

export default function CoverSlide({ content }: SlideProps) {
  const { cover } = content
  // ...
  // <img src={cover.logoMark} ... />
  // <span>{cover.brand}</span>
  // Where creativity<br/> meets <em>{cover.headlineAccent}</em>  -- headline first line is `cover.headlineLine1`
  // <p>{cover.supporting}</p>
  // <span>{cover.decorativeLabel}</span>
}
```

```typescript
// src/presentation/capability-deck/slides/WhoWeAreSlide.tsx
import type { SlideProps } from '../types'
// remove: import { whoWeAre } from '../data/content'

export default function WhoWeAreSlide({ meta, content }: SlideProps) {
  const { whoWeAre } = content
  // everything else in the file is unchanged — `whoWeAre` now comes from the prop instead
  // of the module import, same shape, same field names
}
```

Apply the same substitution (delete the `import { X } from '../data/content'` line, destructure
the same name off the new `content` prop, change nothing else) to `ServicesSlide.tsx`
(`serviceCategories`), `SelectedWorkSlide.tsx` (`portfolioCategories`), `WaysToWorkSlide.tsx`
(`engagementModels`), `HowWeWorkSlide.tsx` (`processSteps`), and `CTASlide.tsx` (new: read
`content.cta.headline`/`.body`/`.ctaLabel`/`.ctaHref`/`.caption` in place of the five inline
JSX literals currently hardcoded in that file).

- [ ] **Step 6: Fix the two fixed-column grids so add/remove does not break layout**

`ServicesSlide.tsx`'s `styles.grid`:

```typescript
// Before
gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
gridTemplateRows: isMobile ? 'auto' : 'repeat(2, auto)',

// After
gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(260px, 1fr))',
```

(Drop the fixed `gridTemplateRows` entirely — `auto-fit` with no fixed row count lets the
grid wrap to however many rows the current count needs.)

`WaysToWorkSlide.tsx`'s inline `gridTemplateColumns` prop on `StaggerGroup`:

```typescript
// Before
gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',

// After
gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))',
```

- [ ] **Step 7: Typecheck, lint, build**

Run: `npm run typecheck && npm run lint && npm run build`
Expected: PASS. A build failure here most likely means a slide component still references
`../data/content` somewhere Step 5 missed, or `PresentationShell`'s prop widening in Step 4
was not carried through — check both before anything else.

- [ ] **Step 8: Commit**

```bash
git add src/infrastructure/capability-deck/getCapabilityDeckContent.ts src/infrastructure/di/capabilityDeckContainer.ts src/infrastructure/db/content/ContentStore.ts src/app/capability-deck/page.tsx src/presentation/capability-deck
git commit -m "feat: render /capability-deck from published content instead of a static import"
```

---

## Task 17: Full verification pass

**Files:** none created — this task runs the project's own gates and a manual browser pass, per
this feature's own "Verify" section.

- [ ] **Step 1: Automated gates**

Run, in order, stopping to fix at the first failure:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Expected: all four green. `npm run build` additionally exercises Next's static-generation
pass over `/capability-deck`, which is the first point a mismatch between `deckRecords.ts`'s
static build and `getCapabilityDeckContent.ts`'s DB build would surface as a build-time type
or render error.

- [ ] **Step 2: Local database dry run (never production)**

Against a local/dev database only:

```bash
npm run db:migrate
npm run db:seed
npm run db:status
```

Expected: `deck_slides` has 7 rows; `deck_items` has one row per current video + website
entry + print image in `content.ts`; `db:status` shows no pending migrations.

- [ ] **Step 3: Browser pass — every slide's content is visible and editable**

With `CONTENT_SOURCE=database` against the local seeded database, `npm run dev`, log into
`/admin`:

- Open the new "Capability Deck" sidebar group; confirm it lists the 6 currently-active
  slides (or 7, if How We Work was brought back in this pass) with the right titles.
- Open each slide's screen; confirm every field from Task 5's inventory renders with its
  current value, and every `Save draft` → `Publish` round-trip works (status line updates,
  `/capability-deck` shows the change after Publish).

- [ ] **Step 4: Browser pass — add a video via Drive ID/URL**

On the Selected Work slide, "Add a video" under one of the four video categories. Paste a
real Google Drive share link (either `.../view` or `.../preview` form). Save, Preview (confirm
the deck iframe shows the new card, unpublished elsewhere), Publish, then load `/capability-deck`
directly and confirm the new video plays in that category's gallery.

- [ ] **Step 5: Browser pass — the CSP decision actually works**

On the Websites item group, add a new entry with `previewUrl` set to one of the currently
allowlisted origins (e.g. `https://www.bashafood.in/`) — confirm it saves, and once published,
frames correctly on `/capability-deck`. Then attempt to save an entry with `previewUrl` set to
a non-allowlisted origin (e.g. `https://example.com/`) — confirm Save is refused with a message
naming the allowed origins (not a generic "invalid URL"), and that nothing was written (reload
the panel and confirm the field is unchanged).

- [ ] **Step 6: Browser pass — slides**

Add a currently-disabled slide type (e.g. How We Work, if it was left out of this pass) via
"Add a slide" on the Capability Deck overview screen; confirm it appears at the end of the
deck and renders correctly at `/capability-deck`. Reorder two slides with the ↑/↓ controls;
confirm the order changes on the live deck after the reorder call completes (this feature has
no separate publish step — see Task 11's design). Remove a slide; confirm it disappears from
`/capability-deck` and that the slides remaining still render correctly (no broken numbering
in `SectionLabel`/`GhostNumeral`, which read `meta.index`/`meta.total` computed from the
current array length — confirm `PresentationShell` recomputes both from the slides it was
actually given, not from a hardcoded count).

- [ ] **Step 7: Full keyboard pass**

Tab through one slide's editor end to end: every field, every Add/Remove/↑/↓ button, Save,
Preview, Publish, Discard. Confirm focus order is logical, every control has a visible focus
state, and nothing requires a mouse (the ↑/↓ reorder buttons in particular — this plan added
those from scratch, so they are the one control with no existing precedent to fall back on).

- [ ] **Step 8: Final commit**

```bash
git add -A
git status
```

Confirm nothing unintended is staged (in particular: no `.env.local`, no local DB dump), then
commit any verification fixes made along the way with their own descriptive messages — do not
fold fixes into earlier tasks' commits.

---

## Self-Review

**Spec coverage:**
- Editable text/images/videos/websites across slides → Tasks 5-7, 16.
- Drive video ID/URL field, not upload → Tasks 1-2 (`DriveVideoUrl`), 5 (`driveVideoId` kind usage).
- Website-embed URL field restricted to CSP allowlist, not upload → Tasks 1-2 (`AllowedWebsiteUrl`, `DECK_PREVIEW_ORIGINS`), 5.
- Genuinely uploadable images reuse `MediaField` → Task 5 (`imageMedia`), 14 (unchanged `MediaField` import).
- Slide add/remove/reorder → Tasks 3 (catalog), 7 (`addSlide`/`removeSlide`/`reorderSlides`), 11, 13, 15.
- Repeatable item add/remove/reorder → Tasks 7, 11, 13, 14 (`DeckRecordFields`'s ↑/↓).
- CSP decision (a), named-origins error → Task 1.
- New sidebar entry, expands like a page → Task 15.
- Fields grouped the way they render → Task 5.
- Save/preview/publish/`revalidatePath` for `/capability-deck` → Tasks 10, 13.
- Lookup-key fields marked unsafe to rename → `collectionId`/`slideKey`/item `id` are never
  exposed as editable fields anywhere in Tasks 5, 14-15 (only `title`/labels are); this is
  worth a one-line callout on the Selected Work screen if a future pass adds one, but no
  task currently exposes a renamable key, so there is nothing today that needs the warning
  text the seven pages' `KEY_TITLE` constants carry.
- Keyboard operable, feedback on every action, concurrency handled → Tasks 7 (versions/conflict), 10, 14, 17.
- Do not touch the 7 pages → no task modifies `pages.ts`, `composition.ts`, `sections/*.ts`, `StaticCmsRepository.ts`'s existing behavior, or any existing route under `/admin/pages`.
- Do not deploy → every DB-touching step in Tasks 4, 8, 17 is scoped to local/dev only.

**Placeholder scan:** no task step reads "TBD"/"add error handling"/"similar to Task N" without
code. Two notes were left for the implementer to resolve against files this plan could not
read directly (Task 15 Step 3's `params` shape, Task 16 Step 4's exact `PresentationShell`
render call) — both name the exact sibling file to check and the exact one-line change to
make, which is a pointer to ground truth rather than an unresolved decision.

**Type consistency:** `DeckSlideTarget { slideId }` (Task 10) is used identically in Tasks 13-15.
`ContentEdit`/`ContentAddress`/`ContentConflictError` (Task 3, re-exported) are the same objects
Tasks 7, 10-11 import — never redeclared. `CapabilityDeckSource` (Task 5) is the one shape
produced by `staticDeckSource()` (Task 6), consumed by `buildDeckSlideRecords` (Task 5),
`DbCapabilityDeckRepository` (Task 7), and `getCapabilityDeckContent.ts` (Task 16) — checked
field-by-field against each other while writing this plan; `portfolioCategories`'s `any` typing
in `CapabilityDeckSource` is a deliberate, narrow escape (content.ts's own `PortfolioCategory[]`
type is imported by both readers of that field) rather than an unresolved type, called out
inline in Task 5's code with the reason.

---

Plan complete and saved to `docs/superpowers/plans/2026-09-17-capability-deck-cms.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**

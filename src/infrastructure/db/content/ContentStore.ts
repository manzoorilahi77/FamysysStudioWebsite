import { createCta } from "../../../domain/shared/value-objects/Cta";
import type { Cta } from "../../../domain/shared/value-objects/Cta";
import { MediaRef } from "../../../domain/shared/value-objects/MediaRef";
import type { AspectRatio, MediaKind } from "../../../domain/shared/value-objects/MediaRef";
import { placeholders } from "../pool";
import { cachedRows } from "./cache";
import { isPreviewRequest } from "./preview";
import type { ContentDraftRow, ContentStringRow } from "./rows";

/**
 * EVERY STRING FOR A SET OF RECORDS, READ IN ONE QUERY, ADDRESSED BY THE SAME KEYS THE
 * PANEL USES.
 *
 * The repositories below this are page assemblers: they know the shape of an entity and
 * ask for the strings by name. What they must not do is issue a query per field — a page
 * has forty of them and the database is on another host — so a store is loaded once for
 * every owner a page needs and then read from memory.
 *
 * A MISSING KEY THROWS, and says which key and which owner. The alternative is a heading
 * that renders as an empty string, which looks like a design decision and survives to
 * production. A build that stops with "home:hero has no field 'heading'" is a build that
 * gets fixed. Falling back to the static file per-field is deliberately NOT done here:
 * the fallback is whole-repository and chosen in the composition root, so the site is
 * either reading the database or reading the files, never an unrepeatable mix of both.
 */

export class MissingContentError extends Error {
  constructor(ownerKey: string, fieldKey: string) {
    super(
      `${ownerKey} has no content field "${fieldKey}". ` +
        "Run `npm run db:seed` — the database is behind the content model.",
    );
    this.name = "MissingContentError";
  }
}

interface StoredValue {
  readonly value: string;
  readonly listKey: string | null;
  readonly sortOrder: number;
}

export type ContentOwnerKind = "page_section" | "collection_record" | "media_asset" | "deck_slide" | "deck_item";

export class ContentStore {
  private constructor(private readonly byOwner: Map<string, Map<string, StoredValue>>) {}

  /**
   * `keys` are whole owner keys ("home:hero"), or prefixes when `prefix` is set — a page
   * asks for "home:" and gets every section on it, which is one round trip for a page
   * rather than one per section.
   */
  static async load(
    kind: ContentOwnerKind,
    keys: ReadonlyArray<string>,
    options: { readonly prefix?: boolean } = {},
  ): Promise<ContentStore> {
    const byOwner = new Map<string, Map<string, StoredValue>>();
    if (keys.length === 0) return new ContentStore(byOwner);

    const clause = options.prefix
      ? keys.map(() => "owner_key LIKE ?").join(" OR ")
      : `owner_key IN (${placeholders(keys.length)})`;
    const values = options.prefix ? keys.map((key) => `${key}%`) : [...keys];

    const found = await cachedRows<ContentStringRow>(
      `SELECT owner_key, field_key, value, list_key, sort_order
         FROM content_strings
        WHERE owner_kind = ? AND (${clause})
        ORDER BY owner_key, sort_order`,
      [kind, ...values],
    );

    for (const entry of found) {
      let owner = byOwner.get(entry.owner_key);
      if (!owner) {
        owner = new Map<string, StoredValue>();
        byOwner.set(entry.owner_key, owner);
      }
      owner.set(entry.field_key, {
        value: entry.value,
        listKey: entry.list_key,
        sortOrder: entry.sort_order,
      });
    }

    // THE PREVIEW OVERLAY, and the only place unpublished words can reach a page.
    // Only a request carrying Next's draft-mode cookie gets here, that cookie is set by
    // one session-gated endpoint, and a draft can only REPLACE a published string —
    // never introduce a field, never reorder a list. So the shape of a previewed page is
    // the shape of the published one, with different words in it.
    if (await isPreviewRequest()) {
      const drafts = await cachedRows<ContentDraftRow>(
        `SELECT owner_key, field_key, value
           FROM content_drafts
          WHERE owner_kind = ? AND (${clause})`,
        [kind, ...values],
      );
      for (const entry of drafts) {
        const owner = byOwner.get(entry.owner_key);
        const existing = owner?.get(entry.field_key);
        if (owner && existing) {
          owner.set(entry.field_key, { ...existing, value: entry.value });
        }
      }
    }

    return new ContentStore(byOwner);
  }

  has(ownerKey: string): boolean {
    return this.byOwner.has(ownerKey);
  }

  owners(): ReadonlyArray<string> {
    return [...this.byOwner.keys()];
  }

  /** One string. Throws when it is not there — see the note at the top of the file. */
  text(ownerKey: string, fieldKey: string): string {
    const found = this.byOwner.get(ownerKey)?.get(fieldKey);
    if (found === undefined) throw new MissingContentError(ownerKey, fieldKey);
    return found.value;
  }

  /** A string that is allowed not to exist — an optional CTA, a field only some records carry. */
  optional(ownerKey: string, fieldKey: string): string | undefined {
    return this.byOwner.get(ownerKey)?.get(fieldKey)?.value;
  }

  /** One named list, in the order the panel shows it. */
  list(ownerKey: string, listKey: string): ReadonlyArray<string> {
    const owner = this.byOwner.get(ownerKey);
    if (!owner) throw new MissingContentError(ownerKey, listKey);
    return [...owner.values()]
      .filter((entry) => entry.listKey === listKey)
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((entry) => entry.value);
  }

  /**
   * The two halves of a call to action. They are stored apart because they are validated
   * apart — a label by `CtaLabel` and a link by `Url` — and rejoined here by the same
   * factory the content files use, so a bad pair fails at the same place either way.
   */
  cta(ownerKey: string, base: string): Cta {
    return createCta(this.text(ownerKey, `${base}-label`), this.text(ownerKey, `${base}-link`));
  }

  ctaIfPresent(ownerKey: string, base: string): Cta | undefined {
    const label = this.optional(ownerKey, `${base}-label`);
    const href = this.optional(ownerKey, `${base}-link`);
    return label !== undefined && href !== undefined ? createCta(label, href) : undefined;
  }
}

/**
 * A media reference: the file comes from a structural column, the alt text from a content
 * string. That split is the whole point — a path is a file the site has to find, and alt
 * text is copy someone writes.
 */
export function mediaFrom(path: string, kind: string, aspectRatio: string, alt: string): MediaRef {
  return MediaRef.create({
    kind: kind as MediaKind,
    src: path,
    alt,
    aspectRatio: aspectRatio as AspectRatio,
  });
}

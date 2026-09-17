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
import type { CmsItemGroup, CmsRecord } from "../../domain/cms/entities/CmsRecord";
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
/**
 * Which of a static item group's built records currently exist, and in what order. Rows
 * are keyed `<collectionId>:<builtRecord.id>` in `deck_items.item_key` — the same scheme
 * Task 8's seed script writes, so a read here never has to invent a second one.
 */
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
    const [slideRows, itemRows, { published }] = await Promise.all([
      cachedRows<DeckSlideRow>("SELECT slide_key, sort_order, updated_at FROM deck_slides ORDER BY sort_order"),
      cachedRows<DeckItemRow>(
        "SELECT item_key, collection_id, media_path, media_kind, sort_order FROM deck_items ORDER BY collection_id, sort_order",
      ),
      loadStrings(),
    ]);

    // The static-shaped build gives every field its id, label, kind and order; this pass
    // only asks "does content_strings have anything newer than the seed for this exact
    // field", by the id the static build already produced — never by re-deriving order.
    const staticRecords = buildDeckSlideRecords(staticDeckSource(), null);

    // One entry per collection_id, in sort_order (the query is already ordered that way,
    // so pushing in read order is enough — nothing here re-sorts).
    const itemRowsByCollection = new Map<string, DeckItemRow[]>();
    for (const row of itemRows) {
      const existing = itemRowsByCollection.get(row.collection_id);
      if (existing) {
        existing.push(row);
      } else {
        itemRowsByCollection.set(row.collection_id, [row]);
      }
    }

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

    /**
     * An item-kind field is the exact same overlay `overlayPublished` already does for a
     * slide — the only difference is the owner kind and which row's key is used — so this
     * reuses it rather than a parallel copy of `resolveText`'s lookup.
     */
    function overlayItem(record: CmsRecord, itemKey: string): CmsRecord {
      return overlayPublished(record, "deck_item", itemKey);
    }

    /**
     * An uploaded image REPLACES the seed's path outright — there is no field on the item
     * for it to be "published" through, the same way `capabilities`/`process_steps` already
     * swap `media_path` after an upload rather than routing it through `content_strings`.
     * Both the display path and the editable "File" value are updated together, because
     * `toMedia` always sets them from the same source and a mismatch would show one image
     * while claiming to hold the other.
     */
    function applyMediaPathOverride(record: CmsRecord, mediaPath: string): CmsRecord {
      const groups = record.groups.map((group) => ({
        ...group,
        media: group.media.map((m) => ({
          ...m,
          path: mediaPath,
          ...(m.src ? { src: { ...m.src, value: mediaPath } } : {}),
        })),
      }));
      return { ...record, groups };
    }

    /**
     * WHICH OF A GROUP'S BUILT RECORDS ARE CURRENTLY PLACED, AND IN WHAT ORDER — read from
     * `deck_items` exactly the way slide placement is read from `deck_slides` above. No rows
     * yet for this collection (a fresh checkout before Task 8's seed has run, or a slide
     * whose items were never seeded) means "nothing to say otherwise": the static build is
     * returned unchanged, so the panel never shows an empty list where the seed simply
     * hasn't run. A `deck_items` row that doesn't match up with a static-built record is left
     * out — the seed can only ever have written keys the same builder produced.
     */
    function overlayItemGroup(group: CmsItemGroup): CmsItemGroup {
      const dbRows = itemRowsByCollection.get(group.collectionId);
      if (!dbRows || dbRows.length === 0) return group;

      const byItemKey = new Map(group.records.map((record) => [`${group.collectionId}:${record.id}`, record]));
      const records = dbRows
        .map((row) => {
          const builtRecord = byItemKey.get(row.item_key);
          if (!builtRecord) return undefined;
          const overlaid = overlayItem(builtRecord, row.item_key);
          return row.media_kind === "image" && row.media_path
            ? applyMediaPathOverride(overlaid, row.media_path)
            : overlaid;
        })
        .filter((record): record is CmsRecord => record !== undefined);

      return { ...group, records };
    }

    const orderedSlideKeys = slideRows.map((r) => r.slide_key);
    const slides = orderedSlideKeys
      .map((slideKey) => {
        const built = staticRecords.get(slideKey);
        if (!built) return undefined;
        const withFields = overlayPublished(built, "deck_slide", slideKey);
        const withItems: CmsRecord = { ...withFields, items: withFields.items.map(overlayItemGroup) };
        return withItems;
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

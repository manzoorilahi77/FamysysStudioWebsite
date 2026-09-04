import type { CmsCollection } from "../../domain/cms/entities/CmsCollection";
import type { CmsInquiry } from "../../domain/cms/entities/CmsInquiry";
import type { CmsPage } from "../../domain/cms/entities/CmsPage";
import type { CmsRecord, CmsValue } from "../../domain/cms/entities/CmsRecord";
import {
  ContentConflictError,
  type ContentEdit,
  type NewCmsRecord,
} from "../../domain/cms/repositories/CmsRepository";
import { StaticCmsRepository } from "../cms/StaticCmsRepository";
import { derivedId } from "../cms/records";
import type { ContentStringDetailRow, InquiryRow } from "./content/rows";
import { toDate } from "./content/rows";
import { transaction, write } from "./pool";
import { cachedRows } from "./content/cache";

/**
 * THE PANEL, OVER THE DATABASE.
 *
 * It reads the model exactly the way the file-backed one does — the same builders, fed by
 * the same seven site repositories, which in this configuration are the database-backed
 * ones. That is what keeps the panel honest: a screen cannot show a string the site does
 * not render, because both are reading the same repository.
 *
 * What it adds is the three things a file cannot do.
 *
 * A REVISION PER STRING. Every value is stamped with its row's `version`, and a save
 * sends it back. The UPDATE is conditional on it, so a second editor working from a screen
 * loaded before the first one saved is told the string moved rather than quietly undoing
 * it.
 *
 * RECORDS THAT COME AND GO. A collection is a table, so a create is an INSERT and a delete
 * is a DELETE. Pages remain fixed — the routes decide which exist — and there is no method
 * that could add one.
 *
 * AN INBOX. `inquiries` holds what the contact form sends, so the screen that has always
 * said "nothing arrives here yet" now lists what did.
 *
 * ADDRESSING. A write takes the record address the read model produced — which record,
 * which field — with the source pointer as the fallback for a string that still has one.
 * Neither is anything a browser sent: both are derived in the use case from the target it
 * named and the ids the model gave, so nothing in a request can name a table, a column or
 * a file.
 */
export class DbCmsRepository extends StaticCmsRepository {
  override readonly supportsRecordChanges = true;

  override async getPages(): Promise<ReadonlyArray<CmsPage>> {
    const [pages, versions] = await Promise.all([super.getPages(), this.versions()]);
    return pages.map((page) => ({
      ...page,
      sections: page.sections.map((section) =>
        withVersions(section, `page_section:${page.id}:${section.id}`, versions),
      ),
    }));
  }

  override async getCollections(): Promise<ReadonlyArray<CmsCollection>> {
    const [collections, versions] = await Promise.all([super.getCollections(), this.versions()]);
    return collections.map((collection) => ({
      ...collection,
      records: collection.records.map((record) =>
        withVersions(record, `collection_record:${collection.id}:${record.id}`, versions),
      ),
    }));
  }

  override async getInquiries(): Promise<ReadonlyArray<CmsInquiry>> {
    const found = await cachedRows<InquiryRow>(
      `SELECT * FROM inquiries WHERE status <> 'archived' ORDER BY received_at DESC, id DESC`,
    );
    return found.map((entry) => ({
      id: String(entry.id),
      name: entry.full_name,
      email: entry.email,
      companyName: entry.company_name,
      companySize: entry.company_size,
      status: entry.status,
      receivedAt: toDate(entry.received_at) ?? new Date(0),
    }));
  }

  /**
   * Every edit in one transaction, each conditional on the revision the editor loaded.
   *
   * A statement that matches no row is either a pointer that no longer exists or a row
   * that has moved on. Both are reported rather than retried: the second is the case that
   * matters, and telling an editor "someone else changed this" is the only answer that
   * does not lose one of the two edits.
   */
  override async applyEdits(edits: ReadonlyArray<ContentEdit>): Promise<void> {
    if (edits.length === 0) return;

    await transaction(async (connection) => {
      for (const edit of edits) {
        // The record address where the read model gave one, the source pointer otherwise.
        // A record created in the panel has no pointer, so the address has to come first.
        const where = edit.owner
          ? {
              clause: "owner_kind = ? AND owner_key = ? AND field_key = ?",
              values: [edit.owner.kind, edit.owner.key, edit.owner.field] as Array<string | number>,
            }
          : {
              clause: "source_file = ? AND source_symbol = ? AND source_path = CAST(? AS JSON)",
              values: [
                edit.pointer.file,
                edit.pointer.symbol,
                JSON.stringify(edit.pointer.path),
              ] as Array<string | number>,
            };

        const [result] = await connection.execute(
          `UPDATE content_strings
              SET value = ?, version = version + 1
            WHERE ${where.clause}
              AND is_editable = 1
              ${edit.expectedVersion === undefined ? "" : "AND version = ?"}`,
          [
            edit.value,
            ...where.values,
            ...(edit.expectedVersion === undefined ? [] : [edit.expectedVersion]),
          ],
        );
        if ((result as { affectedRows: number }).affectedRows === 0) {
          throw new ContentConflictError(
            "This string changed since the screen was loaded — someone else saved it, " +
              "or it is no longer editable. Reload the panel and make the change again.",
          );
        }
      }
    });
  }

  /**
   * A new record starts with the three strings a list row needs and nothing else. The
   * rest of its fields are created empty and shown as such rather than pre-filled with
   * invented copy, which would be indistinguishable from the client's own once written.
   */
  override async createRecord(collectionId: string, record: NewCmsRecord): Promise<string> {
    const table = STRUCTURAL_TABLE[collectionId];
    if (!table) {
      throw new Error(`"${collectionId}" is not a collection records can be added to.`);
    }
    const slug = derivedId(record.slug || record.title);
    if (!slug) {
      throw new Error("A record needs a title it can make a stable key from.");
    }

    return transaction(async (connection) => {
      const [existing] = await connection.execute(
        `SELECT 1 FROM \`${table.name}\` WHERE ${table.key} = ? LIMIT 1`,
        [slug],
      );
      if ((existing as unknown[]).length > 0) {
        throw new Error(`"${slug}" already exists in this collection.`);
      }

      await connection.execute(
        `INSERT INTO \`${table.name}\` (${table.insertColumns}) VALUES (${table.insertValues})`,
        table.insertParameters(slug),
      );

      const ownerKey = `${collectionId}:${slug}`;
      for (const [index, field] of table.fields.entries()) {
        await connection.execute(
          `INSERT INTO content_strings
             (owner_kind, owner_key, field_key, label, value, value_kind, sort_order,
              is_approved, is_editable)
           VALUES ('collection_record', ?, ?, ?, ?, 'text', ?, 0, 1)`,
          [
            ownerKey,
            field.key,
            field.label,
            field.key === table.titleField
              ? record.title
              : field.key === table.summaryField
                ? record.summary
                : "",
            index,
          ],
        );
      }

      // A question nobody asks is a question nobody sees. A new FAQ entry is placed on
      // the homepage block, which is the one that defines the shared set.
      if (collectionId === "faq") {
        await connection.execute(
          `INSERT INTO faq_placements (page_key, faq_id, sort_order)
           SELECT 'home', id, 999 FROM faq_items WHERE faq_key = ?`,
          [slug],
        );
      }
      return slug;
    });
  }

  override async deleteRecord(collectionId: string, recordId: string): Promise<void> {
    const table = STRUCTURAL_TABLE[collectionId];
    if (!table) {
      throw new Error(`"${collectionId}" is not a collection records can be removed from.`);
    }
    await transaction(async (connection) => {
      const [result] = await connection.execute(
        `DELETE FROM \`${table.name}\` WHERE ${table.key} = ?`,
        [recordId],
      );
      if ((result as { affectedRows: number }).affectedRows === 0) {
        throw new Error(`"${recordId}" is not in ${collectionId}.`);
      }
      // The join rows go by foreign key; the strings have no foreign key to the record,
      // because they are keyed by a text owner rather than by its id, so they go here.
      await connection.execute(
        "DELETE FROM content_strings WHERE owner_kind = 'collection_record' AND owner_key = ?",
        [`${collectionId}:${recordId}`],
      );
    });
  }

  override async setInquiryStatus(id: string, status: "new" | "read" | "archived"): Promise<void> {
    const numeric = Number(id);
    if (!Number.isInteger(numeric) || numeric <= 0) {
      throw new Error("That is not an enquiry id.");
    }
    await write(
      `UPDATE inquiries
          SET status = ?,
              read_at = CASE WHEN ? IN ('read','archived') AND read_at IS NULL THEN NOW(3) ELSE read_at END,
              archived_at = CASE WHEN ? = 'archived' THEN NOW(3) ELSE NULL END
        WHERE id = ?`,
      [status, status, status, numeric],
    );
  }

  /**
   * Address -> revision, for the whole panel in one query.
   *
   * A page carries forty strings and the panel shows seven pages and eight collections;
   * asking per value would be several hundred round trips to a host that is not local.
   * Six hundred rows of two small columns is one.
   */
  private async versions(): Promise<ReadonlyMap<string, number>> {
    const found = await cachedRows<ContentStringDetailRow>(
      "SELECT owner_kind, owner_key, field_key, version FROM content_strings",
    );
    return new Map(
      found.map((entry) => [
        `${entry.owner_kind}:${entry.owner_key}:${entry.field_key}`,
        entry.version,
      ]),
    );
  }
}

function stamp(
  value: CmsValue,
  ownerPrefix: string,
  versions: ReadonlyMap<string, number>,
): CmsValue {
  const version = versions.get(`${ownerPrefix}:${value.id}`);
  return version === undefined ? value : { ...value, version };
}

function withVersions(
  record: CmsRecord,
  ownerPrefix: string,
  versions: ReadonlyMap<string, number>,
): CmsRecord {
  return {
    ...record,
    values: record.values.map((value) => stamp(value, ownerPrefix, versions)),
    lists: record.lists.map((list) => ({
      ...list,
      items: list.items.map((item) => stamp(item, ownerPrefix, versions)),
    })),
    ...(record.media
      ? { media: { ...record.media, alt: stamp(record.media.alt, ownerPrefix, versions) } }
      : {}),
  };
}

/**
 * WHICH COLLECTIONS ACCEPT A NEW RECORD, AND WHAT ONE STARTS AS.
 *
 * A closed list, not a lookup by name: the table and column names below are literals in
 * this file and nothing a request sends reaches them. `collectionId` is matched against
 * these keys and rejected if it is not one of them, which is what makes it safe for the
 * table name to be interpolated at all.
 *
 * Case studies are absent on purpose. A ninth piece needs two covers, a reference number
 * and a set of capability links before it renders as anything, and none of those is a
 * string an editor types into a text field — adding one is a job for media upload, which
 * is a later phase.
 */
interface StructuralTable {
  readonly name: string;
  readonly key: string;
  readonly insertColumns: string;
  readonly insertValues: string;
  readonly insertParameters: (slug: string) => Array<string | number>;
  readonly titleField: string;
  readonly summaryField: string;
  readonly fields: ReadonlyArray<{ readonly key: string; readonly label: string }>;
}

const PLACEHOLDER_MEDIA = "/media/service-hero-band.jpg";

const STRUCTURAL_TABLE: Record<string, StructuralTable | undefined> = {
  capabilities: {
    name: "capabilities",
    key: "slug",
    insertColumns: "slug, media_path, media_kind, media_ratio, sort_order",
    insertValues: "?, ?, 'image', '4:3', 999",
    insertParameters: (slug) => [slug, PLACEHOLDER_MEDIA],
    titleField: "title",
    summaryField: "descriptor",
    fields: [
      { key: "title", label: "Title" },
      { key: "descriptor", label: "Descriptor" },
      { key: "expanded-copy", label: "Expanded copy" },
      { key: "media-alt", label: "Alt text" },
    ],
  },
  "process-steps": {
    name: "process_steps",
    key: "slug",
    insertColumns: "slug, media_path, media_kind, media_ratio, sort_order",
    insertValues: "?, ?, 'image', '4:3', 999",
    insertParameters: (slug) => [slug, PLACEHOLDER_MEDIA],
    titleField: "title",
    summaryField: "description",
    fields: [
      { key: "title", label: "Title" },
      { key: "description", label: "Description" },
      { key: "expanded-copy", label: "Expanded copy" },
      { key: "media-alt", label: "Alt text" },
    ],
  },
  "engagement-tiers": {
    name: "engagement_tiers",
    key: "slug",
    insertColumns: "slug, is_custom, media_path, media_kind, media_ratio, sort_order",
    insertValues: "?, 0, ?, 'image', '4:3', 999",
    insertParameters: (slug) => [slug, PLACEHOLDER_MEDIA],
    titleField: "name",
    summaryField: "descriptor",
    fields: [
      { key: "name", label: "Name" },
      { key: "descriptor", label: "Descriptor" },
      { key: "summary", label: "Summary" },
      { key: "ideal-for", label: "Ideal for" },
      { key: "typical-work-includes", label: "Typical work includes" },
      { key: "best-when", label: "Best when" },
      { key: "engagement-shape", label: "Engagement shape" },
      { key: "expanded-copy", label: "Expanded copy" },
      { key: "media-alt", label: "Alt text" },
    ],
  },
  faq: {
    name: "faq_items",
    key: "faq_key",
    insertColumns: "faq_key, owner, has_cta, sort_order",
    insertValues: "?, 'home', 0, 999",
    insertParameters: (slug) => [slug],
    titleField: "question",
    summaryField: "answer",
    fields: [
      { key: "question", label: "Question" },
      { key: "answer", label: "Answer" },
    ],
  },
};

/** The collections the panel may offer an Add button on. */
export const CREATABLE_COLLECTIONS = Object.keys(STRUCTURAL_TABLE);

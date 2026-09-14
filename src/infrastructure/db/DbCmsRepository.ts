import type { PoolConnection } from "mysql2/promise";
import type { CmsInquiry, CmsInquiryStatus } from "../../domain/cms/entities/CmsInquiry";
import type { CmsPage } from "../../domain/cms/entities/CmsPage";
import type { ContentAddress, ContentFieldAddress } from "../../domain/cms/entities/ContentAddress";
import {
  ContentConflictError,
  type ContentEdit,
  type NewCmsRecord,
} from "../../domain/cms/repositories/CmsRepository";
import { StaticCmsRepository } from "../cms/StaticCmsRepository";
import { withDrafts } from "../cms/drafts";
import { derivedId } from "../cms/records";
import { cachedRows } from "./content/cache";
import type { ContentDraftDetailRow, ContentStringDetailRow, InquiryRow } from "./content/rows";
import { toDate } from "./content/rows";
import { transaction, write } from "./pool";
import { mediaKindFromPath } from "./repositories/shared";

/**
 * THE PANEL, OVER THE DATABASE.
 *
 * It reads the model exactly the way the file-backed one does — the same builders, fed by
 * the same seven site repositories, which in this configuration are the database-backed
 * ones. That is what keeps the panel honest: a screen cannot show a string the site does
 * not render, because both are reading the same repository.
 *
 * What it adds is the four things a file cannot do.
 *
 * A DRAFT THAT IS NOT THE SITE. `content_drafts` holds a saved edit; `content_strings` is
 * what every page reads. Save writes the first, publish moves it to the second. Nothing a
 * visitor can reach changes in between.
 *
 * A REVISION PER STRING. Every value is stamped with its row's `version`, and a save sends
 * it back. Both the save and the publish are conditional on it, so a second editor working
 * from a screen loaded before the first one saved is told the string moved rather than
 * quietly undoing it.
 *
 * RECORDS THAT COME AND GO. A run of cards is a table, so a create is an INSERT and a
 * delete is a DELETE. Pages remain fixed — the routes decide which exist — and there is no
 * method that could add one.
 *
 * AN INBOX. `inquiries` holds what the contact form sends.
 *
 * ADDRESSING. A write takes the record address the read model produced — which record,
 * which field. It is not anything a browser sent: it is derived in the use case from the
 * target it named and the ids the model gave, so nothing in a request can name a table, a
 * column or a file.
 */
export class DbCmsRepository extends StaticCmsRepository {
  override readonly supportsRecordChanges = true;

  /** The preview lays `content_drafts` over `content_strings` — see content/preview.ts. */
  override readonly supportsDraftPreview = true;

  override async getPages(): Promise<ReadonlyArray<CmsPage>> {
    const [pages, drafts, versions] = await Promise.all([
      this.publishedPages(),
      this.drafts(),
      this.versions(),
    ]);
    return withDrafts(pages, drafts, versions);
  }

  /**
   * Every unpublished edit, and every revision, for the whole panel in two queries.
   *
   * A page carries forty strings and the panel shows seven pages; asking per value would be
   * several hundred round trips to a host that is not local. Six hundred rows of three small
   * columns is one.
   */
  protected override async drafts(): Promise<ReadonlyMap<string, string>> {
    const found = await cachedRows<ContentDraftDetailRow>(
      "SELECT owner_kind, owner_key, field_key, value, base_version FROM content_drafts",
    );
    return new Map(
      found.map((entry) => [
        `${entry.owner_kind}:${entry.owner_key}:${entry.field_key}`,
        entry.value,
      ]),
    );
  }

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

  /**
   * SAVE. Every edit in one transaction, each conditional on the revision the editor loaded.
   *
   * The condition is checked against `content_strings` rather than against the draft,
   * because the question a save has to answer is "has the LIVE string moved since this
   * screen was loaded". A draft of my own that I am overwriting is not a conflict; a
   * published change I never saw is.
   *
   * `base_version` is carried onto the draft row so the publish can make the same check
   * again at the moment it matters.
   */
  override async saveDrafts(edits: ReadonlyArray<ContentEdit>): Promise<void> {
    if (edits.length === 0) return;

    await transaction(async (connection) => {
      for (const edit of edits) {
        const [rows] = await connection.execute(
          `SELECT version, is_editable, label FROM content_strings
            WHERE owner_kind = ? AND owner_key = ? AND field_key = ? LIMIT 1`,
          [edit.address.kind, edit.address.key, edit.address.field],
        );
        const current = (rows as unknown as ReadonlyArray<ContentStringDetailRow>)[0];

        if (!current) {
          throw new ContentConflictError(
            "That field is no longer on this section. Reload the panel and make the change again.",
          );
        }
        if (current.is_editable !== 1) {
          throw new ContentConflictError(
            `"${current.label}" is not editable. Reload the panel to see why.`,
          );
        }
        if (edit.expectedVersion !== undefined && current.version !== edit.expectedVersion) {
          throw new ContentConflictError(
            `"${current.label}" was changed by someone else since this screen was loaded. Reload the panel and make the change again.`,
          );
        }

        await connection.execute(
          `INSERT INTO content_drafts (owner_kind, owner_key, field_key, value, base_version)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE value = VALUES(value), base_version = VALUES(base_version)`,
          [edit.address.kind, edit.address.key, edit.address.field, edit.value, current.version],
        );
      }
    });
  }

  /**
   * PUBLISH. Every draft on these records moves onto the live content, or none of them.
   *
   * The UPDATE is conditional on the revision the draft was made against, so a string
   * somebody else published in the meantime matches zero rows and the whole publish is
   * refused. Telling an editor "this changed underneath you" is the only answer that does
   * not throw away one of the two edits.
   */
  override async publishDrafts(
    owners: ReadonlyArray<ContentAddress>,
  ): Promise<ReadonlyArray<ContentFieldAddress>> {
    if (owners.length === 0) return [];

    return transaction(async (connection) => {
      const clause = owners.map(() => "(owner_kind = ? AND owner_key = ?)").join(" OR ");
      const parameters = owners.flatMap((owner) => [owner.kind, owner.key]);

      const [rows] = await connection.execute(
        `SELECT owner_kind, owner_key, field_key, value, base_version
           FROM content_drafts
          WHERE ${clause}
          FOR UPDATE`,
        parameters,
      );
      const held = rows as unknown as ReadonlyArray<ContentDraftDetailRow>;
      if (held.length === 0) return [];

      for (const draft of held) {
        const [result] = await connection.execute(
          `UPDATE content_strings
              SET value = ?, version = version + 1
            WHERE owner_kind = ? AND owner_key = ? AND field_key = ?
              AND is_editable = 1
              AND version = ?`,
          [
            draft.value,
            draft.owner_kind,
            draft.owner_key,
            draft.field_key,
            draft.base_version,
          ],
        );
        if ((result as { affectedRows: number }).affectedRows === 0) {
          throw new ContentConflictError(
            "One of these strings changed after this edit was saved, so nothing was published. Reload the panel, check what it now says, and make the change again.",
          );
        }

        await syncStructuralMedia(connection, draft);
      }

      await connection.execute(
        `DELETE FROM content_drafts WHERE ${clause}`,
        parameters,
      );

      return held.map(
        (draft): ContentFieldAddress => ({
          kind: draft.owner_kind === "collection_record" ? "collection_record" : "page_section",
          key: draft.owner_key,
          field: draft.field_key,
        }),
      );
    });
  }

  override async discardDrafts(owners: ReadonlyArray<ContentAddress>): Promise<void> {
    if (owners.length === 0) return;
    const clause = owners.map(() => "(owner_kind = ? AND owner_key = ?)").join(" OR ");
    await write(
      `DELETE FROM content_drafts WHERE ${clause}`,
      owners.flatMap((owner) => [owner.kind, owner.key]),
    );
  }

  override async getInquiries(): Promise<ReadonlyArray<CmsInquiry>> {
    const found = await cachedRows<InquiryRow>(
      `SELECT * FROM inquiries ORDER BY received_at DESC, id DESC`,
    );
    return found.map((entry) => ({
      id: String(entry.id),
      name: entry.full_name,
      email: entry.email,
      companyName: entry.company_name,
      companySize: entry.company_size,
      companyWebsite: entry.company_website,
      contactRole: entry.contact_role,
      projectBrief: entry.project_brief,
      sourceForm: entry.source_form === "home" ? "home" : "contact",
      status: entry.status,
      receivedAt: toDate(entry.received_at) ?? new Date(0),
    }));
  }

  /**
   * A new record starts with the three strings a list row needs and nothing else. The
   * rest of its fields are created empty and shown as such rather than pre-filled with
   * invented copy, which would be indistinguishable from the client's own once written.
   */
  override async createRecord(collectionId: string, record: NewCmsRecord): Promise<string> {
    const table = STRUCTURAL_TABLE[collectionId];
    if (!table) {
      throw new Error(`"${collectionId}" is not a run of blocks records can be added to.`);
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
        throw new Error(`"${slug}" already exists here.`);
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
      throw new Error(`"${collectionId}" is not a run of blocks records can be removed from.`);
    }
    await transaction(async (connection) => {
      const [result] = await connection.execute(
        `DELETE FROM \`${table.name}\` WHERE ${table.key} = ?`,
        [recordId],
      );
      if ((result as { affectedRows: number }).affectedRows === 0) {
        throw new Error(`"${recordId}" is no longer there.`);
      }
      // The join rows go by foreign key; the strings and any drafts on them have no
      // foreign key to the record, because they are keyed by a text owner rather than by
      // its id, so they go here.
      const ownerKey = `${collectionId}:${recordId}`;
      await connection.execute(
        "DELETE FROM content_strings WHERE owner_kind = 'collection_record' AND owner_key = ?",
        [ownerKey],
      );
      await connection.execute(
        "DELETE FROM content_drafts WHERE owner_kind = 'collection_record' AND owner_key = ?",
        [ownerKey],
      );
    });
  }

  override async setInquiryStatus(id: string, status: CmsInquiryStatus): Promise<void> {
    const numeric = Number(id);
    if (!Number.isInteger(numeric) || numeric <= 0) {
      throw new Error("That is not an enquiry id.");
    }
    const result = await write(
      `UPDATE inquiries
          SET status = ?,
              read_at = CASE WHEN ? IN ('read','archived') AND read_at IS NULL THEN NOW(3) ELSE read_at END,
              archived_at = CASE WHEN ? = 'archived' THEN NOW(3) ELSE NULL END
        WHERE id = ?`,
      [status, status, status, numeric],
    );
    if (result.affectedRows === 0) {
      throw new Error("That enquiry is no longer there. Reload the inbox.");
    }
  }
}

/**
 * WHICH FIELD, ON WHICH COLLECTION, IS A STRUCTURAL MEDIA PATH — as opposed to plain copy.
 *
 * A collection record's file lives in its own table column (`capabilities.media_path`
 * and so on — see `shared.ts`'s `media()`, which is what the public site actually reads),
 * while `content_strings` carries only its ROW: the draft/version/conflict machinery, the
 * same as any other field. Publish is the one moment the two have to be kept in step —
 * moving the draft's value into `content_strings` is what every field gets; the column
 * also being written is the part specific to a media file. Case studies carry two of
 * these — the homepage tile's cover and the page's own — which is why this is a list per
 * collection rather than one column.
 */
interface MediaColumnTarget {
  readonly table: string;
  readonly pathColumn: string;
  readonly kindColumn: string;
}

const COLLECTION_MEDIA_COLUMNS: Record<
  string,
  ReadonlyArray<{ readonly fieldKey: string; readonly target: MediaColumnTarget }>
> = {
  capabilities: [
    {
      fieldKey: "media-src",
      target: { table: "capabilities", pathColumn: "media_path", kindColumn: "media_kind" },
    },
  ],
  "process-steps": [
    {
      fieldKey: "media-src",
      target: { table: "process_steps", pathColumn: "media_path", kindColumn: "media_kind" },
    },
  ],
  "engagement-tiers": [
    {
      fieldKey: "media-src",
      target: { table: "engagement_tiers", pathColumn: "media_path", kindColumn: "media_kind" },
    },
  ],
  "case-studies": [
    {
      fieldKey: "media-src",
      target: {
        table: "case_studies",
        pathColumn: "detail_media_path",
        kindColumn: "detail_media_kind",
      },
    },
    {
      fieldKey: "media-src-2",
      target: {
        table: "case_studies",
        pathColumn: "home_media_path",
        kindColumn: "home_media_kind",
      },
    },
  ],
};

/**
 * Runs after a collection record's `content_strings` row is published. A no-op for
 * anything that is not one of the mapped media fields above — copy, alt text, a
 * page-section field — all of which are already fully handled by the generic UPDATE.
 *
 * Table and column names come only from the closed map above, never from `draft` — the
 * same reasoning `STRUCTURAL_TABLE` below rests on for its own interpolated names.
 */
async function syncStructuralMedia(
  connection: PoolConnection,
  draft: ContentDraftDetailRow,
): Promise<void> {
  if (draft.owner_kind !== "collection_record") return;
  const separator = draft.owner_key.indexOf(":");
  if (separator === -1) return;
  const collectionId = draft.owner_key.slice(0, separator);
  const recordSlug = draft.owner_key.slice(separator + 1);

  const target = COLLECTION_MEDIA_COLUMNS[collectionId]?.find(
    (entry) => entry.fieldKey === draft.field_key,
  )?.target;
  if (!target) return;

  await connection.execute(
    `UPDATE \`${target.table}\` SET \`${target.pathColumn}\` = ?, \`${target.kindColumn}\` = ? WHERE slug = ?`,
    [draft.value, mediaKindFromPath(draft.value), recordSlug],
  );
}

/**
 * WHICH RUNS ACCEPT A NEW RECORD, AND WHAT ONE STARTS AS.
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

/** The runs of blocks the panel may offer an Add button on. */
export const CREATABLE_COLLECTIONS = Object.keys(STRUCTURAL_TABLE);

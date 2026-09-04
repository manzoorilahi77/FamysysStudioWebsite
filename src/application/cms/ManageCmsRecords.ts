import type { CmsRepository, NewCmsRecord } from "../../domain/cms/repositories/CmsRepository";

/**
 * ADDING AND REMOVING RECORDS, WHICH ONLY SOME COLLECTIONS ALLOW.
 *
 * Pages are fixed and there is no use case that could add one — the routes under src/app
 * decide which seven exist. Collections are open, but not all of them: the Lists screen is
 * a cross-cut view of strings that belong elsewhere, Testimonials has no content file at
 * all, and Case Studies needs two covers and a reference before a new piece renders as
 * anything. `supportsRecordChanges` and the repository's own list of creatable collections
 * decide, and a refusal comes back as a message rather than an exception, because the
 * panel shows it next to the button that was pressed.
 *
 * A DELETE IS NOT REVERSIBLE and there is no bin, so the interface asks for the record's
 * title back before it will do it. That check lives in the panel, where the person is; what
 * lives here is the refusal to delete something that is not there, which is the case a
 * double-submitted form produces.
 */

export type RecordChangeResult =
  | { readonly ok: true; readonly recordId: string }
  | { readonly ok: false; readonly message: string };

function failure(message: string): RecordChangeResult {
  return { ok: false, message };
}

export class CreateCmsRecord {
  constructor(private readonly repository: CmsRepository) {}

  async execute(collectionId: string, record: NewCmsRecord): Promise<RecordChangeResult> {
    if (!this.repository.supportsRecordChanges) {
      return failure(
        "Records cannot be added while the site reads its content from the TypeScript " +
          "files. Set CONTENT_SOURCE=database.",
      );
    }
    const title = record.title.trim();
    if (!title) {
      return failure("A new record needs a title.");
    }
    const summary = record.summary.trim();
    if (!summary) {
      return failure("A new record needs the one line that appears under its title.");
    }

    const collection = (await this.repository.getCollections()).find(
      (entry) => entry.id === collectionId,
    );
    if (!collection) {
      return failure("That collection does not exist.");
    }

    try {
      const recordId = await this.repository.createRecord(collectionId, {
        slug: record.slug.trim() || title,
        title,
        summary,
      });
      return { ok: true, recordId };
    } catch (error: unknown) {
      return failure(error instanceof Error ? error.message : "The record could not be added.");
    }
  }
}

export class DeleteCmsRecord {
  constructor(private readonly repository: CmsRepository) {}

  async execute(collectionId: string, recordId: string): Promise<RecordChangeResult> {
    if (!this.repository.supportsRecordChanges) {
      return failure(
        "Records cannot be removed while the site reads its content from the TypeScript " +
          "files. Set CONTENT_SOURCE=database.",
      );
    }

    const collection = (await this.repository.getCollections()).find(
      (entry) => entry.id === collectionId,
    );
    const record = collection?.records.find((entry) => entry.id === recordId);
    if (!record) {
      return failure("That record no longer exists. Reload the panel.");
    }

    try {
      await this.repository.deleteRecord(collectionId, recordId);
      return { ok: true, recordId };
    } catch (error: unknown) {
      return failure(error instanceof Error ? error.message : "The record could not be removed.");
    }
  }
}

export type InquiryStatus = "new" | "read" | "archived";

export class SetInquiryStatus {
  constructor(private readonly repository: CmsRepository) {}

  async execute(id: string, status: InquiryStatus): Promise<RecordChangeResult> {
    try {
      await this.repository.setInquiryStatus(id, status);
      return { ok: true, recordId: id };
    } catch (error: unknown) {
      return failure(error instanceof Error ? error.message : "The enquiry could not be updated.");
    }
  }
}

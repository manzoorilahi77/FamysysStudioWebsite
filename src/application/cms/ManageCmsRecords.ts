import { canChangeItems, recordTree } from "../../domain/cms/entities/CmsRecord";
import type { CmsItemGroup } from "../../domain/cms/entities/CmsRecord";
import type { CmsInquiryStatus } from "../../domain/cms/entities/CmsInquiry";
import type { CmsRepository, NewCmsRecord } from "../../domain/cms/repositories/CmsRepository";

/**
 * ADDING AND REMOVING THE CARDS INSIDE A SECTION.
 *
 * Pages are fixed and there is no use case that could add one — the routes under src/app
 * decide which seven exist. Sections are fixed for the same reason: they are the blocks
 * those routes render. What an editor CAN change the number of is the repeated cards inside
 * a section, and not all of those either: a ninth portfolio piece needs two covers, a
 * reference and its capability links before it renders as anything, none of which is a
 * string typed into a form.
 *
 * WHICH RUNS ARE OPEN IS ASKED OF THE MODEL, not declared here. A run that an editor may
 * add to is one the read model marked as such, and the model got that from the store. A
 * refusal comes back as a message rather than an exception, because the panel shows it next
 * to the button that was pressed.
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

const NO_STORE =
  "Blocks cannot be added or removed while the site reads its content from the TypeScript " +
  "files: a new record there means a new object literal in a module and a slug wired into " +
  "every file that looks it up. Set CONTENT_SOURCE=database.";

const CLOSED = "Blocks cannot be added to this part of the page.";

/** Every run of cards in the model, whether or not it is open. */
async function itemGroups(repository: CmsRepository): Promise<ReadonlyArray<CmsItemGroup>> {
  const pages = await repository.getPages();
  return pages.flatMap((page) =>
    page.sections.flatMap((section) =>
      recordTree(section).flatMap((record) => [...record.items]),
    ),
  );
}

export class CreateCmsRecord {
  constructor(private readonly repository: CmsRepository) {}

  async execute(collectionId: string, record: NewCmsRecord): Promise<RecordChangeResult> {
    if (!this.repository.supportsRecordChanges) {
      return failure(NO_STORE);
    }
    const title = record.title.trim();
    if (!title) {
      return failure("A new block needs a title.");
    }
    const summary = record.summary.trim();
    if (!summary) {
      return failure("A new block needs the one line that appears under its title.");
    }

    const open = (await itemGroups(this.repository)).some(
      (group) => group.collectionId === collectionId && canChangeItems(group),
    );
    if (!open) {
      return failure(CLOSED);
    }

    try {
      const recordId = await this.repository.createRecord(collectionId, {
        slug: record.slug.trim() || title,
        title,
        summary,
      });
      return { ok: true, recordId };
    } catch (error: unknown) {
      return failure(error instanceof Error ? error.message : "The block could not be added.");
    }
  }
}

export class DeleteCmsRecord {
  constructor(private readonly repository: CmsRepository) {}

  async execute(collectionId: string, recordId: string): Promise<RecordChangeResult> {
    if (!this.repository.supportsRecordChanges) {
      return failure(NO_STORE);
    }

    const groups = (await itemGroups(this.repository)).filter(
      (group) => group.collectionId === collectionId && canChangeItems(group),
    );
    const exists = groups.some((group) =>
      group.records.some((entry) => entry.id === recordId),
    );
    if (!exists) {
      return failure("That block is no longer there. Reload the panel.");
    }

    try {
      await this.repository.deleteRecord(collectionId, recordId);
      return { ok: true, recordId };
    } catch (error: unknown) {
      return failure(error instanceof Error ? error.message : "The block could not be removed.");
    }
  }
}

export type InquiryStatus = CmsInquiryStatus;

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

import type { CmsRecord, CmsValue } from "../../domain/cms/entities/CmsRecord";
import { recordValues } from "../../domain/cms/entities/CmsRecord";
import { samePointer } from "../../domain/cms/entities/ContentPointer";
import type { ContentEdit, CmsRepository } from "../../domain/cms/repositories/CmsRepository";
import { validateContentValue } from "./ValidateContentValue";

/**
 * SAVE IS PER RECORD, AND NOTHING IS WRITTEN UNTIL EVERY FIELD PASSES.
 *
 * The alternative — writing each field as it validates — would leave a record half saved
 * whenever the last field is the bad one, which is exactly when an editor is least able
 * to tell what did and did not land.
 *
 * The target is addressed by id, and the values by id within it. Nothing about the file,
 * the path or the pointer comes from the caller: the record is re-read from the
 * repository and the pointer taken from it. A request naming a value that is read-only,
 * or that does not exist, is refused rather than interpreted.
 */

export type CmsSaveTarget =
  | { readonly kind: "section"; readonly pageId: string; readonly sectionId: string }
  | { readonly kind: "record"; readonly collectionId: string; readonly recordId: string };

export interface CmsValueEdit {
  readonly valueId: string;
  readonly value: string;
  /**
   * The revision the EDITOR'S SCREEN was showing.
   *
   * It has to come from the browser rather than from the record this use case re-reads,
   * and that is the whole point: the re-read is by definition current, so comparing it
   * against itself would always agree and the check would be theatre. What matters is
   * whether the string moved between the screen being drawn and Save being pressed, which
   * only the screen knows.
   *
   * It is not a security value — a caller can send any number — but a caller who sends the
   * wrong one only harms their own save. Absent for a store with no revisions.
   */
  readonly version?: number;
}

export type CmsSaveResult =
  | { readonly ok: true; readonly written: number }
  | { readonly ok: false; readonly valueId: string | null; readonly message: string };

function failure(valueId: string | null, message: string): CmsSaveResult {
  return { ok: false, valueId, message };
}

export class SaveCmsRecord {
  constructor(private readonly repository: CmsRepository) {}

  async execute(target: CmsSaveTarget, edits: ReadonlyArray<CmsValueEdit>): Promise<CmsSaveResult> {
    const record = await this.findRecord(target);
    if (!record) {
      return failure(null, "That record no longer exists. Reload the panel.");
    }

    const byId = new Map(recordValues(record).map((value) => [value.id, value]));
    const prepared: ContentEdit[] = [];

    for (const edit of edits) {
      const value = byId.get(edit.valueId);
      if (!value) {
        return failure(
          edit.valueId,
          "This field is no longer part of the record. Reload the panel.",
        );
      }
      // An unchanged field is not an edit. The interface only sends dirty ones, but a
      // stale tab can send a value that has since been written by another save.
      if (edit.value === value.value) {
        continue;
      }
      if (!value.pointer) {
        return failure(
          edit.valueId,
          value.readOnlyReason ?? "This field cannot be edited in this phase.",
        );
      }

      const problem = validateContentValue(value, edit.value, mediaPathFor(record, value));
      if (problem) {
        return failure(edit.valueId, problem);
      }

      const conflict = prepared.find(
        (existing) => value.pointer && samePointer(existing.pointer, value.pointer),
      );
      if (conflict && conflict.value !== edit.value) {
        return failure(
          edit.valueId,
          "Two fields on this record are the same string, and they were given different values. Set them to the same thing, or change one at a time.",
        );
      }
      if (!conflict) {
        prepared.push({
          pointer: value.pointer,
          // Both addresses, so either store can write it. Derived from the target the
          // caller named and the id the read model gave the value — never sent as such.
          owner: {
            kind: target.kind === "section" ? "page_section" : "collection_record",
            key:
              target.kind === "section"
                ? `${target.pageId}:${target.sectionId}`
                : `${target.collectionId}:${target.recordId}`,
            field: value.id,
          },
          value: edit.value,
          // The editor's revision when it sent one, the current one otherwise — a caller
          // that cannot report a revision (a script, an older screen) still writes.
          ...expectedVersion(edit, value),
        });
      }
    }

    if (prepared.length === 0) {
      return { ok: true, written: 0 };
    }

    try {
      await this.repository.applyEdits(prepared);
    } catch (error: unknown) {
      return failure(null, error instanceof Error ? error.message : "The save failed.");
    }

    return { ok: true, written: prepared.length };
  }

  private async findRecord(target: CmsSaveTarget): Promise<CmsRecord | undefined> {
    if (target.kind === "section") {
      const pages = await this.repository.getPages();
      return pages
        .find((page) => page.id === target.pageId)
        ?.sections.find((section) => section.id === target.sectionId);
    }
    const collections = await this.repository.getCollections();
    return collections
      .find((collection) => collection.id === target.collectionId)
      ?.records.find((record) => record.id === target.recordId);
  }
}

function expectedVersion(edit: CmsValueEdit, value: CmsValue): { expectedVersion?: number } {
  const version = edit.version ?? value.version;
  return version === undefined ? {} : { expectedVersion: version };
}

/** Alt text is validated against the reference it belongs to, not against a stand-in. */
function mediaPathFor(record: CmsRecord, value: CmsValue): string | undefined {
  return record.media && record.media.alt.id === value.id ? record.media.path : undefined;
}

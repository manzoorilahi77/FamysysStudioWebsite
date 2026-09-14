import type { CmsPage } from "../../domain/cms/entities/CmsPage";
import { currentValue, recordTree, recordValues } from "../../domain/cms/entities/CmsRecord";
import type { CmsRecord, CmsValue } from "../../domain/cms/entities/CmsRecord";
import type { CmsActivityAction } from "../../domain/cms/entities/CmsActivityEntry";
import type { ContentAddress } from "../../domain/cms/entities/ContentAddress";
import {
  ContentConflictError,
  type CmsRepository,
  type ContentEdit,
} from "../../domain/cms/repositories/CmsRepository";
import { validateContentValue } from "./ValidateContentValue";
import type { MediaContext } from "./ValidateContentValue";

/**
 * SAVE, PUBLISH, DISCARD — three use cases over one section, and three because they are
 * three different things to an editor.
 *
 * SAVE writes a draft. The public site does not change, so nothing is revalidated and
 * nothing is regenerated. What it does do is validate: every value is run through the
 * domain value object the site itself is built on, and if ANY of them is rejected then
 * NONE is written. A save that stored six good fields and reported the seventh would leave
 * the editor unable to tell which had landed.
 *
 * PUBLISH moves the drafts onto the live content and reports which fields moved, so the
 * caller can regenerate exactly the routes that render them.
 *
 * DISCARD throws the drafts away.
 *
 * WHAT A REQUEST MAY CONTAIN, AND WHAT IT MAY NOT. Ids and strings. The section is re-read
 * from the repository here and every address is taken from the read model, so the worst a
 * malformed body can do is name a field that does not exist and be told so. No file path,
 * no property path, no pointer and no table name is ever taken from a request.
 */

/** Which section is being edited. Both halves are ids the panel's own URL carries. */
export interface CmsSectionTarget {
  readonly pageId: string;
  readonly sectionId: string;
}

export type { CmsActivityAction };

/**
 * One field, addressed the way the screen addresses it: which record it is on, and which
 * value within that record. `recordId` is the section's own id for a section field, or the
 * card's id for a field on a card — the cards inside a section have ids of their own, so a
 * capability's "Descriptor" and the section's "Descriptor" cannot be confused.
 */
export interface CmsValueEdit {
  readonly recordId?: string;
  readonly valueId: string;
  readonly value: string;
  readonly version?: number;
}

/**
 * `conflict` is what the route turns into a 409 rather than a 422. It is a different thing
 * to the editor and deserves a different status: 422 means "what you typed is wrong", 409
 * means "the content moved underneath you", and only the second is worth a reload.
 */
export type SaveResult =
  | { readonly ok: true; readonly saved: number; readonly message: string }
  | {
      readonly ok: false;
      readonly valueId: string | null;
      readonly message: string;
      readonly conflict?: boolean;
    };

export type PublishResult =
  | {
      readonly ok: true;
      readonly published: number;
      readonly routes: ReadonlyArray<string>;
      readonly message: string;
    }
  | { readonly ok: false; readonly message: string; readonly conflict?: boolean };

export type DiscardResult =
  | { readonly ok: true; readonly message: string }
  | { readonly ok: false; readonly message: string };

const NOT_FOUND = "That section is no longer in the site. Reload the panel.";

interface Located {
  readonly page: CmsPage;
  readonly section: CmsRecord;
  /** The section and every card under it, by id. */
  readonly records: ReadonlyMap<string, CmsRecord>;
}

async function locate(
  repository: CmsRepository,
  target: CmsSectionTarget,
): Promise<Located | null> {
  const pages = await repository.getPages();
  const page = pages.find((candidate) => candidate.id === target.pageId);
  const section = page?.sections.find((candidate) => candidate.id === target.sectionId);
  if (!page || !section) return null;

  return {
    page,
    section,
    records: new Map(recordTree(section).map((record) => [record.id, record])),
  };
}

/** Every owner a write to this section can touch: the section, and each card on it. */
export function ownersOfSection(section: CmsRecord): ReadonlyArray<ContentAddress> {
  return recordTree(section).flatMap((record) => (record.address ? [record.address] : []));
}

/**
 * WHAT ELSE IS ON THE MEDIA BLOCK THIS VALUE BELONGS TO, AS THIS SAVE WILL LEAVE IT.
 *
 * A media block is three fields — a file, a still and a description — and two of them can
 * only be judged together: a video is invalid without a poster, and a poster cannot be
 * cleared while the file is a video. So the sibling is read from THIS SAVE where the save
 * touches it, and from what is stored otherwise.
 *
 * Reading only what is stored would reject the one save that could ever be legal: the one
 * that swaps in a video and its still at the same time, which is the only way the panel
 * offers to do it.
 */
function mediaContextFor(
  record: CmsRecord,
  value: CmsValue,
  pending: ReadonlyMap<string, string>,
): MediaContext {
  const media = record.groups
    .flatMap((group) => group.media)
    .find(
      (entry) =>
        entry.alt.id === value.id ||
        entry.src?.id === value.id ||
        entry.posterValue?.id === value.id,
    );
  if (!media) return {};

  const settled = (field: CmsValue): string => pending.get(field.id) ?? currentValue(field);

  return {
    path: media.path,
    ...(media.src ? { src: settled(media.src) } : {}),
    ...(media.posterValue ? { poster: settled(media.posterValue) } : {}),
  };
}

export class SaveCmsSection {
  constructor(private readonly repository: CmsRepository) {}

  async execute(target: CmsSectionTarget, edits: ReadonlyArray<CmsValueEdit>): Promise<SaveResult> {
    const found = await locate(this.repository, target);
    if (!found) {
      return { ok: false, valueId: null, message: NOT_FOUND };
    }
    if (edits.length === 0) {
      return { ok: true, saved: 0, message: "Nothing had changed, so nothing was saved." };
    }

    const prepared: ContentEdit[] = [];
    // Every value this save is about to set, so a field can be judged against its siblings
    // as they will be rather than as they are. Keyed by value id, which is unique per record.
    const pending = new Map(edits.map((edit) => [edit.valueId, edit.value]));

    for (const edit of edits) {
      const record = found.records.get(edit.recordId ?? found.section.id);
      const value = record ? recordValues(record).find((entry) => entry.id === edit.valueId) : null;

      if (!record || !value) {
        return {
          ok: false,
          valueId: edit.valueId,
          message: "That field is no longer on this section. Reload the panel.",
        };
      }
      if (!record.address) {
        return {
          ok: false,
          valueId: edit.valueId,
          message: "This block has nothing the panel can write to.",
        };
      }
      if (!value.pointer && value.readOnlyReason) {
        return { ok: false, valueId: edit.valueId, message: value.readOnlyReason };
      }

      // The same rule the content file itself runs at build time — see
      // ValidateContentValue for why that matters more than it sounds.
      const rejection = validateContentValue(
        value,
        edit.value,
        mediaContextFor(record, value, pending),
      );
      if (rejection) {
        return { ok: false, valueId: edit.valueId, message: rejection };
      }

      // Unchanged from what is already saved: skip it rather than write a draft that
      // says nothing, which would mark the section drafted for no reason.
      if (edit.value === currentValue(value)) {
        continue;
      }

      prepared.push({
        address: { ...record.address, field: value.id },
        ...(value.pointer ? { pointer: value.pointer } : {}),
        value: edit.value,
        baseValue: value.value,
        ...(edit.version === undefined ? {} : { expectedVersion: edit.version }),
      });
    }

    if (prepared.length === 0) {
      return { ok: true, saved: 0, message: "Nothing had changed, so nothing was saved." };
    }

    try {
      await this.repository.saveDrafts(prepared);
    } catch (error: unknown) {
      return {
        ok: false,
        valueId: null,
        message: failureMessage(error, "saved"),
        conflict: error instanceof ContentConflictError,
      };
    }

    return {
      ok: true,
      saved: prepared.length,
      message: `Saved as a draft. ${countOf(prepared.length, "change")} not on the site yet — press Publish when you are ready.`,
    };
  }
}

export class PublishCmsSection {
  constructor(
    private readonly repository: CmsRepository,
    /** Injected: which routes render an owner is a question about the site's own shape. */
    private readonly routesFor: (
      pages: ReadonlyArray<CmsPage>,
      owners: ReadonlyArray<ContentAddress>,
    ) => ReadonlyArray<string>,
  ) {}

  async execute(target: CmsSectionTarget): Promise<PublishResult> {
    const found = await locate(this.repository, target);
    if (!found) {
      return { ok: false, message: NOT_FOUND };
    }

    let written;
    try {
      written = await this.repository.publishDrafts(ownersOfSection(found.section));
    } catch (error: unknown) {
      return {
        ok: false,
        message: failureMessage(error, "published"),
        conflict: error instanceof ContentConflictError,
      };
    }

    if (written.length === 0) {
      return {
        ok: true,
        published: 0,
        routes: [],
        message: "There was nothing unpublished on this section.",
      };
    }

    // The route set is worked out from what was ACTUALLY written rather than from what
    // might have been, and from the model AFTER the write, so a card that moved page is
    // not regenerated at its old address.
    const routes = this.routesFor(await this.repository.getPages(), written);

    return {
      ok: true,
      published: written.length,
      routes,
      message: `Published. ${countOf(written.length, "change")} now live on ${routes.length === 1 ? "1 page" : `${routes.length} pages`}.`,
    };
  }
}

export class DiscardCmsDrafts {
  constructor(private readonly repository: CmsRepository) {}

  async execute(target: CmsSectionTarget): Promise<DiscardResult> {
    const found = await locate(this.repository, target);
    if (!found) {
      return { ok: false, message: NOT_FOUND };
    }

    try {
      await this.repository.discardDrafts(ownersOfSection(found.section));
    } catch (error: unknown) {
      return { ok: false, message: failureMessage(error, "discarded") };
    }
    return { ok: true, message: "The unpublished edits on this section were thrown away." };
  }
}

function countOf(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? " is" : "s are"}`;
}

/**
 * A conflict keeps its own message, because it was written for the person who hit it and
 * says what to do. Anything else is an I/O failure, and its message is a driver's — which
 * may carry the connection config — so it is logged rather than shown.
 */
function failureMessage(error: unknown, verb: string): string {
  if (error instanceof ContentConflictError) {
    return error.message;
  }
  console.error(`[admin] Content could not be ${verb}:`, (error as Error)?.name);
  return `The change could not be ${verb}. Nothing was written — try again, and check the server logs if it keeps failing.`;
}

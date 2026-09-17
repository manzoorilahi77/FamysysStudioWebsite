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

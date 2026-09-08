import { existsSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { dirname, join } from "node:path";
import type { ContentFieldAddress } from "../../domain/cms/entities/ContentAddress";
import { addressKey, fieldKey } from "../../domain/cms/entities/ContentAddress";
import type { ContentPointer } from "../../domain/cms/entities/ContentPointer";

/**
 * UNPUBLISHED EDITS, WHEN THE CONTENT IS TYPESCRIPT FILES.
 *
 * Save must not change the public site. With the database that is easy — a draft is a row
 * in another table. With the content modules there is only one copy of a string, in a file
 * the site is built from, so writing it IS publishing it.
 *
 * The alternative to a sidecar was to make save and publish the same button under this
 * store and explain the difference away in a sentence on the screen. That is the kind of
 * "it works differently here" that costs someone an afternoon the first time they try to
 * draft a change to the homepage on a Friday. So the drafts live in one JSON file beside
 * the project, publish is what splices them into the modules, and the three steps mean the
 * same thing whichever store the panel is running against.
 *
 * IT IS A DEVELOPMENT-MACHINE FILE and it is gitignored. It holds the pointer each edit is
 * destined for and the value that was published when the edit was made — the second is what
 * makes a lost race detectable in a store with no revision numbers: if the file no longer
 * says what the editor was looking at, someone else changed it and the publish is refused
 * rather than silently reverting them.
 */

const DRAFT_FILE = ".cms-drafts.json";

export interface FileDraft {
  readonly value: string;
  /** What the content file said when this draft was made. */
  readonly baseValue: string;
  /** Where it goes on publish. Absent means it cannot be published — see `publishable`. */
  readonly pointer?: ContentPointer;
  readonly savedAt: string;
}

type DraftFile = Record<string, FileDraft>;

function path(): string {
  return join(process.cwd(), DRAFT_FILE);
}

/**
 * A corrupt or unreadable file reads as "no drafts" rather than throwing. The panel is then
 * simply showing the published content, which is true; throwing here would take out every
 * screen in the panel over a file that only holds work in progress.
 */
export function readDrafts(): DraftFile {
  const file = path();
  if (!existsSync(file)) return {};
  try {
    const parsed: unknown = JSON.parse(readFileSync(file, "utf8"));
    return parsed && typeof parsed === "object" ? (parsed as DraftFile) : {};
  } catch {
    console.warn(`[cms] ${DRAFT_FILE} could not be read. Treating it as empty.`);
    return {};
  }
}

function writeDrafts(drafts: DraftFile): void {
  const file = path();
  if (Object.keys(drafts).length === 0) {
    try {
      unlinkSync(file);
    } catch {
      // Already gone. Nothing to remove.
    }
    return;
  }
  const temporary = join(dirname(file), `.${DRAFT_FILE}.${randomBytes(6).toString("hex")}.tmp`);
  try {
    writeFileSync(temporary, `${JSON.stringify(drafts, null, 2)}\n`, "utf8");
    renameSync(temporary, file);
  } catch (error) {
    try {
      unlinkSync(temporary);
    } catch {
      // The temp file is already gone, or was never created.
    }
    throw error;
  }
}

/** The saved edits, addressed the way the read model addresses a field. */
export function draftIndex(): ReadonlyMap<string, string> {
  return new Map(Object.entries(readDrafts()).map(([key, draft]) => [key, draft.value]));
}

export function putDrafts(
  entries: ReadonlyArray<{
    readonly address: ContentFieldAddress;
    readonly value: string;
    readonly baseValue: string;
    readonly pointer?: ContentPointer;
  }>,
): void {
  const drafts = { ...readDrafts() };
  const savedAt = new Date().toISOString();
  for (const entry of entries) {
    drafts[fieldKey(entry.address)] = {
      value: entry.value,
      baseValue: entry.baseValue,
      ...(entry.pointer ? { pointer: entry.pointer } : {}),
      savedAt,
    };
  }
  writeDrafts(drafts);
}

/** Every draft held for these records, with the field address each one belongs to. */
export function draftsFor(
  owners: ReadonlyArray<{ readonly kind: string; readonly key: string }>,
): ReadonlyArray<{ readonly address: ContentFieldAddress; readonly draft: FileDraft }> {
  const prefixes = owners.map((owner) => `${addressKey(owner as ContentFieldAddress)}:`);
  return Object.entries(readDrafts()).flatMap(([key, draft]) => {
    const prefix = prefixes.find((candidate) => key.startsWith(candidate));
    if (!prefix) return [];
    const [kind, ownerKey, field] = [
      key.slice(0, key.indexOf(":")),
      prefix.slice(prefix.indexOf(":") + 1, -1),
      key.slice(prefix.length),
    ];
    return [
      {
        address: {
          kind: kind as ContentFieldAddress["kind"],
          key: ownerKey,
          field,
        },
        draft,
      },
    ];
  });
}

export function removeDrafts(addresses: ReadonlyArray<ContentFieldAddress>): void {
  const drafts = { ...readDrafts() };
  for (const address of addresses) {
    delete drafts[fieldKey(address)];
  }
  writeDrafts(drafts);
}

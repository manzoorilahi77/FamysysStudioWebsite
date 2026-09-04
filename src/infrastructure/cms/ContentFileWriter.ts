import { randomBytes } from "node:crypto";
import { readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import prettier from "prettier";
import type { ContentEdit } from "../../domain/cms/repositories/CmsRepository";
import { describePointer } from "../../domain/cms/entities/ContentPointer";
import { CONTENT_FILE } from "./contentSources";
import { locateLiteral, parseContent, toStringLiteral } from "./contentAst";

/**
 * The only thing in the project that writes content, and the whole of what "editable"
 * currently means.
 *
 * FOUR GUARANTEES, in the order they are enforced:
 *
 *  1. NOWHERE ELSE. A pointer names a file, never a path. It is resolved against
 *     `src/infrastructure/content/static/`, the result's directory is checked to be
 *     exactly that directory, and the basename has to be one of the nine known content
 *     files. Traversal is not filtered out, it is unrepresentable.
 *  2. NOTHING LOST. The edit is a splice of one string literal's span (see contentAst.ts)
 *     and then a Prettier pass, so comments, `TODO(client)` markers, blank lines and
 *     every untouched byte survive.
 *  3. NOTHING HALF-WRITTEN. Every edit for a file is applied to an in-memory copy, the
 *     result is re-parsed and each pointer re-read to confirm it now holds the new value,
 *     and only then is anything written — to a temp file in the same directory, renamed
 *     over the original. An interrupted write leaves the original intact.
 *  4. NOTHING SILENT. A pointer that no longer resolves, or resolves to something that is
 *     not a literal, throws with the pointer in the message rather than writing near it.
 *
 * Edits spanning two files are validated together and written one file at a time. That is
 * not atomic across files, and the honest description of the residual risk is: if the
 * process dies between two renames, one file is updated and the other is not. Both are
 * still valid TypeScript and the site still builds; the second edit is simply not there.
 */

const CONTENT_ROOT = "src/infrastructure/content/static";

/** The nine content modules, by name. Nothing else is writable. */
const WRITABLE_FILES: ReadonlySet<string> = new Set(Object.values(CONTENT_FILE));

export class ContentWriteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentWriteError";
  }
}

function contentRoot(): string {
  return resolve(process.cwd(), CONTENT_ROOT);
}

/** Guarantee 1. */
function resolveContentFile(file: string): string {
  const root = contentRoot();
  const target = resolve(root, file);

  if (dirname(target) !== root) {
    throw new ContentWriteError(`"${file}" is outside ${CONTENT_ROOT}.`);
  }
  if (!WRITABLE_FILES.has(basename(target))) {
    throw new ContentWriteError(`"${file}" is not a content module.`);
  }
  return target;
}

function groupByFile(
  edits: ReadonlyArray<ContentEdit>,
): ReadonlyMap<string, ReadonlyArray<ContentEdit>> {
  return edits.reduce((byFile, edit) => {
    const existing = byFile.get(edit.pointer.file) ?? [];
    byFile.set(edit.pointer.file, [...existing, edit]);
    return byFile;
  }, new Map<string, ReadonlyArray<ContentEdit>>());
}

/**
 * Each edit is applied to the text, then the text is re-parsed before the next one. Spans
 * move when a string changes length, and re-parsing is a few milliseconds on a 400-line
 * file — cheap enough that keeping a stale offset table was never worth the class of bug
 * it invites.
 */
function applyToText(
  fileName: string,
  original: string,
  edits: ReadonlyArray<ContentEdit>,
): string {
  return edits.reduce((text, edit) => {
    const located = locateLiteral(parseContent(fileName, text), edit.pointer);
    return text.slice(0, located.start) + toStringLiteral(edit.value) + text.slice(located.end);
  }, original);
}

/** Guarantee 3's read-back: the file, as it is about to be written, says what we meant. */
function verify(fileName: string, text: string, edits: ReadonlyArray<ContentEdit>): void {
  const source = parseContent(fileName, text);
  for (const edit of edits) {
    const located = locateLiteral(source, edit.pointer);
    if (located.text !== edit.value) {
      throw new ContentWriteError(
        `${describePointer(edit.pointer)} did not read back as written. Nothing was saved.`,
      );
    }
  }
}

function writeAtomically(target: string, text: string): void {
  const temporary = join(
    dirname(target),
    `.${basename(target)}.${randomBytes(6).toString("hex")}.tmp`,
  );
  try {
    writeFileSync(temporary, text, "utf8");
    renameSync(temporary, target);
  } catch (error) {
    try {
      unlinkSync(temporary);
    } catch {
      // The temp file is already gone, or was never created. Nothing to clean up.
    }
    throw error;
  }
}

export class ContentFileWriter {
  async apply(edits: ReadonlyArray<ContentEdit>): Promise<void> {
    if (edits.length === 0) {
      return;
    }

    // Everything is prepared before anything is written, so a bad pointer in the second
    // file cannot leave the first one half-edited.
    const prepared = await Promise.all(
      Array.from(groupByFile(edits), async ([file, fileEdits]) => {
        const target = resolveContentFile(file);
        const original = readFileSync(target, "utf8");
        const spliced = applyToText(file, original, fileEdits);
        const formatted = await reformat(target, original, spliced);
        verify(file, formatted, fileEdits);
        return { target, formatted };
      }),
    );

    for (const { target, formatted } of prepared) {
      writeAtomically(target, formatted);
    }
  }
}

/**
 * PRETTIER RUNS ONLY ON A FILE PRETTIER ALREADY AGREES WITH.
 *
 * Formatting is what absorbs the difference between a short replacement and a long one: a
 * string that no longer fits on its line gets wrapped the way the rest of the file is,
 * rather than left over the print width. But running it unconditionally would let a save
 * reformat a file that was never formatted — services.content.ts is exactly that, six
 * over-long lines the repo has always had — and a one-word edit would arrive as a
 * thirty-line diff. So the ORIGINAL is checked first, and a file Prettier would already
 * rewrite is left alone apart from the splice.
 *
 * `endOfLine: "auto"` on both calls is what stops a save rewriting every line ending in
 * the file: the working tree is CRLF here, and Prettier's default would quietly convert
 * the lot to LF and call it an edit to one heading.
 */
async function reformat(target: string, original: string, spliced: string): Promise<string> {
  const config = {
    ...(await prettier.resolveConfig(target)),
    filepath: target,
    endOfLine: "auto" as const,
  };

  return (await prettier.check(original, config)) ? prettier.format(spliced, config) : spliced;
}

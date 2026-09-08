import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";
import { projectRoot } from "./env";

/**
 * THE SUITE WRITES TO THE REPOSITORY, SO THE SUITE PUTS IT BACK.
 *
 * With `CONTENT_SOURCE=static` a publish is a rewrite of a TypeScript module in
 * `src/infrastructure/content/static/`, and a save is a line in `.cms-drafts.json`. Both
 * are real files in the working tree. A run that ended without restoring them would leave
 * the next `git status` full of edits nobody made on purpose, and — worse — would leave the
 * following run starting from content the previous one had changed, which is how a suite
 * starts passing for the wrong reason.
 *
 * The snapshot is taken once, before anything runs, and restored after the run and after
 * every spec that publishes. Restoring by copy rather than by `git checkout` because the
 * branch may legitimately have uncommitted work in it that is not this suite's to discard.
 */

const CONTENT_DIRECTORY = path.join("src", "infrastructure", "content", "static");
const DRAFTS_FILE = ".cms-drafts.json";

function snapshotDirectory(): string {
  return path.join(projectRoot, ".playwright", "content-snapshot");
}

function contentFiles(): ReadonlyArray<string> {
  return readdirSync(path.join(projectRoot, CONTENT_DIRECTORY)).filter((name) =>
    name.endsWith(".ts"),
  );
}

export function takeContentSnapshot(): void {
  const target = snapshotDirectory();
  rmSync(target, { recursive: true, force: true });
  mkdirSync(target, { recursive: true });
  for (const name of contentFiles()) {
    copyFileSync(path.join(projectRoot, CONTENT_DIRECTORY, name), path.join(target, name));
  }
}

/** Puts every content module back as it was, and throws away any saved drafts. */
export function restoreContentSnapshot(): void {
  const source = snapshotDirectory();
  if (!existsSync(source)) {
    throw new Error("No content snapshot to restore from. Did global setup run?");
  }
  for (const name of readdirSync(source)) {
    const original = path.join(source, name);
    const current = path.join(projectRoot, CONTENT_DIRECTORY, name);
    // Only the files that actually moved. Rewriting an identical file still bumps its
    // mtime, and the dev server would recompile every content module after every test —
    // slow, and a Fast Refresh landing in the middle of the next one.
    if (readFileSync(original, "utf8") === readFileSync(current, "utf8")) continue;
    copyFileSync(original, current);
  }
  clearDrafts();
}

export function clearDrafts(): void {
  rmSync(path.join(projectRoot, DRAFTS_FILE), { force: true });
}

/** True when a content module currently holds this exact string. */
export function contentFileContains(file: string, text: string): boolean {
  const full = path.join(projectRoot, CONTENT_DIRECTORY, file);
  return existsSync(full) && readFileSync(full, "utf8").includes(text);
}

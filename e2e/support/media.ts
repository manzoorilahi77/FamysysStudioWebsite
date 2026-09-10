import { readdirSync, rmSync } from "node:fs";
import path from "node:path";
import { projectRoot } from "./env";

/**
 * THE SUITE UPLOADS REAL FILES, SO THE SUITE REMOVES THEM.
 *
 * An upload writes into `public/media`, which is a tracked directory in this repository. A
 * run that did not clean up would leave a `git status` full of files nobody chose to add,
 * and the next run would start from a media folder the previous one had grown.
 *
 * Cleaning by DIFFERENCE rather than by name: the store names a file after a hash of its
 * contents, so a test cannot know the name in advance without reimplementing the hash — and
 * a second implementation of it is one more thing that can quietly disagree with the first.
 * Listing before and after says exactly what this run added, whatever it was called.
 */

const MEDIA_DIRECTORY = path.join("public", "media");

function listMedia(): ReadonlyArray<string> {
  return readdirSync(path.join(projectRoot, MEDIA_DIRECTORY));
}

export function mediaSnapshot(): ReadonlySet<string> {
  return new Set(listMedia());
}

/** Removes every file that appeared since the snapshot. Never touches what was there. */
export function removeUploadsSince(before: ReadonlySet<string>): ReadonlyArray<string> {
  const added = listMedia().filter((name) => !before.has(name));
  for (const name of added) {
    rmSync(path.join(projectRoot, MEDIA_DIRECTORY, name), { force: true });
  }
  return added;
}

/**
 * A one-pixel PNG, as bytes rather than as a file in the repository.
 *
 * It has to be a REAL PNG: the upload endpoint reads the format out of the first bytes and
 * refuses anything it does not recognise, so a placeholder of random bytes named `.png`
 * would be rejected — which is the endpoint working, and would look like the test failing.
 */
export const ONE_PIXEL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

/** Bytes that are not any media format, for the "decided by the bytes" case. */
export const NOT_MEDIA = Buffer.from("<!doctype html><title>not an image</title>", "utf8");

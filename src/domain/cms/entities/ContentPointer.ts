/**
 * WHERE A STRING PHYSICALLY LIVES.
 *
 * The CMS reads content through the site's repositories, so what it hands the editor is
 * an assembled entity — a capability's title comes from `services.content.ts` while its
 * expanded copy comes from `creative-services.content.ts`, and neither is at the path the
 * entity suggests. A pointer is the missing half: the file, the top-level binding inside
 * it, and the route from that binding down to one string literal.
 *
 * `path` segments address, in order:
 *   - a string  — a property of an object literal (quoted keys included, so
 *                 `DRAFT_DETAILS["Creative Design"]` is the segment `Creative Design`)
 *   - a number  — an element of an array literal, OR an argument of a call expression,
 *                 which is how `createCta("Talk to us", "/contact")` is addressed as
 *                 argument 0 and argument 1.
 *
 * A value with NO pointer is read-only, and the record says why — it is computed at build
 * time (a slug, a derived count) or spread in from somewhere the CMS already edits.
 *
 * Pointers are only ever constructed server-side, from the read model. Nothing a browser
 * sends is turned into one, which is what makes "no path outside the content directory"
 * true by construction rather than by validation.
 */
export interface ContentPointer {
  /** File name only, resolved against `src/infrastructure/content/static/`. */
  readonly file: string;
  /** The top-level `const` the path starts from. Need not be exported. */
  readonly symbol: string;
  readonly path: ReadonlyArray<string | number>;
}

/** Same file, same binding, same route — used to detect two edits to one string. */
export function samePointer(left: ContentPointer, right: ContentPointer): boolean {
  return (
    left.file === right.file &&
    left.symbol === right.symbol &&
    left.path.length === right.path.length &&
    left.path.every((segment, index) => segment === right.path[index])
  );
}

/** A human-readable form, for error messages and the UI's provenance line. */
export function describePointer(pointer: ContentPointer): string {
  const path = pointer.path.map((segment) => `[${String(segment)}]`).join("");
  return `${pointer.file} › ${pointer.symbol}${path}`;
}

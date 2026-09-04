import { revalidatePath } from "next/cache";

/**
 * A SAVE HAS TO SHOW UP ON THE SITE, AND THE SITE IS NOT RENDERED PER REQUEST.
 *
 * The seven public pages are prerendered: their content is read from the database once,
 * during the build, and served as HTML afterwards. That is what keeps them fast and what
 * keeps a visitor from ever waiting on a query. It also means an edit made in the panel
 * would sit in the database, correct and invisible, until the next deploy — which is a CMS
 * that does not work.
 *
 * So a write tells Next the pages are stale. The next request for one regenerates it from
 * the database and every request after that is served the new HTML. Content is still read
 * at build time rather than per request; there is simply more than one build.
 *
 * The whole tree is invalidated rather than the page that was edited, because most strings
 * appear on more than one page and several appear on all seven — the closing call to
 * action, the footer, the navigation panel's names. Working out the blast radius of an
 * edit is exactly the sort of derivation that goes subtly wrong, and regenerating seven
 * static pages costs a few hundred milliseconds.
 */
export function contentChanged(): void {
  revalidatePath("/", "layout");
}

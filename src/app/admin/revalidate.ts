import { revalidatePath } from "next/cache";
import { ALL_ROUTES } from "../../infrastructure/cms/routes";

/**
 * A PUBLISH HAS TO SHOW UP ON THE SITE, AND THE SITE IS NOT RENDERED PER REQUEST.
 *
 * The seven public pages are prerendered: their content is read from the database once, during
 * the build, and served as HTML afterwards. That is what keeps them fast and what keeps a
 * visitor from ever waiting on a query. It also means an edit published in the panel would sit
 * in the database, correct and invisible, until the next deploy — which is a CMS that does not
 * work.
 *
 * So a publish tells Next which pages are stale. The next request for one regenerates it from
 * the database and every request after that is served the new HTML. Content is still read at
 * build time rather than per request; there is simply more than one build.
 *
 * WHICH PAGES. Not "the one that was edited": most strings appear on more than one page and
 * several appear on all seven. `routesForOwners` in infrastructure/cms/routes.ts works out the
 * set from what was actually written, and a test checks that set against the read models of all
 * seven pages so it cannot quietly go short. What arrives here is that answer.
 */
export function publishedTo(routes: ReadonlyArray<string>): void {
  for (const route of routes) {
    revalidatePath(route);
  }
}

/**
 * The blunt instrument, for a change to the SHAPE of the site rather than to its words —
 * a block added or removed. Which pages a new capability appears on cannot be worked out from
 * the record that did not exist a moment ago, so all seven are regenerated.
 */
export function structureChanged(): void {
  revalidatePath("/", "layout");
  for (const route of ALL_ROUTES) {
    revalidatePath(route);
  }
}

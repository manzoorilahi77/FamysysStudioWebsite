import type { CmsPage } from "../../domain/cms/entities/CmsPage";
import { recordTree } from "../../domain/cms/entities/CmsRecord";
import type { ContentAddress } from "../../domain/cms/entities/ContentAddress";
import { addressKey } from "../../domain/cms/entities/ContentAddress";
import { ALL_ROUTES } from "./pages";

export { ALL_ROUTES };

/**
 * WHICH PAGES A PUBLISH MAKES STALE.
 *
 * Not "the one that was edited". A capability is a block on Creative Services AND a cell in
 * the homepage grid; the footer is on all seven. Publishing one of them and regenerating
 * only the page the editor happened to be looking at leaves the same words wrong everywhere
 * else, for as long as it takes somebody to notice.
 *
 * So the answer is derived from the read model rather than declared: every page is walked,
 * every section and every card inside it is indexed by its address, and an owner resolves to
 * the routes of the pages that were found to contain it. A capability nested under two
 * sections on two pages therefore returns two routes without anyone maintaining a list, and
 * a card moved to a third page starts returning three.
 *
 * SITE-WIDE OWNERS ARE THE ONE EXCEPTION, and they have to be, because the model cannot
 * see them. The footer is declared once — under Home, because its copy lives in the
 * homepage's content file — and rendered by every route. Indexing would return "/" and be
 * wrong on six pages. There is a test that walks the model and fails if an owner resolves
 * to nothing, so a new owner cannot quietly go missing; this list is the only thing that has
 * to be thought about by hand, and it is two entries long.
 */
const SITE_WIDE: ReadonlySet<string> = new Set(["page_section:home:footer"]);

/** Every address a page contains, sections and the cards nested inside them. */
function ownersOf(page: CmsPage): ReadonlySet<string> {
  const keys = new Set<string>();
  for (const section of page.sections) {
    for (const record of recordTree(section)) {
      if (record.address) keys.add(addressKey(record.address));
    }
  }
  return keys;
}

/**
 * The routes that render any of `owners`, in site order and without repeats. An owner the
 * model does not know returns nothing rather than everything: a publish that wrote a field
 * nobody renders should regenerate nothing, and silently rebuilding the whole site would
 * hide the fact that the address was wrong.
 */
export function routesForOwners(
  pages: ReadonlyArray<CmsPage>,
  owners: ReadonlyArray<ContentAddress>,
): ReadonlyArray<string> {
  const wanted = new Set(owners.map(addressKey));
  if (wanted.size === 0) return [];

  if ([...wanted].some((key) => SITE_WIDE.has(key))) {
    return ALL_ROUTES;
  }

  const routes = pages
    .filter((page) => {
      const owned = ownersOf(page);
      return [...wanted].some((key) => owned.has(key));
    })
    .map((page) => page.route);

  return ALL_ROUTES.filter((route) => routes.includes(route));
}

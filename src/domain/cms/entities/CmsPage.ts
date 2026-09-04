import type { CmsRecord } from "./CmsRecord";

/**
 * One of the seven routes the site ships. Pages are FIXED: the routes under `src/app`
 * decide which exist, so the CMS can neither add nor remove one. What is editable is the
 * sections inside a page, which is why `sections` is a list of records and the page
 * itself is not.
 */
export interface CmsPage {
  /** Matches the route segment under /admin/pages. */
  readonly id: string;
  readonly title: string;
  /** The public route this page renders at. */
  readonly route: string;
  readonly description: string;
  readonly source: string;
  readonly sections: ReadonlyArray<CmsRecord>;
  readonly updatedAt: Date | null;
}

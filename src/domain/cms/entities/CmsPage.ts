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
  /**
   * The blocks this page renders, in the order it renders them. See
   * `infrastructure/cms/composition.ts`: the order is read from the route file's own JSX
   * rather than declared, so a section added to the page shows up here without anyone
   * editing the CMS.
   */
  readonly sections: ReadonlyArray<CmsRecord>;
  /**
   * Whether that reading succeeded. It is a filesystem read of the project's own source,
   * which a deployed standalone build may not have beside it — in which case the order
   * falls back to the declared one and the panel says so rather than implying it derived
   * something it did not.
   */
  readonly sectionsAreDerived: boolean;
  readonly updatedAt: Date | null;
}

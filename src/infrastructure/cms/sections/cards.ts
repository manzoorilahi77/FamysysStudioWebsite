import type { CmsRecord } from "../../../domain/cms/entities/CmsRecord";

/**
 * The repeated cards, built once and handed to whichever sections render them.
 *
 * They are built once rather than per page on purpose: the six capabilities on the
 * homepage and the six on Creative Services are the SAME records with the same addresses,
 * so an edit made on either screen is one write to one row. Building them twice would make
 * two objects that only looked alike, and the first time one of them grew a field the two
 * screens would start disagreeing.
 */
export interface SectionCards {
  readonly capabilities: ReadonlyArray<CmsRecord>;
  readonly processSteps: ReadonlyArray<CmsRecord>;
  readonly engagementTiers: ReadonlyArray<CmsRecord>;
  readonly customPartnership: CmsRecord;
  readonly caseStudies: ReadonlyArray<CmsRecord>;
  readonly faq: ReadonlyArray<CmsRecord>;
}

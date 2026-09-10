import type { LegalDocument, LegalIndexCopy } from "../entities/LegalDocument";

export interface LegalRepository {
  getTerms(): Promise<LegalDocument>;
  getPrivacyPolicy(): Promise<LegalDocument>;
  /** The index page's own words; its list of documents is built from the two above. */
  getIndexCopy(): Promise<LegalIndexCopy>;
}

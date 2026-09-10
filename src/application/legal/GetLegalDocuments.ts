import type { LegalDocument, LegalIndex } from "../../domain/legal/entities/LegalDocument";
import type { LegalRepository } from "../../domain/legal/repositories/LegalRepository";

export class GetTerms {
  constructor(private readonly repository: LegalRepository) {}

  async execute(): Promise<LegalDocument> {
    return this.repository.getTerms();
  }
}

export class GetPrivacyPolicy {
  constructor(private readonly repository: LegalRepository) {}

  async execute(): Promise<LegalDocument> {
    return this.repository.getPrivacyPolicy();
  }
}

/**
 * The index at /legal: the page's own copy, and one entry per document IN THE PARENT'S
 * ORDER — Privacy Policy first, then Terms & Conditions, as famysys.com/legal/ lists them.
 * The entries are read off the documents themselves rather than kept as a second list, so
 * a retitled document or a moved effective date cannot leave the index saying otherwise.
 */
export class GetLegalIndex {
  constructor(private readonly repository: LegalRepository) {}

  async execute(): Promise<LegalIndex> {
    const [copy, privacy, terms] = await Promise.all([
      this.repository.getIndexCopy(),
      this.repository.getPrivacyPolicy(),
      this.repository.getTerms(),
    ]);

    return {
      copy,
      entries: [privacy, terms].map((document) => ({
        href: document.href,
        title: document.title,
        lead: document.lead,
        effectiveDate: document.effectiveDate,
        effectiveLabel: document.labels.effective,
      })),
    };
  }
}

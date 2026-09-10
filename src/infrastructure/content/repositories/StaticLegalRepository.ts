import type { LegalDocument, LegalIndexCopy } from "../../../domain/legal/entities/LegalDocument";
import type { LegalRepository } from "../../../domain/legal/repositories/LegalRepository";
import { legalIndexCopy } from "../static/legalShared";
import { privacyDocument } from "../static/privacy.content";
import { termsDocument } from "../static/terms.content";

/**
 * FILE-BACKED ONLY, ON PURPOSE. Every other page has a database twin so its copy can be
 * edited in the panel; these two do not, and the reason is what the documents are. A
 * clause in a privacy policy is a statement of fact about what the system does, and a
 * clause in the terms is a commitment — neither is copy an editor should be able to
 * reword without the legal review the documents are currently waiting for. They change
 * as code, with a diff and a reviewer, or not at all.
 */
export class StaticLegalRepository implements LegalRepository {
  async getTerms(): Promise<LegalDocument> {
    return termsDocument;
  }

  async getPrivacyPolicy(): Promise<LegalDocument> {
    return privacyDocument;
  }

  async getIndexCopy(): Promise<LegalIndexCopy> {
    return legalIndexCopy;
  }
}

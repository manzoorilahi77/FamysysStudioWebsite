import type { FaqPageStructure } from "../../../domain/faq/entities/FaqPage";
import type { FaqRepository } from "../../../domain/faq/repositories/FaqRepository";
import { faqPageStructure } from "../static/faq.content";

/**
 * FILE-BACKED ONLY. What this returns is the page's frame — its own three lines of copy,
 * the four group titles, and which question sits under which — and the frame is
 * structure rather than copy: moving a question between groups is a decision about the
 * page, made with the page in front of you. The questions and answers themselves are
 * still edited in the panel, under the four owners that always held them, and reach this
 * page through those owners' own repositories. See `GetFaqPage`.
 */
export class StaticFaqRepository implements FaqRepository {
  async getFaqPageStructure(): Promise<FaqPageStructure> {
    return faqPageStructure;
  }
}

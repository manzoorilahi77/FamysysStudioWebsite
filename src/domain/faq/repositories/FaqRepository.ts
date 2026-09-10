import type { FaqPageStructure } from "../entities/FaqPage";

/** The FAQ page's own copy and grouping. The questions come from the repositories that own them. */
export interface FaqRepository {
  getFaqPageStructure(): Promise<FaqPageStructure>;
}

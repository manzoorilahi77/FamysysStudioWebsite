import type { ClosingCtaBlock } from "../../marketing/entities/ClosingCtaBlock";
import type { FaqItem } from "../../marketing/entities/FaqBlock";

/**
 * THE FAQ PAGE, IN TWO SHAPES: what the content file declares, and what the page renders.
 *
 * The questions and answers are NOT declared here. They already live in four places — the
 * homepage's shared block and the three inner pages' own entries — and each of those is
 * editable in the panel under its own owner. Declaring them again would be a fifth copy
 * that drifts from the other four the first time an answer is edited.
 *
 * So the content file declares STRUCTURE: the page's own copy, and the groups, each naming
 * its questions by their text. `GetFaqPage` then gathers the live items from the four
 * repositories that own them and resolves each named question to its item. A group naming
 * a question that no longer exists, and an item that no group names, both throw — the
 * first is a grouping that has gone stale, the second is a question that would silently
 * fall off the page, and neither should be found by a reader.
 */

export interface FaqGroupDefinition {
  /** The anchor and the index key — "working-with-us". Stable; the title is not. */
  readonly id: string;
  readonly title: string;
  /** One line under the group heading saying what the group is about. */
  readonly description: string;
  /** The questions in this group, by their exact text, in the order they should read. */
  readonly questions: ReadonlyArray<string>;
}

export interface FaqPageStructure {
  readonly hero: {
    readonly eyebrow: string;
    readonly heading: string;
    readonly body: string;
  };
  /** The index's own heading — "On this page". */
  readonly indexLabel: string;
  readonly groups: ReadonlyArray<FaqGroupDefinition>;
  readonly closingCta: ClosingCtaBlock;
}

/** A group with its questions resolved to the items that answer them. */
export interface FaqGroup {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly items: ReadonlyArray<FaqItem>;
}

export interface FaqPage {
  readonly hero: FaqPageStructure["hero"];
  readonly indexLabel: string;
  readonly groups: ReadonlyArray<FaqGroup>;
  readonly closingCta: ClosingCtaBlock;
}

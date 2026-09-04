import type { CmsRecord } from "../../../domain/cms/entities/CmsRecord";
import type { ContentPointer } from "../../../domain/cms/entities/ContentPointer";
import type { ClosingCtaBlock } from "../../../domain/marketing/entities/ClosingCtaBlock";
import type { FaqBlock } from "../../../domain/marketing/entities/FaqBlock";
import { ctaFields, field, list, readOnlyList, toRecord } from "../records";

/**
 * Six of the seven pages end on a closing CTA and three carry an FAQ block. Both are
 * mapped once here so the section rows read the same wherever they appear — and both take
 * a pointer factory, because the copy is per-page even where the shape is not.
 */

/** Path segments relative to one block in one content file. */
export type At = (...path: ReadonlyArray<string | number>) => ContentPointer;

export function closingCtaSection(
  block: ClosingCtaBlock,
  updatedAt: Date | null,
  at: At,
): CmsRecord {
  return toRecord({
    id: "closing-cta",
    title: "Closing CTA",
    summary: block.heading,
    updatedAt,
    values: [
      field("Heading", block.heading, at("heading")),
      field("Body", block.body, at("body")),
      field("Closing line", block.closingLine, at("closingLine")),
      ...ctaFields("CTA", block.cta, at("cta")),
    ],
  });
}

/**
 * AN INNER PAGE'S FAQ IS TWO DIFFERENT THINGS IN ONE LIST.
 *
 * Some entries are the client's own, spread in from the homepage block so they cannot
 * drift — those are edited on the FAQ screen, and are read-only here. The rest were
 * written for this page and live in this page's file, so they are editable here and
 * nowhere else.
 *
 * `sourceIndex` is the entry's position in the ARRAY LITERAL, which is not its position at
 * runtime: `[...reusedFaqItems, { … }]` is two elements in the file and four on the page.
 * The indices are stated by the caller rather than derived, because there is no way to
 * derive them that survives someone reordering the array — and a wrong index here would
 * write an answer over a question.
 */
export interface OwnFaqEntry {
  readonly question: string;
  readonly answer: string;
  readonly sourceIndex: number;
}

/**
 * The page's own entries, paired as [position on the page, position in the array literal].
 * Both numbers are stated rather than derived, for the reason in `OwnFaqEntry`: a spread
 * makes the two differ, and nothing in the runtime value records where it came from.
 */
export function ownFaqEntries(
  block: FaqBlock,
  mapping: ReadonlyArray<readonly [number, number]>,
): ReadonlyArray<OwnFaqEntry> {
  return mapping.flatMap(([renderedIndex, sourceIndex]) => {
    const item = block.items[renderedIndex];
    return item ? [{ question: item.question, answer: item.answer, sourceIndex }] : [];
  });
}

export function faqSection(
  eyebrow: string,
  heading: string,
  block: FaqBlock,
  updatedAt: Date | null,
  at: At,
  own: ReadonlyArray<OwnFaqEntry> = [],
): CmsRecord {
  const item = (index: number, key: "question" | "answer") =>
    at("block", "items", own[index]?.sourceIndex ?? -1, key);

  return toRecord({
    id: "faq",
    title: "FAQ",
    summary: heading,
    updatedAt,
    values: [field("Eyebrow", eyebrow, at("eyebrow")), field("Heading", heading, at("heading"))],
    lists: [
      readOnlyList(
        "All questions, in order",
        block.items.map((entry) => entry.question),
        "The full list as the page renders it. Entries reused from the brief are edited under FAQ; entries written for this page are below.",
      ),
      ...(own.length > 0
        ? [
            list(
              "Questions written for this page",
              own.map((entry) => entry.question),
              (index) => item(index, "question"),
            ),
            list(
              "Answers written for this page",
              own.map((entry) => entry.answer),
              (index) => item(index, "answer"),
            ),
          ]
        : []),
    ],
  });
}

import Link from "next/link";
import { Container } from "../../components/Container";
import { DrawnRule } from "../../components/DrawnRule";
import { Reveal } from "../../components/Reveal";
import { RevealHeading } from "../../components/RevealHeading";
import type { FaqPageView } from "../../lib/viewModels";
import { FaqIndex } from "./FaqIndex";

interface FaqPageBodyProps {
  readonly page: FaqPageView;
}

/** Milliseconds between one row's rule drawing and the next within a group. */
const ROW_STEP_MS = 90;

/**
 * EVERY QUESTION, OPEN — AND SET AS A LEDGER, NOT A STACK.
 *
 * The first version of this page printed each question as a heading with its answer as a
 * paragraph beneath, twelve times. Every answer was open, which was the point, and the
 * result was a column of prose the client read as "heavy text" — which it was, because
 * a heading-over-paragraph is what a document does, and the rest of this site does not
 * read like a document. It reads as rows: the reason ledger on the homepage, the scope
 * rows on /how-we-work, the inputs on /about — each a hairline that draws in, a numeral,
 * a short line on the left and its substance on the right.
 *
 * So each question is now a ROW. A running numeral, 01 to 12, in the accent label the
 * site uses for ordinals; the question at display size in the left five tracks; the
 * answer at body size in the right six. The answer is still open and still there — it
 * has simply moved beside the question rather than under it, so a row is two lines tall
 * where it was five, and the eye reads down a column of twelve short questions and
 * across to whichever answer it wants. Nothing is hidden; it is arranged.
 *
 * THE GROUPS ALTERNATE GROUND. Every second group sits on the site's alternate section
 * colour with the token radius, so the four chapters read as four surfaces rather than
 * four headings on one sheet. Each opens with the group's ordinal set in the display
 * italic — the same mark the "how we work" frames use — and its title at display-l.
 *
 * MOTION IS THE SITE'S. Each row's hairline draws left to right as the row enters, one
 * step behind the row above it, and the row's text rises in on the same step; the group
 * numeral and title reveal the way every heading on the site does. Reduced motion holds
 * every rule at full length and every row in place from the first paint.
 */
export function FaqPageBody({ page }: FaqPageBodyProps) {
  const index = page.groups.map((group) => ({
    id: group.id,
    title: group.title,
    count: group.items.length,
  }));

  let ordinal = 0;

  return (
    <div className="faqp bg-canvas text-ink">
      <Container>
        <div className="faqp-layout">
          <aside className="faqp-aside">
            <FaqIndex label={page.indexLabel} groups={index} />
          </aside>

          <div className="faqp-groups">
            {page.groups.map((group, groupIndex) => (
              <section
                key={group.id}
                id={group.id}
                aria-labelledby={`${group.id}-title`}
                className="faqp-group"
                data-alt={groupIndex % 2 === 1}
              >
                {/* Sticky below lg, on its own ground, so the questions pass under it. */}
                <div className="faqp-group-head">
                  <Reveal>
                    <span className="faqp-group-numeral" aria-hidden="true">
                      {String(groupIndex + 1).padStart(2, "0")}
                    </span>
                  </Reveal>
                  <div>
                    <RevealHeading
                      as="h2"
                      id={`${group.id}-title`}
                      className="text-display-l font-medium text-ink"
                    >
                      {group.title}
                    </RevealHeading>
                    <p className="text-body mt-3 text-ink-70" style={{ maxWidth: "44ch" }}>
                      {group.description}
                    </p>
                  </div>
                </div>

                <ol className="faqp-rows">
                  {group.items.map((item, itemIndex) => {
                    ordinal += 1;
                    const number = String(ordinal).padStart(2, "0");
                    return (
                      <li key={item.question} className="faqp-row">
                        <DrawnRule delayMs={itemIndex * ROW_STEP_MS} />
                        <Reveal index={itemIndex} staggerStepMs={ROW_STEP_MS} className="faqp-row-body">
                          <span className="faqp-row-numeral label text-accent" aria-hidden="true">
                            {number}
                          </span>
                          <h3 className="faqp-row-question text-display-s font-medium text-ink">
                            <span className="sr-only">{number}. </span>
                            {item.question}
                          </h3>
                          <div className="faqp-row-answer">
                            <p className="text-body text-ink-70">{item.answer}</p>
                            {item.ctaHref && item.ctaLabel ? (
                              <p className="mt-4">
                                <Link
                                  href={item.ctaHref}
                                  className="inline-link text-small font-medium text-accent"
                                >
                                  {item.ctaLabel} &rarr;
                                </Link>
                              </p>
                            ) : null}
                          </div>
                        </Reveal>
                      </li>
                    );
                  })}
                  {/* The rule that closes the list, drawn last, so the group ends on a line. */}
                  <li aria-hidden="true">
                    <DrawnRule delayMs={group.items.length * ROW_STEP_MS} />
                  </li>
                </ol>
              </section>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}

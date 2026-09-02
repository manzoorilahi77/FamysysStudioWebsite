"use client";

import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import type { WhyFamysysBlockView } from "../lib/viewModels";
import { ClipNumber } from "../components/ClipNumber";
import { Container } from "../components/Container";
import { Section } from "../components/Section";
import { SectionHeader } from "../components/SectionHeader";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useScrollProgress } from "../hooks/useScrollProgress";
import { useScrollSequence } from "../hooks/useScrollSequence";

interface WhyFamysysProps {
  readonly whyFamysys: WhyFamysysBlockView;
}

/**
 * One mark per reason, drawn rather than borrowed: no icon library, no emoji. Each encodes
 * its own claim and nothing else.
 *
 * 0 Flexible    — one stem forking into two ends: start with a project, expand from it.
 * 1 Efficient   — the same two points joined the long way and the direct way at once.
 * 2 Human-led   — a person, because that is exactly what the claim is about.
 * 3 Scalable    — one measure repeated at three sizes on a shared baseline.
 * 4 Value-driven — a balance: what is delivered against what it costs.
 *
 * `pathLength` is set to 1 on every subpath so a single `stroke-dasharray: 1` draws all of
 * them regardless of their real lengths — see `.reason-icon-draw`, which is what animates.
 */
function ReasonMark({ index }: { readonly index: number }): ReactNode {
  if (index === 0) {
    return (
      <>
        <path d="M3 12h5.5" pathLength={1} />
        <path d="M8.5 12 13.4 6.8" pathLength={1} />
        <path d="M8.5 12 13.4 17.2" pathLength={1} />
        <circle cx="16" cy="5.4" r="2.4" pathLength={1} />
        <circle cx="16" cy="18.6" r="2.4" pathLength={1} />
      </>
    );
  }
  if (index === 1) {
    return (
      <>
        <path d="M4.5 19.5C4.5 9.5 9.5 4.5 19.5 4.5" pathLength={1} />
        <path d="M4.5 19.5 19.5 4.5" pathLength={1} />
        <circle cx="4.5" cy="19.5" r="1.6" pathLength={1} />
        <circle cx="19.5" cy="4.5" r="1.6" pathLength={1} />
      </>
    );
  }
  if (index === 2) {
    return (
      <>
        <circle cx="12" cy="7.5" r="3.5" pathLength={1} />
        <path d="M5 20.5c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5" pathLength={1} />
      </>
    );
  }
  if (index === 3) {
    return (
      <>
        <path d="M3 20.5h18" pathLength={1} />
        <path d="M6.5 20.5v-3.5" pathLength={1} />
        <path d="M12 20.5v-8" pathLength={1} />
        <path d="M17.5 20.5v-12.5" pathLength={1} />
      </>
    );
  }
  if (index === 4) {
    return (
      <>
        <path d="M12 4.5v15" pathLength={1} />
        <path d="M7.5 19.5h9" pathLength={1} />
        <path d="M4 8.5h16" pathLength={1} />
        <path d="M1.5 8.5a3.5 3.5 0 0 0 5 0" pathLength={1} />
        <path d="M17.5 8.5a3.5 3.5 0 0 0 5 0" pathLength={1} />
      </>
    );
  }
  return null;
}

interface ReasonRowProps {
  readonly title: string;
  readonly description: string;
  readonly numeral: string;
  readonly index: number;
  readonly isCurrent: boolean;
  readonly isPinned: boolean;
}

const MARK_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/**
 * One reason. The same markup in both modes; what changes is what triggers it.
 *
 * PINNED, the row is one card of the deck and its arrival is being made current: numeral
 * clipping up, title wiping in, mark drawing, description rising — replayed on every step,
 * which is what makes the swap read as the next reason arriving rather than as a
 * cross-fade between two paragraphs. Driving it from the row's own observer here would
 * fire all five at once, because the five are stacked in one place and the observer cannot
 * see opacity.
 *
 * UNPINNED, it is a row of the ledger and the trigger is its own observer, so a row
 * animates when the reader reaches it rather than when the section does.
 *
 * The mark is rendered TWICE from one definition: a resting copy in ink-12, and the accent
 * copy that draws over it. A single copy would have had to choose between being absent
 * before the draw — the row missing one of the things it carries — and having nothing left
 * to draw. `<use>` was the other option and needs an id per instance.
 */
function ReasonRow({ title, description, numeral, index, isCurrent, isPinned }: ReasonRowProps) {
  const [ref, isInView] = useInView<HTMLLIElement>({ threshold: 0.4, once: true });
  const prefersReducedMotion = useReducedMotion();
  const hasArrived = prefersReducedMotion || (isPinned ? isCurrent : isInView);

  return (
    <li ref={ref} className="reason-row" data-visible={hasArrived} data-current={isCurrent}>
      <span className="reason-rule" aria-hidden="true" />
      <span className="reason-numeral-slot" aria-hidden="true">
        <ClipNumber
          value={numeral}
          className="reason-numeral text-display-l font-medium"
          isVisible={hasArrived}
          delayMs={prefersReducedMotion ? 0 : 120}
          isDecorative
        />
      </span>
      {/* The stage is a full viewport with one reason on it, so the title takes the site's
          heading step there; in the ledger it is one of five rows and takes display-s. */}
      <p
        className={`reason-title font-medium text-ink ${isPinned ? "text-heading" : "text-display-s"}`}
      >
        {title}
      </p>
      <p className="reason-body text-body text-ink-70">{description}</p>
      <span className="reason-icon reason-mark" aria-hidden="true">
        <svg {...MARK_PROPS} width="32" height="32" focusable="false">
          <g className="reason-icon-ghost">
            <ReasonMark index={index} />
          </g>
          <g className="reason-icon-draw">
            <ReasonMark index={index} />
          </g>
        </svg>
      </span>
    </li>
  );
}

/**
 * How much scroll each reason is given while the section is pinned, as a share of the
 * viewport. Matched to the process section's budget on purpose — two pinned sections on
 * one page that advance at different rates read as two different mechanics.
 */
const PIN_PER_REASON_VH = 46;

/**
 * THE FIVE REASONS — one at a time, on a stage that holds still.
 *
 * From `lg` up the section pins: the stage stays under the header while a track several
 * screens tall passes it, and each scroll beat replaces the reason on it — image, numeral,
 * title and statement together. Scrolling is never intercepted; the stage is
 * `position: sticky` inside a tall track, so the page moves at exactly the rate the reader
 * asks for. See `useScrollSequence`, which the process section uses for the same job, and
 * which records what a section that actually swallowed scroll events would break.
 *
 * Below `lg`, and under `prefers-reduced-motion`, there is no pin. The same five reasons
 * are a ledger instead — rows on one spine, separated by rules rather than by borders,
 * with the frame sticky beside them and the spine filling as the reader travels. Five
 * stacked cards in a viewport-height stage would not fit a phone, and a stage that has to
 * scroll inside a section that does not is worse than no stage at all.
 *
 * Both modes share every piece of markup. What differs is what drives it: pinned, the
 * current reason comes from the track's progress cut into five bands; unpinned, from how
 * far the reader has travelled through the list. Either way one index feeds the frame, the
 * row and the step marks, so they cannot disagree about which reason is showing.
 *
 * The section has been a 3 + 2 grid of cards and, before that, five alternating full-width
 * rows. The cards were the better of those and still wrong: five bordered boxes of one
 * sentence each is the shape of a feature grid, the page already has one in What We Do, and
 * the 3 + 2 claimed a grouping the content does not have — three of these are not a group,
 * and the last two are not a second group.
 */
export function WhyFamysys({ whyFamysys }: WhyFamysysProps) {
  const reasonCount = whyFamysys.reasons.length;
  const { ref: trackRef, revealedCount, isPinned } = useScrollSequence<HTMLDivElement>(reasonCount);
  const [listRef, progress] = useScrollProgress<HTMLDivElement>();
  // Pinned, the sequence hands back a 1-based count of how far it has got. Unpinned, the
  // index comes from read progress, clamped below the last index rather than at it —
  // `floor(1 * 5)` is 5, which is not a row.
  const currentIndex = isPinned
    ? revealedCount - 1
    : Math.min(reasonCount - 1, Math.floor(progress * reasonCount));

  return (
    <Section ariaLabel={whyFamysys.heading}>
      <div
        ref={trackRef}
        className="reason-track"
        data-pinned={isPinned}
        style={
          {
            "--reason-track-height": `${100 + reasonCount * PIN_PER_REASON_VH}vh`,
          } as CSSProperties
        }
      >
        <div className="reason-stage">
          <Container>
            <SectionHeader split heading={whyFamysys.heading} body={whyFamysys.body} />

            <div className="reason-layout mt-16">
              {/* The frame. Every image is rendered once and cross-faded in place —
                  swapping a single `src` would restart the download on each change and
                  flash the frame empty between reasons, and there are only five. The first
                  is eager because it is on screen the moment the section is. */}
              <div className="reason-media" aria-hidden="true">
                {whyFamysys.reasons.map((reason, index) => (
                  <span
                    key={reason.title}
                    className="reason-media-item"
                    data-current={index === currentIndex}
                  >
                    <Image
                      src={reason.media.src}
                      alt=""
                      width={1600}
                      height={1200}
                      sizes="(min-width: 1024px) 42vw, 100vw"
                      {...(index === 0 ? {} : { loading: "lazy" as const })}
                      className="h-full w-full object-cover"
                    />
                  </span>
                ))}
                {/* The panel is decorative — `aria-hidden` on the wrapper, empty `alt` on
                    every image — because it says nothing the text beside it does not
                    already say in words. A screen reader announcing five photographs of
                    studio equipment between five one-line claims would be reading the
                    decoration and not the section. The alt text still exists on the content
                    object, where a future caller that shows one of these ALONE needs it. */}
                <span className="reason-media-chip label">
                  {whyFamysys.reasons[currentIndex]?.title}
                </span>
              </div>

              <div ref={listRef} className="reason-list">
                {/* The ledger's spine. Decorative twice over: it repeats the scroll
                    position, which the scrollbar already carries, and it names nothing.
                    Hidden while pinned, where the marks below say the same thing better. */}
                <span className="reason-spine" aria-hidden="true">
                  <span
                    className="reason-spine-fill"
                    style={{ transform: `scaleY(${progress})` }}
                  />
                </span>
                <ol className="reason-rows">
                  {whyFamysys.reasons.map((reason, index) => (
                    <ReasonRow
                      key={reason.title}
                      title={reason.title}
                      description={reason.description}
                      numeral={String(index + 1).padStart(2, "0")}
                      index={index}
                      isCurrent={index === currentIndex}
                      isPinned={isPinned}
                    />
                  ))}
                </ol>
                {/* WHERE AM I, AND HOW MUCH IS LEFT. A pinned section stops the page
                    moving, and without an answer to those two questions that reads as a
                    stuck page rather than as a sequence. Five marks, one filled per reason
                    passed. Only drawn while pinned — the ledger has its spine. */}
                <ol className="reason-steps" aria-hidden="true">
                  {whyFamysys.reasons.map((reason, index) => (
                    <li
                      key={reason.title}
                      className="reason-step"
                      data-state={
                        index === currentIndex ? "current" : index < currentIndex ? "done" : "todo"
                      }
                    />
                  ))}
                </ol>
              </div>
            </div>
          </Container>
        </div>
      </div>
    </Section>
  );
}

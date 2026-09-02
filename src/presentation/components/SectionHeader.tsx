import { Eyebrow } from "./Eyebrow";
import { RevealHeading } from "./RevealHeading";

interface SectionHeaderProps {
  readonly heading: string;
  readonly eyebrow?: string | undefined;
  readonly body?: string | undefined;
  readonly leadIn?: string | undefined;
  readonly dark?: boolean;
  readonly className?: string;
  /** Display-accent phrases, forwarded to RevealHeading. Used by one section only. */
  readonly accent?: ReadonlyArray<string> | undefined;
  /**
   * Puts the body beside the heading instead of under it, from lg up.
   *
   * Every homepage section that HAS both a heading and a supporting line now passes it, so
   * the page opens each of its sections the same way rather than alternating between two
   * header shapes. It stays opt-in rather than becoming the default because a header can
   * only split if there is something to put in the second column — §7 FAQ has a heading and
   * no body, and splitting it would leave five empty columns beside a heading.
   *
   * Below lg it collapses back to the stack. Two columns of a 1.75rem heading and a
   * paragraph on a phone is neither of the two layouts.
   */
  readonly split?: boolean;
}

/**
 * Every section opens the same way: eyebrow, heading, supporting copy — all flush to
 * the container's left edge, never centred. Centred body copy leaves a ragged edge on
 * both sides and gives the page no spine to read down. The page keeps exactly two
 * centred moments (the thesis line in The Differentiator and the final CTA heading);
 * both are display-size statements standing alone, which is what makes the centring
 * read as deliberate rather than as a default.
 */
export function SectionHeader({
  heading,
  eyebrow,
  body,
  leadIn,
  dark = false,
  className,
  accent,
  split = false,
}: SectionHeaderProps) {
  const headingBlock = (
    <>
      {eyebrow ? <Eyebrow dark={dark}>{eyebrow}</Eyebrow> : null}
      <RevealHeading
        accent={accent}
        className={`text-heading font-medium ${eyebrow ? "mt-4" : ""} ${dark ? "text-canvas" : "text-ink"}`}
      >
        {heading}
      </RevealHeading>
    </>
  );
  // `text-body`, not `text-lead`. The supporting line is the second voice in the header
  // and it was reading as a co-headline at lead size — ~19.4px against the heading at 1440,
  // close enough that the split put two similar-weight blocks side by side. At body size
  // (17px) the heading leads and the line supports it, which is the relationship the header
  // is for. Nothing changes below ~787px, where `text-lead`'s clamp was already pinned to
  // its 1.0625rem floor — the same value — so this is a desktop-only change.
  const bodyClass = `text-body ${dark ? "text-canvas-80" : "text-ink-70"}`;
  const leadInClass = `text-body font-medium ${dark ? "text-canvas" : "text-ink"}`;

  if (split) {
    // Twelve tracks rather than two halves, and 6 + 5 rather than 6 + 6: column 7 left
    // empty is what opens the channel between the two, without a gap value that would also
    // eat into the heading's own measure.
    //
    // The heading takes the wider half on purpose. Display-l resolves to ~55px at 1440, and
    // in anything narrower than about six tracks a section heading of any length breaks to
    // four or five lines — a column of stacked fragments rather than the two or three lines
    // the split is meant to read as. Giving the body the narrower column is the other half
    // of the same trick: it wraps a line or two further and the two blocks end up closer in
    // height, which is what lets them be centred against each other rather than one of them
    // floating beside the other.
    //
    // Centred, not top-aligned, and that survives the drop to body size: the two columns
    // are sized so their heights land close together, and against a heading whose first line
    // is 55px tall, aligning the two blocks' TOPS would sit the supporting line's much
    // smaller first line against the heading's cap height and read as a mistake.
    return (
      <div
        className={`grid gap-y-6 lg:grid-cols-12 lg:items-center lg:gap-x-10 ${className ?? ""}`}
      >
        <div className="lg:col-span-6">{headingBlock}</div>
        <div className="lg:col-span-5 lg:col-start-8">
          {body ? <p className={bodyClass}>{body}</p> : null}
          {leadIn ? <p className={`${leadInClass} ${body ? "mt-6" : ""}`}>{leadIn}</p> : null}
        </div>
      </div>
    );
  }

  return (
    <div className={className ?? "max-w-[62ch]"}>
      {headingBlock}
      {body ? <p className={`${bodyClass} mt-6`}>{body}</p> : null}
      {leadIn ? <p className={`${leadInClass} mt-6`}>{leadIn}</p> : null}
    </div>
  );
}

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
  className = "max-w-[62ch]",
  accent,
}: SectionHeaderProps) {
  return (
    <div className={className}>
      {eyebrow ? <Eyebrow dark={dark}>{eyebrow}</Eyebrow> : null}
      <RevealHeading
        accent={accent}
        className={`text-display-l font-medium ${eyebrow ? "mt-4" : ""} ${dark ? "text-canvas" : "text-ink"}`}
      >
        {heading}
      </RevealHeading>
      {body ? (
        <p className={`text-lead mt-6 ${dark ? "text-canvas-80" : "text-ink-70"}`}>{body}</p>
      ) : null}
      {leadIn ? (
        <p className={`text-body mt-6 font-medium ${dark ? "text-canvas" : "text-ink"}`}>{leadIn}</p>
      ) : null}
    </div>
  );
}

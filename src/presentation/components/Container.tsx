import type { ReactNode } from "react";
import { container as containerToken, spacing } from "../../shared/design/tokens";

/**
 * THE SITE'S ONE CONTAINER LINE, as a bare style object.
 *
 * Everything that spans the page takes this: the header bar, every section (through
 * `Container` below) and the footer. That is the whole point of exporting it — the header
 * used to reconstruct the shell as `max-w-7xl px-6`, which matched the token's max width
 * but not its gutter, so a section's copy started 4px inside the wordmark at 390 and 64px
 * inside it at 1920. Two hand-kept copies of the same measurement will always drift; there
 * is now one, and a change to `spacing.gutter` moves the bar and the page together.
 *
 * A style object rather than a class because `spacing.gutter` is a `clamp()` — Tailwind has
 * no utility for it, and an arbitrary-value class would be a third copy of the string.
 */
export const shellStyle = {
  maxWidth: containerToken.maxWidth,
  paddingInline: spacing.gutter,
} as const;

interface ContainerProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function Container({ children, className = "" }: ContainerProps) {
  return (
    <div className={`mx-auto w-full ${className}`} style={shellStyle}>
      {children}
    </div>
  );
}

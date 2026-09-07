import type { ReactNode } from "react";
import {
  container as containerToken,
  navContainer as navContainerToken,
  spacing,
} from "../../shared/design/tokens";

/**
 * THE SITE'S ONE CONTAINER LINE, as a bare style object.
 *
 * Every section (through `Container` below) and the footer take this. The HEADER BAR no
 * longer does: it was moved onto famysys.com's own header shell — see `navShellStyle`
 * below — so the two lines have come apart on purpose, and the note there says by how much.
 *
 * The rest of the reason for exporting it stands. Sections used to reconstruct the shell
 * by hand, which matched the token's max width but not its gutter, and copies of the same
 * measurement always drift; there is one here, and a change to `spacing.gutter` moves
 * every section and the footer together.
 *
 * A style object rather than a class because `spacing.gutter` is a `clamp()` — Tailwind has
 * no utility for it, and an arbitrary-value class would be a third copy of the string.
 */
export const shellStyle = {
  maxWidth: containerToken.maxWidth,
  paddingInline: spacing.gutter,
} as const;

/**
 * THE HEADER BAR'S LINE, which is no longer the one above. See `navContainer` in
 * tokens.ts for the measurements this reproduces and for what it costs — in short, the
 * bar is now held to famysys.com's own header shell rather than to this site's page
 * width, so at 1440 the bar's first label sits 40px outboard of a section's first
 * character. Nothing but the header takes this.
 */
export const navShellStyle = {
  maxWidth: navContainerToken.maxWidth,
  paddingInline: navContainerToken.gutter,
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

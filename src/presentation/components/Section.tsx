import type { ReactNode } from "react";
import { spacing } from "../../shared/design/tokens";

interface SectionProps {
  readonly children: ReactNode;
  readonly id?: string;
  readonly dark?: boolean;
  readonly ariaLabel?: string;
  readonly className?: string;
}

export function Section({ children, id, dark = false, ariaLabel, className = "" }: SectionProps) {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={`${dark ? "bg-ink text-canvas" : "bg-canvas text-ink"} ${className}`}
      style={{ paddingBlock: spacing.section }}
    >
      {children}
    </section>
  );
}

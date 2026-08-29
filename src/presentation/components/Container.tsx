import type { ReactNode } from "react";
import { container as containerToken, spacing } from "../../shared/design/tokens";

interface ContainerProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function Container({ children, className = "" }: ContainerProps) {
  return (
    <div
      className={`mx-auto w-full ${className}`}
      style={{ maxWidth: containerToken.maxWidth, paddingInline: spacing.gutter }}
    >
      {children}
    </div>
  );
}

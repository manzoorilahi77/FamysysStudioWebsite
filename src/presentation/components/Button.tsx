import Link from "next/link";
import type { CtaView } from "../lib/viewModels";

export type ButtonVariant = "primary" | "ghost" | "ghostInverse";

interface ButtonProps {
  readonly cta: CtaView;
  readonly variant?: ButtonVariant;
  readonly className?: string;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-ink text-canvas hover:bg-primary-button-hover",
  ghost: "border border-ink-20 text-ink hover:border-accent",
  ghostInverse: "bg-canvas text-ink hover:bg-canvas-80",
};

export function Button({ cta, variant = "primary", className = "" }: ButtonProps) {
  const classes = `transition-base inline-flex items-center justify-center rounded-sm px-6 py-3 text-small font-medium ${VARIANT_CLASSES[variant]} ${className}`;

  if (cta.isExternal) {
    return (
      <a href={cta.href} className={classes} target="_blank" rel="noopener noreferrer">
        {cta.label}
      </a>
    );
  }

  return (
    <Link href={cta.href} className={classes}>
      {cta.label}
    </Link>
  );
}

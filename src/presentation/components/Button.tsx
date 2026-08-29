import Link from "next/link";
import type { CtaView } from "../lib/viewModels";

export type ButtonVariant = "primary" | "ghost";

interface ButtonProps {
  readonly cta: CtaView;
  readonly variant?: ButtonVariant;
  readonly dark?: boolean;
  readonly className?: string;
}

const LIGHT_VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-ink text-canvas hover:bg-primary-button-hover",
  ghost: "border border-ink-20 text-ink hover:border-accent",
};

const DARK_VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-canvas text-ink hover:bg-primary-button-hover-on-dark",
  ghost: "border border-canvas-40 text-canvas hover:border-accent",
};

export function Button({ cta, variant = "primary", dark = false, className = "" }: ButtonProps) {
  const variantClasses = dark ? DARK_VARIANT_CLASSES[variant] : LIGHT_VARIANT_CLASSES[variant];
  const classes = `transition-base inline-flex items-center justify-center rounded-sm px-6 py-3 text-small font-medium ${variantClasses} ${className}`;

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

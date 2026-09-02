import Link from "next/link";
import type { ReactNode } from "react";
import type { CtaView } from "../lib/viewModels";

export type ButtonVariant = "primary" | "ghost";

interface ButtonProps {
  readonly cta: CtaView;
  readonly variant?: ButtonVariant;
  readonly dark?: boolean;
  readonly className?: string;
  /**
   * Rolls the label over on hover: it leaves upward while a copy arrives from below. Opt
   * in, and currently the header's two buttons only — it is the bar's own flourish, not a
   * behaviour every call to action on the site should suddenly acquire.
   */
  readonly rollOnHover?: boolean;
}

// A PRIMARY BUTTON IS THE LOUD COLOUR ON BOTH GROUNDS.
//
// On light it is the primary accent, with the page ground as its label. On dark it is the
// lightened accent, with the dark ground as its label — not the page ground as a fill,
// which is what it used to be and which made the most important control on a dark section
// the quietest thing on it. The primary accent cannot do that job on the dark ground
// (2.957:1 against it, under the 3:1 a control's boundary needs); the lightened one is
// 8.318:1 against the ground and 8.215:1 for its label. Both numbers are in
// `npm run check-colours`.
//
// The header is the one place that takes the LIGHT variant onto a dark bar, at the
// brief's direction, so the bar's call to action is the primary accent rather than its
// lightened twin. It carries a hairline for the boundary: see `.header-cta-primary`.
const LIGHT_VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-accent text-canvas hover:bg-primary-button-hover",
  ghost: "border border-ink-20 text-ink hover:border-accent hover:bg-ink-4",
};

const DARK_VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-accent-on-dark text-ink hover:bg-primary-button-hover-on-dark",
  ghost: "border border-canvas-40 text-canvas hover:border-canvas hover:bg-canvas-10",
};

/**
 * The label, either plain or as a rolling pair. The copy is `aria-hidden`, so the
 * accessible name stays the label exactly once however it is rendered.
 */
function Label({ label, roll }: { readonly label: string; readonly roll: boolean }): ReactNode {
  if (!roll) {
    return label;
  }
  return (
    <span className="button-roll">
      <span className="button-roll-label">{label}</span>
      <span className="button-roll-label button-roll-label--copy" aria-hidden="true">
        {label}
      </span>
    </span>
  );
}

export function Button({
  cta,
  variant = "primary",
  dark = false,
  className = "",
  rollOnHover = false,
}: ButtonProps) {
  const variantClasses = dark ? DARK_VARIANT_CLASSES[variant] : LIGHT_VARIANT_CLASSES[variant];
  const classes = `button-motion inline-flex items-center justify-center rounded-sm px-6 py-3 text-small font-medium ${variantClasses} ${className}`;
  const label = <Label label={cta.label} roll={rollOnHover} />;

  if (cta.isExternal) {
    return (
      <a href={cta.href} className={classes} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    );
  }

  return (
    <Link href={cta.href} className={classes}>
      {label}
    </Link>
  );
}

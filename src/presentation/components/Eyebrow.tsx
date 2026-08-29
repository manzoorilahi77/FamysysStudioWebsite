interface EyebrowProps {
  readonly children: string;
  readonly dark?: boolean;
  readonly className?: string;
}

// Eyebrows are accent again on light surfaces. They were moved to ink-70 because the
// previous accent managed only 4.043:1 on canvas; the brand accent reads 5.107:1 and
// clears the 4.5:1 text floor. On dark they stay canvas — the lightened accent would
// work at 5.015:1, but the asymmetry there is a locked, render-confirmed decision.
export function Eyebrow({ children, dark = false, className = "" }: EyebrowProps) {
  return <p className={`label ${dark ? "text-canvas" : "text-accent"} ${className}`}>{children}</p>;
}

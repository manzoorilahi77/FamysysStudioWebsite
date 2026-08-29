interface EyebrowProps {
  readonly children: string;
  readonly dark?: boolean;
  readonly className?: string;
}

export function Eyebrow({ children, dark = false, className = "" }: EyebrowProps) {
  return <p className={`label ${dark ? "text-canvas" : "text-ink-70"} ${className}`}>{children}</p>;
}

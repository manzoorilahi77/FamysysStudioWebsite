import Image from "next/image";

/** Intrinsic size of both wordmark files — a 4x render of the 32px display height the
    header and the footer share, so every caller downsamples. */
const WORDMARK_WIDTH = 424;
const WORDMARK_HEIGHT = 128;

interface WordmarkProps {
  readonly alt: string;
  /** Renders the canvas-tinted file for dark surfaces instead of the ink one. */
  readonly dark?: boolean;
  readonly className?: string;
  readonly priority?: boolean;
}

/**
 * The client's logo is a single-colour wordmark on transparency, so each surface gets
 * its own pre-tinted file rather than a CSS filter: `brightness(0) invert(1)` would land
 * on pure white, not the brand's warm canvas, and a filter chain that hits #F4F1E8
 * exactly is guesswork the build cannot verify.
 *
 * There is no cross-fade any more. It existed for one caller — the header, which used to
 * flip surfaces mid-scroll and needed both files stacked so the flip never waited on a
 * request. The header is permanently ink now and takes the canvas file alone.
 *
 * EVERY caller is currently `dark`, so the canvas file is the only one being served — the
 * header, the footer and the contact card all sit on ink. The ink file is kept because the
 * prop still offers a light surface and both variants are cut from one master in the same
 * pass; dropping it would leave `dark={false}` pointing at nothing.
 */
export function Wordmark({ alt, dark = false, className = "", priority = false }: WordmarkProps) {
  return (
    <span className={`inline-block ${className}`}>
      <Image
        src={dark ? "/brand/famysys-studio-logo-canvas.png" : "/brand/famysys-studio-logo-ink.png"}
        alt={alt}
        width={WORDMARK_WIDTH}
        height={WORDMARK_HEIGHT}
        priority={priority}
        className="h-full w-auto"
      />
    </span>
  );
}

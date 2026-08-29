import Image from "next/image";

/** Intrinsic size of both wordmark files — a 4x render of the 32px display height. */
const WORDMARK_WIDTH = 396;
const WORDMARK_HEIGHT = 128;

interface WordmarkProps {
  readonly alt: string;
  /** Renders the canvas-tinted file for dark surfaces instead of the ink one. */
  readonly dark?: boolean;
  /** Cross-fades between both files, for the header, which flips as the page scrolls. */
  readonly crossfade?: boolean;
  readonly className?: string;
  readonly priority?: boolean;
}

/**
 * The client's logo is a single-colour wordmark on transparency, so each surface gets
 * its own pre-tinted file rather than a CSS filter: `brightness(0) invert(1)` would land
 * on pure white, not the brand's warm canvas, and a filter chain that hits #F4F1E8
 * exactly is guesswork the build cannot verify.
 *
 * The header flips between surfaces mid-scroll, so it renders both files stacked and
 * cross-fades them. Both are in the DOM from the start, so the flip never waits on a
 * network request and never flashes.
 */
export function Wordmark({
  alt,
  dark = false,
  crossfade = false,
  className = "",
  priority = false,
}: WordmarkProps) {
  const shared = {
    width: WORDMARK_WIDTH,
    height: WORDMARK_HEIGHT,
    priority,
    className: "h-full w-auto",
  };

  if (!crossfade) {
    return (
      <span className={`inline-block ${className}`}>
        <Image
          src={dark ? "/brand/famysys-studio-logo-canvas.png" : "/brand/famysys-studio-logo-ink.png"}
          alt={alt}
          {...shared}
        />
      </span>
    );
  }

  return (
    <span className={`relative inline-block ${className}`}>
      <Image
        src="/brand/famysys-studio-logo-canvas.png"
        alt={alt}
        {...shared}
        style={{
          opacity: dark ? 1 : 0,
          transitionProperty: "opacity",
          transitionDuration: "240ms",
          transitionTimingFunction: "var(--ease-base)",
        }}
      />
      <Image
        src="/brand/famysys-studio-logo-ink.png"
        alt=""
        aria-hidden="true"
        {...shared}
        className="absolute inset-0 h-full w-auto"
        style={{
          opacity: dark ? 0 : 1,
          transitionProperty: "opacity",
          transitionDuration: "240ms",
          transitionTimingFunction: "var(--ease-base)",
        }}
      />
    </span>
  );
}

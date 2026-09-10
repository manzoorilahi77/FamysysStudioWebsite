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
 * BOTH FILES ARE SERVED, and the split is by surface rather than by page. The header, the
 * footer, the contact card and the admin sidebar all sit on ink and pass `dark`, so they
 * take the canvas file. The admin login is the one light surface on the site — it is
 * `bg-canvas` — and takes the ink file by leaving the prop off.
 *
 * THERE IS NO THIRD FILE IN THIS FOLDER ANY MORE. Both of these are cut from the client's
 * `Famysys - Studio - Logo .png` (navy on white, confirmed 10 September 2026 as the actual
 * logo), which lives in the media library as public/media/237d99103b20ebcc.png with its
 * media_assets row. The unreferenced 2561x773 master that used to sit here, six times the
 * size of the two files that are served, is deleted. Re-cut from the library file.
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

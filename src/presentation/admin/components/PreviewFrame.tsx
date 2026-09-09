"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * THE PREVIEW IS THE PAGE. That is the whole design decision, and it was between three
 * options:
 *
 *   - RE-RENDER THE SECTION'S COMPONENT INTO A FRAGMENT. Rejected. These blocks are server
 *     components that read through the repositories, and several of them only look right
 *     inside the page — the footer seam, the sticky header offset, the hero's viewport-height
 *     bands, the scroll-driven reveals. A fragment would be a second rendering of the same
 *     content that agrees with the page until the day it does not, which is worse than no
 *     preview at all: it would be trusted.
 *   - A PARALLEL "PREVIEW" TEMPLATE. Same objection, plus a second copy of every page to
 *     keep in step.
 *   - AN IFRAME AT THE REAL ROUTE, WITH DRAFT MODE ON. Chosen. It is the actual page: the
 *     same server components, the same repositories, the same CSS, the same layout. Next's
 *     draft mode turns off the prerendered HTML for the request, and the content store lays
 *     `content_drafts` over `content_strings` on the way past — so what renders is the page
 *     with the unpublished words in it and nothing else changed.
 *
 * SCROLLING TO THE SECTION is done from here rather than by giving every block an anchor,
 * because the site does not change for the panel's convenience. The frame is same-origin, so
 * the heading is found in its document by its text and scrolled to. If it is not found the
 * preview simply opens at the top, which is still the true rendering.
 *
 * The draft cookie belongs to the BROWSER, not to the frame, so it is turned off again on
 * the way out — otherwise the editor's own view of the live site would quietly be showing
 * drafts with nothing on screen to say why.
 */

interface PreviewFrameProps {
  readonly route: string;
  /** Used to find the block in the rendered page. The section's own heading text. */
  readonly heading: string;
  readonly canPreviewDrafts: boolean;
  readonly onClose: () => void;
}

export function PreviewFrame({ route, heading, canPreviewDrafts, onClose }: PreviewFrameProps) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [nonce] = useState(() => Date.now());
  const [scrolled, setScrolled] = useState(false);

  // Escape closes it, and the button that opened it is what focus goes back to — the
  // caller re-focuses, because it owns the button.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const scrollToSection = useCallback(() => {
    const document_ = frame.current?.contentDocument;
    if (!document_) return;
    const match = [...document_.querySelectorAll("h1, h2, h3")].find(
      (element) => element.textContent?.trim() === heading.trim(),
    );
    if (match) {
      match.scrollIntoView({ block: "start" });
      setScrolled(true);
    }
  }, [heading]);

  return (
    <section
      aria-label={`Preview of ${route}`}
      className="mt-6 overflow-hidden rounded-sm border border-ink-12 bg-card"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline px-5 py-3">
        <p className="text-small text-ink">
          Preview of <span className="text-graphite-70">{route}</span>
          {canPreviewDrafts ? (
            <span className="label ml-3 rounded-sm border border-accent px-2 py-1 text-accent">
              With unpublished edits
            </span>
          ) : (
            <span className="label ml-3 rounded-sm bg-ink-4 px-2 py-1 text-ink-60">
              Live content only
            </span>
          )}
        </p>
        <div className="text-small flex flex-wrap items-center gap-x-4 text-graphite-70">
          <a
            href={`${route}?preview=${nonce}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center transition-colors duration-[180ms] hover:text-ink"
          >
            Open in a new tab
          </a>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 items-center transition-colors duration-[180ms] hover:text-ink"
          >
            Close preview
          </button>
        </div>
      </div>

      {!canPreviewDrafts ? (
        <p className="text-small border-b border-hairline px-5 py-3 text-graphite-70">
          This store keeps its content in the TypeScript modules, and the site is built from
          them — so there is nowhere for it to read an unpublished string from. What is below is
          the live page. Publish to see the edit in it.
        </p>
      ) : null}

      <iframe
        ref={frame}
        // The nonce is what makes a second preview after a save actually re-fetch rather
        // than showing the frame the browser already has.
        src={`${route}?preview=${nonce}`}
        title={`Preview of ${route}`}
        onLoad={scrollToSection}
        // 70vh of a 1080px desktop is 756px of page; 70vh of a 667px phone is 467px, which
        // is not enough of a page to tell whether an edit landed. `70svh` with an 80vh
        // floor on a short screen gives the frame most of the viewport where the viewport
        // is all there is, and leaves the desktop proportion alone.
        className="block h-[70svh] max-[1023px]:h-[80svh] w-full border-0 bg-canvas"
      />

      {!scrolled ? (
        <p className="text-small border-t border-hairline px-5 py-3 text-ink-40">
          Showing the whole page. Scroll the frame to find this block.
        </p>
      ) : null}
    </section>
  );
}

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
 * WHAT CHANGED, AND WHY. The frame used to open at the top of the page and try to scroll to
 * the block by matching the section's NAME against the headings in the rendered document.
 * That works only when the panel's name for a block happens to be the words printed on it,
 * and it usually is not: the homepage's "Hero" prints no such word, and "Ways to Work With
 * Us" prints `waysToWork.heading`, which is different copy. Both fell through to the whole
 * page — the editor pressed Preview, got the top of the site, and had to go looking.
 *
 * So every section now carries `data-cms-section` (see `Section`), and this frame aims at
 * that instead. Having found the block it also SIZES ITSELF TO IT, which is what makes this
 * a preview of a section rather than a preview of a page that happens to be scrolled.
 *
 * SCROLLED, NOT TRANSFORMED. The block is brought into view by scrolling the frame's own
 * window, not by translating the document under a clipping mask. The site's reveals are
 * driven by `IntersectionObserver` against the frame's viewport, so a block scrolled into a
 * frame its own height is genuinely in view and animates the way a visitor sees it. Shifted
 * with a transform it would sit there un-revealed, and the editor would be looking at a
 * state the site never shows.
 *
 * The draft cookie belongs to the BROWSER, not to the frame, so it is turned off again on
 * the way out — otherwise the editor's own view of the live site would quietly be showing
 * drafts with nothing on screen to say why.
 */

interface PreviewFrameProps {
  readonly route: string;
  /** The section's CMS id — `hero`, `ways-to-work`. Matches `data-cms-section` in the page. */
  readonly sectionId: string;
  readonly canPreviewDrafts: boolean;
  readonly onClose: () => void;
}

/** Below this the frame is a letterbox rather than a preview, whatever the block measures. */
const MIN_FRAME_PX = 320;
/** The frame never takes more than this much of the panel, however tall the block is. */
const MAX_FRAME_VIEWPORT_FRACTION = 0.8;
/** Air under the block, so its bottom edge is not flush with the frame's. */
const TAIL_PX = 24;

type Aim =
  | { readonly kind: "aiming" }
  /** Found, measured, and the frame is its height. */
  | { readonly kind: "framed"; readonly height: number }
  /** No element carries this section's anchor on this page. */
  | { readonly kind: "unanchored" }
  /** The anchor is there but renders nothing — a dialog that only exists once opened. */
  | { readonly kind: "empty" };

/**
 * The block's box in PAGE coordinates, as the union of every element carrying the anchor.
 *
 * A union rather than the first match because several sections are a RUN of elements: the
 * six capability blocks are one section called "capabilities", the five process steps are
 * one called "process-steps". Measuring only the first would frame one capability and call
 * it the section. The filter block on Selected Work is the other shape of the same problem —
 * a label and the chips under it, two siblings, one section.
 */
function measureBlock(
  document_: Document,
  window_: Window,
  sectionId: string,
): { readonly top: number; readonly height: number } | null {
  const nodes = [...document_.querySelectorAll(`[data-cms-section="${CSS.escape(sectionId)}"]`)];
  if (nodes.length === 0) return null;

  const boxes = nodes.map((node) => node.getBoundingClientRect());
  const top = Math.min(...boxes.map((box) => box.top)) + window_.scrollY;
  const bottom = Math.max(...boxes.map((box) => box.bottom)) + window_.scrollY;

  return { top, height: bottom - top };
}

/**
 * How much of the top of the frame the site's own header will be covering.
 *
 * The header is fixed, so scrolling the block to y=0 puts its first line under the bar. The
 * frame is made that much taller and the scroll target moved up by the same amount, which
 * leaves the header floating over blank space above the block — exactly what it does on the
 * real page when you land on an anchor.
 */
function headerOverlap(document_: Document, window_: Window): number {
  const header = document_.querySelector("header");
  if (!header) return 0;
  const position = window_.getComputedStyle(header).position;
  if (position !== "fixed" && position !== "sticky") return 0;
  return header.getBoundingClientRect().height;
}

export function PreviewFrame({ route, sectionId, canPreviewDrafts, onClose }: PreviewFrameProps) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [nonce] = useState(() => Date.now());
  const [wholePage, setWholePage] = useState(false);
  const [aim, setAim] = useState<Aim>({ kind: "aiming" });

  // Escape closes it, and the button that opened it is what focus goes back to — the
  // caller re-focuses, because it owns the button.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  /**
   * Find the block, size the frame to it, and scroll it to the top.
   *
   * Sizing and scrolling in one pass would be wrong: changing the frame's height relays out
   * a responsive page, and the block's position after the relayout is not the one that was
   * just measured. So the height is measured and applied, and the scroll happens on the
   * frame that resulted from it — `requestAnimationFrame` is the wait for that layout.
   */
  const aimAtSection = useCallback(() => {
    const document_ = frame.current?.contentDocument;
    const window_ = frame.current?.contentWindow;
    if (!document_ || !window_) return;

    const first = measureBlock(document_, window_, sectionId);
    if (!first) {
      setAim({ kind: "unanchored" });
      return;
    }
    if (first.height === 0) {
      setAim({ kind: "empty" });
      return;
    }

    const overlap = headerOverlap(document_, window_);
    const height = Math.max(
      MIN_FRAME_PX,
      Math.min(
        first.height + overlap + TAIL_PX,
        Math.round(window.innerHeight * MAX_FRAME_VIEWPORT_FRACTION),
      ),
    );
    setAim({ kind: "framed", height });

    window_.requestAnimationFrame(() => {
      const settled = measureBlock(document_, window_, sectionId) ?? first;
      window_.scrollTo({ top: Math.max(0, settled.top - overlap), behavior: "auto" });
    });
  }, [sectionId]);

  // The panel's own width decides the frame's, and the frame's width decides how tall the
  // block is. A resized window therefore needs the aim taken again, or the frame keeps the
  // height the block used to have.
  useEffect(() => {
    if (wholePage) return;
    const onResize = () => aimAtSection();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [aimAtSection, wholePage]);

  const showWholePage = useCallback(() => setWholePage(true), []);

  const showBlock = useCallback(() => {
    setWholePage(false);
    aimAtSection();
  }, [aimAtSection]);

  const isFramed = !wholePage && aim.kind === "framed";

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
          {/* Only offered when there is a block to go back to. On a section with no anchor
              the frame is ALREADY the whole page, and a toggle that does nothing is worse
              than no toggle. */}
          {aim.kind === "framed" || aim.kind === "empty" ? (
            <button
              type="button"
              onClick={wholePage ? showBlock : showWholePage}
              aria-pressed={wholePage}
              className="inline-flex min-h-11 items-center transition-colors duration-[180ms] hover:text-ink"
            >
              {wholePage ? "Show only this block" : "Show whole page"}
            </button>
          ) : null}
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
          This store keeps its content in the TypeScript modules, and the site is built from them —
          so there is nowhere for it to read an unpublished string from. What is below is the live
          page. Publish to see the edit in it.
        </p>
      ) : null}

      <iframe
        ref={frame}
        // The nonce is what makes a second preview after a save actually re-fetch rather
        // than showing the frame the browser already has.
        src={`${route}?preview=${nonce}`}
        title={`Preview of ${route}`}
        onLoad={aimAtSection}
        // Framed, the height is the block's, set inline. Whole-page, the inline height is
        // dropped and the class takes over: 70vh of a 1080px desktop is 756px of page; 70vh
        // of a 667px phone is 467px, which is not enough of a page to tell whether an edit
        // landed. `70svh` with an 80vh floor on a short screen gives the frame most of the
        // viewport where the viewport is all there is, and leaves the desktop proportion
        // alone.
        {...(isFramed ? { style: { height: `${aim.height}px` } } : {})}
        className={`block w-full border-0 bg-canvas ${
          isFramed ? "" : "h-[70svh] max-[1023px]:h-[80svh]"
        }`}
      />

      {/* WHY YOU ARE LOOKING AT THE WHOLE PAGE, every time you are. A frame that silently
          shows the top of the site reads as the section to anyone who does not already know
          what the section looks like — which is the person this panel is for. */}
      {aim.kind === "unanchored" ? (
        <p className="text-small border-t border-hairline px-5 py-3 text-ink-40">
          Showing the whole page. This block is not in the rendered page — it is either switched
          off, or not yet marked for the panel.
        </p>
      ) : null}
      {aim.kind === "empty" ? (
        <p className="text-small border-t border-hairline px-5 py-3 text-ink-40">
          Showing the whole page. This block is marked in the page but renders nothing until a
          visitor opens it, so there is nothing to frame.
        </p>
      ) : null}
      {wholePage && aim.kind === "framed" ? (
        <p className="text-small border-t border-hairline px-5 py-3 text-ink-40">
          Showing the whole page, in context.
        </p>
      ) : null}
    </section>
  );
}

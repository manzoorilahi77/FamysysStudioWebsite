"use client";

import { shellStyle } from "../components/Container";
import { useInView } from "../hooks/useInView";

/**
 * THE SEAM. Every page hands the footer a dark section — FinalCta on six routes,
 * ContactFormSection on the seventh — and the footer is ink as well, so the two would
 * otherwise meet at nothing. The hairline, the accent segment drawn across it and the
 * tonal lift below are what make this a boundary; see `.site-footer` in globals.css for
 * why it takes three cues rather than one border.
 *
 * The observer sits on the divider rather than on the footer, so the wipe fires as the
 * seam itself arrives rather than whenever the footer happens to be 15% visible — which,
 * on a footer this tall, would be most of a screen too early.
 *
 * ITS OWN FILE because it is the only part of the footer that needs a browser. The rest
 * of the footer is four columns of links and two paragraphs; keeping it a server
 * component means none of that markup ships as JavaScript on all seven pages.
 */
export function FooterSeam() {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.9, once: true });

  return (
    <div ref={ref} className="footer-divider" data-drawn={isInView}>
      <div className="mx-auto w-full" style={shellStyle}>
        <span className="footer-divider-accent" aria-hidden="true" />
      </div>
    </div>
  );
}

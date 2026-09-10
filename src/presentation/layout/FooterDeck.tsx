"use client";

import { useState } from "react";
import type { FooterResourceView } from "../lib/viewModels";
import { PendingDialog } from "./PendingDialog";

interface FooterDeckProps {
  readonly deck: FooterResourceView;
}

/**
 * THE CAPABILITY DECK, UNDER THE EMAIL — famysys.com's own footer position for it.
 *
 * The parent sets it as a bordered button with an arrow and a copy-link control beside it.
 * This is a plain link, at the client's direction: the Studio's footer is four columns of
 * links and an identity block, and a bordered button in the middle of that would be the
 * only object in the band. The label carries the same underline-at-rest the email above it
 * does, so the two read as the pair of things in the block you can act on.
 *
 * IT BEHAVES EXACTLY AS AN UNCONNECTED SOCIAL NETWORK DOES, because it is the same
 * situation: the thing is named before the thing exists. With no URL it is a BUTTON that
 * opens the shared "in preparation" dialog — `aria-haspopup="dialog"` says so before the
 * press — and with one it is an anchor that opens the file in a new tab and tells a screen
 * reader it is about to. Nothing else in the footer changes when the URL arrives.
 *
 * A client component for the same narrow reason `FooterConnect` is one: the footer is a
 * server component and stays one, and only the parts that need a browser ship JavaScript.
 */
export function FooterDeck({ deck }: FooterDeckProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (deck.href !== null) {
    return (
      <a
        href={deck.href}
        target="_blank"
        rel="noopener noreferrer"
        className="footer-deck text-small font-medium"
      >
        {deck.label}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => setIsOpen(true)}
        className="footer-deck text-small font-medium"
      >
        {deck.label}
      </button>

      {isOpen ? (
        <PendingDialog
          id="capability-deck"
          label={deck.label}
          copy={deck.pending}
          onClosed={() => setIsOpen(false)}
        />
      ) : null}
    </>
  );
}

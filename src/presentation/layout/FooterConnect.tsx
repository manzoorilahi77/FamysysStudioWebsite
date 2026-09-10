"use client";

import { useState } from "react";
import type { PendingCopy, SocialNetwork } from "../../domain/marketing/entities/FooterContent";
import type { FooterSocialLinkView } from "../lib/viewModels";
import { PendingDialog } from "./PendingDialog";
import { SocialMark } from "./SocialMark";

interface FooterConnectProps {
  readonly links: ReadonlyArray<FooterSocialLinkView>;
  readonly pending: PendingCopy;
}

/**
 * THE CONNECT COLUMN'S ENTRIES, and the one piece of the footer that needs a browser.
 *
 * A network with a handle is a link that opens in a new tab, and it SAYS SO to assistive
 * technology: the visible name is followed by a visually hidden "(opens in a new tab)",
 * because a screen reader user who is moved to a new tab without warning has lost their
 * place in a way a sighted user has not. Nothing visible is added — the brand mark and
 * the name are the whole of what the column shows.
 *
 * A network without one is a BUTTON. It was a bare `<span>` — a name that did nothing
 * when pressed, which is honest but reads as broken — and before that an `<a href="#">`,
 * which scrolled the page to the top. Now it opens the small dialog beside this, naming
 * the network and saying the channel is being set up. `aria-haspopup="dialog"` is what
 * tells a screen reader, before the press, that this one opens something rather than
 * going somewhere.
 *
 * The footer is a server component and stays one; only this column ships as JavaScript.
 */
export function FooterConnect({ links, pending }: FooterConnectProps) {
  const [open, setOpen] = useState<FooterSocialLinkView | null>(null);

  return (
    <>
      {links.map((link) =>
        link.href === null ? (
          <li key={link.network}>
            <button
              type="button"
              aria-haspopup="dialog"
              onClick={() => setOpen(link)}
              className="footer-link footer-link--social text-small"
            >
              <SocialMark network={link.network} />
              {link.label}
            </button>
          </li>
        ) : (
          <li key={link.network}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link footer-link--social text-small"
            >
              <SocialMark network={link.network} />
              {link.label}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        ),
      )}

      {open ? (
        <PendingDialog
          id={open.network}
          label={open.label}
          mark={<SocialMark network={open.network as SocialNetwork} />}
          copy={pending}
          onClosed={() => setOpen(null)}
        />
      ) : null}
    </>
  );
}

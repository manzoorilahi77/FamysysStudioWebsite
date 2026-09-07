"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Container } from "../../components/Container";
import { Section } from "../../components/Section";
import { useMotionLayer } from "../../hooks/useMotionLayer";
import type { CustomPartnershipDetailView, EngagementTierDetailView } from "../../lib/viewModels";

interface WaysToWorkTilesProps {
  readonly eyebrow: string;
  readonly heading: string;
  readonly body: string;
  readonly openLabel: string;
  readonly closeLabel: string;
  readonly idealForLabel: string;
  readonly typicalWorkLabel: string;
  readonly tiers: ReadonlyArray<EngagementTierDetailView>;
  readonly custom: CustomPartnershipDetailView;
}

interface TileProps {
  readonly slug: string;
  readonly name: string;
  readonly descriptor: string;
  readonly summary: string;
  readonly media: EngagementTierDetailView["media"];
  readonly cta: EngagementTierDetailView["cta"];
  readonly openLabel: string;
  readonly closeLabel: string;
  readonly isCustom: boolean;
  readonly isOpen: boolean;
  readonly isMotionOn: boolean;
  readonly onReach: () => void;
  readonly onLeave: () => void;
  readonly onToggle: () => void;
  readonly onClose: () => void;
  readonly children: React.ReactNode;
}

/**
 * One tile: a picture with a name on it, and a panel that slides up over the lower 84% of
 * it when the pointer arrives.
 *
 * The name is repeated inside the open panel. The panel covers the plate it opened over,
 * so without it an open panel would not say which tier it belongs to.
 *
 * HOVER OPENS IT, AND THE BUTTON STILL DOES TOO. The pointer is guarded on
 * `pointerType`, so a tap is never treated as a hover: touch and the keyboard go through
 * the button, exactly as the process frames' sentence does. That is also why the plate is
 * a real `<button>` rather than a div with a mouse handler — a reader who cannot hover has
 * to have something to press.
 *
 * `inert` while closed is the one thing the exploration could not express in a stylesheet:
 * a panel translated 101% down is still in the document, and its link and its Close button
 * would still take a tab stop from behind the picture. It is applied only while the motion
 * layer is running — with reduced motion the panel is simply part of the page, which is
 * also why `aria-expanded` reads true there: nothing is collapsed.
 *
 * ESCAPE IS HANDLED HERE RATHER THAN BY THE SECTION, because closing a panel has to put
 * focus back on the plate that opened it. Focus is usually INSIDE the panel when Escape
 * arrives — the reader has tabbed to the link or the Close button — and the panel is about
 * to go inert, so leaving focus where it is drops it onto the body and sends the next Tab
 * back to the top of the document.
 */
function Tile({
  slug,
  name,
  descriptor,
  summary,
  media,
  cta,
  openLabel,
  closeLabel,
  isCustom,
  isOpen,
  isMotionOn,
  onReach,
  onLeave,
  onToggle,
  onClose,
  children,
}: TileProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = `tier-panel-${slug}`;

  function close(): void {
    onClose();
    triggerRef.current?.focus();
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key !== "Escape") {
        return;
      }
      onClose();
      triggerRef.current?.focus();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  return (
    <article
      className="tile"
      data-open={isOpen}
      data-custom={isCustom}
      // Enter and leave rather than `:hover` in CSS, because the panel has to be state:
      // only one is open at a time, and a stylesheet cannot know about the other three.
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") onReach();
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") onLeave();
      }}
    >
      <div className="tile-shot">
        <Image
          src={media.src}
          alt={media.alt}
          width={1600}
          height={1200}
          sizes="(min-width: 1040px) 30vw, (min-width: 780px) 50vw, 100vw"
          loading="lazy"
          className="tile-image"
        />
      </div>
      <button
        ref={triggerRef}
        type="button"
        className="tile-hit"
        aria-expanded={isMotionOn ? isOpen : true}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span className="tile-plate">
          <span className="tile-name">{name}</span>
          <span className="tile-sign label">{openLabel}</span>
        </span>
      </button>
      <div className="tile-detail" id={panelId} inert={isMotionOn && !isOpen}>
        <h3 className="tile-who">{name}</h3>
        <p className="tile-desc">{descriptor}</p>
        <p className="tile-sum">{summary}</p>
        {children}
        <Link className="tile-go" href={cta.href}>
          {cta.label}
        </Link>
        <button type="button" className="tile-shut label" onClick={close}>
          {closeLabel}
        </button>
      </div>
    </article>
  );
}

/**
 * Four pictures at 80vh — three equal tiers and the Custom Creative Partnership at roughly
 * 1.6x width, so the widest picture on the row is the partnership. A name on each, and
 * nothing else until a tile is reached.
 *
 * ONE PANEL AT A TIME. A tile already covered by its own detail has nothing left to show,
 * and two open panels turn a row of pictures into two columns of small print. Escape closes
 * whichever is open; Close does the same and hands focus back to the plate it opened over,
 * so a keyboard reader is returned to where they were rather than to the top of the
 * document.
 *
 * A PANEL THE POINTER OPENED CLOSES WHEN THE POINTER GOES. One opened deliberately — a
 * click, a tap, Enter on the plate — does not: the reader asked for it, and a keyboard has
 * no "leave" to close it with. That is the whole of `isPinnedRef`, and it is a ref rather
 * than state because nothing renders differently for it; it only decides what the next
 * pointer event is allowed to do.
 *
 * Once a panel is open its own trigger is `pointer-events: none`, so the pointer can never
 * reach it to close it again — Close and Escape are the two ways out, and both are inside
 * the panel or on the keyboard. Which is also why nothing reopens behind them: a pointer
 * that never left fires no new enter.
 *
 * Every word is inside an opaque plate — the name on the picture, and the panel itself,
 * which is the card ground rather than a scrim over the photograph.
 */
export function WaysToWorkTiles({
  eyebrow,
  heading,
  body,
  openLabel,
  closeLabel,
  idealForLabel,
  typicalWorkLabel,
  tiers,
  custom,
}: WaysToWorkTilesProps) {
  const isMotionOn = useMotionLayer();
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const isPinnedRef = useRef(false);

  // All four are stable: each tile subscribes its own Escape handler while it is open, and
  // an identity that changed every render would re-subscribe on every render.
  const close = useCallback(() => {
    isPinnedRef.current = false;
    setOpenSlug(null);
  }, []);

  /** The pointer has arrived over a tile. Whatever was pinned gives way to it. */
  const reach = useCallback((slug: string) => {
    isPinnedRef.current = false;
    setOpenSlug(slug);
  }, []);

  /** The pointer has gone. A pinned panel stays; one the pointer opened goes with it. */
  const leave = useCallback((slug: string) => {
    if (isPinnedRef.current) {
      return;
    }
    setOpenSlug((current) => (current === slug ? null : current));
  }, []);

  /** Click, tap, or Enter on the plate — the path for everything that cannot hover. */
  const toggle = useCallback((slug: string) => {
    setOpenSlug((current) => {
      if (current === slug && isPinnedRef.current) {
        isPinnedRef.current = false;
        return null;
      }
      isPinnedRef.current = true;
      return slug;
    });
  }, []);

  return (
    <Section ariaLabel={heading} className="imagery-section">
      <Container>
        <p className="imagery-eyebrow label">{eyebrow}</p>
        <h2 className="imagery-display mt-4">{heading}</h2>
        <p className="imagery-lede">{body}</p>
      </Container>

      <div className="tiles" data-motion={isMotionOn ? "on" : "off"}>
        {tiers.map((tier) => (
          <Tile
            key={tier.slug}
            slug={tier.slug}
            name={tier.name}
            descriptor={tier.descriptor}
            summary={tier.summary}
            media={tier.media}
            cta={tier.cta}
            openLabel={openLabel}
            closeLabel={closeLabel}
            isCustom={false}
            isOpen={openSlug === tier.slug}
            isMotionOn={isMotionOn}
            onReach={() => reach(tier.slug)}
            onLeave={() => leave(tier.slug)}
            onToggle={() => toggle(tier.slug)}
            onClose={close}
          >
            <dl className="tile-facts">
              <div>
                <dt className="label">{idealForLabel}</dt>
                <dd>{tier.idealFor}</dd>
              </div>
              <div>
                <dt className="label">{typicalWorkLabel}</dt>
                <dd>{tier.typicalWork}</dd>
              </div>
            </dl>
          </Tile>
        ))}

        <Tile
          slug={custom.slug}
          name={custom.name}
          descriptor={custom.descriptor}
          summary={custom.summary}
          media={custom.media}
          cta={custom.cta}
          openLabel={openLabel}
          closeLabel={closeLabel}
          isCustom
          isOpen={openSlug === custom.slug}
          isMotionOn={isMotionOn}
          onReach={() => reach(custom.slug)}
          onLeave={() => leave(custom.slug)}
          onToggle={() => toggle(custom.slug)}
          onClose={close}
        >
          <p className="tile-invite">{custom.invitation}</p>
        </Tile>
      </div>
    </Section>
  );
}

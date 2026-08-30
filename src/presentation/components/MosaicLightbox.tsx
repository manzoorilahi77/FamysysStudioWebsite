"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import type { MediaView } from "../lib/viewModels";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useScrollLock } from "../hooks/useScrollLock";

interface MosaicLightboxProps {
  readonly tiles: ReadonlyArray<MediaView>;
  /** Index of the open tile, or null when closed. */
  readonly openIndex: number | null;
  readonly onClose: () => void;
  readonly onNavigate: (index: number) => void;
}

/**
 * Centred lightbox for the hero mosaic. A real dialog, unlike the header's panels:
 * focus is trapped inside it, the page behind is scroll-locked, Escape and a backdrop
 * click both close, and focus returns to the tile that opened it — the caller restores
 * that, since only it knows which tile was clicked.
 *
 * It portals to <body> because the hero mosaic sits inside a transformed wrapper, and a
 * transformed ancestor makes `position: fixed` resolve against that ancestor rather than
 * the viewport. Rendered in place, the backdrop covered only the mosaic column and was
 * then clipped by the hero's own `overflow: hidden`.
 */
export function MosaicLightbox({ tiles, openIndex, onClose, onNavigate }: MosaicLightboxProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const isOpen = openIndex !== null;
  useScrollLock(isOpen);
  useFocusTrap(panelRef, isOpen);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    panelRef.current?.focus();
  }, [isOpen, openIndex]);

  useEffect(() => {
    if (openIndex === null) {
      return;
    }
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      const steps: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      const step = steps[event.key];
      if (step === undefined || openIndex === null) {
        return;
      }
      event.preventDefault();
      onNavigate((openIndex + step + tiles.length) % tiles.length);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [openIndex, onClose, onNavigate, tiles.length]);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const tile = openIndex === null ? undefined : tiles[openIndex];
  const transitionMs = prefersReducedMotion ? 120 : 260;

  if (!isMounted) {
    return null;
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Enlarged image"
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{
        opacity: isOpen ? 1 : 0,
        visibility: isOpen ? "visible" : "hidden",
        pointerEvents: isOpen ? "auto" : "none",
        transitionProperty: "opacity",
        transitionDuration: `${transitionMs}ms`,
        transitionTimingFunction: "var(--ease-base)",
        backgroundColor: "var(--color-ink-90)",
      }}
      onClick={onClose}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        // The panel swallows the click so only the backdrop closes.
        onClick={(event) => event.stopPropagation()}
        className="surface-dark relative w-full max-w-4xl outline-none"
        style={{
          transform: prefersReducedMotion || isOpen ? "scale(1)" : "scale(0.96)",
          transitionProperty: "transform",
          transitionDuration: `${transitionMs}ms`,
          transitionTimingFunction: "var(--ease-base)",
        }}
      >
        <div className="flex justify-end pb-3">
          <button type="button" onClick={onClose} className="label text-canvas-80">
            Close
          </button>
        </div>
        {tile ? (
          <>
            <Image
              src={tile.src}
              alt={tile.alt}
              width={1200}
              height={900}
              sizes="(min-width: 1024px) 900px, 90vw"
              className="h-auto w-full rounded-sm object-contain"
            />
            <p className="text-small mt-4 text-canvas-80">{tile.alt}</p>
          </>
        ) : null}
        <p className="text-small mt-2 text-canvas-60">
          Use the arrow keys to move between images, Escape to close.
        </p>
      </div>
    </div>,
    document.body,
  );
}

"use client";

import { useEffect, useRef } from "react";
import type { MediaView } from "../lib/viewModels";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useScrollLock } from "../hooks/useScrollLock";
import { AutoplayVideo } from "./AutoplayVideo";

interface ModalPlayerProps {
  readonly media: MediaView;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly labelId: string;
  readonly triggerRef: React.RefObject<HTMLElement | null>;
}

export function ModalPlayer({ media, isOpen, onClose, labelId, triggerRef }: ModalPlayerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const hasOpenedRef = useRef(false);
  const prefersReducedMotion = useReducedMotion();
  useScrollLock(isOpen);
  useFocusTrap(panelRef, isOpen);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      hasOpenedRef.current = true;
      panelRef.current?.focus();
    } else if (hasOpenedRef.current) {
      triggerRef.current?.focus();
    }
  }, [isOpen, triggerRef]);

  if (!isOpen) {
    return null;
  }

  const transitionMs = prefersReducedMotion ? 120 : 220;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{
        backgroundColor: "var(--color-ink-70)",
        animation: `modal-backdrop-in ${transitionMs}ms var(--ease-base)`,
      }}
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        tabIndex={-1}
        className="relative w-full overflow-hidden rounded-sm bg-ink"
        style={{
          maxWidth: "56rem",
          animation: `modal-panel-in ${transitionMs}ms var(--ease-base)`,
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <AutoplayVideo media={media} className="h-full w-full" />
        <button type="button" onClick={onClose} className="label absolute right-6 top-6 text-canvas">
          Close
        </button>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useRef, useState } from "react";
import { useFinePointer } from "./useFinePointer";

export interface UseDisclosureResult {
  readonly isOpen: boolean;
  readonly contentRef: React.RefObject<HTMLDivElement | null>;
  readonly maxHeight: string;
  readonly triggerProps: {
    readonly onClick: () => void;
    readonly onPointerEnter: () => void;
    readonly onPointerLeave: () => void;
    readonly "aria-expanded": boolean;
  };
}

/**
 * A disclosure that opens two ways at once rather than picking one: hovering opens it
 * on a fine pointer, and a click toggles it on every pointer type (including a mouse,
 * so a sighted keyboard user tabbing to the trigger and pressing Enter/Space — which
 * fires a click — always works, with or without a cursor). `isOpen` is the click
 * state; a fine-pointer hover ORs on top of it, and never overrides a click-opened
 * disclosure closed again by a second hover cycle.
 *
 * The content is always mounted and only ever clipped by `max-height` — never
 * conditionally rendered — so `contentRef.current` is attached before the first open
 * and `scrollHeight` is available synchronously on the render that flips `isOpen`,
 * with no `useLayoutEffect` measuring pass required.
 */
export function useDisclosure(): UseDisclosureResult {
  const hasFinePointer = useFinePointer();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const open = isOpen || (hasFinePointer && isHovering);

  const handleClick = useCallback(() => {
    setIsOpen((current) => !current);
  }, []);

  const handlePointerEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handlePointerLeave = useCallback(() => {
    setIsHovering(false);
  }, []);

  return {
    isOpen: open,
    contentRef,
    maxHeight: open ? `${contentRef.current?.scrollHeight ?? 0}px` : "0px",
    triggerProps: {
      onClick: handleClick,
      onPointerEnter: handlePointerEnter,
      onPointerLeave: handlePointerLeave,
      "aria-expanded": open,
    },
  };
}

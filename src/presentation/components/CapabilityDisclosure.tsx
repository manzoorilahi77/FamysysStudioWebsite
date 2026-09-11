"use client";

import { DeliverableList } from "./DeliverableList";
import { useDisclosure } from "../hooks/useDisclosure";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface CapabilityDisclosureProps {
  readonly label: string;
  readonly expandedCopy: string;
  readonly deliverables: ReadonlyArray<string>;
  readonly dark?: boolean;
}

/**
 * The paragraph and the deliverable list, both always in the DOM and both clipped to
 * zero height until opened — never conditionally rendered — so a screen reader or a
 * page search can still reach them, and opening never triggers a fresh mount/measure
 * cycle. See `useDisclosure` for the open/close contract.
 */
export function CapabilityDisclosure({
  label,
  expandedCopy,
  deliverables,
  dark = false,
}: CapabilityDisclosureProps) {
  const { isOpen, contentRef, maxHeight, triggerProps } = useDisclosure();
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="capability-disclosure">
      <button
        type="button"
        className={`capability-disclosure-trigger text-small font-medium ${
          dark ? "text-accent-on-dark" : "text-accent"
        }`}
        {...triggerProps}
      >
        <span>{isOpen ? "Show less" : "More about this"}</span>
        <span className="capability-disclosure-icon" aria-hidden="true" data-open={isOpen} />
      </button>
      <div
        ref={contentRef}
        className="capability-disclosure-content"
        style={{ maxHeight: prefersReducedMotion ? "none" : maxHeight }}
      >
        <p
          className={`text-body mt-4 ${dark ? "text-canvas-80" : "text-ink-70"}`}
          style={{ maxWidth: "60ch" }}
        >
          {expandedCopy}
        </p>
        <DeliverableList label={label} items={deliverables} dark={dark} className="mt-6" />
      </div>
    </div>
  );
}

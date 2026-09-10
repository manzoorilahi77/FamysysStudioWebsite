"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./FloatingSelect.module.css";

interface FloatingSelectProps {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly options: ReadonlyArray<string>;
  readonly placeholder: string;
  readonly error?: string | undefined;
  /** How a band reads in the list — DemoForm appends "employees", /contact does not. */
  readonly formatOption?: (option: string) => string;
  /** Additional class for the trigger, e.g. DemoForm's compact-height override. */
  readonly triggerClassName?: string | undefined;
}

/**
 * A LISTBOX THAT LOOKS LIKE THE REST OF THE FORM, because a native `<select>`'s popup is
 * painted by the browser and cannot carry the site's palette. This is a WAI-ARIA 1.2
 * combobox (read-only, `aria-autocomplete` not applicable): the trigger owns focus the
 * whole time, `aria-activedescendant` says which option is current, and the popup is a
 * `role="listbox"` the trigger controls — a screen reader announces it exactly as a select.
 *
 * The label floats the same way every other field's does — see FloatingField.module.css —
 * except driven from state rather than `:placeholder-shown`, because a custom trigger has
 * no such pseudo-class to key off. Floated whenever the list is open OR a band is chosen.
 */
export function FloatingSelect({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  formatOption = (option) => option,
  triggerClassName = "",
}: FloatingSelectProps) {
  const reactId = useId();
  const listboxId = `${id}-listbox`;
  const errorId = `${id}-error`;
  const optionId = (index: number) => `${reactId}-option-${index}`;

  // Index 0 is the placeholder ("no band chosen"); options start at index 1, so activating
  // by keyboard and reading the current value back share one index space.
  const allChoices = [placeholder, ...options.map(formatOption)];
  const allValues = ["", ...options];
  const selectedIndex = allValues.indexOf(value);

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  function open(): void {
    setActiveIndex(selectedIndex === -1 ? 0 : selectedIndex);
    setIsOpen(true);
  }

  function close(): void {
    setIsOpen(false);
  }

  function commit(index: number): void {
    onChange(allValues[index] ?? "");
    close();
  }

  // Closes on a click anywhere outside — the standard way this kind of popup dismisses,
  // and the only way it can: a listbox this component draws itself receives no native
  // blur when the pointer leaves the trigger, unlike a real <select>.
  useEffect(() => {
    if (!isOpen) return;
    function handlePointerDown(event: PointerEvent): void {
      if (!rootRef.current?.contains(event.target as Node)) close();
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  // Keeps the highlighted row on screen as the keyboard moves through a list taller than
  // the popup — the same thing a native select's popup does for free.
  useEffect(() => {
    if (!isOpen) return;
    const list = listRef.current;
    const activeElement = list?.children[activeIndex];
    if (activeElement instanceof HTMLElement) {
      activeElement.scrollIntoView({ block: "nearest" });
    }
  }, [isOpen, activeIndex]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>): void {
    const lastIndex = allChoices.length - 1;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!isOpen) {
          open();
        } else {
          setActiveIndex((current) => Math.min(current + 1, lastIndex));
        }
        return;
      case "ArrowUp":
        event.preventDefault();
        if (!isOpen) {
          open();
        } else {
          setActiveIndex((current) => Math.max(current - 1, 0));
        }
        return;
      case "Home":
        if (isOpen) {
          event.preventDefault();
          setActiveIndex(0);
        }
        return;
      case "End":
        if (isOpen) {
          event.preventDefault();
          setActiveIndex(lastIndex);
        }
        return;
      case "Enter":
      case " ":
        event.preventDefault();
        if (isOpen) {
          commit(activeIndex);
        } else {
          open();
        }
        return;
      case "Escape":
        if (isOpen) {
          event.preventDefault();
          close();
        }
        return;
      case "Tab":
        close();
        return;
      default:
        return;
    }
  }

  const isFloated = isOpen || value !== "";

  return (
    <div ref={rootRef} className={styles.wrap}>
      <button
        type="button"
        id={id}
        className={`contact-field ${styles.trigger} ${triggerClassName}`}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={isOpen ? optionId(activeIndex) : undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={handleKeyDown}
      >
        <span className={styles.value}>{value ? formatOption(value) : " "}</span>
        <svg
          className={styles.chevron}
          aria-hidden="true"
          focusable="false"
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M1 1.5 6 6.5l5-5" />
        </svg>
      </button>

      {/* Both classes together, not one or the other — `.labelFloated` only overrides the
          floated-state properties; `.label` is what carries `position: absolute` and
          everything else, and dropping it left the label in normal document flow, which
          is why it rendered BELOW the trigger instead of over it. */}
      <label
        htmlFor={id}
        className={`${styles.label} ${isFloated ? styles.labelFloated : ""}`}
      >
        {label}
      </label>

      {isOpen ? (
        <ul id={listboxId} ref={listRef} role="listbox" aria-labelledby={id} className={styles.listbox}>
          {allChoices.map((text, index) => (
            <li
              key={allValues[index]}
              id={optionId(index)}
              role="option"
              aria-selected={index === selectedIndex}
              data-active={index === activeIndex}
              className={styles.option}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => commit(index)}
            >
              <svg
                className={styles.check}
                aria-hidden="true"
                focusable="false"
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
              </svg>
              {text}
            </li>
          ))}
        </ul>
      ) : null}

      {error ? (
        <p id={errorId} className="contact-error text-small">
          <svg
            aria-hidden="true"
            focusable="false"
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 1.9 15 14.2H1L8 1.9Z" />
            <path d="M8 6.4v3.2" />
            <path d="M8 12.1h.01" />
          </svg>
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}

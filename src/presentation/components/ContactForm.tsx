"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  CONTACT_FIELD_ORDER,
  toSubmitDemoRequestInput,
  validateContactRequest,
  type ContactField,
  type ContactFieldErrors,
  type ContactRequestInput,
} from "../../application/lead/ValidateContactRequest";
import type { ContactFormBlock } from "../../domain/contact/entities/ContactPage";
import { CompanySize } from "../../domain/lead/value-objects/CompanySize";
import { ContactRole } from "../../domain/lead/value-objects/ContactRole";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { revealStyle, staggerDelay } from "../motion/variants";

type SubmitStatus = "idle" | "submitting" | "success" | "error";

const EMPTY_VALUES: ContactRequestInput = {
  firstName: "",
  lastName: "",
  email: "",
  companyName: "",
  companyWebsite: "",
  role: "",
  companySize: "",
  brief: "",
};

/** The one field that is not required, so the label carries the qualifier. */
const OPTIONAL_FIELDS: ReadonlySet<ContactField> = new Set(["companyWebsite"]);

const ROLE_OPTIONS = ContactRole.options();
const COMPANY_SIZE_OPTIONS = CompanySize.options();

/** Milliseconds between one form row's entry and the next. */
const ROW_STEP_MS = 50;

/**
 * The rows arrive ON MOUNT, not on scroll, and that is the whole reason this is not the
 * shared `Reveal`.
 *
 * `Reveal` fires from an IntersectionObserver, which is right for a page you read down.
 * It is wrong for a form: at 1440x900 the lower half of this one starts below the fold,
 * so those fields would sit at opacity 0 — invisible, and still in the tab order. Someone
 * tabbing in from the hero would land on a field they cannot see. Triggering from mount
 * means every field is painted within about 500ms of load however the page is entered.
 *
 * The effect itself is the site's existing one: the same opacity-and-24px-rise from
 * `revealStyle`, and the same collapse to opacity-only under reduced motion.
 */
function RevealOnLoad({ index, children }: { index: number; children: React.ReactNode }) {
  const [hasEntered, setHasEntered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const frame = requestAnimationFrame(() => setHasEntered(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      style={{
        ...revealStyle(hasEntered, prefersReducedMotion),
        transitionDelay: `${staggerDelay(index, ROW_STEP_MS)}ms`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Decorative. The message beside it carries the meaning, so it is hidden from assistive
 * technology rather than given a label that would be read before every error.
 */
function WarningTriangle() {
  return (
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
  );
}

interface FieldShellProps {
  readonly id: string;
  readonly label: string;
  readonly error: string | undefined;
  readonly optionalSuffix?: string | undefined;
  readonly children: React.ReactNode;
}

/**
 * One shell for all eight fields, so the label sits in the same place and the error sits
 * in the same place on every one of them. That consistency is the whole point of the
 * pattern: when a form reports seven errors at once, a message that moves between fields
 * makes the reader re-find it each time.
 *
 * The error is rendered without a transition. An error that fades in is slower to read
 * and slower to act on than one that is simply there.
 */
function FieldShell({ id, label, error, optionalSuffix, children }: FieldShellProps) {
  return (
    <div>
      <label htmlFor={id} className="label block text-canvas-80">
        {label}
        {optionalSuffix ? (
          <span className="ml-2 font-normal text-canvas-60">{optionalSuffix}</span>
        ) : null}
      </label>
      <div className="mt-3">{children}</div>
      {error ? (
        <p id={`${id}-error`} className="contact-error text-small">
          <WarningTriangle />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}

interface ContactFormProps {
  readonly form: ContactFormBlock;
}

export function ContactForm({ form }: ContactFormProps) {
  const prefix = useId();
  const [values, setValues] = useState<ContactRequestInput>(EMPTY_VALUES);
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const confirmationRef = useRef<HTMLDivElement>(null);

  const fieldId = (field: ContactField): string => `${prefix}-${field}`;
  const errorCount = CONTACT_FIELD_ORDER.filter((field) => errors[field]).length;

  function update(field: ContactField, value: string): void {
    const next = { ...values, [field]: value };
    setValues(next);
    // Re-validate only a field that has ALREADY failed. Validating on first change, or
    // on first blur, means telling someone their email is malformed while they are still
    // typing the domain — so nothing is checked until they have asked for it by
    // submitting, and after that a field corrects itself as they fix it.
    if (errors[field]) {
      const revalidated = validateContactRequest(next);
      setErrors((current) => ({ ...current, [field]: revalidated[field] }));
    }
  }

  function focusFirstInvalid(fieldErrors: ContactFieldErrors): void {
    const first = CONTACT_FIELD_ORDER.find((field) => fieldErrors[field]);
    if (!first) {
      return;
    }
    // getElementById rather than a selector: useId's values contain characters that are
    // not valid in a CSS id selector without escaping, and there is nothing to gain from
    // escaping them back.
    document.getElementById(fieldId(first))?.focus();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const fieldErrors = validateContactRequest(values);
    setErrors(fieldErrors);
    if (Object.values(fieldErrors).some(Boolean)) {
      setStatus("idle");
      focusFirstInvalid(fieldErrors);
      return;
    }

    setStatus("submitting");
    try {
      const response = await fetch("/api/demo-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toSubmitDemoRequestInput(values)),
      });

      // The route runs SubmitDemoRequest and stays the authority. The pass above exists
      // so the reader gets their errors without a round trip, not so the server can trust
      // the browser — anything it rejects is shown here too.
      if (response.status === 422) {
        const body = (await response.json()) as { errors?: ContactFieldErrors };
        const serverErrors = body.errors ?? {};
        setErrors(serverErrors);
        setStatus("idle");
        focusFirstInvalid(serverErrors);
        return;
      }
      if (!response.ok) {
        setStatus("error");
        return;
      }

      setStatus("success");
      requestAnimationFrame(() => confirmationRef.current?.focus());
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        ref={confirmationRef}
        tabIndex={-1}
        role="status"
        className="rounded-sm border border-canvas-16 bg-canvas-4 p-8"
      >
        <p className="text-display-s font-medium text-canvas">{form.confirmationHeading}</p>
        <p className="text-body mt-3 text-canvas-80">{form.confirmationBody}</p>
      </div>
    );
  }

  const textField = (field: ContactField, type: "text" | "email" | "url") => (
    <FieldShell
      id={fieldId(field)}
      label={form.labels[field]}
      error={errors[field]}
      optionalSuffix={OPTIONAL_FIELDS.has(field) ? form.optionalSuffix : undefined}
    >
      <input
        id={fieldId(field)}
        name={field}
        type={type}
        value={values[field]}
        onChange={(event) => update(field, event.target.value)}
        aria-invalid={Boolean(errors[field])}
        aria-describedby={errors[field] ? `${fieldId(field)}-error` : undefined}
        className="contact-field"
      />
    </FieldShell>
  );

  const selectField = (field: ContactField, options: ReadonlyArray<string>) => (
    <FieldShell id={fieldId(field)} label={form.labels[field]} error={errors[field]}>
      <select
        id={fieldId(field)}
        name={field}
        value={values[field]}
        onChange={(event) => update(field, event.target.value)}
        aria-invalid={Boolean(errors[field])}
        aria-describedby={errors[field] ? `${fieldId(field)}-error` : undefined}
        className="contact-field contact-field--select"
      >
        <option value="">{form.selectPlaceholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </FieldShell>
  );

  /**
   * The fields arrive in a short stagger, and nothing else on this page moves. A form is
   * a thing to fill in, not a thing to watch.
   */
  const rows: ReadonlyArray<React.ReactNode> = [
    <div key="name" className="grid gap-6 sm:grid-cols-2">
      {textField("firstName", "text")}
      {textField("lastName", "text")}
    </div>,
    textField("email", "email"),
    <div key="company" className="grid gap-6 sm:grid-cols-2">
      {textField("companyName", "text")}
      {textField("companyWebsite", "url")}
    </div>,
    <div key="who" className="grid gap-6 sm:grid-cols-2">
      {selectField("role", ROLE_OPTIONS)}
      {selectField("companySize", COMPANY_SIZE_OPTIONS)}
    </div>,
    <FieldShell
      key="brief"
      id={fieldId("brief")}
      label={form.labels.brief}
      error={errors.brief}
    >
      <textarea
        id={fieldId("brief")}
        name="brief"
        rows={5}
        value={values.brief}
        onChange={(event) => update("brief", event.target.value)}
        aria-invalid={Boolean(errors.brief)}
        aria-describedby={errors.brief ? `${fieldId("brief")}-error` : undefined}
        className="contact-field contact-field--textarea"
      />
    </FieldShell>,
  ];

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/*
        The summary is what announces a failed submit, and it is the only assertive
        region on the form. Putting role="alert" on each of the eight field messages
        instead would fire eight interruptions for one keypress; the field messages are
        reached through aria-describedby when focus lands on the field, which is the
        moment the reader needs them. Focus is moved to the first invalid field, so that
        happens immediately after this is read.
      */}
      <div role="alert" aria-atomic="true" className="contact-summary">
        {errorCount > 0 ? (
          <p className="contact-error text-small">
            <WarningTriangle />
            <span>
              {errorCount === 1
                ? "1 field needs your attention."
                : `${errorCount} fields need your attention.`}
            </span>
          </p>
        ) : null}
        {status === "error" ? (
          <p className="contact-error text-small">
            <WarningTriangle />
            <span>{form.submitErrorMessage}</span>
          </p>
        ) : null}
      </div>

      <div className="grid gap-6">
        {rows.map((row, index) => (
          <RevealOnLoad key={index} index={index}>
            {row}
          </RevealOnLoad>
        ))}

        <RevealOnLoad index={rows.length}>
          <button
            type="submit"
            disabled={status === "submitting"}
            className="button-motion mt-2 inline-flex items-center justify-center gap-2 rounded-sm bg-canvas px-6 py-3 text-small font-medium text-ink hover:bg-primary-button-hover-on-dark disabled:opacity-70"
          >
            {status === "submitting" ? form.submittingLabel : form.submitLabel}
            {status === "submitting" ? (
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-ink-20"
                style={{ borderTopColor: "var(--color-ink)" }}
              />
            ) : (
              <svg
                aria-hidden="true"
                focusable="false"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2.5 8h11" />
                <path d="M9 3.5 13.5 8 9 12.5" />
              </svg>
            )}
          </button>
        </RevealOnLoad>
      </div>
    </form>
  );
}

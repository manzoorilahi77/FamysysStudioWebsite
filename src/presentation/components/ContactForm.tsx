"use client";

import type { CSSProperties } from "react";
import { useCallback, useId, useRef, useState } from "react";
import {
  CONTACT_FIELD_ORDER,
  REQUIRED_FIELD,
  toSubmitDemoRequestInput,
  validateContactRequest,
  type ContactField,
  type ContactFieldErrors,
  type ContactRequestInput,
} from "../../application/lead/ValidateContactRequest";
import type { ContactFormBlock } from "../../domain/contact/entities/ContactPage";
import { CompanySize } from "../../domain/lead/value-objects/CompanySize";
import { autoGrowTextarea } from "../lib/autoGrowTextarea";
import floatStyles from "./FloatingField.module.css";
import { FloatingSelect } from "./FloatingSelect";
import { staggerDelay } from "../motion/variants";
import { SubmissionSent } from "./SubmissionSent";

type SubmitStatus = "idle" | "submitting" | "success" | "error";

const EMPTY_VALUES: ContactRequestInput = {
  fullName: "",
  email: "",
  companyName: "",
  companySize: "",
  brief: "",
};

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
 * The entrance is a CSS animation rather than an effect that flips opacity on mount, and
 * for this component that is a correctness matter rather than a preference: an effect that
 * does not run leaves every field at opacity 0 AND still in the tab order, which is the
 * exact failure the paragraph above was written to avoid — it just moved the trigger from
 * scroll to load instead of removing the dependency. A keyframe animation finishes without
 * JavaScript. Reduced motion is handled in the stylesheet. See `.enter-fade`.
 */
function RevealOnLoad({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <div
      className="enter-fade"
      style={{ "--enter-delay": `${staggerDelay(index, ROW_STEP_MS)}ms` } as CSSProperties}
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
  /** The label rests at the box's top padding rather than its vertical centre. */
  readonly textarea?: boolean;
  readonly children: React.ReactNode;
}

/**
 * One shell for all five fields, so the label sits in the same place and the error sits in
 * the same place on every one of them.
 *
 * A FLOATING LABEL: at rest it sits where typed text goes, reading as a placeholder; on
 * focus, or once there is a value, it rises and becomes the site's small-caps label type —
 * see FloatingField.module.css. The control (which must carry `placeholder=" "`) comes
 * first so the CSS sibling rule can key off it, and the label after is what it targets.
 *
 * NOTHING IS MARKED "(optional)" AND NOTHING IS MARKED REQUIRED, and both halves of that
 * are deliberate. Four of the five are optional, so tagging them would hang a qualifier
 * off most of the form and turn a short list of questions into a page of caveats. The one
 * field that must be answered says so where it counts instead: `required` on the input,
 * which is what a screen reader announces on focus, and a message under it the moment a
 * submit is attempted without it.
 *
 * The error is rendered without a transition. An error that fades in is slower to read and
 * slower to act on than one that is simply there.
 */
function FieldShell({ id, label, error, textarea = false, children }: FieldShellProps) {
  return (
    <div className={`${floatStyles.wrap} ${textarea ? floatStyles.wrapTextarea : ""}`}>
      {children}
      <label htmlFor={id} className={floatStyles.label}>
        {label}
      </label>
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

/**
 * /contact's form, and — field for field — the homepage's closing form too. See `DemoForm`,
 * which asks the same five questions with the same one requirement against a different
 * heading and button.
 *
 * FIVE QUESTIONS, ONE OF THEM REQUIRED. It asked eight and required seven: first name,
 * last name, work email, company, company website, role, company size and the brief. Every
 * one of those was a thing someone had to type before the studio would accept a message,
 * and a form that asks a stranger for their job title before it will hear what they want
 * to make is a form that loses the ones who have not decided yet. The email is what is
 * left, because without it there is no reply.
 */
export function ContactForm({ form }: ContactFormProps) {
  const prefix = useId();
  const [values, setValues] = useState<ContactRequestInput>(EMPTY_VALUES);
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const confirmationRef = useRef<HTMLDivElement>(null);
  const [isConfirmationEmailed, setIsConfirmationEmailed] = useState(false);

  /**
   * THE BRIEF FIELD GROWS WITH WHAT IS TYPED. It is a five-row box, which is a reasonable
   * share of a 1440px page and most of a 390x667 phone — and once it is full the reader is
   * writing the most important thing on the form into a window three lines tall, scrolling
   * their own sentence. `.contact-field--textarea` keeps the five-row floor, so nothing
   * about the resting form changes. See `autoGrowTextarea`.
   */
  const autoGrow = useCallback(
    (element: HTMLTextAreaElement | null) => autoGrowTextarea(element),
    [],
  );

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

      // The route says whether it scheduled an acknowledgement email, so the confirmation
      // only mentions one when it is actually coming.
      const accepted = (await response.json().catch(() => null)) as {
        confirmationEmail?: unknown;
      } | null;
      setIsConfirmationEmailed(accepted?.confirmationEmail === true);
      setStatus("success");
      requestAnimationFrame(() => confirmationRef.current?.focus());
    } catch {
      setStatus("error");
    }
  }

  function startAnother(): void {
    setValues(EMPTY_VALUES);
    setErrors({});
    setIsConfirmationEmailed(false);
    setStatus("idle");
    requestAnimationFrame(() => document.getElementById(fieldId("fullName"))?.focus());
  }

  if (status === "success") {
    // The panel's heading and body stay the CMS's; a sender who gave a first name is
    // greeted by it instead of the heading. See SubmissionSent.
    return (
      <SubmissionSent
        focusRef={confirmationRef}
        heading={form.confirmationHeading}
        body={form.confirmationBody}
        fullName={values.fullName}
        email={values.email.trim()}
        isConfirmationEmailed={isConfirmationEmailed}
        onReset={startAnother}
      />
    );
  }

  const textField = (field: ContactField, type: "text" | "email") => (
    <FieldShell id={fieldId(field)} label={form.labels[field]} error={errors[field]}>
      <input
        id={fieldId(field)}
        name={field}
        type={type}
        value={values[field]}
        onChange={(event) => update(field, event.target.value)}
        required={field === REQUIRED_FIELD}
        aria-invalid={Boolean(errors[field])}
        aria-describedby={errors[field] ? `${fieldId(field)}-error` : undefined}
        className="contact-field"
        placeholder=" "
      />
    </FieldShell>
  );

  /**
   * One field per row, in the order the validator lists them. The name and company used to
   * be paired two-across with a sibling each — first/last, and company/website — and both
   * of those siblings are gone, so pairing would now put a field beside a gap.
   */
  const rows: ReadonlyArray<React.ReactNode> = [
    textField("fullName", "text"),
    textField("email", "email"),
    textField("companyName", "text"),
    // A custom listbox rather than a native <select> — see FloatingSelect for why: a
    // browser's own select popup cannot carry the site's palette, and every other field
    // here now floats its label, which a native select cannot do either. Selectable, not
    // `disabled`: leaving this unanswered is a valid submission, so the placeholder stays
    // reachable to undo a wrong choice.
    <FloatingSelect
      key="companySize"
      id={fieldId("companySize")}
      label={form.labels.companySize}
      value={values.companySize}
      onChange={(value) => update("companySize", value)}
      options={COMPANY_SIZE_OPTIONS}
      placeholder={form.selectPlaceholder}
      error={errors.companySize}
    />,
    <FieldShell
      key="brief"
      id={fieldId("brief")}
      label={form.labels.brief}
      error={errors.brief}
      textarea
    >
      <textarea
        id={fieldId("brief")}
        name="brief"
        rows={5}
        value={values.brief}
        ref={autoGrow}
        onChange={(event) => {
          update("brief", event.target.value);
          autoGrow(event.currentTarget);
        }}
        aria-invalid={Boolean(errors.brief)}
        aria-describedby={errors.brief ? `${fieldId("brief")}-error` : undefined}
        className="contact-field contact-field--textarea"
        placeholder=" "
      />
    </FieldShell>,
  ];

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/*
        The summary is what announces a failed submit, and it is the only assertive
        region on the form. Putting role="alert" on the field message instead would fire
        an interruption on every keypress that fixes it; the field message is reached
        through aria-describedby when focus lands on the field, which is the moment the
        reader needs it. Focus is moved to the first invalid field, so that happens
        immediately after this is read.
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

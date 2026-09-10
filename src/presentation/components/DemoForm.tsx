"use client";

import { useRef, useState } from "react";
import {
  CONTACT_FIELD_ORDER,
  REQUIRED_FIELD,
  toSubmitDemoRequestInput,
  validateContactRequest,
  type ContactField,
  type ContactFieldErrors,
  type ContactRequestInput,
} from "../../application/lead/ValidateContactRequest";
import { CompanySize } from "../../domain/lead/value-objects/CompanySize";
import { autoGrowTextarea } from "../lib/autoGrowTextarea";
import styles from "./DemoForm.module.css";
import floatStyles from "./FloatingField.module.css";
import { FloatingSelect } from "./FloatingSelect";
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

/**
 * THE LABELS ARE HARD-CODED HERE AND CMS-DRIVEN ON /contact, which looks like an
 * inconsistency and is the existing split rather than a new one: this form has never had a
 * content block behind it. Worth giving it one the next time the panel is opened up; not
 * worth inventing a second source of contact copy in passing.
 */
const LABELS: Record<ContactField, string> = {
  fullName: "Full name",
  email: "Business email",
  companyName: "Company name",
  companySize: "Company size",
  brief: "What are you trying to create?",
};

interface FieldProps {
  readonly id: string;
  readonly label: string;
  readonly error: string | undefined;
  /** The label rests at the box's top padding rather than its vertical centre. */
  readonly textarea?: boolean;
  readonly children: React.ReactNode;
}

/**
 * A FLOATING LABEL: at rest it sits where typed text goes, reading as a placeholder; on
 * focus, or once there is a value, it rises and becomes the site's small-caps label type.
 * See FloatingField.module.css for the mechanism — the control (which must carry
 * `placeholder=" "`) comes first so the CSS sibling rule can key off it, and the label
 * after is what the rule targets.
 */
function Field({ id, label, error, textarea = false, children }: FieldProps) {
  return (
    <div className={`${floatStyles.wrap} ${textarea ? floatStyles.wrapTextarea : ""}`}>
      {children}
      <label htmlFor={id} className={floatStyles.label}>
        {label}
      </label>
      {error ? (
        <p id={`${id}-error`} className="text-small mt-1 text-accent-on-dark" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

// `.contact-field` — the site's dark form field, shared with /contact rather than a second
// boxed variant living only here. Four boxed inputs beside the contact page's underlined
// ones made the same studio look like two, and the shared class also carries the audited
// numbers: a canvas-40 underline at 3.231:1 against the 3:1 UI-boundary floor, a canvas-60
// hover, and an accent-on-dark error state that agrees with the message beside it.
//
// `styles.field` rides alongside it and only overrides height and padding — see
// DemoForm.module.css — so this form is compact without a second field style existing.
const INPUT_CLASSES = `contact-field ${styles.field}`;

/**
 * THE HOMEPAGE'S CLOSING FORM, WHICH NOW ASKS EXACTLY WHAT /contact ASKS.
 *
 * It asked four questions — name, email, company, size — and required all four, while
 * /contact asked eight and required seven. Two forms, two shapes, two sets of rules, one
 * studio. They are the same five questions now, in the same order, validated by the same
 * function, and only the heading, the button and the confirmation differ. The fifth
 * question is the one that was missing from here and mattered most: what the sender is
 * actually trying to make.
 *
 * ONLY THE EMAIL IS REQUIRED. Everything else can be left blank and the enquiry still
 * sends — see `validateContactRequest` for why that is a deliberate trade rather than a
 * relaxation, and `DemoRequest` for what an unanswered question stores.
 */
export function DemoForm() {
  const [values, setValues] = useState<ContactRequestInput>(EMPTY_VALUES);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [fieldErrors, setFieldErrors] = useState<ContactFieldErrors>({});
  const confirmationRef = useRef<HTMLDivElement>(null);
  const [isConfirmationEmailed, setIsConfirmationEmailed] = useState(false);

  function update(field: ContactField, value: string): void {
    const next = { ...values, [field]: value };
    setValues(next);
    // Only re-check a field that has already failed, so nobody is told their email is
    // malformed while they are still typing the domain.
    if (fieldErrors[field]) {
      const revalidated = validateContactRequest(next);
      setFieldErrors((current) => ({ ...current, [field]: revalidated[field] }));
    }
  }

  function focusFirstInvalid(errors: ContactFieldErrors): void {
    const first = CONTACT_FIELD_ORDER.find((field) => errors[field]);
    if (first) {
      document.getElementById(first)?.focus();
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const errors = validateContactRequest(values);
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) {
      setStatus("idle");
      focusFirstInvalid(errors);
      return;
    }

    setStatus("submitting");

    try {
      const response = await fetch("/api/demo-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toSubmitDemoRequestInput(values)),
      });

      if (response.status === 422) {
        const body = (await response.json()) as { errors?: ContactFieldErrors };
        const serverErrors = body.errors ?? {};
        setFieldErrors(serverErrors);
        setStatus("idle");
        focusFirstInvalid(serverErrors);
        return;
      }

      if (!response.ok) {
        setStatus("error");
        return;
      }

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
    setFieldErrors({});
    setIsConfirmationEmailed(false);
    setStatus("idle");
    requestAnimationFrame(() => document.getElementById("fullName")?.focus());
  }

  if (status === "success") {
    // NO TURNAROUND. This used to promise a reply "within one business day", which the
    // contact page and the acknowledgement email both deliberately do not — the brief gives
    // the studio no such number. It now says what /contact says.
    return (
      <SubmissionSent
        focusRef={confirmationRef}
        heading="Thanks — your brief is with us."
        body="We read every one. If it is work we should take, you will hear back from the person who would direct it."
        fullName={values.fullName}
        email={values.email.trim()}
        isConfirmationEmailed={isConfirmationEmailed}
        onReset={startAnother}
      />
    );
  }

  const textField = (field: ContactField, type: "text" | "email") => (
    <Field id={field} label={LABELS[field]} error={fieldErrors[field]}>
      <input
        id={field}
        name={field}
        type={type}
        value={values[field]}
        onChange={(event) => update(field, event.target.value)}
        required={field === REQUIRED_FIELD}
        aria-invalid={Boolean(fieldErrors[field])}
        aria-describedby={fieldErrors[field] ? `${field}-error` : undefined}
        className={INPUT_CLASSES}
        placeholder=" "
      />
    </Field>
  );

  return (
    // gap-3, down from gap-5 — see DemoForm.module.css and FinalCta's note on why this
    // form has to be compact rather than generous.
    <form onSubmit={handleSubmit} noValidate className={`grid gap-3 ${styles.form}`}>
      {textField("fullName", "text")}
      {textField("email", "email")}
      {textField("companyName", "text")}

      {/* A custom listbox rather than a native <select> — see FloatingSelect for why: a
          browser's own select popup cannot carry the site's palette, and every other field
          here now floats its label, which a native select cannot do either. Selectable
          rather than required: leaving the size unanswered is a valid submission, so the
          placeholder stays reachable to undo a wrong choice. */}
      <FloatingSelect
        id="companySize"
        label={LABELS.companySize}
        value={values.companySize}
        onChange={(value) => update("companySize", value)}
        options={COMPANY_SIZE_OPTIONS}
        placeholder="Choose a size"
        formatOption={(band) => `${band} employees`}
        error={fieldErrors.companySize}
        triggerClassName={styles.field}
      />

      {/* The question the homepage form never asked. Two rows rather than /contact's
          five — this form sits in a closing band beside other content and has to fit a
          viewport with it — and it grows from there as it is filled, same as /contact. */}
      <Field id="brief" label={LABELS.brief} error={fieldErrors.brief} textarea>
        <textarea
          id="brief"
          name="brief"
          rows={2}
          value={values.brief}
          ref={autoGrowTextarea}
          onChange={(event) => {
            update("brief", event.target.value);
            autoGrowTextarea(event.currentTarget);
          }}
          aria-invalid={Boolean(fieldErrors.brief)}
          aria-describedby={fieldErrors.brief ? "brief-error" : undefined}
          className={`${INPUT_CLASSES} contact-field--textarea`}
          placeholder=" "
        />
      </Field>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="transition-base mt-1 inline-flex items-center justify-center gap-2 rounded-sm bg-canvas px-6 py-3 text-small font-medium text-ink disabled:opacity-60"
      >
        {status === "submitting" ? (
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-ink-40"
            style={{ borderTopColor: "var(--color-ink)" }}
          />
        ) : null}
        {status === "submitting" ? "Sending…" : "Book a call"}
      </button>

      {status === "error" ? (
        <p className="text-small text-accent-on-dark" role="alert">
          Something went wrong sending that. Please try again.
        </p>
      ) : null}
    </form>
  );
}

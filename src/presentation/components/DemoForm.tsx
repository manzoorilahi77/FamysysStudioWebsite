"use client";

import { useRef, useState } from "react";
import { CompanySize } from "../../domain/lead/value-objects/CompanySize";

interface FieldErrors {
  fullName?: string;
  email?: string;
  companyName?: string;
  companySize?: string;
}

type SubmitStatus = "idle" | "submitting" | "success" | "error";

const COMPANY_SIZE_OPTIONS = CompanySize.options();

interface FieldProps {
  readonly id: string;
  readonly label: string;
  readonly error: string | undefined;
  readonly children: React.ReactNode;
}

function Field({ id, label, error, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="label text-canvas-80">
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {error ? (
        <p id={`${id}-error`} className="text-small mt-1 text-accent-on-dark" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const INPUT_CLASSES = "transition-base w-full rounded-sm border bg-transparent px-4 py-3 text-body text-canvas";

export function DemoForm() {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const confirmationRef = useRef<HTMLDivElement>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setStatus("submitting");
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const payload = {
      fullName: String(formData.get("fullName") ?? ""),
      email: String(formData.get("email") ?? ""),
      companyName: String(formData.get("companyName") ?? ""),
      companySize: String(formData.get("companySize") ?? ""),
    };

    try {
      const response = await fetch("/api/demo-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status === 422) {
        const body = (await response.json()) as { errors: FieldErrors };
        setFieldErrors(body.errors);
        setStatus("error");
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
      <div ref={confirmationRef} tabIndex={-1} role="status" className="rounded-sm border border-canvas-10 p-8">
        <p className="text-display-s font-medium text-canvas">Thanks &mdash; we&apos;ll be in touch.</p>
        <p className="text-body mt-2 text-canvas-80">
          Someone from Famysys Studio will reply within one business day to schedule a call.
        </p>
      </div>
    );
  }

  const borderStyle = (hasError: boolean): React.CSSProperties => ({
    borderColor: hasError ? "var(--color-accent-on-dark)" : "var(--color-canvas-10)",
  });

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-5">
      <Field id="fullName" label="Full name" error={fieldErrors.fullName}>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          aria-invalid={Boolean(fieldErrors.fullName)}
          aria-describedby={fieldErrors.fullName ? "fullName-error" : undefined}
          className={INPUT_CLASSES}
          style={borderStyle(Boolean(fieldErrors.fullName))}
        />
      </Field>

      <Field id="email" label="Business email" error={fieldErrors.email}>
        <input
          id="email"
          name="email"
          type="email"
          required
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
          className={INPUT_CLASSES}
          style={borderStyle(Boolean(fieldErrors.email))}
        />
      </Field>

      <Field id="companyName" label="Company name" error={fieldErrors.companyName}>
        <input
          id="companyName"
          name="companyName"
          type="text"
          required
          aria-invalid={Boolean(fieldErrors.companyName)}
          aria-describedby={fieldErrors.companyName ? "companyName-error" : undefined}
          className={INPUT_CLASSES}
          style={borderStyle(Boolean(fieldErrors.companyName))}
        />
      </Field>

      <Field id="companySize" label="Company size" error={fieldErrors.companySize}>
        <select
          id="companySize"
          name="companySize"
          required
          defaultValue=""
          aria-invalid={Boolean(fieldErrors.companySize)}
          aria-describedby={fieldErrors.companySize ? "companySize-error" : undefined}
          className={INPUT_CLASSES}
          style={borderStyle(Boolean(fieldErrors.companySize))}
        >
          <option value="" disabled>
            Choose a size
          </option>
          {COMPANY_SIZE_OPTIONS.map((band) => (
            <option key={band} value={band} className="text-ink">
              {band} employees
            </option>
          ))}
        </select>
      </Field>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="transition-base mt-2 inline-flex items-center justify-center gap-2 rounded-sm bg-canvas px-6 py-3 text-small font-medium text-ink disabled:opacity-60"
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
    </form>
  );
}

"use client";

import { useState, type CSSProperties, type Ref } from "react";
import { greetingName } from "../../shared/text/greetingName";
import styles from "./SubmissionSent.module.css";

interface SubmissionSentProps {
  /** Shown when the sender gave no usable first name. */
  readonly heading: string;
  readonly body: string;
  /** As typed; only its first word greets them, and only when it is a plausible name. */
  readonly fullName: string;
  readonly email: string;
  /** True only when the server scheduled the acknowledgement email for this enquiry. */
  readonly isConfirmationEmailed: boolean;
  readonly onReset: () => void;
  readonly focusRef?: Ref<HTMLDivElement>;
}

interface Step {
  readonly title: string;
  readonly detail: string;
}

/**
 * The Famysys mark, drawn in three pieces so it can assemble: the frame, and the two blocks
 * that form its stair. Traced from public/brand at the 128-unit grid of the source file —
 * a frame 12 units thick at the top and left, 8 at the right and bottom.
 */
function StudioMark() {
  return (
    <svg className={styles.mark} viewBox="0 0 128 128" aria-hidden="true" focusable="false">
      <path className={styles.frame} fillRule="evenodd" d="M0 0H128V128H0Z M12 12V120H120V12Z" />
      <rect className={styles.pieceA} x="12" y="12" width="48" height="44" />
      <rect className={styles.pieceB} x="68" y="72" width="52" height="48" />
    </svg>
  );
}

/**
 * WHAT THE SENDER SEES ONCE THE BRIEF IS IN.
 *
 * The steps are what has ACTUALLY happened by the time this renders, in the order it
 * happened: the enquiry is stored, and it is in the studio's inbox. The third — the
 * confirmation email — is listed only when the server says it scheduled one, so the page
 * never tells someone to look for an email that is not coming. Nothing here states a
 * response time; the contact page promises none, and neither does the email.
 */
export function SubmissionSent({
  heading,
  body,
  fullName,
  email,
  isConfirmationEmailed,
  onReset,
  focusRef,
}: SubmissionSentProps) {
  // Rendered only after a submit, in the browser, so the reader's own clock is the right one.
  const [receivedAt] = useState(() =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  );
  const first = greetingName(fullName);

  const steps: ReadonlyArray<Step> = [
    { title: "Saved", detail: "Your brief is stored with the studio." },
    {
      title: "In the studio's inbox",
      detail: "Waiting for the person who would direct the work.",
    },
    ...(isConfirmationEmailed
      ? [{ title: "Confirmation on its way", detail: `To ${email}. Check spam if it isn't there.` }]
      : []),
  ];

  return (
    <div ref={focusRef} tabIndex={-1} role="status" className={styles.panel}>
      <div className={styles.head}>
        <div className={styles.markWrap}>
          <span className={styles.ring} aria-hidden="true" />
          <StudioMark />
        </div>
        <p className={styles.eyebrow}>
          Received · <time>{receivedAt}</time>
        </p>
      </div>

      <p className={styles.heading}>{first ? `Thanks, ${first}.` : heading}</p>
      <p className={styles.body}>{body}</p>

      <ol className={styles.trail} aria-label="What has happened to your brief">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className={styles.step}
            style={{ "--step": index } as CSSProperties}
          >
            <svg className={styles.check} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
              <path d="M4 10.5 8.2 14.5 16 6" pathLength={1} />
            </svg>
            <span className={styles.stepTitle}>{step.title}</span>
            <span className={styles.stepDetail}>{step.detail}</span>
          </li>
        ))}
      </ol>

      <button type="button" className={styles.again} onClick={onReset}>
        Send another enquiry
        <span className={styles.arrow} aria-hidden="true">
          →
        </span>
      </button>
    </div>
  );
}

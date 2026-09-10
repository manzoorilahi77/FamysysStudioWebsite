import type { InquiryDeliveryLog } from "../../domain/lead/repositories/InquiryDeliveryLog";
import type { InquiryMailer, ReceivedInquiry } from "../../domain/lead/services/InquiryMailer";

/**
 * TELLS THE STUDIO AN ENQUIRY ARRIVED, AND TELLS THE SENDER IT WAS RECEIVED.
 *
 * Only ever run for a row that is already committed and a response that has already gone.
 * An expired client secret or a bad afternoon at Microsoft then costs the studio a
 * notification and costs the visitor nothing. So this NEVER THROWS: every failure is
 * logged here, and the caller's `.catch` is a last line of defence, not the plan.
 *
 * THE TWO SENDS ARE SETTLED, NOT RACED. `Promise.allSettled`, because a bounce on the
 * visitor's own mistyped address must not stop the studio being told, and `Promise.all`
 * would stop reporting on the second send the moment the first rejected.
 *
 * LOG LEVELS CARRY MEANING. A failed notification is an error — someone is waiting on a
 * reply nobody knows to write. A failed acknowledgement is a warning — its commonest cause
 * is a mistyped address, which is a fact about the submission rather than a fault. A stamp
 * that fails is logged and swallowed: the mail went out, only the record of it did not.
 *
 * THE LOG CARRIES THE ROW ID AND NOTHING ELSE ABOUT THE ENQUIRY. It is a person's name,
 * address and business problem, and a log is read by more people, kept longer and copied to
 * more places than the table is. For the same reason a failed acknowledgement logs its
 * status and code but not Microsoft's message, which can quote the recipient back.
 *
 * `mailer` is undefined when MAIL_ENABLED is false. The enquiry was stored exactly as
 * before, and the skip is a debug line rather than a warning — a warning on every
 * submission would train everyone to ignore the channel that also carries real failures.
 */
export class NotifyOfInquiry {
  constructor(
    private readonly mailer: InquiryMailer | undefined,
    private readonly deliveryLog: InquiryDeliveryLog,
  ) {}

  async execute(inquiry: ReceivedInquiry): Promise<void> {
    if (!this.mailer) {
      console.debug(`[mail] MAIL_ENABLED is false; inquiry ${inquiry.id} stored, not emailed.`);
      return;
    }

    const [notification, acknowledgement] = await Promise.allSettled([
      this.mailer.notifyStudio(inquiry),
      this.mailer.acknowledge(inquiry),
    ]);

    if (notification.status === "fulfilled") {
      await this.stamp(inquiry.id, "notified_at", () => this.deliveryLog.markNotified(inquiry.id));
    } else {
      console.error(
        `[mail] Inquiry ${inquiry.id}: the studio was NOT notified. ${describe(notification.reason, true)}`,
      );
    }

    if (acknowledgement.status === "fulfilled") {
      await this.stamp(inquiry.id, "ack_sent_at", () =>
        this.deliveryLog.markAcknowledged(inquiry.id),
      );
    } else {
      console.warn(
        `[mail] Inquiry ${inquiry.id}: the acknowledgement was not sent. ${describe(acknowledgement.reason, false)}`,
      );
    }
  }

  private async stamp(id: string, column: string, write: () => Promise<void>): Promise<void> {
    try {
      await write();
    } catch (error: unknown) {
      console.error(
        `[mail] Inquiry ${id}: the mail was sent but ${column} could not be written. ${describe(error, true)}`,
      );
    }
  }
}

/**
 * A failure in one line. `withMessage` is false where the message may name the visitor:
 * the acknowledgement's recipient is their address, and Microsoft sometimes quotes it.
 */
function describe(reason: unknown, withMessage: boolean): string {
  if (!(reason instanceof Error)) return "Unknown failure.";
  const detail = reason as Error & { status?: unknown; code?: unknown };
  const parts = [
    reason.name,
    typeof detail.status === "number" ? `status ${detail.status}` : undefined,
    typeof detail.code === "string" ? `code ${detail.code}` : undefined,
  ].filter((part): part is string => part !== undefined);
  return withMessage ? `${parts.join(", ")}: ${reason.message}` : `${parts.join(", ")}.`;
}

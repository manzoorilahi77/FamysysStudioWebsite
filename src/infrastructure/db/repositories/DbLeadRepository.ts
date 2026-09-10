import type { DemoRequest } from "../../../domain/lead/entities/DemoRequest";
import type { InquiryDeliveryLog } from "../../../domain/lead/repositories/InquiryDeliveryLog";
import type { LeadRepository } from "../../../domain/lead/repositories/LeadRepository";
import { write } from "../pool";

/**
 * A validated enquiry, kept.
 *
 * This replaces `StubLeadRepository`, which resolved and discarded — a form that
 * validated beautifully and threw the lead away. The interface is unchanged and so is
 * everything above it: `SubmitDemoRequest` still builds a `DemoRequest` through its value
 * objects, and only what happens to it afterwards is different.
 *
 * EVERY FIELD BUT THE EMAIL IS STORED AS NULL WHEN IT IS BLANK, NEVER AS "". Both forms
 * now require the email and nothing else, so a column holding NULL says "the sender did
 * not answer this" and one holding a string says "this is what they wrote". An empty
 * string would blur the two, and the inbox would show a lead as having answered with
 * nothing rather than as having skipped the question. The domain draws that distinction
 * and the table keeps it — see migration 009.
 *
 * MAIL IS NOT SENT FROM HERE. The row lands first and the route schedules the two messages
 * after the response has gone; this class only records, afterwards, that each was
 * accepted. Sending from inside `submit` would mean a mail outage costs a lead, which is
 * the wrong way round. See `NotifyOfInquiry` and migration 011.
 */
export class DbLeadRepository implements LeadRepository, InquiryDeliveryLog {
  constructor(private readonly sourceForm: "home" | "contact" = "contact") {}

  async submit(request: DemoRequest): Promise<string> {
    const result = await write(
      `INSERT INTO inquiries
         (full_name, email, company_name, company_size,
          company_website, contact_role, project_brief, source_form, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new')`,
      [
        request.fullName?.value ?? null,
        request.email.value,
        request.companyName ?? null,
        request.companySize?.band ?? null,
        request.companyWebsite?.value ?? null,
        request.role?.name ?? null,
        request.brief?.value ?? null,
        this.sourceForm,
      ],
    );
    return String(result.insertId);
  }

  /**
   * THE STAMPS TOUCH THEIR OWN COLUMN AND NOTHING ELSE. `inquiries` has no `updated_at` and
   * no `version`, so there is nothing a background write could bump by accident — and
   * `status` and `read_at` are left alone, because a message going out is not a person
   * opening the enquiry. `IS NULL` keeps the first acceptance if a stamp is ever retried.
   */
  async markNotified(id: string): Promise<void> {
    await write(
      "UPDATE inquiries SET notified_at = NOW(3) WHERE id = ? AND notified_at IS NULL",
      [rowId(id)],
    );
  }

  async markAcknowledged(id: string): Promise<void> {
    await write(
      "UPDATE inquiries SET ack_sent_at = NOW(3) WHERE id = ? AND ack_sent_at IS NULL",
      [rowId(id)],
    );
  }
}

function rowId(id: string): number {
  const numeric = Number(id);
  if (!Number.isInteger(numeric) || numeric <= 0) {
    throw new Error("That is not an enquiry id.");
  }
  return numeric;
}

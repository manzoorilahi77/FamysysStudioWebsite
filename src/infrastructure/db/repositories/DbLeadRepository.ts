import type { DemoRequest } from "../../../domain/lead/entities/DemoRequest";
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
 * THE THREE OPTIONAL FIELDS ARE STORED AS NULL, NOT "". The homepage's closing form asks
 * four questions and /contact asks eight; an empty string would say the sender declined
 * to answer, and NULL says they were never asked. The domain draws that distinction and
 * the table keeps it.
 *
 * EMAIL FORWARDING IS A LATER PHASE, and the write is shaped so adding it is a hook: the
 * row lands first and a forwarder stamps `forwarded_at` afterwards. Sending mail from
 * inside this method would mean a mail outage costs a lead, which is the wrong way round.
 */
export class DbLeadRepository implements LeadRepository {
  constructor(private readonly sourceForm: "home" | "contact" = "contact") {}

  async submit(request: DemoRequest): Promise<void> {
    await write(
      `INSERT INTO inquiries
         (full_name, email, company_name, company_size,
          company_website, contact_role, project_brief, source_form, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new')`,
      [
        request.fullName.value,
        request.email.value,
        request.companyName,
        request.companySize.band,
        request.companyWebsite?.value ?? null,
        request.role?.name ?? null,
        request.brief?.value ?? null,
        this.sourceForm,
      ],
    );
  }
}

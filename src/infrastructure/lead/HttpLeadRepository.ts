import type { DemoRequest } from "../../domain/lead/entities/DemoRequest";
import type { LeadRepository } from "../../domain/lead/repositories/LeadRepository";

export class HttpLeadRepository implements LeadRepository {
  async submit(request: DemoRequest): Promise<string> {
    const response = await fetch("/api/demo-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Unanswered questions are OMITTED, not sent as null or "". The route reads an
      // absent key as "the sender skipped this", which is the same reading `DemoRequest`
      // and the `inquiries` row take, so a value that never existed does not acquire a
      // shape on the way across the wire.
      body: JSON.stringify({
        email: request.email.value,
        ...(request.fullName ? { fullName: request.fullName.value } : {}),
        ...(request.companyName ? { companyName: request.companyName } : {}),
        ...(request.companySize ? { companySize: request.companySize.band } : {}),
        ...(request.brief ? { brief: request.brief.value } : {}),
      }),
    });

    if (!response.ok) {
      throw new Error(`Demo request submission failed with status ${response.status}.`);
    }

    // The route answers `201 { ok: true, id }`. An id is not something the browser needs
    // in order to show the confirmation, so a body that cannot be read is not a failure.
    const body = (await response.json().catch(() => null)) as { id?: unknown } | null;
    return typeof body?.id === "string" ? body.id : "";
  }
}

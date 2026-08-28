import type { DemoRequest } from "../../domain/lead/entities/DemoRequest";
import type { LeadRepository } from "../../domain/lead/repositories/LeadRepository";

export class HttpLeadRepository implements LeadRepository {
  async submit(request: DemoRequest): Promise<void> {
    const response = await fetch("/api/demo-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: request.fullName.value,
        email: request.email.value,
        companyName: request.companyName,
        companySize: request.companySize.band,
      }),
    });

    if (!response.ok) {
      throw new Error(`Demo request submission failed with status ${response.status}.`);
    }
  }
}

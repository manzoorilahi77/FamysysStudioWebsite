import type { LeadRepository } from "../../domain/lead/repositories/LeadRepository";

/**
 * No email or CRM integration yet — this repository only exists to let a
 * validated DemoRequest resolve somewhere. Swap for a real implementation
 * (email, CRM, queue) behind the same interface when that integration exists.
 */
export class StubLeadRepository implements LeadRepository {
  async submit(): Promise<void> {
    return;
  }
}

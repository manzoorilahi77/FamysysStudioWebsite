import type { DemoRequest } from "../../../domain/lead/entities/DemoRequest";
import type { LeadRepository } from "../../../domain/lead/repositories/LeadRepository";

export class FakeLeadRepository implements LeadRepository {
  calls = 0;
  received: DemoRequest | undefined;
  error: Error | undefined;

  async submit(request: DemoRequest): Promise<void> {
    this.calls += 1;
    this.received = request;
    if (this.error) {
      throw this.error;
    }
  }
}

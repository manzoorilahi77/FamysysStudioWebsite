import type { DemoRequest } from "../entities/DemoRequest";

export interface LeadRepository {
  /** Stores the enquiry and resolves to its id, which is what a notification links to. */
  submit(request: DemoRequest): Promise<string>;
}

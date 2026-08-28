import type { DemoRequest } from "../entities/DemoRequest";

export interface LeadRepository {
  submit(request: DemoRequest): Promise<void>;
}

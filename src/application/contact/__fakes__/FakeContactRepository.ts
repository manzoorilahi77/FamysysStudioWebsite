import type { ContactPage } from "../../../domain/contact/entities/ContactPage";
import type { ContactRepository } from "../../../domain/contact/repositories/ContactRepository";

export class FakeContactRepository implements ContactRepository {
  pageCalls = 0;
  error: Error | undefined;

  constructor(private readonly page: ContactPage) {}

  async getContactPage(): Promise<ContactPage> {
    this.pageCalls += 1;
    if (this.error) {
      throw this.error;
    }
    return this.page;
  }
}

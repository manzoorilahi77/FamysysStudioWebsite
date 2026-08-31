import type { ContactPage } from "../../domain/contact/entities/ContactPage";
import type { ContactRepository } from "../../domain/contact/repositories/ContactRepository";

export class GetContactPage {
  constructor(private readonly repository: ContactRepository) {}

  async execute(): Promise<ContactPage> {
    return this.repository.getContactPage();
  }
}

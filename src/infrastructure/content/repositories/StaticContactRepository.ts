import type { ContactPage } from "../../../domain/contact/entities/ContactPage";
import type { ContactRepository } from "../../../domain/contact/repositories/ContactRepository";
import { contactPage } from "../static/contact.content";

export class StaticContactRepository implements ContactRepository {
  async getContactPage(): Promise<ContactPage> {
    return contactPage;
  }
}

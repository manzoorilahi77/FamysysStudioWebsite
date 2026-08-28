import { BusinessEmail } from "../../domain/lead/value-objects/BusinessEmail";
import { CompanySize } from "../../domain/lead/value-objects/CompanySize";
import { FullName } from "../../domain/lead/value-objects/FullName";
import { DemoRequest } from "../../domain/lead/entities/DemoRequest";
import type { LeadRepository } from "../../domain/lead/repositories/LeadRepository";

export interface SubmitDemoRequestInput {
  readonly fullName: string;
  readonly email: string;
  readonly companyName: string;
  readonly companySize: string;
}

export class SubmitDemoRequest {
  constructor(private readonly repository: LeadRepository) {}

  async execute(input: SubmitDemoRequestInput): Promise<void> {
    const request = DemoRequest.create({
      fullName: FullName.create(input.fullName),
      email: BusinessEmail.create(input.email),
      companyName: input.companyName,
      companySize: CompanySize.create(input.companySize),
    });
    await this.repository.submit(request);
  }
}

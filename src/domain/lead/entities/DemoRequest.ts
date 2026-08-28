import { InvalidDemoRequestError } from "../errors/LeadErrors";
import type { BusinessEmail } from "../value-objects/BusinessEmail";
import type { CompanySize } from "../value-objects/CompanySize";
import type { FullName } from "../value-objects/FullName";

export interface DemoRequestProps {
  readonly fullName: FullName;
  readonly email: BusinessEmail;
  readonly companyName: string;
  readonly companySize: CompanySize;
}

export class DemoRequest {
  private constructor(
    readonly fullName: FullName,
    readonly email: BusinessEmail,
    readonly companyName: string,
    readonly companySize: CompanySize,
  ) {}

  static create(props: DemoRequestProps): DemoRequest {
    const companyName = props.companyName.trim();
    if (!companyName) {
      throw new InvalidDemoRequestError("companyName is required.");
    }
    return new DemoRequest(props.fullName, props.email, companyName, props.companySize);
  }
}

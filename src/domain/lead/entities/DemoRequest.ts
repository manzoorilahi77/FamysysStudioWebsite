import { InvalidDemoRequestError } from "../errors/LeadErrors";
import type { BusinessEmail } from "../value-objects/BusinessEmail";
import type { CompanySize } from "../value-objects/CompanySize";
import type { CompanyWebsite } from "../value-objects/CompanyWebsite";
import type { ContactRole } from "../value-objects/ContactRole";
import type { FullName } from "../value-objects/FullName";
import type { ProjectBrief } from "../value-objects/ProjectBrief";

/**
 * ONE entity, two forms.
 *
 * The homepage's closing form asks four questions; /contact asks eight. Rather than a
 * second entity that would drift from this one, the three fields only /contact collects
 * are optional here and required at that form's own boundary. That keeps the requiredness
 * where it is actually decided — a form asks for what it asks for — and leaves this type
 * describing what a lead IS, which is a named person at a named company with a way to
 * reach them.
 *
 * `companyWebsite` is optional on /contact too, and is the only field that is optional in
 * both directions.
 */
export interface DemoRequestProps {
  readonly fullName: FullName;
  readonly email: BusinessEmail;
  readonly companyName: string;
  readonly companySize: CompanySize;
  readonly companyWebsite?: CompanyWebsite | undefined;
  readonly role?: ContactRole | undefined;
  readonly brief?: ProjectBrief | undefined;
}

export class DemoRequest {
  private constructor(
    readonly fullName: FullName,
    readonly email: BusinessEmail,
    readonly companyName: string,
    readonly companySize: CompanySize,
    readonly companyWebsite: CompanyWebsite | undefined,
    readonly role: ContactRole | undefined,
    readonly brief: ProjectBrief | undefined,
  ) {}

  static create(props: DemoRequestProps): DemoRequest {
    const companyName = props.companyName.trim();
    if (!companyName) {
      throw new InvalidDemoRequestError("companyName is required.");
    }
    return new DemoRequest(
      props.fullName,
      props.email,
      companyName,
      props.companySize,
      props.companyWebsite,
      props.role,
      props.brief,
    );
  }
}

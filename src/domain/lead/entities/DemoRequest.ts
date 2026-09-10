import { InvalidDemoRequestError } from "../errors/LeadErrors";
import type { BusinessEmail } from "../value-objects/BusinessEmail";
import type { CompanySize } from "../value-objects/CompanySize";
import type { CompanyWebsite } from "../value-objects/CompanyWebsite";
import type { ContactRole } from "../value-objects/ContactRole";
import type { FullName } from "../value-objects/FullName";
import type { ProjectBrief } from "../value-objects/ProjectBrief";

/** `inquiries.company_name` is VARCHAR(191). Past it the write fails at the database. */
const COMPANY_NAME_MAX_LENGTH = 191;

/**
 * AN ENQUIRY IS AN EMAIL ADDRESS AND WHATEVER ELSE THE SENDER CHOSE TO TELL US.
 *
 * It used to be "a named person at a named company with a way to reach them" — name,
 * email, company and size all required, on both forms. That is a truer description of a
 * lead the studio would like to receive than of the ones it actually gets: someone who
 * will not type their company size before they know whether anyone is going to reply is
 * still someone worth replying to, and a form that stops them is a form that loses them.
 *
 * So EMAIL is the only field this type insists on, because it is the only one without
 * which the enquiry cannot be answered at all. Everything else is optional here and
 * optional at both forms' boundaries, and `undefined` throughout rather than "" — a
 * question left blank, not an answer of nothing. `inquiries` holds NULL for each of them.
 *
 * WHAT IS STILL CHECKED, AND WHY IT IS NOT THE SAME AS BEING REQUIRED. A supplied answer
 * still has to fit the column it is written to, and a supplied company size still has to
 * be one of the four bands, because the only way to submit a fifth is to bypass the select
 * entirely. Neither is a judgement about the sender's answer; both are the boundary
 * refusing to accept a value it cannot store or cannot mean anything by.
 */
export interface DemoRequestProps {
  readonly email: BusinessEmail;
  readonly fullName?: FullName | undefined;
  readonly companyName?: string | undefined;
  readonly companySize?: CompanySize | undefined;
  readonly companyWebsite?: CompanyWebsite | undefined;
  readonly role?: ContactRole | undefined;
  readonly brief?: ProjectBrief | undefined;
}

export class DemoRequest {
  private constructor(
    readonly email: BusinessEmail,
    readonly fullName: FullName | undefined,
    readonly companyName: string | undefined,
    readonly companySize: CompanySize | undefined,
    readonly companyWebsite: CompanyWebsite | undefined,
    readonly role: ContactRole | undefined,
    readonly brief: ProjectBrief | undefined,
  ) {}

  static create(props: DemoRequestProps): DemoRequest {
    return new DemoRequest(
      props.email,
      props.fullName,
      normaliseCompanyName(props.companyName),
      props.companySize,
      props.companyWebsite,
      props.role,
      props.brief,
    );
  }
}

/**
 * A company name is a plain string rather than a value object, so its one boundary check
 * lives here. Blank becomes `undefined` — the sender skipped an optional question, which
 * is not an error — and anything past the column's width throws, because the alternative
 * is a database write that fails with a 503 the sender cannot act on.
 */
function normaliseCompanyName(value: string | undefined): string | undefined {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) {
    return undefined;
  }
  if (trimmed.length > COMPANY_NAME_MAX_LENGTH) {
    throw new InvalidDemoRequestError(
      `companyName exceeds ${COMPANY_NAME_MAX_LENGTH} characters.`,
    );
  }
  return trimmed;
}

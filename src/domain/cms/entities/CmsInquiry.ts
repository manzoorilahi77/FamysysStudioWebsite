/**
 * A contact form submission, kept.
 *
 * It used to describe a shape nothing produced: the form validated and posted, and
 * `StubLeadRepository` discarded what it received. There is a table behind it now, and the
 * inbox lists what arrived.
 *
 * `status` is the only state an enquiry has, and there are three of it: NEW until someone
 * opens the inbox, READ once they have, ARCHIVED when it is dealt with. There is no
 * deleted — an enquiry is the one row on this site that cannot be produced again from a
 * content file, so archiving hides it and keeps it.
 *
 * What is NOT here: the sender's brief, their role, their website. The inbox is a list of
 * who wrote and when, and the answer to an enquiry is an email to the address on it, not a
 * reply typed into a CMS. Those columns are stored and will be shown when there is a
 * screen that does something with them.
 */
export type CmsInquiryStatus = "new" | "read" | "archived";

export interface CmsInquiry {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly companyName: string;
  readonly companySize: string;
  readonly status: CmsInquiryStatus;
  readonly receivedAt: Date;
}

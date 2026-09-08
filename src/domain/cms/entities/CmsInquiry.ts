/**
 * A contact form submission, kept.
 *
 * `status` is the only state an enquiry has, and there are three of it: NEW until someone
 * opens the inbox, READ once they have, ARCHIVED when it is dealt with. There is no
 * deleted — an enquiry is the one row on this site that cannot be produced again from a
 * content file, so archiving hides it and keeps it.
 *
 * EVERY FIELD THE SENDER FILLED IN IS HERE, and the ones they were never asked for are
 * `null` rather than empty. The homepage's closing form asks four questions and /contact
 * asks eight, so "" means a question declined and `null` means a question never put — the
 * same distinction `DemoRequest` makes in the domain. Showing only a name and an address
 * would mean a brief somebody wrote sat in a column nobody read.
 */
export type CmsInquiryStatus = "new" | "read" | "archived";

export interface CmsInquiry {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly companyName: string;
  readonly companySize: string;
  /** `null` when the form that was used did not ask. */
  readonly companyWebsite: string | null;
  readonly contactRole: string | null;
  readonly projectBrief: string | null;
  /** Which of the two forms it came from, so a short enquiry is not read as a terse one. */
  readonly sourceForm: "home" | "contact";
  readonly status: CmsInquiryStatus;
  readonly receivedAt: Date;
}

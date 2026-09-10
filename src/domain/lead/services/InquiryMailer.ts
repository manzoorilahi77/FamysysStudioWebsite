import type { DemoRequest } from "../entities/DemoRequest";

/** An enquiry that has already been stored: the row exists and `id` is its key. */
export interface ReceivedInquiry {
  readonly id: string;
  readonly request: DemoRequest;
  readonly receivedAt: Date;
}

/**
 * The two messages an enquiry produces, sent independently.
 *
 * `notifyStudio` tells the studio an enquiry arrived, and is answered by replying to the
 * person who wrote in. `acknowledge` tells that person it arrived. Either may fail without
 * the other being affected, which is why they are two calls rather than one.
 *
 * Both are only ever called for a row that is already committed. Mail is a consequence of
 * an enquiry, never a condition of accepting one.
 */
export interface InquiryMailer {
  notifyStudio(inquiry: ReceivedInquiry): Promise<void>;
  acknowledge(inquiry: ReceivedInquiry): Promise<void>;
}

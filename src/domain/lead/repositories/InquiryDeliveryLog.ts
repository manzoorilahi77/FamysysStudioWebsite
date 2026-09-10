/**
 * Where it is recorded that a message about an enquiry was accepted for delivery.
 *
 * A stamp is written only when the mail provider accepted that message, so an enquiry
 * nobody was told about is one whose stamp is still empty.
 */
export interface InquiryDeliveryLog {
  markNotified(id: string): Promise<void>;
  markAcknowledged(id: string): Promise<void>;
}

import type { InquiryMailer, ReceivedInquiry } from "../../domain/lead/services/InquiryMailer";
import { SITE_URL } from "../../shared/site/site";
import { mailConfiguration } from "../db/env";
import { sendMail, type InlineImage } from "./GraphMailer";
import { studioLogo } from "./studioLogo";
import { inquiryAcknowledgement } from "./templates/inquiryAcknowledgement";
import { inquiryNotification, type InquiryMailContent } from "./templates/inquiryNotification";

/**
 * The two enquiry messages, rendered and handed to Graph.
 *
 * THE REPLY-TO IS THE WHOLE POINT OF THE NOTIFICATION. It is the submitter's address, so
 * pressing Reply in the studio's inbox answers the person rather than the shared mailbox.
 * The acknowledgement has none: it is sent from the shared mailbox, and a reply to it is
 * already going to the right place.
 *
 * Both carry the wordmark as an inline attachment when the file can be read, and fall back
 * to a text wordmark when it cannot.
 */
export class GraphInquiryMailer implements InquiryMailer {
  async notifyStudio(inquiry: ReceivedInquiry): Promise<void> {
    const config = mailConfiguration();
    if (!config.enabled) {
      throw new Error("MAIL_ENABLED is false — the notifier must not be wired.");
    }
    const logo = logoParts();
    const { subject, html } = inquiryNotification(toMailContent(inquiry), {
      adminUrl: `${SITE_URL}/admin/inbox#inquiry-${encodeURIComponent(inquiry.id)}`,
      logoSrc: logo.src,
    });
    await sendMail({
      to: config.notifyTo,
      subject,
      body: html,
      contentType: "HTML",
      replyTo: inquiry.request.email.value,
      inlineImages: logo.images,
    });
  }

  async acknowledge(inquiry: ReceivedInquiry): Promise<void> {
    const logo = logoParts();
    const { subject, html } = inquiryAcknowledgement({
      fullName: inquiry.request.fullName?.value,
      logoSrc: logo.src,
    });
    await sendMail({
      to: inquiry.request.email.value,
      subject,
      body: html,
      contentType: "HTML",
      inlineImages: logo.images,
    });
  }
}

function logoParts(): { src: string | undefined; images: ReadonlyArray<InlineImage> } {
  const logo = studioLogo();
  return logo ? { src: `cid:${logo.contentId}`, images: [logo] } : { src: undefined, images: [] };
}

function toMailContent({ request, receivedAt }: ReceivedInquiry): InquiryMailContent {
  return {
    email: request.email.value,
    fullName: request.fullName?.value,
    companyName: request.companyName,
    companySize: request.companySize?.band,
    companyWebsite: request.companyWebsite?.value,
    role: request.role?.name,
    brief: request.brief?.value,
    receivedAt,
  };
}

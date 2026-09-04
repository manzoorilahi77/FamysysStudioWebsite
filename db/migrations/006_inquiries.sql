-- CONTACT FORM SUBMISSIONS.
--
-- One entity, two forms: the homepage closing form asks four questions, /contact asks
-- eight. The three fields only /contact collects are NULL here rather than empty strings,
-- because an empty string is a question the sender declined and NULL is a question that
-- was never asked -- the same distinction DemoRequest makes in the domain.
--
-- `forwarded_at` and `forward_error` exist for a feature that is not built. Email
-- forwarding is a later phase, and the requirement was that adding it be a hook rather
-- than a rewrite: the row is written first and a forwarder stamps it afterwards, so a
-- mail outage can never cost a lead. Nothing writes these columns yet.
--
-- No IP address and no user agent. Neither is needed to answer an enquiry, and storing
-- personal data that has no use is a liability rather than a feature.

CREATE TABLE IF NOT EXISTS inquiries (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name       VARCHAR(191)  NOT NULL,
  email           VARCHAR(191)  NOT NULL,
  company_name    VARCHAR(191)  NOT NULL,
  company_size    VARCHAR(64)   NOT NULL COMMENT 'The band the sender chose, as CompanySize validated it.',
  company_website VARCHAR(255)  NULL COMMENT 'NULL when the form did not ask.',
  contact_role    VARCHAR(191)  NULL COMMENT 'NULL when the form did not ask.',
  project_brief   TEXT          NULL COMMENT 'NULL when the form did not ask.',
  source_form     ENUM('home','contact') NOT NULL DEFAULT 'contact',
  status          ENUM('new','read','archived') NOT NULL DEFAULT 'new',
  received_at     DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  read_at         DATETIME(3)   NULL,
  archived_at     DATETIME(3)   NULL,
  forwarded_at    DATETIME(3)   NULL COMMENT 'Reserved for the email-forwarding phase. Never written yet.',
  forward_error   TEXT          NULL COMMENT 'Reserved for the email-forwarding phase. Never written yet.',
  PRIMARY KEY (id),
  KEY ix_inquiries_inbox (status, received_at),
  KEY ix_inquiries_received (received_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

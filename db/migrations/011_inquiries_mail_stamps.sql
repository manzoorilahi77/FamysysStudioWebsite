-- AN ENQUIRY RECORDS WHETHER ANYONE WAS TOLD ABOUT IT.
--
-- 006 reserved `forwarded_at` and `forward_error` for an email phase that had not been
-- built. It is built now, and it sends two messages rather than one: a notification to the
-- studio and an acknowledgement to the person who wrote in. Each can fail on its own — the
-- commonest acknowledgement failure is an address the visitor mistyped — so each gets its
-- own stamp:
--
--   notified_at   when Microsoft Graph accepted the notification to MAIL_NOTIFY_TO
--   ack_sent_at   when Graph accepted the acknowledgement to the sender
--
-- NULL means "not accepted", whether because mail is switched off, because the send failed,
-- or because the row predates this migration. An enquiry nobody was told about is then
-- `WHERE notified_at IS NULL` rather than a line in a log nobody greps.
--
-- `forward_error` is dropped rather than repurposed. The failure is logged, with the row id
-- and nothing else, and the table is read by more people than the log is: an error string
-- from Microsoft can quote a recipient address back, and that address is the visitor's.
--
-- One ALTER, so the three changes land together or not at all. `CHANGE` rather than
-- `RENAME COLUMN` because the comment has to change with the name — the old one says the
-- column is never written.
--
-- These columns are written by a background task after the response has gone. Nothing here
-- touches `status`, `read_at` or `archived_at`: a stamp is a fact about mail, not a sign
-- that a person opened the enquiry.

ALTER TABLE inquiries
  CHANGE COLUMN forwarded_at notified_at DATETIME(3) NULL
    COMMENT 'When Graph accepted the notification to MAIL_NOTIFY_TO. NULL = not sent.',
  ADD COLUMN ack_sent_at DATETIME(3) NULL
    COMMENT 'When Graph accepted the acknowledgement to the sender. NULL = not sent.'
    AFTER notified_at,
  DROP COLUMN forward_error;

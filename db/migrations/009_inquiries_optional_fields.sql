-- EMAIL BECOMES THE ONLY ANSWER AN ENQUIRY HAS TO CARRY.
--
-- 006 created `inquiries` when both forms required a name, a company and a size, so all
-- three were NOT NULL and the schema was an accurate description of what could arrive.
-- Both forms now ask for an email and nothing else: everything beside it is optional, and
-- a sender who fills in only the address they can be reached at submits successfully.
--
-- This migration does two things, and the second is the one that would break the live site
-- if it were left out.

-- ---------------------------------------------------------------------------------------
-- 1. THE THREE COLUMNS BECOME NULLABLE.
--
-- For the same reason `company_website`, `contact_role` and `project_brief` already were:
-- NULL is a question the sender did not answer, an empty string would be an answer of
-- nothing, and the inbox has to tell those apart. `DbLeadRepository` writes NULL, never "".
--
-- `email` stays NOT NULL. It is the one field without which the enquiry cannot be answered,
-- and the only one both the forms and `DemoRequest` still insist on.
--
-- Existing rows are untouched and stay valid: widening NOT NULL to NULL rejects nothing
-- that was already stored, so there is no backfill. Reversing it would not be as cheap —
-- any row written after this with a NULL in one of the three would block a return to
-- NOT NULL until it was filled in or deleted.
-- ---------------------------------------------------------------------------------------

ALTER TABLE inquiries
  MODIFY COLUMN full_name    VARCHAR(191) NULL
    COMMENT 'NULL when the sender did not give a name. Only email is required.',
  MODIFY COLUMN company_name VARCHAR(191) NULL
    COMMENT 'NULL when the sender did not give a company. Only email is required.',
  MODIFY COLUMN company_size VARCHAR(64)  NULL
    COMMENT 'The band the sender chose, as CompanySize validated it. NULL when they chose none.';

-- ---------------------------------------------------------------------------------------
-- 2. THE CONTACT FORM'S LABELS ARE RENUMBERED, AND THE SEED CANNOT DO IT.
--
-- The form went from eight fields to five: the first/last name pair became one "Full name",
-- and "Company website" and "Your role" are no longer asked. `contact:form` stores those
-- labels as a POSITIONAL list — `field-labels-0` through `field-labels-7`, read back in
-- `sort_order` and mapped to fields by index in `DbContactRepository`.
--
-- So the positions do not merely shrink, they SHIFT. Position 0 was "First name" and is now
-- the full-name field; position 1 was "Last name" and is now the email. Left alone, the
-- live page would render five real labels against five different boxes — "First name" over
-- the name field is nearly right, "Last name" over the email field is not — with nothing
-- failing anywhere to say so.
--
-- `npm run db:seed` cannot fix this. Its upsert deliberately refreshes what a field IS and
-- never what it SAYS, precisely so a re-seed cannot revert the client's edits, and it has
-- no DELETE at all — so the three dropped rows would linger and the five kept ones would
-- keep their old text. `--force` would fix these five by resetting EVERY string in the
-- database, which is not a thing to do to a live site over five labels.
--
-- Hence: written here, scoped to the eleven rows that actually changed. This is a
-- structural renumbering rather than a content revert — the old values do not describe the
-- new fields, so there is no edit here worth preserving. `version` is bumped so the panel
-- treats these as changed and any draft written against the old version conflicts loudly
-- instead of silently overwriting.
-- ---------------------------------------------------------------------------------------

UPDATE content_strings SET value = 'Full name',                       version = version + 1
  WHERE owner_key = 'contact:form' AND field_key = 'field-labels-0';
UPDATE content_strings SET value = 'Work email',                      version = version + 1
  WHERE owner_key = 'contact:form' AND field_key = 'field-labels-1';
UPDATE content_strings SET value = 'Company',                         version = version + 1
  WHERE owner_key = 'contact:form' AND field_key = 'field-labels-2';
UPDATE content_strings SET value = 'Company size',                    version = version + 1
  WHERE owner_key = 'contact:form' AND field_key = 'field-labels-3';
UPDATE content_strings SET value = 'What are you trying to create?',  version = version + 1
  WHERE owner_key = 'contact:form' AND field_key = 'field-labels-4';

-- The three labels the form no longer has, and the "(optional)" suffix that hung off the
-- one optional field back when there was exactly one. Four of the five fields are optional
-- now, so the form marks none of them and marks the required one instead — see `FieldShell`.
DELETE FROM content_strings
  WHERE owner_key = 'contact:form'
    AND field_key IN ('field-labels-5', 'field-labels-6', 'field-labels-7', 'optional-suffix');

-- Unpublished drafts against any of those four are drafts of fields that no longer exist.
-- They cannot be published and would sit in the panel as permanent pending edits.
DELETE FROM content_drafts
  WHERE owner_key = 'contact:form'
    AND field_key IN ('field-labels-5', 'field-labels-6', 'field-labels-7', 'optional-suffix');

-- THE FOOTER'S DESCRIPTOR LINE IS REMOVED, AND THREE READ-ONLY MIRRORS ARE CORRECTED.
--
-- Same shape of problem as 009, for the same reason: `npm run db:seed` refreshes what a
-- field IS and never what it SAYS — deliberately, so a re-seed cannot revert the client's
-- edits — and it has no DELETE at all. A field that leaves the content files therefore
-- lingers in `content_strings` until something says otherwise, and a read-only value whose
-- text is COMPUTED from other content keeps whatever it computed to on the day it was
-- seeded. Both need saying here.

-- ---------------------------------------------------------------------------------------
-- 1. THE DESCRIPTOR IS GONE.
--
-- "AI-Enabled Creative Production Partner" sat under the copyright as the Studio's answer
-- to the parent's "AI-Native Digital Engineering Partner". It was drafted copy pending an
-- approval that never came, and it was the only reason the footer carried a closing row
-- under its columns. The line is removed from the footer, and the field with it — from the
-- entity, the content file, the view model and the panel — because a CMS field offering to
-- edit a line that renders nowhere is worse than no field at all.
--
-- Its row goes too. Left behind it would be an orphan the panel could still list.
-- ---------------------------------------------------------------------------------------

DELETE FROM content_strings
  WHERE owner_key = 'home:footer' AND field_key = 'descriptor-line';

DELETE FROM content_drafts
  WHERE owner_key = 'home:footer' AND field_key = 'descriptor-line';

-- ---------------------------------------------------------------------------------------
-- 2. THREE MIRRORS THAT HAVE BEEN LYING SINCE THE FOOTER WAS REBUILT.
--
-- These are read-only values in the panel's "Fixed for now" group. Their text is not copy
-- — it is a SUMMARY of other content, computed when the record is built: the address
-- joined with commas, and the counts of the legal and social lists. The rebuild that gave
-- the footer a printed address and a third legal link changed all three, and the seed's
-- deliberate refusal to overwrite values meant the database kept the old summaries.
--
-- So the panel currently tells the client the footer prints no postal address, and that it
-- has zero legal links and zero social links, while the live footer beneath it prints an
-- address and six links. Nothing failed, because nothing checks a mirror against the thing
-- it mirrors — which is exactly why this is worth correcting by hand rather than waiting
-- for it to be noticed.
--
-- There is no edit here to preserve: these values are not writable in the panel, so the
-- only text they have ever held is text the seed computed.
-- ---------------------------------------------------------------------------------------

UPDATE content_strings
   SET value = '10193 W Grand Parkway S., Ste. 103-229, Richmond,, Texas 77447 United States',
       version = version + 1
 WHERE owner_key = 'home:footer' AND field_key = 'postal-address';

UPDATE content_strings SET value = '3', version = version + 1
 WHERE owner_key = 'home:footer' AND field_key = 'legal-links';

UPDATE content_strings SET value = '3', version = version + 1
 WHERE owner_key = 'home:footer' AND field_key = 'social-links';

/** Longest first name a greeting will print. A longer "first name" is not one. */
const GREETING_NAME_MAX = 24;

/**
 * The first word of a name, fit to greet someone with — or undefined.
 *
 * ONLY LETTERS, APOSTROPHES AND HYPHENS, AND ONLY ONE WORD. The acknowledgement email goes
 * to whatever address was typed into an anonymous form, so anything it echoes is text a
 * stranger chose, sent from the studio's domain. A first name is worth that — "Thanks,
 * Shafwan." reads as a person, not an autoresponder — but nothing longer is: no spaces,
 * no digits, no punctuation that could carry a link or a sentence.
 *
 * Shared, so the confirmation on the page and the email in the inbox greet the same way.
 */
export function greetingName(fullName: string | undefined): string | undefined {
  const first = fullName?.trim().split(/\s+/)[0] ?? "";
  const cleaned = first.replace(/[^\p{L}\p{M}'’-]/gu, "");
  if (!/\p{L}/u.test(cleaned) || cleaned.length > GREETING_NAME_MAX) return undefined;
  return cleaned;
}

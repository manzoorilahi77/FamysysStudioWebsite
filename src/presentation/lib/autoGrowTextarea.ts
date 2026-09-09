/**
 * Sizes a textarea to the text inside it.
 *
 * WHY A MEASUREMENT RATHER THAN A ROW COUNT. A `rows` value guessed from the character
 * count — which is what the admin's fields did — is a guess about how many characters fit
 * on a line, and that number is a function of the box's width. At 1440 the panel's fields
 * are about 90 characters wide and the guess is right; on a 390px phone they are about 34,
 * so a paragraph that "needs three rows" needs eight, and the reader writes into a window
 * a third the height of what they are writing. `scrollHeight` is the browser answering the
 * same question with the real width in hand.
 *
 * HEIGHT IS RESET TO `auto` FIRST, and that line is the whole trick: `scrollHeight` never
 * reports less than the element's current height, so without the reset the box can only
 * ever grow and deleting a paragraph leaves the hole it was in.
 *
 * The CSS `min-height` on each caller is what keeps the resting size — this only ever
 * makes a box taller than its floor, never shorter.
 */
export function autoGrowTextarea(element: HTMLTextAreaElement | null): void {
  if (!element) {
    return;
  }
  element.style.height = "auto";
  element.style.height = `${element.scrollHeight}px`;
}

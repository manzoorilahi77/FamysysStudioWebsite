import { restoreContentSnapshot } from "./support/content";

/**
 * The working tree goes back to what it was, whether the run passed or failed. A failed run
 * is exactly when a half-published string is most likely to be sitting in a content module,
 * and exactly when nobody is looking for it.
 */
export default async function globalTeardown(): Promise<void> {
  restoreContentSnapshot();
}

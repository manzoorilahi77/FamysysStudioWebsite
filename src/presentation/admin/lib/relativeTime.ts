/**
 * Relative timestamps for the admin's right-hand column, in the shortest form that is
 * still unambiguous. A missing date prints an em dash rather than "unknown": the column
 * is scanned, not read, and a word there would draw more attention than the value
 * deserves. See `contentSources.ts` for why a date can be missing at all.
 */

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

const MISSING = "—";

function plural(count: number, unit: string): string {
  return `${count} ${unit}${count === 1 ? "" : "s"} ago`;
}

export function relativeTime(date: Date | null, now: Date = new Date()): string {
  if (date === null) {
    return MISSING;
  }

  const elapsed = now.getTime() - date.getTime();
  if (elapsed < MINUTE) {
    return "Just now";
  }
  if (elapsed < HOUR) {
    return plural(Math.floor(elapsed / MINUTE), "minute");
  }
  if (elapsed < DAY) {
    return plural(Math.floor(elapsed / HOUR), "hour");
  }
  if (elapsed < WEEK) {
    return plural(Math.floor(elapsed / DAY), "day");
  }
  if (elapsed < MONTH) {
    return plural(Math.floor(elapsed / WEEK), "week");
  }
  if (elapsed < YEAR) {
    return plural(Math.floor(elapsed / MONTH), "month");
  }
  return plural(Math.floor(elapsed / YEAR), "year");
}

const BYTES_PER_KB = 1024;

/** File sizes for the media library, to one decimal place above a kilobyte. */
export function fileSize(bytes: number): string {
  if (bytes < BYTES_PER_KB) {
    return `${bytes} B`;
  }
  const kilobytes = bytes / BYTES_PER_KB;
  if (kilobytes < BYTES_PER_KB) {
    return `${kilobytes.toFixed(1)} kB`;
  }
  return `${(kilobytes / BYTES_PER_KB).toFixed(1)} MB`;
}

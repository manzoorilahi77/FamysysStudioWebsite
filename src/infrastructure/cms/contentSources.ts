import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * WHERE THE ADMIN'S TIMESTAMPS COME FROM.
 *
 * The content is TypeScript modules, not database rows, so no record carries an
 * "updated at" of its own. The nearest true thing is when the file a record is read from
 * last changed on disk, which is what every timestamp in the admin panel is: one mtime
 * per content file, shared by every record that file supplies.
 *
 * It is a filesystem read at render time, which is why the panel is development-only in
 * more than one sense — a static export has no source tree beside it. Every lookup
 * therefore returns `null` rather than throwing when the file is not there, and the UI
 * prints an em dash for a missing timestamp.
 */
const CONTENT_ROOT = "src/infrastructure/content/static";

export const CONTENT_FILE = {
  marketing: "marketing.content.ts",
  services: "services.content.ts",
  creativeServices: "creative-services.content.ts",
  howWeWork: "how-we-work.content.ts",
  waysToWork: "ways-to-work.content.ts",
  portfolio: "portfolio.content.ts",
  selectedWork: "selected-work.content.ts",
  about: "about.content.ts",
  contact: "contact.content.ts",
} as const;

export type ContentFile = (typeof CONTENT_FILE)[keyof typeof CONTENT_FILE];

/** The file's last-modified time, or `null` when it cannot be read. */
export function contentModifiedAt(file: ContentFile): Date | null {
  try {
    return statSync(join(process.cwd(), CONTENT_ROOT, file)).mtime;
  } catch {
    return null;
  }
}

export interface MediaFileStat {
  readonly name: string;
  readonly byteSize: number;
  readonly modifiedAt: Date | null;
}

/** Every file in `public/media`, sorted by name. Empty when the directory is unreadable. */
export function readMediaDirectory(directory: string): ReadonlyArray<MediaFileStat> {
  const absolute = join(process.cwd(), directory);
  let names: ReadonlyArray<string>;
  try {
    names = readdirSync(absolute).sort();
  } catch {
    return [];
  }

  return names.flatMap((name) => {
    try {
      const stats = statSync(join(absolute, name));
      if (!stats.isFile()) {
        return [];
      }
      return [{ name, byteSize: stats.size, modifiedAt: stats.mtime }];
    } catch {
      return [];
    }
  });
}

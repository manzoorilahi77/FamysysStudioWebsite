import { readFileSync } from "node:fs";
import path from "node:path";
import type { InlineImage } from "./GraphMailer";

/**
 * THE STUDIO'S WORDMARK, FOR THE HEADER OF EVERY EMAIL.
 *
 * The canvas-tinted file, because the header band is the site's dark ground in both light
 * and dark mail clients — the same pairing the site header uses (see `Wordmark`). It is read
 * from public/brand, which ships with every release, so a re-cut logo reaches the mail
 * without a code change.
 *
 * READ ONCE, AND OPTIONAL. The bytes are cached for the life of the process. If the file
 * cannot be read the templates fall back to a text wordmark: a missing logo is not a reason
 * for an enquiry to go unannounced.
 */
export const LOGO_CONTENT_ID = "famysys-studio-logo";
const LOGO_FILE = path.join(process.cwd(), "public", "brand", "famysys-studio-logo-canvas.png");

let cached: InlineImage | null | undefined;

export function studioLogo(): InlineImage | undefined {
  if (cached === undefined) {
    try {
      cached = {
        contentId: LOGO_CONTENT_ID,
        name: "famysys-studio.png",
        contentType: "image/png",
        contentBytes: readFileSync(LOGO_FILE).toString("base64"),
      };
    } catch {
      cached = null;
    }
  }
  return cached ?? undefined;
}

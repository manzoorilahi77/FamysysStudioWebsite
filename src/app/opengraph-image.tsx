import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { colors } from "../shared/design/colors";

/**
 * The card a link to this site shows in a feed, a chat or a search preview.
 *
 * Defined at the root of the app directory, so every route inherits it: seven public
 * pages, one card. A per-page card would need per-page artwork or the page's title set in
 * type, and the second of those is the reason there is no text here at all — satori, which
 * renders this, has no access to Jost. next/font downloads it into the build cache in a
 * form this cannot read, and fetching it from Google at build time makes the card depend
 * on a network call that has nothing to do with the site. Rather than ship the studio's
 * name set in a typeface the brand does not use, the card is the wordmark on the brand's
 * dark ground and nothing else — which is what the wordmark is for.
 *
 * The logo is inlined as a data URI because satori resolves no relative URLs: it renders
 * to an image with no document and no origin to resolve against.
 *
 * `force-static` — the card is identical for every request, forever. It is generated once
 * per build and served as a file.
 */
export const dynamic = "force-static";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Famysys Studio";

export default async function openGraphImage() {
  const logo = readFileSync(
    join(process.cwd(), "public", "brand", "famysys-studio-logo-canvas.png"),
  );

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.darkBackground,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- satori renders plain
            elements; next/image has no meaning inside an ImageResponse. */}
      <img
        src={`data:image/png;base64,${logo.toString("base64")}`}
        alt=""
        width={636}
        height={192}
      />
    </div>,
    size,
  );
}

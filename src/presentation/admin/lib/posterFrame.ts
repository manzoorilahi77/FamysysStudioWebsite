/**
 * A VIDEO'S FIRST USABLE STILL, TAKEN IN THE BROWSER THAT IS ABOUT TO UPLOAD IT.
 *
 * `MediaRef` will not build a video reference without a poster, and it is right not to: a
 * video with no still is a black rectangle in a slot the design fills with a photograph, for
 * as long as the first frame takes to arrive. So a poster is not a nicety to add later — it
 * is half of what makes the upload valid, and it has to come from somewhere.
 *
 * IT IS TAKEN HERE, AND NOT ON THE SERVER, because the server would need `ffmpeg`. This
 * deploys to shared hosting behind PM2, and a native binary dependency — installed,
 * versioned and kept working on a host nobody controls — is a large permanent cost for one
 * JPEG. The browser already has a video decoder, and it is already holding the file.
 *
 * NOT FRAME ZERO. Video very often opens on black, on a slate, or on a fade from one, and a
 * poster of black is worse than no poster in every way except validity. A second in is far
 * more likely to be a picture of something. Short clips fall back to their midpoint, which
 * is the same idea for a file that has no "a second in".
 *
 * EVERY FAILURE RETURNS NULL rather than throwing: a codec the browser will not decode, a
 * canvas the browser will not read back, a seek that never fires. The caller then refuses the
 * whole replacement, which is the honest outcome — the alternative is a video saved without
 * the still that makes it legal.
 */

/** Where the still is taken from, in seconds, in the order they are tried. */
export const FRAME_OFFSETS: ReadonlyArray<number> = [1, 3, 0.2, 6];

/** Enough for a poster at the sizes these slots render, without shipping the whole frame. */
const JPEG_QUALITY = 0.82;

/** A seek or a load that never resolves must not leave the panel saying "Uploading…" forever. */
const TIMEOUT_MS = 10_000;

function once(target: HTMLVideoElement, event: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`The video never reported "${event}".`));
    }, TIMEOUT_MS);

    const onDone = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("The browser could not decode that video."));
    };
    const cleanup = () => {
      clearTimeout(timer);
      target.removeEventListener(event, onDone);
      target.removeEventListener("error", onError);
    };

    target.addEventListener(event, onDone, { once: true });
    target.addEventListener("error", onError, { once: true });
  });
}

/**
 * `attempt` picks which of `FRAME_OFFSETS` to try, so "use a different frame" is the same
 * call with the next number rather than a second code path.
 */
export async function grabPosterFrame(file: File, attempt = 0): Promise<Blob | null> {
  const objectUrl = URL.createObjectURL(file);
  const video = document.createElement("video");

  try {
    video.src = objectUrl;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";

    await once(video, "loadedmetadata");
    if (!video.videoWidth || !video.videoHeight) return null;

    const wanted = FRAME_OFFSETS[attempt % FRAME_OFFSETS.length] ?? FRAME_OFFSETS[0] ?? 1;
    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    // A clip shorter than the offset is seeked to its middle instead of past its end, where
    // the seek would either clamp or never fire depending on the browser.
    video.currentTime = duration > wanted ? wanted : duration / 2;
    await once(video, "seeked");

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    return await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
    });
  } catch {
    return null;
  } finally {
    // The element is dropped and the blob URL released either way: a few of these left
    // behind in a long editing session is real memory held by a decoded video.
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(objectUrl);
  }
}

export function isVideoFile(file: File): boolean {
  return file.type.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(file.name);
}

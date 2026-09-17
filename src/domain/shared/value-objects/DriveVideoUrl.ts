import { DomainError } from "../errors/DomainError";

export class InvalidDriveVideoUrlError extends DomainError {
  readonly code = "INVALID_DRIVE_VIDEO_URL";

  constructor(value: string) {
    super(
      `"${value}" is not a Google Drive file link. Paste the share link for a Drive video ` +
        `— it looks like https://drive.google.com/file/d/<id>/view or .../open?id=<id>.`,
    );
  }
}

/** Mirrors VideoGallery.tsx's own `driveFileId()` — same two shapes, same precedence. */
function driveFileId(value: string): string | null {
  const fileMatch = value.match(/\/file\/d\/([^/?#]+)/);
  if (fileMatch?.[1]) return fileMatch[1];
  const openMatch = value.match(/[?&]id=([^&]+)/);
  return openMatch?.[1] ?? null;
}

export class DriveVideoUrl {
  private constructor(private readonly fileId: string) {}

  static create(value: string): DriveVideoUrl {
    const trimmed = value.trim();
    const fileId = trimmed ? driveFileId(trimmed) : null;
    if (!fileId) {
      throw new InvalidDriveVideoUrlError(value);
    }
    return new DriveVideoUrl(fileId);
  }

  toString(): string {
    return `https://drive.google.com/file/d/${this.fileId}/preview`;
  }
}

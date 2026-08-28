import { InvalidMediaRefError } from "../errors/ValueObjectErrors";
import { Url } from "./Url";

export type MediaKind = "image" | "video";
export type AspectRatio = "16:9" | "4:3" | "1:1" | "3:4";

export interface MediaRefProps {
  readonly kind: MediaKind;
  readonly src: string;
  readonly alt: string;
  readonly aspectRatio: AspectRatio;
  readonly poster?: string;
}

export class MediaRef {
  private constructor(
    readonly kind: MediaKind,
    readonly src: Url,
    readonly alt: string,
    readonly aspectRatio: AspectRatio,
    readonly poster: Url | undefined,
  ) {}

  static create(props: MediaRefProps): MediaRef {
    const alt = props.alt.trim();
    if (!alt) {
      throw new InvalidMediaRefError("alt text is required.");
    }
    if (props.kind === "video" && !props.poster) {
      throw new InvalidMediaRefError("video media requires a poster image.");
    }
    const src = Url.create(props.src);
    const poster = props.poster ? Url.create(props.poster) : undefined;
    return new MediaRef(props.kind, src, alt, props.aspectRatio, poster);
  }
}

"use client";

import { useEffect, useRef } from "react";
import type { MediaView } from "../lib/viewModels";

interface AutoplayVideoProps {
  readonly media: MediaView;
  readonly className?: string;
}

/** Muted, looping, autoplaying placeholder video that pauses itself once it leaves the viewport. */
export function AutoplayVideo({ media, className = "" }: AutoplayVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const node = videoRef.current;
    if (!node) {
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry) {
        return;
      }
      if (entry.isIntersecting) {
        void node.play();
      } else {
        node.pause();
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      className={className}
      muted
      playsInline
      loop
      autoPlay
      preload="metadata"
      poster={media.poster}
      aria-label={media.alt}
    >
      <source src={media.src} type="video/mp4" />
    </video>
  );
}

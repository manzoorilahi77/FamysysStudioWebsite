"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { ShowreelClipView } from "../lib/viewModels";
import { Container } from "../components/Container";
import { ModalPlayer } from "../components/ModalPlayer";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";

interface StoryCardProps {
  readonly story: ShowreelClipView;
  readonly index: number;
}

function StoryCard({ story, index }: StoryCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const labelId = `story-${index}-label`;

  return (
    <Reveal index={index}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        className="card-surface-dark relative block w-full overflow-hidden p-4 text-left"
        aria-haspopup="dialog"
      >
        <div style={{ aspectRatio: "16 / 9" }} className="relative overflow-hidden rounded-sm">
          {story.media.poster ? (
            <Image
              src={story.media.poster}
              alt={story.media.alt}
              fill
              style={{ objectFit: "cover" }}
              loading="lazy"
            />
          ) : null}
          <span
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: "var(--color-ink-40)" }}
          >
            <span className="label rounded-sm bg-canvas px-4 py-2 text-ink">Play video</span>
          </span>
        </div>
        <p className="label mt-4 text-canvas-80">{story.client}</p>
        <p className="text-display-s mt-2 font-medium text-canvas">{story.quote}</p>
      </button>
      <h3 id={labelId} className="sr-only">
        {story.client} showreel
      </h3>
      <ModalPlayer
        media={story.media}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        labelId={labelId}
        triggerRef={triggerRef}
      />
    </Reveal>
  );
}

interface FeaturedStoriesProps {
  readonly stories: ReadonlyArray<ShowreelClipView>;
}

export function FeaturedStories({ stories }: FeaturedStoriesProps) {
  return (
    <Section dark ariaLabel="Featured stories">
      <Container className="grid gap-8 lg:grid-cols-2">
        {stories.map((story, index) => (
          <StoryCard key={story.client} story={story} index={index} />
        ))}
      </Container>
    </Section>
  );
}

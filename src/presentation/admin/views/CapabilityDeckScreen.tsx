"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { CapabilityDeckDocument } from "../../../domain/capability-deck/entities/CapabilityDeckDocument";
import { AdminScreen } from "../components/AdminScreen";

interface CapabilityDeckScreenProps {
  readonly deck: CapabilityDeckDocument;
  readonly canChangeSlides: boolean;
}

export function CapabilityDeckScreen({ deck, canChangeSlides }: CapabilityDeckScreenProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const call = useCallback(
    async (url: string, method: string, body: unknown) => {
      setBusy(true);
      setMessage(null);
      const response = await fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
      const result = (await response?.json().catch(() => null)) as { ok?: boolean; message?: string } | null;
      setBusy(false);
      if (!response?.ok) {
        setMessage(result?.message ?? "That did not work.");
        return;
      }
      router.refresh();
    },
    [router],
  );

  const addSlide = useCallback(
    (slideKey: string) => call("/admin/api/capability-deck/slides", "POST", { slideKey, afterSlideId: deck.slides.at(-1)?.id ?? null }),
    [call, deck.slides],
  );
  const removeSlide = useCallback(
    (slideId: string, label: string) => {
      const typed = window.prompt(`Removing "${label}" from the deck cannot be undone from here without re-adding it. Type its name to confirm:`);
      if (typed?.trim() !== label.trim()) return;
      return call("/admin/api/capability-deck/slides", "DELETE", { slideId });
    },
    [call],
  );
  const reorder = useCallback(
    (orderedSlideIds: ReadonlyArray<string>) => call("/admin/api/capability-deck/slides", "PATCH", { orderedSlideIds }),
    [call],
  );

  return (
    <AdminScreen
      breadcrumb={[{ label: "Capability Deck" }]}
      heading="Capability Deck"
      description="The slides shown at /capability-deck, in the order they play. A slide's own text, images, videos and website embeds are edited on its own screen — this list is only what is in the deck, and in what order."
    >
      {message ? <p role="status" className="text-small mb-4 text-accent">{message}</p> : null}

      <ul className="flex flex-col gap-3">
        {deck.slides.map((slide, index) => (
          <li key={slide.id} className="flex items-center gap-3 rounded-sm border border-ink-12 bg-card px-4 py-3">
            <a href={`/admin/capability-deck/${slide.id}`} className="min-w-0 flex-1 text-small text-ink hover:underline">
              {slide.title}
              {slide.status === "draft" ? <span className="label ml-2 rounded-sm border border-accent px-2 py-0.5 text-accent">Unpublished</span> : null}
            </a>
            {canChangeSlides && index > 0 ? (
              <button type="button" disabled={busy} aria-label={`Move ${slide.title} earlier`} className="text-small px-1 text-graphite-70 hover:text-ink"
                onClick={() => {
                  const ids = deck.slides.map((s) => s.id);
                  [ids[index - 1], ids[index]] = [ids[index]!, ids[index - 1]!];
                  void reorder(ids);
                }}>↑</button>
            ) : null}
            {canChangeSlides && index < deck.slides.length - 1 ? (
              <button type="button" disabled={busy} aria-label={`Move ${slide.title} later`} className="text-small px-1 text-graphite-70 hover:text-ink"
                onClick={() => {
                  const ids = deck.slides.map((s) => s.id);
                  [ids[index], ids[index + 1]] = [ids[index + 1]!, ids[index]!];
                  void reorder(ids);
                }}>↓</button>
            ) : null}
            {canChangeSlides ? (
              <button type="button" disabled={busy} className="text-small text-graphite-70 hover:text-accent" onClick={() => void removeSlide(slide.id, slide.title)}>
                Remove
              </button>
            ) : null}
          </li>
        ))}
      </ul>

      {canChangeSlides && deck.availableSlides.length > 0 ? (
        <div className="mt-8 border-t border-hairline pt-6">
          <h2 className="label text-ink">Add a slide</h2>
          <p className="text-small mt-2 max-w-[70ch] text-graphite-70">
            These slide types exist in the code but are not currently in the deck.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {deck.availableSlides.map((entry) => (
              <button key={entry.slideKey} type="button" disabled={busy} onClick={() => void addSlide(entry.slideKey)} className="text-small rounded-sm border border-ink-12 px-4 py-2 text-ink hover:bg-ink-4">
                Add {entry.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </AdminScreen>
  );
}

"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { DeckSlideTarget } from "../../../application/capability-deck/EditDeckSlide";
import type { CmsRecord } from "../../../domain/cms/entities/CmsRecord";
import { useDeckSlideEditor } from "../lib/useDeckSlideEditor";
import { DeckRecordFields } from "./DeckRecordFields";
import { PreviewFrame } from "./PreviewFrame";

interface DeckSlideEditorProps {
  readonly slide: CmsRecord;
  readonly target: DeckSlideTarget;
  readonly canPreviewDrafts: boolean;
  readonly canChangeBlocks: boolean;
}

const BUTTON = "text-small inline-flex min-h-11 items-center justify-center rounded-sm px-4 py-2 transition-colors duration-[180ms] disabled:cursor-default";
const PRIMARY = `${BUTTON} bg-ink text-canvas disabled:bg-ink-40`;
const SECONDARY = `${BUTTON} border border-ink-12 text-ink hover:bg-ink-4 disabled:text-ink-40`;

export function DeckSlideEditor({ slide, target, canPreviewDrafts, canChangeBlocks }: DeckSlideEditorProps) {
  const router = useRouter();
  const editor = useDeckSlideEditor(slide, target);
  const [previewing, setPreviewing] = useState(false);
  const previewButton = useRef<HTMLButtonElement>(null);

  const hasDrafts = slide.status === "draft";
  const busy = editor.status.kind === "busy";
  const saving = editor.status.kind === "busy" && editor.status.message === "Saving…";
  const publishBlocked = editor.isDirty;

  const setPreview = useCallback(async (enable: boolean) => {
    await fetch("/admin/api/preview", {
      method: "POST",
      headers: { "content-type": "application/json" },
      // No pageId/sectionId to give — this route only uses `target` for activity logging,
      // and logs nothing when it is absent (see app/admin/api/preview/route.ts). Draft
      // mode itself is not scoped to any one owner.
      body: JSON.stringify({ enable }),
    }).catch(() => undefined);
  }, []);

  const openPreview = useCallback(async () => { await setPreview(true); setPreviewing(true); }, [setPreview]);
  const closePreview = useCallback(async () => { setPreviewing(false); await setPreview(false); previewButton.current?.focus(); }, [setPreview]);
  const publish = useCallback(async () => { if (previewing) await closePreview(); await editor.publish(); }, [closePreview, editor, previewing]);
  const discard = useCallback(async () => {
    if (window.confirm("Throw away every unpublished edit on this slide? The site does not change — it has not seen them — but the edits themselves are gone.")) {
      await editor.discard();
    }
  }, [editor]);

  const addBlock = useCallback(async (collectionId: string, noun: string) => {
    const title = window.prompt(`Title for ${noun}:`)?.trim();
    if (!title) return;
    const summary = window.prompt("The one line that appears under the title:")?.trim();
    if (!summary) return;
    const response = await fetch("/admin/api/capability-deck/items", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ collectionId, title, summary }),
    }).catch(() => null);
    const result = (await response?.json().catch(() => null)) as { message?: string } | null;
    if (!response?.ok) { window.alert(result?.message ?? "That entry could not be added."); return; }
    router.refresh();
  }, [router]);

  const removeBlock = useCallback(async (collectionId: string, block: CmsRecord) => {
    const typed = window.prompt(`Removing "${block.title}" cannot be undone. Type its title to confirm:`);
    if (typed?.trim() !== block.title.trim()) return;
    const response = await fetch("/admin/api/capability-deck/items", {
      method: "DELETE", headers: { "content-type": "application/json" },
      body: JSON.stringify({ collectionId, itemId: block.id }),
    }).catch(() => null);
    const result = (await response?.json().catch(() => null)) as { message?: string } | null;
    if (!response?.ok) { window.alert(result?.message ?? "That entry could not be removed."); return; }
    router.refresh();
  }, [router]);

  const reorderBlocks = useCallback(async (collectionId: string, orderedItemIds: ReadonlyArray<string>) => {
    const response = await fetch("/admin/api/capability-deck/items", {
      method: "PATCH", headers: { "content-type": "application/json" },
      body: JSON.stringify({ collectionId, orderedItemIds }),
    }).catch(() => null);
    const result = (await response?.json().catch(() => null)) as { message?: string } | null;
    if (!response?.ok) { window.alert(result?.message ?? "That could not be reordered."); return; }
    router.refresh();
  }, [router]);

  return (
    <div>
      <div className="sticky top-0 z-10 -mx-4 mb-2 border-b border-hairline bg-canvas px-4 py-4 sm:-mx-10 sm:px-10">
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => void editor.save()} disabled={busy || !editor.isDirty} className={PRIMARY}>
            {saving ? "Saving…" : "Save draft"}
          </button>
          <button ref={previewButton} type="button" onClick={() => void (previewing ? closePreview() : openPreview())} disabled={busy} className={SECONDARY} aria-expanded={previewing}>
            {previewing ? "Close preview" : "Preview"}
          </button>
          <button type="button" onClick={() => void publish()} disabled={busy || !hasDrafts || publishBlocked} aria-describedby={publishBlocked ? "deck-publish-blocked" : undefined} className={SECONDARY}>
            Publish
          </button>
          {hasDrafts ? (
            <button type="button" onClick={() => void discard()} disabled={busy} className="text-small inline-flex min-h-11 items-center px-2 py-2 text-graphite-70 transition-colors duration-[180ms] hover:text-accent">
              Discard drafts
            </button>
          ) : null}
          <p className="text-small ml-auto text-ink-40">
            {editor.isDirty ? `${editor.changedCount} unsaved ${editor.changedCount === 1 ? "change" : "changes"}` : hasDrafts ? "Saved, not published" : "Everything here is live"}
          </p>
        </div>
        <p role="status" aria-live="polite" className={`text-small mt-3 ${editor.status.kind === "failed" ? "text-accent" : "text-graphite-70"}`}>
          {editor.status.kind === "idle" ? " " : editor.status.message}
        </p>
        {publishBlocked ? (
          <p id="deck-publish-blocked" className="text-small mt-2 max-w-[70ch] text-graphite-70">
            {hasDrafts
              ? "Publish is unavailable while there are unsaved changes. Save first, or discard the drafts."
              : "Publish is unavailable while there are unsaved changes. Nothing has been saved yet, so there is nothing for it to put live. Save first."}
          </p>
        ) : null}
      </div>

      {previewing ? (
        <PreviewFrame route="/capability-deck" sectionId={slide.id} canPreviewDrafts={canPreviewDrafts} onClose={() => void closePreview()} />
      ) : null}

      <div className="mt-8">
        <DeckRecordFields
          record={slide}
          editor={editor}
          {...(canChangeBlocks ? { onAdd: addBlock, onRemove: removeBlock, onReorder: reorderBlocks } : {})}
        />
      </div>
    </div>
  );
}

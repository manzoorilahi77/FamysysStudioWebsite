"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { CmsSectionTarget } from "../../../application/cms/EditCmsSection";
import type { CmsRecord } from "../../../domain/cms/entities/CmsRecord";
import { useSectionEditor } from "../lib/useSectionEditor";
import { PreviewFrame } from "./PreviewFrame";
import { RecordFields } from "./RecordFields";

/**
 * ONE SECTION, AND THE THREE THINGS THAT CAN HAPPEN TO IT.
 *
 * SAVE writes a draft. Nothing on the public site moves. PREVIEW shows the real page with
 * the drafts in it. PUBLISH puts them live. They are three buttons because they are three
 * decisions, and collapsing any two of them would take one of those decisions away from the
 * person making it.
 *
 * EVERY ACTION SAYS WHAT IT DID. Saving reports how many fields it wrote and that they are
 * not live; publishing reports how many pages were regenerated; a failure says what failed
 * and what to do about it, in the same place, and leaves the typing in the boxes.
 *
 * PUBLISH IS UNAVAILABLE WHILE THE FORM IS DIRTY, and that is the most important rule on
 * this screen. Publish moves the SAVED DRAFT to the live site; it knows nothing about what
 * is in the boxes. So pressing it with unsaved typing on screen puts the previous wording
 * live while the newer wording is still sitting in front of the person who wrote it — and
 * every signal they have says it worked. "Published. 1 change is now live" would be true,
 * about the wrong string. Nothing looks wrong, which is exactly what makes it the worst
 * failure this panel could have.
 *
 * Blocked rather than made to save first: a save can be REJECTED — a bad URL, a conflict —
 * and "Publish" that silently becomes "save, fail validation, publish something else" is
 * the same lie by a longer route. Save is one press away and says what it did.
 *
 * The bar is sticky. A section with eight cards open is several screens tall, and Save
 * being somewhere above the fold is how work gets lost.
 */

interface SectionEditorProps {
  readonly section: CmsRecord;
  readonly target: CmsSectionTarget;
  readonly route: string;
  readonly canPreviewDrafts: boolean;
  readonly canChangeBlocks: boolean;
}

const BUTTON =
  "text-small rounded-sm px-4 py-2 transition-colors duration-[180ms] disabled:cursor-default";
const PRIMARY = `${BUTTON} bg-ink text-canvas disabled:bg-ink-40`;
const SECONDARY = `${BUTTON} border border-ink-12 text-ink hover:bg-ink-4 disabled:text-ink-40`;

export function SectionEditor({
  section,
  target,
  route,
  canPreviewDrafts,
  canChangeBlocks,
}: SectionEditorProps) {
  const router = useRouter();
  const editor = useSectionEditor(section, target);
  const [previewing, setPreviewing] = useState(false);
  const previewButton = useRef<HTMLButtonElement>(null);

  const hasDrafts = section.status === "draft";
  const busy = editor.status.kind === "busy";
  const saving = editor.status.kind === "busy" && editor.status.message === "Saving…";
  // See the note at the top of this file: publishing over unsaved typing is silent.
  const publishBlocked = editor.isDirty;

  const setPreview = useCallback(async (enable: boolean) => {
    await fetch("/admin/api/preview", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ enable }),
    }).catch(() => undefined);
  }, []);

  const openPreview = useCallback(async () => {
    await setPreview(true);
    setPreviewing(true);
  }, [setPreview]);

  const closePreview = useCallback(async () => {
    setPreviewing(false);
    await setPreview(false);
    // Focus goes back to the control that opened it, which is where it came from.
    previewButton.current?.focus();
  }, [setPreview]);

  const publish = useCallback(async () => {
    if (previewing) await closePreview();
    await editor.publish();
  }, [closePreview, editor, previewing]);

  const discard = useCallback(async () => {
    if (
      window.confirm(
        "Throw away every unpublished edit on this section? The site does not change — it has not seen them — but the edits themselves are gone.",
      )
    ) {
      await editor.discard();
    }
  }, [editor]);

  // Adding and removing a card. Native prompts on purpose: they are keyboard-operable,
  // escapable and return focus without a focus trap of our own, and this is the one part of
  // the panel that is used rarely enough not to earn a custom dialog.
  const addBlock = useCallback(
    async (collectionId: string, noun: string) => {
      const title = window.prompt(`Title for ${noun}:`)?.trim();
      if (!title) return;
      const summary = window.prompt("The one line that appears under the title:")?.trim();
      if (!summary) return;

      const response = await fetch("/admin/api/records", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ collectionId, title, summary }),
      }).catch(() => null);
      const result = (await response?.json().catch(() => null)) as { message?: string } | null;
      if (!response?.ok) {
        window.alert(result?.message ?? "That block could not be added.");
        return;
      }
      router.refresh();
    },
    [router],
  );

  const removeBlock = useCallback(
    async (collectionId: string, block: CmsRecord) => {
      // Typing the title back, because a delete has no undo and no bin.
      const typed = window.prompt(
        `Removing "${block.title}" cannot be undone. Type its title to confirm:`,
      );
      if (typed?.trim() !== block.title.trim()) return;

      const response = await fetch("/admin/api/records", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ collectionId, recordId: block.id }),
      }).catch(() => null);
      const result = (await response?.json().catch(() => null)) as { message?: string } | null;
      if (!response?.ok) {
        window.alert(result?.message ?? "That block could not be removed.");
        return;
      }
      router.refresh();
    },
    [router],
  );

  if (section.note && section.groups.length === 0 && section.items.length === 0) {
    return (
      <p className="text-small max-w-[70ch] rounded-sm border border-ink-12 bg-card px-5 py-6 text-graphite-70">
        {section.note}
      </p>
    );
  }

  return (
    <div>
      {section.note ? (
        <p className="text-small mb-6 max-w-[70ch] rounded-sm border border-ink-12 bg-card px-5 py-4 text-graphite-70">
          {section.note}
        </p>
      ) : null}

      <div className="sticky top-0 z-10 -mx-10 mb-2 border-b border-hairline bg-canvas px-10 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void editor.save()}
            disabled={busy || !editor.isDirty}
            className={PRIMARY}
          >
            {saving ? "Saving…" : "Save draft"}
          </button>
          <button
            ref={previewButton}
            type="button"
            onClick={() => void (previewing ? closePreview() : openPreview())}
            disabled={busy}
            className={SECONDARY}
            aria-expanded={previewing}
          >
            {previewing ? "Close preview" : "Preview"}
          </button>
          <button
            type="button"
            onClick={() => void publish()}
            disabled={busy || !hasDrafts || publishBlocked}
            aria-describedby={publishBlocked ? "publish-blocked" : undefined}
            className={SECONDARY}
          >
            Publish
          </button>
          {hasDrafts ? (
            <button
              type="button"
              onClick={() => void discard()}
              disabled={busy}
              className="text-small px-2 py-2 text-graphite-70 transition-colors duration-[180ms] hover:text-accent"
            >
              Discard drafts
            </button>
          ) : null}

          <p className="text-small ml-auto text-ink-40">
            {editor.isDirty
              ? `${editor.changedCount} unsaved ${editor.changedCount === 1 ? "change" : "changes"}`
              : hasDrafts
                ? "Saved, not published"
                : "Everything here is live"}
          </p>
        </div>

        {/* One line, in the same place every time, whatever happened. `role="status"` so a
            screen reader hears it without the focus moving. */}
        <p
          role="status"
          aria-live="polite"
          className={`text-small mt-3 ${
            editor.status.kind === "failed" ? "text-accent" : "text-graphite-70"
          }`}
        >
          {editor.status.kind === "idle" ? " " : editor.status.message}
        </p>

        {/* Why Publish is greyed out, said in the place the eye is already looking. A
            disabled button with no reason beside it reads as a broken button. */}
        {publishBlocked ? (
          <p id="publish-blocked" className="text-small mt-2 max-w-[70ch] text-graphite-70">
            {hasDrafts
              ? "Publish is unavailable while there are unsaved changes. It would put the last saved draft on the site and leave what is in the boxes behind. Save first, or discard the drafts."
              : "Publish is unavailable while there are unsaved changes. Nothing has been saved yet, so there is nothing for it to put live. Save first."}
          </p>
        ) : null}
      </div>

      {previewing ? (
        <PreviewFrame
          route={route}
          heading={section.title}
          canPreviewDrafts={canPreviewDrafts}
          onClose={() => void closePreview()}
        />
      ) : null}

      <div className="mt-8">
        <RecordFields
          record={section}
          editor={editor}
          {...(canChangeBlocks ? { onAdd: addBlock, onRemove: removeBlock } : {})}
        />
      </div>
    </div>
  );
}

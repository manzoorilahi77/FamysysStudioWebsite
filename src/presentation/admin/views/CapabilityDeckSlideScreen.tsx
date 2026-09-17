import type { CmsRecord } from "../../../domain/cms/entities/CmsRecord";
import { AdminScreen } from "../components/AdminScreen";
import { DeckSlideEditor } from "../components/DeckSlideEditor";

interface CapabilityDeckSlideScreenProps {
  readonly slide: CmsRecord;
  readonly canPreviewDrafts: boolean;
  readonly canChangeBlocks: boolean;
}

export function CapabilityDeckSlideScreen({ slide, canPreviewDrafts, canChangeBlocks }: CapabilityDeckSlideScreenProps) {
  return (
    <AdminScreen
      breadcrumb={[{ label: "Capability Deck", href: "/admin/capability-deck" }, { label: slide.title }]}
      heading={slide.title}
      description="A slide of the Capability Deck, rendered at /capability-deck. Save writes a draft and changes nothing on the site; Preview shows the real deck with the draft applied; Publish puts it live."
    >
      <DeckSlideEditor
        key={String(slide.updatedAt?.getTime() ?? 0)}
        slide={slide}
        target={{ slideId: slide.id }}
        canPreviewDrafts={canPreviewDrafts}
        canChangeBlocks={canChangeBlocks}
      />
    </AdminScreen>
  );
}

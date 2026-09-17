import { notFound } from "next/navigation";
import { CapabilityDeckSlideScreen } from "../../../../../presentation/admin/views/CapabilityDeckSlideScreen";
import { adminContainer } from "../../../../../infrastructure/di/adminContainer";

export default async function CapabilityDeckSlidePage({ params }: { readonly params: Promise<{ readonly slide: string }> }) {
  const { slide: slideId } = await params;
  const deck = await adminContainer.capabilityDeck.getDeck();
  const slide = deck.slides.find((s) => s.id === slideId);
  if (!slide) notFound();

  return (
    <CapabilityDeckSlideScreen
      slide={slide}
      canPreviewDrafts={adminContainer.capabilityDeck.supportsDraftPreview}
      canChangeBlocks={adminContainer.capabilityDeck.supportsRecordChanges}
    />
  );
}

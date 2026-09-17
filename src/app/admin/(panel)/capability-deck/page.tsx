import { CapabilityDeckScreen } from "../../../../presentation/admin/views/CapabilityDeckScreen";
import { adminContainer } from "../../../../infrastructure/di/adminContainer";

export default async function CapabilityDeckPage() {
  const deck = await adminContainer.capabilityDeck.getDeck();
  return <CapabilityDeckScreen deck={deck} canChangeSlides={adminContainer.capabilityDeck.supportsRecordChanges} />;
}

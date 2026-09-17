import { contentSource } from "../db/env";
import { withStaticFallback } from "../db/fallback";
import { readDeckContentFromDatabase, readDeckContentFromFiles } from "../capability-deck/getCapabilityDeckContent";

/**
 * Wrapped in the same `withStaticFallback` every other repository in container.ts gets: a
 * database that cannot be REACHED hands this route over to the static files too, instead of
 * taking /capability-deck's prerender down while every other route survives the same outage.
 * See db/fallback.ts for why that fallback is deliberately narrow (a missing field still
 * throws) and container.ts for the same pattern applied to every other page's repositories.
 */
const database = withStaticFallback({ read: readDeckContentFromDatabase }, { read: readDeckContentFromFiles });

export async function getPublishedCapabilityDeck() {
  return contentSource() === "database" ? database.read() : readDeckContentFromFiles();
}

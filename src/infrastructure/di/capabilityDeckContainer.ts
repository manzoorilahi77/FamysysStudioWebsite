import { contentSource } from "../db/env";
import { DbCapabilityDeckRepository } from "../capability-deck/DbCapabilityDeckRepository";
import { StaticCapabilityDeckRepository } from "../capability-deck/StaticCapabilityDeckRepository";

/**
 * THE PUBLIC ROUTE'S OWN READ, kept apart from `adminContainer` for the same reason that
 * file is kept apart from `container`: this one is imported by `app/capability-deck/page.tsx`,
 * which every visitor's request runs, so it must not pull in anything the admin screens need
 * but a visitor's request should not pay for.
 *
 * It is also, deliberately, a SEPARATE instance from `adminContainer.capabilityDeck` rather
 * than a shared one — the two call sites have nothing to hand each other and constructing a
 * repository is cheap; sharing one would be a reason for the public route to import from
 * `infrastructure/di/adminContainer.ts`, which is reserved for `src/app/admin` by convention.
 */
const repository =
  contentSource() === "database" ? new DbCapabilityDeckRepository() : new StaticCapabilityDeckRepository();

/** What the public render needs: published-only content, in deck order, nothing about drafts. */
export async function getPublishedCapabilityDeck() {
  return repository.getDeck();
}

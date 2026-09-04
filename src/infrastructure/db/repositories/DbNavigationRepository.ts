import { createCta } from "../../../domain/shared/value-objects/Cta";
import type { NavPanelFeature } from "../../../domain/navigation/entities/NavPanel";
import type { NavigationMenu } from "../../../domain/navigation/entities/NavigationMenu";
import type { NavigationRepository } from "../../../domain/navigation/repositories/NavigationRepository";
import { StaticNavigationRepository } from "../../content/repositories/StaticNavigationRepository";
import { mediaFrom } from "../content/ContentStore";
import { capabilities, caseStudies, engagementTiers } from "./shared";

/**
 * THE MENU HAS NO COPY OF ITS OWN, and that is the whole design.
 *
 * Every name and every line in the three panels is read from the thing the panel points
 * at — a capability's title and descriptor, a tier's name and descriptor, a piece's title
 * and its one-line intent. That is why the menu cannot drift from the pages, and it is
 * why this repository is a substitution rather than an assembly: the STRUCTURE (which
 * items exist, which open a panel, how the capability columns are split, how many covers
 * fit a row) is a layout decision that lives in the navigation module, and only the words
 * are replaced with what the database says today.
 *
 * The five primary link labels and the two calls to action are the exception: they are
 * the menu's own, they are not editable in the panel, and they stay where they are.
 */
export class DbNavigationRepository implements NavigationRepository {
  private readonly structure = new StaticNavigationRepository();

  async getPrimaryMenu(): Promise<NavigationMenu> {
    const shape = await this.structure.getPrimaryMenu();
    const [capability, tiers, work] = await Promise.all([
      capabilities(),
      engagementTiers(),
      caseStudies(),
    ]);

    const capabilityWords = capability.records.map((record) => ({
      title: capability.store.text(record.ownerKey, "title"),
      description: capability.store.text(record.ownerKey, "descriptor"),
    }));
    const tierWords = [
      ...tiers.records.filter((record) => record.is_custom === 0),
      ...tiers.records.filter((record) => record.is_custom === 1),
    ].map((record) => ({
      name: tiers.store.text(record.ownerKey, "name"),
      description: tiers.store.text(record.ownerKey, "descriptor"),
      media: mediaFrom(
        record.media_path,
        record.media_kind,
        record.media_ratio,
        tiers.store.text(record.ownerKey, "media-alt"),
      ),
    }));
    const workWords = work.records.map((record) => ({
      title: work.store.text(record.ownerKey, "title"),
      description: work.store.text(record.ownerKey, "intent-line"),
      media: mediaFrom(
        record.home_media_path,
        record.home_media_kind,
        record.home_media_ratio,
        work.store.text(record.ownerKey, "homepage-cover-alt-text"),
      ),
    }));

    // The columns are a layout split of one ordered list, so the words are consumed in
    // that same order rather than matched per column.
    let capabilityIndex = 0;
    let tierIndex = 0;
    let workIndex = 0;

    return {
      ...shape,
      primaryLinks: shape.primaryLinks.map((entry) => ({
        link: entry.link,
        panel: {
          ...entry.panel,
          columns: entry.panel.columns.map((column) => ({
            title: column.title,
            items: column.items.map((item) => {
              const words = capabilityWords[capabilityIndex++];
              return words
                ? { ...createCta(words.title, item.href.value), description: words.description }
                : item;
            }),
          })),
          features: entry.panel.features.map((feature): NavPanelFeature => {
            // The two feature panels are told apart by where their links point, which is
            // structure the module already decided — not by their position in the list.
            const isTier = feature.href.value.startsWith("/ways-to-work-with-us");
            const words = isTier ? tierWords[tierIndex++] : workWords[workIndex++];
            if (!words) return feature;
            const label = "name" in words ? words.name : words.title;
            return {
              ...createCta(label, feature.href.value),
              media: words.media,
              description: words.description,
            };
          }),
        },
      })),
    };
  }
}

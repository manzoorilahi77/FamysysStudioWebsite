import type { AboutPage } from "../../domain/about/entities/AboutPage";
import type { AboutRepository } from "../../domain/about/repositories/AboutRepository";
import type { CmsInquiry, CmsInquiryStatus } from "../../domain/cms/entities/CmsInquiry";
import type { CmsPage } from "../../domain/cms/entities/CmsPage";
import { recordTree, recordValues } from "../../domain/cms/entities/CmsRecord";
import type { CmsValue } from "../../domain/cms/entities/CmsRecord";
import type { ContentAddress, ContentFieldAddress } from "../../domain/cms/entities/ContentAddress";
import { addressKey, fieldKey } from "../../domain/cms/entities/ContentAddress";
import {
  ContentConflictError,
  type ContentEdit,
  type CmsRepository,
  type NewCmsRecord,
} from "../../domain/cms/repositories/CmsRepository";
import type { ContactPage } from "../../domain/contact/entities/ContactPage";
import type { ContactRepository } from "../../domain/contact/repositories/ContactRepository";
import type { WaysToWorkPage } from "../../domain/engagement/entities/WaysToWorkPage";
import type { EngagementRepository } from "../../domain/engagement/repositories/EngagementRepository";
import type { MarketingContentRepository } from "../../domain/marketing/repositories/MarketingContentRepository";
import type { CaseStudy } from "../../domain/portfolio/entities/CaseStudy";
import type { SelectedWorkPage } from "../../domain/portfolio/entities/SelectedWorkPage";
import type { PortfolioRepository } from "../../domain/portfolio/repositories/PortfolioRepository";
import type { HowWeWorkPage } from "../../domain/process/entities/HowWeWorkPage";
import type { ProcessRepository } from "../../domain/process/repositories/ProcessRepository";
import type { CreativeServicesPage } from "../../domain/services/entities/CreativeServicesPage";
import type { ServiceOffering } from "../../domain/services/entities/ServiceOffering";
import type { ServiceCatalogRepository } from "../../domain/services/repositories/ServiceCatalogRepository";
import { annotatePages } from "./annotate";
import { withDrafts } from "./drafts";
import { draftIndex, draftsFor, putDrafts, removeDrafts } from "./FileDraftStore";
import { buildPages } from "./pages";
import type { MarketingContent } from "./marketingContent";
import { loadMarketingContent } from "./marketingContent";

interface SiteContent {
  readonly marketing: MarketingContent;
  readonly creativeServices: CreativeServicesPage;
  readonly howWeWork: HowWeWorkPage;
  readonly waysToWork: WaysToWorkPage;
  readonly selectedWork: SelectedWorkPage;
  readonly caseStudies: ReadonlyArray<CaseStudy>;
  readonly capabilities: ReadonlyArray<ServiceOffering>;
  readonly about: AboutPage;
  readonly contact: ContactPage;
}

export interface CmsContentRepositories {
  readonly marketingContent: MarketingContentRepository;
  readonly serviceCatalog: ServiceCatalogRepository;
  readonly process: ProcessRepository;
  readonly engagement: EngagementRepository;
  readonly portfolio: PortfolioRepository;
  readonly about: AboutRepository;
  readonly contact: ContactRepository;
}

/**
 * THE CMS READS THE SITE'S OWN REPOSITORIES.
 *
 * Not the content files. This class takes the seven interfaces the pages take and is handed
 * the same instances from the composition root, so what an admin screen shows is
 * necessarily what the page renders — there is no second path to the content that could
 * drift away from the first.
 *
 * The write half goes back to the same files, one string literal at a time — see
 * ContentFileWriter — but only when a draft is PUBLISHED. Save writes to a sidecar instead,
 * so the three steps mean the same thing here as they do over the database; see
 * FileDraftStore for why that was worth a file.
 */
export class StaticCmsRepository implements CmsRepository {
  /**
   * A TypeScript module has a fixed number of entries, and adding one means writing a new
   * object literal into an array, wiring its slug into every file that looks it up, and
   * inventing values for the fields the panel does not ask for. That is a code change, so
   * the panel does not offer it while this is the store.
   */
  readonly supportsRecordChanges: boolean = false;

  /**
   * The site is built from the modules, so there is nowhere for it to read an unpublished
   * string from. The preview still opens — it shows the live page — and the panel says on
   * screen that the draft is not in it, which is better than a button that does nothing.
   */
  readonly supportsDraftPreview: boolean = false;

  constructor(protected readonly repositories: CmsContentRepositories) {}

  async getPages(): Promise<ReadonlyArray<CmsPage>> {
    return withDrafts(await this.publishedPages(), await this.drafts());
  }

  /** The model as the public site is serving it, before any unpublished edit is laid over. */
  protected async publishedPages(): Promise<ReadonlyArray<CmsPage>> {
    const content = await this.loadSiteContent();

    const pages = buildPages({
      homepage: content.marketing,
      creativeServices: content.creativeServices,
      howWeWork: content.howWeWork,
      waysToWork: content.waysToWork,
      selectedWork: content.selectedWork,
      caseStudies: content.caseStudies,
      about: content.about,
      contact: content.contact,
    });

    // The three modules that hold the client's own briefs. A string that appears in any
    // of them is approved copy; everything else is drafted and pending review.
    return annotatePages(pages, [
      content.marketing,
      content.caseStudies,
      content.capabilities,
    ]);
  }

  protected async drafts(): Promise<ReadonlyMap<string, string>> {
    return draftIndex();
  }

  /**
   * A save is refused when the published string is no longer what the editor was looking
   * at. There are no revision numbers in a TypeScript file, so the comparison is against
   * the text itself — which catches the case that matters here: somebody edited the module
   * in an editor while the panel had it open.
   */
  async saveDrafts(edits: ReadonlyArray<ContentEdit>): Promise<void> {
    if (edits.length === 0) return;
    const published = await this.publishedValues();

    for (const edit of edits) {
      const current = published.get(fieldKey(edit.address));
      if (current === undefined) {
        throw new ContentConflictError(
          "That field is no longer on this section. Reload the panel and make the change again.",
        );
      }
      if (current.value !== edit.baseValue) {
        throw new ContentConflictError(
          `"${current.label}" changed since the screen was loaded — the content file was edited elsewhere. Reload the panel and make the change again.`,
        );
      }
    }

    putDrafts(
      edits.map((edit) => ({
        address: edit.address,
        value: edit.value,
        baseValue: edit.baseValue,
        ...(edit.pointer ? { pointer: edit.pointer } : {}),
      })),
    );
  }

  /**
   * The writer is imported lazily because it pulls in the TypeScript compiler and
   * Prettier, and every read path in the panel would otherwise carry both for a capability
   * it never uses.
   */
  async publishDrafts(
    owners: ReadonlyArray<ContentAddress>,
  ): Promise<ReadonlyArray<ContentFieldAddress>> {
    const held = draftsFor(owners);
    if (held.length === 0) return [];

    const published = await this.publishedValues();
    for (const entry of held) {
      const current = published.get(fieldKey(entry.address));
      if (current === undefined || current.value !== entry.draft.baseValue) {
        throw new ContentConflictError(
          "The content file changed since this edit was saved. Discard the draft and make the change again, so you are working from what the file now says.",
        );
      }
      if (!entry.draft.pointer) {
        throw new ContentConflictError(
          `"${current.label}" has nowhere to be written in the content files. Set CONTENT_SOURCE=database.`,
        );
      }
    }

    const { ContentFileWriter } = await import("./ContentFileWriter");
    await new ContentFileWriter().apply(
      held.map((entry) => ({
        // Checked above: every entry here has a pointer.
        pointer: entry.draft.pointer as NonNullable<typeof entry.draft.pointer>,
        value: entry.draft.value,
      })),
    );

    const written = held.map((entry) => entry.address);
    removeDrafts(written);
    return written;
  }

  async discardDrafts(owners: ReadonlyArray<ContentAddress>): Promise<void> {
    removeDrafts(draftsFor(owners).map((entry) => entry.address));
  }

  /** Every published string in the model, keyed by its field address. */
  protected async publishedValues(): Promise<ReadonlyMap<string, CmsValue>> {
    const index = new Map<string, CmsValue>();
    for (const page of await this.publishedPages()) {
      for (const section of page.sections) {
        for (const record of recordTree(section)) {
          if (!record.address) continue;
          const prefix = addressKey(record.address);
          for (const value of recordValues(record)) {
            index.set(`${prefix}:${value.id}`, value);
          }
        }
      }
    }
    return index;
  }

  /**
   * Always empty, and honestly so: with the content files as the source there is no
   * database, and an enquiry has nowhere to have been kept. The inbox says that rather
   * than pretending to be a list that happens to have nothing in it.
   */
  async getInquiries(): Promise<ReadonlyArray<CmsInquiry>> {
    return [];
  }

  async createRecord(collectionId: string, record: NewCmsRecord): Promise<string> {
    throw new Error(
      `"${record.title}" cannot be added to ${collectionId} while content is read from the ` +
        "TypeScript files: a new record there means a new object literal in a module and a " +
        "slug wired into every file that looks it up. Set CONTENT_SOURCE=database.",
    );
  }

  async deleteRecord(collectionId: string, recordId: string): Promise<void> {
    throw new Error(
      `"${recordId}" cannot be removed from ${collectionId} while content is read from the ` +
        "TypeScript files. Set CONTENT_SOURCE=database.",
    );
  }

  async setInquiryStatus(id: string, status: CmsInquiryStatus): Promise<void> {
    throw new Error(
      `Enquiry ${id} cannot be marked "${status}": there is no inbox while content is read ` +
        "from the files, because there is nowhere for a submission to have been kept.",
    );
  }

  protected async loadSiteContent(): Promise<SiteContent> {
    const [
      marketing,
      creativeServices,
      howWeWork,
      waysToWork,
      selectedWork,
      caseStudies,
      capabilities,
      about,
      contact,
    ] = await Promise.all([
      loadMarketingContent(this.repositories.marketingContent),
      this.repositories.serviceCatalog.getCreativeServicesPage(),
      this.repositories.process.getHowWeWorkPage(),
      this.repositories.engagement.getWaysToWorkPage(),
      this.repositories.portfolio.getSelectedWorkPage(),
      this.repositories.portfolio.getCaseStudies(),
      this.repositories.serviceCatalog.getCapabilities(),
      this.repositories.about.getAboutPage(),
      this.repositories.contact.getContactPage(),
    ]);

    return {
      marketing,
      creativeServices,
      howWeWork,
      waysToWork,
      selectedWork,
      caseStudies,
      capabilities,
      about,
      contact,
    };
  }
}

import type { AboutPage } from "../../domain/about/entities/AboutPage";
import type { AboutRepository } from "../../domain/about/repositories/AboutRepository";
import type { CmsCollection } from "../../domain/cms/entities/CmsCollection";
import type { CmsInquiry } from "../../domain/cms/entities/CmsInquiry";
import type { CmsMediaAsset } from "../../domain/cms/entities/CmsMediaAsset";
import type { CmsPage } from "../../domain/cms/entities/CmsPage";
import type {
  ContentEdit,
  CmsRepository,
  NewCmsRecord,
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
import { annotateModel } from "./annotate";
import { buildCollections } from "./collections";
import { buildMediaLibrary } from "./mediaLibrary";
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
 * Not the content files. This class takes the seven interfaces the pages take and is
 * handed the same instances from the composition root, so a count on an admin screen is
 * necessarily the count the page renders — there is no second path to the content that
 * could drift away from the first.
 *
 * The write half goes back to the same files, one string literal at a time — see
 * ContentFileWriter. It is deliberately the simplest thing that works: the content stays
 * TypeScript, the site's build is unchanged, and an edit appears on the next dev reload.
 * When there is a server and a database, this class is what gets replaced, and nothing
 * above `CmsRepository` moves.
 */
export class StaticCmsRepository implements CmsRepository {
  /**
   * A TypeScript module has a fixed number of entries, and adding one means writing a new
   * object literal into an array, wiring its slug into every file that looks it up, and
   * inventing values for the fields the panel does not ask for. That is a code change, so
   * the panel does not offer it while this is the store.
   */
  readonly supportsRecordChanges: boolean = false;

  constructor(protected readonly repositories: CmsContentRepositories) {}

  async getPages(): Promise<ReadonlyArray<CmsPage>> {
    return (await this.model()).pages;
  }

  async getCollections(): Promise<ReadonlyArray<CmsCollection>> {
    return (await this.model()).collections;
  }

  /**
   * The writer is imported lazily because it pulls in the TypeScript compiler and
   * Prettier, and every read path in the panel would otherwise carry both for a
   * capability it never uses.
   */
  async applyEdits(edits: ReadonlyArray<ContentEdit>): Promise<void> {
    const { ContentFileWriter } = await import("./ContentFileWriter");
    return new ContentFileWriter().apply(edits);
  }

  /**
   * Pages and collections are built together and annotated together, because two of the
   * marks on a value — whose words it is, and where else it appears — are properties of
   * the whole model rather than of one record. See annotate.ts.
   */
  protected async model() {
    const content = await this.loadSiteContent();

    const pages = buildPages({
      homepage: content.marketing,
      creativeServices: content.creativeServices,
      howWeWork: content.howWeWork,
      waysToWork: content.waysToWork,
      selectedWork: content.selectedWork,
      about: content.about,
      contact: content.contact,
    });

    const collections = buildCollections({
      creativeServices: content.creativeServices,
      howWeWork: content.howWeWork,
      waysToWork: content.waysToWork,
      selectedWork: content.selectedWork,
      caseStudies: content.caseStudies,
      faq: content.marketing.faq,
    });

    // The three modules that hold the client's own briefs. A string that appears in any
    // of them is approved copy; everything else is drafted and pending review.
    return annotateModel(pages, collections, [
      content.marketing,
      content.caseStudies,
      content.capabilities,
    ]);
  }

  async getMediaLibrary(): Promise<ReadonlyArray<CmsMediaAsset>> {
    const content = await this.loadSiteContent();
    return buildMediaLibrary({
      homepage: content.marketing,
      creativeServices: content.creativeServices,
      howWeWork: content.howWeWork,
      waysToWork: content.waysToWork,
      selectedWork: content.selectedWork,
      about: content.about,
    });
  }

  /**
   * Always empty, and honestly so: the contact form validates and posts, but
   * `StubLeadRepository` discards what it receives because there is no store, queue or
   * CRM behind it yet. The inbox screen says that rather than pretending to be a list
   * that happens to have nothing in it.
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

  async setInquiryStatus(id: string, status: string): Promise<void> {
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

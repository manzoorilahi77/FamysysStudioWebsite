# SEO & GEO Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the structured-data, crawlability and GEO infrastructure this site is missing (JSON-LD, llms.txt), without touching per-page metadata/OG/sitemap/robots/canonical work that is already fully implemented.

**Architecture:** Pure builder functions in `src/shared/site/structured-data.ts` turn real domain data (already fetched by each page) into schema.org JSON-LD objects. A small `JsonLd` component renders them as `<script type="application/ld+json">`. Organization/ProfessionalService goes in the root layout (site-wide); BreadcrumbList goes on every inner page; FAQPage goes on `/faq`; Service ×6 goes on `/creative-services`. No new data sources, no changes to existing metadata/OG/sitemap/robots.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Vitest.

**Spec:** The user's SEO/GEO request (this conversation) — see "Already done vs. genuinely missing" below, established by a research pass over the live repo (`s:\FamySys\fsStudios`) on 2026-09-14.

## Global Constraints

- Real content only in every JSON-LD block — no placeholder/fabricated data (explicit spec requirement).
- Site actually has **11 public routes** (`src/shared/site/site.ts` `SITE_ROUTES`), not seven — the spec's "seven pages" is stale; all 11 get the same treatment.
- Do not touch `docs/explorations/` (another session may be using it).
- Do not touch already-complete work: per-page `metadata` exports, canonical URLs, OG/Twitter cards, `sitemap.ts`, `robots.ts`, `/admin` noindex — all confirmed present and correct.
- No `telephone` field anywhere (not supplied anywhere in the codebase) — omit rather than fabricate.
- Address (`footerContent.addressLines`) and email (`footerContent.contactEmail`) are real supplied content already published site-wide in the footer, but both carry an unresolved discrepancy noted in-repo (ZIP 77407 vs 77447; email may be the parent company's). Reuse them as-is in schema (consistent with what the footer already publishes) and flag the discrepancy in the final report — do not invent a different value.
- `sameAs` includes only confirmed real profile URLs (LinkedIn) — Instagram/YouTube are `href: null` (pending) and must not be included.

## Already done vs. genuinely missing

**Already fully implemented — do not re-plan:** per-page `title`/`description` (all 11 routes), canonical URLs, Open Graph + Twitter cards + share image, `sitemap.xml`, `robots.txt`, `/admin` noindex+disallow, footer `<nav>` landmarks, one `<h1>` per page (verified: every page template — 8 Hero components + `LegalIndexPage`/`LegalDocumentPage` — renders exactly one `as="h1"`).

**Genuinely missing (what this plan builds):**
1. JSON-LD structured data — zero existing implementation (grepped, zero hits).
2. `llms.txt`.
3. A final heading-hierarchy spot-check across the built pages (h2/h3 nesting, not just the h1 count already confirmed by source inspection).

---

### Task 1: Structured-data builders

**Files:**
- Create: `src/shared/site/structured-data.ts`
- Test: `src/shared/site/structured-data.test.ts`

**Interfaces:**
- Consumes: `SITE_NAME`, `SITE_URL`, `absoluteUrl` from `src/shared/site/site.ts` (already exist).
- Produces (used by Tasks 3-6):
  - `organizationSchema(): Record<string, unknown>`
  - `breadcrumbSchema(items: ReadonlyArray<{ name: string; path: string }>): Record<string, unknown>` — `items[0]` is always Home; `path` is a site-relative route like `/faq`.
  - `faqPageSchema(groups: ReadonlyArray<{ items: ReadonlyArray<{ question: string; answer: string }> }>): Record<string, unknown>`
  - `serviceSchema(capability: { title: string; description: string; slug: string }): Record<string, unknown>`

- [ ] **Step 1: Write the failing test**

```typescript
// src/shared/site/structured-data.test.ts
import { describe, expect, it } from "vitest";
import {
  breadcrumbSchema,
  faqPageSchema,
  organizationSchema,
  serviceSchema,
} from "./structured-data";

describe("organizationSchema", () => {
  it("names Famysys Studio with an absolute url, logo and confirmed sameAs only", () => {
    const schema = organizationSchema();
    expect(schema["@type"]).toBe("ProfessionalService");
    expect(schema.name).toBe("Famysys Studio");
    expect(schema.url).toBe("https://studio.famysys.com");
    expect(schema.sameAs).toEqual(["https://www.linkedin.com/company/famysys/home/"]);
    expect(schema).not.toHaveProperty("telephone");
  });
});

describe("breadcrumbSchema", () => {
  it("builds an ordered ListItem chain from Home to the given page", () => {
    const schema = breadcrumbSchema([
      { name: "Famysys Studio", path: "/" },
      { name: "Creative Services", path: "/creative-services" },
    ]);
    expect(schema["@type"]).toBe("BreadcrumbList");
    const items = schema.itemListElement as ReadonlyArray<Record<string, unknown>>;
    expect(items).toHaveLength(2);
    expect(items[0]?.position).toBe(1);
    expect(items[1]?.item).toBe("https://studio.famysys.com/creative-services");
  });
});

describe("faqPageSchema", () => {
  it("flattens every group's items into one mainEntity list of Question/Answer", () => {
    const schema = faqPageSchema([
      { items: [{ question: "Do you work with small businesses?", answer: "Yes." }] },
      { items: [{ question: "How much do your services cost?", answer: "It depends." }] },
    ]);
    expect(schema["@type"]).toBe("FAQPage");
    const entities = schema.mainEntity as ReadonlyArray<Record<string, unknown>>;
    expect(entities).toHaveLength(2);
    expect(entities[0]?.["@type"]).toBe("Question");
    expect((entities[0]?.acceptedAnswer as Record<string, unknown>)?.text).toBe("Yes.");
  });
});

describe("serviceSchema", () => {
  it("names the capability as a Service provided by Famysys Studio, anchored to its slug", () => {
    const schema = serviceSchema({
      title: "Creative Design",
      description: "Social creatives, marketing collateral, presentations, brochures, banners and digital assets.",
      slug: "creative-design",
    });
    expect(schema["@type"]).toBe("Service");
    expect(schema.name).toBe("Creative Design");
    expect((schema.provider as Record<string, unknown>)?.name).toBe("Famysys Studio");
    expect(schema.url).toBe("https://studio.famysys.com/creative-services#creative-design");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- structured-data`
Expected: FAIL with "Cannot find module './structured-data'"

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/shared/site/structured-data.ts
import { SITE_NAME, SITE_URL, absoluteUrl } from "./site";

/**
 * schema.org JSON-LD builders. Every value comes from data the calling page already
 * fetched from a real repository — nothing here invents content. `telephone` is never
 * emitted: no phone number exists anywhere in the codebase, and a fabricated one would be
 * read by machines as fact. `sameAs` lists only profile links with a real `href` — the two
 * pending social networks (`href: null`) are excluded, not printed empty.
 */

const LOGO_URL = absoluteUrl("/icon.png");
const CONTACT_EMAIL = "hello@famysys.com";
const CONFIRMED_SOCIAL_LINKS = ["https://www.linkedin.com/company/famysys/home/"] as const;

/**
 * ProfessionalService doubles as the site's Organization declaration — it is a subtype of
 * both LocalBusiness and Organization, so one block satisfies "Organization schema on
 * every page" and "LocalBusiness/ProfessionalService schema" without publishing two
 * overlapping entities for the same business.
 */
export function organizationSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: SITE_NAME,
    url: SITE_URL,
    logo: LOGO_URL,
    image: LOGO_URL,
    description: "Famysys Studio — video design and creative production.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "10193 W Grand Parkway S., Ste. 103-229",
      addressLocality: "Richmond",
      addressRegion: "TX",
      postalCode: "77447",
      addressCountry: "US",
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: CONTACT_EMAIL,
      contactType: "customer service",
    },
    sameAs: [...CONFIRMED_SOCIAL_LINKS],
  };
}

export function breadcrumbSchema(
  items: ReadonlyArray<{ readonly name: string; readonly path: string }>,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqPageSchema(
  groups: ReadonlyArray<{
    readonly items: ReadonlyArray<{ readonly question: string; readonly answer: string }>;
  }>,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: groups.flatMap((group) =>
      group.items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    ),
  };
}

export function serviceSchema(capability: {
  readonly title: string;
  readonly description: string;
  readonly slug: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: capability.title,
    description: capability.description,
    url: `${absoluteUrl("/creative-services")}#${capability.slug}`,
    provider: {
      "@type": "ProfessionalService",
      name: SITE_NAME,
      url: SITE_URL,
    },
    areaServed: "Worldwide",
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- structured-data`
Expected: PASS (4 test files/blocks green)

- [ ] **Step 5: Commit**

```bash
git add src/shared/site/structured-data.ts src/shared/site/structured-data.test.ts
git commit -m "feat: add schema.org JSON-LD builders for Organization, BreadcrumbList, FAQPage, Service"
```

---

### Task 2: JSON-LD render component

**Files:**
- Create: `src/presentation/seo/JsonLd.tsx`
- Test: `src/presentation/seo/JsonLd.test.tsx`

**Interfaces:**
- Consumes: nothing new (plain `Record<string, unknown>` from Task 1's builders).
- Produces: `JsonLd({ data }: { readonly data: Record<string, unknown> })` — a server component, importable into any page or layout.

- [ ] **Step 1: Write the failing test**

```tsx
// src/presentation/seo/JsonLd.test.tsx
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JsonLd } from "./JsonLd";

describe("JsonLd", () => {
  it("renders one application/ld+json script containing the exact data", () => {
    const { container } = render(<JsonLd data={{ "@type": "Thing", name: "Test" }} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    expect(JSON.parse(script?.textContent ?? "")).toEqual({ "@type": "Thing", name: "Test" });
  });

  it("escapes a closing script tag inside a string value so the block cannot break out", () => {
    const { container } = render(<JsonLd data={{ name: "</script><script>alert(1)</script>" }} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script?.innerHTML).not.toContain("</script><script>alert(1)</script>");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- JsonLd`
Expected: FAIL with "Cannot find module './JsonLd'"

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/presentation/seo/JsonLd.tsx
interface JsonLdProps {
  readonly data: Record<string, unknown>;
}

/**
 * Renders one schema.org block. `</script` inside a string value is escaped to `<\/script`
 * — every value here comes from our own builders, never from a visitor, but a raw `</script>`
 * inside the JSON would still truncate this script element at parse time.
 */
export function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data).replace(/<\/script/gi, "<\\/script");
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- JsonLd`
Expected: PASS (2 tests green)

- [ ] **Step 5: Commit**

```bash
git add src/presentation/seo/JsonLd.tsx src/presentation/seo/JsonLd.test.tsx
git commit -m "feat: add JsonLd component for rendering schema.org script tags"
```

---

### Task 3: Site-wide Organization/ProfessionalService schema

**Files:**
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `organizationSchema()` (Task 1), `JsonLd` (Task 2).

- [ ] **Step 1: Add the import and render it in `<head>` via the body, next to the existing skip-link**

Read the current file first (`src/app/layout.tsx`) — it renders `<html><body>` with a skip-link, `<GoogleAnalytics />` and `{children}`. Add:

```tsx
import { JsonLd } from "../presentation/seo/JsonLd";
import { organizationSchema } from "../shared/site/structured-data";
```

and render `<JsonLd data={organizationSchema()} />` as the first child inside `<body>`, before the skip-link.

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: render Organization/ProfessionalService JSON-LD site-wide"
```

---

### Task 4: BreadcrumbList on every inner page

**Files:**
- Modify: `src/app/about/page.tsx`, `src/app/contact/page.tsx`, `src/app/creative-services/page.tsx`, `src/app/faq/page.tsx`, `src/app/how-we-work/page.tsx`, `src/app/legal/page.tsx`, `src/app/privacy/page.tsx`, `src/app/selected-work/page.tsx`, `src/app/terms/page.tsx`, `src/app/ways-to-work-with-us/page.tsx` (every route except `/`).

**Interfaces:**
- Consumes: `breadcrumbSchema()` (Task 1), `JsonLd` (Task 2), each page's own `metadata` title (already a literal string per page) and route (already a literal string per page).

- [ ] **Step 1: For each file, add the import and one `<JsonLd>` call**

Pattern (shown for `src/app/about/page.tsx`; apply the same shape to each of the other nine files, matching each page's own title used in its `metadata` block and its own route):

```tsx
import { JsonLd } from "../../presentation/seo/JsonLd";
import { breadcrumbSchema } from "../../shared/site/structured-data";

const BREADCRUMB = breadcrumbSchema([
  { name: "Famysys Studio", path: "/" },
  { name: "About", path: "/about" },
]);
```

Render `<JsonLd data={BREADCRUMB} />` as the first child right after `<Header ... />` opens (or anywhere inside the returned fragment — placement in the DOM does not matter for JSON-LD).

Exact `{ name, path }` pairs per file (name matches the page's own `metadata` title verbatim):

| File | name | path |
|---|---|---|
| `about/page.tsx` | About | `/about` |
| `contact/page.tsx` | Contact | `/contact` |
| `creative-services/page.tsx` | Creative Services | `/creative-services` |
| `faq/page.tsx` | Questions | `/faq` |
| `how-we-work/page.tsx` | How We Work | `/how-we-work` |
| `legal/page.tsx` | Legal | `/legal` |
| `privacy/page.tsx` | Privacy Policy | `/privacy` |
| `selected-work/page.tsx` | Selected Work | `/selected-work` |
| `terms/page.tsx` | Terms & Conditions | `/terms` |
| `ways-to-work-with-us/page.tsx` | Ways to Work With Us | `/ways-to-work-with-us` |

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/about/page.tsx src/app/contact/page.tsx src/app/creative-services/page.tsx src/app/faq/page.tsx src/app/how-we-work/page.tsx src/app/legal/page.tsx src/app/privacy/page.tsx src/app/selected-work/page.tsx src/app/terms/page.tsx src/app/ways-to-work-with-us/page.tsx
git commit -m "feat: add BreadcrumbList JSON-LD to every inner page"
```

---

### Task 5: FAQPage schema on /faq

**Files:**
- Modify: `src/app/faq/page.tsx`

**Interfaces:**
- Consumes: `faqPageSchema()` (Task 1), the `page` value already returned by `new GetFaqPage(...).execute()` in this file — `page.groups: ReadonlyArray<FaqGroup>`, each `FaqGroup.items: ReadonlyArray<FaqItem>` where `FaqItem` has `question`/`answer` (confirmed shape from `src/domain/faq/entities/FaqPage.ts` and `src/domain/marketing/entities/FaqBlock.ts`).

- [ ] **Step 1: Build the schema from the page's own already-fetched data**

In `src/app/faq/page.tsx`, alongside the `BREADCRUMB` from Task 4, add:

```tsx
import { breadcrumbSchema, faqPageSchema } from "../../shared/site/structured-data";
```

and inside the component body, after `const pageView = toFaqPageView(page);`:

```tsx
const faqSchema = faqPageSchema(page.groups);
```

Render `<JsonLd data={faqSchema} />` alongside `<JsonLd data={BREADCRUMB} />`.

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no new errors — confirms `FaqGroup.items` items satisfy `faqPageSchema`'s `{ question, answer }` shape (check `FaqItem`'s exact field name for the answer — read `src/domain/marketing/entities/FaqBlock.ts` first; if the field is not literally `answer`, adjust the call to map it, e.g. `page.groups.map(g => ({ items: g.items.map(i => ({ question: i.question, answer: i.answer })) }))`).

- [ ] **Step 3: Commit**

```bash
git add src/app/faq/page.tsx
git commit -m "feat: add FAQPage JSON-LD generated from the real FAQ content"
```

---

### Task 6: Service schema ×6 on /creative-services

**Files:**
- Modify: `src/app/creative-services/page.tsx`

**Interfaces:**
- Consumes: `serviceSchema()` (Task 1), `page.capabilities: ReadonlyArray<CapabilityDetail>` (already fetched in this file, before the `.map(toCapabilityDetailView)` view conversion) — `CapabilityDetail` has `title`, `description`, `slug` (confirmed in `src/domain/services/entities/CapabilityDetail.ts` / `ServiceOffering.ts`).

- [ ] **Step 1: Build one Service schema per capability**

Alongside the `BREADCRUMB` import from Task 4, add:

```tsx
import { breadcrumbSchema, serviceSchema } from "../../shared/site/structured-data";
```

Inside the component, after `const capabilities = page.capabilities.map(toCapabilityDetailView);`, add:

```tsx
const serviceSchemas = page.capabilities.map((capability) =>
  serviceSchema({ title: capability.title, description: capability.description, slug: capability.slug }),
);
```

(`capability.slug` is a `Slug` branded type — confirm at typecheck whether it needs `String(capability.slug)`; adjust if TypeScript flags it.)

Render each as its own script tag, after `<JsonLd data={BREADCRUMB} />`:

```tsx
{serviceSchemas.map((schema, index) => (
  <JsonLd key={index} data={schema} />
))}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/creative-services/page.tsx
git commit -m "feat: add Service JSON-LD for each of the six capabilities"
```

---

### Task 7: llms.txt

**Files:**
- Create: `public/llms.txt`

- [ ] **Step 1: Write the file**

One short paragraph per real route, using the exact descriptions already approved for each page's `metadata` (no new copy invented). Content:

```
# Famysys Studio

Famysys Studio is a creative production studio — part of the Famysys ecosystem — offering
design, video editing, AI-assisted video production, motion graphics and product visuals for
businesses that need high-quality content produced efficiently. This file summarises what each
page on studio.famysys.com covers, for AI systems that read llms.txt.

## Home (/)
Design, video, AI-powered content, motion and product visuals — produced by a flexible creative
team that helps businesses create high-quality content efficiently and at better value.

## Creative Services (/creative-services)
The six services the studio offers — Creative Design; Video Production & Editing; AI Video &
Virtual Presenters; Explainer & Training Videos; Motion Graphics & Advanced Creative; and Product
& Brand Visuals — with what each involves and what a client receives.

## How We Work (/how-we-work)
The five steps every Famysys Studio project runs through, what each step produces, and what the
studio needs from a client at each stage.

## Ways to Work With Us (/ways-to-work-with-us)
Four ways to engage the studio — Launch, Grow, Scale and a Custom Creative Partnership — what
each suits and how an engagement is scoped.

## Selected Work (/selected-work)
The eight pieces the studio is building to demonstrate its range; none of them has been produced
yet.

## About (/about)
Who Famysys Studio is: a studio combining creative talent, emerging AI technologies and
structured production workflows, part of the Famysys ecosystem and starting deliberately.

## Contact (/contact)
How to reach the studio with a brief — what to include, and that a reply comes from the person
who would direct the work.

## Questions (/faq)
Every question asked across the site, answered in one place — who the studio works with, what it
makes, how the work runs, and what it costs.

## Legal (/legal)
An index of the site's two governing documents: Terms & Conditions and Privacy Policy.

## Terms & Conditions (/terms)
The terms on which this website is published and how an enquiry sent through it is treated.

## Privacy Policy (/privacy)
What the site collects when a visitor sends an enquiry, what it does not collect, and how that
data is handled.
```

- [ ] **Step 2: Verify it's served**

Run: `npm run build && npm run start` (or `npm run dev`), then fetch `http://localhost:3000/llms.txt`.
Expected: 200, `Content-Type: text/plain`, body matches the file above.

- [ ] **Step 3: Commit**

```bash
git add public/llms.txt
git commit -m "feat: add llms.txt summarising the site for AI answer engines"
```

---

### Task 8: Verification pass

Not a code task — run and record results, no commit.

- [ ] **Step 1:** `npm run typecheck` — must be clean.
- [ ] **Step 2:** `npm run build` — must succeed.
- [ ] **Step 3:** `npm run test` — all existing + new tests green.
- [ ] **Step 4:** `npm run start`, then for each of the 11 routes: fetch the HTML and confirm `<title>`, `<meta name="description">`, `<link rel="canonical">`, `og:*`, `twitter:*` tags are present and page-specific (already true; confirm nothing regressed), confirm exactly one `<h1>`, confirm no skipped heading level in the rendered DOM, and confirm every `<script type="application/ld+json">` block parses as valid JSON with the expected `@type`.
- [ ] **Step 5:** Run Lighthouse (`lighthouse` + `chrome-launcher`, already devDependencies) against all 11 running routes; record Performance and SEO scores in a table; fix anything under 90 before closing out.
- [ ] **Step 6:** Confirm `/llms.txt`, `/sitemap.xml`, `/robots.txt` all 200.
- [ ] **Step 7:** Write the final report: Lighthouse table; schema types added per page; the honest paragraph on what SEO/GEO work can and cannot guarantee; the flagged business-info gaps (no phone number anywhere in the codebase; email may be the parent company's; address ZIP has an unresolved internal discrepancy, 77407 vs 77447); the stale "seven pages" assumption (site has 11 public routes).

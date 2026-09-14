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
      description:
        "Social creatives, marketing collateral, presentations, brochures, banners and digital assets.",
      slug: "creative-design",
    });
    expect(schema["@type"]).toBe("Service");
    expect(schema.name).toBe("Creative Design");
    expect((schema.provider as Record<string, unknown>)?.name).toBe("Famysys Studio");
    expect(schema.url).toBe("https://studio.famysys.com/creative-services#creative-design");
  });
});

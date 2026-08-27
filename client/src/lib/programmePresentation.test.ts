import { describe, expect, it } from "vitest";
import { courseMatchesFocus, getProgrammePresentation } from "./programmePresentation";

describe("programme presentation", () => {
  it("assigns each standard programme a dedicated visual treatment", () => {
    expect(getProgrammePresentation({ slug: "product-design", title: "Product Design" }).image).toContain("programme-product-design");
    expect(getProgrammePresentation({ slug: "ai-automation", title: "AI Automation" }).label).toBe("Applied AI");
  });

  it("filters programmes by their relevant business or technology focus", () => {
    const product = { slug: "product-design", title: "Product Design" };
    const marketing = { slug: "digital-marketing", title: "Digital Marketing" };
    const hybrid = { slug: "hybrid-bundle", title: "Multi-Discipline Hybrid Bundle" };
    expect(courseMatchesFocus(product, "technology")).toBe(true);
    expect(courseMatchesFocus(product, "business")).toBe(false);
    expect(courseMatchesFocus(marketing, "business")).toBe(true);
    expect(courseMatchesFocus(hybrid, "business")).toBe(true);
    expect(courseMatchesFocus(hybrid, "technology")).toBe(true);
  });
});

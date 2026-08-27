export type ProgrammeFocus = "all" | "business" | "technology";

type ProgrammeLike = { slug?: string; title: string };

type ProgrammePresentation = {
  focuses: Exclude<ProgrammeFocus, "all">[];
  label: string;
  image: string;
};

const programmePresentations: Record<string, ProgrammePresentation> = {
  "product-design": { focuses: ["technology"], label: "Design and product", image: "/manus-storage/programme-product-design_de96d875.jpg" },
  "software-computing": { focuses: ["technology"], label: "Technology and engineering", image: "/manus-storage/programme-software-computing_7a74c616.jpg" },
  "gaming-graphics": { focuses: ["technology"], label: "Creative technology", image: "/manus-storage/programme-gaming-graphics_5defc9bd.jpg" },
  "content-creation": { focuses: ["business"], label: "Communication and media", image: "/manus-storage/programme-content-creation_872fc1ca.jpg" },
  "digital-marketing": { focuses: ["business"], label: "Business and growth", image: "/manus-storage/programme-digital-marketing_96a275b3.jpg" },
  "ai-automation": { focuses: ["technology"], label: "Applied AI", image: "/manus-storage/programme-ai-automation_eb3d45f9.jpg" },
  "hybrid-bundle": { focuses: ["business", "technology"], label: "Interdisciplinary learning", image: "/manus-storage/programme-hybrid-bundle_4236d17d.jpg" },
  "holiday-family-bundle": { focuses: ["business", "technology"], label: "Family learning", image: "/manus-storage/programme-holiday-family_ae341f29.jpg" },
};

const fallbackPresentation: ProgrammePresentation = {
  focuses: ["technology"],
  label: "Academy programme",
  image: "/manus-storage/phoennixai-programmes-hero_fa26707c.jpg",
};

export function getProgrammePresentation(course: ProgrammeLike): ProgrammePresentation {
  return programmePresentations[course.slug ?? ""] ?? fallbackPresentation;
}

export function courseMatchesFocus(course: ProgrammeLike, focus: ProgrammeFocus): boolean {
  return focus === "all" || getProgrammePresentation(course).focuses.includes(focus);
}

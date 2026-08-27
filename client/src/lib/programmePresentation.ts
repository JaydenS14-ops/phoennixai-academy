export type ProgrammeFocus = "all" | "business" | "technology";

type ProgrammeLike = { slug?: string; title: string; imageUrl?: string | null };

type ProgrammePresentation = {
  focuses: Exclude<ProgrammeFocus, "all">[];
  label: string;
  image: string;
  outline: readonly string[];
};

const programmePresentations: Record<string, ProgrammePresentation> = {
  "product-design": { focuses: ["technology"], label: "Design and product", image: "/manus-storage/programme-product-design_de96d875.jpg", outline: ["User research", "Wireframes", "Prototyping"] },
  "software-computing": { focuses: ["technology"], label: "Technology and engineering", image: "/manus-storage/programme-software-computing_7a74c616.jpg", outline: ["Programming logic", "Front-end builds", "Systems thinking"] },
  "gaming-graphics": { focuses: ["technology"], label: "Creative technology", image: "/manus-storage/programme-gaming-graphics_5defc9bd.jpg", outline: ["Visual design", "Game concepts", "Interactive assets"] },
  "content-creation": { focuses: ["business"], label: "Communication and media", image: "/manus-storage/programme-content-creation_872fc1ca.jpg", outline: ["Creative strategy", "Content production", "Platform planning"] },
  "digital-marketing": { focuses: ["business"], label: "Business and growth", image: "/manus-storage/programme-digital-marketing_96a275b3.jpg", outline: ["Audience insight", "Campaign design", "Growth measurement"] },
  "ai-automation": { focuses: ["technology"], label: "Applied AI", image: "/manus-storage/programme-ai-automation_eb3d45f9.jpg", outline: ["Workflow design", "Responsible AI", "Automation systems"] },
  "hybrid-bundle": { focuses: ["business", "technology"], label: "Interdisciplinary learning", image: "/manus-storage/programme-hybrid-bundle_4236d17d.jpg", outline: ["Pathway planning", "Combined projects", "Portfolio growth"] },
  "holiday-family-bundle": { focuses: ["business", "technology"], label: "Family learning", image: "/manus-storage/programme-holiday-family_ae341f29.jpg", outline: ["Creative exploration", "Collaborative builds", "Holiday projects"] },
};

const fallbackPresentation: ProgrammePresentation = {
  focuses: ["technology"],
  label: "Academy programme",
  image: "/manus-storage/phoennixai-programmes-hero_fa26707c.jpg",
  outline: ["Practical learning", "Project work", "Pathway guidance"],
};

export function getProgrammePresentation(course: ProgrammeLike): ProgrammePresentation {
  const presentation = programmePresentations[course.slug ?? ""] ?? fallbackPresentation;
  return course.imageUrl ? { ...presentation, image: course.imageUrl } : presentation;
}

export function courseMatchesFocus(course: ProgrammeLike, focus: ProgrammeFocus): boolean {
  return focus === "all" || getProgrammePresentation(course).focuses.includes(focus);
}

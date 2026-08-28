import { describe, expect, it } from "vitest";
import { archivePage, archiveYear } from "./archivePresentation";

describe("archive presentation helpers", () => {
  it("extracts a year from published archive date labels without assuming a date format", () => {
    expect(archiveYear("August 2026")).toBe("2026");
    expect(archiveYear("Spring gathering 2024")).toBe("2024");
    expect(archiveYear("Coming soon")).toBe("Unspecified");
  });

  it("returns a compact bounded archive page for a larger bento collection", () => {
    const values = Array.from({ length: 13 }, (_, index) => index + 1);
    expect(archivePage(values, 2, 6)).toEqual({ items: [7, 8, 9, 10, 11, 12], currentPage: 2, totalPages: 3 });
    expect(archivePage(values, 99, 6)).toEqual({ items: [13], currentPage: 3, totalPages: 3 });
  });
});

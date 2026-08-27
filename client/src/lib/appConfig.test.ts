import { describe, expect, it } from "vitest";

describe("academy app configuration", () => {
  it("keeps the configured application title available to the client", () => {
    expect(import.meta.env.VITE_APP_TITLE).toBeTruthy();
  });
});

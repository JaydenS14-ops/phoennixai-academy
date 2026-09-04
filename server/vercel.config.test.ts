import { describe, expect, it } from "vitest";

describe("Vercel deployment configuration", () => {
  it("accepts the configured Vercel credential without creating a project", async () => {
    const token = process.env.VERCEL_TOKEN;
    if (!token) return;

    const response = await fetch("https://api.vercel.com/v2/user", {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.ok).toBe(true);
  }, 15_000);
});

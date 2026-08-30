import { describe, expect, it } from "vitest";

describe("transactional email configuration", () => {
  it("accepts the configured Resend credential without sending mail", async () => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return;

    const response = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    expect(response.ok).toBe(true);
  }, 15_000);
});

import { describe, expect, it } from "vitest";
import { CAL_BOOKING_URL } from "./appConfig";

describe("academy app configuration", () => {
  it("keeps the configured application title available to the client", () => {
    expect(import.meta.env.VITE_APP_TITLE).toBeTruthy();
  });

  it("keeps the approved external enquiry booking destination exact", () => {
    expect(CAL_BOOKING_URL).toBe("https://cal.com/phoennix-ai-team/30min");
  });
});

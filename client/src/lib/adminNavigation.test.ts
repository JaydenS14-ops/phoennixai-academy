import { describe, expect, it } from "vitest";
import { ADMIN_HOME_PATH, ADMIN_LOGIN_PATH, ADMIN_LOGIN_RETURN_LABEL, ADMIN_PUBLIC_HOME_PATH } from "./adminNavigation";

describe("Admin navigation", () => {
  it("keeps the secure workspace, login portal, and public-home escape route distinct", () => {
    expect(ADMIN_HOME_PATH).toBe("/admin");
    expect(ADMIN_LOGIN_PATH).toBe("/admin/login");
    expect(ADMIN_PUBLIC_HOME_PATH).toBe("/");
    expect(ADMIN_LOGIN_RETURN_LABEL).toBe("Return to PhoennixAI Academy");
  });
});

import { describe, expect, it } from "vitest";
import { FOOTER_ADMIN_LONG_PRESS_MS, isFooterAdminLongPressPointer } from "./footerAdminAccess";

describe("footer Admin access", () => {
  it("keeps the optional shortcut touch-only and bounded", () => {
    expect(isFooterAdminLongPressPointer("touch")).toBe(true);
    expect(isFooterAdminLongPressPointer("mouse")).toBe(false);
    expect(isFooterAdminLongPressPointer("pen")).toBe(false);
    expect(FOOTER_ADMIN_LONG_PRESS_MS).toBe(1200);
  });
});

import { describe, expect, it } from "vitest";
import { isAdminShortcut } from "./adminShortcut";

const event = (overrides: Partial<KeyboardEvent> = {}) => ({ ctrlKey: true, shiftKey: true, key: "a", target: null, ...overrides });

describe("Admin keyboard shortcut", () => {
  it("recognises Ctrl+Shift+A outside editable controls", () => {
    expect(isAdminShortcut(event())).toBe(true);
    expect(isAdminShortcut(event({ key: "A" }))).toBe(true);
  });

  it("does not hijack other shortcuts or editable fields", () => {
    expect(isAdminShortcut(event({ ctrlKey: false }))).toBe(false);
    expect(isAdminShortcut(event({ shiftKey: false }))).toBe(false);
    expect(isAdminShortcut(event({ key: "Enter" }))).toBe(false);
    expect(isAdminShortcut(event({ target: { tagName: "INPUT" } as HTMLElement }))).toBe(false);
    expect(isAdminShortcut(event({ target: { tagName: "TEXTAREA" } as HTMLElement }))).toBe(false);
  });
});

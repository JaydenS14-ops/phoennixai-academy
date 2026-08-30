export const ADMIN_SHORTCUT_KEY = "a";

export function isAdminShortcut(event: Pick<KeyboardEvent, "ctrlKey" | "shiftKey" | "key" | "target">) {
  const target = event.target as HTMLElement | null;
  const tagName = target?.tagName?.toUpperCase();
  const isEditable = tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT" || target?.isContentEditable;
  return event.ctrlKey && event.shiftKey && event.key.toLowerCase() === ADMIN_SHORTCUT_KEY && !isEditable;
}

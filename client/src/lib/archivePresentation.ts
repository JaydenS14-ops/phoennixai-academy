export const ARCHIVE_PAGE_SIZE = 6;

export function archiveYear(capturedAt: string) {
  return capturedAt.match(/(?:19|20)\d{2}/)?.[0] ?? "Unspecified";
}

export function archivePage<T>(items: T[], page: number, pageSize = ARCHIVE_PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  return { items: items.slice((currentPage - 1) * pageSize, currentPage * pageSize), currentPage, totalPages };
}

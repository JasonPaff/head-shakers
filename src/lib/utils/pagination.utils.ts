/**
 * Calculates which page numbers to display in pagination controls.
 * Returns an array of page numbers with -1 representing ellipsis markers.
 *
 * @param currentPage - The current active page number (1-indexed)
 * @param totalPages - The total number of pages available
 * @returns Array of page numbers with -1 for ellipsis positions
 *
 * @example
 * getPageNumbers(1, 10) // [1, 2, 3, -1, 10]
 * getPageNumbers(5, 10) // [1, -1, 4, 5, 6, -1, 10]
 * getPageNumbers(3, 5) // [1, 2, 3, 4, 5]
 */
export function getPageNumbers(currentPage: number, totalPages: number): Array<number> {
  const pages: Array<number> = [];
  const maxPagesToShow = 5;

  if (totalPages <= maxPagesToShow) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);

    if (currentPage > 3) {
      pages.push(-1); // Ellipsis marker
    }

    // Show pages around current page
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push(-1); // Ellipsis marker
    }

    // Always show last page
    pages.push(totalPages);
  }

  return pages;
}

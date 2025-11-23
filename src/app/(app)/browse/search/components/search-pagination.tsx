'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

type SearchPaginationProps = ComponentTestIdProps & {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
  page: number;
  totalPages: number;
};

export const SearchPagination = ({
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  page,
  testId,
  totalPages,
}: SearchPaginationProps) => {
  // Test ID generation
  const paginationTestId = testId || generateTestId('feature', 'search-results', 'pagination');

  // Event handlers
  const handlePreviousPage = () => {
    if (hasPreviousPage) {
      onPageChange(page - 1);
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      onPageChange(page + 1);
    }
  };

  const handlePageClick = (pageNumber: number) => {
    onPageChange(pageNumber);
  };

  // Utility functions
  const generatePageNumbers = (): Array<number | string> => {
    const pages: Array<number | string> = [];
    const maxPagesToShow = 7;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (page > 3) {
        pages.push('...');
      }

      // Show pages around current page
      const startPage = Math.max(2, page - 1);
      const endPage = Math.min(totalPages - 1, page + 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  // Derived variables for conditional rendering
  const _isPaginationVisible = totalPages > 1;
  const _pageNumbers = generatePageNumbers();

  return (
    <Conditional isCondition={_isPaginationVisible}>
      <nav
        aria-label={'Search results pagination'}
        className={'flex flex-col items-center gap-3 sm:flex-row sm:justify-center'}
        data-slot={'search-pagination'}
        data-testid={paginationTestId}
      >
        {/* Mobile-Optimized Pagination: Previous/Current/Total/Next */}
        <div
          className={'flex w-full items-center justify-between gap-2 sm:hidden'}
          data-slot={'search-pagination-mobile'}
          data-testid={`${paginationTestId}-mobile`}
        >
          {/* Previous Button - Mobile */}
          <Button
            aria-label={'Go to previous page'}
            className={'min-h-11 min-w-11 flex-shrink-0 gap-1.5'}
            data-slot={'search-pagination-prev'}
            data-testid={`${paginationTestId}-prev-mobile`}
            disabled={!hasPreviousPage}
            onClick={handlePreviousPage}
            size={'sm'}
            variant={'outline'}
          >
            <ChevronLeft aria-hidden className={'size-4'} />
            <span>Prev</span>
          </Button>

          {/* Current Page Indicator - Mobile */}
          <span
            className={'text-sm font-medium text-muted-foreground'}
            data-slot={'search-pagination-indicator'}
            data-testid={`${paginationTestId}-indicator`}
          >
            Page {page} of {totalPages}
          </span>

          {/* Next Button - Mobile */}
          <Button
            aria-label={'Go to next page'}
            className={'min-h-11 min-w-11 flex-shrink-0 gap-1.5'}
            data-slot={'search-pagination-next'}
            data-testid={`${paginationTestId}-next-mobile`}
            disabled={!hasNextPage}
            onClick={handleNextPage}
            size={'sm'}
            variant={'outline'}
          >
            <span>Next</span>
            <ChevronRight aria-hidden className={'size-4'} />
          </Button>
        </div>

        {/* Desktop Pagination: Full Page Numbers */}
        <div
          className={'hidden items-center gap-2 sm:flex'}
          data-slot={'search-pagination-desktop'}
          data-testid={`${paginationTestId}-desktop`}
        >
          {/* Previous Button - Desktop */}
          <Button
            aria-label={'Go to previous page'}
            className={'min-h-9 min-w-9'}
            data-slot={'search-pagination-prev'}
            data-testid={`${paginationTestId}-prev`}
            disabled={!hasPreviousPage}
            onClick={handlePreviousPage}
            size={'sm'}
            variant={'outline'}
          >
            <ChevronLeft aria-hidden className={'size-4'} />
            <span className={'sr-only'}>Previous page</span>
          </Button>

          {/* Page Numbers - Desktop */}
          <div className={'flex items-center gap-1'}>
            {_pageNumbers.map((pageNumber, index) =>
              pageNumber === '...' ?
                <span
                  className={'px-2 text-sm text-muted-foreground'}
                  data-slot={'search-pagination-ellipsis'}
                  key={`ellipsis-${index}`}
                >
                  {pageNumber}
                </span>
              : <Button
                  aria-current={pageNumber === page ? 'page' : undefined}
                  aria-label={`Go to page ${pageNumber}`}
                  className={cn('size-9', pageNumber === page && 'bg-primary text-primary-foreground')}
                  data-slot={'search-pagination-page'}
                  data-testid={`${paginationTestId}-page-${pageNumber}`}
                  key={pageNumber}
                  onClick={() => handlePageClick(pageNumber as number)}
                  size={'sm'}
                  variant={pageNumber === page ? 'default' : 'outline'}
                >
                  {pageNumber}
                </Button>,
            )}
          </div>

          {/* Next Button - Desktop */}
          <Button
            aria-label={'Go to next page'}
            className={'min-h-9 min-w-9'}
            data-slot={'search-pagination-next'}
            data-testid={`${paginationTestId}-next`}
            disabled={!hasNextPage}
            onClick={handleNextPage}
            size={'sm'}
            variant={'outline'}
          >
            <ChevronRight aria-hidden className={'size-4'} />
            <span className={'sr-only'}>Next page</span>
          </Button>
        </div>
      </nav>
    </Conditional>
  );
};

'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { cn } from '@/utils/tailwind-utils';

interface SearchPaginationProps {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
  page: number;
  totalPages: number;
}

export const SearchPagination = ({
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  page,
  totalPages,
}: SearchPaginationProps) => {
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
      <div className={'flex items-center justify-center gap-2'}>
        {/* Previous Button */}
        <Button disabled={!hasPreviousPage} onClick={handlePreviousPage} size={'sm'} variant={'outline'}>
          <ChevronLeft className={'size-4'} />
          <span className={'sr-only'}>Previous page</span>
        </Button>

        {/* Page Numbers */}
        <div className={'flex items-center gap-1'}>
          {_pageNumbers.map((pageNumber, index) =>
            pageNumber === '...' ?
              <span className={'px-2 text-sm text-muted-foreground'} key={`ellipsis-${index}`}>
                {pageNumber}
              </span>
            : <Button
                className={cn('size-9', pageNumber === page && 'bg-primary text-primary-foreground')}
                key={pageNumber}
                onClick={() => handlePageClick(pageNumber as number)}
                size={'sm'}
                variant={pageNumber === page ? 'default' : 'outline'}
              >
                {pageNumber}
              </Button>,
          )}
        </div>

        {/* Next Button */}
        <Button disabled={!hasNextPage} onClick={handleNextPage} size={'sm'} variant={'outline'}>
          <ChevronRight className={'size-4'} />
          <span className={'sr-only'}>Next page</span>
        </Button>
      </div>
    </Conditional>
  );
};

'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BrowseCollectionsPaginationProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export function BrowseCollectionsPagination({
  currentPage,
  onPageChange,
  onPageSizeChange,
  pageSize,
  totalCount,
  totalPages,
}: BrowseCollectionsPaginationProps) {
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  const getPageNumbers = () => {
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
  };

  if (totalCount === 0) {
    return null;
  }

  return (
    <div className={'flex flex-col items-center justify-between gap-4 sm:flex-row'}>
      {/* Results info */}
      <div className={'text-sm text-muted-foreground'}>
        Showing <span className={'font-medium text-foreground'}>{startItem}</span> to{' '}
        <span className={'font-medium text-foreground'}>{endItem}</span> of{' '}
        <span className={'font-medium text-foreground'}>{totalCount}</span> collections
      </div>

      <div className={'flex items-center gap-4'}>
        {/* Page size selector */}
        <div className={'flex items-center gap-2'}>
          <span className={'text-sm text-muted-foreground'}>Per page:</span>
          <Select onValueChange={(value) => onPageSizeChange(Number(value))} value={String(pageSize)}>
            <SelectTrigger className={'w-20'}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={'12'}>12</SelectItem>
              <SelectItem value={'24'}>24</SelectItem>
              <SelectItem value={'48'}>48</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Pagination controls */}
        <div className={'flex items-center gap-1'}>
          <Button
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            size={'icon'}
            variant={'outline'}
          >
            <ChevronLeft className={'size-4'} />
          </Button>

          {getPageNumbers().map((page, index) => {
            if (page === -1) {
              return (
                <span className={'px-2 text-muted-foreground'} key={`ellipsis-${index}`}>
                  ...
                </span>
              );
            }

            return (
              <Button
                key={page}
                onClick={() => onPageChange(page)}
                size={'icon'}
                variant={page === currentPage ? 'default' : 'outline'}
              >
                {page}
              </Button>
            );
          })}

          <Button
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            size={'icon'}
            variant={'outline'}
          >
            <ChevronRight className={'size-4'} />
          </Button>
        </div>
      </div>
    </div>
  );
}

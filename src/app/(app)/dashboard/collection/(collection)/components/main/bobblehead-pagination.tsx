'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getPageNumbers } from '@/lib/utils/pagination.utils';

interface BobbleheadPaginationProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export const BobbleheadPagination = ({
  currentPage,
  onPageChange,
  onPageSizeChange,
  pageSize,
  totalCount,
  totalPages,
}: BobbleheadPaginationProps) => {
  const endItem = useMemo(() => {
    return Math.min(currentPage * pageSize, totalCount);
  }, [totalCount, currentPage, pageSize]);

  const pagesNumbers = useMemo(() => {
    return getPageNumbers(currentPage, totalPages);
  }, [currentPage, totalPages]);

  const startItem = useMemo(() => {
    return totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  }, [totalCount, currentPage, pageSize]);

  if (totalCount === 0) {
    return null;
  }

  return (
    <div
      className={`sticky bottom-0 z-10 flex flex-col items-center justify-between gap-4
        border-t bg-background/95 p-4 backdrop-blur-sm sm:flex-row`}
    >
      {/* Results info */}
      <div className={'text-sm text-muted-foreground'}>
        Showing <span className={'font-medium text-foreground'}>{startItem}</span> to{' '}
        <span className={'font-medium text-foreground'}>{endItem}</span> of{' '}
        <span className={'font-medium text-foreground'}>{totalCount}</span> bobbleheads
      </div>

      <div className={'flex items-center gap-4'}>
        {/* Page size selector */}
        <div className={'flex items-center gap-2'}>
          <span className={'text-sm text-muted-foreground'}>Per page:</span>
          <Select
            onValueChange={(value) => {
              onPageSizeChange(Number(value));
            }}
            value={String(pageSize)}
          >
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
            onClick={() => {
              onPageChange(currentPage - 1);
            }}
            size={'icon'}
            variant={'outline'}
          >
            <ChevronLeft aria-hidden className={'size-4'} />
          </Button>

          {pagesNumbers.map((page, index) => {
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
                onClick={() => {
                  onPageChange(page);
                }}
                size={'icon'}
                variant={page === currentPage ? 'default' : 'outline'}
              >
                {page}
              </Button>
            );
          })}

          <Button
            disabled={currentPage === totalPages}
            onClick={() => {
              onPageChange(currentPage + 1);
            }}
            size={'icon'}
            variant={'outline'}
          >
            <ChevronRight aria-hidden className={'size-4'} />
          </Button>
        </div>
      </div>
    </div>
  );
};

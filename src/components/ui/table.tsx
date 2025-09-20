import * as React from 'react';

import { cn } from '@/utils/tailwind-utils';

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  ref?: React.Ref<HTMLTableElement>;
}

export const Table = ({ className, ...props }: TableProps) => (
  <div className={'relative w-full overflow-auto'}>
    <table className={cn('w-full caption-bottom text-sm', className)} {...props} />
  </div>
);

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  ref?: React.Ref<HTMLTableSectionElement>;
}

export const TableHeader = ({ className, ...props }: TableHeaderProps) => (
  <thead className={cn('[&_tr]:border-b', className)} {...props} />
);

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  ref?: React.Ref<HTMLTableSectionElement>;
}

export const TableBody = ({ className, ...props }: TableBodyProps) => (
  <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />
);

interface TableFooterProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  ref?: React.Ref<HTMLTableSectionElement>;
}

export const TableFooter = ({ className, ...props }: TableFooterProps) => (
  <tfoot className={cn('border-t bg-muted/50 font-medium [&>tr]:last:border-b-0', className)} {...props} />
);

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  ref?: React.Ref<HTMLTableRowElement>;
}

export const TableRow = ({ className, ...props }: TableRowProps) => (
  <tr
    className={cn(
      'border-b transition-colors hover:bg-muted/50',
      'data-[state=selected]:bg-muted',
      className,
    )}
    {...props}
  />
);

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  ref?: React.Ref<HTMLTableCellElement>;
}

export const TableHead = ({ className, ...props }: TableHeadProps) => (
  <th
    className={cn(
      'h-12 px-4 text-left align-middle font-medium text-muted-foreground',
      '[&:has([role=checkbox])]:pr-0',
      className,
    )}
    {...props}
  />
);

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  ref?: React.Ref<HTMLTableCellElement>;
}

export const TableCell = ({ className, ...props }: TableCellProps) => (
  <td className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)} {...props} />
);

interface TableCaptionProps extends React.HTMLAttributes<HTMLTableCaptionElement> {
  ref?: React.Ref<HTMLTableCaptionElement>;
}

export const TableCaption = ({ className, ...props }: TableCaptionProps) => (
  <caption className={cn('mt-4 text-sm text-muted-foreground', className)} {...props} />
);

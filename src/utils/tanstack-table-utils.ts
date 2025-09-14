import type { RowData } from '@tanstack/table-core';

// @ts-expect-error - its there I promise
declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-object-type
  interface ColumnMeta<TData extends RowData, TValue> {}
}

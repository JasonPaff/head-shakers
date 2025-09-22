import type { RowData } from '@tanstack/table-core';

// @ts-expect-error augmenting module
declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-object-type
  interface ColumnMeta<TData extends RowData, TValue> {}
}

import type { MouseEvent, ReactNode } from 'react';

declare global {
  type ButtonMouseEvent = MouseEvent<HTMLButtonElement, globalThis.MouseEvent>;
  type Children<TProps = NonNullable<unknown>> = Readonly<{ children?: ReactNode | undefined }> & TProps;
  type ClassName<TProps = NonNullable<unknown>> = Readonly<{ className?: string | undefined }> & TProps;
  type Prettify<T> = {
    [K in keyof T]: T[K];
  } & {};
  type RequiredChildren<TProps = NonNullable<unknown>> = Readonly<{ children: ReactNode }> & TProps;
}

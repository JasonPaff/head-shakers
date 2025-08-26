import type { MouseEvent, ReactNode } from 'react';

declare global {
  type ButtonMouseEvent = MouseEvent<HTMLButtonElement, globalThis.MouseEvent>;
  type Children<TProps = NonNullable<unknown>> = Readonly<{ children?: ReactNode | undefined }> & TProps;
  type Classname<TProps = NonNullable<unknown>> = Readonly<{ classname?: string | undefined }> & TProps;
  type LayoutProps = Readonly<{ children: ReactNode }>;
  type RequiredChildren<TProps = NonNullable<unknown>> = Readonly<{ children: ReactNode }> & TProps;
}

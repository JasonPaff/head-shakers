import type { ReactNode } from 'react';

declare global {
  type Children<TProps = NonNullable<unknown>> = Readonly<{ children?: ReactNode | undefined }> & TProps;
  type Classname<TProps = NonNullable<unknown>> = Readonly<{ classname?: string | undefined }> & TProps;
}

import type { ReactNode } from 'react';

export declare type Children<TProps = NonNullable<unknown>> = Readonly<{ children?: ReactNode | undefined }> & TProps;

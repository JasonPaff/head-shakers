import type { ReactNode} from "react";

export declare type Children<TProps = NonNullable<unknown>> = TProps & Readonly<{ children?: ReactNode | undefined }>


import type { ComponentProps } from 'react';

import { ClerkProvider as ClerkNextJSProvider } from '@clerk/nextjs';
import { shadcn } from '@clerk/themes';

type ClerkProviderProps = ComponentProps<typeof ClerkNextJSProvider>;

export function ClerkProvider({ appearance, children, ...props }: ClerkProviderProps) {
  return (
    <ClerkNextJSProvider
      appearance={{
        theme: shadcn,
        ...appearance,
      }}
      {...props}
    >
      {children}
    </ClerkNextJSProvider>
  );
}

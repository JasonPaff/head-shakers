'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { getQueryClient } from '@/utils/tanstack-query-utils';

const queryClient = getQueryClient();

type TanstackQueryProviderProps = RequiredChildren;

export const TanstackQueryProvider = ({ children }: TanstackQueryProviderProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools buttonPosition={'bottom-right'} />
    </QueryClientProvider>
  );
};

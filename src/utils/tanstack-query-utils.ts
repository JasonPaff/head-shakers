import { defaultShouldDehydrateQuery, isServer, QueryClient } from '@tanstack/react-query';

const makeQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      dehydrate: {
        // include pending queries in dehydration
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
      },
      queries: {
        experimental_prefetchInRender: true,
        gcTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
        staleTime: 0, // 1000 * 60, // 1 minute
        throwOnError: false,
      },
    },
  });
};

let browserQueryClient: QueryClient | undefined = undefined;

export const getQueryClient = () => {
  if (isServer) {
    // server: always make a new query client
    return makeQueryClient();
  } else {
    // browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
};

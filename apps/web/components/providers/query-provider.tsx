/** biome-ignore-all lint/style/noExportedImports: This file is meant to re-export the query client provider and dehydrate function for use in other parts of the app. */
"use client";

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000,
      },
    },
  });

export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = makeQueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export { dehydrate, HydrationBoundary };

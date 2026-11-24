import { QueryClient } from '@tanstack/react-query';

/*
|--------------------------------------------------------------------------
| QueryClient
|--------------------------------------------------------------------------
| `react-query` was already a dependency but was never actually mounted —
| no QueryClientProvider existed anywhere, so nothing could use useQuery.
|
| Defaults chosen for this app:
| - staleTime 60s  → admin lists don't refetch on every tab switch.
| - retry: don't retry 4xx (auth / validation errors are not transient),
|   retry 5xx twice.
| - refetchOnWindowFocus off → this is a dashboard used on mobile; constant
|   refetching on focus burns the free Render backend's cold-start quota.
*/

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        const status = (error as { response?: { status?: number } })?.response?.status;

        // Never retry client errors — they will fail identically every time.
        if (status && status >= 400 && status < 500) return false;

        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

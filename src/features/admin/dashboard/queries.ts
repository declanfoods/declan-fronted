import { useQuery } from '@tanstack/react-query';
import { queryClient } from '../../../app/lib/query-client';
import { adminDashboardApi } from './api';

const overviewKey = ['admin', 'dashboard', 'overview'] as const;

export function useAdminDashboardOverview() {
  return useQuery({
    queryKey: overviewKey,
    queryFn: async ({ signal }) => {
      const { data } = await adminDashboardApi.getOverview(signal);
      if (data.success === false) throw new Error(data.message || 'Could not load the dashboard.');

      return data.data;
    },
  });
}

export function refreshAdminDashboard() {
  return queryClient.invalidateQueries({ queryKey: overviewKey });
}

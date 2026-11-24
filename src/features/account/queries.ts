import { useQuery } from '@tanstack/react-query';
import { queryClient } from '../../app/lib/query-client';
import { isAuthenticated } from '../auth/session';
import { userApi } from './api/userApi';

const profileKey = ['customer', 'profile', 'overview'] as const;

export function useCustomerProfile() {
  return useQuery({
    queryKey: profileKey,
    enabled: isAuthenticated(),
    queryFn: async ({ signal }) => {
      const { data } = await userApi.getProfileOverview(signal);
      if (data.success === false) throw new Error(data.message || 'Could not load your profile.');
      return data.data?.user ?? null;
    },
    staleTime: 30 * 60_000,
  });
}

export function refreshCustomerProfile() {
  return queryClient.invalidateQueries({ queryKey: profileKey });
}

import { useQuery } from '@tanstack/react-query';
import { queryClient } from '../../app/lib/query-client';
import { cartApi } from './api/cartApi';

const accountCartKey = ['cart', 'account'] as const;

export function useAccountCart(enabled: boolean) {
  return useQuery({
    queryKey: accountCartKey,
    enabled,
    staleTime: 0,
    retry: false,
    queryFn: async ({ signal }) => {
      const { data } = await cartApi.getCart(signal);
      return data.data.cart ?? null;
    },
  });
}

export function refreshAccountCart() {
  return queryClient.invalidateQueries({ queryKey: accountCartKey });
}

export function resetCartQueries() {
  queryClient.removeQueries({ queryKey: ['cart'] });
}

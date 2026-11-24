import { useQuery } from '@tanstack/react-query';
import { productApi } from '../catalogue/api/productApi';

export function useDashboardRecommendations(authenticated: boolean) {
  const essentials = useQuery({
    queryKey: authenticated
      ? ['customer', 'dashboard', 'essentials']
      : ['catalogue', 'guest-essentials'],
    queryFn: async ({ signal }) => {
      const { data } = await productApi.getEssentials(signal);
      if (data.success === false) throw new Error(data.message || 'Could not load essentials.');
      return data.data?.products ?? [];
    },
  });

  const previousPurchases = useQuery({
    queryKey: ['customer', 'dashboard', 'previous-purchases'],
    enabled: authenticated,
    queryFn: async ({ signal }) => {
      const { data } = await productApi.getPreviouslyPurchased(signal);
      if (data.success === false) throw new Error(data.message || 'Could not load previous purchases.');
      return data.data?.products ?? [];
    },
  });

  return { essentials, previousPurchases };
}

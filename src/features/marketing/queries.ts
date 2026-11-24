import { useQuery } from '@tanstack/react-query';
import { isAuthenticated } from '../auth/session';
import { productApi } from '../catalogue/api/productApi';

export function useLandingProducts() {
  const signedIn = isAuthenticated();
  const deals = useQuery({
    queryKey: signedIn ? ['customer', 'marketing', 'deals'] : ['catalogue', 'marketing', 'deals'],
    queryFn: async ({ signal }) => {
      const { data } = await (signedIn
        ? productApi.getEssentials(signal)
        : productApi.getProducts({ limit: 8 }, signal));
      if (data.success === false) throw new Error(data.message || 'Could not load deals.');
      return data.data?.products ?? [];
    },
  });
  const hottest = useQuery({
    queryKey: ['catalogue', 'marketing', 'hottest'],
    queryFn: async ({ signal }) => {
      const { data } = await productApi.getProducts({ sortBy: 'rating', sortOrder: 'desc', limit: 8 }, signal);
      if (data.success === false) throw new Error(data.message || 'Could not load products.');
      return data.data?.products ?? [];
    },
  });
  return { deals, hottest };
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAuthenticated } from '../../auth/session';
import { savedApi, type SavedProduct } from './api';

const savedProductsKey = ['customer', 'saved-products'] as const;

export function useSavedProducts() {
  return useQuery({
    queryKey: savedProductsKey,
    enabled: isAuthenticated(),
    queryFn: async ({ signal }) => {
      const { data } = await savedApi.getSavedProducts(signal);
      if (data?.success === false) throw new Error(data.message || 'Could not load saved products.');
      const payload = data?.data;
      const items = Array.isArray(payload) ? payload : payload?.items;
      return Array.isArray(items) ? items.filter((item) => item?.product?.id) : [];
    },
  });
}

export function useSaveProduct() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const { data } = await savedApi.saveProduct(productId);
      if (data?.success === false) throw new Error(data.message || 'Could not save the product.');
    },
    onSuccess: () => client.invalidateQueries({ queryKey: savedProductsKey }),
  });
}

export function useRemoveSavedProduct() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: async (savedItemId: string) => {
      const { data } = await savedApi.removeSavedProduct(savedItemId);
      if (data?.success === false) throw new Error(data.message || 'Could not remove the product.');
    },
    onSuccess: async (_, id) => {
      client.setQueryData<SavedProduct[]>(savedProductsKey, (items) =>
        items?.filter((item) => item.id !== id),
      );
      await client.invalidateQueries({ queryKey: savedProductsKey });
    },
  });
}

import { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getApiErrorMessage } from '../../app/lib/api-types';
import { reorderCartApi, type ReorderCartItem } from './api/reorderCartApi';

const reorderCartKey = ['cart', 'reorder'] as const;

export function useReorderCart(enabled: boolean, reportError: (message: string) => void) {
  const queryClient = useQueryClient();
  const [pendingItem, setPendingItem] = useState<string | null>(null);
  const inFlight = useRef(false);
  const query = useQuery({
    queryKey: reorderCartKey,
    enabled,
    staleTime: 0,
    retry: false,
    queryFn: async ({ signal }) => {
      const { data } = await reorderCartApi.getReorderCart(signal);
      return data.data.cart ?? null;
    },
  });

  async function updateCart(
    itemId: string,
    action: () => ReturnType<typeof reorderCartApi.updateReorderItem>,
    fallback: string,
  ) {
    if (inFlight.current) return;
    inFlight.current = true;
    setPendingItem(itemId);
    try {
      await queryClient.cancelQueries({ queryKey: reorderCartKey });
      const { data } = await action();
      queryClient.setQueryData(reorderCartKey, data.data.cart);
    } catch (error) {
      reportError(getApiErrorMessage(error, fallback));
    } finally {
      inFlight.current = false;
      setPendingItem(null);
    }
  }

  return {
    cart: query.data,
    loading: query.isPending || query.isFetching,
    error: query.isError ? getApiErrorMessage(query.error, 'Could not load your reorder cart.') : '',
    retry: () => query.refetch(),
    pendingItem,
    changeQuantity: (item: ReorderCartItem, delta: 1 | -1) => {
      if (delta === -1 && item.quantity <= 1) return;
      return updateCart(
        item.id,
        () => reorderCartApi.updateReorderItem(item.id, {
          quantity: 1,
          operationType: delta === 1 ? 'INCREMENT' : 'DECREMENT',
        }),
        'Could not update that item.',
      );
    },
    remove: (id: string) => updateCart(
      id,
      () => reorderCartApi.removeReorderItem(id),
      'Could not remove that item.',
    ),
  };
}

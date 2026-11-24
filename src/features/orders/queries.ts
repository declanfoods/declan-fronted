import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { orderApi } from './api/orderApi';
import { userApi } from '../account/api/userApi';
import { getOrderTimeline } from './orderPresentation';

const ordersKey = ['customer', 'orders'] as const;
const PAGE_SIZE = 10;

export function useOrdersOverview(enabled: boolean) {
  return useQuery({
    queryKey: [...ordersKey, 'overview'],
    enabled,
    staleTime: 0,
    queryFn: async ({ signal }) => {
      const { data } = await userApi.getOrdersOverview(signal);
      if (data.success === false) throw new Error(data.message || 'Could not load orders.');
      return data.data?.orders ?? [];
    },
  });
}

export function useOrderHistory(enabled: boolean, page: number) {
  const active = useQuery({
    queryKey: [...ordersKey, 'active'],
    enabled,
    staleTime: 0,
    retry: false,
    queryFn: async ({ signal }) => {
      try {
        const { data } = await orderApi.getActiveOrder(signal);
        return data?.data?.order ?? null;
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 404) return null;
        throw error;
      }
    },
  });
  const history = useQuery({
    queryKey: [...ordersKey, 'history', page],
    enabled,
    staleTime: 0,
    retry: false,
    queryFn: async ({ signal }) => {
      const { data } = await orderApi.getOrders({ page, limit: PAGE_SIZE }, signal);
      return {
        orders: data?.data?.orders ?? [],
        totalPages: data?.data?.pagination?.totalPages ?? 1,
      };
    },
  });
  return { active, history };
}

export function useOrderDetails(orderId: string, poll = false) {
  return useQuery({
    queryKey: [...ordersKey, 'detail', orderId],
    enabled: !!orderId,
    staleTime: 0,
    retry: false,
    refetchInterval: poll ? 30_000 : false,
    refetchIntervalInBackground: poll,
    queryFn: async ({ signal }) => {
      const { data } = await orderApi.getOrderById(orderId, signal);
      if (!data?.data?.order) return null;
      return { order: data.data.order, timeline: getOrderTimeline(data.data) };
    },
  });
}

export function useCancelOrder(orderId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) => orderApi.cancelOrder(orderId, { reason: reason || undefined }),
    onSuccess: () => client.invalidateQueries({ queryKey: ordersKey }),
  });
}

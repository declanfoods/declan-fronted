import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query';
import { adminUserApi } from '../lib/adminUserApi';
import type {
  AdminUserActivity,
  AdminUserDetail,
  AdminUserFilters,
  AdminUserListItem,
  AdminUserMetrics,
  AdminUserOrder,
  AdminUserReferral,
  AdminUserReferralTransaction,
  AdminUserTransaction,
  AdminUserWallet,
} from '../lib/adminUserApi';
import type { ApiPagination } from '../lib/api-types';
import { queryKeys } from '../lib/query-client';


function wasParamRejection(error: unknown): boolean {
  const status = (error as { response?: { status?: number } })?.response?.status;
  return status === 400 || status === 422;
}

export function useAdminUsers(filters?: AdminUserFilters) {
  return useQuery<{ users: AdminUserListItem[]; pagination: ApiPagination }, Error>({
    queryKey: queryKeys.adminUsers(filters as Record<string, unknown> | undefined),
    queryFn: async () => {
      try {
        const res = await adminUserApi.getUsers(filters);
        return res.data.data;
      } catch (error) {
        
        const sentParams = Boolean(
          filters && (filters.page || filters.limit || filters.search || filters.status)
        );

        if (sentParams && wasParamRejection(error)) {
          console.warn(
            '[admin] GET /admin/users rejected our query params (HTTP ' +
              (error as { response?: { status?: number } })?.response?.status +
              '). Retrying without them — pagination and search will be handled client-side. ' +
              'Report this to the backend team.'
          );

          const fallback = await adminUserApi.getUsers();
          return fallback.data.data;
        }

        throw error;
      }
    },
   
    placeholderData: (previous) => previous,
  });
}

export function useAdminUserMetrics(): UseQueryResult<AdminUserMetrics, Error> {
  return useQuery({
    queryKey: queryKeys.adminUserMetrics,
    queryFn: async () => {
      const res = await adminUserApi.getUserMetrics();
      return res.data.data;
    },
  });
}

export function useAdminUser(id?: string): UseQueryResult<AdminUserDetail, Error> {
  return useQuery({
    queryKey: queryKeys.adminUser(id ?? ''),
    queryFn: async () => {
      const res = await adminUserApi.getUserById(id as string);
      return res.data.data.user;
    },
    enabled: Boolean(id),
  });
}

export function useAdminUserOrders(id?: string) {
  return useQuery<AdminUserOrder[], Error>({
    queryKey: queryKeys.adminUserOrders(id ?? ''),
    queryFn: async () => {
      const res = await adminUserApi.getUserOrders(id as string);
      return res.data.data.orders;
    },
    enabled: Boolean(id),
  });
}

export function useAdminUserActivities(
  id?: string,
  filters?: { page?: number; limit?: number }
) {
  return useQuery<{ activities: AdminUserActivity[]; pagination: ApiPagination }, Error>({
    queryKey: queryKeys.adminUserActivities(id ?? '', filters),
    queryFn: async () => {
      const res = await adminUserApi.getUserActivities(id as string, filters);
      return res.data.data;
    },
    enabled: Boolean(id),
    placeholderData: (previous) => previous,
  });
}

export function useAdminUserTransactions(
  id?: string,
  filters?: { page?: number; limit?: number }
) {
  return useQuery<{ transactions: AdminUserTransaction[]; pagination: ApiPagination }, Error>({
    queryKey: queryKeys.adminUserTransactions(id ?? '', filters),
    queryFn: async () => {
      const res = await adminUserApi.getUserTransactions(id as string, filters);
      return res.data.data;
    },
    enabled: Boolean(id),
    placeholderData: (previous) => previous,
  });
}

export function useAdminUserWallet(id?: string): UseQueryResult<AdminUserWallet, Error> {
  return useQuery({
    queryKey: queryKeys.adminUserWallet(id ?? ''),
    queryFn: async () => {
      const res = await adminUserApi.getUserWallet(id as string);
      return res.data.data.wallet;
    },
    enabled: Boolean(id),
  });
}


export function useAdminUserReferrals(id?: string) {
  return useQuery<AdminUserReferral[], Error>({
    queryKey: queryKeys.adminUserReferrals(id ?? ''),
    queryFn: async () => {
      const res = await adminUserApi.getUserReferrals(id as string);
      const payload = res.data.data as {
        referral?: AdminUserReferral[];
        referrals?: AdminUserReferral[];
      };

      return payload.referral ?? payload.referrals ?? [];
    },
    enabled: Boolean(id),
  });
}

export function useAdminUserReferralTransactions(
  id?: string,
  filters?: { page?: number; limit?: number }
) {
  return useQuery<
    { transactions: AdminUserReferralTransaction[]; pagination: ApiPagination },
    Error
  >({
    queryKey: queryKeys.adminUserReferralTransactions(id ?? '', filters),
    queryFn: async () => {
      const res = await adminUserApi.getUserReferralTransactions(id as string, filters);
      const payload = res.data.data as {
        referral_transactions?: AdminUserReferralTransaction[];
        referralTransactions?: AdminUserReferralTransaction[];
        pagination: ApiPagination;
      };

      return {
        transactions:
          payload.referral_transactions ?? payload.referralTransactions ?? [],
        pagination: payload.pagination,
      };
    },
    enabled: Boolean(id),
    placeholderData: (previous) => previous,
  });
}



function useInvalidateUser() {
  const queryClient = useQueryClient();

  return (userId?: string) => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });

    if (userId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUser(userId) });
    }
  };
}

export function useSuspendUser() {
  const invalidate = useInvalidateUser();

  return useMutation({
    mutationFn: (userId: string) => adminUserApi.suspendUser(userId),
    onSuccess: (_res, userId) => invalidate(userId),
  });
}

export function useUnsuspendUser() {
  const invalidate = useInvalidateUser();

  return useMutation({
    mutationFn: (userId: string) => adminUserApi.unsuspendUser(userId),
    onSuccess: (_res, userId) => invalidate(userId),
  });
}

export function useVerifyUser() {
  const invalidate = useInvalidateUser();

  return useMutation({
    mutationFn: (userId: string) => adminUserApi.verifyUser(userId),
    onSuccess: (_res, userId) => invalidate(userId),
  });
}
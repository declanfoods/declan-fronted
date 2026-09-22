import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query';
import {
  adminPaymentApi,
  extractPaymentMethods,
  type AdminPaymentMethod,
  type CreatePaymentMethodPayload,
} from '../lib/adminPaymentApi';
import { queryKeys } from '../lib/query-client';


export function useAdminPaymentMethods(): UseQueryResult<AdminPaymentMethod[], Error> {
  return useQuery<AdminPaymentMethod[], Error>({
    queryKey: queryKeys.adminPaymentMethods,
    queryFn: async () => {
      const res = await adminPaymentApi.getPaymentMethods();
      return extractPaymentMethods(res.data.data);
    },
  });
}

export function useCreatePaymentMethod() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePaymentMethodPayload) =>
      adminPaymentApi.createPaymentMethod({
        title: payload.title.trim(),
        description: payload.description.trim(),
        isActive: payload.isActive,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.adminPaymentMethods });
    },
  });
}


export function useTogglePaymentMethod() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      active
        ? adminPaymentApi.activatePaymentMethod(id)
        : adminPaymentApi.deactivatePaymentMethod(id),

    onMutate: async ({ id, active }) => {
      
      await qc.cancelQueries({ queryKey: queryKeys.adminPaymentMethods });

      const previous = qc.getQueryData<AdminPaymentMethod[]>(
        queryKeys.adminPaymentMethods
      );

      qc.setQueryData<AdminPaymentMethod[]>(
        queryKeys.adminPaymentMethods,
        (rows) =>
          rows?.map((row) => (row.id === id ? { ...row, isActive: active } : row)) ??
          rows
      );

      
      return { previous };
    },

    onError: (_err, _vars, context) => {
      const previous = (context as { previous?: AdminPaymentMethod[] } | undefined)
        ?.previous;

      if (previous) {
        qc.setQueryData(queryKeys.adminPaymentMethods, previous);
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.adminPaymentMethods });
    },
  });
}
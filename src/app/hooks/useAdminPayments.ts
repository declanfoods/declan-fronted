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

/*
|==========================================================================
| Admin payment method hooks
|==========================================================================
| Backs the admin Payments screen. Four calls, all documented, all confirmed
| present on the live server.
|
| ⚠️ Toggling active state does NOT re-fetch the whole list. See the note on
|    `useTogglePaymentMethod` — it patches the cached row.
*/

/** GET /api/v1/admin/payments/payment-methods */
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
        // Trimmed here rather than at the call site so every path is covered.
        title: payload.title.trim(),
        description: payload.description.trim(),
        isActive: payload.isActive,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.adminPaymentMethods });
    },
  });
}

/**
 * Activate / deactivate.
 *
 * ⚠️ The response body for these two is not documented, so this does NOT read
 * it. Instead the cached row is patched directly, which:
 *   • works whether the endpoint returns the updated method, `{}`, or nothing;
 *   • flips the switch on screen instantly instead of after a round-trip.
 *
 * `onSettled` then re-fetches so the screen ends up agreeing with the server
 * even if the optimistic flip was wrong. That ordering matters — invalidating
 * only on success would leave a failed toggle showing the wrong state.
 */
export function useTogglePaymentMethod() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      active
        ? adminPaymentApi.activatePaymentMethod(id)
        : adminPaymentApi.deactivatePaymentMethod(id),

    onMutate: async ({ id, active }) => {
      // Stop an in-flight list fetch from overwriting the flip.
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

      // Returned as context so onError can roll back.
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
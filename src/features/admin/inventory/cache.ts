import { queryClient } from '../../../app/lib/query-client';
import { refreshAdminDashboard } from '../dashboard/queries';

export const inventoryKey = ['admin', 'inventory'] as const;

export async function refreshAfterInventoryWrite<T extends { data: unknown }>(request: Promise<T>) {
  const response = await request;
  const { data } = response;
  if (!(data && typeof data === 'object' && 'success' in data && data.success === false)) {
    void queryClient.invalidateQueries({ queryKey: inventoryKey });
    void refreshAdminDashboard();
    void queryClient.invalidateQueries({ queryKey: ['catalogue'] });
  }
  return response;
}

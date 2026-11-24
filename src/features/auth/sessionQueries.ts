import { queryClient } from '../../app/lib/query-client';
import type { SessionRole } from './session';

export function clearSessionQueries(role: SessionRole) {
  queryClient.removeQueries({ queryKey: [role] });
}

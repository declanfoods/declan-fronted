import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoryApi } from './api';
import type { CategoryKind } from './types';

const categoryKey = (kind: CategoryKind) => ['admin', 'categories', kind] as const;

export function useCategoryOverview(kind: CategoryKind) {
  return useQuery({
    queryKey: [...categoryKey(kind), 'overview'],
    queryFn: () => categoryApi.getOverview(kind),
  });
}

export function useCategoryQueries(kind: CategoryKind) {
  const categories = useCategoryOverview(kind);
  const metrics = useQuery({
    queryKey: [...categoryKey(kind), 'metrics'],
    queryFn: () => categoryApi.getMetrics(kind),
  });

  return { categories, metrics };
}

export function useCategoryMutations(kind: CategoryKind) {
  const queryClient = useQueryClient();
  const invalidateCategories = () => {
    void queryClient.invalidateQueries({ queryKey: categoryKey(kind) });
  };

  const create = useMutation({
    mutationFn: (name: string) => categoryApi.create(kind, name),
    onSuccess: invalidateCategories,
  });
  const rename = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      categoryApi.rename(kind, id, name),
    onSuccess: invalidateCategories,
  });
  const remove = useMutation({
    mutationFn: ({ id, fallbackCategoryId }: { id: string; fallbackCategoryId: string }) =>
      categoryApi.remove(kind, id, fallbackCategoryId),
    onSuccess: () => {
      // Deletion also moves items, so cached admin catalogue data needs refreshing.
      void queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
  });

  return { create, rename, remove };
}

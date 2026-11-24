export type CategoryKind = 'products' | 'food-packs';

export type CategoryOption = {
  id: string;
  name: string;
};

export type CategoryRow = CategoryOption & {
  itemCount: number;
  catalogValue: number;
  revenueGenerated: number;
  isActive: boolean;
  items: (CategoryOption & { imageUrl?: string | null })[];
};

export type CategoryMetrics = {
  numberOfCategories: number;
  numberOfItems: number;
  totalRevenue: number;
  catalogValue: number;
};

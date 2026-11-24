export type PriceRangeKey = '0-5000' | '5000-10000' | '10000+';

export type ProductFilterState = {
  categoryIds: string[];
  priceRanges: PriceRangeKey[];
  availability: ('IN_STOCK' | 'OUT_OF_STOCK')[];
  ratings: number[];
};

export const emptyFilterState: ProductFilterState = {
  categoryIds: [],
  priceRanges: [],
  availability: [],
  ratings: [],
};

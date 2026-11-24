import type { ProductCategory } from '../api/productApi';
import { matchesShopTab, shopTabs, type ShopTab } from './filterItems';

type ShopCategoriesProps = {
  categories: ProductCategory[];
  tab: ShopTab;
  subcategory: string | null;
  onTabChange: (tab: ShopTab) => void;
  onSubcategoryChange: (id: string | null) => void;
};

export default function ShopCategories({
  categories,
  tab,
  subcategory,
  onTabChange,
  onSubcategoryChange,
}: ShopCategoriesProps) {
  const subcategories = tab === 'all' || tab === 'discount-packs'
    ? []
    : categories.filter((category) => matchesShopTab(category.name, tab));

  return (
    <>
      <nav aria-label="Shop categories" className="-mx-1 overflow-x-auto px-1 pb-2">
        <div className="flex w-max min-w-full gap-2">
          {shopTabs.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => onTabChange(key)}
              aria-pressed={tab === key}
              className={
                'whitespace-nowrap rounded-full border px-4 py-2.5 text-xs font-bold transition-colors sm:text-sm ' +
                (tab === key
                  ? 'border-primary bg-primary text-white'
                  : 'border-primary/20 bg-white text-primary hover:bg-primary/5')
              }
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      {subcategories.length > 0 && (
        <div className="-mx-1 overflow-x-auto px-1 pb-1">
          <div className="flex w-max gap-2">
            <button
              type="button"
              onClick={() => onSubcategoryChange(null)}
              aria-pressed={subcategory === null}
              className={
                'whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium ' +
                (subcategory === null ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600')
              }
            >
              All
            </button>
            {subcategories.map((category) => {
              const selected = subcategory === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => onSubcategoryChange(selected ? null : category.id)}
                  aria-pressed={selected}
                  className={
                    'whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium ' +
                    (selected ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600')
                  }
                >
                  {category.name}
                  {category.productsCount !== undefined && (
                    <span className="ml-1 opacity-70">({category.productsCount})</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

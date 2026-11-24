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
      <nav aria-label="Shop categories" className="-mx-1 overflow-x-auto px-1 pb-2 lg:mx-0 lg:overflow-visible lg:px-0 lg:pb-0">
        <div className="flex w-max min-w-full gap-2 lg:w-full lg:flex-col lg:gap-1">
          {shopTabs.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => onTabChange(key)}
              aria-pressed={tab === key}
              className={
                'whitespace-nowrap rounded-full border px-4 py-2.5 text-xs font-bold uppercase transition-colors sm:text-sm lg:w-full lg:rounded-xl lg:border-0 lg:px-3 lg:text-left lg:font-semibold lg:normal-case ' +
                (tab === key
                  ? 'border-primary bg-primary text-white lg:bg-[#e4ecd9] lg:text-[#245b38]'
                  : 'border-primary/20 bg-white text-primary hover:bg-primary/5 lg:text-[#42594a] lg:hover:bg-[#f3f5eb]')
              }
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      {subcategories.length > 0 && (
        <div className="-mx-1 overflow-x-auto px-1 pb-1">
          <div className="flex w-max gap-2 lg:w-full lg:flex-wrap">
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

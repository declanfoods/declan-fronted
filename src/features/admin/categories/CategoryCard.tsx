import { ChevronDown, ChevronUp, Package, Pencil, ShoppingBasket, Trash2 } from 'lucide-react';
import { formatNaira } from '../../../shared/formatters/formatNaira';
import type { CategoryKind, CategoryRow } from './types';

type CategoryCardProps = {
  kind: CategoryKind;
  category: CategoryRow;
  expanded: boolean;
  onToggle: () => void;
  onRename: () => void;
  onDelete: () => void;
};

export default function CategoryCard({
  kind,
  category,
  expanded,
  onToggle,
  onRename,
  onDelete,
}: CategoryCardProps) {
  const isProducts = kind === 'products';
  const Icon = isProducts ? Package : ShoppingBasket;
  const Chevron = expanded ? ChevronUp : ChevronDown;

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
      <div className="flex items-center gap-3 p-4">
        <button
          type="button"
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
          aria-expanded={expanded}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F3F7EE] text-primary">
            <Icon size={17} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold text-gray-900">{category.name}</span>
            <span className="mt-0.5 block text-xs text-gray-400">
              {category.itemCount} {isProducts ? 'product' : 'pack'}
              {category.itemCount === 1 ? '' : 's'}
              {!category.isActive && (
                <>
                  {' · '}
                  <span className="font-semibold text-amber-600">inactive</span>
                </>
              )}
            </span>
            <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px]">
              <span className="text-gray-500">
                {formatNaira(category.catalogValue)}{' '}
                <span className="text-gray-400">catalog value</span>
              </span>
              <span className="text-primary">
                {formatNaira(category.revenueGenerated)}{' '}
                <span className="text-gray-400">revenue</span>
              </span>
            </span>
          </span>
          <Chevron size={16} className="shrink-0 text-gray-300" />
        </button>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onRename}
            aria-label={`Rename ${category.name}`}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-50 hover:text-primary"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete ${category.name}`}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50/60 px-4 py-3">
          {category.items.length === 0 ? (
            <p className="text-xs text-gray-400">Nothing filed under this category yet.</p>
          ) : (
            <div className="space-y-2">
              {category.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-9 w-9 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-200 text-[10px] text-gray-500">
                      —
                    </span>
                  )}
                  <span className="min-w-0 flex-1 truncate text-xs font-medium text-gray-700">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

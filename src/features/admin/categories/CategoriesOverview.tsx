import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FolderTree, Package, Plus, RefreshCw, ShoppingBasket } from 'lucide-react';
import { getApiErrorMessage } from '../../../app/lib/api-types';
import AdminBottomNav from '../../../app/layouts/admin/AdminBottomNav';
import CategoryCard from './CategoryCard';
import CategoryDialogs, { type CategoryDialog } from './CategoryDialogs';
import CategorySummary from './CategorySummary';
import { useCategoryQueries } from './queries';
import type { CategoryKind } from './types';

const categoryTabs = [
  { kind: 'products', label: 'Product Categories', icon: Package },
  { kind: 'food-packs', label: 'Food Pack Categories', icon: ShoppingBasket },
] as const;

export default function CategoriesOverview() {
  const navigate = useNavigate();
  const [kind, setKind] = useState<CategoryKind>('products');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<CategoryDialog | null>(null);

  const productQueries = useCategoryQueries('products');
  const foodPackQueries = useCategoryQueries('food-packs');
  const isProducts = kind === 'products';
  const { categories, metrics } = isProducts ? productQueries : foodPackQueries;
  const sortedRows = useMemo(
    () => [...(categories.data ?? [])].sort(
      (a, b) => b.itemCount - a.itemCount || a.name.localeCompare(b.name),
    ),
    [categories.data],
  );

  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      <header className="flex items-center justify-between px-5 pt-6">
        <button
          type="button"
          onClick={() => navigate('/admin')}
          aria-label="Back to dashboard"
          className="text-primary-dark"
        >
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">Categories</h1>
        <button
          type="button"
          onClick={() => {
            void categories.refetch();
            void metrics.refetch();
          }}
          aria-label="Refresh"
          className="text-primary-dark"
        >
          <RefreshCw size={18} strokeWidth={2} />
        </button>
      </header>

      <div className="px-5 pt-4">
        <div className="flex rounded-full bg-gray-100 p-1">
          {categoryTabs.map(({ kind: tab, label, icon: Icon }) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setKind(tab);
                setExpandedId(null);
                setDialog(null);
              }}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-semibold transition-colors ${
                kind === tab ? 'bg-primary text-white' : 'text-gray-500'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 px-5 pb-32 pt-4">
        <CategorySummary
          kind={kind}
          metrics={metrics.data}
          rowCount={sortedRows.length}
          loading={metrics.isLoading}
          showError={metrics.isError && !categories.isError}
        />

        {categories.isError ? (
          <div className="mt-4 rounded-2xl bg-white p-5 text-center shadow-sm">
            <p className="text-sm text-gray-500">
              {getApiErrorMessage(categories.error, 'Could not load categories.')}
            </p>
            <button
              type="button"
              onClick={() => void categories.refetch()}
              className="mt-3 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white"
            >
              Retry
            </button>
          </div>
        ) : categories.isLoading ? (
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-20 animate-pulse rounded-2xl bg-gray-100" />
            ))}
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setDialog({ action: 'create' })}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border-2 border-dashed border-primary/40 py-3 text-sm font-semibold text-primary"
            >
              <Plus size={16} />
              New {isProducts ? 'Product' : 'Food Pack'} Category
            </button>

            {sortedRows.length === 0 ? (
              <div className="mt-6 flex flex-col items-center gap-2 text-center">
                <FolderTree size={34} className="text-gray-300" />
                <p className="text-sm text-gray-500">
                  No {isProducts ? 'product' : 'food pack'} categories yet.
                </p>
                <p className="max-w-xs text-xs text-gray-400">
                  Create the first one above — it becomes available immediately when
                  adding {isProducts ? 'products' : 'food packs'}.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {sortedRows.map((category) => (
                  <CategoryCard
                    key={category.id}
                    kind={kind}
                    category={category}
                    expanded={expandedId === category.id}
                    onToggle={() => setExpandedId(expandedId === category.id ? null : category.id)}
                    onRename={() => setDialog({ action: 'rename', category })}
                    onDelete={() => setDialog({ action: 'delete', category })}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {dialog && (
        <CategoryDialogs
          kind={kind}
          dialog={dialog}
          categories={categories.data ?? []}
          onClose={() => setDialog(null)}
        />
      )}
      <AdminBottomNav />
    </div>
  );
}

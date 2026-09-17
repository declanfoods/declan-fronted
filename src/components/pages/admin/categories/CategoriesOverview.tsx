import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  FolderTree,
  Package,
  ShoppingBasket,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  RefreshCw,
  Info,
  X,
} from 'lucide-react';
import AdminBottomNav from '../../../admin/AdminBottomNav';
import { formatNaira } from '../../../data/products';
import { getApiErrorMessage } from '../../../../app/lib/api-types';
import {
  useProductCategories,
  useFoodPackCategories,
  useCategoryProductIndex,
  useCategoryFoodPackIndex,
  useCreateProductCategory,
  useUpdateProductCategory,
  useDeleteProductCategory,
  useCreateFoodPackCategory,
  buildProductCategoryRows,
  buildFoodPackCategoryRows,
    isIndexTruncated,
  INDEX_PAGE_SIZE,
  INDEX_MAX_PAGES,
  type CategoryRow,
} from '../../../../app/hooks/useAdminCategories';

/*
|==========================================================================
| ADMIN → CATEGORIES   /admin/categories
|==========================================================================
|
| Two catalogues, one screen:
|   • Products    — full CRUD (create / rename / delete)
|   • Food Packs  — create only; the backend has no update or delete route
|
| WHAT IS REAL HERE
|
| Every category name, every item count, and every catalogue value on this
| page comes from the live API. Nothing is mocked:
|
|   GET /api/v1/products/categories    → the product categories
|   GET /api/v1/foodpacks/categories   → the food pack categories
|   GET /api/v1/admin/products         → grouped to count items per category
|   GET /api/v1/admin/foodpacks        → same, for packs
|
| WHAT IS NOT
|
| "Revenue generated" per category. There is no endpoint for it and it cannot
| be derived on the client — it needs orders joined to categories, and the
| category objects are only `{ id, name }`. Rather than print a plausible
| number next to a real one (which is how you end up making budget decisions
| on fiction), the revenue slot renders an explicit "awaiting backend" state.
| `backend-message-latest.md` has the request.
|
| CATALOGUE VALUE ≠ REVENUE
| The number shown per row is what the stock is worth at list price. It is
| labelled "Catalog value" everywhere so it is never mistaken for money
| already earned.
*/

type Tab = 'products' | 'food-packs';

export default function CategoriesOverview() {
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('products');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [renaming, setRenaming] = useState<CategoryRow | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<CategoryRow | null>(null);
  const [actionError, setActionError] = useState('');

  /* ---------------------------------------------------------------- reads */
  const productCategories = useProductCategories();
  const foodPackCategories = useFoodPackCategories();
  const productIndex = useCategoryProductIndex();
  const foodPackIndex = useCategoryFoodPackIndex();

  /* --------------------------------------------------------------- writes */
  const createProductCategory = useCreateProductCategory();
  const updateProductCategory = useUpdateProductCategory();
  const deleteProductCategory = useDeleteProductCategory();
  const createFoodPackCategory = useCreateFoodPackCategory();

  /* -------------------------------------------------------------- derived */
  const productRows = useMemo(
    () =>
         buildProductCategoryRows(
        productCategories.data ?? [],
        productIndex.data?.items ?? []
      ),
    [productCategories.data, productIndex.data]
  );

  const foodPackRows = useMemo(
    () =>
            buildFoodPackCategoryRows(
        foodPackCategories.data ?? [],
        foodPackIndex.data?.items ?? []
      ),
    [foodPackCategories.data, foodPackIndex.data]
  );

  const isProducts = tab === 'products';
  const rows = isProducts ? productRows : foodPackRows;

  const categoriesQuery = isProducts ? productCategories : foodPackCategories;
  const indexQuery = isProducts ? productIndex : foodPackIndex;

  const isLoading = categoriesQuery.isLoading || indexQuery.isLoading;
  const isError = categoriesQuery.isError || indexQuery.isError;

  const totalItems = rows.reduce((sum, r) => sum + r.itemCount, 0);
  const totalCatalogValue = rows.reduce((sum, r) => sum + r.catalogValue, 0);

   /*
    Checked per-tab. Warning about the product index while the admin is looking
    at food packs would be noise they can do nothing about.
  */
  const truncated = isIndexTruncated(indexQuery.data);

  /*
    Categories with nothing in them sort last — the admin is here to see what
    the catalogue actually looks like, and empty categories are the least
    interesting thing on the page.
  */
  const sortedRows = useMemo(
    () => [...rows].sort((a, b) => b.itemCount - a.itemCount || a.name.localeCompare(b.name)),
    [rows]
  );

  const runAction = async (fn: () => Promise<unknown>, fallback: string) => {
    setActionError('');
    try {
      await fn();
      return true;
    } catch (err) {
      /*
        The API returns useful, specific errors here — notably 409
        "Category already exists" on a duplicate name. Pass those straight
        through instead of replacing them with a generic failure.
      */
      setActionError(getApiErrorMessage(err, fallback));
      return false;
    }
  };

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
            categoriesQuery.refetch();
            indexQuery.refetch();
          }}
          aria-label="Refresh"
          className="text-primary-dark"
        >
          <RefreshCw size={18} strokeWidth={2} />
        </button>
      </header>

      {/* ─── Tabs ─── */}
      <div className="px-5 pt-4">
        <div className="flex rounded-full bg-gray-100 p-1">
          {(
            [
              { key: 'products', label: 'Product Categories', icon: Package },
              { key: 'food-packs', label: 'Food Pack Categories', icon: ShoppingBasket },
            ] as const
          ).map(({ key, label, icon: Icon }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setTab(key);
                  setExpandedId(null);
                  setActionError('');
                }}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-semibold transition-colors ${
                  active ? 'bg-primary text-white' : 'text-gray-500'
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <main className="flex-1 px-5 pb-32 pt-4">
        {/* ─── Summary ─── */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#F3F7EE] p-4">
            <p className="text-xs text-gray-500">
              {isProducts ? 'Product categories' : 'Food pack categories'}
            </p>
            <p className="mt-1 text-2xl font-extrabold text-gray-900">
              {categoriesQuery.isLoading ? '—' : rows.length}
            </p>
          </div>

          <div className="rounded-2xl bg-[#F3F7EE] p-4">
            <p className="text-xs text-gray-500">
              {isProducts ? 'Products filed' : 'Packs filed'}
            </p>
            <p className="mt-1 text-2xl font-extrabold text-gray-900">
              {indexQuery.isLoading ? '—' : totalItems}
            </p>
          </div>

          <div className="rounded-2xl bg-[#F3F7EE] p-4">
            <p className="text-xs text-gray-500">Catalog value</p>
            <p className="mt-1 text-lg font-extrabold text-primary">
              {indexQuery.isLoading ? '—' : formatNaira(totalCatalogValue)}
            </p>
          </div>

          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs text-gray-500">Revenue generated</p>
            {/*
              Deliberately blank. There is no endpoint behind this number, and
              a made-up figure sitting beside three real ones is worse than an
              obvious gap.
            */}
            <p className="mt-1 text-lg font-extrabold text-gray-300">—</p>
            <p className="mt-0.5 text-[10px] font-semibold text-amber-600">
              AWAITING BACKEND
            </p>
          </div>
        </div>

        {/* ─── Caveats, only when they actually apply ─── */}
        {truncated && (
          <div className="mt-3 flex gap-2 rounded-2xl bg-amber-50 p-3">
            <Info size={15} className="mt-0.5 shrink-0 text-amber-600" />
            <p className="text-xs text-amber-700">
                           This catalogue has more than {INDEX_PAGE_SIZE * INDEX_MAX_PAGES}{' '}
              {isProducts ? 'products' : 'food packs'}, so the per-category
              counts below may be partial. A count-by-category endpoint would
              fix this properly.
            </p>
          </div>
        )}

        {/* ─── Error ─── */}
        {isError && (
          <div className="mt-4 rounded-2xl bg-white p-5 text-center shadow-sm">
            <p className="text-sm text-gray-500">
              {getApiErrorMessage(
                categoriesQuery.error ?? indexQuery.error,
                'Could not load categories.'
              )}
            </p>
            <button
              type="button"
              onClick={() => {
                categoriesQuery.refetch();
                indexQuery.refetch();
              }}
              className="mt-3 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white"
            >
              Retry
            </button>
          </div>
        )}

        {/* ─── Loading ─── */}
        {isLoading && !isError && (
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-100" />
            ))}
          </div>
        )}

        {/* ─── Create button ─── */}
        {!isLoading && !isError && (
          <button
            type="button"
            onClick={() => {
              setActionError('');
              setCreateOpen(true);
            }}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border-2 border-dashed border-primary/40 py-3 text-sm font-semibold text-primary"
          >
            <Plus size={16} />
            New {isProducts ? 'Product' : 'Food Pack'} Category
          </button>
        )}

        {/* ─── Empty ─── */}
        {!isLoading && !isError && rows.length === 0 && (
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
        )}

        {/* ─── Category list ─── */}
        {!isLoading && !isError && sortedRows.length > 0 && (
          <div className="mt-4 space-y-3">
            {sortedRows.map((row) => {
              const expanded = expandedId === row.id;

              return (
                <div
                  key={row.id}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100"
                >
                  <div className="flex items-center gap-3 p-4">
                    <button
                      type="button"
                      onClick={() => setExpandedId(expanded ? null : row.id)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      aria-expanded={expanded}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F3F7EE] text-primary">
                        {isProducts ? <Package size={17} /> : <ShoppingBasket size={17} />}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-gray-900">
                          {row.name}
                        </span>
                        <span className="mt-0.5 block text-xs text-gray-400">
                          {row.itemCount} {isProducts ? 'product' : 'pack'}
                          {row.itemCount === 1 ? '' : 's'}
                          {row.itemCount > 0 && (
                            <>
                              {' · '}
                              <span className="text-gray-500">
                                {formatNaira(row.catalogValue)} catalog value
                              </span>
                            </>
                          )}
                        </span>
                      </span>

                      {expanded ? (
                        <ChevronUp size={16} className="shrink-0 text-gray-300" />
                      ) : (
                        <ChevronDown size={16} className="shrink-0 text-gray-300" />
                      )}
                    </button>

                    {/* Rename + delete exist for product categories only. */}
                    {isProducts && (
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setActionError('');
                            setRenaming(row);
                          }}
                          aria-label={`Rename ${row.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-50 hover:text-primary"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActionError('');
                            setConfirmDelete(row);
                          }}
                          aria-label={`Delete ${row.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* ─── Items in this category ─── */}
                  {expanded && (
                    <div className="border-t border-gray-100 bg-gray-50/60 px-4 py-3">
                      {row.items.length === 0 ? (
                        <p className="text-xs text-gray-400">
                          Nothing filed under this category yet.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {row.items.map((item) => (
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

                              <span className="shrink-0 text-xs font-semibold text-gray-500">
                                {formatNaira(item.price)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <p className="mt-3 text-[10px] text-amber-600">
                        Revenue generated in this category: awaiting backend
                        metric.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!isProducts && !isLoading && !isError && (
          <p className="mt-4 rounded-2xl bg-gray-50 p-3 text-center text-[11px] text-gray-400">
            Food pack categories can be created but not renamed or deleted — the
            backend has no update or delete route for them.
          </p>
        )}
      </main>

      {/* ─── Create / rename / delete ─── */}
      {createOpen && (
        <NameDialog
          title={`New ${isProducts ? 'Product' : 'Food Pack'} Category`}
          submitLabel="Create"
          busy={createProductCategory.isPending || createFoodPackCategory.isPending}
          error={actionError}
          onCancel={() => {
            setCreateOpen(false);
            setActionError('');
          }}
          onSubmit={async (name) => {
            const ok = await runAction(
              () =>
                isProducts
                  ? createProductCategory.mutateAsync(name)
                  : createFoodPackCategory.mutateAsync(name),
              'Could not create the category.'
            );
            if (ok) {
              setCreateOpen(false);
              setActionError('');
            }
          }}
        />
      )}

      {renaming && (
        <NameDialog
          title="Rename Category"
          submitLabel="Save"
          initialValue={renaming.name}
          busy={updateProductCategory.isPending}
          error={actionError}
          onCancel={() => {
            setRenaming(null);
            setActionError('');
          }}
          onSubmit={async (name) => {
            const ok = await runAction(
              () => updateProductCategory.mutateAsync({ id: renaming.id, name }),
              'Could not rename the category.'
            );
            if (ok) {
              setRenaming(null);
              setActionError('');
            }
          }}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
          <div className="absolute inset-0" onClick={() => setConfirmDelete(null)} aria-hidden />

          <div className="relative z-10 w-full max-w-sm rounded-t-3xl bg-white px-6 pb-8 pt-6 sm:rounded-3xl">
            <h2 className="text-lg font-bold text-gray-900">
              Delete “{confirmDelete.name}”?
            </h2>

            {confirmDelete.itemCount > 0 ? (
              /*
                Deleting a category that still has products in it is the one
                genuinely destructive action on this screen — say so plainly.
              */
              <p className="mt-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
                {confirmDelete.itemCount}{' '}
                {confirmDelete.itemCount === 1 ? 'product is' : 'products are'} still
                filed under this category. Deleting it will leave{' '}
                {confirmDelete.itemCount === 1 ? 'that product' : 'those products'}{' '}
                without a category. Move them somewhere else first.
              </p>
            ) : (
              <p className="mt-2 text-sm text-gray-500">
                This category is empty. Deleting it cannot be undone.
              </p>
            )}

            {actionError && (
              <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                {actionError}
              </p>
            )}

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setConfirmDelete(null);
                  setActionError('');
                }}
                className="flex-1 rounded-full border border-gray-200 py-3 text-sm font-semibold text-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteProductCategory.isPending}
                onClick={async () => {
                  const ok = await runAction(
                    () => deleteProductCategory.mutateAsync(confirmDelete.id),
                    'Could not delete the category.'
                  );
                  if (ok) {
                    setConfirmDelete(null);
                    setActionError('');
                  }
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-500 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {deleteProductCategory.isPending && (
                  <Loader2 size={15} className="animate-spin" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminBottomNav />
    </div>
  );
}

/* =========================================================================
 * Name dialog, shared by "create" and "rename"
 * ========================================================================= */

function NameDialog({
  title,
  submitLabel,
  initialValue = '',
  busy,
  error,
  onCancel,
  onSubmit,
}: {
  title: string;
  submitLabel: string;
  initialValue?: string;
  busy: boolean;
  error: string;
  onCancel: () => void;
  onSubmit: (name: string) => void | Promise<void>;
}) {
  const [name, setName] = useState(initialValue);

  const trimmed = name.trim();
  const canSubmit = trimmed.length >= 2 && !busy;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="absolute inset-0" onClick={onCancel} aria-hidden />

      <div className="relative z-10 w-full max-w-sm rounded-t-3xl bg-white px-6 pb-8 pt-6 sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (canSubmit) onSubmit(trimmed);
          }}
        >
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Category name
          </label>

          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Breakfast Essentials"
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary"
          />

          {/* The API's own rule, surfaced before the round-trip. */}
          <p className="mt-1.5 text-[11px] text-gray-400">
            At least 2 characters. Names are compared case-insensitively — a
            duplicate comes back as “Category already exists”.
          </p>

          {error && (
            <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            {busy ? 'Saving...' : submitLabel}
          </button>
        </form>
      </div>
    </div>
  );
}
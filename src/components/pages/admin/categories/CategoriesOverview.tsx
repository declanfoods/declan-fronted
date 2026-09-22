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
  useProductCategoryOverview,
  useFoodPackCategoryOverview,
  useProductCategoryMetrics,
  useFoodPackCategoryMetrics,
  useCreateProductCategory,
  useUpdateProductCategory,
  useDeleteProductCategory,
  useCreateFoodPackCategory,
  useUpdateFoodPackCategory,
  useDeleteFoodPackCategory,
  toProductCategoryRows,
  toFoodPackCategoryRows,
  type CategoryRow,
} from '../../../../app/hooks/useAdminCategories';



type Tab = 'products' | 'food-packs';

export default function CategoriesOverview() {
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('products');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [renaming, setRenaming] = useState<CategoryRow | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<CategoryRow | null>(null);
  /*
    Where the deleted category's items go. Required by the API's
    { fallbackCategoryId } body, so it is part of the delete flow rather than
    a separate step the admin has to remember.
  */
  const [fallbackId, setFallbackId] = useState<string>('');
  const [actionError, setActionError] = useState('');

  /* ---------------------------------------------------------------- reads */
  const productOverview = useProductCategoryOverview();
  const foodPackOverview = useFoodPackCategoryOverview();
  const productMetrics = useProductCategoryMetrics();
  const foodPackMetrics = useFoodPackCategoryMetrics();

  /* --------------------------------------------------------------- writes */
  const createProductCategory = useCreateProductCategory();
  const updateProductCategory = useUpdateProductCategory();
  const deleteProductCategory = useDeleteProductCategory();
  const createFoodPackCategory = useCreateFoodPackCategory();
  const updateFoodPackCategory = useUpdateFoodPackCategory();
  const deleteFoodPackCategory = useDeleteFoodPackCategory();

  /* -------------------------------------------------------------- derived */
  const productRows = useMemo(
    () => toProductCategoryRows(productOverview.data ?? []),
    [productOverview.data]
  );

  const foodPackRows = useMemo(
    () => toFoodPackCategoryRows(foodPackOverview.data ?? []),
    [foodPackOverview.data]
  );

  const isProducts = tab === 'products';
  const rows = isProducts ? productRows : foodPackRows;

  const categoriesQuery = isProducts ? productOverview : foodPackOverview;
  const metricsQuery = isProducts ? productMetrics : foodPackMetrics;
  const metrics = metricsQuery.data;

  const isLoading = categoriesQuery.isLoading;
  const isError = categoriesQuery.isError;

  /*
    Totals now come from the /metrics endpoints rather than being summed off
    the rows. Two reasons: the server's figures cover the whole catalogue (the
    row list is one flat response, but that is the server's business, not
    something this screen should assume), and "revenue generated" is no longer
    a number the client could total by itself.
  */
  const totalCategories = metrics?.numberOfCategories ?? rows.length;
  const totalItems = metrics?.numberOfItems ?? 0;
  const totalCatalogValue = metrics?.catalogValue ?? 0;
  const totalRevenue = metrics?.totalRevenue ?? 0;

  /*
    The delete destination picker needs every OTHER category on this tab.
    Same catalogue, so the rows already in hand are the right source.
  */
  const fallbackOptions = useMemo(
    () => (confirmDelete ? rows.filter((r) => r.id !== confirmDelete.id) : []),
    [rows, confirmDelete]
  );

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
            metricsQuery.refetch();
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
              {metricsQuery.isLoading ? '—' : totalCategories}
            </p>
          </div>

          <div className="rounded-2xl bg-[#F3F7EE] p-4">
            <p className="text-xs text-gray-500">
              {isProducts ? 'Products filed' : 'Packs filed'}
            </p>
            <p className="mt-1 text-2xl font-extrabold text-gray-900">
              {metricsQuery.isLoading ? '—' : totalItems}
            </p>
          </div>

          <div className="rounded-2xl bg-[#F3F7EE] p-4">
            <p className="text-xs text-gray-500">Catalog value</p>
            <p className="mt-1 text-lg font-extrabold text-primary">
              {metricsQuery.isLoading ? '—' : formatNaira(totalCatalogValue)}
            </p>
            <p className="mt-0.5 text-[10px] text-gray-400">Stock at list price</p>
          </div>

          <div className="rounded-2xl bg-[#F3F7EE] p-4">
            <p className="text-xs text-gray-500">Revenue generated</p>
            <p className="mt-1 text-lg font-extrabold text-gray-900">
              {metricsQuery.isLoading ? '—' : formatNaira(totalRevenue)}
            </p>
            <p className="mt-0.5 text-[10px] text-gray-400">From delivered orders</p>
          </div>
        </div>

        {/* ─── Scenario: categories exist but the metrics call failed ───
            The rows are still perfectly usable, so the screen carries on and
            says only that the header totals are missing. Previously this was
            three separate "—" placeholders with no explanation.
        */}
        {metricsQuery.isError && !categoriesQuery.isError && (
          <div className="mt-3 flex gap-2 rounded-2xl bg-amber-50 p-3">
            <Info size={15} className="mt-0.5 shrink-0 text-amber-600" />
            <p className="text-xs text-amber-700">
              Could not load the totals for this tab. The categories below are
              current.
            </p>
          </div>
        )}

        {/* ─── Error ─── */}
        {isError && (
          <div className="mt-4 rounded-2xl bg-white p-5 text-center shadow-sm">
            <p className="text-sm text-gray-500">
              {getApiErrorMessage(
                categoriesQuery.error,
                'Could not load categories.'
              )}
            </p>
            <button
              type="button"
              onClick={() => {
                categoriesQuery.refetch();
                categoriesQuery.refetch();
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
                          {!row.isActive && (
                            <>
                              {' · '}
                              <span className="font-semibold text-amber-600">
                                inactive
                              </span>
                            </>
                          )}
                        </span>

                        {/*
                          Both figures are real and they are NOT the same
                          number. Catalog value is what the stock is worth at
                          list price; revenue generated is money actually taken
                          from orders. Shown on separate lines so neither is
                          read as the other.
                        */}
                        <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px]">
                          <span className="text-gray-500">
                            {formatNaira(row.catalogValue)}{' '}
                            <span className="text-gray-400">catalog value</span>
                          </span>
                          <span className="text-primary">
                            {formatNaira(row.revenueGenerated)}{' '}
                            <span className="text-gray-400">revenue</span>
                          </span>
                        </span>
                      </span>

                      {expanded ? (
                        <ChevronUp size={16} className="shrink-0 text-gray-300" />
                      ) : (
                        <ChevronDown size={16} className="shrink-0 text-gray-300" />
                      )}
                    </button>

                    {/*
                      Rename + delete. These used to be gated behind
                      `isProducts` because foodpack categories had no update or
                      delete route. Both routes exist now, so the gate is gone
                      and both tabs get the same controls.
                    */}
                    {(
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
                            setFallbackId('');
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

                              {/*
                                No price here on purpose. The embedded
                                products[]/foodpacks[] arrays carry only
                                { id, name, imageUrl } — there is no per-item
                                price in this payload, and inventing one would
                                mean fetching the full catalogue again, which is
                                exactly what these endpoints were built to stop.
                              */}
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
            })}
          </div>
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
          /*
            Rename is per-tab now. It used to always call the product mutation,
            which was fine only because the food pack tab had no rename button
            at all. With both tabs offering it, sending a foodpack category id
            to the product endpoint would 404.
          */
          busy={
            isProducts
              ? updateProductCategory.isPending
              : updateFoodPackCategory.isPending
          }
          error={actionError}
          onCancel={() => {
            setRenaming(null);
            setActionError('');
          }}
          onSubmit={async (name) => {
            const ok = await runAction(
              () =>
                isProducts
                  ? updateProductCategory.mutateAsync({ id: renaming.id, name })
                  : updateFoodPackCategory.mutateAsync({ id: renaming.id, name }),
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

            {/*
              The API's DELETE takes { fallbackCategoryId }: the items in a
              deleted category have to be reassigned, not orphaned. So when
              there is anything to move, this dialog collects the destination
              rather than telling the admin to go and do it themselves first.
            */}
            {confirmDelete.itemCount > 0 ? (
              <>
                <p className="mt-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
                  {confirmDelete.itemCount}{' '}
                  {isProducts
                    ? confirmDelete.itemCount === 1
                      ? 'product is'
                      : 'products are'
                    : confirmDelete.itemCount === 1
                      ? 'food pack is'
                      : 'food packs are'}{' '}
                  still filed under this category. Choose where{' '}
                  {confirmDelete.itemCount === 1 ? 'it' : 'they'} should move —
                  they are not deleted.
                </p>

                {fallbackOptions.length === 0 ? (
                  <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                    This is the only category on this tab, so there is nowhere to
                    move {confirmDelete.itemCount === 1 ? 'it' : 'them'}. Create
                    another category first.
                  </p>
                ) : (
                  <div className="mt-3">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Move{' '}
                      {confirmDelete.itemCount === 1 ? 'it' : 'them'} to
                    </label>
                    <select
                      value={fallbackId}
                      onChange={(e) => setFallbackId(e.target.value)}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary"
                    >
                      <option value="">Select a category…</option>
                      {fallbackOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            ) : (
              <p className="mt-2 text-sm text-gray-500">
                This category is empty, so there is nothing to move. Deleting it
                cannot be undone.
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
                  setFallbackId('');
                  setActionError('');
                }}
                className="flex-1 rounded-full border border-gray-200 py-3 text-sm font-semibold text-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                /* Blocked until a destination is chosen when items must move. */
                disabled={
                  isProducts
                    ? deleteProductCategory.isPending ||
                      (confirmDelete.itemCount > 0 && !fallbackId)
                    : deleteFoodPackCategory.isPending ||
                      (confirmDelete.itemCount > 0 && !fallbackId)
                }
                onClick={async () => {
                  const ok = await runAction(
                    () =>
                      isProducts
                        ? deleteProductCategory.mutateAsync({
                            id: confirmDelete.id,
                            fallbackCategoryId: fallbackId,
                          })
                        : deleteFoodPackCategory.mutateAsync({
                            id: confirmDelete.id,
                            fallbackCategoryId: fallbackId,
                          }),
                    'Could not delete the category.'
                  );
                  if (ok) {
                    setConfirmDelete(null);
                    setFallbackId('');
                    setActionError('');
                  }
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-500 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {(deleteProductCategory.isPending ||
                  deleteFoodPackCategory.isPending) && (
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
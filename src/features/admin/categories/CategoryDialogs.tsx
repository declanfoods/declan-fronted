import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { getApiErrorMessage } from '../../../app/lib/api-types';
import { useCategoryMutations } from './queries';
import type { CategoryKind, CategoryOption, CategoryRow } from './types';

export type CategoryDialog =
  | { action: 'create' }
  | { action: 'rename' | 'delete'; category: CategoryRow };

type DialogProps = {
  busy: boolean;
  error: string;
  onClose: () => void;
};

export default function CategoryDialogs({
  kind,
  dialog,
  categories,
  onClose,
}: {
  kind: CategoryKind;
  dialog: CategoryDialog;
  categories: CategoryRow[];
  onClose: () => void;
}) {
  const { create, rename, remove } = useCategoryMutations(kind);

  if (dialog.action === 'delete') {
    const { category } = dialog;
    return (
      <DeleteCategoryDialog
        category={category}
        itemLabel={kind === 'products' ? 'product' : 'food pack'}
        destinations={categories.filter((option) => option.id !== category.id)}
        busy={remove.isPending}
        error={remove.isError ? getApiErrorMessage(remove.error, 'Could not delete the category.') : ''}
        onClose={onClose}
        onSubmit={(fallbackCategoryId) =>
          remove.mutate({ id: category.id, fallbackCategoryId }, { onSuccess: onClose })
        }
      />
    );
  }

  if (dialog.action === 'rename') {
    const { category } = dialog;
    return (
      <CategoryNameDialog
        title="Rename Category"
        submitLabel="Save"
        initialValue={category.name}
        busy={rename.isPending}
        error={rename.isError ? getApiErrorMessage(rename.error, 'Could not rename the category.') : ''}
        onClose={onClose}
        onSubmit={(name) => rename.mutate({ id: category.id, name }, { onSuccess: onClose })}
      />
    );
  }

  return (
    <CategoryNameDialog
      title={`New ${kind === 'products' ? 'Product' : 'Food Pack'} Category`}
      submitLabel="Create"
      busy={create.isPending}
      error={create.isError ? getApiErrorMessage(create.error, 'Could not create the category.') : ''}
      onClose={onClose}
      onSubmit={(name) => create.mutate(name, { onSuccess: onClose })}
    />
  );
}

function CategoryNameDialog({
  title,
  submitLabel,
  initialValue = '',
  busy,
  error,
  onClose,
  onSubmit,
}: DialogProps & {
  title: string;
  submitLabel: string;
  initialValue?: string;
  onSubmit: (name: string) => void;
}) {
  const [name, setName] = useState(initialValue);
  const trimmedName = name.trim();
  const canSubmit = trimmedName.length >= 2 && !busy;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-labelledby="category-name-title"
        className="relative z-10 w-full max-w-sm rounded-t-3xl bg-white px-6 pb-8 pt-6 sm:rounded-3xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="category-name-title" className="text-lg font-bold text-gray-900">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-gray-400">
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (canSubmit) onSubmit(trimmedName);
          }}
        >
          <label htmlFor="category-name" className="mb-1.5 block text-sm font-medium text-gray-700">
            Category name
          </label>
          <input
            id="category-name"
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Breakfast Essentials"
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary"
          />
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

function DeleteCategoryDialog({
  category,
  itemLabel,
  destinations,
  busy,
  error,
  onClose,
  onSubmit,
}: DialogProps & {
  category: CategoryRow;
  itemLabel: string;
  destinations: CategoryOption[];
  onSubmit: (fallbackCategoryId: string) => void;
}) {
  const [fallbackCategoryId, setFallbackCategoryId] = useState('');
  const hasItems = category.itemCount > 0;
  const isSingleItem = category.itemCount === 1;
  const destinationSelected = destinations.some((category) => category.id === fallbackCategoryId);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-labelledby="delete-category-title"
        className="relative z-10 w-full max-w-sm rounded-t-3xl bg-white px-6 pb-8 pt-6 sm:rounded-3xl"
      >
        <h2 id="delete-category-title" className="text-lg font-bold text-gray-900">
          Delete “{category.name}”?
        </h2>
        {hasItems ? (
          <>
            <p className="mt-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
              {category.itemCount} {itemLabel}{isSingleItem ? ' is' : 's are'} still filed under
              this category. Choose where {isSingleItem ? 'it' : 'they'} should move.
            </p>
            {destinations.length === 0 ? (
              <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                Create another category on this tab before moving {isSingleItem ? 'the item' : 'these items'}.
              </p>
            ) : (
              <div className="mt-3">
                <label htmlFor="fallback-category" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Move {isSingleItem ? 'it' : 'them'} to
                </label>
                <select
                  id="fallback-category"
                  value={fallbackCategoryId}
                  onChange={(event) => setFallbackCategoryId(event.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-primary"
                >
                  <option value="">Select a category…</option>
                  {destinations.map((destination) => (
                    <option key={destination.id} value={destination.id}>{destination.name}</option>
                  ))}
                </select>
              </div>
            )}
          </>
        ) : (
          <p className="mt-2 text-sm text-gray-500">
            This category is empty, so there is nothing to move. Deleting it cannot be undone.
          </p>
        )}

        {error && (
          <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600">{error}</p>
        )}
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-gray-200 py-3 text-sm font-semibold text-gray-700"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy || (hasItems && !destinationSelected)}
            onClick={() => onSubmit(fallbackCategoryId)}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-500 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busy && <Loader2 size={15} className="animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

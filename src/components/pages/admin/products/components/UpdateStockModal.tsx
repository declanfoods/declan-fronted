
import { useState } from 'react';
import { X, Plus, Minus, PackagePlus } from 'lucide-react';

interface Props {
  productName: string;
  currentStock: number;
  onConfirm: (quantity: number, operation: 'INCREMENT' | 'DECREMENT') => Promise<void>;
  onClose: () => void;
}

export default function UpdateStockModal({ productName, currentStock, onConfirm, onClose }: Props) {
  const [operation, setOperation] = useState<'INCREMENT' | 'DECREMENT'>('INCREMENT');
  const [quantity, setQuantity] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const qty = Number(quantity);
  const isValid = qty > 0 && Number.isInteger(qty);
  const preview = isValid
    ? operation === 'INCREMENT'
      ? currentStock + qty
      : Math.max(0, currentStock - qty)
    : null;

  const handleConfirm = async () => {
    if (!isValid) return;
    setSaving(true);
    setError('');
    try {
      await onConfirm(qty, operation);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to update stock.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full rounded-t-3xl bg-white pb-8">
        {/* Handle */}
        <div className="flex justify-center pt-3">
          <div className="h-1 w-10 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <PackagePlus size={18} className="text-primary" />
            <p className="text-base font-bold text-gray-900">Update Stock</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-5 px-5">
          {/* Product name + current stock */}
          <div className="rounded-2xl bg-gray-50 px-4 py-3">
            <p className="text-xs text-gray-400">Product</p>
            <p className="mt-0.5 text-sm font-semibold text-gray-800 truncate">{productName}</p>
            <p className="mt-2 text-xs text-gray-400">Current Stock</p>
            <p className="mt-0.5 text-2xl font-bold text-primary-dark">
              {currentStock} <span className="text-sm font-medium text-gray-400">units</span>
            </p>
          </div>

          {/* Operation toggle */}
          <div>
            <p className="mb-2 text-sm font-semibold text-gray-700">Operation</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOperation('INCREMENT')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-full border-2 py-2.5 text-sm font-semibold transition-colors ${
                  operation === 'INCREMENT'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-200 text-gray-500'
                }`}
              >
                <Plus size={15} />
                Add Stock
              </button>
              <button
                type="button"
                onClick={() => setOperation('DECREMENT')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-full border-2 py-2.5 text-sm font-semibold transition-colors ${
                  operation === 'DECREMENT'
                    ? 'border-red-400 bg-red-50 text-red-500'
                    : 'border-gray-200 text-gray-500'
                }`}
              >
                <Minus size={15} />
                Remove Stock
              </button>
            </div>
          </div>

          {/* Quantity input */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Quantity
            </label>
            <input
              value={quantity}
              onChange={(e) => setQuantity(e.target.value.replace(/\D/g, ''))}
              inputMode="numeric"
              placeholder="Enter quantity"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 outline-none focus:border-primary"
            />
          </div>

          {/* Preview */}
          {preview !== null && (
            <div
              className={`flex items-center justify-between rounded-2xl px-4 py-3 ${
                operation === 'INCREMENT' ? 'bg-green-50' : 'bg-red-50'
              }`}
            >
              <p className={`text-sm font-medium ${
                operation === 'INCREMENT' ? 'text-green-700' : 'text-red-600'
              }`}>
                Stock after update
              </p>
              <p className={`text-lg font-bold ${
                operation === 'INCREMENT' ? 'text-green-700' : 'text-red-600'
              }`}>
                {preview} units
              </p>
            </div>
          )}

          {/* DECREMENT warning when it would hit 0 */}
          {operation === 'DECREMENT' && isValid && qty >= currentStock && (
            <p className="rounded-xl bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-600">
              This will bring stock to 0 and mark the product as out of stock.
            </p>
          )}

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full bg-white py-3.5 text-sm font-semibold text-gray-500 ring-1 ring-gray-200"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!isValid || saving}
              onClick={handleConfirm}
              className={`flex-1 rounded-full py-3.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50 ${
                operation === 'INCREMENT' ? 'bg-primary' : 'bg-red-500'
              }`}
            >
              {saving ? 'Updating...' : `Confirm ${operation === 'INCREMENT' ? 'Add' : 'Remove'}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
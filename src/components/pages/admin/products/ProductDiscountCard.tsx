import { useState } from 'react';
import { Tag, X, Pencil, Loader2, Check } from 'lucide-react';
import type { AdminProduct } from '../../../../app/lib/adminProductApi';
import { adminDiscountApi } from '../../../../app/lib/adminDiscountApi';
import { getEffectivePrice } from '../../../../app/lib/productPricing';
import { formatNaira } from '../../../data/products';

/*
|--------------------------------------------------------------------------
| ProductDiscountCard — add, edit and remove a product discount
|--------------------------------------------------------------------------
| ⚠️ WHAT WAS WRONG BEFORE
|
| The discount block in EditProduct.tsx could only ADD a fixed-naira discount,
| and REMOVE whatever was there. Two gaps:
|
|   • No edit. Changing ₦200 to ₦300 meant remove-then-re-add, and the remove
|     and the add were separate trips — if the add failed you were left with
|     no discount at all and no way to tell.
|   • No percentage discounts, even though the account's own discount objects
|     carry `discountType: "percentage_discount"` and the payload field exists.
|
| This component covers all three operations and shows the result the way the
| customers see it — live price first, original struck through beside it.
|
| ⚠️ THERE IS NO UPDATE ENDPOINT
|
| The API has exactly two discount routes, and neither is a PATCH:
|
|   POST   /api/v1/admin/discounts/products/:productId
|   DELETE /api/v1/admin/discounts/products/:productId
|
| So "edit" is implemented as DELETE then POST. That sequence is deliberate:
| it works whether or not POST upserts, whereas a bare POST might silently
| fail on a product that already has a discount.
|
| ⚠️ THE RISK IN THAT SEQUENCE, AND HOW IT IS HANDLED
|
| If the DELETE succeeds and the POST then fails, the product is left with NO
| discount. That is a real possibility and it is surfaced rather than hidden:
| the error message says the old discount is gone and asks for a retry, and
| the form stays open with the values still in it. A single transaction would
| be better; the API does not offer one.
|
| ⚠️ `expiryDateInMilliseconds` IS AMBIGUOUS
|
| The name reads like an epoch timestamp but the only example in the docs is
| `1`, which is not a plausible date — it might be a duration in ms. Rather
| than guess, permanent discounts are the default (that is what the previous
| code always sent, `isPermanent: true, expiryDateInMilliseconds: 0`) and the
| expiry option is opt-in. Flagged to the backend dev.
*/

type DiscountType = 'fixed_discount' | 'percentage_discount';

interface ProductDiscountCardProps {
  product: AdminProduct;
  /** Called after a successful change so the parent can refetch the product. */
  onChanged?: () => void;
}

export default function ProductDiscountCard({
  product,
  onChanged,
}: ProductDiscountCardProps) {
  const [mode, setMode] = useState<'view' | 'add' | 'edit'>('view');
  const [value, setValue] = useState('');
  const [type, setType] = useState<DiscountType>('fixed_discount');
  const [neverExpires, setNeverExpires] = useState(true);
  const [expiryDate, setExpiryDate] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');

  const discount = product.discount;
  const hasDiscount = Boolean(discount);
  const pricing = getEffectivePrice(product);

  const reset = () => {
    setValue('');
    setType('fixed_discount');
    setNeverExpires(true);
    setExpiryDate('');
    setError('');
  };

  const startAdd = () => {
    reset();
    setDone('');
    setMode('add');
  };

  const startEdit = () => {
    if (!discount) return;
    setValue(String(discount.discountValue ?? ''));
    setType(
      (discount.discountType as DiscountType) === 'percentage_discount'
        ? 'percentage_discount'
        : 'fixed_discount'
    );
    setNeverExpires(discount.isPermanent !== false);
    setError('');
    setDone('');
    setMode('edit');
  };

  const cancel = () => {
    reset();
    setMode('view');
  };

  const expiryPayload = (): number | null => {
    if (neverExpires) return 0;
    if (!expiryDate) return null;
    const ms = new Date(expiryDate).getTime();
    return Number.isFinite(ms) ? ms : null;
  };

  const save = async () => {
    const numeric = Number(value);
    if (!value.trim() || !Number.isFinite(numeric) || numeric <= 0) {
      setError('Enter a discount amount greater than zero.');
      return;
    }

    const expiry = expiryPayload();
    if (expiry === null) {
      setError('Pick an expiry date, or switch to "Never expires".');
      return;
    }

    setBusy(true);
    setError('');
    setDone('');

    try {
      /*
        Delete first when editing. The API has no update route, so replacing a
        discount is the only way to change it.
      */
      if (mode === 'edit') {
        await adminDiscountApi.deleteDiscount(product.id);
      }

      await adminDiscountApi.createDiscount(product.id, {
        discountValue: numeric,
        discountType: type,
        isPermanent: neverExpires,
        expiryDateInMilliseconds: expiry,
      });

      setDone(
        mode === 'edit'
          ? 'Discount updated.'
          : 'Discount applied.'
      );
      setMode('view');
      reset();
      onChanged?.();
    } catch (err: any) {
      const replaced =
        mode === 'edit'
          ? ' The previous discount was removed, so this product now has none — please try again.'
          : '';
      setError(
        (err.response?.data?.message ?? 'Could not save the discount.') + replaced
      );
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    setError('');
    setDone('');
    try {
      await adminDiscountApi.deleteDiscount(product.id);
      setDone('Discount removed.');
      setMode('view');
      reset();
      onChanged?.();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Could not remove the discount.');
    } finally {
      setBusy(false);
    }
  };

  const typeLabel = discount?.discountType === 'percentage_discount' ? '%' : '₦';

  return (
    <div className="rounded-2xl border border-gray-100 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag size={16} className="text-primary" />
          <p className="text-sm font-semibold text-gray-700">Discount</p>
        </div>

        {mode === 'view' && (
          <div className="flex items-center gap-2">
            {hasDiscount && (
              <button
                type="button"
                disabled={busy}
                onClick={startEdit}
                className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary disabled:opacity-50"
              >
                <Pencil size={12} />
                Edit
              </button>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={hasDiscount ? remove : startAdd}
              className={
                'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ' +
                (hasDiscount
                  ? 'bg-red-50 text-red-500'
                  : 'bg-primary text-white')
              }
            >
              {busy ? (
                <Loader2 size={12} className="animate-spin" />
              ) : hasDiscount ? (
                <X size={12} />
              ) : null}
              {hasDiscount ? 'Remove' : 'Add discount'}
            </button>
          </div>
        )}
      </div>

      {done && !error && (
        <p className="mb-3 flex items-center gap-1.5 rounded-xl bg-green-50 px-3 py-2 text-xs font-semibold text-green-700">
          <Check size={13} />
          {done}
        </p>
      )}

      {error && (
        <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
          {error}
        </p>
      )}

      {/* ─── VIEW ─── */}
      {mode === 'view' && (
        <>
          {/*
            The customer-facing treatment: live price first, the pre-discount
            price struck through beside it, then how much comes off. Same thing
            the shop grid and the WhatsApp catalogue show, so an admin can see
            at a glance what the customer sees.
          */}
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <p className="text-lg font-extrabold text-primary">
              {formatNaira(pricing.price)}
            </p>
            {pricing.isDiscounted && (
              <>
                <p className="text-sm font-medium text-gray-400 line-through">
                  {formatNaira(pricing.originalPrice)}
                </p>
                <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-bold text-accent">
                  {pricing.percentOff}% off
                </span>
              </>
            )}
          </div>

          {hasDiscount ? (
            <div className="mt-2 space-y-0.5">
              <p className="text-xs font-semibold text-gray-500">
                {typeLabel}
                {discount?.discountValue} off
                {discount?.discountType === 'percentage_discount' ? '' : ' (fixed)'}
              </p>
              <p className="text-xs text-gray-400">
                {discount?.isPermanent === false
                  ? 'Expires at the date set on this discount.'
                  : 'Never expires.'}
              </p>
              {discount?.isExpired && (
                <p className="text-xs font-semibold text-red-500">
                  This discount has expired — customers are seeing the full
                  price. Remove it or set a new one.
                </p>
              )}
            </div>
          ) : (
            <p className="mt-1 text-xs text-gray-400">
              No discount. Customers pay the list price.
            </p>
          )}

          {!hasDiscount && !done && (
            <p className="mt-2 rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-400">
              List price is {formatNaira(pricing.originalPrice)}.
            </p>
          )}
        </>
      )}

      {/* ─── ADD / EDIT ─── */}
      {(mode === 'add' || mode === 'edit') && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex flex-1 gap-2">
              <div className="flex overflow-hidden rounded-xl border border-gray-200">
                <button
                  type="button"
                  onClick={() => setType('fixed_discount')}
                  aria-pressed={type === 'fixed_discount'}
                  className={
                    'px-3 py-2.5 text-sm font-semibold transition-colors ' +
                    (type === 'fixed_discount'
                      ? 'bg-primary text-white'
                      : 'bg-white text-gray-500')
                  }
                >
                  ₦
                </button>
                <button
                  type="button"
                  onClick={() => setType('percentage_discount')}
                  aria-pressed={type === 'percentage_discount'}
                  className={
                    'px-3 py-2.5 text-sm font-semibold transition-colors ' +
                    (type === 'percentage_discount'
                      ? 'bg-primary text-white'
                      : 'bg-white text-gray-500')
                  }
                >
                  %
                </button>
              </div>

              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={
                  type === 'percentage_discount'
                    ? 'Discount percent, e.g. 10'
                    : 'Discount amount in ₦, e.g. 200'
                }
                inputMode="decimal"
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-primary"
              />
            </div>
          </div>

          {/* Live preview of the resulting price */}
          {(() => {
            const numeric = Number(value);
            if (!value.trim() || !Number.isFinite(numeric) || numeric <= 0) return null;
            const base = pricing.originalPrice;
            const result =
              type === 'percentage_discount'
                ? base - (base * numeric) / 100
                : base - numeric;
            if (result <= 0) {
              return (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
                  That is more than the list price — the product would end up at
                  ₦0 or less.
                </p>
              );
            }
            return (
              <p className="rounded-xl bg-[#F3F7EE] px-3 py-2 text-xs text-gray-600">
                Customer pays <span className="font-bold text-primary">{formatNaira(result)}</span>{' '}
                instead of{' '}
                <span className="line-through">{formatNaira(base)}</span>
              </p>
            );
          })()}

          <label className="flex items-center gap-2 text-xs font-semibold text-gray-600">
            <input
              type="checkbox"
              checked={neverExpires}
              onChange={(e) => setNeverExpires(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 accent-primary"
            />
            Never expires
          </label>

          {!neverExpires && (
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-primary"
            />
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={cancel}
              disabled={busy}
              className="flex-1 rounded-xl bg-white py-2.5 text-sm font-semibold text-gray-500 ring-1 ring-gray-200 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={busy || !value.trim()}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {busy && <Loader2 size={14} className="animate-spin" />}
              {busy ? 'Saving...' : mode === 'edit' ? 'Save discount' : 'Apply'}
            </button>
          </div>

          {mode === 'edit' && (
            <p className="text-[11px] leading-relaxed text-gray-400">
              The API has no update route, so saving replaces the discount:
              the current one is removed and the new one is created.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MoreVertical, Check, EyeOff, Clock, ChevronDown, Tag, X } from 'lucide-react';
import { adminProductApi, type AdminProduct, type AdminProductCategory } from '../../../../app/lib/adminProductApi';
import { adminDiscountApi } from '../../../../app/lib/adminDiscountApi';
import AdminImageUpload from '../../../admin/AdminImageUpload';

type Visibility = 'Published' | 'Hidden' | 'Scheduled';

export default function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [original, setOriginal] = useState<AdminProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [discountValue, setDiscountValue] = useState('');
  const [discountBusy, setDiscountBusy] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [scale, setScale] = useState('');
  const [stock, setStock] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('Published');
  const [imageUrl, setImageUrl] = useState('');
  const [categories, setCategories] = useState<AdminProductCategory[]>([]);
  const [categoryId, setCategoryId] = useState('');

  useEffect(() => {
    if (!id) return;
    adminProductApi
      .getProductById(id)
      .then((res) => {
        const p = res.data.data.product;
        setOriginal(p);
        setName(p.name);
        setDescription(p.description);
        setPrice(String(p.price));
        setScale(p.scale);
        setStock(String(p.quantity));
        setVisibility(p.isHidden ? 'Hidden' : 'Published');
        setImageUrl(p.imageUrls?.[0] ?? '');
        setCategoryId(p.category?.id ?? '');
      })
      .catch((err) => setError(err.response?.data?.message ?? 'Failed to load product.'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    adminProductApi
      .getCategories()
      .then((res) => setCategories(res.data.data.productCategories))
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!id || !original) return;
    setSaving(true);
    setError('');

    try {
      // 1. Update core product details
      await adminProductApi.updateProduct(id, {
        name,
        description,
        scale,
        imageUrls: imageUrl ? [imageUrl] : undefined,
        ...(categoryId && categoryId !== original.category?.id ? { categoryId } : {}),
      });

      // 2. Update price if it changed
      const currentPrice = Number(original.price);
      const newPrice = Number(price);
      if (newPrice !== currentPrice) {
        await adminProductApi.updateProductPrice(id, { currentPrice, newPrice });
      }

      // 3. Update stock if it changed
      const newStock = Number(stock);
      const stockDelta = newStock - original.quantity;
      if (stockDelta !== 0) {
        await adminProductApi.updateStock(id, {
          quantity: Math.abs(stockDelta),
          operation: stockDelta > 0 ? 'increment' : 'decrement',
        });
      }

      // 4. Update visibility if it changed
      const wasHidden = original.isHidden;
      const isNowHidden = visibility === 'Hidden';
      if (wasHidden !== isNowHidden) {
        if (isNowHidden) {
          await adminProductApi.hideProduct(id);
        } else {
          await adminProductApi.unhideProduct(id);
        }
      }

      navigate(`/admin/products/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddDiscount = async () => {
    if (!id || !discountValue) return;
    setDiscountBusy(true);
    setError('');
    try {
      await adminDiscountApi.createDiscount(id, {
        discountValue: Number(discountValue),
        discountType: 'fixed_discount',
        isPermanent: true,
        expiryDateInMilliseconds: 0,
      });
      setDiscountValue('');
      const res = await adminProductApi.getProductById(id);
      setOriginal(res.data.data.product);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to add discount.');
    } finally {
      setDiscountBusy(false);
    }
  };

  const handleRemoveDiscount = async () => {
    if (!id) return;
    setDiscountBusy(true);
    setError('');
    try {
      await adminDiscountApi.deleteDiscount(id);
      const res = await adminProductApi.getProductById(id);
      setOriginal(res.data.data.product);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to remove discount.');
    } finally {
      setDiscountBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-gray-400">Loading product...</p>
      </div>
    );
  }

  if (!original) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white px-5">
        <p className="text-sm text-red-500">{error || 'Product not found.'}</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white pb-28">
      <header className="flex items-center justify-between px-5 pt-6">
        <button type="button" onClick={() => navigate(-1)} className="text-primary-dark">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">Edit Product</h1>
        <button type="button" className="text-primary-dark">
          <MoreVertical size={22} strokeWidth={2} />
        </button>
      </header>

      <main className="flex-1 space-y-5 px-5 pt-5">
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">Product Images</p>
          </div>
          <AdminImageUpload value={imageUrl} onChange={setImageUrl} compact />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">Product Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-primary"
          />
        </div>

        <div className="rounded-2xl bg-[#F3F7EE] p-4">
          <p className="mb-3 text-sm font-semibold text-primary-dark">Inventory &amp; Pricing</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Price (₦)</label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                inputMode="decimal"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-800 outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Stock Level</label>
              <input
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                inputMode="numeric"
                className="w-full rounded-xl border border-primary bg-white px-3 py-2.5 text-sm font-semibold text-primary outline-none"
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="mb-1 block text-xs text-gray-500">Unit / Scale</label>
            <input
              value={scale}
              onChange={(e) => setScale(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-800 outline-none"
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-gray-700">Visibility Status</p>
          <div className="flex gap-2">
            {(
              [
                { key: 'Published', icon: Check },
                { key: 'Hidden', icon: EyeOff },
                { key: 'Scheduled', icon: Clock },
              ] as { key: Visibility; icon: typeof Check }[]
            ).map(({ key, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setVisibility(key)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold ${
                  visibility === key
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-200 text-gray-500'
                }`}
              >
                <Icon size={14} />
                {key}
              </button>
            ))}
          </div>
          {visibility === 'Scheduled' && (
            <p className="mt-2 text-xs text-gray-400">
              Scheduled visibility isn&apos;t wired to the backend yet — this will be treated as
              Published for now.
            </p>
          )}
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-gray-700">Category</p>
          <div className="relative">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full appearance-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-primary"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Sends categoryId on save — remove this note once the backend confirms it accepts
            category changes on update.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Tag size={16} className="text-primary" />
            <p className="text-sm font-semibold text-gray-700">Discount</p>
          </div>
          {original.discount ? (
            <div className="flex items-center justify-between rounded-xl bg-[#F3F7EE] px-4 py-3">
              <div>
                <p className="text-sm font-bold text-primary">
                  {original.discount.discountType === 'fixed_discount' ? '₦' : ''}
                  {original.discount.discountValue}
                  {original.discount.discountType === 'percentage_discount' ? '%' : ''} off
                </p>
                <p className="text-xs text-gray-400">
                  New price: ₦{original.discount.discountPrice.toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                disabled={discountBusy}
                onClick={handleRemoveDiscount}
                aria-label="Remove discount"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-500 disabled:opacity-50"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder="Discount amount (₦)"
                inputMode="decimal"
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-primary"
              />
              <button
                type="button"
                disabled={discountBusy || !discountValue}
                onClick={handleAddDiscount}
                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-20 flex gap-3 border-t border-gray-100 bg-white p-4">
        <button
          type="button"
          onClick={() => navigate(`/admin/products/${id}`)}
          className="flex-1 rounded-full bg-white py-3.5 text-sm font-semibold text-gray-500 ring-1 ring-gray-200"
        >
          Discard Changes
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="flex-1 rounded-full bg-primary py-3.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, ChevronDown, Send } from 'lucide-react';
import { adminProductApi, type AdminProductCategory } from '../../../../app/lib/adminProductApi';
import AdminImageUpload from '../../../admin/AdminImageUpload';

export default function AddProduct() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<AdminProductCategory[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [unit, setUnit] = useState('');
  const [stockQty, setStockQty] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [featured, setFeatured] = useState(false);
  const [visible, setVisible] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    adminProductApi
      .getCategories()
      .then((res) => setCategories(res.data.data.productCategories))
      .catch(() => setError('Failed to load categories.'));
  }, []);

  const handlePublish = async () => {
    setError('');

    if (!name || !basePrice || !stockQty || !categoryId) {
      setError('Please fill in product name, category, price and stock quantity.');
      return;
    }

    setSubmitting(true);
    try {
      await adminProductApi.createProduct({
        name,
        description,
        price: Number(basePrice),
        quantity: Number(stockQty),
        scale: unit,
        categoryId,
        imageUrls: imageUrl ? [imageUrl] : [],
        featuredProduct: featured,
        visibleToCustomers: visible,
        ...(discount ? { discount: Number(discount) } : {}),
      });
      navigate('/admin/products');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to create product.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white pb-28">
      <header className="flex items-center justify-between px-5 pt-6">
        <button type="button" onClick={() => navigate(-1)} className="text-primary-dark">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">Add Product</h1>
        <button type="button" className="text-primary-dark">
          <HelpCircle size={22} strokeWidth={2} />
        </button>
      </header>

      <main className="flex-1 space-y-5 px-5 pt-5">
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <div>
          <p className="mb-2 text-sm font-semibold text-gray-700">Product Media</p>
          <AdminImageUpload
            value={imageUrl}
            onChange={setImageUrl}
            heightClassName="h-40"
            helperText="Tap to upload high-quality images of your food product"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">Product Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Organic Cavendish Bananas"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-primary"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Describe nutritional value, origin, and flavor profile..."
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-primary"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">Category</label>
          <div className="relative">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full appearance-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-primary"
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="rounded-2xl bg-[#F3F7EE] p-4">
          <p className="mb-3 text-sm font-semibold text-primary-dark">Pricing &amp; Inventory</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Base Price (₦)</label>
              <input
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                placeholder="0.00"
                inputMode="decimal"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Discount (₦)</label>
              <input
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="0.00"
                inputMode="decimal"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Unit</label>
              <input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. kg, satchet, pack"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Stock Qty</label>
              <input
                value={stockQty}
                onChange={(e) => setStockQty(e.target.value)}
                placeholder="0"
                inputMode="numeric"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-800">Featured Product</p>
            <p className="text-xs text-gray-400">Promote on the home screen carousel</p>
          </div>
          <button
            type="button"
            onClick={() => setFeatured((v) => !v)}
            className={`h-6 w-11 rounded-full transition-colors ${featured ? 'bg-primary' : 'bg-gray-200'}`}
          >
            <span
              className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
                featured ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-800">Visible to Customers</p>
            <p className="text-xs text-gray-400">Uncheck to hide without deleting</p>
          </div>
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className={`h-6 w-11 rounded-full transition-colors ${visible ? 'bg-primary' : 'bg-gray-200'}`}
          >
            <span
              className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
                visible ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-20 flex gap-3 border-t border-gray-100 bg-white p-4">
        <button
          type="button"
          disabled={submitting}
          className="flex-1 rounded-full bg-gray-100 py-3.5 text-sm font-semibold text-gray-500 disabled:opacity-60"
        >
          Save Draft
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={handlePublish}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {submitting ? 'Publishing...' : 'Publish Product'}
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}

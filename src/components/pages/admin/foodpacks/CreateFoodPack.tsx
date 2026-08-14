import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreVertical, Plus, Minus, Search, Star, Eye, Rocket, X } from 'lucide-react';
import {
  adminFoodPackApi,
  type FoodPackCategory,
} from '../../../../app/lib/adminFoodPackApi';
import { adminProductApi, type AdminProduct } from '../../../../app/lib/adminProductApi';
import AdminImageUpload from '../../../admin/AdminImageUpload';

type SelectedProduct = {
  productId: string;
  name: string;
  price: number;
  scale: string;
  qty: number;
  img: string;
};

export default function CreateFoodPack() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<FoodPackCategory[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState<AdminProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);

  const [sellingPrice, setSellingPrice] = useState(0);
  const [featured, setFeatured] = useState(true);
  const [visible, setVisible] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    adminFoodPackApi
      .getCategories()
      .then((res) => setCategories(res.data.data.categories))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!productSearch) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const timeout = setTimeout(() => {
      adminProductApi
        .getProducts({ search: productSearch, limit: 6 })
        .then((res) => setSearchResults(res.data.data.products))
        .catch(() => setSearchResults([]))
        .finally(() => setSearching(false));
    }, 350);
    return () => clearTimeout(timeout);
  }, [productSearch]);

  const bundleValue = selectedProducts.reduce((sum, p) => sum + p.price * p.qty, 0);
  const savings = bundleValue - sellingPrice;
  const savingsPct = bundleValue ? Math.round((savings / bundleValue) * 100) : 0;

  const addProduct = (product: AdminProduct) => {
    if (selectedProducts.some((p) => p.productId === product.id)) return;
    setSelectedProducts((prev) => [
      ...prev,
      {
        productId: product.id,
        name: product.name,
        price: Number(product.price),
        scale: product.scale,
        qty: 1,
        img: product.imageUrls?.[0] ?? '',
      },
    ]);
    setProductSearch('');
    setSearchResults([]);
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.productId !== productId));
  };

  const updateQty = (productId: string, delta: number) => {
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.productId === productId ? { ...p, qty: Math.max(1, p.qty + delta) } : p
      )
    );
  };

  const handlePublish = async () => {
    setError('');

    if (!name || !description || selectedProducts.length === 0 || !sellingPrice) {
      setError('Please fill in pack name, description, at least one product, and selling price.');
      return;
    }

    setSubmitting(true);
    try {
      await adminFoodPackApi.createFoodPack({
        name,
        description,
        price: sellingPrice,
        categoryId: categoryId || undefined,
        items: selectedProducts.map((p) => ({
          productId: p.productId,
          quantity: p.qty,
          quantityUnit: p.scale,
        })),
        imageUrls: imageUrl ? [imageUrl] : [],
        featuredPack: featured,
        visibleToCustomers: visible,
      });
      navigate('/admin/food-packs');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to create food pack.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white pb-10">
      <header className="flex items-center justify-between px-5 pt-6">
        <button type="button" onClick={() => navigate(-1)} className="text-primary-dark">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">Create Pack</h1>
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
          <p className="mb-2 text-sm font-semibold text-gray-700">Banner Image</p>
          <AdminImageUpload
            value={imageUrl}
            onChange={setImageUrl}
            heightClassName="h-36"
            helperText="Upload Banner Image"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">Pack Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Family Essential Bundle"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-primary"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Describe what makes this food pack special..."
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-primary"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full appearance-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-primary"
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">Product Selection</p>
          </div>
          <div className="relative mb-3">
            <div className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2.5">
              <Search size={16} className="text-gray-400" />
              <input
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search available inventory..."
                className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
              />
            </div>
            {productSearch && (
              <div className="absolute z-10 mt-1 w-full rounded-xl border border-gray-100 bg-white shadow-lg">
                {searching && <p className="p-3 text-sm text-gray-400">Searching...</p>}
                {!searching && searchResults.length === 0 && (
                  <p className="p-3 text-sm text-gray-400">No products found.</p>
                )}
                {!searching &&
                  searchResults.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => addProduct(product)}
                      className="flex w-full items-center gap-3 p-3 text-left hover:bg-gray-50"
                    >
                      {product.imageUrls?.[0] && (
                        <img
                          src={product.imageUrls[0]}
                          alt={product.name}
                          className="h-9 w-9 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{product.name}</p>
                        <p className="text-xs text-gray-400">₦{Number(product.price).toLocaleString()}</p>
                      </div>
                      <Plus size={16} className="text-primary" />
                    </button>
                  ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            {selectedProducts.map((p) => (
              <div key={p.productId} className="flex items-center gap-3 rounded-xl border border-gray-100 p-2.5">
                {p.img && <img src={p.img} alt={p.name} className="h-11 w-11 rounded-lg object-cover" />}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{p.name}</p>
                  <p className="text-xs text-gray-400">
                    ₦{p.price.toLocaleString()} / {p.scale}
                  </p>
                </div>
                <div className="flex items-center gap-3 rounded-full bg-[#F3F7EE] px-2 py-1">
                  <button type="button" onClick={() => updateQty(p.productId, -1)} className="text-primary">
                    <Minus size={14} />
                  </button>
                  <span className="w-4 text-center text-sm font-bold text-gray-800">{p.qty}</span>
                  <button type="button" onClick={() => updateQty(p.productId, 1)} className="text-primary">
                    <Plus size={14} />
                  </button>
                </div>
                <button type="button" onClick={() => removeProduct(p.productId)} className="text-red-400">
                  <X size={16} />
                </button>
              </div>
            ))}
            {selectedProducts.length === 0 && (
              <p className="text-sm text-gray-400">Search and add products to build this pack.</p>
            )}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-gray-700">Pricing Engine</p>
          <div className="space-y-3 rounded-2xl bg-primary p-4 text-white">
            <div className="flex items-center justify-between text-sm text-white/80">
              <span>Bundle Value</span>
              <span className="font-semibold text-white">₦{bundleValue.toLocaleString()}</span>
            </div>
            <div>
              <p className="mb-1 text-sm font-semibold text-white">Selling Price</p>
              <div className="flex items-center rounded-xl bg-white/10 px-4 py-2.5">
                <span className="mr-1 text-white/80">₦</span>
                <input
                  type="number"
                  value={sellingPrice || ''}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                  className="w-full bg-transparent text-white outline-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/80">Customer Savings</span>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">
                ₦{savings.toLocaleString()} ({savingsPct}%)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-[#F3F7EE] p-4">
          <div className="flex items-center gap-2">
            <Star size={16} className="text-primary" />
            <div>
              <p className="text-sm font-semibold text-gray-800">Featured Pack</p>
              <p className="text-xs text-gray-400">Pin to top of home screen</p>
            </div>
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

        <div className="flex items-center justify-between rounded-2xl bg-[#F3F7EE] p-4">
          <div className="flex items-center gap-2">
            <Eye size={16} className="text-primary" />
            <div>
              <p className="text-sm font-semibold text-gray-800">Visibility</p>
              <p className="text-xs text-gray-400">Visible to all customers</p>
            </div>
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

        <button
          type="button"
          disabled={submitting}
          onClick={handlePublish}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-semibold text-white disabled:opacity-60"
        >
          <Rocket size={16} />
          {submitting ? 'Publishing...' : 'Publish Food Pack'}
        </button>
      </main>
    </div>
  );
}